"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { removeConnectionItem } from "@/lib/connection-storage";

export default function LoginVerification({ children }: { children: React.ReactNode }) {

    const router = useRouter();
    const { status } = useSession();
    const url = usePathname();
    const { data } = useSession();

    useEffect(() => {
        if (data?.user || data === undefined) return;
        // Clear both legacy unscoped and connection-scoped savedContent
        localStorage.removeItem("savedContent");
        removeConnectionItem("savedContent");
    }, [data]);

    useEffect(() => {
        // Skip authentication redirects for /docs routes
        if (url.startsWith('/docs')) return;
        
        if ((url === "/login" || url === "/") && status === "authenticated") {
            router.push("/graph");
        } else if (status === "unauthenticated" && url !== "/login") {
            router.push("/login");
        }
    }, [status, url, router]);

    return children;
}