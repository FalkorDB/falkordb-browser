"use client";

import { useEffect, useState } from "react";
import type { Release } from "@/lib/releaseNotes";

export type ReleasesState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; releases: Release[] };

// One request per page load, shared by the Releases drawer and the What's New popup.
let request: Promise<Release[]> | undefined;

function loadReleases(): Promise<Release[]> {
    request ??= fetch("/api/releases")
        .then(async (res) => {
            if (!res.ok) throw new Error(`Releases request failed: ${res.status}`);
            return ((await res.json()) as { releases: Release[] }).releases;
        })
        .catch((err) => {
            // Let the next caller try again instead of reusing the failure.
            request = undefined;
            throw err;
        });
    return request;
}

/** The repository's releases, newest first; fetched once and shared. */
export default function useReleases(enabled = true): ReleasesState {
    const [state, setState] = useState<ReleasesState>({ status: "loading" });

    useEffect(() => {
        if (!enabled) return undefined;
        let active = true;
        loadReleases().then(
            (releases) => { if (active) setState({ status: "ready", releases }); },
            () => { if (active) setState({ status: "error" }); },
        );
        return () => { active = false; };
    }, [enabled]);

    return state;
}
