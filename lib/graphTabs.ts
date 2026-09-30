import type { HierarchyDirection, LayoutMode, RadialDirection, ViewportState } from "@falkordb/canvas";
import type { CustomizingRef, Tab } from "./utils";

/**
 * The parts of a canvas view that live on the canvas rather than in React
 * state, so they have to be sampled at write time instead of mirrored on every
 * render. The graph view and the schema view each keep their own copy.
 */
export type ViewTabMeta = {
    /** Zoom and center, so a rebuilt view lands where the user left it. */
    viewport?: ViewportState;
    /** The picked element, in whatever form the view can resolve it again. */
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
    /** Side panel (graph info / selected element) expanded. */
    panelOpen?: boolean;
};

/** What only the graph view has. */
export type GraphViewMeta = ViewTabMeta & {
    /** Kind and name of the label or relationship whose style panel is open inside the graph info panel. */
    customizing?: CustomizingRef;
};

/**
 * The schema view is derived from the graph, so it has no query, no results and
 * no graph info of its own — only the view state it shares with the graph.
 */
export type SchemaViewMeta = ViewTabMeta;

/** Everything a tab remembers, split by the view it belongs to. */
export type GraphTabMeta = {
    graph: GraphViewMeta;
    schema: SchemaViewMeta;
    /**
     * Chat panel open. It belongs to the tab rather than to either view: its
     * messages are keyed by tab id + graph name, not by view.
     */
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
    graph: {},
    schema: {},
});

/**
 * Strips the parts of a tab that only make sense while the session is alive.
 *
 * `customizing` names the label or relationship whose style panel is open. That
 * is worth carrying when the user flips between tabs, but not across a reload:
 * the panel renders in place of the graph info label list, so restoring it hides
 * that list behind a panel for an item the reloaded graph may not even have.
 */
export const forStorage = ({ graph, ...tab }: GraphTab): GraphTab => {
    const { customizing, ...rest } = graph;
    return { ...tab, graph: rest };
};

const isViewport = (value: unknown): value is ViewportState => {
    if (typeof value !== "object" || value === null) return false;
    const viewport = value as Record<string, unknown>;
    return typeof viewport.centerX === "number"
        && typeof viewport.centerY === "number"
        && typeof viewport.zoom === "number";
};

const isView = (value: string | null): value is Tab =>
    value === "Graph" || value === "Table" || value === "Metadata" || value === "Schema";

const isGraphTab = (value: unknown): value is GraphTab => {
    if (typeof value !== "object" || value === null) return false;
    const tab = value as Partial<GraphTab>;
    return typeof tab.id === "string"
        && typeof tab.graphName === "string"
        && typeof tab.query === "string"
        && isView(tab.view ?? null);
};

const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

const asBoolean = (value: unknown): boolean | undefined => (typeof value === "boolean" ? value : undefined);

/** Drops view metadata that did not survive storage intact. */
const normalizeViewMeta = (value: unknown): ViewTabMeta => {
    const meta = (typeof value === "object" && value !== null ? value : {}) as Partial<ViewTabMeta>;

    return {
        viewport: isViewport(meta.viewport) ? meta.viewport : undefined,
        selected: asString(meta.selected),
        layout: asString(meta.layout),
        direction: asString(meta.direction),
        animation: asBoolean(meta.animation),
        pinned: asBoolean(meta.pinned),
        dimmed: asBoolean(meta.dimmed),
        expand: asBoolean(meta.expand),
        panelOpen: asBoolean(meta.panelOpen),
    };
};

const asCustomizing = (value: unknown): CustomizingRef | undefined => {
    if (typeof value !== "object" || value === null) return undefined;
    const ref = value as Partial<CustomizingRef>;
    if (ref.kind !== "node" && ref.kind !== "edge") return undefined;
    return typeof ref.name === "string" ? { kind: ref.kind, name: ref.name } : undefined;
};

