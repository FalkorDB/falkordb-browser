'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Header from "../components/Header"
import Users from "./users/Users"
import Configurations from "./Configurations"
import Button from "../components/ui/Button"

export default function Settings() {

    const [current, setCurrent] = useState('DB')
    const router = useRouter()
    const { data: session } = useSession()

    useEffect(() => {
        if (session && session.user.role !== "Admin") router.back()
    }, [router, session])

    const getCurrentTab = () => {
        switch (current) {
            case 'Users':
                return <Users />
            default:
                return <Configurations />
        }
    }

    return (
        <div className="Page">
            <Header />
            <div className="grow flex flex-col gap-8 p-16">
                <h1 className="text-2xl font-medium px-6">Settings</h1>
                <div className="w-fit bg-foreground flex gap-2 p-2 rounded-lg">
                    <Button
                        className={cn("p-2 rounded-lg", current === "DB" ? "bg-background" : "text-gray-500")}
                        label="DB Configuration"
                        title="Configure database settings"
                        onClick={() => setCurrent("DB")}
                        />
                    <Button
                        className={cn("p-2 rounded-lg", current === "Users" ? "bg-background" : "text-gray-500")}
                        label="Users"
                        title="Manage users accounts"
                        onClick={() => setCurrent("Users")}
                    />
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