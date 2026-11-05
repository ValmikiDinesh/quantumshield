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
  plan: z.enum(['developer', 'team', 'enterprise']).optional(),
  amount: z.number().min(100).optional(),
  currency: z.string().optional(),
  receipt: z.string().optional(),
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpay_order_id: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpay_signature: z.string().optional(),
  razorpaySignature: z.string().optional(),
  plan: z.enum(['developer', 'team', 'enterprise']).optional(),
});

export class BillingController {
  /**
   * Initializes a Razorpay order for subscription upgrade or custom amount.
   * Endpoint: POST /api/create-order or POST /api/billing/razorpay/order
   */
  public static async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const userEmail = req.user?.email || 'customer@quantumshieldscan.com';

      if (orgId) {
        const org = await Organization.findById(orgId);
        if (!org) {
          res.status(404).json({ success: false, error: 'Organization not found' });
          return;
        }
      }

      let amountPaise = 0;
      let amountINR = 0;
      let selectedPlan: PlanTier = 'developer';

      if (req.body.amount) {
        amountPaise = Number(req.body.amount);
        if (isNaN(amountPaise) || amountPaise < 100) {
          res.status(400).json({ success: false, error: 'Amount must be at least 100 paise' });
          return;
        }
        amountINR = Math.round(amountPaise / 100);
      } else if (req.body.plan) {
        selectedPlan = req.body.plan;
        const planConfig = PLAN_PRICES_INR[selectedPlan as Exclude<PlanTier, 'free'>];
        if (!planConfig) {
          res.status(400).json({ success: false, error: 'Invalid plan selected' });
          return;
        }
        amountPaise = planConfig.paise;
        amountINR = planConfig.rupees;
      } else {
        res.status(400).json({ success: false, error: 'Either plan or amount is required' });
        return;
      }

      const receipt = req.body.receipt || `rcpt_${Date.now()}_${orgId ? orgId.toString().slice(-4) : 'std'}`;

      const rzpOrder = await RazorpayService.createOrder({
        amountPaise,
        currency: req.body.currency || 'INR',
        receipt,
        notes: {
          organizationId: orgId ? orgId.toString() : 'guest',
          plan: selectedPlan,
          entity: 'Valmiki Softwares - QuantumShield',
        },
      });

      // Save initial payment record in database
      await Payment.create({
        organizationId: orgId || undefined,
        userId: userId || undefined,
        razorpayOrderId: rzpOrder.id,
        plan: selectedPlan,
        amount: amountPaise,
        amountINR,
        currency: req.body.currency || 'INR',
        status: 'created',
        receipt,
        customerEmail: userEmail,
        customerPhone: '+917901019249',
      });

      res.status(200).json({
        success: true,
        order_id: rzpOrder.id,
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key_id: env.RAZORPAY_KEY_ID,
        data: {
          orderId: rzpOrder.id,
          amountPaise,
          amountINR,
          currency: rzpOrder.currency,
          plan: selectedPlan,
          keyId: env.RAZORPAY_KEY_ID,
          merchantName: 'Valmiki Softwares',
          description: `QuantumShield ${selectedPlan.toUpperCase()} Plan Subscription`,
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
   * Verifies HMAC-SHA256 payment signature and provisions the upgraded subscription.
   * Endpoint: POST /api/verify-payment or POST /api/billing/razorpay/verify
   */
  public static async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orderId = req.body.razorpay_order_id || req.body.razorpayOrderId;
      const paymentId = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
      const signature = req.body.razorpay_signature || req.body.razorpaySignature;
      const plan = req.body.plan;
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;

      if (!orderId || !paymentId || !signature) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required',
        });
        return;
      }

      const isValid = RazorpayService.verifyPaymentSignature({
        orderId,
        paymentId,
        signature,
      });

      if (!isValid) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { status: 'failed', razorpayPaymentId: paymentId, razorpaySignature: signature }
        );
        res.status(400).json({
          success: false,
          error: 'Cryptographic signature verification failed. Payment cannot be verified.',
        });
        return;
      }

      // Mark payment as paid
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: orderId },
        {
          status: 'paid',
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
        { new: true }
      );

      // Upgrade organization limits if plan is specified and orgId is available
      if (orgId && plan && PLAN_LIMITS[plan as PlanTier]) {
        const limits = PLAN_LIMITS[plan as PlanTier];
        const org = await Organization.findById(orgId);
        if (org) {
          org.plan = plan as PlanTier;
          org.maxProjects = limits.maxProjects;
          org.maxScansPerMonth = limits.maxScansPerMonth;
          await org.save();
        }
      }

      // Audit log if orgId is available
      if (orgId && userId) {
        await AuditLog.create({
          organizationId: orgId,
          userId,
          action: 'PAYMENT_COMPLETED_PLAN_UPGRADED',
          targetType: 'Organization',
          targetId: orgId.toString(),
          metadata: {
            orderId,
            paymentId,
            plan: plan || payment?.plan || 'developer',
            amount: payment?.amount,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          plan,
          paymentId,
          orderId,
          amountINR: payment?.amountINR || 0,
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
