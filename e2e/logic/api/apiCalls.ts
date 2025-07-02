/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAdminToken } from "@/e2e/infra/utils";
import { APIRequestContext } from "playwright";
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
      throw new Error("Failed to remove graph.");
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
      throw new Error("Failed to change graph name.");
    }
  }

  async exportGraph(graphName: string): Promise<void> {
    try {
      const result = await getRequest(
        `${urls.api.graphUrl + graphName}/export`
      );
      await result.json();
    } catch (error) {
      throw new Error("Failed to export graph.");
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
      throw new Error("Failed to duplicate graph.");
    }
  }

  async runQuery(
    graphName: string,
    query: string,
    role?: string
  ): Promise<RunQueryResponse> {
    try {
      const headers = role === "admin" ? await getAdminToken() : undefined;

      let result = await getRequest(
        `${urls.api.graphUrl}${graphName}?query=${encodeURIComponent(query)}`,
        headers
      );
      let rawText = await result.text();

      let json = JSON.parse(rawText);

      // Poll if response contains a numeric result (job ID)
      const MAX_POLLS = 10;
      let polls = 0;
      while (typeof json.result === "number") {
        polls += 1;
        if (polls > MAX_POLLS) {
          throw new Error(`Query polling exceeded ${MAX_POLLS} attempts`);
        }
        const jobId = json.result;
        result = await getRequest(
          `${urls.api.graphUrl}${graphName}/query?id=${jobId}`,
          headers
        );
        rawText = await result.text();
        json = JSON.parse(rawText);
      }

      return json;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to run query.");
    }
  }

  async getGraphCount(graph: string): Promise<GraphCountResponse> {
    const maxRetries = 5;
    const delayMs = 1000;

    for (let i = 0; i < maxRetries; i += 1) {
      try {
        const result = await getRequest(`${urls.api.graphUrl}${graph}/count`);
        const json = await result.json();

        if (json?.result?.data?.[0]) {
          return json;
        }
      } catch (error) {
        console.log(`Attempt ${i + 1} failed:`, error);
      }

      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }

    throw new Error("Graph count data not available after retries.");
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
      throw new Error("Failed to add graph node label.");
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
      throw new Error("Failed to delete graph node label.");
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
      throw new Error("Failed to delete graph node.");
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
      throw new Error("Failed to add graph node attribute.");
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
      throw new Error("Failed to delete graph node attribute.");
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

  async createUsers(
    data?: any,
    request?: APIRequestContext
  ): Promise<CreateUsersResponse> {
    try {
      const result = await postRequest(urls.api.settingsUsers, data, request);
      return await result.json();
    } catch (error) {
      throw new Error("Failed to create users.");
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
      throw new Error("Failed to delete users.");
    }
  }

  async addSchema(schemaName: string): Promise<AddSchemaResponse> {
    try {
      const result = await getRequest(
        `${
          urls.api.graphUrl + schemaName
        }_schema?query=MATCH%20(n)%20RETURN%20n%20LIMIT%201`
      );
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

  async runSchemaQuery(
    schemaName: string,
    schema: string
  ): Promise<AddSchemaResponse> {
    try {
      let result = await getRequest(
        `${urls.api.graphUrl + schemaName}_schema?query=${encodeURIComponent(
          schema
        )}`
      );
      let json = await result.json();

      const MAX_POLLS = 10;
      let polls = 0;

      while (typeof json.result === "number") {
        polls += 1;
        if (polls > MAX_POLLS) {
          throw new Error(`Schema polling exceeded ${MAX_POLLS} attempts`);
        }
        const jobId = json.result;
        await new Promise((r) => {
          setTimeout(r, 500);
        }); // Wait before polling again
        result = await getRequest(
          `${urls.api.graphUrl + schemaName}_schema/query?id=${jobId}`
        );
        json = await result.json();
      }

      return json;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to add schema.");
    }
  }

  async getSchemas(): Promise<SchemaListResponse> {
    try {
      const result = await getRequest(`${urls.api.schemaUrl}`);
      return await result.json();
    } catch (error) {
      throw new Error("Failed to get schema.");
    }
  }
}
