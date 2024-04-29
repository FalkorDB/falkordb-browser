"use client";

import { toast } from "@/components/ui/use-toast";
import { signOut } from "next-auth/react";
import React from "react";
import useSWR from "swr";


const fetcher = (url: string) => fetch(url, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}).then((response) => {
    const {status} = response

    if (status >= 300) {     
        response.text().then((message) => {
          toast({
            title: "Error",
            description: message,
          })
        }).then(() => {
          if (status === 401 || status >= 500) {
            signOut({ callbackUrl: '/login' })
          }
        })
        return { users: [] }
    }
    return response.json()
}).then((data) => data.result)


// Shows the details of a current database connection 
export default function Page() {

    const { data } = useSWR(`/api/user/`, fetcher, { refreshInterval: 1000 })

    return (
        <div className="w-full h-full p-2 flex flex-col space-y-4">
            <h1 className="text-2xl font-bold">Users</h1>
            <div className="space-y-2 list-disc border rounded-lg border-gray-300 p-2">
                {data && data.users && data.users.map((user: string) => (
                    <div key={user}>
                        <p>{user}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}