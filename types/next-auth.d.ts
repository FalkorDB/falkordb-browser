import { DefaultUser } from "next-auth";

declare module "next-auth" {
    
    type Role = "Admin" | "Read-Write" | "Read-Only";

    interface User extends DefaultUser {
        role: Role;
        host: string;
        port: number;
        tls: boolean;
        ca: string;
        username: string;
        password: string;
        cache: Map<number, CACHE>;
    }

    interface Session {
        user: User;
    }
}