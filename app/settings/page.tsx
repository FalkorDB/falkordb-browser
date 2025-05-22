'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Users from "./users/Users"
import Configurations from "./Configurations"
import Button from "../components/ui/Button"
import QuerySettings from "./QuerySettings"

export default function Settings() {

    const [current, setCurrent] = useState<'Query' | 'DB' | 'Users'>('Query')
    const router = useRouter()
    const { data: session } = useSession()

    useEffect(() => {
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                router.back()
            }
        })

        return () => {
            window.removeEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    router.back()
                }
            })
        }
    }, [router])

    useEffect(() => {
        if (session && session.user.role !== "Admin") router.back()
    }, [router, session])

    const getCurrentTab = () => {
        switch (current) {
            case 'Users':
                return <Users />
            case 'DB':
                return <Configurations />
            default:
                return <QuerySettings />
        }
    }

    return (
        <div className="Page">
            <div className="grow flex flex-col gap-8 p-16 items-center">
                <h1 className="text-2xl font-medium px-6">Settings</h1>
                <div className="w-fit bg-background flex gap-2 p-2 rounded-lg">
                    <Button
                        className={cn("p-2 rounded-lg", current === "Query" ? "bg-foreground" : "text-gray-500")}
                        label="Query Settings"
                        title="Manage query settings"
                        onClick={() => setCurrent("Query")}
                    />
                    <Button
                        className={cn("p-2 rounded-lg", current === "DB" ? "bg-foreground" : "text-gray-500")}
                        label="DB Configuration"
                        title="Configure database settings"
                        onClick={() => setCurrent("DB")}
                    />
                    <Button
                        className={cn("p-2 rounded-lg", current === "Users" ? "bg-foreground" : "text-gray-500")}
                        label="Users"
                        title="Manage users accounts"
                        onClick={() => setCurrent("Users")}
                    />
                </div>
                <div className="w-full h-1 grow px-6">
                    {
                        getCurrentTab()
                    }
                </div>
            </div>
        </div>
    )
}