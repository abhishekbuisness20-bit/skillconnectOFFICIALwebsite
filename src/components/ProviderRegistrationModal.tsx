import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Briefcase, Phone, Mail, User, MapPin, Award, Loader2, Database } from 'lucide-react';
import { submitServiceProviderRegistration } from '../services/firestoreService';

interface ProviderRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_CATEGORIES = [
  'Electrical & Wiring',
  'Plumbing & Sanitation',
  'Carpentry & Woodwork',
  'AC & Refrigerator Repair',
  'Home Painting & Waterproofing',
  'Appliance Maintenance',
  'Software & Web Development',
  'Graphic Design & Branding',
  'Academic Tutoring & Mentorship',
  'Event Management & Photography',
  'Other Skilled Trade',
];

export const ProviderRegistrationModal: React.FC<ProviderRegistrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(POPULAR_CATEGORIES[0]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [experienceYears, setExperienceYears] = useState('3');
  const [bio, setBio] = useState('');

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
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters).';
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please provide a valid contact number (10+ digits).';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!city.trim()) {
      errs.city = 'Please enter your operational city.';
    }
    if (!state.trim()) {
      errs.state = 'Please specify your state.';
    }
    const expNum = parseInt(experienceYears, 10);
    if (isNaN(expNum) || expNum < 0 || expNum > 50) {
      errs.experienceYears = 'Experience must be between 0 and 50 years.';
    }
    if (!bio.trim() || bio.trim().length < 10) {
      errs.bio = 'Please provide a brief bio describing your services (minimum 10 characters).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitServiceProviderRegistration({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        category,
        city: city.trim(),
        state: state.trim(),
        experienceYears: parseInt(experienceYears, 10),
        bio: bio.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Registration failed:', err);
      setErrors({ form: 'Submission error. Please verify your internet connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setCity('');
    setBio('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-modal-title"
    >
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,242,254,0.2)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
              SkillConnect Verified Talent Network
            </span>
            <h2 id="provider-modal-title" className="text-lg font-bold text-white tracking-tight">
              Service Professional Registration
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pre-register for early verified onboarding across India before the 8 Nov 2026 launch.
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
            <h3 className="text-base font-bold text-white">Application Successfully Registered!</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              Your profile has been saved to SkillConnect Cloud Firestore (<strong className="text-cyan-400">global-capsule-zbcxw</strong>) under verification review. Abhishek Singh and the administration team will review your credentials.
            </p>
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-xs text-cyan-200 flex items-center justify-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>Status: Pending Verification</span>
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

            {/* Full Name */}
            <div>
              <label htmlFor="provider-full-name" className="block text-slate-300 font-semibold mb-1">
                Full Legal / Professional Name <span className="text-cyan-400" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                <input
                  id="provider-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Verma"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'provider-fullname-error' : undefined}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
              </div>
              {errors.fullName && <p id="provider-fullname-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="provider-phone" className="block text-slate-300 font-semibold mb-1">
                  Contact Mobile <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="provider-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'provider-phone-error' : undefined}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                {errors.phone && <p id="provider-phone-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="provider-email" className="block text-slate-300 font-semibold mb-1">
                  Email Address <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="provider-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pro@skillconnect.in"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'provider-email-error' : undefined}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                {errors.email && <p id="provider-email-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Skill Category & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="provider-category" className="block text-slate-300 font-semibold mb-1">
                  Skill Category <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <select
                    id="provider-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {POPULAR_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="provider-experience" className="block text-slate-300 font-semibold mb-1">
                  Experience (Years) <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="provider-experience"
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    aria-invalid={Boolean(errors.experienceYears)}
                    aria-describedby={errors.experienceYears ? 'provider-experience-error' : undefined}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                {errors.experienceYears && (
                  <p id="provider-experience-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.experienceYears}</p>
                )}
              </div>
            </div>

            {/* City & State in India */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="provider-city" className="block text-slate-300 font-semibold mb-1">
                  City <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="provider-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lucknow / Bengaluru"
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'provider-city-error' : undefined}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                {errors.city && <p id="provider-city-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="provider-state" className="block text-slate-300 font-semibold mb-1">
                  State in India <span className="text-cyan-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="provider-state"
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Uttar Pradesh, Karnataka"
                  aria-invalid={Boolean(errors.state)}
                  aria-describedby={errors.state ? 'provider-state-error' : undefined}
                  className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
                {errors.state && <p id="provider-state-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.state}</p>}
              </div>
            </div>

            {/* Bio / Services */}
            <div>
              <label htmlFor="provider-bio" className="block text-slate-300 font-semibold mb-1">
                Bio &amp; Service Specializations <span className="text-cyan-400" aria-hidden="true">*</span>
              </label>
              <textarea
                id="provider-bio"
                rows={3}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mention your tools, certifications, service warranty, or key projects..."
                aria-invalid={Boolean(errors.bio)}
                aria-describedby={errors.bio ? 'provider-bio-error' : undefined}
                className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-y"
              />
              {errors.bio && <p id="provider-bio-error" role="alert" className="text-[11px] text-rose-400 mt-1">{errors.bio}</p>}
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
                    <span>Saving to Firebase Firestore...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Submit Provider Registration</span>
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
