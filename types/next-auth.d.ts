import { DefaultUser } from "next-auth";

declare module "next-auth" {
  type Role = "Admin" | "Read-Write" | "Read-Only";

  interface SessionConnection {
    id: string;
    username?: string;
    role: Role;
    host: string;
    port: number;
    tls: boolean;
  }

  interface User extends DefaultUser {
    role: Role;
    host: string;
    port: number;
    tls: boolean;
    url: string;
    ca?: string;
    username?: string;
    credentialRef?: string;
    connId?: string;
  }

  interface Session {
    user: User;
    connections?: SessionConnection[];
    activeConnectionId?: string;
  }
}
