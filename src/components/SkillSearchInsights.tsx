import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface GroundingSource {
  title: string;
  url: string;
}

interface InsightsResult {
  query: string;
  focus: string;
  answer: string;
  sources: GroundingSource[];
  searchQueries?: string[];
  grounded: boolean;
  generatedAt: string;
}

const PRESET_QUERIES = [
  {
    label: 'High-demand freelance tech skills in India',
    focus: 'Technology & Freelancing',
  },
  {
    label: 'Top verified local service trades growing across India',
    focus: 'Skilled Trades & Services',
  },
  {
    label: 'How peer mentorship accelerates hiring in Indian startups',
    focus: 'Mentorship & Careers',
  },
];

export const SkillSearchInsights: React.FC = () => {
  const [query, setQuery] = useState(PRESET_QUERIES[0].label);
  const [focus, setFocus] = useState(PRESET_QUERIES[0].focus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; isRateLimit?: boolean } | null>(null);
  const [result, setResult] = useState<InsightsResult | null>(null);
  const clientCacheRef = React.useRef<Map<string, InsightsResult>>(new Map());

  const runSearch = async (targetQuery: string, targetFocus: string) => {
    const trimmed = targetQuery.trim();
    if (trimmed.length < 3) {
      setError({ message: 'Please enter at least 3 characters to explore live skill trends.' });
      return;
    }

    const cacheKey = `${targetFocus.toLowerCase()}::${trimmed.toLowerCase()}`;
    const cachedResult = clientCacheRef.current.get(cacheKey);
    if (cachedResult) {
      setError(null);
      setResult(cachedResult);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/skill-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, focus: targetFocus }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError({
          message:
            typeof payload.error === 'string'
              ? payload.error
              : 'Unable to fetch live search-grounded insights right now.',
          isRateLimit: response.status === 429 || Boolean(payload.rateLimited),
        });
        return;
      }

      const typedPayload = payload as InsightsResult;
      clientCacheRef.current.set(cacheKey, typedPayload);
      setResult(typedPayload);
    } catch (err: unknown) {
      setError({
        message:
          err instanceof Error
            ? err.message
            : 'Unable to reach live skill insights service right now.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query, focus);
  };

  return (
    <div className="mt-12 glass-card rounded-3xl p-6 sm:p-8 border border-[#08C8F0]/25">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#08C8F0] mb-2">
            <Globe className="w-4 h-4 text-[#27D879]" aria-hidden="true" />
            <span>Live Google Search Grounding · India Skill Pulse</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Explore Live Indian Skill &amp; Service Market Demand
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Query real-time market demand, emerging digital and vocational skills, or customer service trends across India with live Google Search citations.
          </p>
        </div>
      </div>

      {/* Quick Preset Topics */}
      <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Suggested India skill market topics">
        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setQuery(preset.label);
              setFocus(preset.focus);
              runSearch(preset.label, preset.focus);
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#071426]/80 border border-[#08C8F0]/25 text-slate-200 hover:text-white hover:border-[#08C8F0] transition-colors cursor-pointer disabled:opacity-60"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="skill-pulse-query" className="sr-only">
          Ask about Indian skill demand or service trends
        </label>
        <input
          id="skill-pulse-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={220}
          placeholder="e.g., Most in-demand skills for Indian freelancers in 2026"
          className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-[#071426]/90 border border-white/15 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#08C8F0]"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-[46px] px-6 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider text-[#071426] bg-gradient-to-r from-[#08C8F0] to-[#27D879] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(8,200,240,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Lookup Live Insights</span>
            </>
          )}
        </button>
      </form>

      {/* Error / Quota Notice State */}
      {error && (
        <div
          role="alert"
          className={`mt-5 p-4 rounded-xl text-xs flex items-start gap-2.5 border ${
            error.isRateLimit
              ? 'bg-amber-500/10 border-amber-400/35 text-amber-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <AlertCircle
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              error.isRateLimit ? 'text-amber-400' : 'text-rose-400'
            }`}
            aria-hidden="true"
          />
          <span>{error.message}</span>
        </div>
      )}

      {/* Grounded Result Panel */}
      {result && (
        <div className="mt-6 p-5 rounded-2xl bg-[#071426]/85 border border-[#27D879]/30 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#27D879] font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Live Search-Grounded Market Brief
            </span>
            <span className="text-[11px] font-normal text-slate-400">
              {new Date(result.generatedAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {result.answer}
          </div>

          {result.sources.length > 0 && (
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Verified Google Search Sources
              </div>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((src) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-[#08C8F0]/25 hover:border-[#08C8F0] text-xs text-[#08C8F0] hover:text-white transition-colors"
                  >
                    <span className="truncate max-w-[220px]">{src.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
              {result.searchQueries && result.searchQueries.length > 0 && (
                <div className="text-[11px] text-slate-400">
                  Search queries: {result.searchQueries.join(' · ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
