"use client";

import { useSession } from "next-auth/react";
import { DatabaseLine } from "./DatabaseLine";

// Shows the details of a current database connection 
export default function Page() {

    const { data: session, status } = useSession()

    return (
        <div className="w-full h-full p-5 flex flex-col space-y-4">
            <h1 className="text-2xl font-bold">Connection Details</h1>
            <div className="space-y-2 list-disc border rounded-lg border-gray-300 p-2">
                <DatabaseLine label="Host" value={session?.user?.host || "localhost"} />
                <DatabaseLine label="Port" value={(session?.user?.port || 6379).toString()} />
                <DatabaseLine label="Username" value={session?.user?.name || ""} />
                <DatabaseLine label="Password" value={session?.user?.password || ""} masked="********" />
            </div>
        </div>
    )
}