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
 * Reconcile a confidence value read from legacy (unversioned) chat history,
 * whose scale is not recorded per value.
 *
 * Bare-array histories can contain values from two eras: older builds stored a
 * 0-1 fraction, while newer builds (still writing bare arrays) already stored a
 * 0-100 value. Disambiguate by magnitude since a 0-1 fraction can never exceed
 * 1:
 *   - `value > 1`     -> already on the 0-100 scale, normalize as-is
 *   - `0 < value < 1` -> a 0-1 fraction, rescaled to 0-100
 *   - `value <= 0`    -> 0 on either scale
 *   - `value === 1`   -> ambiguous (1% vs 100%); omitted so it is never
 *                        mislabelled in either direction
 */
export function migrateLegacyConfidence(value: unknown): number | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    if (value === 1) return undefined;
    if (value > 0 && value < 1) return normalizeConfidence(value * 100);
    return normalizeConfidence(value);
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
