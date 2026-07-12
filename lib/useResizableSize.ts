"use client";

import { useCallback, useState } from "react";

/**
 * Hook that manages a resizable element's width and height,
 * persisting each independently to localStorage under the given key.
 *
 * @param storageKey - localStorage key (will store JSON `{ width, height }`)
 * @param defaultWidth - default width in pixels
 * @param defaultHeight - default height in pixels
 * @param minWidth - minimum width constraint
 * @param minHeight - minimum height constraint
 */
export function useResizableSize(
    storageKey: string,
    defaultWidth: number,
    defaultHeight: number,
    minWidth: number,
    minHeight: number
) {
    const [size, setSize] = useState<{ width: number; height: number }>(() => {
        if (typeof window === "undefined") return { width: defaultWidth, height: defaultHeight };
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    width: Math.max(parsed.width ?? defaultWidth, minWidth),
                    height: Math.max(parsed.height ?? defaultHeight, minHeight),
                };
            }
        } catch {
            // ignore
        }
        return { width: defaultWidth, height: defaultHeight };
    });

    const persist = useCallback((newSize: { width: number; height: number }) => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(newSize));
        } catch {
            // ignore quota errors
        }
    }, [storageKey]);

    const onResize = useCallback((width: number, height: number) => {
        const clamped = {
            width: Math.max(width, minWidth),
            height: Math.max(height, minHeight),
        };
        setSize(clamped);
        persist(clamped);
    }, [minWidth, minHeight, persist]);

    return { size, onResize };
}
