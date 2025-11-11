import { Role } from "next-auth";

export interface User {
  username: string;
  role: string;
}

// Extract role values for zod validation
export const roleValues = ["Admin", "Read-Write", "Read-Only"] as const satisfies readonly Role[];

const READ_ONLY_ROLE = [
  "on",
  "~*",
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

export const ROLE = new Map<Role, string[]>([
  ["Admin", ["on", "~*", "&*", "+@all"]],
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
