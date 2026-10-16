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
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-20 pb-24 overflow-hidden border-b border-navy-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-800/90 border border-navy-700 text-blue-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>NIST Finalized August 2024 Standards Aligned: FIPS 203, 204 & 205</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Prepare Your Codebase for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Post-Quantum Era</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            QuantumShield by <strong className="text-white font-semibold">Valmiki Softwares</strong> discovers cryptographic usage in your repositories, pinpoints "Harvest Now, Decrypt Later" migration risks, and outputs actionable PQC readiness reports.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3.5 rounded-lg text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
            >
              <span>Scan Your Repository Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#preview"
              className="w-full sm:w-auto bg-navy-800/80 hover:bg-navy-800 text-slate-200 border border-navy-700 font-semibold px-6 py-3.5 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>View Sample Readiness Report</span>
            </a>
          </div>

          {/* Key Trust Metrics */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-navy-800/80 text-left">
            <div className="p-3">
              <p className="text-2xl font-bold text-white">FIPS 203</p>
              <p className="text-xs text-slate-400 mt-0.5">ML-KEM Key Encapsulation</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-bold text-white">FIPS 204/205</p>
              <p className="text-xs text-slate-400 mt-0.5">ML-DSA & SLH-DSA Signatures</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-bold text-white">100% Deterministic</p>
              <p className="text-xs text-slate-400 mt-0.5">Traceable AST & Regex Rules</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-bold text-white">0% Execution</p>
              <p className="text-xs text-slate-400 mt-0.5">Isolated In-Memory Inspection</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY PQC NOW / THE THREAT --- */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Cryptographic Threat Landscape
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Why Post-Quantum Migration Cannot Wait
            </h3>
            <p className="text-sm text-slate-600 mt-3">
              When a cryptanalytically relevant quantum computer (CRQC) arrives, Shor's algorithm will compromise all classical public-key cryptography (RSA, ECDH, ECDSA).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-navy-950 mb-2">
                "Harvest Now, Decrypt Later" (HNDL)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adversaries are actively recording encrypted TLS, SSH, and VPN traffic today. Once quantum hardware is available, any session negotiated with RSA or ECDH can be decrypted retroactively.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-navy-950 mb-2">
                Digital Signature Forgery Risk
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Public keys derived from ECDSA or RSA can be factored on a CRQC to yield private signing keys, compromising root certificate authorities, code signatures, and firmware validity.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-navy-950 mb-2">
                NIST Final Standards Ready
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                NIST released the finalized FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA) standards in August 2024. Organizations can now migrate with stable cryptographic specifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Automated Discovery Pipeline
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              How QuantumShield Discovers & Assesses Codebases
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              A 3-step deterministic workflow built for developer ease and enterprise security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-navy-950 mb-2">Upload Source Code ZIP</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your repository ZIP or test suite. Archives are inspected strictly in memory with defense against Zip Slip path traversal and decompression bombs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-navy-950 mb-2">Deterministic Rule Inspection</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Versioned rule catalogs inspect source code and dependency manifests for RSA, ECC, ECDH, ECDSA, DH, TLS configs, and confirmed post-quantum implementations (ML-KEM, ML-DSA).
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-navy-950 mb-2">Actionable PQC Readiness Report</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive a prioritized readiness assessment, algorithm inventory, line-level evidence with redacted credentials, and downloadable JSON & executive PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SUPPORTED LANGUAGES & CAPABILITIES --- */}
      <section id="capabilities" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Language & Framework Coverage
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Multi-Language Detection Rules
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              QuantumShield inspects source code across all major enterprise stacks and configuration environments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { lang: 'JavaScript & TypeScript', exts: '.js, .ts, .jsx, .tsx', apis: 'crypto, jsonwebtoken, node-rsa, elliptic' },
              { lang: 'Python', exts: '.py', apis: 'cryptography (hazmat), pycryptodome, rsa' },
              { lang: 'Java & Kotlin', exts: '.java, .kt', apis: 'java.security.*, javax.crypto, BouncyCastle' },
              { lang: 'Go', exts: '.go', apis: 'crypto/rsa, crypto/ecdsa, crypto/tls, circl' },
              { lang: 'Rust', exts: '.rs', apis: 'ring, rsa, ed25519-dalek, oqs' },
              { lang: 'PHP', exts: '.php', apis: 'openssl_pkey_new, sodium' },
              { lang: 'Infrastructure & TLS', exts: '.conf, .yaml, .env', apis: 'ciphers, KexAlgorithms, sshd_config' },
              { lang: 'Dependency Manifests', exts: 'package.json, requirements.txt, go.mod, Cargo.toml', apis: 'Declared crypto dependencies' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <h4 className="text-xs font-bold text-navy-950 mb-1">{item.lang}</h4>
                <p className="text-[11px] font-mono text-brand-600 mb-1">{item.exts}</p>
                <p className="text-[11px] text-slate-500">{item.apis}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SAMPLE REPORT & FINDINGS PREVIEW --- */}
      <section id="preview" className="py-16 bg-navy-950 text-white border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
              Transparent Output Schema
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Sample Finding & Readiness Preview
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              Every security finding is traceable to exact file paths, line numbers, detection rules, and NIST migration steps.
            </p>
          </div>

          {/* Sample Card */}
          <div className="max-w-4xl mx-auto bg-navy-900 rounded-xl border border-navy-700 shadow-2xl overflow-hidden text-left">
            <div className="p-5 border-b border-navy-800 bg-navy-950/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-400 border border-orange-800 uppercase">
                  HIGH SEVERITY
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-navy-800 text-slate-300">
                  Confirmed Pattern Match
                </span>
                <span className="text-xs text-slate-400 font-mono">PQC-PUB-RSA-KEYGEN (v2024.1)</span>
              </div>
              <span className="text-xs text-blue-400 font-mono">src/auth/keyManager.ts:42</span>
            </div>

            <div className="p-6 space-y-4">
              <h4 className="text-base font-bold text-white">RSA Key Pair Generation Detected</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Identified generation of RSA key pairs. Shor's algorithm computes prime factorization in polynomial time on a cryptanalytically relevant quantum computer (CRQC), breaking RSA security entirely regardless of key size.
              </p>

              {/* Redacted Code Snippet */}
              <div className="bg-navy-950 rounded-lg p-3 font-mono text-xs text-slate-300 border border-navy-800">
                <div className="text-slate-500">  41 | export function initKeys() &#123;</div>
                <div className="text-amber-300 bg-amber-950/40 -mx-3 px-3 py-0.5">
                  &gt; 42 |   const keyPair = crypto.generateKeyPairSync('rsa', &#123; modulusLength: 2048 &#125;);
                </div>
                <div className="text-slate-500">  43 |   return keyPair;</div>
              </div>

              {/* Remediation */}
              <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-900 text-xs text-blue-200">
                <span className="font-bold text-white">Recommended Remediation: </span>
                For key establishment, plan migration to ML-KEM (NIST FIPS 203) or deploy hybrid key exchange (X25519 + ML-KEM-768). For digital signatures, evaluate ML-DSA (NIST FIPS 204) or SLH-DSA (NIST FIPS 205).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECURITY AND PRIVACY GUARANTEES --- */}
      <section id="security" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Enterprise Data Protection
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Our Security & Privacy Principles
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Engineered from day one with strict boundaries to safeguard your intellectual property.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-brand-600 flex items-center justify-center mb-3">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-navy-950 mb-1">Zero Code Execution</h4>
              <p className="text-xs text-slate-600">
                Uploaded archives are never executed or compiled. Build scripts and binaries are strictly ignored.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-brand-600 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-navy-950 mb-1">Zip Slip & Bomb Defenses</h4>
              <p className="text-xs text-slate-600">
                Strict path normalization and decompression ratio bounds protect against malicious directory traversal.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-brand-600 flex items-center justify-center mb-3">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-navy-950 mb-1">Automated Secret Redaction</h4>
              <p className="text-xs text-slate-600">
                Credentials, private key bodies, bearer tokens, and passwords in evidence snippets are masked before storage.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-brand-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-navy-950 mb-1">No Code Modification</h4>
              <p className="text-xs text-slate-600">
                QuantumShield never alters your source code. You retain full control over your migration timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Predictable Pricing
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Flexible Plans for Every Team
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Start free with full scanner rule capabilities. Upgrade for higher project limits and PDF exports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Free Tier */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h4 className="text-base font-bold text-navy-950">Free Community</h4>
                <p className="text-xs text-slate-500 mt-1">For open-source & developers</p>
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-navy-950">$0</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>3 Projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>15 Scans / month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Full NIST Rule Catalog</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>JSON Report Export</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 w-full text-center py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Developer Tier */}
            <div className="bg-white rounded-xl border-2 border-brand-600 p-6 flex flex-col justify-between shadow-md relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full">
                Most Popular
              </span>
              <div>
                <h4 className="text-base font-bold text-navy-950">Developer Pro</h4>
                <p className="text-xs text-slate-500 mt-1">For growing teams & startups</p>
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-navy-950">$49</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>10 Projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>75 Scans / month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Executive PDF Reports</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Scan Comparison Tool</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>AI Remediation Assistant</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 w-full text-center py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Team Tier */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h4 className="text-base font-bold text-navy-950">Team Security</h4>
                <p className="text-xs text-slate-500 mt-1">For multi-repo organizations</p>
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-navy-950">$199</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>50 Projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>300 Scans / month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Multi-User Collaboration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Audit Logs & Compliance</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 w-full text-center py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800"
              >
                Start Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h4 className="text-base font-bold text-navy-950">Enterprise Shield</h4>
                <p className="text-xs text-slate-500 mt-1">For regulated industries</p>
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-navy-950">$999</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>500 Projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>5,000 Scans / month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Custom Scanning Rules</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Dedicated Support & SLA</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 w-full text-center py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Frequently Asked Questions
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              Clear Answers on Post-Quantum Security
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Does QuantumShield execute our code during the scan?',
                a: 'Never. QuantumShield performs strictly static regex and AST pattern inspection within isolated memory buffers. No compiler, interpreter, build scripts, or dependencies are invoked.',
              },
              {
                q: 'What is the "Harvest Now, Decrypt Later" (HNDL) threat?',
                a: 'Hostile nation-states and cyber threat actors are actively intercepting and storing encrypted network traffic today. Once large-scale quantum computers become operational, they will compute classical private keys via Shor\'s algorithm and decrypt all previously harvested confidential communications.',
              },
              {
                q: 'Does QuantumShield claim that our codebase is guaranteed quantum-safe?',
                a: 'No. In accordance with our security principles, QuantumShield provides readiness assessments, not mathematically formal proofs. Quantum security depends on protocol integration, entropy sources, key management, and future hardware advancements.',
              },
              {
                q: 'Which NIST standards does QuantumShield reference in its findings?',
                a: 'QuantumShield is aligned with the final August 2024 NIST standards: FIPS 203 for ML-KEM (Module-Lattice Key Encapsulation), FIPS 204 for ML-DSA (Module-Lattice Signatures), and FIPS 205 for SLH-DSA (Stateless Hash-Based Signatures).',
              },
              {
                q: 'How does the AI Cryptography Assistant work without exposing secrets?',
                a: 'All private keys, passwords, bearer tokens, and API credentials in code evidence lines are masked with [REDACTED_SECRET] before any processing. If an AI provider is enabled, only redacted contextual snippets are sent, and the platform functions reliably even without an AI API key using our built-in expert engine.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg overflow-hidden transition-colors"
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
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Take Control of Your Post-Quantum Security Posture
          </h2>
          <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto">
            Audit your cryptographic footprint today and ensure your software is ready for the post-quantum transition.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3.5 rounded-lg text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
            >
              <span>Get Started with QuantumShield</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
