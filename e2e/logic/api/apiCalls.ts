/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { deleteRequest, getRequest, postRequest } from "../../infra/api/apiRequests";
import urls from '../../config/urls.json'
import { AddGraphResponse } from "./responses/addGraphResponse";
import { RemoveGraphResponse } from "./responses/removeGraphResponse";
import { ModifySettingsRoleResponse } from "./responses/modifySettingsRoleResponse";
import { GetSettingsRoleValue } from "./responses/getSettingsRoleValue";
import { CreateUsersResponse } from "./responses/createUsersResponse";
import { DeleteUsersResponse } from "./responses/deleteUsersResponse";
import { RunQueryResponse } from "./responses/runQueryResponse";
import { GetUsersResponse } from "./responses/getUsersResponse";

export default class ApiCalls {

    async addGraph(graphName: string, data?: any): Promise<AddGraphResponse> {
        const result = await getRequest(`${urls.api.addGraphUrl + graphName}?query=RETURN%201`, data)
        const jsonData = await result.json();
        return jsonData
    }

    async removeGraph(graphName: string): Promise<RemoveGraphResponse> {
        const result = await deleteRequest(urls.api.deleteGraphUrl + graphName)
        const jsonData = await result.json();
        return jsonData
    }

    async modifySettingsRole(roleName: string, roleValue: string, data?: any): Promise<ModifySettingsRoleResponse> {
        const result = await postRequest(`${urls.api.settingsConfig + roleName}&value=${roleValue}`, data)
        const jsonData = await result.json();
        return jsonData
    }

    async getSettingsRoleValue(roleName: string, data?: any): Promise<GetSettingsRoleValue> {
        const result = await getRequest(urls.api.settingsConfig + roleName, data)
        const jsonData = await result.json();
        return jsonData
    }

    async getUsers(data?: any): Promise<GetUsersResponse> {
        const result = await getRequest(urls.api.settingsUsers, data)
        const jsonData = await result.json();
        return jsonData
    }

    async createUsers(data?: any): Promise<CreateUsersResponse> {
        const result = await postRequest(urls.api.settingsUsers, data)
        const jsonData = await result.json();
        return jsonData
    }

    async deleteUsers(data?: any): Promise<DeleteUsersResponse> {
        const result = await postRequest(urls.api.settingsUsers, data)
        const jsonData = await result.json();
        return jsonData
    }

    async runQuery(query: string, data?: any): Promise<RunQueryResponse> {
        const result = await getRequest(urls.api.runQueryUrl + query, data)
        const jsonData = await result.json();
        return jsonData
    }
}