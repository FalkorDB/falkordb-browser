import { FalkorDB } from "falkordb";
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthOptions, getServerSession } from "next-auth"
import { NextResponse } from "next/server";

const connections = new Map<number, FalkorDB>();

async function newClient(credentials: { host: string, port: string, password: string, username: string, tls: string, ca: string }, id: number) {
    const client = credentials.ca === "undefined" ? await FalkorDB.connect({
        socket: {
            host: credentials.host ?? "localhost",
            port: credentials.port ? parseInt(credentials.port, 10) : 6379,
            tls: credentials.tls === "true",
            checkServerIdentity: () => undefined,
            ca: credentials.ca && [Buffer.from(credentials.ca, "base64").toString("utf8")]
        },
        password: credentials.password ?? undefined,
        username: credentials.username ?? undefined
    })
    : await FalkorDB.connect({
        socket: {
            host: credentials.host ?? "localhost",
            port: credentials.port ? parseInt(credentials.port, 10) : 6379,
        },
        password: credentials.password ?? undefined,
        username: credentials.username ?? undefined
    })

    // Save connection in connections map for later use
    connections.set(id, client)

    client.on('error', err => {
        // Close coonection on error and remove from connections map
        console.error('FalkorDB Client Error', err)
        const connection = connections.get(id)
        if (connection) {
            connections.delete(id)
            connection.close()
                .catch((e) => {
                    console.warn('FalkorDB Client Disconnect Error', e)
                })
        }
    });

    // Verify connection
    await client.connection.ping()
    return client
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
                password: { label: "Password", type: "password" },
                tls: { label: "tls", type: "boolean" },
                ca: { label: "ca", type: "string" }
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
                        tls: credentials.tls === "true",
                        ca: credentials.ca
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
                    password: user.password,
                    tls: user.tls,
                    ca: user.ca
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
                        tls: token.tls as boolean,
                        ca: token.ca
                    },
                };
            }
            return session;
        }
    }
}

export async function getClient() {
    const session = await getServerSession(authOptions)
    const id = session?.user?.id
    if (!id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { user } = session;
    let client = connections.get(user.id)

    // If client is not found, create a new one
    if (!client) {
        client = await newClient({
            host: user.host,
            port: user.port.toString() ?? "6379",
            username: user.username,
            password: user.password,
            tls: String(user.tls),
            ca: user.ca
        }, user.id)
    }

    if (!client) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }
    
    return client
}

export default authOptions