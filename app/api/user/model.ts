export interface User {
  username: string;
  role: string;
  keys?: string;
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
  "+graph.memory",
  "+ping",
  "+hello",
  "+info",
  "+dump",
  "+exists",
  "+ttl",
  "+pttl",
  "+expiretime",
];

export function getRoleWithKeys(role: string[], keys?: string): string[] {
  return [role[0], "resetkeys", `~${keys || "*"}`, ...role.slice(1)];
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
      "+expire",
      "+pexpire",
      "+restore",
      "+rename",
      "+renamenx",
    ],
  ],
  ["Read-Only", READ_ONLY_ROLE],
]);

export function extractKeysFromACL(userDetails: string[]): string {
  const keyPatterns = userDetails
    .filter((part) => part.startsWith("~"))
    .map((part) => part.slice(1));
  return keyPatterns.length > 0 ? keyPatterns.join(" ") : "*";
}
