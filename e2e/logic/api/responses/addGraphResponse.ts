export interface AddGraphResponse {
  result: {
    metadata: string[];
    data: {
      [key: string]: number;
    }[];
  };
}