import React, { useState } from 'react';
import { PageView } from '../types';
import { BRAND_CONFIG, LEGAL_TEXTS } from '../data/websiteContent';
import { Trash2, AlertTriangle, CheckCircle, ShieldCheck, Mail, Copy, Check } from 'lucide-react';

interface AccountDeletionSectionProps {
  onNavigate?: (view: PageView) => void;
  isStandalonePage?: boolean;
}

export const AccountDeletionSection: React.FC<AccountDeletionSectionProps> = ({
  isStandalonePage = false,
}) => {
  const HeadingTag = isStandalonePage ? 'h1' : 'h2';
  const SubHeadingTag = isStandalonePage ? 'h2' : 'h3';
  const [accountEmail, setAccountEmail] = useState('');
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('Personal choice / no longer using platform');
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const deletionTemplate = `ACCOUNT DELETION REQUEST - SKILLCONNECT
--------------------------------------------------
To: Founder Abhishek Singh (${BRAND_CONFIG.founderEmail})
Date: ${new Date().toISOString()}

Registered Email: ${accountEmail}
Username / Profile Handle: ${username || 'Not specified'}
Reason for Deletion: ${reason}

Request Statement:
"I hereby explicitly request the permanent deletion of my SkillConnect account and all associated personal data, authentication credentials, earned badges, and portfolio artifacts in accordance with GDPR Article 17 and Google Play User Data Policy."
--------------------------------------------------`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail)) {
      setStatusMessage('Please enter a valid registered email address.');
      return;
    }
    if (!confirmedCheck) {
      setStatusMessage('Please check the confirmation box acknowledging permanent data deletion.');
      return;
    }

    const mailto = `mailto:${BRAND_CONFIG.founderEmail}?subject=${encodeURIComponent(
      `[SkillConnect Account Deletion Request] ${accountEmail}`
    )}&body=${encodeURIComponent(deletionTemplate)}`;

    window.location.href = mailto;
    setStatusMessage('Deletion request mail dispatched. Please send the pre-filled email from your registered email account to verify ownership.');
  };

  const handleCopy = () => {
    if (!accountEmail) {
      setStatusMessage('Please enter your account email before copying.');
      return;
    }
    navigator.clipboard.writeText(deletionTemplate).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            User Rights & Compliance
          </div>
          <HeadingTag className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Account & Data Deletion
          </HeadingTag>
          <p className="text-base text-slate-300 mt-4 leading-relaxed">
            {LEGAL_TEXTS.accountDeletion.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Deletion Form */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-rose-500/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <SubHeadingTag className="text-base font-bold text-white">Submit Deletion Request</SubHeadingTag>
                <p className="text-xs text-slate-300">Permanent and irreversible removal</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="deletion-account-email" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Account Email Address <span className="text-rose-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="deletion-account-email"
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder="your-registered-email@domain.com"
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="deletion-username" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Username or Profile Handle (Optional)
                </label>
                <input
                  id="deletion-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. rahul_dev"
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div>
                <label htmlFor="deletion-reason" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Reason for Deletion
                </label>
                <select
                  id="deletion-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="Personal choice / no longer using platform">Personal choice / no longer using platform</option>
                  <option value="Privacy concerns">Privacy concerns</option>
                  <option value="Creating a new account">Creating a new account</option>
                  <option value="Other / Unspecified">Other / Unspecified</option>
                </select>
              </div>

              <div className="pt-2">
                <label htmlFor="deletion-confirm-check" className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    id="deletion-confirm-check"
                    type="checkbox"
                    checked={confirmedCheck}
                    onChange={(e) => setConfirmedCheck(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-400 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I understand that this action is permanent. All profile information, peer endorsements, badges, and communication records will be permanently erased.
                  </span>
                </label>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>Send Deletion Request</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-slate-200 glass-card hover:text-white hover:border-rose-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  <span>{copied ? 'Copied Request' : 'Copy Request'}</span>
                </button>
              </div>

              {statusMessage && (
                <div role="status" className="p-3 bg-slate-900 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Exact Regulatory Disclosure */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
              <SubHeadingTag className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>What Happens During Deletion</span>
              </SubHeadingTag>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                SkillConnect guarantees that all records tied to your identity are erased in accordance with global data protection statutes:
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                {LEGAL_TEXTS.accountDeletion.whatIsDeleted.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-200 block mb-0.5">Erasure Timeline:</strong>
                  {LEGAL_TEXTS.accountDeletion.retentionTimeframe}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 text-xs text-slate-400">
              <strong className="text-white block mb-1">Direct Manual Escalation</strong>
              Users can also email founder Abhishek Singh directly at <span className="text-cyan-300 font-mono">{BRAND_CONFIG.founderEmail}</span> from their registered email with the subject line <code>"DELETE MY SKILLCONNECT ACCOUNT"</code>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
