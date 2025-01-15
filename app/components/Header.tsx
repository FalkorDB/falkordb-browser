/* eslint-disable react/require-default-props */

'use client'

import { LifeBuoy, LogOut, Settings } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import Button from "./ui/Button";
import CreateGraph from "./CreateGraph";

interface Props {
    onSetGraphName?: Dispatch<SetStateAction<string>>
}

export default function Header({ onSetGraphName }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const type = pathname.includes("/schema") ? "Schema" : "Graph"
    const inCreate = pathname.includes("/create")
    const { data: session } = useSession()
    
    return (
        <div className="flex flex-col">
            <div className="py-5 px-10 flex justify-between items-center Header">
                <div className="flex gap-4 items-center">
                    <a
                        aria-label="FalkorDB"
                        href="https://www.falkordb.com"
                        target="_blank" rel="noreferrer"
                    >
                        <Image priority width={103} height={29} src="/Logo.svg" alt="" />
                    </a>
                    <p className="text-neutral-200" >|</p>
                    <div className="flex gap-2 bg-foreground rounded-lg p-2">
                        <Button
                            label="Graphs"
                            className={cn("px-4 py-1 rounded-lg", pathname.includes("/graph") && "bg-background")}
                            onClick={() => router.push("/graph")}
                        />
                        <Button
                            label="Schemas"
                            className={cn("px-4 py-1 rounded-lg", pathname.includes("/schema") && "bg-background")}
                            onClick={() => router.push("/schema")}
                        />
                    </div>
                </div>
                <div className="flex gap-6 items-center">
                    <NavigationMenu>
                        <NavigationMenuList className="gap-6 bg-foreground rounded-lg px-4 py-2">
                            <NavigationMenuLink className="bg-foreground" asChild>
                                <Button
                                    label="Settings"
                                    onClick={() => router.push("/settings")}
                                    disabled={session?.user?.role !== "Admin"}
                                >
                                    <Settings size={25} />
                                </Button>
                            </NavigationMenuLink>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="gap-2 bg-foreground">
                                    <LifeBuoy size={25} />
                                    <p>Help</p>
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="w-full p-6">
                                    <ul className="h-full w-full flex flex-col gap-2 p-2">
                                        <li>
                                            <a href="https://docs.falkordb.com/" target="_blank" rel="noreferrer">
                                                Documentation
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://www.falkordb.com/contact-us/" target="_blank" rel="noreferrer">
                                                Support
                                            </a>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            {
                                !inCreate &&
                                <CreateGraph
                                    onSetGraphName={onSetGraphName!}
                                    type={type}
                                />
                            }
                            <Button
                                title="Log Out"
                                onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                                <LogOut size={25} />
                            </Button>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
            <div className="h-2 Top" />
        </div>
    )
}
