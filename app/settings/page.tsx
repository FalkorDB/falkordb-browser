
'use client'

import { useCallback, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getQuerySettingsNavigationToast } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import Users from "./users/Users"
import Configurations from "./Configurations"
import Button from "../components/ui/Button"
import QuerySettings from "./QuerySettings"
import { QuerySettingsContext } from "../components/provider"

export default function Settings() {

    const { hasChanges, saveSettings, resetSettings } = useContext(QuerySettingsContext)

    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()

    const [current, setCurrent] = useState<'Query' | 'DB' | 'Users'>('Query')


    const navigateBack = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && current !== "Query") {
            e.preventDefault()

            router.back()
        }
    }, [current, router])

    useEffect(() => {
        window.addEventListener("keydown", navigateBack)

        return () => {
            window.removeEventListener("keydown", navigateBack)
        }
    }, [navigateBack])

    const handleSetCurrent = useCallback((tab: 'Query' | 'DB' | 'Users') => {
        if (current === "Query" && hasChanges) {
            getQuerySettingsNavigationToast(toast, saveSettings, () => {
                setCurrent(tab)
                resetSettings()
            })
        } else {
            setCurrent(tab)
        }
    }, [current, hasChanges, resetSettings, saveSettings, toast])

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
            <div className="grow flex flex-col gap-8 items-center">
                <div className="flex flex-col gap-8 items-center p-2">
                    <h1 className="text-2xl font-medium px-6">Settings</h1>
                    <div className="w-fit bg-background flex gap-2 p-2 rounded-lg">
                        <Button
                            className={cn("p-2 rounded-lg", current === "Query" ? "bg-background" : "text-gray-500")}
                            label="Query Settings"
                            title="Manage query settings"
                            onClick={() => handleSetCurrent("Query")}
                        />
                        <Button
                            className={cn("p-2 rounded-lg", current === "DB" ? "bg-background" : "text-gray-500")}
                            label="DB Configuration"
                            title="Configure database settings"
                            onClick={() => handleSetCurrent("DB")}
                        />
                        <Button
                            className={cn("p-2 rounded-lg", current === "Users" ? "bg-background" : "text-gray-500")}
                            label="Users"
                            title="Manage users accounts"
                            onClick={() => handleSetCurrent("Users")}
                        />
                    </div>
                </div>
                <div className="w-full h-1 grow p-6">
                    {
                        getCurrentTab()
                    }
                </div>
            </div>
        </div>
    )
}