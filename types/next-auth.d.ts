import NextAuth, { DefaultUser } from "next-auth";

declare module "next-auth" {

    interface User extends DefaultUser {
        id: number;
        host: string;
        port: number;
        username: string;
        password: string;
    }

    interface Session {
        user: User;
    }
}