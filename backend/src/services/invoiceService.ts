import PDFDocument from 'pdfkit';
import { IPayment } from '../models/Payment';
import { IOrganization } from '../models/Organization';

export class InvoiceService {
  /**
   * Generates a clean, professional, audit-ready PDF invoice for a completed payment.
   */
  public static async generateInvoicePDF(
    payment: IPayment,
    org: IOrganization
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 45,
        size: 'A4',
        bufferPages: true,
        info: {
          Title: `Commercial Invoice - INV-QS-${payment.receipt || payment.razorpayOrderId.slice(-8)}`,
          Author: 'Valmiki Softwares',
          Subject: 'Software Subscription & Security Audit Commercial Invoice',
          Keywords: 'Invoice, QuantumShield, Valmiki Softwares, AppSec',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Color Palette
      const NAVY = '#0B132B';
      const BRAND_BLUE = '#2563EB';
      const SLATE_DARK = '#1E293B';
      const SLATE_MUTED = '#64748B';
      const BORDER_COLOR = '#E2E8F0';
      const CARD_BG = '#F8FAFC';
      const EMERALD = '#059669';

      const invoiceNumber = `INV-QS-${payment.receipt?.replace(/^rcpt_/, '') || payment._id.toString().slice(-8).toUpperCase()}`;
      const invoiceDate = new Date(payment.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // --- HEADER BANNER ---
      doc.rect(0, 0, 595.28, 75).fill(NAVY);
      doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('QUANTUMSHIELD', 45, 20);
      doc.fontSize(10).font('Helvetica').fillColor('#94A3B8').text('Dual-Shield Application Security Platform • by Valmiki Softwares', 45, 44);

      doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold').text('COMMERCIAL INVOICE', 380, 22, { align: 'right', width: 170 });
      doc.fontSize(9).font('Helvetica').fillColor('#38BDF8').text('(Non-GST Supply Bill)', 380, 42, { align: 'right', width: 170 });

      // --- TWO COLUMN METADATA ---
      let y = 95;

      // Left Column: Supplier Info
      doc.fillColor(SLATE_MUTED).fontSize(8).font('Helvetica-Bold').text('ISSUED BY (SUPPLIER)', 45, y);
      doc.fillColor(SLATE_DARK).fontSize(11).font('Helvetica-Bold').text('Valmiki Softwares', 45, y + 14);
      doc.fontSize(8.5).font('Helvetica').fillColor(SLATE_MUTED);
      doc.text('502, Vigneshwara Towers, Thatithopu,', 45, y + 28);
      doc.text('Tirupati, Andhra Pradesh, 517501, India', 45, y + 40);
      doc.text('Email: support@quantumshieldscan.com', 45, y + 52);
      doc.text('Support Contact: +91 7901019249', 45, y + 64);
      doc.text('Website: https://quantumshieldscan.com', 45, y + 76);

      // Right Column: Invoice Details Box
      const rightX = 350;
      doc.roundedRect(rightX, y, 200, 88, 6).fillAndStroke(CARD_BG, BORDER_COLOR);

      doc.fillColor(SLATE_MUTED).fontSize(8).font('Helvetica-Bold').text('INVOICE NUMBER:', rightX + 12, y + 10);
      doc.fillColor(SLATE_DARK).fontSize(9.5).font('Helvetica-Bold').text(invoiceNumber, rightX + 12, y + 21);

      doc.fillColor(SLATE_MUTED).fontSize(8).font('Helvetica').text('Invoice Date:', rightX + 12, y + 36);
      doc.fillColor(SLATE_DARK).fontSize(8.5).font('Helvetica-Bold').text(invoiceDate, rightX + 90, y + 36);

      doc.fillColor(SLATE_MUTED).fontSize(8).font('Helvetica').text('Payment Gateway:', rightX + 12, y + 50);
      doc.fillColor(SLATE_DARK).fontSize(8.5).font('Helvetica-Bold').text('Razorpay Online', rightX + 90, y + 50);

      doc.fillColor(SLATE_MUTED).fontSize(8).font('Helvetica').text('Payment Status:', rightX + 12, y + 64);
      doc.fillColor(EMERALD).fontSize(9).font('Helvetica-Bold').text('● PAID / SETTLED', rightX + 90, y + 64);

      // --- BILLED TO SECTION ---
      y = 195;
      doc.roundedRect(45, y, 505, 52, 6).fillAndStroke(CARD_BG, BORDER_COLOR);
      doc.fillColor(SLATE_MUTED).fontSize(8).font('Helvetica-Bold').text('BILLED TO (CUSTOMER / ORGANIZATION)', 57, y + 8);
      doc.fillColor(SLATE_DARK).fontSize(10).font('Helvetica-Bold').text(org.name || 'Customer Organization', 57, y + 20);
      doc.fontSize(8.5).font('Helvetica').fillColor(SLATE_MUTED);
      doc.text(`Customer Email: ${payment.customerEmail || 'billing@customer.com'}   •   Account Slug: ${org.slug || 'std'}`, 57, y + 34);

      // --- LINE ITEMS TABLE ---
      y = 260;

      // Table Header
      doc.rect(45, y, 505, 24).fill(NAVY);
      doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
      doc.text('ITEM / SERVICE DESCRIPTION', 55, y + 7, { width: 250 });
      doc.text('SAC CODE', 315, y + 7, { width: 70, align: 'center' });
      doc.text('TAX RATE', 390, y + 7, { width: 65, align: 'center' });
      doc.text('AMOUNT (INR)', 460, y + 7, { width: 80, align: 'right' });

      // Plan Name resolution
      let planDescription = 'QuantumShield Developer Pro Monthly Subscription (10 Projects / 75 Scans)';
      if (payment.plan === 'single_scan') {
        planDescription = 'QuantumShield Single Scan Pass - 1 Repository Full Dual-Shield Security & PQC Audit';
      } else if (payment.plan === 'team') {
        planDescription = 'QuantumShield Team Security Monthly Subscription (50 Projects / 300 Scans)';
      } else if (payment.plan === 'enterprise') {
        planDescription = 'QuantumShield Enterprise Shield Monthly Subscription (500 Projects / 5,000 Scans)';
      }

      // Row 1
      y += 24;
      doc.rect(45, y, 505, 42).fillAndStroke('#FFFFFF', BORDER_COLOR);
      doc.fillColor(SLATE_DARK).fontSize(9).font('Helvetica-Bold').text(planDescription, 55, y + 8, { width: 250 });
      doc.fontSize(7.5).font('Helvetica').fillColor(SLATE_MUTED).text('SAST, Secret Redaction, NIST Post-Quantum Audit & PDF Reports', 55, y + 24);

      doc.fontSize(8.5).font('Helvetica').fillColor(SLATE_DARK);
      doc.text('998313', 315, y + 14, { width: 70, align: 'center' });
      doc.text('0% (Exempt)', 390, y + 14, { width: 65, align: 'center' });
      doc.font('Helvetica-Bold').text(`₹${payment.amountINR.toLocaleString('en-IN')}.00`, 460, y + 14, { width: 80, align: 'right' });

      // Summary Box
      y += 42;
      const summaryY = y + 10;
      doc.roundedRect(320, summaryY, 230, 75, 6).fillAndStroke(CARD_BG, BORDER_COLOR);

      doc.fillColor(SLATE_MUTED).fontSize(8.5).font('Helvetica').text('Subtotal:', 335, summaryY + 10);
      doc.fillColor(SLATE_DARK).fontSize(8.5).font('Helvetica-Bold').text(`₹${payment.amountINR.toLocaleString('en-IN')}.00`, 450, summaryY + 10, { width: 90, align: 'right' });

      doc.fillColor(SLATE_MUTED).fontSize(8.5).font('Helvetica').text('Goods & Services Tax (GST):', 335, summaryY + 26);
      doc.fillColor(SLATE_DARK).fontSize(8.5).font('Helvetica-Bold').text('₹0.00 (Exempt)', 450, summaryY + 26, { width: 90, align: 'right' });

      doc.moveTo(335, summaryY + 44).lineTo(540, summaryY + 44).stroke(BORDER_COLOR);

      doc.fillColor(NAVY).fontSize(10.5).font('Helvetica-Bold').text('Total Paid Amount:', 335, summaryY + 52);
      doc.fillColor(BRAND_BLUE).fontSize(11).font('Helvetica-Bold').text(`₹${payment.amountINR.toLocaleString('en-IN')}.00`, 450, summaryY + 52, { width: 90, align: 'right' });

      // Transaction Proof Box (Left of Summary)
      doc.roundedRect(45, summaryY, 265, 75, 6).fillAndStroke(CARD_BG, BORDER_COLOR);
      doc.fillColor(SLATE_MUTED).fontSize(8).font('Helvetica-Bold').text('TRANSACTION VERIFICATION DATA', 55, summaryY + 8);
      doc.fontSize(8).font('Helvetica').fillColor(SLATE_MUTED);
      doc.text('Razorpay Order ID:', 55, summaryY + 22);
      doc.font('Helvetica-Bold').fillColor(SLATE_DARK).text(payment.razorpayOrderId || 'N/A', 145, summaryY + 22);

      doc.font('Helvetica').fillColor(SLATE_MUTED).text('Razorpay Payment ID:', 55, summaryY + 36);
      doc.font('Helvetica-Bold').fillColor(SLATE_DARK).text(payment.razorpayPaymentId || 'N/A', 145, summaryY + 36);

      doc.font('Helvetica').fillColor(SLATE_MUTED).text('Currency / Mode:', 55, summaryY + 50);
      doc.font('Helvetica-Bold').fillColor(SLATE_DARK).text('INR (Indian Rupee) • 100% Digital Delivery', 145, summaryY + 50);

      // --- STATUTORY LEGAL DECLARATION BOX (USER REQUESTED NOTE) ---
      y = summaryY + 95;
      doc.roundedRect(45, y, 505, 80, 6).fillAndStroke('#FEF3C7', '#F59E0B');

      doc.fillColor('#92400E').fontSize(9).font('Helvetica-Bold').text('STATUTORY TAX DECLARATION & EXPENSE DEDUCTION NOTICE:', 57, y + 10);

      doc.fillColor('#78350F').fontSize(8.5).font('Helvetica').text(
        'We are currently operating under the MSME / Service Provider threshold exemption (Annual aggregate turnover under ₹20 Lakhs as per Section 22 of the CGST Act, 2017), so GST is not applicable on our bill. You can claim 100% of this invoice as a legitimate business/software expense in your company\'s Income Tax return (under Section 37 of the Income Tax Act, 1961) for full tax deduction.',
        57,
        y + 24,
        { width: 480, lineGap: 2.5 }
      );

      // --- FOOTER & SIGN-OFF ---
      y = 730;
      doc.moveTo(45, y).lineTo(550, y).stroke(BORDER_COLOR);

      doc.fillColor(SLATE_MUTED).fontSize(8).font('Helvetica').text(
        'This is a digitally generated commercial sales bill created automatically upon payment confirmation. No physical signature is required.',
        45,
        y + 8,
        { align: 'center', width: 505 }
      );

      doc.fillColor(SLATE_DARK).fontSize(8.5).font('Helvetica-Bold').text(
        'Thank you for securing your software with QuantumShield by Valmiki Softwares.',
        45,
        y + 22,
        { align: 'center', width: 505 }
      );

      doc.end();
    });
  }
}
