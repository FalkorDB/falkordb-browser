'use client';

import { useSession, signIn, signOut } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Role } from "next-auth";
import { useEffect } from "react";
import Button from "./Button";

export default function AvatarButton({ setUserStatus }: { setUserStatus: (status: Role) => void }) {
    const { data: session, status } = useSession()
    useEffect(() => {
        setUserStatus(session?.user.role || "Read-Only")
    }, [session, setUserStatus])
    
    if (status === "unauthenticated" || !session) {
        return (
            <Button
                label="Sign in"
                className="h-12 rounded-lg font-bold px-5 text-slate-50"
                onClick={() => signIn(undefined, { callbackUrl: '/sandbox' })
                }
            />
        )
    }
    

    const { username } = session.user;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    label={username || "Default"}
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className="text-center">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem className="p-2" onClick={() => signOut({ callbackUrl: '/' })}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}