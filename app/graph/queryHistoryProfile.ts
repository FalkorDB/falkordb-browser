import type { HistoryQuery, Query } from "../../lib/utils.ts";

type QueryIdentity = Pick<Query, "text" | "timestamp">;

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
