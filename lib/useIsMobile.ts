"use client";

import { useEffect, useState } from "react";
import { MOBILE_MEDIA_QUERY } from "./responsive";

export * from "./responsive";

/**
 * True while the viewport is narrower than the mobile breakpoint.
 *
 * Starts as `false` so the first client render matches the server-rendered
 * markup, then corrects itself on mount. Prefer Tailwind's `md:` variants for
 * anything that is purely a matter of styling.
 */
export default function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return undefined;

        const query = window.matchMedia(MOBILE_MEDIA_QUERY);
        const update = () => setIsMobile(query.matches);

        update();
        query.addEventListener("change", update);

        return () => query.removeEventListener("change", update);
    }, []);

    return isMobile;
}
