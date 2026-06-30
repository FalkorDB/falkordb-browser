"use client";

import { useContext, useEffect, useState } from "react";
import { Check, Copy, Sparkles, X } from "lucide-react";
import { AiFixContext } from "./provider";
import DialogComponent from "./DialogComponent";
import Button from "./ui/Button";
import ResizableBox from "@/components/ui/ResizableBox";
import { useResizableSize } from "@/lib/useResizableSize";

export default function AiFixDialogs() {
    const { result, pendingConsentProvider, confirmConsent, cancelConsent, dismissResult, insertCorrectedQuery } = useContext(AiFixContext);
    const [dontAskAgain, setDontAskAgain] = useState(false);
    const [copied, setCopied] = useState(false);
    const { size: panelSize, onResize: onPanelResize } = useResizableSize("ai-fix-panel-size", 480, 400, 300, 250);

    const handleCopy = async (text: string) => {
        const writer = navigator.clipboard?.writeText?.bind(navigator.clipboard);
        if (!writer) return;
        try {
            await writer(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

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
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Corrected query</span>
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                        onClick={() => void handleCopy(result.correctedQuery as string)}
                                                        data-testid="aiFixCopy"
                                                    >
                                                        {copied ? <Check size={13} /> : <Copy size={13} />}
                                                        {copied ? "Copied!" : "Copy"}
                                                    </button>
                                                </div>
                                                <pre
                                                    className="rounded-lg bg-zinc-950 text-emerald-300 text-sm font-mono p-4 overflow-auto whitespace-pre-wrap leading-relaxed"
                                                    data-testid="aiFixQuery"
                                                >
                                                    {result.correctedQuery}
                                                </pre>
                                                <Button
                                                    variant="Primary"
                                                    className="w-full mt-1"
                                                    data-testid="aiFixInsert"
                                                    onClick={() => insertCorrectedQuery(result.correctedQuery as string)}
                                                >
                                                    Insert into editor
                                                </Button>
                                            </div>
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
