"use client"

import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function LoginVerification({ children }: { children: React.ReactNode }) {

    const { status } = useSession()
    const url = usePathname()
    
    useEffect(() => {
        if (url === "/login") return
        if (status === "unauthenticated") {
            signOut({ callbackUrl: "/login" })
        }
    }, [status, url])

    return children
} 