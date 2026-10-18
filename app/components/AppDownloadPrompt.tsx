'use client';

import { useEffect, useId, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { dismissAppPrompt, getPromptStorage, markAppPromptShown, shouldShowAppPrompt } from "@/lib/appDownload";
import useAppDownload from "@/lib/useAppDownload";
import useDownloadLinkProps from "./useDownloadLinkProps";
import { useWhatsNewActive } from "@/lib/popupTurn";
import Button from "./ui/Button";

// Let the page settle first, so the popup lands on a loaded screen rather
// than over a spinner.
const OPEN_DELAY_MS = 1500;

const PLATFORM_NAMES = {
    mac: "macOS",
    windows: "Windows",
    linux: "Linux",
    android: "Android",
    ios: "iPhone and iPad",
} as const;

interface Props {
    /** Holds the popup back, e.g. while the tutorial is running. */
    blocked: boolean
}

/**
 * Offers the visitor the app for their OS, on whichever page they land:
 * people with a saved session go straight to /graph and never see /login.
 */
export default function AppDownloadPrompt({ blocked: blockedByCaller }: Props) {
    const download = useAppDownload();
    const linkProps = useDownloadLinkProps();
    // The release's news goes first; the download offer waits for it.
    const whatsNewActive = useWhatsNewActive();
    const blocked = blockedByCaller || whatsNewActive;
    const [open, setOpen] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const checkboxId = useId();
    const primaryRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Something else took the screen (the tutorial starting late, say):
        // step aside without counting as seen, and come back once it is done.
        if (blocked) {
            setOpen(false);
            return undefined;
        }
        const storage = getPromptStorage(window);
        if (!download || !storage || !shouldShowAppPrompt(storage.local, storage.session)) return undefined;
        const timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
        return () => clearTimeout(timer);
    }, [download, blocked]);

    if (!download) return null;

    // Only the visitor closing it counts: once per session, or for good.
    const close = (dismiss: boolean) => {
        const storage = getPromptStorage(window);
        if (storage) {
            markAppPromptShown(storage.session);
            if (dismiss) dismissAppPrompt(storage.local);
        }
        setOpen(false);
    };

    const isHomeScreen = download.kind === "homeScreen";
    const platformName = PLATFORM_NAMES[download.platform];

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) close(dontShowAgain); }}>
            <DialogContent
                className="bg-background flex flex-col gap-5 p-6 rounded-lg border-none max-w-[32rem] w-[calc(100vw-2rem)]"
                data-testid="appDownloadPrompt"
                // Start on the main action, not on the checkbox that happens to come first.
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    primaryRef.current?.focus();
                }}
            >
                <div className="flex flex-col gap-2">
                    <DialogTitle className="text-xl font-semibold">
                        {isHomeScreen ? "Add FalkorDB Browser to your Home Screen" : `FalkorDB Browser for ${platformName}`}
                    </DialogTitle>
                    <DialogDescription asChild>
                        {isHomeScreen ? (
                            <ol className="list-decimal pl-5 flex flex-col gap-1 text-muted">
                                <li>Tap the <span className="font-medium text-foreground">Share</span> button.</li>
                                <li>Choose <span className="font-medium text-foreground">Add to Home Screen</span>.</li>
                                <li>Open it from the new icon. It runs full screen, like an app.</li>
                            </ol>
                        ) : (
                            <p className="text-muted">
                                Use the browser as an app on your {download.platform === "android" || download.platform === "ios" ? "phone" : "computer"}, in its own window, without a browser tab to lose.
                            </p>
                        )}
                    </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={checkboxId}
                        className="w-5 h-5 rounded-full bg-background border-primary data-[state=checked]:bg-primary"
                        checked={dontShowAgain}
                        onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                        data-testid="appDownloadPromptDontShow"
                    />
                    <label htmlFor={checkboxId} className="text-sm text-foreground cursor-pointer select-none">
                        Don&apos;t show this again
                    </label>
                </div>
                <div className="flex justify-end gap-2 mobile:flex-col-reverse">
                    {isHomeScreen ? (
                        <Button
                            ref={(el) => { primaryRef.current = el; }}
                            className="justify-center whitespace-nowrap"
                            variant="Primary"
                            label="Got it"
                            // The label says it all; no tooltip on focus.
                            title=""
                            data-testid="appDownloadPromptClose"
                            onClick={() => close(dontShowAgain)}
                        />
                    ) : (
                        <>
                            <Button className="justify-center whitespace-nowrap" variant="Cancel" label="Not now" title="" data-testid="appDownloadPromptClose" onClick={() => close(dontShowAgain)} />
                            {/* Downloading answers the question for good. */}
                            <a
                                ref={(el) => { primaryRef.current = el; }}
                                className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 bg-primary text-primary-foreground font-medium hover:opacity-90"
                                data-testid="appDownloadPromptDownload"
                                {...linkProps(download.href, download.platform, () => close(true))}
                            >
                                <Download size={18} />
                                {download.label}
                            </a>
                        </>
                    )}
                </div>
                {download.kind === "link" && download.alternate && (
                    <a
                        className="-mt-2 self-end text-sm text-muted underline-offset-2 hover:underline hover:text-foreground"
                        data-testid="appDownloadPromptAlternate"
                        {...linkProps(download.alternate.href, download.platform, () => close(true))}
                    >
                        {download.alternate.label}
                    </a>
                )}
            </DialogContent>
        </Dialog>
    );
}
