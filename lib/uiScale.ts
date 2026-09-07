/**
 * The "Text Size" user-experience setting, expressed as a percentage of the
 * default type scale. It is published to CSS as `--ui-font-scale` (a plain
 * multiplier), which every Tailwind `text-*` utility multiplies its font size
 * by — see the `@theme` block in `app/globals.css`.
 */

/** Bounds for the setting, in percent. */
export const MIN_UI_FONT_SCALE = 80;
export const MAX_UI_FONT_SCALE = 150;
export const DEFAULT_UI_FONT_SCALE = 100;
export const UI_FONT_SCALE_STEP = 5;

export const UI_FONT_SCALE_STORAGE_KEY = "uiFontScale";
export const UI_FONT_SCALE_VAR = "--ui-font-scale";

/** Keeps a stored or user-supplied percentage inside the supported range. */
export const clampUiFontScale = (value: number): number => (
    Number.isFinite(value)
        ? Math.min(Math.max(Math.round(value), MIN_UI_FONT_SCALE), MAX_UI_FONT_SCALE)
        : DEFAULT_UI_FONT_SCALE
);

/** Turns the percentage into the multiplier CSS consumes. */
export const uiFontScaleMultiplier = (value: number): number => clampUiFontScale(value) / 100;

/** Writes the multiplier onto the document root, rescaling every text utility. */
export const applyUiFontScale = (value: number): void => {
    document.documentElement.style.setProperty(UI_FONT_SCALE_VAR, uiFontScaleMultiplier(value).toString());
};
