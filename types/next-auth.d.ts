import type { DefaultSession } from "next-auth";

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

  interface User {
    id: string;
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

  interface Session extends DefaultSession {
    user: User;
    activeConnectionId?: string;
  }
}

declare module "@auth/core/types" {
  type Role = "Admin" | "Read-Write" | "Read-Only";

  interface User {
    id: string;
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
}
