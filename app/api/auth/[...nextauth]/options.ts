import { RedisClientType, createClient } from "falkordb";
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthOptions } from "next-auth"


export const connections = new Map<number, RedisClientType>();
let userId = 1;

const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
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
                    const id = userId++;

                    const client = await createClient({
                        socket: {
                            host: credentials.host ?? "localhost",
                            port: credentials.port ? parseInt(credentials.port) : 6379,
                            reconnectStrategy: false
                        },
                        password: credentials.password ?? undefined,
                        username: credentials.username ?? undefined
                    })

                    // Save connection in connections map for later use
                    connections.set(id, client as RedisClientType)

                    await client.on('error', err => {
                        // Close coonection on error and remove from connections map
                        console.log('FalkorDB Client Error', err)
                        let connection = connections.get(id)
                        if (connection) {
                            connections.delete(id)
                            connection.disconnect()
                        }
                    }).connect();

                    connections.set(id, client as RedisClientType)

                    let res: any = {
                        id: id,
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
                token.id = user.id;
                token.host = user.host;
                token.port = user.port;
                token.username = user.username;
                token.password = user.password;
            }

            return token;
        },
        async session({ session, token, user }) {
            if (session.user) {
                session.user.id = token.id as number;
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