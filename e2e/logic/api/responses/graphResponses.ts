/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AddGraphResponse {
  result: {
    metadata: string[];
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
  success: string;
}

export interface ChangeGraphNameResponse {
  data: boolean;
}

export interface RunQueryResponse {
  metadata: {
    "Labels added": number;
    "Nodes created": number;
    "Relationships created": number;
    "Cached execution": number;
    "Query internal execution time": string;
  };
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
