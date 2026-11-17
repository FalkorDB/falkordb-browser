/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAdminToken } from "@/e2e/infra/utils";
import { APIRequestContext, request as playwrightRequest } from "playwright";
import { request } from "@playwright/test";
import { EventSource } from "eventsource";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postMultipartRequest,
  postRequest,
} from "../../infra/api/apiRequests";
import urls from "../../config/urls.json";
import {
  AddGraphResponse,
  RemoveGraphResponse,
  GetGraphsResponse,
  DuplicateGraphresponse,
  ChangeGraphNameResponse,
  RunQueryResponse,
  GraphCountResponse,
  GraphNodeResponse,
  GraphAttributeResponse,
} from "./responses/graphResponses";
import {
  GetUsersResponse,
  CreateUsersResponse,
  DeleteUsersResponse,
  UpdateUserResponse,
} from "./responses/userResponses";
import {
  ModifySettingsRoleResponse,
  GetSettingsRoleValue,
} from "./responses/settingsResponses";
import {
  AuthCredentialsResponse,
  LogoutResponse,
} from "./responses/authResponses";
import { ListTokensResponse, TokenDetailsResponse } from "./responses/tokenResponse";

async function postForStatus(
  url: string,
  body: object | string,
  authenticated: boolean
): Promise<{ status: number; body: any }> {
  const headers = {
    ...(authenticated ? await getAdminToken() : {}),
    "Content-Type": "application/json",
  };
  // Playwright Test seeds new request contexts with the project's storageState, so start empty:
  // authenticated calls pass their cookies explicitly and unauthenticated ones must carry none.
  const ctx = await playwrightRequest.newContext({
    storageState: { cookies: [], origins: [] },
  });
  try {
    // With a JSON Content-Type Playwright JSON-encodes a string that does not parse, so send raw bytes instead.
    const data = typeof body === "string" ? Buffer.from(body) : body;
    const response = await postRequest(url, data, ctx, headers);
    const isJson = response.headers()["content-type"]?.includes("application/json");
    return {
      status: response.status(),
      body: isJson ? await response.json() : await response.text(),
    };
  } finally {
    await ctx.dispose();
  }
}

