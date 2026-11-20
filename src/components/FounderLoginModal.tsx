import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import {
  X,
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  LogOut,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  HelpCircle,
  MailCheck,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { BRAND_CONFIG } from '../data/websiteContent';
import { requestFounderPasswordReset } from '../lib/firebase';

interface FounderLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDashboard: () => void;
}

export const FounderLoginModal: React.FC<FounderLoginModalProps> = ({
  isOpen,
  onClose,
  onOpenDashboard,
}) => {
  const {
    user,
    founderUserId,
    isFounderAuthorized,
    authChecking,
    authError,
    clearAuthError,
    signInAsFounder,
    signOutFounder,
  } = useCMS();

  const [inputFounderId, setInputFounderId] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleFounderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setResetFeedback(null);
    const ok = await signInAsFounder(inputFounderId, inputPassword);
    if (ok) {
      setInputPassword('');
      onClose();
      onOpenDashboard();
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setResetFeedback(null);
    setResetBusy(true);
    try {
      const recoveryEmail = await requestFounderPasswordReset(inputFounderId);
      setResetFeedback({
        type: 'success',
        text: `Founder password recovery verified through Firebase Auth for ${recoveryEmail}. Check your verified Founder recovery inbox or contact Firebase Admin console.`,
      });
    } catch (err) {
      setResetFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Unable to process password recovery request.',
      });
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030612]/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="founder-login-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="glass-card w-full max-w-md rounded-3xl p-6 sm:p-8 border border-cyan-500/35 shadow-[0_0_60px_rgba(0,242,254,0.22)] relative overflow-hidden"
          >
            {/* Ambient animated top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" />

            {/* Header with Original SkillConnect Logo */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_18px_rgba(0,242,254,0.3)] shrink-0">
                  <img
                    src={BRAND_CONFIG.logoPath}
                    alt="SkillConnect Official Logo"
                    width="44"
                    height="44"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
                    SkillConnect Security Gate
                  </span>
                  <h2 id="founder-login-modal-title" className="text-lg font-extrabold text-white tracking-tight">
                    Founder CMS Control Panel
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl glass-panel cursor-pointer transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {isFounderAuthorized && user ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-white">Verified Founder Session Active</div>
                    <div className="text-emerald-300 font-mono mt-0.5">
                      Founder ID: {founderUserId}
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      Your Founder identity and administrative privileges are verified via Firebase Authentication and Firestore Security Rules.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDashboard();
                    }}
                    className="w-full py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-[0_0_25px_rgba(0,242,254,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Open Founder CMS Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={async () => {
                      await signOutFounder();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider text-rose-300 glass-panel hover:border-rose-500/40 hover:text-rose-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Founder Session</span>
                  </button>
                </div>
              </motion.div>
            ) : forgotMode ? (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                onSubmit={handlePasswordRecovery}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Founder Password Recovery</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Enter your authorized Founder User ID or official Founder email to initiate Firebase Authentication password reset verification.
                  </p>
                </div>

                {resetFeedback && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      resetFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    {resetFeedback.type === 'success' ? (
                      <MailCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{resetFeedback.text}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="founder-recovery-id-input"
                    className="block text-xs font-semibold text-slate-200 mb-1.5"
                  >
                    Founder User ID or Email
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="founder-recovery-id-input"
                      type="text"
                      required
                      value={inputFounderId}
                      onChange={(e) => {
                        setResetFeedback(null);
                        setInputFounderId(e.target.value);
                      }}
                      placeholder="Enter Founder User ID or Email"
                      disabled={resetBusy}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetBusy || !inputFounderId.trim()}
                  className="w-full py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {resetBusy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Recovery...</span>
                    </>
                  ) : (
                    <>
                      <MailCheck className="w-4 h-4" />
                      <span>Verify & Send Recovery</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setResetFeedback(null);
                  }}
                  className="w-full py-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  ← Back to Founder Login
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 14 }}
                onSubmit={handleFounderSubmit}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Restricted Founder Authentication</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Enter your authorized SkillConnect Founder User ID (or Email) and Password to unlock the Website Control Panel. Public registration is disabled.
                  </p>
                </div>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-rose-300 mb-0.5">Authentication Rejected</strong>
                      <span>{authError}</span>
                    </div>
                  </motion.div>
                )}

                {/* Input 1: Founder User ID / Email */}
                <div>
                  <label
                    htmlFor="founder-user-id-input"
                    className="block text-xs font-semibold text-slate-200 mb-1.5"
                  >
                    Founder User ID / Email
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="founder-user-id-input"
                      type="text"
                      autoComplete="username"
                      required
                      value={inputFounderId}
                      onChange={(e) => {
                        if (authError) clearAuthError();
                        setInputFounderId(e.target.value);
                      }}
                      placeholder="Enter Founder User ID"
                      disabled={authChecking}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Input 2: Password with Show/Hide Option & Forgot Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="founder-password-input"
                      className="block text-xs font-semibold text-slate-200"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        clearAuthError();
                        setResetFeedback(null);
                        setForgotMode(true);
                      }}
                      className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="founder-password-input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={inputPassword}
                      onChange={(e) => {
                        if (authError) clearAuthError();
                        setInputPassword(e.target.value);
                      }}
                      placeholder="Enter Founder Password"
                      disabled={authChecking}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* LOGIN AS FOUNDER Button */}
                <button
                  type="submit"
                  disabled={authChecking || !inputFounderId.trim() || !inputPassword}
                  className="w-full py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-[0_0_25px_rgba(0,242,254,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {authChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Verifying Founder Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                      <span>LOGIN AS FOUNDER</span>
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>Firebase Auth + Backend Rules</span>
                  </span>
                  <span className="font-mono text-slate-400">Protected CMS Gate</span>
                </div>
              </motion.form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </MotionConfig>
  );
};
