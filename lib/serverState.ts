// SERVER_STATE picks whether the server keeps users' FalkorDB connections
// between requests. "stateful" (the default) caches one client per connection
// and reuses it; "stateless" caches nothing, so each request opens its own
// client and closes it once the response is done. Stateless costs a connect
// (and a role check) per request, but no user connection outlives the request
// that opened it, which suits replicas behind a load balancer and serverless
// hosts. The server's own Token DB connection (lib/token-storage) is not a
// user connection: it stays one shared client per process in either mode.

export type ServerState = "stateful" | "stateless";

/** SERVER_STATE as a mode; anything other than "stateless" (any case) is stateful. */
export function readServerState(env: Record<string, string | undefined> = process.env): ServerState {
    return env.SERVER_STATE?.trim().toLowerCase() === "stateless" ? "stateless" : "stateful";
}

/** The part of a cache the connection code uses. */
export interface ConnectionCache<V> {
    get(key: string): V | undefined;
    set(key: string, value: V): unknown;
    delete(key: string): boolean;
}

/** The stateless server's cache: it remembers nothing. */
export class NoConnectionCache<V> implements ConnectionCache<V> {
    get(_key: string): V | undefined {
        return undefined;
    }

    set(_key: string, _value: V): this {
        return this;
    }

    delete(_key: string): boolean {
        return false;
    }
}
