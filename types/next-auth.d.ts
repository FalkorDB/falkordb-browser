import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  type Role = "Admin" | "Read-Write" | "Read-Only";

  interface User {
    role: Role;
    host: string;
    port: number;
    tls: boolean;
    url?: string;
    ca?: string;
    username?: string;
    credentialRef?: string;
  }

  interface Session {
    user: User & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    host: string;
    port: number;
    credentialRef?: string;
    username: string;
    tls: boolean;
    ca?: string;
    role: "Admin" | "Read-Write" | "Read-Only";
    url?: string;
  }
}
