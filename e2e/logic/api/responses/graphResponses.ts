/* eslint-disable @typescript-eslint/no-explicit-any */
import type { QueryStatistics } from "falkordb";

export interface AddGraphResponse {
  result: {
    stats: QueryStatistics;
    data: {
      [key: string]: number;
    }[];
  };
}

export interface RemoveGraphResponse {
  message: string;
}

export interface GetGraphsResponse {
  opts: string[];
}

export interface DuplicateGraphresponse {
  /** Name of the new graph */
  result: string;
}

export interface ChangeGraphNameResponse {
  data: boolean;
}

export interface RunQueryResponse {
  stats: QueryStatistics;
  data: Array<Record<string, any>>;
}

export interface GraphCountResponse {
  result: {
    nodes: number;
    edges: number;
  };
}

export interface GraphNodeResponse {
  message: string;
}

export interface GraphAttributeResponse {
  result: {
    metadata: string[];
  };
}
