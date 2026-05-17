/**
 * Breakpoint constants — single source of truth for JS-side responsive logic.
 *
 * IMPORTANT: these values MUST mirror the breakpoint CSS custom properties in
 * `app/globals.css` (US00016). CSS spec forbids `var()` inside `@media`
 * queries, so JS and CSS each need a copy. If you change one, change the
 * other and grep for usages.
 *
 *   CSS:  --breakpoint-tablet: 768px;   --breakpoint-desktop: 1280px;
 *   JS:   BREAKPOINT_TABLET_PX = 768;   BREAKPOINT_DESKTOP_PX = 1280;
 */
export const BREAKPOINT_TABLET_PX = 768;
export const BREAKPOINT_DESKTOP_PX = 1280;

/** matchMedia string that matches mobile (strictly below tablet). */
export const MOBILE_MEDIA_QUERY = `(max-width: ${BREAKPOINT_TABLET_PX - 0.02}px)`;
