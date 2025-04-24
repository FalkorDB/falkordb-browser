"use client"

import { signOut, useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { IndicatorContext, LimitContext, TimeoutContext } from "./components/provider"

export default function LoginVerification({ children }: { children: React.ReactNode }) {

    const router = useRouter()
    const { status } = useSession()
    const url = usePathname()
    const [indicator, setIndicator] = useState<"online" | "offline">("online")
    const [timeout, setTimeout] = useState(0)
    const [limit, setLimit] = useState(0)
    const { data } = useSession()

    useEffect(() => {
        const checkStatus = async () => {
            if (status === "authenticated") {
                const result = await fetch("/api/graph", {
                    method: "GET",
                })
                if (result.ok) {
                    setIndicator("online")
                } else {
                    setIndicator("offline")
                }
            }
        }

        checkStatus()

        const interval = setInterval(checkStatus, 30000)    

        return () => clearInterval(interval)
    }, [status])



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

    const indicatorContext = useMemo(() => ({ indicator, setIndicator }), [indicator, setIndicator])
    const timeoutContext = useMemo(() => ({ timeout, setTimeout }), [timeout, setTimeout])
    const limitContext = useMemo(() => ({ limit, setLimit }), [limit, setLimit])

    return (
        <IndicatorContext.Provider value={indicatorContext}>
            <TimeoutContext.Provider value={timeoutContext}>
                <LimitContext.Provider value={limitContext}>
                    {children}
                </LimitContext.Provider>
            </TimeoutContext.Provider>
        </IndicatorContext.Provider>
    )
}