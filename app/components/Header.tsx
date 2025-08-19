/* eslint-disable react/require-default-props */

'use client'

import { ArrowUpRight, Database, LifeBuoy, LogOut, Settings } from "lucide-react";
import { useCallback, useContext } from "react";
import Image from "next/image";
import { cn, Panel } from "@/lib/utils";
import { getQuerySettingsNavigationToast } from "@/components/ui/toaster";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import pkg from '@/package.json';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import Button from "./ui/Button";
import CreateGraph from "./CreateGraph";
import { IndicatorContext, PanelContext, QuerySettingsContext } from "./provider";

interface Props {
    onSetGraphName: (newGraphName: string) => void
    graphNames: string[]
    graphName: string
}

function getPathType(pathname: string): "Schema" | "Graph" | undefined {
    if (pathname.includes("/schema")) return "Schema"
    if (pathname.includes("/graph")) return "Graph"
    return undefined
}

export default function Header({ onSetGraphName, graphNames, graphName }: Props) {

    const { indicator } = useContext(IndicatorContext)
    const { setPanel } = useContext(PanelContext)
    const { hasChanges, saveSettings, resetSettings } = useContext(QuerySettingsContext)

    const { data: session } = useSession()
    const pathname = usePathname()
    const router = useRouter()
    const { toast } = useToast()

    const type = getPathType(pathname)
    const showCreate = type && session?.user?.role && session.user.role !== "Read-Only"

    const navigateBack = useCallback(() => {
        if (hasChanges) {
            getQuerySettingsNavigationToast(toast, saveSettings, () => {
                router.back()
                resetSettings()
            })
        } else {
            router.back()
        }
    }, [hasChanges, resetSettings, saveSettings, router, toast])

    const handleSetCurrentPanel = useCallback((newPanel: Panel) => {
        setPanel(prev => prev === newPanel ? undefined : newPanel)
    }, [setPanel])

    return (
        <div className="py-5 px-2 flex flex-col justify-between items-center border-r border-border">
            <div className="flex flex-col gap-6 items-center">
                <Link
                    className="rounded-full h-12 w-12 overflow-hidden"
                    aria-label="FalkorDB"
                    href="https://www.falkordb.com"
                    target="_blank" rel="noreferrer"
                >
                    <Image style={{ width: 'auto', height: 'auto' }} priority src="/icons/Logo.svg" alt="FalkorDB Logo" width={0} height={0} />
                </Link>
                <Button
                    label="GRAPHS"
                    title="View and manage your graphs"
                    className={cn(type === "Graph" ? "text-primary" : "text-white")}
                    onClick={() => router.push("/graph")}
                    data-testid="GraphsButton"
                />
                <div className="h-[1px] w-[80%] bg-white rounded-lg" />
                <Button
                    label="SCHEMAS"
                    title="View and manage your schemas"
                    className={cn(type === "Schema" ? "text-primary" : "text-white")}
                    onClick={() => router.push("/schema")}
                    data-testid="SchemasButton"
                />
                {
                    showCreate &&
                    <>
                        <div className="h-[1px] w-[80%] bg-white rounded-lg" />
                        <CreateGraph
                            label="Header"
                            onSetGraphName={onSetGraphName}
                            type={type}
                            graphNames={graphNames}
                        />
                    </>
                }
                {
                    type === "Graph" && graphName &&
                    <>
                        <div className="h-[1px] w-[80%] bg-white rounded-lg" />
                        <Button
                            indicator={indicator}
                            title="Graph info"
                            onClick={() => handleSetCurrentPanel("graphInfo")}
                        >
                            <Database size={35} />
                        </Button>
                    </>
                }
                {
                    type === "Graph" && graphName &&
                    <>
                        <div className="h-[1px] w-[80%] bg-white rounded-lg" />
                        <Button
                            className="Gradient bg-clip-text text-transparent font-semibold text-xl"
                            indicator={indicator}
                            label="CHAT"
                            onClick={() => handleSetCurrentPanel("chat")}
                        />
                    </>
                }
            </div>
            <div className="flex flex-col gap-6 items-center">
                {
                    session?.user?.role === "Admin" &&
                    <>
                        <Button
                            indicator={indicator}
                            title="Adjust application settings"
                            onClick={() => pathname.includes("/settings") ? navigateBack() : router.push("/settings")}
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
                                    <a className="flex gap-2 items-center" href="https://docs.falkordb.com/" target="_blank" rel="noreferrer noreferrer">
                                        <span>
                                            Documentation
                                        </span>
                                        <ArrowUpRight size={15} />
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="focus:bg-transparent">
                                    <a className="flex gap-2 items-center" href="https://discord.com/invite/jyUgBweNQz" target="_blank" rel="noreferrer noreferrer">
                                        <Image style={{ width: 'auto', height: '14px' }} src="/icons/Discord.svg" alt="" width={0} height={0} />
                                        <span>
                                            Get Support
                                        </span>
                                        <ArrowUpRight size={15} />
                                    </a>
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
                    <DrawerContent side="right" className="bg-background gap-4 items-center text-foreground" id="about">
                        <VisuallyHidden>
                            <DrawerTitle />
                            <DrawerDescription />
                        </VisuallyHidden>
                        <div className="h-full flex flex-col gap-8 max-w-[30rem] p-4">
                            <div className="h-1 grow flex flex-col gap-8 items-center justify-center">
                                <Image style={{ width: 'auto', height: '50px' }} priority src="icons/ColorLogo.svg" alt="" width={0} height={0} />
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
                        <div className="flex gap-2 rounded-lg p-2 border border-destructive">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="text-destructive text-xs">Offline</p>
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
                    data-testid="logoutButton"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut size={25} />
                </Button>
            </div>
        </div>
    )
}
