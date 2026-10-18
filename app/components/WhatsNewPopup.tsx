"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import pkg from "@/package.json";
import { extractWhatsNew, releaseForVersion, seenCovers } from "@/lib/releaseNotes";
import { setWhatsNewActive } from "@/lib/popupTurn";
import useReleases from "./useReleases";
import ReleaseMarkdown from "./ReleaseMarkdown";
import DialogComponent from "./DialogComponent";
import CloseDialog from "./CloseDialog";

/** The newest release whose What's New this browser has shown; it and older ones stay quiet. */
export const WHATS_NEW_SEEN_KEY = "whatsNewSeen";
/** Lets the page settle before the popup appears. */
const SHOW_DELAY_MS = 1000;

const readSeen = () => {
    try {
        return localStorage.getItem(WHATS_NEW_SEEN_KEY);
    } catch {
        return null;
    }
};

/**
 * Shows the "## What's New" section of the running release's notes once per
 * release. Nothing appears while `paused` (tutorial open, signed out) or when
 * the release has no such section.
 */
export default function WhatsNewPopup({ paused }: { paused: boolean }) {
    const state = useReleases(!paused);
    const [open, setOpen] = useState(false);
    const [closed, setClosed] = useState(false);

    const release = state.status === "ready" ? releaseForVersion(state.releases, pkg.version) : undefined;
    const whatsNew = useMemo(() => (release ? extractWhatsNew(release.body) : null), [release]);

    const active = (!paused && state.status === "loading")
        || (!!release && !!whatsNew && !closed && !seenCovers(readSeen(), release.tag));
    // While deciding, or with something unread, other first-visit popups wait their turn.
    useEffect(() => {
        setWhatsNewActive(active);
    }, [active]);
    useEffect(() => () => setWhatsNewActive(false), []);

    useEffect(() => {
        if (paused || !release || !whatsNew || seenCovers(readSeen(), release.tag)) return undefined;
        const timer = setTimeout(() => {
            // A newer release may have been seen in another tab meanwhile.
            if (seenCovers(readSeen(), release.tag)) {
                setClosed(true);
                // It may still be open from before a pause.
                setOpen(false);
                return;
            }
            setOpen(true);
        }, SHOW_DELAY_MS);
        return () => clearTimeout(timer);
    }, [paused, release, whatsNew]);

    if (!release || !whatsNew) return null;

    const onOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            setClosed(true);
            try {
                // Never move it back: a newer release seen elsewhere stays seen.
                if (!seenCovers(readSeen(), release.tag)) localStorage.setItem(WHATS_NEW_SEEN_KEY, release.tag);
            } catch {
                // Storage blocked: it shows again next visit, which is harmless.
            }
        }
    };

    return (
        <DialogComponent
            open={open && !paused}
            onOpenChange={onOpenChange}
            title={`What's new in ${release.name}`}
            label="whatsNew"
            className="max-w-lg"
            trigger={<span className="hidden" />}
        >
            <div className="flex flex-col gap-4 px-2 pb-2">
                <ReleaseMarkdown source={whatsNew} className="text-base" />
                <div className="flex items-center justify-between gap-2">
                    <a className="flex items-center gap-1 text-sm text-primary hover:underline" href={release.url} target="_blank" rel="noreferrer">
                        Full release notes <ArrowUpRight size={14} />
                    </a>
                    <CloseDialog data-testid="whatsNewGotIt" variant="Primary" label="Got it" />
                </div>
            </div>
        </DialogComponent>
    );
}
