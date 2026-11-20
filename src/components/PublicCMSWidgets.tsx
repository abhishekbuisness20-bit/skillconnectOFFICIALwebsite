import React from 'react';
import { useCMS } from '../context/CMSContext';
import {
  Megaphone,
  Calendar,
  MapPin,
  ArrowUpRight,
  Sparkles,
  Bell,
  AlertTriangle,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { PageView } from '../types';
import { parseInternalCmsLink } from '../utils/seoRouting';

function isWithinDateWindow(startDate?: string, endDate?: string): boolean {
  const now = new Date();
  if (startDate && startDate.trim() !== '') {
    const start = new Date(startDate);
    if (!isNaN(start.getTime()) && now < start) {
      return false;
    }
  }
  if (endDate && endDate.trim() !== '') {
    const end = new Date(endDate);
    // Include the entire end day if only YYYY-MM-DD is provided
    if (endDate.length <= 10) {
      end.setHours(23, 59, 59, 999);
    }
    if (!isNaN(end.getTime()) && now > end) {
      return false;
    }
  }
  return true;
}

export const PublicAnnouncementBar: React.FC<{ onNavigate?: (view: PageView) => void }> = ({
  onNavigate,
}) => {
  const { publicAnnouncements, activeConfig, previewDraftMode, isFounderAuthorized } = useCMS();

  if (activeConfig.customization?.showAnnouncementBar === false) {
    return null;
  }

  const visibleAnnouncements = publicAnnouncements.filter((item) => {
    if (!previewDraftMode && item.status !== 'published') return false;
    return isWithinDateWindow(item.startDate, item.expiryDate);
  });

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="pt-20 bg-[#050814] border-b border-cyan-500/20 relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 space-y-2">
        {visibleAnnouncements.map((ann) => {
          const badgeStyle =
            ann.type === 'alert'
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : ann.type === 'festival'
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
              : ann.type === 'event'
              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
              : ann.type === 'launch'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';

          return (
            <div
              key={ann.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs"
            >
              <div className="flex items-start sm:items-center gap-2.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}
                >
                  {ann.type === 'alert' ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : ann.type === 'festival' ? (
                    <Sparkles className="w-3 h-3" />
                  ) : (
                    <Megaphone className="w-3 h-3" />
                  )}
                  <span>{ann.type === 'festival' ? 'Festival Greeting' : ann.type}</span>
                </span>

                {ann.status === 'draft' && isFounderAuthorized && previewDraftMode && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono">
                    DRAFT PREVIEW
                  </span>
                )}

                <strong className="text-white font-semibold">{ann.title}:</strong>
                <span className="text-slate-300">{ann.message}</span>
              </div>

              {ann.linkUrl && (() => {
                const parsedLink = parseInternalCmsLink(ann.linkUrl);
                return (
                  <a
                    href={parsedLink.href}
                    target={parsedLink.isExternal ? '_blank' : undefined}
                    rel={parsedLink.isExternal ? 'noopener noreferrer' : undefined}
                    onClick={(e) => {
                      if (!parsedLink.isExternal && parsedLink.targetView && onNavigate) {
                        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                          return;
                        }
                        e.preventDefault();
                        onNavigate(parsedLink.targetView);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold whitespace-nowrap self-start sm:self-center"
                  >
                    <span>{ann.linkText || 'Learn More'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PublicPromotionalBanners: React.FC<{ onNavigate?: (view: PageView) => void }> = ({
  onNavigate,
}) => {
  const { publicBanners, activeConfig, previewDraftMode, isFounderAuthorized } = useCMS();

  if (activeConfig.customization?.showPromotionalBanners === false) {
    return null;
  }

  const activeBanners = publicBanners.filter((b) => {
    if (!b.enabled) return false;
    if (!previewDraftMode && b.status !== 'published') return false;
    return isWithinDateWindow(b.startDate, b.endDate);
  });

  if (activeBanners.length === 0) return null;

  return (
    <section className="py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {activeBanners.map((banner) => (
          <div
            key={banner.id}
            className="glass-card rounded-3xl overflow-hidden border border-cyan-500/25 shadow-2xl relative group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>
                      {banner.bannerType === 'event'
                        ? 'Featured Platform Event'
                        : 'Official Highlight'}
                    </span>
                  </span>

                  {banner.status === 'draft' && isFounderAuthorized && previewDraftMode && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono">
                      <Eye className="w-3 h-3" /> DRAFT PREVIEW
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {banner.title}
                </h2>

                {banner.subtitle && (
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                    {banner.subtitle}
                  </p>
                )}

                {banner.buttonText && banner.buttonLink && (() => {
                  const parsedLink = parseInternalCmsLink(banner.buttonLink);
                  return (
                    <div className="pt-2">
                      <a
                        href={parsedLink.href}
                        target={parsedLink.isExternal ? '_blank' : undefined}
                        rel={parsedLink.isExternal ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                          if (!parsedLink.isExternal && parsedLink.targetView && onNavigate) {
                            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                              return;
                            }
                            e.preventDefault();
                            onNavigate(parsedLink.targetView);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all"
                      >
                        <span>{banner.buttonText}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })()}
              </div>

              {banner.imageUrl && (
                <div className="lg:col-span-5 h-60 lg:h-full min-h-[240px] relative overflow-hidden bg-slate-900/80 border-t lg:border-t-0 lg:border-l border-white/10">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const PublicUpcomingEventsSection: React.FC = () => {
  const { publicEvents, previewDraftMode, isFounderAuthorized } = useCMS();

  const visibleEvents = publicEvents.filter((ev) => {
    if (!previewDraftMode && ev.status !== 'published') return false;
    return true;
  });

  if (visibleEvents.length === 0) return null;

  return (
    <section className="py-20 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" />
            <span>Platform Milestones & Community Events</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Upcoming SkillConnect Events
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            Join official briefings, beta workshops, and skill-exchange meetups organized by SkillConnect Official across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleEvents.map((ev) => (
            <div
              key={ev.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                {ev.posterUrl && (
                  <div className="h-48 w-full bg-slate-900 overflow-hidden border-b border-white/10 relative">
                    <img
                      src={ev.posterUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    {ev.status === 'draft' && isFounderAuthorized && previewDraftMode && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500/90 text-slate-950 font-bold text-[10px] font-mono">
                        DRAFT
                      </span>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-cyan-400 font-mono mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ev.eventDate}</span>
                    </span>
                    {ev.location && (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{ev.location}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{ev.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>
                </div>
              </div>

              {ev.registrationLink && (
                <div className="px-6 pb-6 pt-2">
                  <a
                    href={ev.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Event Details / Register</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
