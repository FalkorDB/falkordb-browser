"use client"

import { signOut, useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginVerification({ children }: { children: React.ReactNode }) {

    const router = useRouter()
    const { status } = useSession()
    const url = usePathname()
    const { data } = useSession()

    useEffect(() => {
        if (data?.user || data === undefined) return
        localStorage.removeItem("query history")
    }, [data])

    useEffect(() => {
        if ((url === "/login" || url === "/") && status === "authenticated") {
            router.push("/graph")
        } else if (status === "unauthenticated" && url !== "/login") {
            signOut({ callbackUrl: "/login" })
        }
    }, [status, url, router])

    return children
}