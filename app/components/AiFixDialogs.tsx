"use client";

import { useContext, useEffect, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { AiFixContext } from "./provider";
import DialogComponent from "./DialogComponent";
import Button from "./ui/Button";

export default function AiFixDialogs() {
    const { result, pendingConsentProvider, confirmConsent, cancelConsent, dismissResult, insertCorrectedQuery } = useContext(AiFixContext);
    const [dontAskAgain, setDontAskAgain] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async (text: string) => {
        await navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (pendingConsentProvider === null) setDontAskAgain(false);
    }, [pendingConsentProvider]);

    const resultOpen = result.status === "loading" || result.status === "done" || result.status === "error";

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

            {/* ── Result dialog ───────────────────────────────────────────── */}
            <DialogComponent
                title="Fix with AI"
                label="aiFixResult"
                trigger={<span className="hidden" aria-hidden />}
                open={resultOpen}
                onOpenChange={(open) => { if (!open) dismissResult(); }}
                className="sm:max-w-2xl"
            >
                <div className="flex flex-col gap-5 px-2 pb-2 min-h-[120px]" data-testid="aiFixResultBody">

                    {/* Loading */}
                    {result.status === "loading" && (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                            <Sparkles size={28} className="animate-pulse text-primary" />
                            <p className="text-sm font-medium">Asking the AI…</p>
                        </div>
                    )}

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
            </DialogComponent>
        </>
    );
}
