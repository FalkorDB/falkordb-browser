/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { deleteRequest, getRequest, patchRequest, postRequest } from "../../infra/api/apiRequests";
import urls from '../../config/urls.json'
import { AddGraphResponse } from "./responses/addGraphResponse";
import { RemoveGraphResponse } from "./responses/removeGraphResponse";
import { ModifySettingsRoleResponse } from "./responses/modifySettingsRoleResponse";
import { GetSettingsRoleValue } from "./responses/getSettingsRoleValue";
import { CreateUsersResponse } from "./responses/createUsersResponse";
import { DeleteUsersResponse } from "./responses/deleteUsersResponse";
import { RunQueryResponse } from "./responses/runQueryResponse";
import { GetUsersResponse } from "./responses/getUsersResponse";
import { DuplicateGraphresponse } from "./responses/duplicateGraph";
import { ChangeGraphNameResponse } from "./responses/changeGraphNameResponse";
import { AuthCredentialsResponse } from "./responses/LoginResponse";
import { LogoutResponse } from "./responses/logoutResponse";
import { AddSchemaResponse } from "./responses/addSchemaResponse";

export default class ApiCalls {

    async login(): Promise<AuthCredentialsResponse> {
        const result = await getRequest(`${urls.api.LoginApiUrl}`)
        const jsonData = await result.json();
        return jsonData
    }

    async logout(): Promise<LogoutResponse> {
        const result = await postRequest(`${urls.api.LogoutApiUlr}`)
        const jsonData = await result.json();
        return jsonData
    }

    async addGraph(graphName: string): Promise<AddGraphResponse> {
        const result = await getRequest(`${urls.api.graphUrl + graphName}?query=RETURN%201`)
        const jsonData = await result.json();
        return jsonData
    }

    async getGraphs(): Promise<GetGraphsResponse> {
        const result = await getRequest(`${urls.api.graphUrl}`)
        const jsonData = await result.json();
        return jsonData
    }

    async removeGraph(graphName: string): Promise<RemoveGraphResponse> {
        const result = await deleteRequest(urls.api.graphUrl + graphName)
        const jsonData = await result.json();
        return jsonData
    }

    async changeGraphName(sourceGraph: string, destinationGraph: string): Promise<ChangeGraphNameResponse> {
        const result = await patchRequest(urls.api.graphUrl + destinationGraph + "?sourceName=" +  sourceGraph)
        const jsonData = await result.json();
        return jsonData
    }

    async exportGraph(graphName: string): Promise<void> {
        const result = await getRequest(urls.api.graphUrl + graphName + "/export")
        const jsonData = await result.json();
        return jsonData
    }

    async duplicateGraph(sourceGraph: string, destinationGraph: string, data?: any): Promise<DuplicateGraphresponse> {
        const result = await postRequest(urls.api.graphUrl + destinationGraph + "?sourceName=" + sourceGraph, data)
        const jsonData = await result.json();
        return jsonData
    }

    async runQuery(query: string): Promise<RunQueryResponse> {
        const result = await getRequest(urls.api.graphUrl + query)
        const jsonData = await result.json();
        return jsonData
    }

    async modifySettingsRole(roleName: string, roleValue: string): Promise<ModifySettingsRoleResponse> {
        const result = await postRequest(`${urls.api.settingsConfig + roleName}&value=${roleValue}`)
        const jsonData = await result.json();
        return jsonData
    }

    async getSettingsRoleValue(roleName: string): Promise<GetSettingsRoleValue> {
        const result = await getRequest(urls.api.settingsConfig + roleName)
        const jsonData = await result.json();
        return jsonData
    }

    async getUsers(): Promise<GetUsersResponse> {
        const result = await getRequest(urls.api.settingsUsers)
        const jsonData = await result.json();
        return jsonData
    }

    async createUsers(): Promise<CreateUsersResponse> {
        const result = await postRequest(urls.api.settingsUsers)
        const jsonData = await result.json();
        return jsonData
    }

    async deleteUsers(): Promise<DeleteUsersResponse> {
        const result = await deleteRequest(urls.api.settingsUsers)
        const jsonData = await result.json();
        return jsonData
    }

    async addSchema(schemaName: string): Promise<AddSchemaResponse> {
        const result = await getRequest(`${urls.api.graphUrl + schemaName}?query=RETURN%201`)
        const jsonData = await result.json();
        return jsonData
    }

    async removeSchema(schemaName: string): Promise<RemoveGraphResponse> {
        const result = await deleteRequest(urls.api.graphUrl + schemaName)
        const jsonData = await result.json();
        return jsonData
    }
}