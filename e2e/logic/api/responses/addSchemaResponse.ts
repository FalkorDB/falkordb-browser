export interface AddSchemaResponse {
    result: {
        metadata: string[];
        data: Array<Record<string, number>>;
    };
}
