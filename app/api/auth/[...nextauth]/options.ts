import { FalkorDB } from "falkordb";
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthOptions, Role, getServerSession } from "next-auth"
import { NextResponse } from "next/server";
import { FalkorDBOptions } from "falkordb/dist/src/falkordb";

const connections = new Map<number, FalkorDB>();

async function newClient(credentials: { host: string, port: string, password: string, username: string, tls: string, ca: string }, id: number): Promise<{ role: Role, client: FalkorDB }> {
    const connectionOptions: FalkorDBOptions = credentials.ca === "undefined" ?
        {
            socket: {
                host: credentials.host ?? "localhost",
                port: credentials.port ? parseInt(credentials.port, 10) : 6379,
            },
            password: credentials.password ?? undefined,
            username: credentials.username ?? undefined
        }
        : {
            socket: {
                host: credentials.host ?? "localhost",
                port: credentials.port ? parseInt(credentials.port, 10) : 6379,
                tls: credentials.tls === "true",
                checkServerIdentity: () => undefined,
                ca: credentials.ca && [Buffer.from(credentials.ca, "base64").toString("utf8")]
            },
            password: credentials.password ?? undefined,
            username: credentials.username ?? undefined
        }

    const client = await FalkorDB.connect(connectionOptions)

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

    // Verify connection and Role
    try {
        await client.connection.aclGetUser(credentials.username || "default")
        return { role: "Admin", client }
    } catch (error) {
        console.log(error);
    }

    try {
        await client.connection.sendCommand(["GRAPH.QUERY"])
    } catch (error: unknown) {
        if ((error as Error).message.includes("permissions")) {
            return { role: "Read-Only", client }
        }
        return { role: "Read-Write", client }
    }

    return { role: "Admin", client }
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

                    const { role } = await newClient(credentials, id)

                    const res = {
                        id,
                        host: credentials.host,
                        port: credentials.port ? parseInt(credentials.port, 10) : 6379,
                        password: credentials.password,
                        username: credentials.username,
                        tls: credentials.tls === "true",
                        ca: credentials.ca,
                        role
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
                    ca: user.ca,
                    role: user.role
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
                        ca: token.ca,
                        role: token.role as Role
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
        client = (await newClient({
            host: user.host,
            port: user.port.toString() ?? "6379",
            username: user.username,
            password: user.password,
            tls: String(user.tls),
            ca: user.ca
        }, user.id)).client
    }

    if (!client) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    return client
}

export default authOptions