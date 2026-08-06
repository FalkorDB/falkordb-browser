"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ViewportState } from "@falkordb/canvas";
import { getConnectionItem, setConnectionItem } from "./connection-storage";
import { Tab } from "./utils";

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

type TabsState = {
    tabs: GraphTab[];
    activeTabId: string;
};

const STORAGE_KEY = "graph-tabs";

const createTab = (): GraphTab => ({
    id: typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    graphName: "",
    query: "",
    view: "Graph",
});

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
    name: asString(tab.name),
});

type Params<S> = {
    /** Connection-scoped storage is only usable once the prefix is set. */
    prefixReady: boolean;
    /**
     * Gates the restore until a stored tab can safely be acted on — rebuilding
     * one queries its graph, and querying a graph that no longer exists would
     * make FalkorDB create it.
     */
    canRestore: boolean;
    /** Re-read/reset the tab strip when the user switches connection. */
    connectionKey: string | null;
    /** Tab named by the URL on entry; wins over the stored active tab. */
    initialTabId: string;
    graphName: string;
    query: string;
    view: Tab;
    /**
     * Snapshots the live graph state (results, canvas positions, viewport, …)
     * so returning to the tab can restore it instead of re-querying.
     */
    captureSession: () => S;
    /** Samples the live canvas state that belongs in the persisted tab. */
    captureMeta: () => GraphTabMeta;
    /**
     * Applies a tab's context to the live graph state. `session` is the snapshot
     * taken when that tab was last active; it is `undefined` for a brand-new tab
     * and for tabs read back from storage after a reload, where the context has
     * to be rebuilt from the serializable fields on `tab`.
     */
    onActivate: (tab: GraphTab, session: S | undefined) => void;
};

/**
 * Multi-context tabs for the graph view, persisted per connection.
 *
 * Two layers of state:
 *  - `GraphTab` — graph name, query text, result view, viewport and selection.
 *    Serializable, so it is written to connection-scoped localStorage, shown in
 *    the strip, and used to rebuild the context after a reload.
 *  - `S` (the session) — the live, non-serializable snapshot of the results.
 *    Kept in a ref map for the lifetime of the app so switching tabs restores
 *    the previous view without a query and without re-running the simulation.
 *
 * The active tab is never written to on every keystroke — the live graph state
 * *is* its content. It is folded back into the tab list when the user switches,
 * adds or closes a tab, and when persisting. This keeps activation (which
 * updates the live state asynchronously) from racing a sync effect.
 */
