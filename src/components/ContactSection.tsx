import React, { useState } from 'react';
import { PageView } from '../types';
import { BRAND_CONFIG } from '../data/websiteContent';
import { useCMS } from '../context/CMSContext';
import { Mail, User, Send, Copy, Check, AlertCircle, MessageSquare, ShieldCheck, Instagram, Database, Loader2 } from 'lucide-react';
import { submitContactInquiry } from '../services/firestoreService';

interface ContactSectionProps {
  onNavigate?: (view: PageView) => void;
  isStandalonePage?: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  isStandalonePage = false,
}) => {
  const HeadingTag = isStandalonePage ? 'h1' : 'h2';
  const SubHeadingTag = isStandalonePage ? 'h2' : 'h3';
  const { activeConfig } = useCMS();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [copied, setCopied] = useState(false);
  const [dispatchTriggered, setDispatchTriggered] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'Please enter your full name.';
    if (!email.trim()) {
      newErrors.email = 'Please provide an email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!subject.trim()) newErrors.subject = 'Please specify a subject.';
    if (!message.trim() || message.trim().length < 10) {
      newErrors.message = 'Please provide a message with at least 10 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formattedMessage = `Sender: ${fullName}
Email: ${email}
Subject: ${subject}
Date: ${new Date().toISOString()}

Message:
${message}

---
Sent via SkillConnect Official Web Portal (skillconnectofficial.cloud.run)
Recipient: Founder & Developer Abhishek Singh (${activeConfig.contact.founderEmail})`;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitContactInquiry({
        fullName,
        email,
        subject,
        message,
      });
      setSavedToDb(true);
    } catch (err) {
      console.warn('Inquiry Firestore sync notice:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Construct mailto URL to founder
    const mailtoUrl = `mailto:${activeConfig.contact.founderEmail}?subject=${encodeURIComponent(
      `[SkillConnect Inquiry] ${subject}`
    )}&body=${encodeURIComponent(
      `Hi Abhishek,\n\nName: ${fullName}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent via SkillConnect Official Portal`
    )}`;

    window.location.href = mailtoUrl;
    setDispatchTriggered(true);
  };

  const handleCopyClipboard = () => {
    if (!validate()) return;
    navigator.clipboard.writeText(formattedMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Direct Communication
          </div>
          <HeadingTag className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {activeConfig.contact.contactHeading}
          </HeadingTag>
          <p className="text-base text-slate-300 mt-4 leading-relaxed">
            {activeConfig.contact.contactSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Verified Contact Form */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 shadow-2xl">
            <SubHeadingTag className="text-lg font-bold text-white mb-2">Send an Inquiry</SubHeadingTag>
            <p className="text-xs text-slate-300 mb-6">
              Fill in your details below. You can dispatch directly through your default mail client or copy the formatted text.
            </p>

            <form onSubmit={handleSendEmail} noValidate className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="contact-full-name" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Full Name <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <User aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="contact-full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'contact-full-name-error' : undefined}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
                {errors.fullName && (
                  <p id="contact-full-name-error" role="alert" className="text-[11px] text-rose-300 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Your Email Address <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
                {errors.email && (
                  <p id="contact-email-error" role="alert" className="text-[11px] text-rose-300 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Subject <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Partnership inquiry / Platform beta question"
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
                {errors.subject && (
                  <p id="contact-subject-error" role="alert" className="text-[11px] text-rose-300 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Your Message <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry, feedback, or collaboration interest..."
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-y"
                />
                {errors.message && (
                  <p id="contact-message-error" role="alert" className="text-[11px] text-rose-300 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Syncing & Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Send Inquiry</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  className="px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-slate-200 glass-card hover:text-white hover:border-cyan-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Message Text'}</span>
                </button>
              </div>

              {savedToDb && (
                <div role="status" className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Inquiry secured in SkillConnect Cloud Firestore (<strong className="text-white">global-capsule-zbcxw</strong>) and queued for verification.
                  </span>
                </div>
              )}

              {dispatchTriggered && (
                <div role="status" className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Your email client was triggered with your prefilled inquiry addressed to Abhishek Singh (<strong className="text-white">{activeConfig.contact.founderEmail}</strong>). If your mail application did not open automatically, click <strong>"Copy Message Text"</strong> and send it directly.
                  </span>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Founder Direct Coordinates & Response SLA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20">
              <SubHeadingTag className="text-base font-bold text-white mb-2">Direct Founder Contact</SubHeadingTag>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                SkillConnect is currently in active pre-launch engineering. Abhishek Singh personally reviews and answers all legitimate correspondence.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Official Email Address
                    </span>
                    <a
                      href={`mailto:${activeConfig.contact.founderEmail}`}
                      className="text-white hover:text-cyan-300 font-mono text-xs transition-colors"
                    >
                      {activeConfig.contact.founderEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <User className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Lead Contact & Role
                    </span>
                    <span className="text-white font-medium">
                      {BRAND_CONFIG.founder} · {BRAND_CONFIG.founderRole}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <Instagram className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Official Platform Instagram
                    </span>
                    <a
                      href={activeConfig.contact.platformInstagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-pink-300 font-mono text-xs transition-colors inline-flex items-center gap-1"
                    >
                      @skillconnectofficiall
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <Instagram className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Founder & Developer Instagram
                    </span>
                    <a
                      href={activeConfig.contact.founderInstagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-pink-300 font-mono text-xs transition-colors inline-flex items-center gap-1"
                    >
                      {activeConfig.contact.founderInstagramHandle}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Expected Response SLA
                    </span>
                    <span className="text-slate-300">
                      {activeConfig.contact.responseSla}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zero Fake Submission Guarantee */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 text-xs text-slate-400">
              <strong className="text-slate-200 block mb-1">Authentic Communication Architecture</strong>
              Unlike templates that display simulated "Thank you!" messages into a void, SkillConnect connects you directly to the engineer behind the platform.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
