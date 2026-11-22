import { ErrorReply } from "@redis/client";

export interface User {
  username: string;
  role: string;
  keys?: string[];
}

export interface CreateUser {
  username: string;
  password: string;
  role: string;
}

const READ_ONLY_ROLE = [
  "on",
  "resetchannels",
  "-@all",
  "+graph.explain",
  "+graph.list",
  "+graph.ro_query",
  "+graph.info",
  "+graph.memory",  // graph memory usage stats
  "+module|list",   // MODULE LIST — needed for the DBVersion check (showMemoryUsage)
  "+ping",
  "+hello",
  "+info",
  "+dump",
  "+exists",
  "+ttl",
  "+pttl",
  "+expiretime",
];

export function getRoleWithKeys(role: string[], keys?: string[]): string[] {
  return [role[0], "resetkeys", ...(keys?.length ? keys.map((key) => `~${key}`) : ["~*"]), "clearselectors", ...role.slice(1)];
}

export const ROLE = new Map<string, string[]>([
  ["Admin", ["on", "&*", "+@all"]],
  [
    "Read-Write",
    [
      ...READ_ONLY_ROLE,
      "+graph.delete",
      "+graph.query",
      "+graph.profile",
      "+graph.constraint",
      "+graph.bulk",
      "+graph.copy",
      "+graph.udf",     // GRAPH.UDF (list/load/flush/delete) — UDF panel access
      "+expire",
      "+pexpire",
      "+restore",
      "+rename",
      "+renamenx",
    ],
  ],
  ["Read-Only", READ_ONLY_ROLE],
]);

export function extractKeysFromACL(userDetails: string[]): string[] {
  const keyPatterns = userDetails
    .filter((part) => part.startsWith("~"))
    .map((part) => part.slice(1));
  return keyPatterns.length > 0 ? keyPatterns : ["*"];
}

export function requiresPasswordReauthentication(
  currentUsername: string | undefined,
  targetUsername: string,
  password?: string,
): boolean {
  return Boolean(password) && currentUsername === targetUsername;
}

export type AclSaveStatus = "saved" | "failed" | "unknown";

export type UpdateUserResponse = { message: string } & (
  | { requiresReauthentication: false }
  | {
    requiresReauthentication: true;
    aclSaveStatus: AclSaveStatus;
    reauthenticationConnection: { host: string; port: number; username: string; tls: boolean };
  }
);

export async function persistAclAfterPasswordChange(
  shouldPersist: boolean,
  saveAcl: () => Promise<unknown>,
  onError: (error: unknown) => void,
): Promise<AclSaveStatus | undefined> {
  if (!shouldPersist) return undefined;

  try {
    await saveAcl();
    return "saved";
  } catch (error) {
    onError(error);
    return error instanceof ErrorReply ? "failed" : "unknown";
  }
}
