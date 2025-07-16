/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAdminToken } from "@/e2e/infra/utils";
import { APIRequestContext } from "playwright";
import { EventSource } from "eventsource";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "../../infra/api/apiRequests";
import urls from "../../config/urls.json";
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
import { SchemaListResponse } from "./responses/getSchemaResponse";
import { GraphCountResponse } from "./responses/graphCountResponse";
import { GraphNodeResponse } from "./responses/graphNodeResponse";
import { GraphAttributeResponse } from "./responses/graphAttributeResponse";

export async function getSSEGraphResult(
  url: string,
  headers?: Record<string, string>
): Promise<any> {
  try {
    // Always get the admin token and add it to headers
    const adminHeaders = await getAdminToken();
    const mergedHeaders = { ...adminHeaders, ...headers };

    return await new Promise((resolve, reject) => {
      let handled = false;

      // Configure EventSource with custom fetch for headers support
      const eventSourceInit: any = {};
      const finalUrl = url;

      // If we have headers (which contains cookies for admin auth), use custom fetch
      if (mergedHeaders && mergedHeaders.Cookie) {
        eventSourceInit.fetch = (input: string, init?: RequestInit) =>
          fetch(input, {
            ...init,
            headers: {
              ...init?.headers,
              ...mergedHeaders,
            },
          });
      }

      const evtSource = new EventSource(finalUrl, eventSourceInit);

      evtSource.addEventListener("result", (event: MessageEvent) => {
        const result = JSON.parse(event.data);
        evtSource.close();
        resolve(result);
      });

      evtSource.addEventListener("error", (event: MessageEvent) => {
        handled = true;
        const { message } = JSON.parse(event.data);
        evtSource.close();
        reject(message);
      });

      evtSource.onerror = () => {
        if (handled) return;
        evtSource.close();
        reject(new Error("Network or server error"));
      };
    });
  } catch (error) {
    throw new Error(`Failed to run query. \n Error: ${error}`);
  }
}

export default class ApiCalls {
  async login(
    request: APIRequestContext,
    username?: string,
    password?: string
  ): Promise<AuthCredentialsResponse> {
    try {
      const result = await getRequest(
        `${urls.api.LoginApiUrl}`,
        undefined,
        { username, password },
        request
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to login. Please try again. \n Error: ${
          (error as Error).message
        }`
      );
    }
  }

  async logout(): Promise<LogoutResponse> {
    try {
      const result = await postRequest(`${urls.api.LogoutApiUrl}`);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to logout. Please try again. \n Error: ${
          (error as Error).message
        }`
      );
    }
  }

  async addGraph(graphName: string): Promise<AddGraphResponse> {
    try {
      const requestUrl = `${urls.api.graphUrl + graphName}?query=RETURN%201`;
      const jsonResponse = await getSSEGraphResult(requestUrl);
      return jsonResponse;
    } catch (error) {
      throw new Error(
        `Failed to add graph. \n Error: ${(error as Error).message}`
      );
    }
  }

