"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { debugPort } from "node:process";
import { useEffect } from "react";

export default function LoginVerification({ children }: { children: React.ReactNode }) {

    const router = useRouter();
    const { status } = useSession();
    const url = usePathname();
    const { data } = useSession();  
    const searchParams = useSearchParams();

    useEffect(() => {
        if (data?.user || data === undefined) return;
        // Clear legacy unscoped savedContent (scoped cleanup handled by providers.tsx)
        localStorage.removeItem("savedContent");
    }, [data]);

    useEffect(() => {
        // Skip authentication redirects for /docs routes
        if (url.startsWith('/docs')) return;

        const hostParam = searchParams.get("host");
        const portParam = searchParams.get("port");
        const usernameParam = searchParams.get("username");
        const tls = searchParams.get("tls");

        const differentConnectionParams = hostParam !== data?.user.host || portParam !== String(data?.user.port) || usernameParam !== data?.user.username || tls !== String(data?.user.tls);

        if (((url === "/login" && !differentConnectionParams) || url === "/") && status === "authenticated") {
            router.push("/graph");
        } else if (status === "unauthenticated" && url !== "/login") {
            router.push("/login");
        }
    }, [status, url, router, searchParams]);

    return children;
}