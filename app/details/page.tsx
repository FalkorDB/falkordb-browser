"use client";

import { AirVentIcon, Asterisk, Menu, User } from "lucide-react";
import { useSession } from "next-auth/react";

// Shows the details of a current database connection 
export default function Page() {
    
    const { data: session, status } = useSession()
 
    return (
        <div className="w-full h-full p-5 flex flex-col space-y-4">
            <h1 className="text-2xl font-bold">Connection Details</h1>
            <ul className="space-y-2 list-disc border rounded-lg border-gray-300 p-2">
                <li className="flex items-center space-x-2">
                    <span>Host:</span>
                    <span>{session?.user?.host || "localhost"}</span>
                </li>
                <li className="flex items-center space-x-2">
                    <span>Port:</span>
                    <span>{session?.user?.port || 6379}</span>
                </li>
                <li className="flex items-center space-x-2">
                    <span>Username:</span>
                    <span>{session?.user?.name}</span>
                </li>
                <li className="flex items-center space-x-2">
                    <span>Password:</span>
                    <span>{session?.user?.password}</span>
                </li>
            </ul>           
        </div>
    )
}