"use client";

import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";

/** Keep in sync with the `mobile` variant in app/globals.css. */
export const MOBILE_BREAKPOINT = 1100;

const QUERY = `(width < ${MOBILE_BREAKPOINT}px)`;

function subscribe(onChange: () => void): () => void {
    const list = window.matchMedia(QUERY);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
    return window.matchMedia(QUERY).matches;
}

// The server has no viewport, so it renders the desktop tree and the client
// corrects on hydration. Anything gated on this must stay hydration-safe.
function getServerSnapshot(): boolean {
    return false;
}

/**
 * Structural mobile gate. Use the `mobile:` CSS variant for styling; reach for this
 * hook only where the component tree itself has to differ (panels vs sheets).
 */
export default function useIsMobile(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// There is no layout to measure on the server, and warning about it is noise.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Gate for anything that branches structurally on `useIsMobile`.
 *
 * That hook has to report desktop on the server and on the first client render,
 * so rendering the real tree straight away flashes the desktop layout on a phone.
 * Hold the tree back until this flips — a layout effect, so the held frame is
 * replaced before the browser paints it.
 */
export function useViewportResolved(): boolean {
    const [resolved, setResolved] = useState(false);

    useIsomorphicLayoutEffect(() => setResolved(true), []);

    return resolved;
}
