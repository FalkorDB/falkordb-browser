
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
import BrowserSettings from "./browserSettings"
import { QuerySettingsContext } from "../components/provider"

export default function Settings() {

    const { hasChanges, saveSettings, resetSettings } = useContext(QuerySettingsContext)

    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()

    const [current, setCurrent] = useState<'Browser' | 'Query' | 'DB' | 'Users'>('Browser')


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

    const handleSetCurrent = useCallback((tab: 'Browser' | 'DB' | 'Users') => {
        if (current === "Query" && hasChanges) {
            getQuerySettingsNavigationToast(toast, saveSettings, () => {
                setCurrent(tab)
                resetSettings()
            })
        } else {
            setCurrent(tab)
        }
    }, [current, hasChanges, resetSettings, saveSettings, toast])

    const getCurrentTab = () => {
        switch (current) {
            case 'Users':
                return <Users />
            case 'DB':
                return <Configurations />
            default:
                return <BrowserSettings />
        }
    }

    return (
        <div className="Page">
            <div className="grow flex flex-col gap-8 items-center">
                <div className="flex flex-col gap-8 items-center p-2">
                    <h1 className="text-2xl font-medium px-6">Settings</h1>
                    <div className="w-fit bg-background flex gap-2 p-2 rounded-lg">
                        <Button
                            className={cn("p-2 rounded-lg", current === "Browser" ? "bg-foreground" : "text-gray-500")}
                            label="Browser Settings"
                            title="Manage browser settings"
                            onClick={() => handleSetCurrent("Browser")}
                        />
                        {
                            session?.user?.role === "Admin" && <>
                                <Button
                                    className={cn("p-2 rounded-lg", current === "DB" ? "bg-foreground" : "text-gray-500")}
                                    label="DB Configuration"
                                    title="Configure database settings"
                                    onClick={() => handleSetCurrent("DB")}
                                />
                                <Button
                                    className={cn("p-2 rounded-lg", current === "Users" ? "bg-foreground" : "text-gray-500")}
                                    label="Users"
                                    title="Manage users accounts"
                                    onClick={() => handleSetCurrent("Users")}
                                />
                            </>
                        }
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