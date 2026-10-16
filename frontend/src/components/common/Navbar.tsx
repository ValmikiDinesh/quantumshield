import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-navy-950/95 backdrop-blur-md border-b border-navy-800 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:bg-brand-500 transition-colors">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">QuantumShield</span>
                <span className="text-[10px] bg-navy-800 text-blue-300 px-1.5 py-0.5 rounded border border-navy-700">PQC</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">by Valmiki Softwares</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Supported Languages</a>
            <a href="#preview" className="hover:text-white transition-colors">Sample Report</a>
            <a href="#security" className="hover:text-white transition-colors">Security & Privacy</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link
                to="/app"
                className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 shadow-sm"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 transition-colors flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900 border-b border-navy-800 px-4 pt-3 pb-6 space-y-3">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white text-base py-2 font-medium"
          >
            How It Works
          </a>
          <a
            href="#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white text-base py-2 font-medium"
          >
            Supported Languages
          </a>
          <a
            href="#preview"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white text-base py-2 font-medium"
          >
            Sample Report
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white text-base py-2 font-medium"
          >
            Security & Privacy
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white text-base py-2 font-medium"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white text-base py-2 font-medium"
          >
            FAQ
          </a>
          <div className="pt-4 border-t border-navy-800 space-y-2">
            {user ? (
              <Link
                to="/app"
                className="w-full bg-brand-600 text-white text-center py-2.5 rounded-lg text-sm font-semibold block"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full bg-navy-800 text-slate-200 text-center py-2.5 rounded-lg text-sm font-medium block"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full bg-brand-600 text-white text-center py-2.5 rounded-lg text-sm font-semibold block"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