  async getGraphs(): Promise<GetGraphsResponse> {
    try {
      const result = await getRequest(`${urls.api.graphUrl}`);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to retrieve graphs. \n Error: ${(error as Error).message}`
      );
    }
  }

  async removeGraph(
    graphName: string,
    role?: string
  ): Promise<RemoveGraphResponse> {
    try {
      const headers = role === "admin" ? await getAdminToken() : undefined;
      const result = await deleteRequest(
        urls.api.graphUrl + graphName,
        headers
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to remove graph. \n Error: ${(error as Error).message}`
      );
    }
  }

  async changeGraphName(
    sourceGraph: string,
    destinationGraph: string
  ): Promise<ChangeGraphNameResponse> {
    try {
      const result = await patchRequest(
        `${urls.api.graphUrl + destinationGraph}?sourceName=${sourceGraph}`
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to change graph name. \n Error: ${(error as Error).message}`
      );
    }
  }

  async exportGraph(graphName: string): Promise<void> {
    try {
      const result = await getRequest(
        `${urls.api.graphUrl + graphName}/export`
      );
      await result.json();
    } catch (error) {
      throw new Error(
        `Failed to export graph. \n Error: ${(error as Error).message}`
      );
    }
  }

  async duplicateGraph(
    sourceGraph: string,
    destinationGraph: string,
    data?: any
  ): Promise<DuplicateGraphresponse> {
    try {
      const result = await postRequest(
        `${urls.api.graphUrl + destinationGraph}?sourceName=${sourceGraph}`,
        data
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to duplicate graph. \n Error: ${(error as Error).message}`
      );
    }
  }

  async runQuery(
    graphName: string,
    query: string,
  ): Promise<RunQueryResponse> {
    try {
      const url = `${urls.api.graphUrl}${graphName}?query=${encodeURIComponent(
        query
      )}`;
      return await getSSEGraphResult(url);
    } catch (error) {
      console.error(error);
      throw new Error(
        `Failed to run query. \n Error: ${(error as Error).message}`
      );
    }
  }

  async getGraphCount(
    graph: string,
  ): Promise<GraphCountResponse> {
    try {
      const result = await getSSEGraphResult(
        `${urls.api.graphUrl}${graph}/count`,
      );

      return { result };
    } catch (error) {
      throw new Error(
        `Failed to get graph count. \n Error: ${(error as Error).message}`
      );
    }
  }

  async addGraphNodeLabel(
    graph: string,
    node: string,
    data: Record<string, string>
  ): Promise<GraphNodeResponse> {
    try {
      const result = await postRequest(
        `${urls.api.graphUrl}${graph}/${node}/label`,
        data
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to add graph node label. \n Error: ${(error as Error).message}`
      );
    }
  }

  async deleteGraphNodeLabel(
    graph: string,
    node: string,
    data: Record<string, string>
  ): Promise<GraphNodeResponse> {
    try {
      const result = await deleteRequest(
        `${urls.api.graphUrl}${graph}/${node}/label`,
        undefined,
        data
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to delete graph node label. \n Error: ${
          (error as Error).message
        }`
      );
    }
  }

  async deleteGraphNode(
    graph: string,
    node: string,
    data: Record<string, string>
  ): Promise<GraphNodeResponse> {
    try {
      const result = await deleteRequest(
        `${urls.api.graphUrl}${graph}/${node}`,
        undefined,
        data
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to delete graph node. \n Error: ${(error as Error).message}`
      );
    }
  }

  async addGraphNodeAttribute(
    graph: string,
    node: string,
    attribute: string,
    data: Record<string, string | boolean>
  ): Promise<GraphAttributeResponse> {
    try {
      const result = await postRequest(
        `${urls.api.graphUrl}${graph}/${node}/${attribute}`,
        data
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to add graph node attribute. \n Error: ${
          (error as Error).message
        }`
      );
    }
  }

  async deleteGraphNodeAttribute(
    graph: string,
    node: string,
    attribute: string,
    data: Record<string, boolean>
  ): Promise<GraphAttributeResponse> {
    try {
      const result = await deleteRequest(
        `${urls.api.graphUrl}${graph}/${node}/${attribute}`,
        undefined,
        data
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to delete graph node attribute. \n Error: ${
          (error as Error).message
        }`
      );
    }
  }

  async modifySettingsRole(
    roleName: string,
    roleValue: string
  ): Promise<ModifySettingsRoleResponse> {
    try {
      const result = await postRequest(
        `${urls.api.settingsConfig + roleName}?value=${roleValue}`
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to modify settings role. \n Error: ${(error as Error).message}`
      );
    }
  }

  async getSettingsRoleValue(roleName: string): Promise<GetSettingsRoleValue> {
    try {
      const result = await getRequest(urls.api.settingsConfig + roleName);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to get settings role value. \n Error: ${
          (error as Error).message
        }`
      );
    }
  }

  async getUsers(): Promise<GetUsersResponse> {
    try {
      const result = await getRequest(urls.api.settingsUsers);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to retrieve users. \n Error: ${(error as Error).message}`
      );
    }
  }

  async createUsers(
    data?: any,
    request?: APIRequestContext
  ): Promise<CreateUsersResponse> {
    try {
      const result = await postRequest(urls.api.settingsUsers, data, request);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to create users. \n Error: ${(error as Error).message}`
      );
    }
  }

  async deleteUsers(data?: any): Promise<DeleteUsersResponse> {
    try {
      const result = await deleteRequest(
        urls.api.settingsUsers,
        undefined,
        data
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to delete users. \n Error: ${(error as Error).message}`
      );
    }
  }

  async addSchema(schemaName: string): Promise<AddSchemaResponse> {
    try {
      const result = await postRequest(`${urls.api.schemaUrl + schemaName}`);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to add schema. \n Error: ${(error as Error).message}`
      );
    }
  }

  async removeSchema(schemaName: string): Promise<RemoveGraphResponse> {
    try {
      const result = await deleteRequest(urls.api.schemaUrl + schemaName);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to remove schema. \n Error: ${(error as Error).message}`
      );
    }
  }

  async runSchemaQuery(
    schemaName: string,
    schema: string,
  ): Promise<AddSchemaResponse> {
    try {
      const url = `${
        urls.api.graphUrl + schemaName
      }_schema?query=${encodeURIComponent(schema)}`;
      return await getSSEGraphResult(url);
    } catch (error) {
      console.error(error);
      throw new Error(
        `Failed to run schema query. \n Error: ${(error as Error).message}`
      );
    }
  }

  async getSchemas(): Promise<SchemaListResponse> {
    try {
      const result = await getRequest(`${urls.api.schemaUrl}`);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to get schema. \n Error: ${(error as Error).message}`
      );
    }
  }
}
