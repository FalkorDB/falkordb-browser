import { createClient } from "falkordb";
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthOptions } from "next-auth"

const authOptions : AuthOptions = {
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                host: { label: "Host", type: "text", placeholder: "localhost" },
                port: { label: "Port", type: "number", placeholder: "6379" },
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {

                if (!credentials) {
                    return null
                }

                try {
                    let client = await createClient({
                        socket: {
                            host: credentials.host ?? "localhost",
                            port: credentials.port ? parseInt(credentials.port) : 6379,
                            reconnectStrategy: false
                        },
                        password: credentials.password ?? undefined,
                        username: credentials.username ?? undefined
                    })
                    .on('error', err => console.log('FalkorDB Client Error', err))
                    .connect();

                    let res : any = {
                        host: credentials.host,
                        port: credentials.port,
                        password: credentials.password,
                        username: credentials.username,
                    }
                    return res
                } catch (err) {
                    console.log(err)
                    return null;
                }
            }

        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.host = user.host;
                token.port = user.port;
                token.username = user.username;
                token.password = user.password;
            }

            return token;
        },
        async session({ session, token, user }) {
            if (session.user) {
                session.user.host = token.host as string;
                session.user.port = parseInt(token.port as string);
                session.user.username = token.username as string;
                session.user.password = token.password as string;

            }
            return session;
        }
    }
}



export default authOptions