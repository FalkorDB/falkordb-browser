export interface GraphCounts {
    totalCount: number;
    loadedCount: number;
    offloadedCount: number;
}

/**
 * Header graph counts. GRAPH.STUBS names the offloaded graphs; whether GRAPH.LIST
 * also names them differs by server, so count a listed name as loaded only when
 * it is not offloaded — correct either way, and never negative.
 */
export function graphCounts(names: readonly string[], offloaded: readonly string[], supportsOffload: boolean): GraphCounts {
    if (!supportsOffload) return { totalCount: names.length, loadedCount: names.length, offloadedCount: 0 };
    const offloadedNames = new Set(offloaded);
    const loadedCount = new Set(names.filter((name) => !offloadedNames.has(name))).size;
    return { totalCount: loadedCount + offloadedNames.size, loadedCount, offloadedCount: offloadedNames.size };
}
