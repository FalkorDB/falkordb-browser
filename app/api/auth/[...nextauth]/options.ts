import { RedisClientType, createClient } from "falkordb";
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthOptions, User } from "next-auth"


const connections = new Map<number, RedisClientType>();

async function newClient(credentials: {host: string, port: string, password: string, username: string}, id: number) {
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
        console.error('FalkorDB Client Error', err)
        const connection = connections.get(id)
        if (connection) {
            connections.delete(id)
            connection.disconnect()
            .catch((e) => {
                console.warn('FalkorDB Client Disconnect Error', e)
            })
        }
    }).connect();

    // Verify connection
    await client.ping()
    return client
}

export async function getConnection(user: User) {
    let conn = connections.get(user.id)
    if (!conn) {
        await newClient({
            host: user.host,
            port: user.port.toString() ?? "6379",
            username: user.username,
            password: user.password,
        }, user.id)
    }
    return conn  
}

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
            async authorize(credentials) {

                if (!credentials) {
                    return null
                }

                try {
                    const id = userId;
                    userId += 1;

                    await newClient(credentials, id)

                    const res = {
                        id,
                        host: credentials.host,
                        port: credentials.port ? parseInt(credentials.port, 10) : 6379,
                        password: credentials.password,
                        username: credentials.username,
                    }
                    return res
                } catch (err) {
                    console.error('FalkorDB Client Connect Error', err)
                    return null;
                }
            }

        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    host: user.host,
                    port: user.port,
                    username: user.username,
                    password: user.password
                };
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                return {
                    ...session,
                    user: {
                        ...session.user,
                        id: token.id as number,
                        host: token.host as string,
                        port: parseInt(token.port as string, 10),
                        username: token.username as string,
                        password: token.password as string,
                    },
                };
            }
            return session;
        }
    }
}



export default authOptions