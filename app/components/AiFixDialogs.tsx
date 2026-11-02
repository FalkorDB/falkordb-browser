"use client";

import { useContext, useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { AiFixContext } from "./provider";
import DialogComponent from "./DialogComponent";
import Button from "./ui/Button";
import ResizableBox from "@/components/ui/ResizableBox";
import { useResizableSize } from "@/lib/useResizableSize";
import SuggestedQuery from "./SuggestedQuery";

export default function AiFixDialogs() {
    const { result, pendingConsentProvider, confirmConsent, cancelConsent, dismissResult, insertCorrectedQuery } = useContext(AiFixContext);
    const [dontAskAgain, setDontAskAgain] = useState(false);
    const { size: panelSize, onResize: onPanelResize } = useResizableSize("ai-fix-panel-size", 480, 400, 300, 250);

    useEffect(() => {
        if (pendingConsentProvider === null) setDontAskAgain(false);
    }, [pendingConsentProvider]);

    const panelOpen = result.status === "done" || result.status === "error";

    return (
        <>
            {/* ── Consent dialog ─────────────────────────────────────────── */}
            <DialogComponent
                title="Send to AI provider?"
                label="aiFixConsent"
                trigger={<span className="hidden" aria-hidden />}
                open={pendingConsentProvider !== null}
                onOpenChange={(open) => { if (!open) cancelConsent(); }}
            >
                <div className="flex flex-col gap-5 px-2 pb-2">
                    <p className="text-sm leading-relaxed">
                        Your <span className="font-semibold">query and its error message</span> will be sent to{" "}
                        <span className="font-semibold">{pendingConsentProvider}</span> to generate a fix.
                    </p>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded accent-primary"
                            checked={dontAskAgain}
                            onChange={(e) => setDontAskAgain(e.target.checked)}
                            data-testid="aiFixDontAskAgain"
                        />
                        Don&apos;t ask again for this provider
                    </label>
                    <div className="flex gap-2 justify-end pt-1">
                        <Button variant="Secondary" onClick={cancelConsent}>Cancel</Button>
                        <Button variant="Primary" data-testid="aiFixConsentConfirm" onClick={() => confirmConsent(dontAskAgain)}>
                            Send
                        </Button>
                    </div>
                </div>
            </DialogComponent>

            {/* ── Background loading indicator (non-blocking) ────────────── */}
            {result.status === "loading" && (
                <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shadow-lg text-sm text-muted-foreground pointer-events-none select-none">
                    <Sparkles size={14} className="animate-pulse text-primary shrink-0" />
                    <span>Asking the AI…</span>
                </div>
            )}

            {/* ── Floating resizable result panel ───────────────────────── */}
            {panelOpen && (
                <div className="fixed bottom-3 left-3 z-40">
                    <ResizableBox
                        width={panelSize.width}
                        height={panelSize.height}
                        minWidth={300}
                        minHeight={250}
                        onResizeEnd={(w, h) => onPanelResize(w, h)}
                        direction="top-right"
                        className="max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-1.5rem)]"
                        data-testid="aiFixResultPanel"
                    >
                        <div className="flex flex-col h-full rounded-lg border border-border bg-background shadow-xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-primary" />
                                    <span className="text-sm font-medium">Fix with AI</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={dismissResult}
                                    className="rounded p-1 opacity-60 hover:opacity-100 hover:bg-muted transition-colors"
                                    aria-label="Close AI fix panel"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1" data-testid="aiFixResultBody">
                                {/* Error */}
                                {result.status === "error" && (
                                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
                                        <p className="text-sm text-destructive" data-testid="aiFixError">{result.error}</p>
                                        <Link href="/settings" onClick={dismissResult} className="mt-3 inline-block text-sm underline">
                                            Go to Settings
                                        </Link>
                                    </div>
                                )}

                                {/* Done */}
                                {result.status === "done" && (
                                    <>
                                        {result.explanation && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Explanation</span>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid="aiFixExplanation">
                                                    {result.explanation}
                                                </p>
                                            </div>
                                        )}

                                        {result.correctedQuery ? (
                                            <SuggestedQuery
                                                query={result.correctedQuery}
                                                title="Corrected query"
                                                onInsert={insertCorrectedQuery}
                                                testIds={{ query: "aiFixQuery", copy: "aiFixCopy", insert: "aiFixInsert" }}
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">The AI couldn&apos;t produce a corrected query.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </ResizableBox>
                </div>
            )}
        </>
    );
}
