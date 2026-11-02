import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Send,
  CheckCircle2,
  Building,
  UserCheck,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate inquiry dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-semibold mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>Official Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
            Contact Valmiki Softwares
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Have questions about QuantumShield scanning, enterprise NIST PQC migration blueprints, or your billing account? Our technical and compliance team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Business Details & Official Disclosures */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-navy-950 flex items-center space-x-2 border-b border-slate-100 pb-4">
                <Building className="w-5 h-5 text-brand-600" />
                <span>Corporate Contact Information</span>
              </h2>

              {/* Legal Entity */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Legal Business Entity</h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">Valmiki Softwares</p>
                  <p className="text-[11px] text-slate-400">Owner & Operator of quantumshieldscan.com</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Registered Office Address</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    502, Vigneshwara towers, thatithopu,<br />
                    Tirupati, Andhra Pradesh, 517501, India
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Customer Helpline & Phone</h3>
                  <a href="tel:+917901019249" className="text-xs text-brand-600 hover:underline font-semibold block mt-0.5">
                    +91 7901019249
                  </a>
                  <p className="text-[11px] text-slate-400">Available via Call & WhatsApp Support</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Official Support Email</h3>
                  <a href="mailto:support@quantumshieldscan.com" className="text-xs text-brand-600 hover:underline font-semibold block mt-0.5">
                    support@quantumshieldscan.com
                  </a>
                  <p className="text-[11px] text-slate-400">Average response time: &lt; 4 hours</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Working Operating Hours</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Monday to Friday: 9:30 AM – 6:30 PM IST<br />
                    Saturday: 10:00 AM – 2:00 PM IST (Emergency Support)
                  </p>
                </div>
              </div>
            </div>

            {/* Grievance Redressal Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-navy-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>Grievance Redressal Mechanism</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                As required by the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:
              </p>
              <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-navy-800">
                <p><strong>Grievance Officer:</strong> Dinesh Valmiki</p>
                <p><strong>Email:</strong> support@quantumshieldscan.com</p>
                <p><strong>Address:</strong> 502, Vigneshwara towers, thatithopu, Tirupati, 517501, India</p>
                <p><strong>Redressal Turnaround:</strong> Acknowledged within 24 hours; resolved within 15 days.</p>
              </div>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
              <h2 className="text-lg font-bold text-navy-950 mb-2">Send Us an Inquiry</h2>
              <p className="text-xs text-slate-500 mb-6">
                Fill out the form below and an engineer will reply directly to your email.
              </p>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="font-bold">Thank you for contacting us!</strong>
                    <p className="mt-0.5">Your message has been received. Our team will get back to you shortly at your email.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul@company.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Enterprise Custom Scan Rules or Billing Question"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please provide details about your repository stack, team size, or specific inquiry..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <span>Submit Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default ContactPage;