export async function getSSEGraphResult(
  url: string,
  headers?: Record<string, string>
): Promise<any> {
  try {
    // Always get the admin token and add it to headers
    const adminHeaders = await getAdminToken();
    const mergedHeaders = { ...adminHeaders, ...headers };
    const requestUrl = new URL(url);
    const query = requestUrl.searchParams.get("query");

    if (query !== null) {
      const timeout = requestUrl.searchParams.get("timeout");
      requestUrl.searchParams.delete("query");
      requestUrl.searchParams.delete("timeout");
      const response = await fetch(requestUrl.toString(), {
        method: "POST",
        headers: { ...mergedHeaders, Origin: requestUrl.origin, "Content-Type": "application/json" },
        body: JSON.stringify({ query, timeout: timeout ?? 0 }),
      });
      const responseText = await response.text();
      const event = responseText.split(/\r?\n\r?\n/).find((part) => part.startsWith("event:"));
      if (!event) {
        let payload: unknown;
        try {
          payload = JSON.parse(responseText);
        } catch {
          throw new Error(`Unexpected query response (${response.status})`);
        }
        throw new Error(payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
          ? payload.message : `Unexpected query response (${response.status})`);
      }
      const eventType = event.match(/^event:\s*(.+)$/m)?.[1];
      const data = event
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).replace(/^ /, ""))
        .join("\n");
      if (!data) throw new Error("Query response did not contain event data");
      const payload = JSON.parse(data);
      if (eventType === "error") throw new Error(payload.message || "Query failed");
      if (!response.ok) throw new Error(payload.message || `Query failed (${response.status})`);
      return payload;
    }

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

  async migrateSession(
    requestContext: APIRequestContext
  ): Promise<{ status: number; headers: Record<string, string>; body: { message?: string; code?: string } }> {
    try {
      const result = await postRequest(
        urls.api.migrateSessionUrl,
        undefined,
        requestContext
      );
      return { status: result.status(), headers: result.headers(), body: await result.json() };
    } catch (error) {
      throw new Error(
        `Failed to call migrate-session. \n Error: ${(error as Error).message}`
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

  /** Creates a graph on one of `request`'s own session connections rather than the shared admin one. */
  async addGraphOnConnection(
    request: APIRequestContext,
    graphName: string,
    connectionId: string
  ): Promise<void> {
    const response = await postRequest(
      urls.api.graphUrl + encodeURIComponent(graphName),
      undefined,
      request,
      { "X-Connection-Id": connectionId }
    );
    if (!response.ok()) {
      throw new Error(
        `Failed to add graph ${graphName} (${response.status()}): ${await response.text()}`
      );
    }
  }

  /** Deletes a graph from one of `request`'s own session connections; resolves to the HTTP status. */
  async removeGraphOnConnection(
    request: APIRequestContext,
    graphName: string,
    connectionId: string
  ): Promise<number> {
    const url = urls.api.graphUrl + encodeURIComponent(graphName);
    const response = await request.delete(url, {
      headers: { "X-Connection-Id": connectionId, Origin: new URL(url).origin },
    });
    return response.status();
  }

  async getGraphs(role?: string): Promise<GetGraphsResponse> {
    try {
      const headers = role === "admin" ? await getAdminToken() : undefined;
      const result = await getRequest(`${urls.api.graphUrl}`, headers);
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
      return {
        ...(await result.json()),
        status: result.status(),
      };
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
        `${urls.api.graphUrl + destinationGraph}`,
        { sourceName: sourceGraph }
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
      const result = await patchRequest(
        `${urls.api.graphUrl + destinationGraph}/duplicate`,
        { sourceName: sourceGraph, ...data }
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
      throw new Error(
        `Failed to run query. \n Error: ${(error as Error).message}`
      );
    }
  }

  /** Raw multipart POST to /api/upload with the given request context's session; hands back the status for asserting refusals. */
  async uploadFile(
    request: APIRequestContext,
    multipart: Record<string, string | { name: string; mimeType: string; buffer: Buffer }>
  ): Promise<{ status: number; body: any }> {
    const result = await request.post(`${urls.localHost}/api/upload`, {
      multipart,
      headers: { Origin: new URL(urls.localHost).origin },
    });
    return { status: result.status(), body: await result.json() };
  }

  /** Raw POST to the graph's load-csv route; hands back the status for asserting refusals. */
  async loadCsvWithRequest(
    request: APIRequestContext,
    graph: string,
    key: string,
    body: string
  ): Promise<{ status: number; body: any }> {
    const url = `${urls.api.graphUrl}${encodeURIComponent(graph)}/load-csv`;
    const result = await request.post(url, {
      data: { key, body },
      headers: { Origin: new URL(url).origin },
    });
    return { status: result.status(), body: await result.json() };
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

  /** POST /api/csv-temp — multipart upload of one `file` part. `body.key` is set on 201. */
  async uploadCsvTemp(
    content: string | Buffer,
    filename = "data.csv"
  ): Promise<{ status: number; body: any }> {
    const result = await postMultipartRequest(urls.api.csvTempUrl, {
      file: {
        name: filename,
        mimeType: "text/csv",
        buffer: Buffer.from(content),
      },
    });
    return { status: result.status(), body: await result.json() };
  }

  /** POST /api/csv-temp/direct — `data` is sent as is so malformed bodies can be tried. */
  async requestCsvDirectUpload(data: unknown): Promise<{ status: number; body: any }> {
    const result = await postRequest(`${urls.api.csvTempUrl}/direct`, data);
    return { status: result.status(), body: await result.json() };
  }

  /**
   * GET /api/csv-temp/:id — the serve endpoint FalkorDB fetches without a session, so this sends
   * none (an empty storage state); `query` is the raw `?o=..&t=..`.
   */
  async getCsvTemp(id: string, query = ""): Promise<{ status: number; body: string }> {
    const sessionless = await request.newContext({ storageState: { cookies: [], origins: [] } });
    try {
      const result = await getRequest(`${urls.api.csvTempUrl}/${id}${query}`, undefined, undefined, sessionless);
      return { status: result.status(), body: await result.text() };
    } finally {
      await sessionless.dispose();
    }
  }

  /** DELETE /api/csv-temp/:id — returns the status (204 even when the file is already gone). */
  async deleteCsvTemp(id: string): Promise<number> {
    const result = await deleteRequest(`${urls.api.csvTempUrl}/${id}`);
    return result.status();
  }

  /**
   * POST /api/graph/:graph/load-csv. A passing validation answers 200 with a streamed JSON
   * body: `{ message, result }` on success or `{ error: { message, status } }` on a query error.
   */
  async loadCsv(graph: string, data: unknown): Promise<{ status: number; body: any }> {
    const result = await postRequest(`${urls.api.graphUrl}${graph}/load-csv`, data);
    return { status: result.status(), body: await result.json() };
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

  /** Like `addGraphNodeLabel`, but hands back the status too, for asserting refusals. */
  async addGraphNodeLabelWithStatus(
    graph: string,
    node: string,
    data: Record<string, string>
  ): Promise<{ status: number; body: any }> {
    const result = await postRequest(
      `${urls.api.graphUrl}${graph}/${node}/label`,
      data
    );
    return { status: result.status(), body: await result.json() };
  }

  /** Like `deleteGraphNodeLabel`, but hands back the status too, for asserting refusals. */
  async deleteGraphNodeLabelWithStatus(
    graph: string,
    node: string,
    data: Record<string, string>
  ): Promise<{ status: number; body: any }> {
    const result = await deleteRequest(
      `${urls.api.graphUrl}${graph}/${node}/label`,
      undefined,
      data
    );
    return { status: result.status(), body: await result.json() };
  }

  async deleteGraphNode(
    graph: string,
    node: string,
    data: Record<string, string | boolean>
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

  /** POST /api/graph/:graph/:element — `element` is ignored by the route, any id works. */
  async createGraphElement(
    graph: string,
    data: {
      type: boolean;
      label: string[];
      attributes: [string, string][];
      selectedNodes?: { id: number }[];
    },
    readOnly = false
  ): Promise<{ status: number; body: any }> {
    const result = await postRequest(
      `${urls.api.graphUrl}${graph}/-1${readOnly ? "?readOnly=true" : ""}`,
      data
    );
    return { status: result.status(), body: await result.json() };
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
      const headers = await getAdminToken();
      const result = await postRequest(
        `${urls.api.settingsConfig + roleName}`,
        { value: roleValue },
        undefined,
        headers
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
      const headers = await getAdminToken();
      const result = await getRequest(urls.api.settingsConfig + roleName, headers);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to get settings role value. \n Error: ${
          (error as Error).message
        }`
      );
    }
  }

  async getUsers(role?: string): Promise<GetUsersResponse> {
    try {
      const headers = role === "admin" ? await getAdminToken() : undefined;
      const result = await getRequest(urls.api.settingsUsers, headers);
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

  async updateUser(username: string, data: { role: string; keys?: string[]; password?: string }): Promise<UpdateUserResponse> {
    try {
      const result = await patchRequest(
        `${urls.api.settingsUser}${encodeURIComponent(username)}`,
        data
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to update user. \n Error: ${(error as Error).message}`
      );
    }
  }

  /** Like `createUsers`, but hands back the status and `Location` header too, for asserting refusals. */
  async createUserWithStatus(
    data?: any,
    role?: string
  ): Promise<{ status: number; location?: string; body: any }> {
    const headers = role === "admin" ? await getAdminToken() : undefined;
    const result = await postRequest(
      urls.api.settingsUsers,
      data,
      undefined,
      headers
    );
    return {
      status: result.status(),
      location: result.headers().location,
      body: await result.json(),
    };
  }

  /** Like `deleteUsers`, but hands back the status too, for asserting refusals. */
  async deleteUsersWithStatus(
    data?: any,
    role?: string
  ): Promise<{ status: number; body: any }> {
    const headers = role === "admin" ? await getAdminToken() : undefined;
    const result = await deleteRequest(urls.api.settingsUsers, headers, data);
    return { status: result.status(), body: await result.json() };
  }

  /** Like `updateUser`, but hands back the status too, for asserting refusals. */
  async updateUserWithStatus(
    username: string,
    data: { role: string; keys?: string[]; password?: string },
    role?: string
  ): Promise<{ status: number; body: any }> {
    const headers = role === "admin" ? await getAdminToken() : undefined;
    const result = await patchRequest(
      `${urls.api.settingsUser}${encodeURIComponent(username)}`,
      data,
      undefined,
      headers
    );
    return { status: result.status(), body: await result.json() };
  }

  /** Hands back the status of `POST /api/user/save`, for asserting refusals. */
  async saveUsersWithStatus(role?: string): Promise<{ status: number; body: any }> {
    const headers = role === "admin" ? await getAdminToken() : undefined;
    const result = await postRequest(`${urls.api.settingsUsers}/save`, undefined, undefined, headers);
    return { status: result.status(), body: await result.json() };
  }

  async loadUdf(name: string, code: string): Promise<void> {
    try {
      const headers = await getAdminToken();
      const result = await postRequest(
        `${urls.api.udfUrl}/${encodeURIComponent(name)}`,
        { code, replace: false },
        undefined,
        headers
      );
      if (!result.ok()) {
        throw new Error(`${result.status()} ${await result.text()}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to load UDF library. \n Error: ${(error as Error).message}`
      );
    }
  }

  // Resolves to false instead of throwing when the library is gone, so it can run as cleanup.
  async deleteUdf(name: string): Promise<boolean> {
    try {
      const headers = await getAdminToken();
      const result = await deleteRequest(
        `${urls.api.udfUrl}/${encodeURIComponent(name)}`,
        headers
      );
      return result.ok();
    } catch (error) {
      throw new Error(
        `Failed to delete UDF library. \n Error: ${(error as Error).message}`
      );
    }
  }

  async listUdfs(): Promise<string[]> {
    try {
      const headers = await getAdminToken();
      const result = await getRequest(urls.api.udfUrl, headers);
      if (!result.ok()) {
        throw new Error(`${result.status()} ${await result.text()}`);
      }
      const { result: libraries } = await result.json();
      return libraries.map((library: string[]) => library[1]);
    } catch (error) {
      throw new Error(
        `Failed to list UDF libraries. \n Error: ${(error as Error).message}`
      );
    }
  }

  // Token API methods
  async generateToken(data?: {
    name?: string;
    expiresAt?: string | null;
    ttlSeconds?: number;
  }): Promise<any> {
    try {
      const headers = await getAdminToken();
      const result = await postRequest(`${urls.api.tokenUrl}tokens`, data, undefined, headers);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to generate token. \n Error: ${(error as Error).message}`
      );
    }
  }

  async listTokens(): Promise<ListTokensResponse> {
    try {
      const headers = await getAdminToken();
      const result = await getRequest(`${urls.api.tokenUrl}tokens`, headers);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to list tokens. \n Error: ${(error as Error).message}`
      );
    }
  }

  async revokeToken(tokenId: string): Promise<any> {
    try {
      const headers = await getAdminToken();
      const result = await deleteRequest(`${urls.api.tokenUrl}tokens/${tokenId}`, headers);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to revoke token. \n Error: ${(error as Error).message}`
      );
    }
  }

  async getTokenDetails(tokenId: string): Promise<TokenDetailsResponse> {
    try {
      const headers = await getAdminToken();
      const result = await getRequest(`${urls.api.tokenUrl}tokens/${tokenId}`, headers);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to get token details. \n Error: ${(error as Error).message}`
      );
    }
  }

  // Raw token API calls: expose the HTTP status and body so tests can assert error paths.
  // Authenticates with the admin session cookie unless a bearer token is given.
  private async tokenRequestHeaders(
    bearerToken?: string
  ): Promise<Record<string, string> | undefined> {
    return bearerToken
      ? { Authorization: `Bearer ${bearerToken}` }
      : getAdminToken();
  }

  // Playwright re-encodes a string payload that is not valid JSON when the content type is
  // JSON, so a string is sent as a Buffer to reach the server byte for byte (malformed JSON).
  private rawJsonBody(body: unknown) {
    return typeof body === "string" ? Buffer.from(body, "utf8") : body;
  }

  async generateTokenRaw(
    body: unknown
  ): Promise<{ status: number; body: any }> {
    const headers = {
      ...(await this.tokenRequestHeaders()),
      "Content-Type": "application/json",
    };
    const result = await postRequest(`${urls.api.tokenUrl}tokens`, this.rawJsonBody(body), undefined, headers);
    return { status: result.status(), body: await result.json() };
  }

  async listTokensRaw(
    bearerToken?: string
  ): Promise<{ status: number; body: any }> {
    const result = await getRequest(
      `${urls.api.tokenUrl}tokens`,
      await this.tokenRequestHeaders(bearerToken)
    );
    return { status: result.status(), body: await result.json() };
  }

  async getTokenDetailsRaw(
    tokenId: string,
    bearerToken?: string
  ): Promise<{ status: number; body: any }> {
    const result = await getRequest(
      `${urls.api.tokenUrl}tokens/${tokenId}`,
      await this.tokenRequestHeaders(bearerToken)
    );
    return { status: result.status(), body: await result.json() };
  }

  async revokeTokenRaw(
    tokenId: string,
    bearerToken?: string
  ): Promise<{ status: number; body: any }> {
    const result = await deleteRequest(
      `${urls.api.tokenUrl}tokens/${tokenId}`,
      await this.tokenRequestHeaders(bearerToken)
    );
    return { status: result.status(), body: await result.json() };
  }

  async generateTokenWithCredentialsRaw(
    body: unknown
  ): Promise<{ status: number; body: any }> {
    const result = await postRequest(
      `${urls.api.tokenUrl}tokens/credentials`,
      this.rawJsonBody(body),
      undefined,
      { "Content-Type": "application/json" }
    );
    return { status: result.status(), body: await result.json() };
  }

  async revokeAllUserTokens(tokens: string[]): Promise<void> {
    try {
      const results = await Promise.allSettled(
        tokens.map((tokenId) => this.revokeToken(tokenId))
      );
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(
          `Failed to revoke ${failures.length} of ${tokens.length} tokens`
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to revoke all tokens. \n Error: ${(error as Error).message}`
      );
    }
  }

  // Multi-user token operations
  async  generateTokenAsUser(
    username: string,
    password: string,
    data?: {
      name?: string;
      expiresAt?: string | null;
      ttlSeconds?: number;
      host?: string;
      port?: string;
      tls?: string;
    }
  ): Promise<any> {
    try {
      const payload = {
        ...data,
        username,
        password,
        host: data?.host || "localhost",
        port: data?.port || "6379",
        tls: data?.tls || "false",
      };
      const result = await postRequest(`${urls.api.tokenUrl}tokens/credentials`, payload);
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to generate token as user ${username}. \n Error: ${(error as Error).message}`
      );
    }
  }

  async listTokensAsUser(username: string, password: string): Promise<any> {
    try {
      // First get a session/token by logging in
      const loginResponse = await this.generateTokenAsUser(username, password);
      const { token, token_id: tokenId } = loginResponse;

      // Use that token to list tokens
      const result = await getRequest(
        `${urls.api.tokenUrl}tokens`,
        { Authorization: `Bearer ${token}` }
      );
      const response = await result.json();

      // Clean up the temporary token
      await this.revokeToken(tokenId);

      return response;
    } catch (error) {
      throw new Error(
        `Failed to list tokens as user ${username}. \n Error: ${(error as Error).message}`
      );
    }
  }

  async revokeTokenAsUser(
    username: string,
    password: string,
    tokenId: string
  ): Promise<any> {
    try {
      // First get a session/token by logging in
      const loginResponse = await this.generateTokenAsUser(username, password);
      const { token, token_id: tempTokenId } = loginResponse;

      // Use that token to revoke via DELETE
      const result = await deleteRequest(
        `${urls.api.tokenUrl}tokens/${tokenId}`,
        { Authorization: `Bearer ${token}` }
      );
      const response = await result.json();

      // Clean up the temporary token
      await this.revokeToken(tempTokenId);

      return response;
    } catch (error) {
      throw new Error(
        `Failed to revoke token as user ${username}. \n Error: ${(error as Error).message}`
      );
    }
  }

  async getModelsByProvider(provider: string): Promise<{ models: string[] }> {
    try {
      const headers = await getAdminToken();
      const result = await getRequest(
        `${urls.api.chatModelsUrl}?provider=${provider}`,
        headers
      );
      return await result.json();
    } catch (error) {
      throw new Error(
        `Failed to get models for provider ${provider}. \n Error: ${(error as Error).message}`
      );
    }
  }

  /**
   * POSTs to `/api/chat` and hands back the status and parsed body, for asserting
   * validation refusals. A string `body` is sent as-is, so malformed JSON can be tested.
   */
  async postChat(
    body: object | string,
    authenticated = true
  ): Promise<{ status: number; body: any }> {
    return postForStatus(urls.api.chatUrl, body, authenticated);
  }

  /** Like `postChat`, for `/api/chat/models`. */
  async postChatModels(
    body: object,
    authenticated = true
  ): Promise<{ status: number; body: any }> {
    return postForStatus(urls.api.chatModelsUrl, body, authenticated);
  }
}
