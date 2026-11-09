import { Response } from 'express';
import { AuthenticatedAdminRequest } from '../../types';
import { Payment } from '../../models/Payment';
import { Organization, PLAN_LIMITS } from '../../models/Organization';
import { AdminAuthService } from '../../services/adminAuthService';

export class AdminPaymentController {
  public static async listPayments(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { status, plan, search } = req.query;

      const filter: any = {};
      if (status && typeof status === 'string') filter.status = status;
      if (plan && typeof plan === 'string') filter.plan = plan;
      if (search && typeof search === 'string') {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { customerEmail: regex },
          { razorpayOrderId: regex },
          { razorpayPaymentId: regex },
          { receipt: regex },
        ];
      }

      const payments = await Payment.find(filter)
        .populate('organizationId', 'name slug')
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({ success: true, payments });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async manualCredit(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { organizationId, plan, amountINR, referenceNotes, customerEmail } = req.body;

      if (!organizationId || !plan || !amountINR) {
        res.status(400).json({
          success: false,
          error: 'organizationId, plan, and amountINR are required.',
        });
        return;
      }

      const org = await Organization.findById(organizationId);
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found.' });
        return;
      }

      const manualReceipt = `rcpt_manual_${Date.now()}_${String(org._id).slice(-4)}`;
      const manualOrderId = `order_manual_${Date.now()}`;
      const manualPaymentId = `pay_manual_${Date.now()}`;

      // Create verified payment record
      const payment = await Payment.create({
        organizationId: org._id,
        plan,
        amount: Math.round(Number(amountINR) * 100),
        amountINR: Number(amountINR),
        currency: 'INR',
        status: 'paid',
        receipt: manualReceipt,
        razorpayOrderId: manualOrderId,
        razorpayPaymentId: manualPaymentId,
        customerEmail: customerEmail || 'offline-billing@valmikisoftwares.com',
      });

      // Update organization limits
      org.plan = plan;
      if (plan === 'single_scan') {
        org.maxScansPerMonth = (org.maxScansPerMonth || 0) + 1;
      } else if (PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]) {
        org.maxProjects = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].maxProjects;
        org.maxScansPerMonth = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].maxScansPerMonth;
      }
      await org.save();

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await AdminAuthService.recordAudit(
        req.admin!.adminId,
        req.admin!.email,
        'MANUAL_PAYMENT_CREDIT',
        'Payment',
        String(payment._id),
        {
          organizationId: String(org._id),
          organizationName: org.name,
          plan,
          amountINR,
          referenceNotes,
        },
        clientIp
      );

      res.status(201).json({
        success: true,
        message: `Successfully credited ${plan} to ${org.name}.`,
        payment,
        organization: org,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async exportCSV(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const payments = await Payment.find({ status: 'paid' })
        .populate('organizationId', 'name')
        .sort({ createdAt: -1 })
        .lean();

      const headers = [
        'Receipt / Invoice No',
        'Date (ISO)',
        'Organization',
        'Customer Email',
        'Plan Tier',
        'SAC Code',
        'Amount (INR)',
        'Currency',
        'Status',
        'Razorpay Order ID',
        'Razorpay Payment ID',
      ];

      const rows = payments.map((p: any) => {
        const orgName = p.organizationId?.name || 'N/A';
        const dateStr = p.createdAt ? new Date(p.createdAt).toISOString() : '';
        return [
          `"${p.receipt || ''}"`,
          `"${dateStr}"`,
          `"${orgName.replace(/"/g, '""')}"`,
          `"${p.customerEmail || ''}"`,
          `"${p.plan || ''}"`,
          '"998313"',
          `"${p.amountINR || (p.amount / 100) || 0}"`,
          `"${p.currency || 'INR'}"`,
          `"${p.status || ''}"`,
          `"${p.razorpayOrderId || ''}"`,
          `"${p.razorpayPaymentId || ''}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="quantumshield-accounting-export-${Date.now()}.csv"`);
      res.status(200).send(csvContent);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
