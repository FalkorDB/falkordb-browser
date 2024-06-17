'use client'

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import Header from "../graph/Header"
import Users from "./users/Users"
import Configurations from "./Configurations"

export default function Settings() {

    const [current, setCurrent] = useState('DB')
    const [graphName, setGraphName] = useState<string | undefined>()
    const searchParams = useSearchParams()


    useEffect(() => {
        const graphParam = searchParams.get("graphName")
        if (!graphParam) return
        setGraphName(graphParam)
    }, [searchParams]);

    const getCurrentTab = () => {
        switch (current) {
            case 'Users':
                return <Users />
            default:
                return typeof graphName === "string" ? <Configurations graphName={graphName} /> : <div className="w-full h-full items-center"><p>Need to pick a graph to see DB Configurations</p></div>
        }
    }

    return (
        <>
            <Header inSettings />
            <div className="flex flex-col gap-8 p-16">
                <h1 className="text-2xl font-medium px-6">Settings</h1>
                <div className="flex flex-row gap-16">
                    <button
                        className={cn("py-2 px-6", current === "DB" && "border-b-2 border-[#7167F6] text-[#7167F6] text-sm font-normal")}
                        title="DB Configuration"
                        type="button"
                        onClick={() => setCurrent("DB")}
                    >
                        <p>DB Configuration</p>
                    </button>
                    <button
                        className={cn("py-2 px-6", current === "Users" && "border-b-2 border-[#7167F6] text-[#7167F6]")}
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