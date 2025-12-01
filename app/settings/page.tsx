
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
import { IndicatorContext, BrowserSettingsContext } from "../components/provider"

type Tab = 'Browser' | 'Configurations' | 'Users'

export default function Settings() {

    const { hasChanges, saveSettings, resetSettings } = useContext(BrowserSettingsContext)
    const { indicator } = useContext(IndicatorContext)
    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()

    const [current, setCurrent] = useState<Tab>('Browser')


    const navigateBack = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && current !== "Browser") {
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

    const handleSetCurrent = useCallback((tab: Tab) => {
        if (current === "Browser" && hasChanges) {
            getQuerySettingsNavigationToast(toast, () => {
                saveSettings()
                setCurrent(tab)
            }, () => {
                resetSettings()
                setCurrent(tab)
            })
        } else {
            setCurrent(tab)
        }
    }, [current, hasChanges, resetSettings, saveSettings, toast])

    const getCurrentTab = () => {
        switch (current) {
            case 'Users':
                return <Users />
            case 'Configurations':
                return <Configurations />
            // case 'Tokens':
            //     return <PersonalAccessTokens />
            default:
                return <BrowserSettings />
        }
    }

    return (
        <div className="Page p-2">
            <p className="text-sm text-foreground"><span className="opacity-50">Settings</span> {`> ${current}`}</p>
            <div className="flex flex-col gap-8 items-center p-2">
                <div className="w-fit bg-background flex gap-2 p-2 rounded-lg">
                    <Button
                        className={cn("p-2 rounded-lg", current === "Browser" ? "bg-background" : "text-gray-500")}
                        label="Browser Settings"
                        title="Manage browser settings"
                        onClick={() => handleSetCurrent("Browser")}
                    />
                    {
                        session?.user.role === "Admin" && indicator === "online" &&
                        <>
                            <Button
                                className={cn("p-2 rounded-lg", current === "Configurations" ? "bg-background" : "text-gray-500")}
                                label="DB Configurations"
                                title="Configure database settings"
                                onClick={() => handleSetCurrent("Configurations")}
                            />
                            <Button
                                className={cn("p-2 rounded-lg", current === "Users" ? "bg-background" : "text-gray-500")}
                                label="Users"
                                title="Manage users accounts"
                                onClick={() => handleSetCurrent("Users")}
                            />
                        </>
                    }
                    {/* <Button
                        className={cn("p-2 rounded-lg", current === "Tokens" ? "bg-background" : "text-gray-500")}
                        label="Personal Access Tokens"
                        title="Manage personal access tokens"
                        onClick={() => handleSetCurrent("Tokens")}
                    /> */}
                </div>
            </div>
            {
                getCurrentTab()
            }
        </div>
    )
}