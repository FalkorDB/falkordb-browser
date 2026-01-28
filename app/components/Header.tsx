/* eslint-disable react/require-default-props */

'use client';

import { ArrowUpRight, Database, FileCode, LogOut, Monitor, Moon, Settings, Sun } from "lucide-react";
import { useCallback, useContext, useState, useEffect } from "react";
import Image from "next/image";
import { cn, getTheme, Panel } from "@/lib/utils";
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
import { useTheme } from "next-themes";
import Button from "./ui/Button";
import CreateGraph from "./CreateGraph";
import { IndicatorContext, PanelContext, BrowserSettingsContext, ConnectionContext } from "./provider";

interface Props {
    onSetGraphName: (newGraphName: string) => void
    graphNames: string[]
    graphName: string
    onOpenGraphInfo: () => void
    navigateToSettings: boolean
}

function getPathType(pathname: string): "Schema" | "Graph" | undefined {
    if (pathname.includes("/schema")) return "Schema";
    if (pathname.includes("/graph")) return "Graph";
    return undefined;
}

const iconSize = 30;

/**
 * Format version number to include dots (e.g., "11111" -> "1.11.11")
 */
function formatVersion(version: string | undefined): string {
    if (!version) return '';

    // If already formatted with dots, return as is
    if (version.includes('.')) return version;

    // Format as Major.Minor.Patch (e.g., "11111" -> "1.11.11")
    if (version.length >= 5) {
        const major = version.slice(0, 1);
        const minor = version.slice(1, 3);
        const patch = version.slice(3);
        return `${major}.${minor}.${patch}`;
    }

    return version;
}

