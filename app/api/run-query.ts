import type { Graph } from "falkordb";
import type { QueryOptions } from "falkordb";

export const runQuery = async (graph: Graph, query: string, isReadOnly: boolean, options?: QueryOptions) =>
    isReadOnly
        ? await graph.roQuery(query, options)
        : await graph.query(query, options);
