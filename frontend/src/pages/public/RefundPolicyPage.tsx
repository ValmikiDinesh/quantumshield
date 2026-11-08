import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { RefreshCw, CheckCircle2, Clock, HelpCircle, Mail, Phone } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-semibold mb-4">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Customer Satisfaction Guarantee</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
              Cancellation & Refund Policy
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Last Updated: October 30, 2026 • Effective Date: October 30, 2026
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Operated by <strong>Valmiki Softwares</strong> (Website: <code>quantumshieldscan.com</code>)
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-6">
            <section>
              <h2 className="text-lg font-bold text-navy-950">1. Overview</h2>
              <p>
                At <strong>QuantumShield</strong> (Valmiki Softwares), we want you to be completely confident in our 
                post-quantum cryptographic readiness scanning tools. We maintain a transparent and customer-first 
                cancellation and refund policy in accordance with consumer protection guidelines and payment aggregator 
                standards.
              </p>
            </section>

            {/* Highlight Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>7-Day Money-Back Window</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Full refund eligible within 7 days of initial subscription purchase if not fully satisfied.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs mb-1">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>5 to 7 Working Days</span>
                </div>
                <p className="text-xs text-blue-800">
                  Approved refunds are credited directly back to your original payment instrument via Razorpay.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs mb-1">
                  <HelpCircle className="w-4 h-4 text-slate-600" />
                  <span>Cancel Anytime</span>
                </div>
                <p className="text-xs text-slate-600">
                  No lock-in contracts. Cancel renewals anytime with a single click in your billing dashboard.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-lg font-bold text-navy-950">2. Subscription Cancellation Rules</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Self-Serve Cancellation:</strong> You can cancel your paid subscription plan at any time through 
                  the <strong>Organization Billing</strong> page in your QuantumShield account.
                </li>
                <li>
                  <strong>Continued Access Until Period End:</strong> Upon cancellation, your account will remain on the upgraded 
                  plan (with all project and scan quotas) until the end of your current monthly billing period. At that point, 
                  your paid subscription will not renew, and your existing repository audit history and reports will remain securely preserved without data loss.
                </li>
                <li>
                  <strong>No Hidden Cancellation Penalties:</strong> There are zero cancellation fees or penalties.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">3. Eligibility for Refunds</h2>
              <p>Refunds are granted under the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>7-Day Initial Satisfaction Guarantee:</strong> If you purchase a paid plan (Developer Pro or Team Security) 
                  and discover that the platform does not meet your repository architecture needs, you may request a 100% refund 
                  within <strong>7 calendar days</strong> of the initial purchase date, provided you have not executed more than 5 scans.
                </li>
                <li>
                  <strong>Technical Non-Delivery / Service Failure:</strong> If a technical issue on our server prevents you from running 
                  scans or exporting compliance reports and our engineering team cannot resolve it within 48 hours, you are eligible for a full refund.
                </li>
                <li>
                  <strong>Duplicate or Erroneous Charges:</strong> In the rare event of a duplicate transaction caused by network timeouts 
                  during checkout, the extra charge will be automatically identified and refunded immediately.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">4. Refund Processing Timeline</h2>
              <p>
                Once your refund request is received and verified by our billing team:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>Approval notification is issued within <strong>24 business hours</strong>.</li>
                <li>The refund is submitted via our payment gateway (<strong>Razorpay</strong>).</li>
                <li>
                  The funds are credited back to your original source of payment (UPI VPA, Credit/Debit card, or NetBanking bank account) 
                  within <strong>5 to 7 working days</strong>, depending on your bank&apos;s settlement schedule.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">5. How to Initiate a Refund Request</h2>
              <p>To request a cancellation or refund, contact us through either of the following channels with your account email and Razorpay Payment/Order ID:</p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-brand-600" />
                  <span><strong>Email:</strong> <a href="mailto:support@quantumshieldscan.com" className="text-brand-600">support@quantumshieldscan.com</a> (Subject: &quot;Refund Request - [Your Organization Name]&quot;)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-brand-600" />
                  <span><strong>Phone Helpline:</strong> +91 7901019249 (Mon–Fri, 9:30 AM – 6:30 PM IST)</span>
                </div>
                <div className="pt-1 text-slate-500">
                  <strong>Office Address:</strong> Valmiki Softwares, 502, Vigneshwara towers, thatithopu, Tirupati, 517501, India
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default RefundPolicyPage;

