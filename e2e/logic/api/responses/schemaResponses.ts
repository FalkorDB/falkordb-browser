export interface AddSchemaResponse {
  result: {
    metadata: string[];
    data: Array<Record<string, number>>;
  };
}

export interface SchemaListResponse {
  opts: string[];
}

export interface RemoveSchemaResponse {
  message: string;
}
