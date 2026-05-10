import NextAuth from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/options";

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
