"use client";

import { useContext } from "react";
import { Sparkles } from "lucide-react";
import { AiFixContext } from "./provider";
import Button from "./ui/Button";

// Shown only after a failed query, only when AI is configured with a supported
// (OpenAI-compatible) provider, and only while the failed query is still the editor's
// content. Sends the query + error to the configured provider on an explicit click.
export default function AiFixButton({ currentQuery }: { currentQuery: string }) {
    const { aiFixSupported, lastFailure, requestAiFix, result } = useContext(AiFixContext);

    if (!aiFixSupported || !lastFailure || lastFailure.query.trim() !== currentQuery.trim()) return null;

    const loading = result.status === "loading";

    return (
        <Button
            data-testid="fix-with-ai"
            variant="Secondary"
            title="Explain and fix this query with AI"
            disabled={loading}
            onClick={() => requestAiFix(lastFailure.query, lastFailure.errorMessage)}
        >
            <Sparkles size={16} />
            {loading ? "Fixing…" : "Fix with AI"}
        </Button>
    );
}
