import type { HierarchyDirection, LayoutMode, RadialDirection, ViewportState } from "@falkordb/canvas";
import type { Tab } from "./utils";

/**
 * The parts of a tab that live on the canvas rather than in React state, so
 * they have to be sampled at write time instead of mirrored on every render.
 */
export type GraphTabMeta = {
    /** Zoom and center, so a rebuilt tab lands where the user left it. */
    viewport?: ViewportState;
    /** `n:<id>` / `e:<id>`, with a trailing `:s` when the pick came from search. */
    selected?: string;
    /** Canvas layout mode, and the direction it is arranged in. */
    layout?: string;
    direction?: string;
    /** Canvas view toggles: simulation, pin-on-drag and focus mode. */
    animation?: boolean;
    pinned?: boolean;
    dimmed?: boolean;
    /** Toolbar search/filter panel open. */
    expand?: boolean;
    /** Graph info side panel expanded. */
    panelOpen?: boolean;
    /** Name of the label whose style panel is open inside the graph info panel. */
    customizing?: string;
    /** Chat panel open. Its messages are keyed by tab id + graph name. */
    chatOpen?: boolean;
};
/**
 * The serializable part of a working context — what the tab strip shows and
 * what survives a page reload. Enough to rebuild the context from scratch:
 * re-run `query` against `graphName`, then restore the metadata around it.
 */
export type GraphTab = GraphTabMeta & {
    id: string;
    graphName: string;
    query: string;
    view: Tab;
    /** User-supplied label. Falls back to the graph name when unset. */
    name?: string;
};

export type TabsState = {
    tabs: GraphTab[];
    activeTabId: string;
};

/** Connection-scoped key the whole strip is stored under. */
export const TABS_STORAGE_KEY = "graph-tabs";

/**
 * Namespace for connection-scoped keys that belong to a single tab, e.g.
 * `tab-<id>-chat-<graphName>`. Closing the tab wipes the whole namespace.
 */
export const TAB_SCOPE_PREFIX = "tab-";

/** Builds the scoped storage key for `key` within `tabId`'s namespace. */
export const tabScopedKey = (tabId: string, key: string) => `${TAB_SCOPE_PREFIX}${tabId}-${key}`;

/**
 * Bounds for the "Max Tabs" user-experience setting. The floor keeps the strip
 * useful, the ceiling keeps each tab wide enough to read its label.
 */
export const MIN_GRAPH_TABS = 4;
export const MAX_GRAPH_TABS = 10;
export const DEFAULT_GRAPH_TABS = 8;

/** Keeps a stored or user-supplied limit inside the supported range. */
export const clampMaxTabs = (value: number): number => (
    Number.isFinite(value)
        ? Math.min(Math.max(Math.round(value), MIN_GRAPH_TABS), MAX_GRAPH_TABS)
        : DEFAULT_GRAPH_TABS
);

const VALID_LAYOUTS: LayoutMode[] = ["force", "tree", "radial"];
const HIERARCHY_DIRECTION_VALUES: HierarchyDirection[] = ["td", "bu", "lr", "rl"];
const RADIAL_DIRECTION_VALUES: RadialDirection[] = ["out", "in"];

/** Falls back to the force layout for anything the canvas would not accept. */
export const normalizeLayout = (value: string | null | undefined): LayoutMode =>
    (value && VALID_LAYOUTS.includes(value as LayoutMode) ? (value as LayoutMode) : "force");

/**
 * Normalizes a stored direction against the resolved layout, so an incompatible
 * combination (e.g. `radial` + `td`) falls back to that layout's own default.
 * The force layout has no direction at all, hence the empty string.
 */
export const normalizeDirection = (layout: LayoutMode, value: string | null | undefined): string => {
    if (layout === "tree") {
        return value && HIERARCHY_DIRECTION_VALUES.includes(value as HierarchyDirection) ? value : "td";
    }
    if (layout === "radial") {
        return value && RADIAL_DIRECTION_VALUES.includes(value as RadialDirection) ? value : "out";
    }
    return "";
};

/** `gap-1` on the tab strip, and the add button's 16px icon inside `p-1`. */
const STRIP_GAP = 4;
const ADD_BUTTON_WIDTH = 24;

/**
 * CSS width cap for a single tab pill. A full strip has to fit `maxTabs` pills,
 * the add button and the gap that precedes each of them. Percentages resolve
 * against the content box, so the strip's own padding is already excluded.
 */
export const tabStripItemWidth = (maxTabs: number): string => {
    const limit = clampMaxTabs(maxTabs);
    return `calc((100% - ${ADD_BUTTON_WIDTH + STRIP_GAP * limit}px) / ${limit})`;
};

/**
 * Id of the placeholder tab that is rendered before the stored strip is read
 * back. Fixed rather than random because the tab id reaches the DOM (test ids),
 * and `crypto.randomUUID()` there is a guaranteed hydration mismatch. The
 * restore effect replaces this tab on mount, so it is never persisted.
 */
export const INITIAL_TAB_ID = "initial";

export const createTab = (): GraphTab => ({
    id: typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    graphName: "",
    query: "",
    view: "Graph",
});

/**
 * Strips the parts of a tab that only make sense while the session is alive.
 *
 * `customizing` names the label whose style panel is open. That is worth
 * carrying when the user flips between tabs, but not across a reload: the
 * panel renders in place of the graph info label list, so restoring it hides
 * that list behind a panel for a label the reloaded graph may not even have.
 */
export const forStorage = ({ customizing, ...tab }: GraphTab): GraphTab => tab;

const isViewport = (value: unknown): value is ViewportState => {
    if (typeof value !== "object" || value === null) return false;
    const viewport = value as Record<string, unknown>;
    return typeof viewport.centerX === "number"
        && typeof viewport.centerY === "number"
        && typeof viewport.zoom === "number";
};

const isGraphTab = (value: unknown): value is GraphTab => {
    if (typeof value !== "object" || value === null) return false;
    const tab = value as Partial<GraphTab>;
    return typeof tab.id === "string"
        && typeof tab.graphName === "string"
        && typeof tab.query === "string"
        && (tab.view === "Graph" || tab.view === "Table" || tab.view === "Metadata");
};

const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

const asBoolean = (value: unknown): boolean | undefined => (typeof value === "boolean" ? value : undefined);

/** Drops metadata that did not survive storage intact, keeping the tab usable. */
const normalizeTab = (tab: GraphTab): GraphTab => ({
    ...tab,
    viewport: isViewport(tab.viewport) ? tab.viewport : undefined,
    selected: asString(tab.selected),
    layout: asString(tab.layout),
    direction: asString(tab.direction),
    animation: asBoolean(tab.animation),
    pinned: asBoolean(tab.pinned),
    dimmed: asBoolean(tab.dimmed),
    expand: asBoolean(tab.expand),
    panelOpen: asBoolean(tab.panelOpen),
    customizing: asString(tab.customizing),
    chatOpen: asBoolean(tab.chatOpen),
    name: asString(tab.name),
});

/**
 * Reads a stored strip back, dropping entries that are not usable tabs and
 * metadata that did not survive storage. Returns null when nothing is left,
 * which is the caller's cue to start from a single blank tab.
 */
export const parseStoredTabs = (raw: string | null): TabsState | null => {
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as Partial<TabsState>;
        const tabs = Array.isArray(parsed?.tabs)
            ? parsed.tabs.filter(isGraphTab).map(normalizeTab)
            : [];
        if (tabs.length === 0) return null;

        return { tabs, activeTabId: asString(parsed.activeTabId) ?? "" };
    } catch {
        return null;
    }
};
