/* eslint-disable react/require-default-props */

'use client'

import { ArrowUpRight, LifeBuoy, LogOut, Settings } from "lucide-react";
import { useContext } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import pkg from '@/package.json';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Button from "./ui/Button";
import CreateGraph from "./CreateGraph";
import { IndicatorContext } from "./provider";

interface Props {
    onSetGraphName: (newGraphName: string) => void
    graphNames: string[]
}

export default function Header({ onSetGraphName, graphNames }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const type = pathname.includes("/schema") ? "Schema" : "Graph"
    const { data: session } = useSession()
    const showCreate = (pathname.includes("/graph") || pathname.includes("/schema")) && session?.user?.role !== "Read-Only"
    const { indicator } = useContext(IndicatorContext)

    return (
        <div className="bg-background py-5 px-2 flex flex-col justify-between items-center">
            <div className="flex flex-col gap-4 items-center">
                <Link
                    className="rounded-full h-12 w-12 overflow-hidden"
                    aria-label="FalkorDB"
                    href="https://www.falkordb.com"
                    target="_blank" rel="noreferrer"
                >
                    <Image style={{ width: 'auto', height: 'auto' }} priority src="/Logo.svg" alt="FalkorDB Logo" width={0} height={0} />
                </Link>
                {
                    showCreate &&
                    <CreateGraph
                        label="Header"
                        onSetGraphName={onSetGraphName}
                        type={type}
                        graphNames={graphNames}
                    />
                }
                <div className="flex flex-col gap-2 items-center">
                    <Button
                        label="GRAPHS"
                        title="View and manage your graphs"
                        className={cn(pathname.includes("/graph") ? "text-primary" : "text-white")}
                        onClick={() => router.push("/graph")}
                    />
                    <div className="h-[1px] w-[80%] bg-white rounded-lg" />
                    <Button
                        label="SCHEMAS"
                        title="View and manage your schemas"
                        className={cn(pathname.includes("/schema") ? "text-primary" : "text-white")}
                        onClick={() => router.push("/schema")}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-6 items-center">
                {
                    session?.user?.role === "Admin" &&
                    <>
                        <Button
                            indicator={indicator}
                            title="Adjust application settings"
                            onClick={() => router.push("/settings")}
                        >
                            <Settings size={35} />
                        </Button>
                        <div className="h-[1px] w-[80%] bg-white" />
                    </>
                }
                <Drawer direction="right">
                    <DropdownMenu>
                        <DropdownMenuTrigger onClick={(e) => e.preventDefault()} className="flex gap-2">
                            <LifeBuoy size={25} />
                            <p>Help</p>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" className="bg-background w-full p-4 ml-4">
                            <DropdownMenuGroup className="h-full w-full flex flex-col gap-2 p-2">
                                <DropdownMenuItem className="focus:bg-transparent">
                                    <Link className="flex gap-2 items-center" href="https://docs.falkordb.com/" target="_blank" rel="noreferrer">
                                        <span>
                                            Documentation
                                        </span>
                                        <ArrowUpRight size={15} />
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="focus:bg-transparent">
                                    <Link className="flex gap-2 items-center" href="https://discord.com/invite/jyUgBweNQz" target="_blank" rel="noreferrer">
                                        <Image style={{ width: 'auto', height: '14px' }} src="/icons/discord.svg" alt="" width={0} height={0} />
                                        <span>
                                            Get Support
                                        </span>
                                        <ArrowUpRight size={15} />
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="focus:bg-transparent">
                                    <DrawerTrigger asChild>
                                        <Button
                                            label="About"
                                            title="Learn more about the application"
                                        />
                                    </DrawerTrigger>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DrawerContent side="right" className="bg-popover-foreground gap-4 items-center text-foreground" id="about">
                        <VisuallyHidden>
                            <DrawerTitle />
                            <DrawerDescription />
                        </VisuallyHidden>
                        <div className="h-full flex flex-col gap-8 max-w-[30rem] p-4">
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
                        </div>
                    </DrawerContent>
                </Drawer>
                {
                    indicator === "offline" &&
                    <>
                        <div className="h-0.5 w-[80%] bg-white" />
                        <div className="flex gap-2 rounded-lg p-2 border border-red-500">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="text-red-500 text-xs">Offline</p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>The FalkorDB server is offline</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </>
                }
                <div className="h-[1px] w-[80%] bg-white" />
                <Button
                    title="Log Out"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut size={25} />
                </Button>
            </div>
        </div>
    )
}
