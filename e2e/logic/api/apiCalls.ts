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
import { GetGraphsResponse } from "./responses/getGraphsResponse";
import { getAdminToken } from "@/e2e/infra/utils";

export default class ApiCalls {

    async login(): Promise<AuthCredentialsResponse> {
        try {
            const result = await getRequest(`${urls.api.LoginApiUrl}`);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to login. Please try again.");
        }
    }
    
    async logout(): Promise<LogoutResponse> {
        try {
            const result = await postRequest(`${urls.api.LogoutApiUrl}`);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to logout. Please try again.");
        }
    }
    
    async addGraph(graphName: string, role?: string): Promise<AddGraphResponse> {
        try {
            const headers = role === "admin" ? await getAdminToken() : undefined;
            const requestUrl = `${urls.api.graphUrl + graphName}?query=RETURN%201`;
            const result = await getRequest(requestUrl, headers);
            const jsonResponse = await result.json();
            return jsonResponse;
        } catch (error) {
            throw new Error("Failed to add graph.");
        }
    }
    
    async getGraphs(): Promise<GetGraphsResponse> {
        try {
            const result = await getRequest(`${urls.api.graphUrl}`);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to retrieve graphs.");
        }
    }
    
    async removeGraph(graphName: string): Promise<RemoveGraphResponse> {
        try {
            const result = await deleteRequest(urls.api.graphUrl + graphName);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to remove graph.");
        }
    }
    
    async changeGraphName(sourceGraph: string, destinationGraph: string): Promise<ChangeGraphNameResponse> {
        try {
            const result = await patchRequest(urls.api.graphUrl + destinationGraph + "?sourceName=" + sourceGraph);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to change graph name.");
        }
    }
    
    async exportGraph(graphName: string): Promise<void> {
        try {
            const result = await getRequest(urls.api.graphUrl + graphName + "/export");
            await result.json();
        } catch (error) {
            throw new Error("Failed to export graph.");
        }
    }
    
    async duplicateGraph(sourceGraph: string, destinationGraph: string, data?: any): Promise<DuplicateGraphresponse> {
        try {
            const result = await postRequest(urls.api.graphUrl + destinationGraph + "?sourceName=" + sourceGraph, data);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to duplicate graph.");
        }
    }
    
    async runQuery(graphName: string, query: string, role?: string): Promise<RunQueryResponse> {
        try {
            console.log(query);
            
            const headers = role === "admin" ? await getAdminToken() : undefined;
            const result = await getRequest(urls.api.graphUrl + graphName + "?query=" + query, headers);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to run query.");
        }
    }
    
    async modifySettingsRole(roleName: string, roleValue: string): Promise<ModifySettingsRoleResponse> {
        try {
            const result = await postRequest(`${urls.api.settingsConfig + roleName}&value=${roleValue}`);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to modify settings role.");
        }
    }
    
    async getSettingsRoleValue(roleName: string): Promise<GetSettingsRoleValue> {
        try {
            const result = await getRequest(urls.api.settingsConfig + roleName);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to get settings role value.");
        }
    }
    
    async getUsers(): Promise<GetUsersResponse> {
        try {
            const result = await getRequest(urls.api.settingsUsers);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to retrieve users.");
        }
    }
    
    async createUsers(data?: any): Promise<CreateUsersResponse> {
        try {
            const result = await postRequest(urls.api.settingsUsers, data);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to create users.");
        }
    }
    
    async deleteUsers(data?: any): Promise<DeleteUsersResponse> {
        try {
            const result = await deleteRequest(urls.api.settingsUsers, data);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to delete users.");
        }
    }
    
    async addSchema(schemaName: string): Promise<AddSchemaResponse> {
        try {
            const result = await getRequest(`${urls.api.graphUrl + schemaName}?query=RETURN%201`);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to add schema.");
        }
    }
    
    async removeSchema(schemaName: string): Promise<RemoveGraphResponse> {
        try {
            const result = await deleteRequest(urls.api.graphUrl + schemaName);
            return await result.json();
        } catch (error) {
            throw new Error("Failed to remove schema.");
        }
    }
    
}