import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-white">QuantumShield</span>
                <p className="text-xs text-slate-400">by Valmiki Softwares</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              NIST-grade cryptographic readiness discovery platform. Detect classical crypto vulnerabilities (RSA, ECC), prevent Harvest-Now-Decrypt-Later threats, and migrate to FIPS 203/204/205 standards.
            </p>

            {/* Corporate Address & Contact */}
            <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-navy-900">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                <span className="leading-tight">
                  <strong>Valmiki Softwares:</strong> 502, Vigneshwara towers, thatithopu, Tirupati, AP, 517501, India
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>+91 7901019249</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <a href="mailto:support@quantumshieldscan.com" className="text-blue-400 hover:underline">
                  support@quantumshieldscan.com
                </a>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2">
              © {new Date().getFullYear()} Valmiki Softwares. All rights reserved. • <code>quantumshieldscan.com</code>
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
                  <span>FIPS 203: ML-KEM</span>
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
                  <span>FIPS 204: ML-DSA</span>
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
                  <span>FIPS 205: SLH-DSA</span>
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
                  <span>IETF Hybrid TLS 1.3</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Product & Platform */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Platform & Pricing
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/#how-it-works" className="hover:text-white">How Scanning Works</a></li>
              <li><a href="/#capabilities" className="hover:text-white">Supported Languages</a></li>
              <li><a href="/#security" className="hover:text-white">Zero Execution Policy</a></li>
              <li><a href="/#pricing" className="hover:text-white">Plans & Pricing (INR)</a></li>
              <li><Link to="/contact" className="hover:text-white">Enterprise Inquiries</Link></li>
            </ul>
          </div>

          {/* Razorpay Compliance Legal Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Policies & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/terms"
                  onClick={() => window.scrollTo(0, 0)}
                  className="hover:text-white text-blue-300 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  onClick={() => window.scrollTo(0, 0)}
                  className="hover:text-white text-blue-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  onClick={() => window.scrollTo(0, 0)}
                  className="hover:text-white text-blue-300 transition-colors"
                >
                  Cancellation & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-policy"
                  onClick={() => window.scrollTo(0, 0)}
                  className="hover:text-white text-blue-300 transition-colors"
                >
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => window.scrollTo(0, 0)}
                  className="hover:text-white text-blue-300 transition-colors"
                >
                  Contact Us & Grievance
                </Link>
              </li>
            </ul>

            {/* Payment Trust Badge */}
            <div className="mt-4 pt-3 border-t border-navy-900">
              <div className="text-[11px] text-slate-400 font-semibold mb-1">Payment Security</div>
              <p className="text-[10px] text-slate-500 leading-tight">
                256-bit SSL encrypted checkout. Payments processed securely via <strong>Razorpay</strong> (UPI, Cards, NetBanking).
              </p>
            </div>
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
    </footer>
  );
};
export default Footer;
