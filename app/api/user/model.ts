export interface User {
  username: string;
  role: string;
}

export interface CreateUser {
  username: string;
  password: string;
  role: string;
}

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

export const ROLE = new Map<string, string[]>([
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
