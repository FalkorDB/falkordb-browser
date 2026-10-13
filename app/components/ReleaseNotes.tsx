"use client";

import { format, parseISO } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import pkg from "@/package.json";
import { compareVersions, displayBody } from "@/lib/releaseNotes";
import useReleases from "./useReleases";
import ReleaseMarkdown from "./ReleaseMarkdown";

const RELEASES_PAGE = "https://github.com/FalkorDB/falkordb-browser/releases";

const formatDate = (date: string) => {
    try {
        return format(parseISO(date), "MMM d, yyyy");
    } catch {
        return date;
    }
};

/** The body of the Help menu's "Releases" drawer: every release's notes from GitHub, newest first. */
export default function ReleaseNotes() {
    const state = useReleases();

    return (
        <div className="h-full w-full overflow-y-auto" data-testid="releaseNotes">
            <div className="flex flex-col gap-6 p-6 mobile:p-4">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-bold">Releases</h1>
                    <a className="flex items-center gap-1 text-sm text-primary hover:underline" href={RELEASES_PAGE} target="_blank" rel="noreferrer">
                        GitHub <ArrowUpRight size={14} />
                    </a>
                </div>
                {state.status === "loading" && <p className="text-muted-foreground">Loading release notes…</p>}
                {state.status === "error" && (
                    <p className="text-muted-foreground">
                        Release notes couldn&apos;t be loaded. They&apos;re also on{" "}
                        <a className="text-primary hover:underline" href={RELEASES_PAGE} target="_blank" rel="noreferrer">GitHub</a>.
                    </p>
                )}
                {state.status === "ready" && state.releases.length === 0 && <p className="text-muted-foreground">No releases yet.</p>}
                {state.status === "ready" && state.releases.map((release) => (
                    <section key={release.tag} className="flex flex-col gap-3 border-b border-border/50 pb-6 last:border-b-0" data-testid={`releaseNotes-${release.tag}`}>
                        <h2 className="flex flex-wrap items-center gap-2">
                            <a className="text-lg font-semibold hover:underline" href={release.url} target="_blank" rel="noreferrer">{release.name}</a>
                            {release.publishedAt && <span className="text-sm text-muted-foreground">{formatDate(release.publishedAt)}</span>}
                            {compareVersions(release.tag, pkg.version) === 0 && (
                                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">Installed</span>
                            )}
                        </h2>
                        <ReleaseMarkdown source={displayBody(release.body)} />
                    </section>
                ))}
            </div>
        </div>
    );
}
