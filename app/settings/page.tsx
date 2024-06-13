'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/router"
import Header from "../graph/Header"
import Users from "./users/Users"
import Configurations from "./Configurations"

export default function Settings() {

    const [current, setCurrent] = useState('DB')
    const { graphName } = useRouter().query

    const getCurrentTab = () => {
        switch (current) {
            case 'Users':
                return <Users />
            default:
                return <Configurations graphName={graphName as string}/>
        }
    }

    return (
        <>
            <Header inSettings />
            <div className="flex flex-col gap-16 p-20">
                <h1 className="text-2xl font-medium px-6">Settings</h1>
                <div className="flex flex-row gap-16">
                    <button
                        className={cn("py-2 px-6", current === "DB" && "border-b-2 border-indigo-600 text-indigo-600 text-sm font-normal")}
                        title="DB Configuration"
                        type="button"
                        onClick={() => setCurrent("DB")}
                    >
                        <p>DB Configuration</p>
                    </button>
                    <button
                        className={cn("py-2 px-6", current === "Users" && "border-b-2 border-indigo-600 text-indigo-600")}
                        title="Users"
                        type="button"
                        onClick={() => setCurrent("Users")}
                    >
                        <p>Users</p>
                    </button>
                </div>
                <div className="px-6">
                {
                    getCurrentTab()
                }
                </div>
            </div>
        </>
    )
}