"use client";

import { useEffect } from "react";
import {
  AFFILIATE_CLICK_EVENT,
  AFFILIATE_LINK_SELECTOR,
  readAffiliateClickPayload,
} from "@/lib/analytics";

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: Record<string, unknown>) => void;
  }
}

/**
 * F0007's delegated affiliate-click listener — the consumer of the
 * F0003 ↔ F0007 data-* contract documented on <AffiliateLink>.
 *
 * ONE listener on document, not one per link: `closest()` resolves any click
 * inside a whole-card anchor (US00032) to exactly one anchor, so clicking the
 * image, the body or the CTA span sends exactly one event.
 *
 * Renders nothing. Mounted only when analytics is enabled, so with no
 * measurement ID this component is never in the tree.
 */
export function AffiliateClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest(AFFILIATE_LINK_SELECTOR);
      const payload = readAffiliateClickPayload(anchor);
      if (!payload) return;
      window.gtag?.("event", AFFILIATE_CLICK_EVENT, { ...payload });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
