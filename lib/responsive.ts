/**
 * Breakpoint helpers shared by the mobile layout.
 *
 * The browser is desktop-first: anything narrower than `MOBILE_BREAKPOINT` is
 * treated as a phone, which is where the navbar turns into a bottom bar, the
 * query toolbar wraps and the resizable splits stack on top of each other.
 *
 * Layout that can be expressed in CSS uses Tailwind's `md:` variants directly —
 * this module is for the few places that have to pass a different *value*
 * rather than a different class.
 */

/** Tailwind's `md` breakpoint, in pixels. Viewports below it are "mobile". */
export const MOBILE_BREAKPOINT = 768;

/**
 * Matches the same viewports as Tailwind's `max-md:` variant. The fractional
 * pixel keeps the two from both matching at exactly 768px.
 */
export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 0.02}px)`;

/** Smallest share of a stacked split that a pane can be dragged down to. */
export const MOBILE_MIN_SPLIT = "30%";

export type SplitOrientation = "horizontal" | "vertical";

export interface SplitBounds {
    minSize?: string;
    maxSize?: string;
}

/** Whether a viewport of `width` pixels should use the mobile layout. */
export function isMobileWidth(width: number): boolean {
    return Number.isFinite(width) && width < MOBILE_BREAKPOINT;
}

/**
 * Orientation for a resizable split. Side-by-side panes leave nothing usable on
 * a phone, so the split stacks vertically instead.
 */
export function splitOrientation(isMobile: boolean): SplitOrientation {
    return isMobile ? "vertical" : "horizontal";
}

/**
 * Size bounds for one pane of a resizable split.
 *
 * Desktop bounds are tuned for columns — a sidebar capped at 30% of the width
 * is a sensible sidebar, but capped at 30% of the *height* once the split is
 * stacked it is a sliver. A stacked pane may therefore take anything from
 * `MOBILE_MIN_SPLIT` up to the whole split.
 */
export function splitBounds(isMobile: boolean, desktop: SplitBounds): SplitBounds {
    return isMobile ? { minSize: MOBILE_MIN_SPLIT, maxSize: "100%" } : desktop;
}
