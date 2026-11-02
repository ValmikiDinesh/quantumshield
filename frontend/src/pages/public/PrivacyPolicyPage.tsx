import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Shield, Lock, EyeOff, Server, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Data Protection & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
              Privacy Policy
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
              <h2 className="text-lg font-bold text-navy-950">1. Commitment to Privacy & Security</h2>
              <p>
                At <strong>QuantumShield</strong>, operated by <strong>Valmiki Softwares</strong> 
                (502, Vigneshwara towers, thatithopu, Tirupati, 517501, India), we recognize the absolute sensitivity 
                of proprietary source code, algorithmic architectures, and corporate security postures. 
                This Privacy Policy explains how we collect, handle, protect, and process information when you access 
                <a href="https://quantumshieldscan.com" className="text-brand-600 underline">quantumshieldscan.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">2. Source Code Handling Guarantees</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2 font-semibold text-navy-950 text-xs mb-1">
                    <EyeOff className="w-4 h-4 text-brand-600" />
                    <span>Zero Code Execution Policy</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Uploaded source code archives are inspected purely as static text/AST nodes. We never run build scripts, 
                    compilers, or execute binaries on your code.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2 font-semibold text-navy-950 text-xs mb-1">
                    <Server className="w-4 h-4 text-brand-600" />
                    <span>Ephemeral Memory Processing</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Unpacked files reside exclusively in temporary memory buffers and are wiped immediately upon scan completion. 
                    Your source tree is never persistently stored on disk.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2 font-semibold text-navy-950 text-xs mb-1">
                    <Lock className="w-4 h-4 text-brand-600" />
                    <span>Automated Secret Redaction</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Private keys, JWT tokens, AWS credentials, and API secrets in evidence lines are automatically masked with 
                    <code>[REDACTED_SECRET]</code> prior to database storage.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2 font-semibold text-navy-950 text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    <span>No AI Model Training</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    We never use customer source code, scanning results, or telemetry to train public machine learning 
                    or foundational AI models.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">3. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Account Information:</strong> Name, work email address, company/organization name, and encrypted password hash (bcrypt).
                </li>
                <li>
                  <strong>Payment Data (Handled by Razorpay):</strong> When upgrading subscriptions, payment transaction data 
                  (Order ID, Payment ID, Payment Method type) is stored. <strong>We do NOT store your credit/debit card numbers, CVVs, or NetBanking PINs.</strong> 
                  All sensitive payment instrument processing is handled by PCI-DSS certified partner <strong>Razorpay</strong>.
                </li>
                <li>
                  <strong>Scan Telemetry & Reports:</strong> Cryptographic inventory tallies (e.g., RSA-2048 count, ML-KEM count), 
                  readiness score, file names, line numbers, and redacted code findings to generate your audit reports.
                </li>
                <li>
                  <strong>Technical Logs:</strong> IP address, browser type, and operating system logs maintained for 30 days for security auditing and rate-limiting defense.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">4. Data Sharing & Third-Party Processors</h2>
              <p>
                We do not sell, rent, or trade your personal or corporate information. Data is shared exclusively with necessary 
                infrastructure partners under strict confidentiality:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Razorpay Software Private Limited:</strong> Payment gateway processing (PCI-DSS Level 1 compliant).</li>
                <li><strong>MongoDB Atlas / AWS Cloud:</strong> Encrypted database and cloud infrastructure.</li>
                <li><strong>Google Cloud (Gemini API):</strong> Sanitized evidence snippets (with secrets fully redacted) for optional AI migration advice.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">5. User Rights & Data Deletion</h2>
              <p>
                In compliance with the Digital Personal Data Protection Act (DPDPA 2023) and global privacy standards, you have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access all scan data and organization members stored in your account.</li>
                <li>Request permanent deletion of your projects, scan histories, and user profile by contacting our support team.</li>
                <li>Export your scan findings in standard JSON or PDF formats at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-950">6. Grievance Redressal Officer</h2>
              <p>
                In accordance with the Information Technology Act, 2000 and IT Rules, 2021, the designated Grievance Officer is:
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <p><strong>Officer Name:</strong> Dinesh Valmiki</p>
                <p><strong>Designation:</strong> Grievance Officer, Valmiki Softwares</p>
                <p><strong>Address:</strong> 502, Vigneshwara towers, thatithopu, Tirupati, 517501, Andhra Pradesh, India</p>
                <p><strong>Email:</strong> <a href="mailto:support@quantumshieldscan.com" className="text-brand-600">support@quantumshieldscan.com</a></p>
                <p><strong>Phone:</strong> +91 7901019249</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default PrivacyPolicyPage;

