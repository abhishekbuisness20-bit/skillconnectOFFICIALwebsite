import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export type AdSlotFormat = 'auto' | 'horizontal' | 'rectangle' | 'fluid';

export interface AdSlotProps {
  /**
   * Google AdSense ad unit slot ID from the AdSense dashboard.
   * Defaults to a responsive placement slot identifier.
   */
  adSlot?: string;
  /**
   * Google AdSense Publisher Client ID.
   * Defaults to SkillConnect Official's verified publisher ID.
   */
  adClient?: string;
  /**
   * AdSense format type ('auto', 'horizontal', 'rectangle', 'fluid').
   */
  adFormat?: AdSlotFormat;
  /**
   * Whether the responsive ad unit should expand to full width on mobile.
   */
  fullWidthResponsive?: boolean;
  /**
   * Optional layout key for in-feed / fluid AdSense units.
   */
  adLayoutKey?: string;
  /**
   * Optional placement identifier for debugging and accessibility.
   */
  placementName?: string;
  /**
   * Additional wrapper classes for spacing within the page layout.
   */
  className?: string;
}

/**
 * Policy-compliant Google AdSense Unit Component (`AdSlot`).
 *
 * AdSense Policy & UX Safeguards Implemented:
 * 1. Explicit "Advertisement" disclosure label (the only label phrasing permitted by Google AdSense policy).
 * 2. Generous spacing and visual separation from interactive buttons/navigation to prevent accidental clicks.
 * 3. Pre-allocated minimum heights (`min-h-[90px]` / `min-h-[120px]`) to prevent Cumulative Layout Shift (CLS).
 * 4. Idempotent `adsbygoogle.push({})` guard that safely handles React StrictMode re-renders and ad blockers.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  adSlot = '8492911917',
  adClient = 'ca-pub-8492911917617426',
  adFormat = 'auto',
  fullWidthResponsive = true,
  adLayoutKey,
  placementName = 'content-break',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    let rafId: number | null = null;

    const timerId = window.setTimeout(() => {
      rafId = window.requestAnimationFrame(() => {
        if (cancelled) return;
        const insElement = insRef.current;
        const containerElement = containerRef.current;
        if (!insElement || !containerElement) return;
        if (!insElement.isConnected || !containerElement.isConnected) return;

        // AdSense requires a connected parent block div with non-zero width
        if (containerElement.offsetWidth <= 0) return;

        // Prevent duplicate push calls on the same <ins> node in React StrictMode
        const alreadyInitialized =
          pushedRef.current ||
          Boolean(insElement.getAttribute('data-adsbygoogle-status')) ||
          Boolean(insElement.getAttribute('data-ad-status')) ||
          insElement.innerHTML.trim().length > 0;

        if (alreadyInitialized) return;

        try {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
          pushedRef.current = true;
        } catch (err) {
          // Gracefully ignore errors if an ad blocker blocks pagead2.googlesyndication.com
          console.debug('[AdSlot] AdSense unit initialization skipped or blocked:', err);
        }
      });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [adSlot, adFormat]);

  const minHeightClass =
    adFormat === 'rectangle'
      ? 'min-h-[250px]'
      : adFormat === 'horizontal'
      ? 'min-h-[90px]'
      : 'min-h-[100px]';

  return (
    <aside
      aria-label="Advertisement"
      data-ad-placement={placementName}
      className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-6 select-none ${className}`}
    >
      <div className="rounded-2xl bg-slate-900/40 border border-white/5 px-4 py-3.5 backdrop-blur-sm transition-colors">
        {/* Google AdSense Policy-Compliant Disclosure Label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Advertisement
          </span>
          <span className="text-[10px] font-mono text-slate-400">Google AdSense</span>
        </div>

        {/* Reserved CLS-Safe AdSense Block Container (must be block, not flex, to avoid AdSense no_div error) */}
        <div
          ref={containerRef}
          className={`block w-full overflow-hidden rounded-xl bg-[#050814]/60 ${minHeightClass}`}
        >
          <ins
            ref={insRef}
            className="adsbygoogle block w-full text-center"
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
            {...(adLayoutKey ? { 'data-ad-layout-key': adLayoutKey } : {})}
          />
        </div>
      </div>
    </aside>
  );
};

export default AdSlot;
