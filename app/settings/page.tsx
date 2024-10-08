'use client'

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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
                <div className="flex gap-16">
                    <Button
                        label="DB Configuration"
                        className={cn("py-2 px-6", current === "DB" && "border-b-2 border-[#7167F6] text-[#7167F6] text-sm font-normal")}
                        onClick={() => setCurrent("DB")}
                    />
                    <Button
                        label="Users"
                        className={cn("py-2 px-6", current === "Users" && "border-b-2 border-[#7167F6] text-[#7167F6] text-sm font-normal")}
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