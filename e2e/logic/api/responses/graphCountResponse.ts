export interface GraphCountResponse {
  result: {
    data: {
      nodes: number;
      edges: number;
    }[];
  };
}