/**
 * Drops metadata that did not survive storage intact, keeping the tab usable.
 * A strip written before the metadata was split per view is flat, so the tab
 * itself doubles as the graph view's metadata.
 */
const normalizeTab = (tab: GraphTab): GraphTab => {
    const graph = (tab.graph ?? tab) as Partial<GraphViewMeta & { chatOpen?: boolean }>;

    return {
        id: tab.id,
        graphName: tab.graphName,
        query: tab.query,
        view: tab.view,
        name: asString(tab.name),
        // Chat used to be stored inside the graph view's metadata.
        chatOpen: asBoolean(tab.chatOpen) ?? asBoolean(graph.chatOpen),
        graph: {
            ...normalizeViewMeta(graph),
            customizing: asCustomizing(graph.customizing),
        },
        schema: normalizeViewMeta(tab.schema),
    };
};

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

/**
 * URL params a share link carries. Only what means the same thing on someone
 * else's machine: which graph, which query, which view, and how it is laid
 * out. Viewport, selection and panel state belong to one screen and one
 * session, so they stay behind.
 */
export const SHARE_PARAM_KEYS = ["graph", "query", "view", "layout", "direction"] as const;

/** The portable part of a tab, as a share link hands it over. */
export type SharedTab = Pick<GraphTab, "graphName" | "query" | "view"> & {
    layout?: string;
    direction?: string;
};

/** The view metadata a tab's layout lives in — the schema view keeps its own. */
const layoutMeta = (tab: Pick<GraphTab, "view" | "graph" | "schema">): ViewTabMeta =>
    (tab.view === "Schema" ? tab.schema : tab.graph);

/**
 * Builds the link that opens `tab` for someone else. Built on demand rather
 * than kept in the address bar: the URL only ever names the user's own tab,
 * so a copied link is a snapshot that later work in the tab does not change.
 */
export const buildShareUrl = (tab: GraphTab, base: string): string => {
    const url = new URL("/graph", base);
    const { layout, direction } = layoutMeta(tab);
    const values: Record<(typeof SHARE_PARAM_KEYS)[number], string | undefined> = {
        graph: tab.graphName,
        query: tab.query,
        view: tab.view,
        layout,
        direction,
    };

    SHARE_PARAM_KEYS.forEach(key => {
        const value = values[key];
        if (value) url.searchParams.set(key, value);
    });

    return url.toString();
};

/**
 * Reads a share link back. Null unless it names a graph — without one there is
 * nothing to open. An unknown view falls back to the graph view.
 */
export const parseSharedTab = (search: string): SharedTab | null => {
    const params = new URLSearchParams(search);
    const graphName = params.get("graph");
    if (!graphName) return null;

    const view = params.get("view");

    return {
        graphName,
        query: params.get("query") ?? "",
        view: isView(view) ? view : "Graph",
        layout: params.get("layout") ?? undefined,
        direction: params.get("direction") ?? undefined,
    };
};

/**
 * Opens a shared tab on top of the stored strip. A tab that already holds the
 * same graph and query is reused — opening your own link must not duplicate
 * it — otherwise the shared context gets a tab of its own (`fresh` supplies
 * the id), even past the tab limit: the user asked for it explicitly, and the
 * strip already copes with sitting above the cap.
 */
export const withSharedTab = (stored: TabsState | null, shared: SharedTab, fresh: GraphTab): TabsState => {
    const tabs = stored?.tabs ?? [];
    const existing = tabs.find(t => t.graphName === shared.graphName && t.query === shared.query);
    if (existing) return { tabs, activeTabId: existing.id };

    const { layout, direction, ...rest } = shared;
    const meta: ViewTabMeta = layout ? { layout, direction } : {};
    const tab: GraphTab = {
        ...fresh,
        ...rest,
        graph: shared.view === "Schema" ? {} : meta,
        schema: shared.view === "Schema" ? meta : {},
    };

    return { tabs: [...tabs, tab], activeTabId: tab.id };
};
