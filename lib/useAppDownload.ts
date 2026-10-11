'use client';

import { useEffect, useState } from "react";
import { AppDownload, AppLinks, CpuArch, detectPlatform, getAppDownload, isInsideApp } from "./appDownload";

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
        let active = true;

        if (platform === "mac") {
            setDownload(getAppDownload(platform, {}));
            // Chromium can say whether this Mac is Intel; Safari and Firefox cannot.
            const hints = (navigator as Navigator & {
                userAgentData?: { getHighEntropyValues(keys: string[]): Promise<{ architecture?: string }> };
            }).userAgentData;
            hints?.getHighEntropyValues(["architecture"])
                .then(({ architecture }) => {
                    const arch: CpuArch | undefined = architecture === "x86" || architecture === "arm" ? architecture : undefined;
                    if (active && arch) setDownload(getAppDownload(platform, {}, arch));
                })
                .catch(() => { /* keep the default order */ });
            return () => {
                active = false;
            };
        }

        if (platform !== "android" && platform !== "ios") {
            setDownload(getAppDownload(platform, {}));
            return undefined;
        }

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
