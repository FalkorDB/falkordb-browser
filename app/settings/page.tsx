'use client'

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import Users from "./users/Users"
import Configurations from "./Configurations"
import Button from "../components/ui/Button"
import QuerySettings from "./QuerySettings"
import ToastButton from "../components/ToastButton"

export default function Settings() {

    const [current, setCurrent] = useState<'Query' | 'DB' | 'Users'>('Query')
    const router = useRouter()
    const { data: session } = useSession()
    const { toast } = useToast()
    const [hasChanges, setHasChanges] = useState(false)

    const navigateBack = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault()
            if (current === "Query" && hasChanges) {
                toast({
                    title: "Query settings",
                    description: "Are you sure you want to leave this page?\nYour changes will not be saved.",
                    action: <ToastButton label="Leave" onClick={() => router.back()} showUndo={false} />,
                })
            } else {
                router.back()
            }
        }
    }, [router, current, toast, hasChanges])

    useEffect(() => {
        window.addEventListener("keydown", navigateBack)

        return () => {
            window.removeEventListener("keydown", navigateBack)
        }
    }, [navigateBack])

    const handleSetCurrent = useCallback((tab: 'Query' | 'DB' | 'Users') => {
        if (current === "Query" && hasChanges) {
            toast({
                title: "Query settings",
                description: "Are you sure you want to leave this tab?\nYour changes will not be saved.",
                action: <ToastButton label="Leave" onClick={() => setCurrent(tab)} showUndo={false} />,
            })
        } else {
            setCurrent(tab)
        }
    }, [current, toast, hasChanges])

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
                return <QuerySettings setHasChanges={setHasChanges} />
        }
    }

    return (
        <div className="Page">
            <div className="grow flex flex-col gap-8 items-center">
                <div className="flex flex-col gap-8 items-center p-2">
                    <h1 className="text-2xl font-medium px-6">Settings</h1>
                    <div className="w-fit bg-background flex gap-2 p-2 rounded-lg">
                        <Button
                            className={cn("p-2 rounded-lg", current === "Query" ? "bg-foreground" : "text-gray-500")}
                            label="Query Settings"
                            title="Manage query settings"
                            onClick={() => handleSetCurrent("Query")}
                        />
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