import React from 'react';
import {
  X,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Key,
  Lock,
  Cpu,
  Archive,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LaymanGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 text-white flex items-center justify-between border-b border-navy-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Quantum Security Explained in Plain English
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                No math degree required. Everything you need to know about the quantum threat.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          {/* Card 1: The Basics */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-2 text-navy-950 font-bold text-base mb-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span>1. What is a Quantum Computer? (The Maze Analogy)</span>
            </div>
            <p className="text-slate-600">
              Imagine you are trying to solve a giant maze:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
              <li>
                <strong className="text-slate-800">Your regular computer</strong> is like a person walking down one hallway at a time. If they hit a dead end, they walk all the way back and try the next one. This takes trillions of years to guess strong encryption passwords.
              </li>
              <li>
                <strong className="text-slate-800">A quantum computer</strong> is like water poured into the maze. It floods <em>every single hallway simultaneously</em>, finding the exit in minutes.
              </li>
            </ul>
          </div>

          {/* Card 2: Why are our locks broken? */}
          <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center space-x-2 text-amber-950 font-bold text-base mb-2">
              <Lock className="w-5 h-5 text-amber-600" />
              <span>2. Why are Today's Locks at Risk?</span>
            </div>
            <p className="text-slate-600">
              Almost all secure internet connections today (HTTPS, SSH, VPNs, banking apps) use locks called <strong className="text-slate-800">RSA</strong> and <strong className="text-slate-800">ECC</strong>.
            </p>
            <p className="mt-2 text-slate-600">
              These locks rely on multiplying massive prime numbers together. Regular computers cannot reverse this math. But a quantum computer running a famous formula called <strong>Shor's Algorithm</strong> can easily unpick these locks in seconds.
            </p>
          </div>

          {/* Card 3: The Big Danger: Harvest Now, Decrypt Later */}
          <div className="p-5 rounded-xl bg-red-50/60 border border-red-200">
            <div className="flex items-center space-x-2 text-red-950 font-bold text-base mb-2">
              <Archive className="w-5 h-5 text-red-600" />
              <span>3. "Harvest Now, Decrypt Later" (HNDL) — Why You Must Care Today</span>
            </div>
            <p className="text-slate-600">
              You might think: <em>"Quantum computers aren't here today, so why worry?"</em>
            </p>
            <p className="mt-2 text-slate-600">
              Cyber criminals and nation-states are currently recording encrypted network traffic and stealing encrypted customer data today. They store this locked data in huge data centers. When their quantum computers come online in a few years, they will open all those stolen safes like cracking an egg.
            </p>
            <div className="mt-3 p-3 bg-red-100/70 rounded-lg text-xs font-medium text-red-900">
              💡 <strong>Bottom Line:</strong> If your company's data must remain confidential for 5 to 10 years (medical records, financial data, intellectual property), it is already at risk right now.
            </div>
          </div>

          {/* Card 4: The Solution: Post-Quantum Cryptography (PQC) */}
          <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center space-x-2 text-emerald-950 font-bold text-base mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>4. The Solution: Post-Quantum Cryptography (PQC)</span>
            </div>
            <p className="text-slate-600">
              World security scientists at <strong>NIST (the U.S. National Institute of Standards and Technology)</strong> spent nearly a decade creating brand new locks that quantum computers <em>cannot</em> crack:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-sm">
                <p className="font-semibold text-emerald-900 text-xs uppercase tracking-wide">FIPS 203: ML-KEM</p>
                <p className="text-xs text-slate-600 mt-1">
                  The new master lock for encrypting communications and data in transit. Built from multi-dimensional mathematical lattices.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-sm">
                <p className="font-semibold text-emerald-900 text-xs uppercase tracking-wide">FIPS 204: ML-DSA</p>
                <p className="text-xs text-slate-600 mt-1">
                  The new digital wax seal for identity and signatures. Ensures nobody can forge software updates or pretend to be you.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: What QuantumShield Does */}
          <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center space-x-2 text-blue-950 font-bold text-base mb-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>5. Where QuantumShield Fits In</span>
            </div>
            <p className="text-slate-600">
              Software applications have thousands of files and dependencies. It is nearly impossible for developers to manually find every piece of vulnerable cryptography.
            </p>
            <p className="mt-2 text-slate-600">
              <strong>QuantumShield is your automated security x-ray:</strong>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs">
              <div className="p-2.5 bg-white rounded border border-blue-100">
                <strong className="block text-slate-900 mb-0.5">1. Scan & Find</strong>
                Detects all old RSA, ECC, Diffie-Hellman locks hidden in your code and config.
              </div>
              <div className="p-2.5 bg-white rounded border border-blue-100">
                <strong className="block text-slate-900 mb-0.5">2. Score & Prioritize</strong>
                Gives you a 0–100 Readiness Score and flags urgent Harvest-Now risks.
              </div>
              <div className="p-2.5 bg-white rounded border border-blue-100">
                <strong className="block text-slate-900 mb-0.5">3. Step-by-Step Fixes</strong>
                Provides exact code replacements and NIST-approved libraries to upgrade safely.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            QuantumShield by Valmiki Softwares • Ready for NIST FIPS 203/204/205
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
