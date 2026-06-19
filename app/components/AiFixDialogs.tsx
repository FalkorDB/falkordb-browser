"use client";

import { useContext, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { AiFixContext } from "./provider";
import DialogComponent from "./DialogComponent";
import Button from "./ui/Button";

// Renders the first-use consent dialog (hosted providers) and the AI-fix result dialog.
// Driven entirely by AiFixContext so it can live once in the provider tree.
export default function AiFixDialogs() {
    const { result, pendingConsentProvider, confirmConsent, cancelConsent, dismissResult, insertCorrectedQuery } = useContext(AiFixContext);
    const [dontAskAgain, setDontAskAgain] = useState(false);

    // Reset the opt-out whenever the consent dialog closes, so a previous check (even if
    // the user then cancelled) doesn't silently carry into the next prompt.
    useEffect(() => {
        if (pendingConsentProvider === null) setDontAskAgain(false);
    }, [pendingConsentProvider]);

    const resultOpen = result.status === "loading" || result.status === "done" || result.status === "error";

    return (
        <>
            <DialogComponent
                title="Send to AI provider?"
                label="aiFixConsent"
                trigger={<span className="hidden" aria-hidden />}
                open={pendingConsentProvider !== null}
                onOpenChange={(open) => { if (!open) cancelConsent(); }}
            >
                <div className="flex flex-col gap-4 p-2">
                    <p className="text-sm">
                        To fix this query, your <b>query and its error message</b> will be sent to{" "}
                        <b>{pendingConsentProvider}</b>. Continue?
                    </p>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={dontAskAgain}
                            onChange={(e) => setDontAskAgain(e.target.checked)}
                            data-testid="aiFixDontAskAgain"
                        />
                        Don&apos;t ask again for this provider
                    </label>
                    <div className="flex gap-2 justify-end">
                        <Button variant="Secondary" onClick={cancelConsent}>Cancel</Button>
                        <Button variant="Primary" data-testid="aiFixConsentConfirm" onClick={() => confirmConsent(dontAskAgain)}>Send</Button>
                    </div>
                </div>
            </DialogComponent>

            <DialogComponent
                title="Fix with AI"
                label="aiFixResult"
                trigger={<span className="hidden" aria-hidden />}
                open={resultOpen}
                onOpenChange={(open) => { if (!open) dismissResult(); }}
            >
                <div className="flex flex-col gap-4 p-2" data-testid="aiFixResultBody">
                    {result.status === "loading" && (
                        <p className="text-sm flex items-center gap-2"><Sparkles size={16} className="animate-pulse" /> Asking the AI…</p>
                    )}
                    {result.status === "error" && (
                        <p className="text-sm text-destructive" data-testid="aiFixError">{result.error}</p>
                    )}
                    {result.status === "done" && (
                        <>
                            {result.explanation && (
                                <p className="text-sm whitespace-pre-wrap" data-testid="aiFixExplanation">{result.explanation}</p>
                            )}
                            {result.correctedQuery ? (
                                <>
                                    <pre className="text-xs bg-muted rounded p-2 overflow-auto whitespace-pre-wrap" data-testid="aiFixQuery">{result.correctedQuery}</pre>
                                    <div className="flex justify-end">
                                        <Button variant="Primary" data-testid="aiFixInsert" onClick={() => insertCorrectedQuery(result.correctedQuery as string)}>
                                            Insert into editor
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs opacity-75">The AI couldn&apos;t produce a corrected query.</p>
                            )}
                        </>
                    )}
                </div>
            </DialogComponent>
        </>
    );
}
