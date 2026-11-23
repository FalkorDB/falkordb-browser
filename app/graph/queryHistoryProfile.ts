import type { HistoryQuery, Query } from "../../lib/utils.ts";
import { getStatsLines } from "../../lib/queryStats.ts";

type QueryIdentity = Pick<Query, "text" | "timestamp">;
export type QueryHistoryTab = "text" | "metadata" | "explain" | "profile";

export function getSelectedHistoryQuery(history: HistoryQuery): Query | undefined {
    return history.counter > 0 ? history.queries[history.counter - 1] : undefined;
}

export function isQueryHistoryTabEnabled(history: HistoryQuery, tab: QueryHistoryTab): boolean {
    const selectedQuery = getSelectedHistoryQuery(history);
    if (tab === "text") return true;
    if (tab === "metadata") return !!selectedQuery && getStatsLines(selectedQuery).length > 0;
    if (tab === "explain") return !!selectedQuery && selectedQuery.explain.length > 0;
    return !!selectedQuery;
}

export type QueryHistoryProfileUpdate = {
    target: QueryIdentity;
    profile: string[];
    connectionEpoch: number;
};

export function updateQueryHistoryProfile(
    history: HistoryQuery,
    target: QueryIdentity,
    profile: string[],
    expectedConnectionEpoch: number,
    connectionEpoch: number
): HistoryQuery | undefined {
    if (expectedConnectionEpoch !== connectionEpoch) return undefined;

    const selectedIndex = history.queries.findIndex(query =>
        query.timestamp === target.timestamp && query.text === target.text
    );
    const isCurrentQuery = history.currentQuery.timestamp === target.timestamp
        && history.currentQuery.text === target.text;

    if (selectedIndex === -1 && !isCurrentQuery) return undefined;

    const queries = selectedIndex === -1
        ? history.queries
        : history.queries.map((query, index) => index === selectedIndex
            ? { ...query, profile }
            : query
        );

    return {
        ...history,
        currentQuery: isCurrentQuery
            ? { ...history.currentQuery, profile }
            : history.currentQuery,
        queries
    };
}

export function applyQueryHistoryProfileUpdates(
    history: HistoryQuery,
    updates: QueryHistoryProfileUpdate[],
    connectionEpoch: number
): HistoryQuery {
    return updates.reduce((current, update) => (
        updateQueryHistoryProfile(
            current,
            update.target,
            update.profile,
            update.connectionEpoch,
            connectionEpoch
        ) ?? current
    ), history);
}

export function retainPendingQueryHistoryProfileUpdates(
    history: HistoryQuery,
    updates: QueryHistoryProfileUpdate[],
    connectionEpoch: number,
    isQueryLoading: boolean
): QueryHistoryProfileUpdate[] {
    if (!isQueryLoading) return [];

    return updates.filter(update => {
        if (update.connectionEpoch !== connectionEpoch) return false;

        const matchesTarget = (query: Query) => (
            query.timestamp === update.target.timestamp && query.text === update.target.text
        );
        return history.queries.some(matchesTarget) || matchesTarget(history.currentQuery);
    });
}

export function reconcilePendingQueryHistoryProfileUpdates(
    history: HistoryQuery,
    updates: QueryHistoryProfileUpdate[],
    connectionEpoch: number,
    isQueryLoading: boolean,
    setHistoryQuery: (update: (previous: HistoryQuery) => HistoryQuery) => void
): { updated: HistoryQuery; retained: QueryHistoryProfileUpdate[] } {
    const retained = retainPendingQueryHistoryProfileUpdates(
        history,
        updates,
        connectionEpoch,
        isQueryLoading
    );
    const ready = updates.filter(update => !retained.includes(update));
    const updated = applyQueryHistoryProfileUpdates(history, ready, connectionEpoch);

    if (ready.length > 0) {
        setHistoryQuery(previous => applyQueryHistoryProfileUpdates(previous, ready, connectionEpoch));
    }

    return { updated, retained };
}
