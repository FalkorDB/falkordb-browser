export interface AddSchemaNodeResponse {
    result: {
        metadata: string[];
        data: {
            n: {
                id: number;
                labels: string[];
                properties: {
                    [key: string]: string;
                };
            };
        }[];
    };
}