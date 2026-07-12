// Confidence badge helpers for the Chat panel.
//
// The @falkordb/text-to-cypher library reports confidence on a 0-100 scale
// ("Model self-reported confidence (0-100) that the answer is correct given
// the data"). These helpers keep the rendered percentage and the styling tier
// derived from a single, sanitized value so they never disagree, and rescale
// legacy chat history that was persisted on the old 0-1 fraction scale.

export interface ConfidenceStyle {
    label: string;
    wrap: string;
    dot: string;
}

/**
 * Sanitize a live confidence value onto the 0-100 scale.
 *
 * Returns `undefined` for non-numeric or non-finite input (so no badge is
 * shown), otherwise clamps to [0, 100] and rounds so that tier selection and
 * the displayed percentage are always computed from the same integer.
 */
export function normalizeConfidence(value: unknown): number | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    return Math.round(Math.min(100, Math.max(0, value)));
}

/**
 * Rescale a confidence value read from legacy (unversioned) chat history.
 *
 * Older history stored confidence as a 0-1 fraction, so the whole payload is
 * known to be on that scale — a stored `1` unambiguously means 100%, not 1%.
 * Multiply into the 0-100 range and reuse {@link normalizeConfidence} for the
 * clamp/round/finite handling.
 */
export function migrateLegacyConfidence(value: unknown): number | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    return normalizeConfidence(value * 100);
}

// Confidence badge tiers: calm, low-saturation tints that stay readable in light and dark themes.
export function getConfidenceStyle(value: number): ConfidenceStyle {
    if (value >= 90) {
        return {
            label: "High confidence",
            wrap: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
            dot: "bg-emerald-500",
        };
    }
    if (value >= 70) {
        return {
            label: "Medium confidence",
            wrap: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/25",
            dot: "bg-amber-500",
        };
    }
    return {
        label: "Low confidence",
        wrap: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25",
        dot: "bg-rose-500",
    };
}
