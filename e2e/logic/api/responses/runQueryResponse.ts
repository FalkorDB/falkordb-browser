export interface runQueryResponse {
    result: {
        metadata: {
            "Labels added": number;
            "Nodes created": number;
            "Relationships created": number;
            "Cached execution": number;
            "Query internal execution time": string;
        };
        data: Array<Record<string, any>>;
    };
}