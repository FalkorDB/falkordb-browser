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
import Button from "./Button";

export default function AvatarButton({ setUserStatus }: { setUserStatus: (status: Role) => void }) {
    const { data: session, status } = useSession()

    if (status === "unauthenticated" || !session) {
        return (
            <Button
                label="Sign in"
                className="h-12 rounded-lg font-bold px-5 text-slate-50"
                variant="button"
                onClick={() => signIn(undefined, { callbackUrl: '/sandbox' })
                }
            />
        )
    }

    setUserStatus(session.user.role)

    const { username } = session.user;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="flex items-center gap-3">
                    <div className="text-black">{username || "default"}</div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}