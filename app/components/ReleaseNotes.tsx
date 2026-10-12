"use client";

import { format, parseISO } from "date-fns";
import { ArrowUpRight, Sparkles, Wrench, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { publishedReleases, type ReleaseNoteKind } from "@/lib/releaseNotes";
import { RELEASE_NOTES } from "@/lib/releaseNotesEntries";

// Drafts are generated and unreviewed, so only development shows them.
const RELEASES = publishedReleases(RELEASE_NOTES, process.env.NODE_ENV === "development");

const KINDS: Record<ReleaseNoteKind, { icon: typeof Sparkles; className: string; label: string }> = {
    feature: { icon: Sparkles, className: "bg-primary/15 text-primary", label: "New" },
    improvement: { icon: Zap, className: "bg-sky-500/15 text-sky-500", label: "Improved" },
    fix: { icon: Wrench, className: "bg-emerald-500/15 text-emerald-500", label: "Fixed" },
};

const formatDate = (date: string) => {
    try {
        return format(parseISO(date), "MMM d, yyyy");
    } catch {
        return date;
    }
};

/** The body of the Help menu's "Releases" drawer: every release's notes, newest first. */
export default function ReleaseNotes() {
    return (
        <div className="h-full w-full overflow-y-auto" data-testid="releaseNotes">
            <div className="flex flex-col gap-6 p-6 mobile:p-4">
                <h1 className="text-2xl font-bold">Releases</h1>
                {RELEASES.length === 0 && <p className="text-muted-foreground">No release notes yet.</p>}
                {RELEASES.map((release) => (
                    <section key={release.version} className="flex flex-col gap-3" data-testid={`releaseNotes-${release.version}`}>
                        <h2 className="flex items-center gap-2">
                            <span className="text-lg font-semibold">v{release.version}</span>
                            <span className="text-sm text-muted-foreground">{formatDate(release.date)}</span>
                            {release.draft && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">Draft</span>}
                        </h2>
                        <ul className="flex flex-col gap-3">
                            {release.items.map((item) => {
                                const { icon: Icon, className, label } = KINDS[item.kind];
                                return (
                                    <li key={item.title} className="flex gap-3">
                                        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", className)} title={label}>
                                            <Icon size={14} />
                                        </span>
                                        <div className="flex min-w-0 flex-col gap-0.5">
                                            <p className="text-sm font-medium leading-snug">{item.title}</p>
                                            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                                            {item.link && (
                                                <a className="flex w-fit items-center gap-1 text-sm text-primary hover:underline" href={item.link} target="_blank" rel="noreferrer">
                                                    Learn more <ArrowUpRight size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
