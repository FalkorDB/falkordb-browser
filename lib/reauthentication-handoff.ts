import { randomUUID } from "node:crypto";
import type { TokenData } from "./token-storage/ITokenStorage.ts";

export const REAUTHENTICATION_HANDOFF_COOKIE = "falkordb-reauth-handoff";
export const REAUTHENTICATION_HANDOFF_PREFIX = "reauth:";
export const REAUTHENTICATION_HANDOFF_TTL_SECONDS = 5 * 60;

type HandoffRecord = Pick<
  TokenData,
  "name" | "kind" | "is_active" | "expires_at" | "host" | "port" | "username" | "tls"
>;

type ReauthenticationCredentials = {
  host?: string;
  port?: string;
  username?: string;
  tls?: string;
};

export function createReauthenticationHandoffId(): string {
  return randomUUID();
}

export function readReauthenticationHandoffId(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;

  const cookiePrefix = `${REAUTHENTICATION_HANDOFF_COOKIE}=`;
  const cookie = cookieHeader.split(";").map(value => value.trim()).find(value => value.startsWith(cookiePrefix));
  const reference = cookie?.slice(cookiePrefix.length).trim();
  return reference || undefined;
}

export async function consumeReauthenticationHandoff(
  reference: string,
  deleteToken: (tokenId: string) => Promise<boolean>,
  onFailure: () => Promise<void>,
): Promise<boolean> {
  try {
    if (await deleteToken(`${REAUTHENTICATION_HANDOFF_PREFIX}${reference}`)) return true;
  } catch (error) {
    await onFailure();
    throw error;
  }

  await onFailure();
  return false;
}

export function matchesReauthenticationEndpoint(
  record: Pick<HandoffRecord, "host" | "port" | "username" | "tls">,
  credentials: ReauthenticationCredentials,
): boolean {
  const port = Number(credentials.port ?? "6379");
  return Number.isSafeInteger(port)
    && port > 0
    && record.host === (credentials.host || "localhost")
    && record.port === port
    && record.username === (credentials.username || "default")
    && (record.tls ?? false) === (credentials.tls === "true");
}

export function isUsableReauthenticationHandoff(
  record: Pick<HandoffRecord, "name" | "kind" | "is_active" | "expires_at">,
  nowSeconds: number,
): boolean {
  return record.kind === "session"
    && record.name.startsWith(REAUTHENTICATION_HANDOFF_PREFIX)
    && record.is_active
    && Number.isSafeInteger(record.expires_at)
    && Number.isSafeInteger(nowSeconds)
    && record.expires_at > nowSeconds;
}
