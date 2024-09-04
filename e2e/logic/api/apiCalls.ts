import { deleteRequest, getRequest, postRequest } from "../../infra/api/apiRequests";
import urls from '../../config/urls.json'
import { AddGraphResponse } from "./responses/addGraphResponse";
import { RemoveGraphResponse } from "./responses/removeGraphResponse";
import { ModifySettingsRoleResponse } from "./responses/modifySettingsRoleResponse";

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

    async modifySettingsRole(roleName: string, roleValue : string, data? :any): Promise<ModifySettingsRoleResponse>{
        const result = await postRequest(urls.api.settingsConfig + roleName + "&value=" + roleValue, data)
        const jsonData = await result.json();
        return jsonData
    }
}