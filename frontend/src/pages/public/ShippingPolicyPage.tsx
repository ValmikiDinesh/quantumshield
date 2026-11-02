import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Truck, Zap, CheckCircle2, Cloud, Mail } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-semibold mb-4">
              <Truck className="w-3.5 h-3.5" />
              <span>Fulfillment & Delivery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
              Shipping & Delivery Policy
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
              <h2 className="text-lg font-bold text-navy-950">1. Nature of Products & Digital Delivery</h2>
              <p>
                <strong>QuantumShield</strong> (Valmiki Softwares) is a 100% cloud-hosted Software-as-a-Service (SaaS) platform 
                specializing in Post-Quantum Cryptography (PQC) readiness auditing, repository scanning, and migration planning.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl my-4">
                <div className="flex items-start space-x-3 text-brand-900 text-xs">
                  <Cloud className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-bold text-navy-950 mb-1">
                      Digital SaaS Delivery — No Physical Shipping
                    </strong>
                    All QuantumShield services, scanning engines, subscription tiers, and executive PDF audit reports are 
                    delivered electronically over the internet. There are <strong>no physical shipments, no paper documents dispatched, 
                    and zero shipping or handling fees</strong>.
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">2. Service Provisioning Timelines</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-navy-950">Instant Subscription Activation (Within 0 to 5 Minutes)</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Upon successful payment authorization by our payment gateway partner (<strong>Razorpay</strong>), your organization&apos;s 
                      account limits (e.g., project quota, scan limits, PDF exports) are upgraded immediately and automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-navy-950">Automated Electronic Invoice Delivery</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      A digital payment confirmation receipt and GST-compliant tax invoice are automatically generated and emailed to your registered 
                      account email address immediately following transaction approval.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">3. Non-Receipt of Digital Access</h2>
              <p>
                In the rare circumstance that your payment succeeded on Razorpay but your subscription did not automatically activate 
                within 15 minutes due to bank webhook delays or network interrupts:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-600">
                <li>Log out and log back into your dashboard at <a href="https://quantumshieldscan.com" className="text-brand-600">quantumshieldscan.com</a>.</li>
                <li>Check your spam/junk folder for the automated payment confirmation email.</li>
                <li>
                  If access is still pending, contact our support team immediately at <a href="mailto:support@quantumshieldscan.com" className="text-brand-600 font-semibold">support@quantumshieldscan.com</a> or 
                  call <strong>+91 7901019249</strong> with your Razorpay Payment ID. Our support team will manually verify and provision your subscription within 2 hours.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">4. Support Contact Information</h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <p><strong>Entity:</strong> Valmiki Softwares</p>
                <p><strong>Registered Address:</strong> 502, Vigneshwara towers, thatithopu, Tirupati, 517501, Andhra Pradesh, India</p>
                <p><strong>Support Email:</strong> <a href="mailto:support@quantumshieldscan.com" className="text-brand-600">support@quantumshieldscan.com</a></p>
                <p><strong>Helpline Phone:</strong> +91 7901019249</p>
                <p><strong>Operating Hours:</strong> Monday – Friday: 9:30 AM to 6:30 PM IST</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default ShippingPolicyPage;

