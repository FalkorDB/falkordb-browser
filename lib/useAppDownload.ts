'use client';

import { useEffect, useState } from "react";
import { AppDownload, AppLinks, detectPlatform, getAppDownload, isInsideApp } from "./appDownload";

/**
 * The native app to offer this visitor, or undefined when there is none for
 * their OS or they are already in it. Only phones ask the server for links,
 * since the desktop installers' links are fixed.
 */
export default function useAppDownload(): AppDownload | undefined {
    const [download, setDownload] = useState<AppDownload>();

    useEffect(() => {
        const { userAgent, maxTouchPoints } = navigator;
        const hasCapacitor = "Capacitor" in window;
        // iOS Safari flags a Home Screen launch on `navigator.standalone`;
        // everything else reports it as a display mode.
        const standalone = window.matchMedia?.("(display-mode: standalone)").matches
            || (navigator as Navigator & { standalone?: boolean }).standalone === true;
        if (isInsideApp(userAgent, hasCapacitor, standalone)) return undefined;

        const platform = detectPlatform(userAgent, maxTouchPoints);
        if (platform !== "android" && platform !== "ios") {
            setDownload(getAppDownload(platform, {}));
            return undefined;
        }

        let active = true;
        const lookup = async () => {
            let links: AppLinks = {};
            try {
                const res = await fetch("/api/app-links");
                if (res.ok) links = (await res.json()) as AppLinks;
            } catch {
                // No links: Android shows nothing, iOS falls back to the home screen.
            }
            if (active) setDownload(getAppDownload(platform, links));
        };
        void lookup();
        return () => {
            active = false;
        };
    }, []);

    return download;
}
