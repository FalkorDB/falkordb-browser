/* eslint-disable react/require-default-props */

'use client'

import { LifeBuoy, LogOut, Settings } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import pkg from '@/package.json';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
                        <Image style={{ width: 'auto', height: '40px' }} priority width={0} height={0} src="/Logo.svg" alt="" />
                    </a>
                    <p className="text-neutral-200" >|</p>
                    <div className="flex gap-2 bg-foreground rounded-lg p-2">
                        <Button
                            label="Graphs"
                            className={cn("px-4 py-1 rounded-lg", pathname.includes("/graph") ? "bg-background" : "text-gray-500")}
                            onClick={() => router.push("/graph")}
                        />
                        <Button
                            label="Schemas"
                            className={cn("px-4 py-1 rounded-lg", pathname.includes("/schema") ? "bg-background" : "text-gray-500")}
                            onClick={() => router.push("/schema")}
                        />
                    </div>
                </div>
                <div className="flex gap-6 items-center">
                    <Sheet>
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
                                    <NavigationMenuTrigger onClick={(e) => e.preventDefault()} className="gap-2 bg-foreground">
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
                                            <li>
                                                <SheetTrigger asChild>
                                                    <Button
                                                        label="About"
                                                        className="bg-foreground"
                                                    />
                                                </SheetTrigger>
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
                        <SheetContent className="bg-popover-foreground flex flex-col gap-4 items-center text-foreground !max-w-[30rem]" id="about">
                            <VisuallyHidden>
                                <SheetTitle />
                                <SheetDescription />
                            </VisuallyHidden>
                            <div className="h-1 grow flex flex-col gap-8 items-center justify-center">
                                <Image style={{ width: 'auto', height: '50px' }} priority src="/ColorLogo.svg" alt="" width={0} height={0} />
                                <h1 className="text-3xl font-bold">We Make AI Reliable</h1>
                                <p className="text-xl text-center">
                                    Delivering a scalable,
                                    low-latency graph database designed for development teams managing
                                    structured and unstructured interconnected data in real-time or interactive environments.
                                </p>
                            </div>
                            <div className="flex flex-col gap-8 items-center">
                                <p>Version: {`{${pkg.version}}`}</p>
                                <p className="text-sm text-nowrap">All Rights Reserved © 2024 - {new Date().getFullYear()} falkordb.com</p>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <div className="h-2 Gradient" />
        </div>
    )
}
