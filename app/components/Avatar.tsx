'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signIn, signOut } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// A function that takes a full name as a string and returns its initials as a string
function getInitials(fullName: string): string {
    // Split the full name by spaces and store the parts in an array
    const nameParts = fullName.split(" ");
    // Initialize an empty string to store the initials
    let initials = "";
    // Loop through the name parts array
    nameParts.forEach((part) => {

        // If the part is not empty, append its first character (uppercased) to the initials string
        if (part) {
            initials += part[0].toUpperCase();
        }
    })
    // Return the initials string
    return initials;
}


export default function AvatarButton() {
    const { data: session, status } = useSession()

    if (status === "unauthenticated") {
        return (
            <button
                type="button"
                onClick={() => signIn(undefined, { callbackUrl: '/sandbox' })}
                className="h-12 rounded-lg font-bold px-5 text-slate-50">
                Sign in
            </button>
        )
    }

    const name = session?.user?.name || "Anchel";
    const email = session?.user?.email;
    const image = session?.user?.image ?? ""
    const initials = name ? getInitials(name) : ""
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <HoverCard>
                        <HoverCardTrigger>
                            <div className="flex items-center gap-3">
                                <div className="text-black">{name || "Name Not Found"}</div>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage alt="@shadcn" src={image} />
                                    <AvatarFallback className="bg-black text-white rounded-full">{initials}</AvatarFallback>
                                </Avatar>
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <div className="flex flex-col text-left">
                                <div>Name: {name || "Name Not Found"}</div>
                                <div>Email: {email || "Email Not Found"}</div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}