export default function Header({ onSetGraphName, graphNames, graphName, onOpenGraphInfo, navigateToSettings }: Props) {

    const { indicator } = useContext(IndicatorContext);
    const { connectionType, dbVersion } = useContext(ConnectionContext);
    const { setPanel } = useContext(PanelContext);
    const { hasChanges, saveSettings, resetSettings, settings: { chatSettings: { model, secretKey, displayChat } } } = useContext(BrowserSettingsContext);

    const { theme, setTheme } = useTheme();
    const { currentTheme } = getTheme(theme);
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();

    const [mounted, setMounted] = useState(false);

    const type = getPathType(pathname);
    const showCreate = type && session?.user.role && session.user.role !== "Read-Only";

    useEffect(() => {
        setMounted(true);
    }, []);

    const navigateBack = useCallback(() => {
        if (hasChanges) {
            getQuerySettingsNavigationToast(toast, () => {
                saveSettings();
                router.back();
            }, () => {
                resetSettings();
                router.back();
            });
        } else {
            router.back();
        }
    }, [hasChanges, resetSettings, saveSettings, router, toast]);

    const handleSetCurrentPanel = useCallback((newPanel: Panel) => {
        setPanel(prev => prev === newPanel ? undefined : newPanel);
    }, [setPanel]);

    const separator = <div className="h-px w-[80%] bg-border rounded-full" />;

    return (
        <div className="py-5 px-2 flex flex-col justify-between items-center border-r border-border">
            <div className="w-full flex flex-col gap-4 items-center">
                {
                    mounted && currentTheme &&
                    <Link
                        className="rounded-full h-12 w-12 overflow-hidden"
                        aria-label="FalkorDB"
                        href="https://www.falkordb.com"
                        target="_blank" rel="noreferrer"
                    >
                        <Image style={{ width: 'auto', height: '48px' }} priority src={`/icons/F-${currentTheme}.svg`} alt="FalkorDB Logo" width={0} height={0} />
                    </Link>
                }
                <Tooltip>
                    <TooltipTrigger asChild>
                        <h2>{session?.user.username || "Default"}</h2>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>User Name</p>
                    </TooltipContent>
                </Tooltip>
                {
                    formatVersion(dbVersion) &&
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <h2>v{formatVersion(dbVersion)}</h2>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>FalkorDB Server Version</p>
                        </TooltipContent>
                    </Tooltip>
                }
                <div className="flex gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={cn("h-6 w-6 rounded-full bg-yellow-500 text-center", connectionType !== "Standalone" && "opacity-25")}>Si</div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Single</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={cn("h-6 w-6 rounded-full bg-green-500 text-center", connectionType !== "Sentinel" && "opacity-25")}>Se</div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sentinel</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={cn("h-6 w-6 rounded-full bg-green-700 text-center", connectionType !== "Cluster" && "opacity-25")}>C</div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Cluster</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                {
                    showCreate &&
                    <>
                        <CreateGraph
                            label="Header"
                            onSetGraphName={onSetGraphName}
                            type={type}
                            graphNames={graphNames}
                        />
                        {separator}
                    </>
                }
                <Button
                    label="GRAPHS"
                    title="View and manage your graphs"
                    className={cn(type === "Graph" ? "text-primary" : "text-foreground")}
                    onClick={() => router.push("/graph")}
                    data-testid="GraphsButton"
                />
                {/* {separator}
                <Button
                    label="SCHEMAS"
                    title="View and manage your schemas"
                    className={cn(type === "Schema" ? "text-primary" : "text-foreground")}
                    onClick={() => router.push("/schema")}
                    data-testid="SchemasButton"
                /> */}
                {
                    type === "Graph" && graphName &&
                    <>
                        {separator}
                        <Button
                            indicator={indicator}
                            title="Graph info"
                            onClick={() => onOpenGraphInfo()}
                            data-testid="graphInfoToggle"
                        >
                            <Database size={iconSize} />
                        </Button>
                    </>
                }
                {
                    type === "Graph" && graphName && displayChat &&
                    <>
                        {separator}
                        <Button
                            data-testid="chatToggleButton"
                            className="Gradient bg-clip-text text-transparent font-semibold text-xl"
                            indicator={indicator}
                            title={`Use English to query the graph.
                                The feature requires LLM model and API key.
                                Update local user parameters in Settings.`}
                            label="CHAT"
                            onClick={() => {
                                if (navigateToSettings && (!model || !secretKey)) {
                                    router.push("/settings");
                                    toast({
                                        title: "Incomplete Chat Settings",
                                        description: "Please complete the chat settings to use the chat feature.",
                                        variant: "destructive",
                                    });
                                } else {
                                    handleSetCurrentPanel("chat");
                                }
                            }}
                        />
                    </>
                }
            </div>
            <div className="w-full flex flex-col gap-4 items-center">
                <Button
                    data-testid="settings"
                    title="Adjust application settings"
                    onClick={() => pathname.includes("/settings") ? navigateBack() : router.push("/settings")}
                >
                    <Settings size={iconSize} />
                </Button>
                {separator}
                <Drawer direction="right">
                    <DropdownMenu>
                        <DropdownMenuTrigger onClick={(e) => e.preventDefault()} asChild>
                            <Button title="Help">
                                <FileCode size={iconSize} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" className="bg-background w-full p-2 ml-4">
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
                                    <Link className="flex gap-2 items-center" href="/docs">
                                        <span>
                                            API Documentation
                                        </span>
                                        <ArrowUpRight size={15} />
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="focus:bg-transparent">
                                    <a className="flex gap-2 items-center" href="https://discord.com/invite/jyUgBweNQz" target="_blank" rel="noreferrer noreferrer">
                                        <Image style={{ width: 'auto', height: currentTheme === "dark" ? '14px' : '18px' }} src={`/icons/Discord-${currentTheme}.svg`} alt="" width={0} height={0} />
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
                                {mounted && currentTheme && <Image style={{ width: 'auto', height: '50px' }} priority src={`/icons/Falkordb-${currentTheme}.svg`} alt="" width={0} height={0} />}
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
                    mounted &&
                    <>
                        {separator}
                        <Button
                            data-testid="themeToggle"
                            title={`Toggle theme current theme: ${theme}`}
                            onClick={() => {
                                let newTheme = "";
                                if (theme === "dark") newTheme = "light";
                                else if (theme === "light") newTheme = "system";
                                else newTheme = "dark";
                                setTheme(newTheme);
                            }}
                        >
                            {theme === "dark" && <Sun size={iconSize} />}
                            {theme === "light" && <Monitor size={iconSize} />}
                            {theme === "system" && <Moon size={iconSize} />}
                        </Button>
                    </>
                }
                {
                    indicator === "offline" &&
                    <>
                        {separator}
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
                {separator}
                <Button
                    title="Log Out"
                    data-testid="logoutButton"
                    onClick={() => signOut({ redirect: false }).then(() => router.push("/login"))}
                >
                    <LogOut size={iconSize - 5} />
                </Button>
            </div>
        </div >
    );
}
