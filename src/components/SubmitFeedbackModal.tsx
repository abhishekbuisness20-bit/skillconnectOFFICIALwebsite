import React, { useState, useEffect } from 'react';
import { X, Check, Star, AlertCircle, MessageSquare, User, MapPin, Briefcase, Loader2, Database } from 'lucide-react';
import { submitCommunityFeedback } from '../services/firestoreService';

interface SubmitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [testerName, setTesterName] = useState('');
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<'trades' | 'tech' | 'mentorship' | 'general'>('tech');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!testerName.trim() || testerName.trim().length < 2) {
      errs.testerName = 'Please enter your full name (at least 2 characters).';
    }
    if (!role.trim() || role.trim().length < 2) {
      errs.role = 'Please specify your profession or role (e.g. Electrician, React Developer, Student).';
    }
    if (!city.trim() || city.trim().length < 2) {
      errs.city = 'Please provide your city in India.';
    }
    if (!comment.trim() || comment.trim().length < 10) {
      errs.comment = 'Feedback must be at least 10 characters long.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitCommunityFeedback({
        testerName: testerName.trim(),
        role: role.trim(),
        city: city.trim(),
        category,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Feedback submission error:', err);
      setErrors({ form: 'Unable to submit feedback right now. Please check your connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setTesterName('');
    setRole('');
    setCity('');
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,242,254,0.2)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
              SkillConnect Community Voice
            </span>
            <h2 id="feedback-modal-title" className="text-lg font-bold text-white tracking-tight">
              Share Your Pre-Launch Feedback
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Help Abhishek Singh and the team calibrate platform performance ahead of the 8 Nov 2026 launch.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg glass-panel cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-4 py-4 text-center" role="status">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Check className="w-7 h-7" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-white">Feedback Submitted Successfully!</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              Your testimonial has been committed to SkillConnect Cloud Firestore (<strong className="text-cyan-400">global-capsule-zbcxw</strong>) under verification review. Abhishek Singh and the moderation team review all community contributions.
            </p>
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-xs text-cyan-200 flex items-center justify-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>Status: Pending Review & Verification</span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs" noValidate>
            {errors.form && (
              <div role="alert" className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Tester Name */}
            <div>
              <label htmlFor="feedback-tester-name" className="block text-slate-300 font-semibold mb-1">
                Your Full Name <span className="text-cyan-400" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                <input
                  id="feedback-tester-name"
                  type="text"
                  required
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                  placeholder="e.g. Arvind Mishra"
                  aria-invalid={Boolean(errors.testerName)}
                  aria-describedby={errors.testerName ? 'feedback-name-error' : undefined}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
              </div>
              {errors.testerName && <p id="feedback-name-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.testerName}</p>}
            </div>

            {/* Role & Profession */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="feedback-role" className="block text-slate-300 font-semibold mb-1">
                  Profession / Role <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="feedback-role"
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Electrician / Frontend Dev"
                    aria-invalid={Boolean(errors.role)}
                    aria-describedby={errors.role ? 'feedback-role-error' : undefined}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                {errors.role && <p id="feedback-role-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.role}</p>}
              </div>

              <div>
                <label htmlFor="feedback-city" className="block text-slate-300 font-semibold mb-1">
                  City (India) <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="feedback-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune, Lucknow, Jaipur"
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'feedback-city-error' : undefined}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                {errors.city && <p id="feedback-city-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.city}</p>}
              </div>
            </div>

            {/* Category & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="feedback-category" className="block text-slate-300 font-semibold mb-1">
                  Domain / Category
                </label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'trades' | 'tech' | 'mentorship' | 'general')}
                  className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="tech" className="bg-slate-900 text-white">Tech &amp; Development</option>
                  <option value="trades" className="bg-slate-900 text-white">Skilled Trades &amp; Services</option>
                  <option value="mentorship" className="bg-slate-900 text-white">Mentorship &amp; Teaching</option>
                  <option value="general" className="bg-slate-900 text-white">General Platform Experience</option>
                </select>
              </div>

              <div>
                <span id="feedback-rating-label" className="block text-slate-300 font-semibold mb-1">
                  Overall Rating
                </span>
                <div role="group" aria-labelledby="feedback-rating-label" className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-pressed={star <= rating}
                      className="min-w-[32px] min-h-[32px] p-1 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors cursor-pointer rounded-md"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        aria-hidden="true"
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-500'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-cyan-400 ml-2 font-bold">{rating}/5</span>
                </div>
              </div>
            </div>

            {/* Feedback / Testimonial Text */}
            <div>
              <label htmlFor="feedback-comment" className="block text-slate-300 font-semibold mb-1">
                Your Experience / Feedback <span className="text-cyan-400" aria-hidden="true">*</span>
              </label>
              <textarea
                id="feedback-comment"
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with SkillConnect features, interface design, speed, or mentorship barter..."
                aria-invalid={Boolean(errors.comment)}
                aria-describedby={errors.comment ? 'feedback-comment-error' : undefined}
                className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-y"
              />
              {errors.comment && <p id="feedback-comment-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.comment}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Committing to Firestore...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Submit Community Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
