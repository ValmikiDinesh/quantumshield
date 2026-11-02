import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { FileText, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-semibold mb-4">
              <FileText className="w-3.5 h-3.5" />
              <span>Legal & Governance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Last Updated: October 30, 2026 • Effective Date: October 30, 2026
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Operated by <strong>Valmiki Softwares</strong> (Website: <code>quantumshieldscan.com</code>)
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-6">
            <section>
              <h2 className="text-lg font-bold text-navy-950 flex items-center space-x-2">
                <span>1. Acceptance of Terms</span>
              </h2>
              <p>
                By accessing, browsing, registering for an account, or using the <strong>QuantumShield</strong> platform 
                (hosted at <a href="https://quantumshieldscan.com" className="text-brand-600 underline">quantumshieldscan.com</a>), 
                you enter into a legally binding agreement with <strong>Valmiki Softwares</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), 
                having its office at <strong>502, Vigneshwara towers, thatithopu, Tirupati, Andhra Pradesh - 517501, India</strong>.
              </p>
              <p>
                If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have 
                the legal authority to bind such entity to these Terms. If you do not agree to these terms, you must discontinue 
                use of our service immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">2. Description of SaaS Services</h2>
              <p>
                QuantumShield is a cloud-based Post-Quantum Cryptography (PQC) readiness and static repository scanning platform. 
                Our platform provides automated static analysis (AST & manifest inspection) to detect classical cryptographic 
                vulnerabilities (e.g., RSA, ECDH, ECDSA) and align software systems with NIST August 2024 finalized standards 
                (FIPS 203 ML-KEM, FIPS 204 ML-DSA, FIPS 205 SLH-DSA).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">3. Permitted Use & Code Ownership</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Authorized Scans Only:</strong> You warrant that you have explicit permission to upload, inspect, 
                  and scan any source code repositories, ZIP archives, or Git URLs submitted to QuantumShield.
                </li>
                <li>
                  <strong>Intellectual Property of Customer Code:</strong> Valmiki Softwares claims zero intellectual property 
                  rights over your source code. Code uploaded to QuantumShield remains your sole and exclusive property.
                </li>
                <li>
                  <strong>Zero Code Execution Guarantee:</strong> Uploaded source code archives are processed exclusively in isolated, 
                  non-executing memory buffers. Build scripts, external network calls, and binaries are never executed.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">4. Subscriptions, Payments & Billing</h2>
              <p>
                QuantumShield offers both free community tiers and paid recurring/monthly subscription tiers 
                (Developer Pro, Team Security, Enterprise Shield).
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Payment Processing:</strong> Payments are processed securely via our authorized payment gateway partner, 
                  <strong>Razorpay</strong>. We accept UPI, NetBanking, Credit/Debit cards, and Corporate Cards.
                </li>
                <li>
                  <strong>Currency & Taxes:</strong> Unless explicitly stated otherwise, subscription fees are quoted in 
                  <strong>Indian National Rupees (INR / ₹)</strong>. Applicable Goods & Services Tax (18% GST) is billed in accordance with Indian tax regulations.
                </li>
                <li>
                  <strong>Auto-Renewal:</strong> Subscriptions are billed on a monthly cycle. You may cancel renewal at any time via your Organization Billing settings.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">5. Readiness Assessment vs. Formal Audit Disclaimer</h2>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-1">Important Security & Legal Disclaimer:</strong>
                    QuantumShield is an automated static discovery and advisory tool. A clean scan result or high readiness score 
                    reflects the absence of known quantum-vulnerable signatures in inspected files, but does not guarantee absolute 
                    cryptographic safety, mathematical infallibility, or formal regulatory compliance. Security teams are responsible 
                    for validating and performance-benchmarking all PQC algorithm replacements in their runtime environments.
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable Indian law, Valmiki Softwares and its directors, employees, and 
                affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from 
                the use or inability to use the platform. Our aggregate liability shall not exceed the total fees paid by you in 
                the three (3) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">7. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute, claim, 
                or proceeding arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the 
                competent courts located in <strong>Tirupati, Andhra Pradesh, India</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">8. Contact Information</h2>
              <p>For questions or formal inquiries regarding these Terms & Conditions:</p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <p><strong>Entity:</strong> Valmiki Softwares</p>
                <p><strong>Address:</strong> 502, Vigneshwara towers, thatithopu, Tirupati, 517501, Andhra Pradesh, India</p>
                <p><strong>Phone:</strong> +91 7901019249</p>
                <p><strong>Email:</strong> <a href="mailto:support@quantumshieldscan.com" className="text-brand-600">support@quantumshieldscan.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default TermsPage;

