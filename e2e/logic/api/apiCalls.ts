import { getRequest } from "../../infra/api/apiRequests";
import urls from '../../config/urls.json'
import { APIRequestContext } from "@playwright/test";
import { AddGraphResponse } from "./responses/addGraphResponse";

export class ApiCalls{

    async addGraph(data?: any): Promise<AddGraphResponse>{
        const result = await getRequest(urls.api.addGraphUrl ,data)
        const status = result.status();
        const jsonData = await result.json();
        
        return {
            ...jsonData,
            status,
        };
    }
    
}