"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getConnectionItem, removeConnectionItemsByPrefix, setConnectionItem } from "./connection-storage";
import {
    clampMaxTabs,
    createTab,
    forStorage,
    INITIAL_TAB_ID,
    parseStoredTabs,
    TAB_SCOPE_PREFIX,
    resolveEntryTabs,
    shareParams,
    withLiveLayout,
    TABS_STORAGE_KEY,
    type GraphTab,
    type GraphTabMeta,
    type LiveLayout,
    type SharedTab,
    type TabsState,
} from "./graphTabs";
import type { Tab } from "./utils";

// The tab shape and its storage helpers are pure, so they live in ./graphTabs
// and are unit-testable on their own. Re-exported here so callers keep a single
// entry point for everything tab-related.
export * from "./graphTabs";

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
    /**
     * The tutorial works on demo graphs of its own, so it gets a strip of its
     * own too: the user's tabs are neither shown nor written to while it runs,
     * and are read back from storage when it closes.
     */
    tutorialOpen: boolean;
    /** Tab named by the URL on entry; wins over the stored active tab and over `initialShare`. */
    initialTabId: string;
    /**
     * Tab handed over by a share link on entry. Opened on top of the stored
     * strip and made active, unless `initialTabId` names one of the user's own
     * tabs — then the URL is the user's own address bar, not someone's link.
     */
    initialShare: SharedTab | null;
    graphName: string;
    query: string;
    view: Tab;
    /** Each view's current layout and direction, for the address bar. */
    liveLayout: LiveLayout;
    /** How many tabs the user allows at once; `addTab` is a no-op at the cap. */
    maxTabs: number;
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
    tutorialOpen,
    initialTabId,
    initialShare,
    graphName,
    query,
    view,
    liveLayout,
    maxTabs,
    captureSession,
    captureMeta,
    onActivate,
}: Params<S>) {
    const [state, setState] = useState<TabsState>(() => {
        const tab = { ...createTab(), id: INITIAL_TAB_ID };
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

    const limit = clampMaxTabs(maxTabs);
    const limitRef = useRef(limit);
    limitRef.current = limit;

    // Captured at mount and spent by the first restore that can act on it: the
    // state→URL sync overwrites the param as soon as the strip settles, so later
    // reads would see our own value.
    const initialTabIdRef = useRef(initialTabId);
    const initialShareRef = useRef(initialShare);

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
    // The state the restore effect handed to `setState`. Its commit lands in a later
    // render, but the persist effect below runs in the *same* commit as the restore,
    // when `stateRef` still holds the pre-restore strip. Persisting then would write
    // the outgoing connection's tabs under the incoming connection's key.
    const restoredStateRef = useRef<TabsState | null>(null);
    const commitRestored = useCallback((next: TabsState) => {
        restoredStateRef.current = next;
        setState(next);
    }, []);

    const persist = useCallback(() => {
        // Never write before the restore has run: on mount the state is a single
        // blank tab, and saving that would erase the stored strip we are about
        // to read back.
        if (restoredKeyRef.current === null) return;
        // ...and not until the restored strip has actually been committed.
        if (restoredStateRef.current) {
            if (stateRef.current !== restoredStateRef.current) return;
            restoredStateRef.current = null;
        }

        const prev = stateRef.current;
        setConnectionItem(TABS_STORAGE_KEY, JSON.stringify({
            tabs: withLive(prev).map(forStorage),
            activeTabId: prev.activeTabId,
        }));
    }, [withLive]);

    // Hand the tutorial a blank strip the moment it takes over. Declared before
    // the restore effect so it runs first on the commit that opens the tutorial,
    // while the key `persist` needs is still set — the strip the tutorial hides
    // is what the restore below reads back once the tutorial ends.
    const tutorialOpenRef = useRef(false);
    useEffect(() => {
        const was = tutorialOpenRef.current;
        tutorialOpenRef.current = tutorialOpen;
        if (!tutorialOpen || was) return;

        // Panning, zooming and selecting never reach the persist effect below,
        // so the active tab holds them in the live state alone. Flush before
        // handing that state away, or the tutorial costs the user the view they
        // left behind.
        persist();

        sessionsRef.current.clear();
        const tab = createTab();
        setState({ tabs: [tab], activeTabId: tab.id });
    }, [tutorialOpen, persist]);

    useEffect(() => {
        // Dropping the key while the tutorial runs does double duty: it stops
        // `persist` from writing the tutorial's tabs over the user's, and makes
        // this effect restore them from storage once the tutorial closes.
        if (!prefixReady || !canRestore || tutorialOpen) {
            restoredKeyRef.current = null;
            return;
        }

        const key = connectionKey ?? "";
        if (restoredKeyRef.current === key) return;
        restoredKeyRef.current = key;

        // Sessions belong to the previous connection's graphs — drop them.
        sessionsRef.current.clear();

        const raw = getConnectionItem(TABS_STORAGE_KEY);
        const fresh = createTab();
        const reset = () => commitRestored({ tabs: [fresh], activeTabId: fresh.id });

        const stored = parseStoredTabs(raw);

        const urlTabId = initialTabIdRef.current;
        const shared = initialShareRef.current;
        // Spent here rather than at mount: this effect runs again when the
        // tutorial closes, and a tab named on entry must not win a second time
        // over the tab the user was actually on when the tutorial took over.
        initialTabIdRef.current = "";
        initialShareRef.current = null;

        const next = resolveEntryTabs(stored, urlTabId, shared, fresh);
        if (!next) {
            reset();
            return;
        }

        commitRestored(next);

        // Nothing to rebuild for a tab that never picked a graph — and
        // activating it would clear a graph auto-selected in the meantime.
        const active = next.tabs.find(t => t.id === next.activeTabId)!;
        if (active.graphName) onActivateRef.current(active, undefined);
    }, [prefixReady, canRestore, tutorialOpen, connectionKey, commitRestored]);

    // Structural changes only (add / close / select / rename), plus the two live
    // fields that change at human pace. `tabs` is deliberately not a dependency:
    // it also mirrors the query text, so keying on it would write to
    // localStorage on every keystroke. `persist` folds the live values in when
    // it runs, and the flush below catches whatever happened in between.
    useEffect(() => {
        if (!prefixReady || !canRestore) return;
        persist();
    }, [prefixReady, canRestore, state, graphName, view, persist]);

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
        // Lowering the setting never closes tabs, so an existing strip can sit
        // above the cap; it just cannot grow any further.
        if (prev.tabs.length >= limitRef.current) return;

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
        // Tab-scoped storage (chat history) would otherwise outlive the tab and
        // grow without bound, since ids are never reused. Only once the prefix
        // is set: unprefixed, the helper would sweep unscoped keys instead —
        // and nothing scoped can have been written yet anyway.
        if (prefixReady) removeConnectionItemsByPrefix(`${TAB_SCOPE_PREFIX}${id}-`);

        const remaining = withLive(prev).filter(t => t.id !== id);
        // Closing the active tab falls back to its neighbour on the right,
        // or the new last tab when it was the rightmost.
        const next = wasActive ? remaining[Math.min(index, remaining.length - 1)] : undefined;

        setState({ tabs: remaining, activeTabId: next ? next.id : prev.activeTabId });
        if (next) onActivateRef.current(next, sessionsRef.current.get(next.id));
    }, [withLive, prefixReady]);

    /**
     * The user ran a query against `graph`, so if that is the active tab's
     * graph, a share link's tab stops waiting for one and rebuilds itself like
     * any other from here on. A run aimed at another graph (e.g. the tutorial
     * cleaning up its demo graphs) leaves the tab waiting.
     */
    const markRan = useCallback((graph: string) => {
        // The live graph, not the stored one: the user may have picked another
        // graph in the tab since it opened.
        if (graph !== liveRef.current.graphName) return;
        setState(prev => {
            const active = prev.tabs.find(t => t.id === prev.activeTabId);
            if (!active?.awaitingRun) return prev;
            return {
                ...prev,
                tabs: prev.tabs.map(t => (t.id === active.id ? { ...t, awaitingRun: undefined } : t)),
            };
        });
    }, []);

    /**
     * Share params for the address bar, so a URL copied straight out of it
     * opens the active tab for anyone.
     */
    const activeTab = tabs.find(t => t.id === state.activeTabId);
    const activeShareParams = useMemo(
        () => (activeTab ? shareParams(withLiveLayout(activeTab, liveLayout)) : {}),
        [activeTab, liveLayout],
    );

    return useMemo(() => ({
        tabs,
        activeTabId: state.activeTabId,
        maxTabs: limit,
        selectTab,
        addTab,
        renameTab,
        closeTab,
        markRan,
        activeShareParams,
    }), [tabs, state.activeTabId, limit, selectTab, addTab, renameTab, closeTab, markRan, activeShareParams]);
}
