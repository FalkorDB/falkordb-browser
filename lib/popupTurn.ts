'use client';

import { useSyncExternalStore } from "react";

/**
 * Whether the What's New popup has the floor: still deciding, or showing news
 * the visitor has not read. The app download popup waits while it does.
 *
 * Kept outside React state on purpose: lifting it into the providers would
 * re-render the whole app (and restart its data loading) every time it flips.
 * Only the components that read it re-render.
 */
let whatsNewActive = false;
const listeners = new Set<() => void>();

export function setWhatsNewActive(active: boolean): void {
    if (active === whatsNewActive) return;
    whatsNewActive = active;
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useWhatsNewActive(): boolean {
    return useSyncExternalStore(subscribe, () => whatsNewActive, () => false);
}
