import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, ShieldCheck, AlertCircle, Mail, User, Database, Loader2 } from 'lucide-react';
import { BRAND_CONFIG, generateCustomerReport } from '../data/websiteContent';
import { submitActivityReport } from '../services/firestoreService';

export interface CustomerModalConfig {
  isOpen: boolean;
  actionType: string;
  targetFeature?: string;
  defaultDetails?: string;
}

interface CustomerActivityModalProps {
  config: CustomerModalConfig;
  onClose: () => void;
}

export const CustomerActivityModal: React.FC<CustomerActivityModalProps> = ({ config, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (config.isOpen) {
      setDetails(config.defaultDetails || '');
      setDispatched(false);
      setSavedToDb(false);
      setIsSubmitting(false);
      setCopied(false);
      setErrors({});
    }
  }, [config]);

  useEffect(() => {
    if (!config.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.isOpen, onClose]);

  if (!config.isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!customerName.trim()) errs.name = 'Please provide your full name.';
    if (!customerEmail.trim()) {
      errs.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!details.trim() || details.trim().length < 5) {
      errs.details = 'Please provide brief details of your request (at least 5 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitActivityReport({
        actionType: config.actionType,
        targetFeature: config.targetFeature,
        customerName,
        customerEmail,
        details,
      });
      setSavedToDb(true);
    } catch (err) {
      console.warn('Activity report Firestore sync notice:', err);
    } finally {
      setIsSubmitting(false);
    }

    const report = generateCustomerReport({
      actionType: config.actionType,
      targetFeature: config.targetFeature,
      customerName,
      customerEmail,
      details,
    });

    window.location.href = report.mailtoUrl;
    setDispatched(true);
  };

  const handleCopyReport = () => {
    if (!validate()) return;
    const report = generateCustomerReport({
      actionType: config.actionType,
      targetFeature: config.targetFeature,
      customerName,
      customerEmail,
      details,
    });

    navigator.clipboard.writeText(report.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-modal-title"
    >
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,242,254,0.2)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
              SkillConnect Live Activity Dispatch
            </span>
            <h2 id="customer-modal-title" className="text-lg font-bold text-white tracking-tight">
              {config.actionType}
            </h2>
            {config.targetFeature && (
              <p className="text-xs text-slate-400 mt-0.5">
                Module: <strong className="text-slate-200">{config.targetFeature}</strong>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white rounded-lg glass-panel cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSendReport} className="space-y-4 text-xs" noValidate>
          <div>
            <label htmlFor="customer-modal-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Full Name <span className="text-cyan-400" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input
                id="customer-modal-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'customer-modal-name-error' : undefined}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
            {errors.name && (
              <p id="customer-modal-name-error" role="alert" className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="customer-modal-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Email Address <span className="text-cyan-400" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input
                id="customer-modal-email"
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="you@domain.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'customer-modal-email-error' : undefined}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
            {errors.email && (
              <p id="customer-modal-email-error" role="alert" className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="customer-modal-details" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Request &amp; Collaboration Details <span className="text-cyan-400" aria-hidden="true">*</span>
            </label>
            <textarea
              id="customer-modal-details"
              rows={4}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what you want to achieve, your offered skills, or questions for Abhishek Singh..."
              aria-invalid={Boolean(errors.details)}
              aria-describedby={errors.details ? 'customer-modal-details-error' : undefined}
              className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-y"
            />
            {errors.details && (
              <p id="customer-modal-details-error" role="alert" className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors.details}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-slate-300 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-cyan-400 inline mr-1 -mt-0.5" />
            This report is dispatched directly to Founder & Developer Abhishek Singh at{' '}
            <strong className="text-white font-mono">{BRAND_CONFIG.founderEmail}</strong>.
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing to Firestore...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Report to Abhishek</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyReport}
              className="px-4 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-slate-200 glass-card hover:text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {savedToDb && (
            <div role="status" className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Report registered into SkillConnect Cloud Firestore (<strong className="text-white">global-capsule-zbcxw</strong>) successfully.
              </span>
            </div>
          )}

          {dispatched && (
            <div role="status" className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200">
              Your request was packaged into an official customer activity report and your email client was opened. Abhishek Singh will follow up with you directly.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
