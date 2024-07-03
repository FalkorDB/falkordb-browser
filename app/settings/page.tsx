'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import Header from "../components/Header"
import Users from "./users/Users"
import Configurations from "./Configurations"

export default function Settings() {

    const [current, setCurrent] = useState('DB')

    const getCurrentTab = () => {
        switch (current) {
            case 'Users':
                return <Users />
            default:
                return <Configurations />
        }
    }

    return (
        <div className="w-full h-full flex flex-col">
            <Header inSettings />
            <div className="grow flex flex-col gap-8 p-16">
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
                <div className="h-1 grow px-6">
                    {
                        getCurrentTab()
                    }
                </div>
            </div>
        </div>
    )
}