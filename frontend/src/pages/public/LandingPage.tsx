import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  FileCode2,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Download,
  Terminal,
  Layers,
  ChevronDown,
  Sparkles,
  KeyRound,
  EyeOff,
  FileCheck,
  Server,
  Zap,
  Globe2,
  HelpCircle,
  Activity,
  Check,
  AlertCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activePreviewTab, setActivePreviewTab] = useState<'secret' | 'owasp' | 'pqc'>('secret');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-20 pb-28 overflow-hidden border-b border-navy-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-navy-800/90 border border-navy-700 text-blue-300 text-xs font-semibold mb-6 shadow-sm backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200">The Dual-Shield Platform:</span>
            <span className="text-blue-300">Present-Day AppSec + NIST Post-Quantum Readiness</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Stop Immediate Breaches Today.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300">
              Future-Proof for Post-Quantum.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            QuantumShield is the unified application security auditor designed for modern engineering teams. 
            Instantly detect <strong className="text-white">hardcoded cloud secrets</strong>, <strong className="text-white">OWASP Top 10 vulnerabilities</strong>, and <strong className="text-white">PII data leaks</strong> today — while scanning repositories for <strong className="text-white">Shor's algorithm exposure</strong> and NIST FIPS 203/204/205 post-quantum migration.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 group"
            >
              <span>Scan Your Repository Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#preview"
              className="w-full sm:w-auto bg-navy-800/90 hover:bg-navy-800 text-slate-200 border border-navy-700 font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <FileCheck className="w-4 h-4 text-brand-400" />
              <span>Explore Live Findings Demo</span>
            </a>
          </div>

          {/* Zero-Tampering Guarantee Banner */}
          <div className="mt-8 inline-flex items-center space-x-2 text-xs text-slate-400 bg-navy-950/80 px-4 py-2 rounded-lg border border-navy-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span><strong>Zero-Liability Advisory:</strong> 100% Read-only pattern inspection. We never alter your code or inject breaking automated PRs.</span>
          </div>

          {/* Key Metric Highlights */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-navy-800/80 text-left">
            <div className="p-3 bg-navy-900/40 rounded-xl border border-navy-800/60">
              <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Shield 1: AppSec</span>
              </div>
              <p className="text-lg font-bold text-white">OWASP & Secrets</p>
              <p className="text-[11px] text-slate-400 mt-0.5">SSRF, IDOR, SQLi, Cloud Keys</p>
            </div>

            <div className="p-3 bg-navy-900/40 rounded-xl border border-navy-800/60">
              <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-semibold mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Shield 2: Post-Quantum</span>
              </div>
              <p className="text-lg font-bold text-white">NIST FIPS 203-205</p>
              <p className="text-[11px] text-slate-400 mt-0.5">ML-KEM, ML-DSA, HNDL Risks</p>
            </div>

            <div className="p-3 bg-navy-900/40 rounded-xl border border-navy-800/60">
              <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-semibold mb-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Compliance Ready</span>
              </div>
              <p className="text-lg font-bold text-white">SOC 2 & ISO 27001</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PCI-DSS v4 & DPDP Act 2023</p>
            </div>

            <div className="p-3 bg-navy-900/40 rounded-xl border border-navy-800/60">
              <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold mb-1">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Privacy Assured</span>
              </div>
              <p className="text-lg font-bold text-white">Zero-Leak Masking</p>
              <p className="text-[11px] text-slate-400 mt-0.5">In-memory inspect & redaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- COMPLIANCE STANDARDS STRIP --- */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Audited Against Global Regulatory & Cryptographic Standards
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Every scan maps directly to regulatory mandates and cryptographic transition frameworks.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>SOC 2 Type II (CC6.1)</span>
              </div>
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>ISO/IEC 27001:2022</span>
              </div>
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>PCI-DSS v4.0 (Req 3.4 & 4.1)</span>
              </div>
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-orange-600" />
                <span>India DPDP Act 2023 (Sec 8(5))</span>
              </div>
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>NIST FIPS 203/204/205</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DUAL-SHIELD ARCHITECTURE SECTION --- */}
      <section id="dual-shield" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              The Dual-Shield Architecture
            </h2>
            <h3 className="text-3xl font-extrabold text-navy-950 sm:text-4xl">
              Complete Security Coverage: From Immediate Threats to the Quantum Horizon
            </h3>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Most security tools only solve today's OWASP checks or focus exclusively on theoretical quantum algorithms. 
              QuantumShield delivers both in a single, high-performance static analysis engine.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SHIELD 1: PRESENT-DAY DEFENSE */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500/20 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Shield 1 • Active Today
                  </span>
                  <h4 className="text-xl font-bold text-navy-950 mt-1">
                    Present-Day Threat Defense
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Protect your repositories from active cyber vulnerabilities, leaked API tokens, and regulatory non-compliance fines before your code hits production.
              </p>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-navy-950">Zero-Leak Hardcoded Secret Scanner</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Identifies live AWS Access Keys, Razorpay Keys, Stripe Secrets, Google Cloud credentials, and Database URIs with automatic masking to prevent secondary leaks.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-navy-950">OWASP Top 10 SAST Detection</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Catches Server-Side Request Forgery (SSRF), Insecure Direct Object References (IDOR), SQL Injection, Command Injection (RCE), and Unsafe Deserialization.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-navy-950">Insecure Transport & Broken TLS</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Detects disabled certificate validation (<code className="text-xs bg-slate-200 px-1 py-0.5 rounded">rejectUnauthorized: false</code>), plaintext HTTP endpoints, and deprecated SSLv3/TLS 1.0 protocols.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-navy-950">PII & Financial Leak Prevention</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Luhn-verified Credit Card detection, Indian Aadhaar numbers, and PAN card pattern matches to maintain compliance with India's DPDP Act 2023 & PCI-DSS.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SHIELD 2: POST-QUANTUM READINESS */}
            <div className="bg-white rounded-2xl border-2 border-brand-500/20 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center font-bold">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Shield 2 • Future-Proof
                  </span>
                  <h4 className="text-xl font-bold text-navy-950 mt-1">
                    Post-Quantum Cryptography Readiness
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Analyze your cryptographic footprint to defend against Shor's algorithm and "Harvest Now, Decrypt Later" state-sponsored surveillance attacks.
              </p>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-navy-950">Shor's Algorithm Vulnerability Index</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Surfaces all instances of RSA, ECC, ECDSA, ECDH, and Diffie-Hellman that can be factored in polynomial time by a Cryptanalytically Relevant Quantum Computer (CRQC).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <Activity className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-navy-950">Harvest Now, Decrypt Later (HNDL) Analysis</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Identifies long-term data secrets (SSL sessions, archival tokens, root CA keys) that adversaries are copying today to decrypt retroactively.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-navy-950">NIST FIPS 203/204/205 Transition Roadmaps</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Provides structured migration pathways to ML-KEM (Module-Lattice KEM), ML-DSA (Module-Lattice Signatures), and SLH-DSA (Stateless Hash Signatures).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-navy-950">Cryptographic Inventory & CNSA 2.0 Compliance</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Catalogs all classical vs. hybrid cryptographic primitives across your dependencies and source files to satisfy federal and enterprise vendor mandates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ZERO-LIABILITY NON-INVASIVE GUARANTEE SECTION --- */}
      <section className="py-16 bg-navy-950 text-white border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 rounded-3xl border border-navy-700/80 p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold mb-4">
                <Check className="w-3.5 h-3.5" />
                <span>Zero-Liability Non-Invasive Policy</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                We Never Alter Your Code. We Never Break Your Production.
              </h3>

              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Many modern automated security tools inject experimental AI code diffs or generate automatic pull requests that can cause production outages, introduce subtle syntax errors, or void compliance warranties. 
                <strong className="text-white"> QuantumShield operates on a strict non-invasive advisory principle:</strong>
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>100% Read-Only Inspection</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Scans run in isolated, read-only memory buffers. Your git branches, remote repositories, and build artifacts remain untouched.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No Risky Auto-Patches</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-2">
                    We deliberately do not apply drop-in code modifications. Your engineering team retains complete control over code changes and testing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Expert Actionable Checklists</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Every finding provides an intuitive root-cause breakdown, step-by-step remediation tasks, and direct links to official vendor and NIST specifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE FINDINGS PREVIEW DEMO --- */}
      <section id="preview" className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Actionable Security Intelligence
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Interactive Finding & Advisory Preview
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Explore how QuantumShield delivers clear exploit context, regulatory mappings, and non-invasive remediation steps across our detection categories.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <button
              onClick={() => setActivePreviewTab('secret')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activePreviewTab === 'secret'
                  ? 'bg-navy-950 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-navy-950 border border-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Hardcoded Secret (Shield 1)</span>
            </button>

            <button
              onClick={() => setActivePreviewTab('owasp')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activePreviewTab === 'owasp'
                  ? 'bg-navy-950 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-navy-950 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>OWASP Top 10 SAST (Shield 1)</span>
            </button>

            <button
              onClick={() => setActivePreviewTab('pqc')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activePreviewTab === 'pqc'
                  ? 'bg-navy-950 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-navy-950 border border-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span>Post-Quantum RSA (Shield 2)</span>
            </button>
          </div>

          {/* Interactive Card Display */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden text-left">
            {activePreviewTab === 'secret' && (
              <div>
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase">
                      CRITICAL SEVERITY
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                      Shield 1: Hardcoded Secret
                    </span>
                    <span className="text-xs text-slate-500 font-mono">SEC-KEY-RAZORPAY</span>
                  </div>
                  <span className="text-xs text-brand-600 font-mono font-medium">server/billing/paymentService.ts:18</span>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <h4 className="text-base font-bold text-navy-950">Hardcoded Razorpay Live Secret Key Exposed</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      A live payment gateway private secret key is embedded directly into the source code. Anyone with repository read access or access to compiled bundles can trigger unauthorized transactions, refund transfers, or access customer payment records.
                    </p>
                  </div>

                  {/* Redacted Code Snippet */}
                  <div className="bg-navy-950 rounded-xl p-4 font-mono text-xs text-slate-300 border border-navy-800">
                    <div className="text-slate-500">  17 | const razorpay = new Razorpay(&#123;</div>
                    <div className="text-amber-300 bg-amber-950/60 -mx-4 px-4 py-1">
                      &gt; 18 |   key_id: "rzp_live_TwViPC6y1nVhnu", key_secret: "[REDACTED_RAZORPAY_SECRET]"
                    </div>
                    <div className="text-slate-500">  19 | &#125;);</div>
                  </div>

                  {/* Compliance Badges */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700">Regulatory Impact:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">SOC 2: CC6.1</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">ISO 27001: A.8.24</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">PCI-DSS: Req 3.4</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-800">DPDP Act: Sec 8(5)</span>
                  </div>

                  {/* Remediation Checklist */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                    <p className="font-bold text-amber-950 mb-2">Actionable Remediation Checklist (Non-Invasive Advisory):</p>
                    <ul className="space-y-1.5 text-amber-900">
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <span>Revoke and regenerate this key pair immediately in the Razorpay Dashboard.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <span>Move credentials to server environment variables (<code className="bg-amber-100 px-1 rounded">process.env.RAZORPAY_KEY_SECRET</code>) or AWS Secrets Manager.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <span>Purge git commit history using BFG Repo-Cleaner or <code className="bg-amber-100 px-1 rounded">git-filter-repo</code> to remove the secret from branch history.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'owasp' && (
              <div>
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200 uppercase">
                      HIGH SEVERITY
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                      Shield 1: OWASP SAST
                    </span>
                    <span className="text-xs text-slate-500 font-mono">OWASP-SSRF-UNVALIDATED</span>
                  </div>
                  <span className="text-xs text-brand-600 font-mono font-medium">services/webhookProxy.ts:34</span>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <h4 className="text-base font-bold text-navy-950">Potential Server-Side Request Forgery (SSRF)</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      An HTTP request is dispatched using a user-controlled parameter without IP whitelisting or loopback restriction. An attacker can probe AWS IMDS metadata (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">169.254.169.254</code>) or internal VPC services.
                    </p>
                  </div>

                  {/* Redacted Code Snippet */}
                  <div className="bg-navy-950 rounded-xl p-4 font-mono text-xs text-slate-300 border border-navy-800">
                    <div className="text-slate-500">  33 | app.post('/fetch-preview', async (req, res) =&gt; &#123;</div>
                    <div className="text-amber-300 bg-amber-950/60 -mx-4 px-4 py-1">
                      &gt; 34 |   const response = await axios.get(req.body.targetUrl);
                    </div>
                    <div className="text-slate-500">  35 |   res.send(response.data);</div>
                  </div>

                  {/* Compliance Badges */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700">Regulatory Impact:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">OWASP Top 10: A10:2021</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">ISO 27001: A.8.20</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">CWE-918</span>
                  </div>

                  {/* Remediation Checklist */}
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                    <p className="font-bold text-blue-950 mb-2">Actionable Remediation Checklist (Non-Invasive Advisory):</p>
                    <ul className="space-y-1.5 text-blue-900">
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                        <span>Parse the input URL and enforce an allowlist of permitted domain hosts.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                        <span>Block resolution to private RFC 1918 subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) and AWS IMDS (169.254.169.254).</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                        <span>Set strict request timeout limits and disable HTTP redirect following.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'pqc' && (
              <div>
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200 uppercase">
                      HIGH SEVERITY
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                      Shield 2: Post-Quantum Discovery
                    </span>
                    <span className="text-xs text-slate-500 font-mono">PQC-PUB-RSA-KEYGEN</span>
                  </div>
                  <span className="text-xs text-brand-600 font-mono font-medium">src/auth/keyManager.ts:42</span>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <h4 className="text-base font-bold text-navy-950">RSA Key Pair Generation Detected</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Identified generation of classical RSA keys. Shor's algorithm computes prime factorization in polynomial time on a cryptanalytically relevant quantum computer (CRQC), breaking RSA entirely regardless of modulus bit length.
                    </p>
                  </div>

                  {/* Redacted Code Snippet */}
                  <div className="bg-navy-950 rounded-xl p-4 font-mono text-xs text-slate-300 border border-navy-800">
                    <div className="text-slate-500">  41 | export function initKeys() &#123;</div>
                    <div className="text-amber-300 bg-amber-950/60 -mx-4 px-4 py-1">
                      &gt; 42 |   const keyPair = crypto.generateKeyPairSync('rsa', &#123; modulusLength: 2048 &#125;);
                    </div>
                    <div className="text-slate-500">  43 |   return keyPair;</div>
                  </div>

                  {/* Compliance Badges */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700">Standards & Mandates:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">NIST FIPS 203 (ML-KEM)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">NIST FIPS 204 (ML-DSA)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">CNSA 2.0 Timeline</span>
                  </div>

                  {/* Remediation Checklist */}
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
                    <p className="font-bold text-purple-950 mb-2">Actionable Remediation Checklist (NIST Post-Quantum Roadmap):</p>
                    <ul className="space-y-1.5 text-purple-900">
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                        <span>For key exchange: Evaluate ML-KEM (Module-Lattice Key Encapsulation, FIPS 203) or deploy hybrid X25519 + ML-KEM-768.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                        <span>For digital signatures: Plan migration to ML-DSA (FIPS 204) or SLH-DSA (FIPS 205).</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                        <span>Audit key longevity: Identify whether decrypted historical data carries confidential value beyond 2030 (HNDL risk).</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS PIPELINE --- */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Automated Discovery Pipeline
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              How QuantumShield Scans & Analyzes Your Repositories
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              A 3-step deterministic workflow built for engineering speed, zero data leakage, and enterprise peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
                1
              </div>
              <h4 className="text-base font-bold text-navy-950 mb-2">Upload Source Code ZIP</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your repository archive. Archives are inspected strictly in-memory with hardened defenses against Zip Slip directory traversal and decompression bombs.
              </p>
            </div>

            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
                2
              </div>
              <h4 className="text-base font-bold text-navy-950 mb-2">Deterministic Dual-Shield Analysis</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Versioned rule catalogs inspect source code and manifests for secrets, OWASP vulnerabilities, broken TLS, PII, and classical vs post-quantum cryptographic primitives.
              </p>
            </div>

            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
                3
              </div>
              <h4 className="text-base font-bold text-navy-950 mb-2">Actionable Audit Reports</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive prioritized risk ratings, compliance standard mappings (SOC 2, ISO 27001, DPDP), non-invasive checklists, and downloadable executive PDF summaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SUPPORTED LANGUAGES & FRAMEWORKS --- */}
      <section id="capabilities" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Broad Stack Coverage
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Multi-Language SAST & Cryptographic Rules
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              QuantumShield inspects source code across all major enterprise stacks, web frameworks, and configuration environments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { lang: 'JavaScript & TypeScript', exts: '.js, .ts, .jsx, .tsx', apis: 'crypto, jsonwebtoken, express, axios, node-rsa' },
              { lang: 'Python', exts: '.py', apis: 'cryptography, requests, django, flask, pycryptodome' },
              { lang: 'Java & Kotlin', exts: '.java, .kt', apis: 'java.security.*, javax.crypto, Spring Security, BouncyCastle' },
              { lang: 'Go', exts: '.go', apis: 'crypto/rsa, crypto/ecdsa, crypto/tls, net/http, circl' },
              { lang: 'Rust', exts: '.rs', apis: 'ring, rsa, reqwest, ed25519-dalek, oqs' },
              { lang: 'PHP', exts: '.php', apis: 'openssl_pkey_new, curl, sodium, PDO' },
              { lang: 'Infrastructure & TLS', exts: '.conf, .yaml, .env, .json', apis: 'ciphers, rejectUnauthorized, ssl_protocols, sshd' },
              { lang: 'Dependency Manifests', exts: 'package.json, requirements.txt, go.mod, Cargo.toml', apis: 'Audit declared cryptographic dependencies' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors">
                <h4 className="text-xs font-bold text-navy-950 mb-1">{item.lang}</h4>
                <p className="text-[11px] font-mono text-brand-600 mb-1">{item.exts}</p>
                <p className="text-[11px] text-slate-500 leading-tight">{item.apis}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECURITY AND PRIVACY GUARANTEES --- */}
      <section id="security" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Enterprise Data Protection
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Our Security & Privacy Principles
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Engineered from the ground up to protect your intellectual property and confidential credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-950 mb-1">Zero Code Execution</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Uploaded archives are never executed or compiled. Build scripts, binaries, and dependencies are strictly ignored in memory.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-950 mb-1">Zip Slip & Bomb Defenses</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict path normalization and decompression ratio bounds protect against malicious directory traversal and resource exhaustion.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center mb-4">
                <EyeOff className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-950 mb-1">Automated Zero-Leak Masking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All cloud keys, passwords, bearer tokens, Aadhaar, and credit cards found in evidence snippets are permanently masked before storage.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-950 mb-1">Non-Invasive Advisory</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                QuantumShield never alters your source code or pushes automated pull requests. You retain 100% control over remediation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Predictable Enterprise Pricing
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Transparent Plans for Every Security Team
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Start free with full Dual-Shield scanning capabilities. Upgrade for higher project limits and executive PDF exports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
              <div>
                <h4 className="text-base font-bold text-navy-950">Free Community</h4>
                <p className="text-xs text-slate-500 mt-1">For independent developers & open source</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-navy-950">₹0</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>3 Projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>15 Scans / month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Dual-Shield Rule Catalog</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Zero-Leak Secret Masking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>JSON Report Export</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 w-full text-center py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Developer Tier */}
            <div className="bg-white rounded-2xl border-2 border-brand-600 p-6 flex flex-col justify-between shadow-lg relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                Most Popular
              </span>
              <div>
                <h4 className="text-base font-bold text-navy-950">Developer Pro</h4>
                <p className="text-xs text-slate-500 mt-1">For growing startups & engineering teams</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-navy-950">₹3,999</span>
                  <span className="text-xs text-slate-500"> / month</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">+ 18% GST applicable</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>10 Projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>75 Scans / month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Executive PDF Audit Reports</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Scan Comparison Tool</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>AI Security Advisory Engine</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 w-full text-center py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Team Tier */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
              <div>
                <h4 className="text-base font-bold text-navy-950">Team Security</h4>
                <p className="text-xs text-slate-500 mt-1">For multi-repo organizations</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-navy-950">₹15,999</span>
                  <span className="text-xs text-slate-500"> / month</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">+ 18% GST applicable</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>50 Projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>300 Scans / month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Multi-User Collaboration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>SOC 2 & ISO 27001 Mapping</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 w-full text-center py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
              >
                Start Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
              <div>
                <h4 className="text-base font-bold text-navy-950">Enterprise Shield</h4>
                <p className="text-xs text-slate-500 mt-1">For regulated banks, fintech & defense</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-navy-950">₹39,999</span>
                  <span className="text-xs text-slate-500"> / month</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">+ 18% GST applicable</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>500 Projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>5,000 Scans / month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Custom SAST Rules & Regex</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Dedicated Compliance SLA</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/contact"
                className="mt-6 w-full text-center py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          {/* Payment Trust & Tax Disclosure */}
          <div className="mt-8 p-4 bg-white rounded-xl border border-slate-200 text-center max-w-3xl mx-auto shadow-2xs">
            <p className="text-xs text-slate-700 font-medium">
              🇮🇳 All prices are billed in Indian National Rupees (INR). GST (18%) calculated at checkout.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Instant digital access upon authorization. Covered by our <strong>7-Day Satisfaction Guarantee</strong>. 
              Secure processing via <strong>Razorpay</strong> (UPI, RuPay, NetBanking, Visa, MasterCard).
            </p>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Frequently Asked Questions
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Clear Answers on Application & Quantum Security
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Why does QuantumShield cover both present-day AppSec and post-quantum cryptography?',
                a: 'Most enterprises cannot afford separate tools for everyday security and long-term quantum risk. By combining immediate threat detection (hardcoded secrets, OWASP vulnerabilities, broken TLS, and PII leaks) with NIST post-quantum migration discovery, your engineering team gains complete, unified code security coverage without multiple subscriptions.',
              },
              {
                q: 'Will QuantumShield modify our source code or create automated pull requests?',
                a: 'Never. In strict accordance with our Zero-Liability Non-Invasive Advisory Policy, QuantumShield operates in 100% read-only mode. We do not inject experimental AI code diffs that could break production or introduce subtle vulnerabilities. Instead, we provide plain-English root causes, step-by-step developer remediation checklists, and official documentation links so your team maintains full control.',
              },
              {
                q: 'How does QuantumShield ensure hardcoded secrets are not leaked during scanning?',
                a: 'Our built-in redaction engine runs before findings are written to the database or displayed in reports. AWS Access Keys, Razorpay Keys, Stripe Secrets, Bearer tokens, Aadhaar numbers, and Credit Cards are instantly masked with zero-leak placeholders (e.g. [REDACTED_RAZORPAY_SECRET]).',
              },
              {
                q: 'What compliance frameworks does QuantumShield support?',
                a: 'Every scan maps detected issues directly to major compliance standards: SOC 2 Type II (Trust Services Criteria CC6.1, CC6.6, CC6.7), ISO/IEC 27001:2022 (A.8.24 Use of Cryptography & A.8.12 Data Leakage Prevention), PCI-DSS v4.0 (Req 3.4 & Req 4.1), and India DPDP Act 2023 (Section 8(5)).',
              },
              {
                q: 'Which NIST post-quantum standards are referenced in findings?',
                a: 'QuantumShield is aligned with NIST\'s finalized August 2024 post-quantum standards: FIPS 203 for ML-KEM (Module-Lattice Key Encapsulation Mechanism), FIPS 204 for ML-DSA (Module-Lattice Digital Signatures), and FIPS 205 for SLH-DSA (Stateless Hash-Based Signatures).',
              },
              {
                q: 'Does QuantumShield execute or compile our source code during analysis?',
                a: 'No. All scans use deterministic static regex and Abstract Syntax Tree (AST) pattern recognition strictly inside isolated in-memory buffers. We never execute build scripts, compiler toolchains, or third-party package dependencies.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left font-bold text-sm text-navy-950 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Protect Your Applications Today. Prepare for Post-Quantum Tomorrow.
          </h2>
          <p className="mt-4 text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Audit your repositories for immediate threats and post-quantum vulnerabilities in under 60 seconds with 100% zero-tampering guarantee.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2 group"
            >
              <span>Scan Your Repository Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