export default function useGraphTabs<S>({
    prefixReady,
    canRestore,
    connectionKey,
    initialTabId,
    graphName,
    query,
    view,
    captureSession,
    captureMeta,
    onActivate,
}: Params<S>) {
    const [state, setState] = useState<TabsState>(() => {
        const tab = createTab();
        return { tabs: [tab], activeTabId: tab.id };
    });

    const live = useMemo(() => ({ graphName, query, view }), [graphName, query, view]);
    const liveRef = useRef(live);
    liveRef.current = live;

    const stateRef = useRef(state);
    stateRef.current = state;

    const captureSessionRef = useRef(captureSession);
    captureSessionRef.current = captureSession;

    const captureMetaRef = useRef(captureMeta);
    captureMetaRef.current = captureMeta;

    const onActivateRef = useRef(onActivate);
    onActivateRef.current = onActivate;

    // The URL param is spent once, at mount: the state→URL sync overwrites it as
    // soon as the strip settles, so later reads would see our own value.
    const initialTabIdRef = useRef(initialTabId);

    /** Live snapshots by tab id. Sessions hold graph objects — never persisted. */
    const sessionsRef = useRef(new Map<string, S>());

    /** Folds the live graph state into the active tab. */
    const withLive = useCallback((prev: TabsState): GraphTab[] => (
        prev.tabs.map(t => (
            t.id === prev.activeTabId
                ? { ...t, ...liveRef.current, ...captureMetaRef.current() }
                : t
        ))
    ), []);

    /** Tabs as the UI should see them: the active tab mirrors the live state. */
    const tabs = useMemo(
        () => state.tabs.map(t => (t.id === state.activeTabId ? { ...t, ...live } : t)),
        [state, live],
    );

    // Restore the strip for this connection, then hand the active tab to
    // `onActivate` so it rebuilds itself from its own metadata. Gated on
    // `canRestore` because that rebuild runs a query.
    const restoredKeyRef = useRef<string | null>(null);
    useEffect(() => {
        if (!prefixReady || !canRestore) {
            restoredKeyRef.current = null;
            return;
        }

        const key = connectionKey ?? "";
        if (restoredKeyRef.current === key) return;
        restoredKeyRef.current = key;

        // Sessions belong to the previous connection's graphs — drop them.
        sessionsRef.current.clear();

        const raw = getConnectionItem(STORAGE_KEY);
        const fresh = createTab();
        const reset = () => setState({ tabs: [fresh], activeTabId: fresh.id });

        if (!raw) {
            reset();
            return;
        }

        try {
            const parsed = JSON.parse(raw) as Partial<TabsState>;
            const restored = Array.isArray(parsed?.tabs)
                ? parsed.tabs.filter(isGraphTab).map(normalizeTab)
                : [];
            if (restored.length === 0) {
                reset();
                return;
            }

            const urlTabId = initialTabIdRef.current;
            const preferred = [urlTabId, parsed.activeTabId].find(id => restored.some(t => t.id === id));
            const activeTabId = preferred ?? restored[0].id;

            setState({ tabs: restored, activeTabId });

            // Nothing to rebuild for a tab that never picked a graph — and
            // activating it would clear a graph auto-selected in the meantime.
            const active = restored.find(t => t.id === activeTabId)!;
            if (active.graphName) onActivateRef.current(active, undefined);
        } catch {
            reset();
        }
    }, [prefixReady, canRestore, connectionKey]);

    const persist = useCallback(() => {
        // Never write before the restore has run: on mount the state is a single
        // blank tab, and saving that would erase the stored strip we are about
        // to read back.
        if (restoredKeyRef.current === null) return;

        const prev = stateRef.current;
        setConnectionItem(STORAGE_KEY, JSON.stringify({
            tabs: withLive(prev),
            activeTabId: prev.activeTabId,
        }));
    }, [withLive]);

    useEffect(() => {
        if (!prefixReady || !canRestore) return;
        persist();
    }, [prefixReady, canRestore, tabs, state.activeTabId, persist]);

    // Panning, zooming and selecting change the canvas without changing `tabs`,
    // so the effect above never sees them. Flush on the way out instead — that
    // is the only moment the unsaved value still matters.
    useEffect(() => {
        if (!prefixReady) return undefined;

        const onHide = () => {
            if (document.visibilityState === "hidden") persist();
        };

        window.addEventListener("pagehide", persist);
        document.addEventListener("visibilitychange", onHide);

        return () => {
            window.removeEventListener("pagehide", persist);
            document.removeEventListener("visibilitychange", onHide);
        };
    }, [prefixReady, persist]);

    const selectTab = useCallback((id: string) => {
        const prev = stateRef.current;
        if (id === prev.activeTabId) return;

        const target = prev.tabs.find(t => t.id === id);
        if (!target) return;

        sessionsRef.current.set(prev.activeTabId, captureSessionRef.current());
        setState({ tabs: withLive(prev), activeTabId: id });
        onActivateRef.current(target, sessionsRef.current.get(id));
    }, [withLive]);

    const addTab = useCallback(() => {
        const prev = stateRef.current;
        const tab = createTab();

        sessionsRef.current.set(prev.activeTabId, captureSessionRef.current());
        setState({ tabs: [...withLive(prev), tab], activeTabId: tab.id });
        onActivateRef.current(tab, undefined);
    }, [withLive]);

    /** Sets (or clears, when blank) a tab's custom label. */
    const renameTab = useCallback((id: string, name: string) => {
        const trimmed = name.trim();

        setState(prev => ({
            ...prev,
            // The active tab's live fields are folded in first: renaming it
            // otherwise reverts its query and view to the last folded values.
            tabs: withLive(prev).map(t => (t.id === id ? { ...t, name: trimmed || undefined } : t)),
        }));
    }, [withLive]);

    const closeTab = useCallback((id: string) => {
        const prev = stateRef.current;
        // The last tab is never closable — there is always one working context.
        if (prev.tabs.length <= 1) return;

        const index = prev.tabs.findIndex(t => t.id === id);
        if (index === -1) return;

        const wasActive = prev.activeTabId === id;
        // Closing a background tab leaves the active one live, so keep its
        // snapshot current; closing the active tab discards its snapshot.
        if (!wasActive) sessionsRef.current.set(prev.activeTabId, captureSessionRef.current());
        sessionsRef.current.delete(id);

        const remaining = withLive(prev).filter(t => t.id !== id);
        // Closing the active tab falls back to its neighbour on the right,
        // or the new last tab when it was the rightmost.
        const next = wasActive ? remaining[Math.min(index, remaining.length - 1)] : undefined;

        setState({ tabs: remaining, activeTabId: next ? next.id : prev.activeTabId });
        if (next) onActivateRef.current(next, sessionsRef.current.get(next.id));
    }, [withLive]);

    return useMemo(() => ({
        tabs,
        activeTabId: state.activeTabId,
        selectTab,
        addTab,
        renameTab,
        closeTab,
    }), [tabs, state.activeTabId, selectTab, addTab, renameTab, closeTab]);
}
