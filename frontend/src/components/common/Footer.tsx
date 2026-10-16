import React, { useState } from 'react';
import { Shield, ExternalLink, Mail, FileText, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-white">QuantumShield</span>
                <p className="text-xs text-slate-400">by Valmiki Softwares</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prepare your codebase for the post-quantum era with automated AST & manifest inspection aligned with NIST FIPS standards.
            </p>
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} Valmiki Softwares. All rights reserved.
            </div>
          </div>

          {/* Standards & Specs */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              NIST PQC Standards
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://csrc.nist.gov/pubs/fips/203/final"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center space-x-1"
                >
                  <span>FIPS 203: ML-KEM Standard</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://csrc.nist.gov/pubs/fips/204/final"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center space-x-1"
                >
                  <span>FIPS 204: ML-DSA Standard</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://csrc.nist.gov/pubs/fips/205/final"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center space-x-1"
                >
                  <span>FIPS 205: SLH-DSA Standard</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/draft-ietf-tls-hybrid-design/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center space-x-1"
                >
                  <span>IETF Hybrid TLS 1.3 Draft</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Product & Platform */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-white">How Scanning Works</a></li>
              <li><a href="#capabilities" className="hover:text-white">Supported Languages</a></li>
              <li><a href="#security" className="hover:text-white">Zero Code Execution Policy</a></li>
              <li><a href="#pricing" className="hover:text-white">Subscription Plans</a></li>
              <li><a href="/api/docs/openapi.json" target="_blank" className="hover:text-white">OpenAPI Documentation</a></li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Governance & Privacy
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-white text-left"
                >
                  Privacy & Data Retention
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white text-left"
                >
                  Terms of Service & Disclaimer
                </button>
              </li>
              <li className="pt-2 text-slate-400 text-xs">
                Inquiries: <span className="text-slate-300">security@valmikisoftwares.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Banner */}
        <div className="mt-12 pt-8 border-t border-navy-800 text-[11px] text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-400 mb-1">IMPORTANT SECURITY & ENGINEERING NOTICE:</p>
          <p>
            QuantumShield is a static cryptographic readiness discovery tool built by Valmiki Softwares.
            A clean or high readiness score indicates absence of recognized quantum-vulnerable patterns in inspected source code, but does not prove absolute quantum safety or represent a guarantee against cryptographic exploit.
            Quantum computing risk depends on algorithmic agility, key management, operational environment, and future hardware advancements.
          </p>
        </div>
      </div>

      {/* Privacy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-xl max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-navy-950 mb-3 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-brand-600" />
              <span>Privacy Policy & Code Handling — Valmiki Softwares</span>
            </h3>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong>Zero Code Execution:</strong> Uploaded source code archives are processed exclusively in isolated memory buffers without build script invocation or binary execution.
              </p>
              <p>
                <strong>Automatic Temporary Cleanup:</strong> Extracted file buffers are purged immediately upon scan completion. Only structured scan findings and redacted evidence snippets are persisted in the database.
              </p>
              <p>
                <strong>Automated Secret Redaction:</strong> Private keys, passwords, bearer tokens, and cloud credentials in evidence lines are masked with <code>[REDACTED_SECRET]</code> prior to persistence or AI analysis.
              </p>
              <p>
                <strong>No Model Training:</strong> Customer source code is never used to train machine learning models.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-navy-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-navy-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-xl max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-navy-950 mb-3 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>Terms of Service & Audit Disclaimer</span>
            </h3>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong>Readiness Assessment vs Formal Audit:</strong> QuantumShield provides prioritized migration indicators. Findings do not constitute a formal mathematical audit or regulatory compliance certification.
              </p>
              <p>
                <strong>Customer Responsibility:</strong> Developers and security architects are responsible for testing, benchmarking, and validating post-quantum algorithm implementations in their respective runtime environments.
              </p>
              <p>
                <strong>Permitted Use:</strong> Users agree to scan only repositories they own or are authorized to inspect.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-navy-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-navy-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
