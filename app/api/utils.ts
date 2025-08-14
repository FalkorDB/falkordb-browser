import { Graph } from "falkordb";
import { Role } from "next-auth";

// eslint-disable-next-line import/prefer-default-export
export const runQuery = async (graph: Graph, query: string, role: Role) => {
    const result = role === "Read-Only" ? await graph.roQuery(query) : await graph.query(query);
    return result;
}