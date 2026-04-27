import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { v4 as uuidv4 } from "uuid"
import crypto from "crypto"
import type { User } from "next-auth"
import StorageFactory from "@/lib/token-storage/StorageFactory"
import {
  newClient,
  generateTimeUUID,
  connections,
  SESSION_TTL_SECONDS,
} from "@/app/api/auth/[...nextauth]/options"
import { storeEncryptedCredential } from "@/app/api/auth/tokenUtils"

export const { handlers, auth, signIn: serverSignIn, signOut: serverSignOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: SESSION_TTL_SECONDS,
    updateAge: 5 * 60, // 5 minutes
  },
  providers: [
    Credentials({
      credentials: {
        host: { label: "Host", type: "text" },
        port: { label: "Port", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        tls: { label: "tls", type: "text" },
        ca: { label: "ca", type: "text" },
        url: { label: "url", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const host = credentials.host as string | undefined;
        const port = credentials.port as string | undefined;
        const username = credentials.username as string | undefined;
        const password = credentials.password as string | undefined;
        const tls = credentials.tls as string | undefined;
        const ca = credentials.ca as string | undefined;
        const url = credentials.url as string | undefined;

        try {
          const id = uuidv4();
          const { role } = await newClient(
            { host, port, password, username, tls, ca, url },
            id
          );

          // Persist the password encrypted in the Token DB and keep only an
          // opaque credentialRef in the JWT. The password itself never enters
          // the JWT, the session, or any client-visible payload.
          let credentialRef: string | undefined;
          if (password) {
            try {
              credentialRef = generateTimeUUID();
              const tokenHash = crypto
                .createHash("sha256")
                .update(`session:${credentialRef}`)
                .digest("hex");

              await storeEncryptedCredential({
                tokenHash,
                tokenId: credentialRef,
                userId: id,
                username: username || "default",
                name: `session:${id}`,
                role,
                host: host || "localhost",
                port: port ? parseInt(port, 10) : 6379,
                password,
                kind: 'session',
                // Align with session lifetime so abandoned rows
                // are eligible for cleanup instead of living forever.
                expiresAtUnix: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
              });
            } catch (storageError) {
              // eslint-disable-next-line no-console
              console.error(
                "Failed to persist session credential; aborting login:",
                storageError
              );
              connections.delete(id); // dispose auto-closes
              return null;
            }
          }

          const res: User = {
            id,
            url,
            host: host || "localhost",
            port: port ? parseInt(port, 10) : 6379,
            credentialRef,
            username,
            tls: tls === "true",
            ca: url ? undefined : ca,
            role,
          };
          return res;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("FalkorDB Client Connect Error", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id ?? token.id,
          host: user.host,
          port: user.port,
          credentialRef: user.credentialRef,
          username: user.username ?? token.username,
          tls: user.tls,
          ca: user.ca,
          role: user.role,
          url: user.url,
        };
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token }) {
      if (session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            host: token.host as string,
            port: token.port as number,
            username: token.username as string,
            tls: token.tls as boolean,
            ca: token.ca,
            role: token.role,
            url: token.url as string | undefined,
          },
        };
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      // In JWT strategy, message has `token`
      const t = ("token" in message ? message.token : null) as Record<string, unknown> | null;
      const credentialRef = t?.credentialRef as string | undefined;
      const id = t?.id as string | undefined;

      // Session credentials are ephemeral - hard-delete on sign-out.
      if (credentialRef) {
        try {
          const storage = StorageFactory.getStorage();
          await storage.deleteToken(credentialRef);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Failed to delete session credential on signOut:", e);
        }
      }

      if (id) {
        connections.delete(id); // dispose auto-closes
      }
    },
  },
})
