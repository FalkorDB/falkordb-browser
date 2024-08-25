import { deleteRequest, getRequest } from "../../infra/api/apiRequests";
import urls from '../../config/urls.json'
import { AddGraphResponse } from "./responses/addGraphResponse";
import { RemoveGraphResponse } from "./responses/removeGraphResponse";

export class ApiCalls{

    async addGraph(graphName: string, data? :any): Promise<AddGraphResponse>{
        const result = await getRequest(urls.api.addGraphUrl + graphName + "?query=RETURN%201" ,data)
        const jsonData = await result.json();
        return jsonData
    }
    
    async removeGraph(graphName: string): Promise<RemoveGraphResponse>{
        const result = await deleteRequest(urls.api.deleteGraphUrl + graphName)
        const jsonData = await result.json();
        return jsonData
    }
}