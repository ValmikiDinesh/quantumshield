import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, PlanTier } from '../types';
import { Organization, PLAN_LIMITS } from '../models/Organization';
import { Payment } from '../models/Payment';
import { AuditLog } from '../models/AuditLog';
import { RazorpayService } from '../services/razorpayService';
import { env } from '../config/env';

export const PLAN_PRICES_INR: Record<Exclude<PlanTier, 'free'>, { rupees: number; paise: number }> = {
  developer: { rupees: 3999, paise: 399900 },
  team: { rupees: 15999, paise: 1599900 },
  enterprise: { rupees: 39999, paise: 3999900 },
};

export const createRazorpayOrderSchema = z.object({
  plan: z.enum(['developer', 'team', 'enterprise']),
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  plan: z.enum(['developer', 'team', 'enterprise']),
});

export class BillingController {
  /**
   * Initializes a Razorpay order for subscription upgrade.
   */
  public static async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { plan } = req.body as { plan: Exclude<PlanTier, 'free'> };
      const orgId = req.user!.organizationId;
      const userId = req.user!.userId;
      const userEmail = req.user!.email;

      const org = await Organization.findById(orgId);
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found' });
        return;
      }

      const planConfig = PLAN_PRICES_INR[plan];
      if (!planConfig) {
        res.status(400).json({ success: false, error: 'Invalid plan selected' });
        return;
      }

      const receipt = `rcpt_${Date.now()}_${orgId.toString().slice(-4)}`;

      const rzpOrder = await RazorpayService.createOrder({
        amountPaise: planConfig.paise,
        currency: 'INR',
        receipt,
        notes: {
          organizationId: orgId.toString(),
          plan,
          entity: 'Valmiki Softwares - QuantumShield',
        },
      });

      // Save initial payment record
      await Payment.create({
        organizationId: orgId,
        userId,
        razorpayOrderId: rzpOrder.id,
        plan,
        amount: planConfig.paise,
        amountINR: planConfig.rupees,
        currency: 'INR',
        status: 'created',
        receipt,
        customerEmail: userEmail,
        customerPhone: '+917901019249',
      });

      res.status(200).json({
        success: true,
        data: {
          orderId: rzpOrder.id,
          amountPaise: planConfig.paise,
          amountINR: planConfig.rupees,
          currency: 'INR',
          plan,
          keyId: env.RAZORPAY_KEY_ID,
          merchantName: 'Valmiki Softwares',
          description: `QuantumShield ${plan.toUpperCase()} Plan Subscription`,
          customer: {
            name: userEmail.split('@')[0],
            email: userEmail,
            contact: '+917901019249',
          },
        },
      });
    } catch (err: any) {
      console.error('[BillingController] createOrder error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to create payment order' });
    }
  }

  /**
   * Verifies payment signature and provisions the upgraded subscription.
   */
  public static async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = req.body;
      const orgId = req.user!.organizationId;

      const payment = await Payment.findOne({ razorpayOrderId, organizationId: orgId });
      if (!payment) {
        res.status(404).json({ success: false, error: 'Payment order record not found' });
        return;
      }

      const isValid = RazorpayService.verifyPaymentSignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });

      if (!isValid) {
        payment.status = 'failed';
        await payment.save();
        res.status(400).json({ success: false, error: 'Cryptographic signature verification failed. Payment cannot be verified.' });
        return;
      }

      // Mark payment as paid
      payment.status = 'paid';
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      await payment.save();

      // Upgrade organization limits
      const limits = PLAN_LIMITS[plan as PlanTier];
      const org = await Organization.findById(orgId);
      if (org) {
        org.plan = plan as PlanTier;
        org.maxProjects = limits.maxProjects;
        org.maxScansPerMonth = limits.maxScansPerMonth;
        await org.save();
      }

      // Audit log
      await AuditLog.create({
        organizationId: orgId,
        userId: req.user!.userId,
        action: 'PAYMENT_COMPLETED_PLAN_UPGRADED',
        targetType: 'Organization',
        targetId: orgId.toString(),
        metadata: {
          plan,
          amountINR: payment.amountINR,
          razorpayOrderId,
          razorpayPaymentId,
        },
      });

      res.status(200).json({
        success: true,
        message: `Payment successful! Upgraded to ${plan.toUpperCase()} tier.`,
        data: {
          plan,
          paymentId: razorpayPaymentId,
          orderId: razorpayOrderId,
          amountINR: payment.amountINR,
          paidAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[BillingController] verifyPayment error:', err);
      res.status(500).json({ success: false, error: err.message || 'Payment verification failed' });
    }
  }

  /**
   * Retrieves organization's billing and payment history.
   */
  public static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const history = await Payment.find({ organizationId: orgId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      res.status(200).json({
        success: true,
        data: history.map((item) => ({
          id: item._id.toString(),
          orderId: item.razorpayOrderId,
          paymentId: item.razorpayPaymentId,
          plan: item.plan,
          amountINR: item.amountINR,
          currency: item.currency,
          status: item.status,
          receipt: item.receipt,
          createdAt: item.createdAt.toISOString(),
        })),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

