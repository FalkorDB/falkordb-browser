/* eslint-disable react/require-default-props */

'use client';

import { ArrowUpRight, FileCode, LogOut, Monitor, Moon, Sun, Settings, FunctionSquare, GitGraph } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { cn, getTheme } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import pkg from '@/package.json';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useTheme } from "next-themes";
import Button from "./ui/Button";

interface Props {
    showUDF: boolean
}

function getPathType(pathname: string): "Schema" | "Graph" | "Settings" | "UDF" | undefined {
    if (pathname.includes("/schema")) return "Schema";
    if (pathname.includes("/graph")) return "Graph";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/udf")) return "UDF";
    return undefined;
}

const iconSize = 30;

export default function Navbar({ showUDF }: Props) {

    const { theme, setTheme } = useTheme();
    const { currentTheme } = getTheme(theme);
    const pathname = usePathname();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    const type = getPathType(pathname);

    useEffect(() => {
        setMounted(true);
    }, []);

    const separator = <div className="h-px w-[80%] bg-border/50 rounded-full" />;

    return (
        <div className="py-5 px-2 flex flex-col justify-between items-center border-r border-border/50">
            <div className="w-full flex flex-col gap-3 items-center">
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
                <div data-testid="NavigationButtons" className="p-1 flex flex-col items-center gap-2 bg-foreground/5 rounded-lg">
                    <Button
                        data-testid="settings"
                        className={cn(
                            "text-foreground p-1 rounded-lg border border-transparent hover:bg-secondary hover:border-border/15",
                            type === "Settings" && "!text-primary"
                        )}
                        title="Adjust application settings"
                        onClick={() => router.push("/settings")}
                    >
                        <Settings size={iconSize} />
                    </Button>
                    {
                        showUDF ?
                            <Button
                                title="User Defined Functions: View and manage your UDFs"
                                className={cn(
                                    "text-foreground p-1 rounded-lg border border-transparent hover:bg-secondary hover:border-border/10",
                                    type === "UDF" && "!text-primary"
                                )}
                                onClick={() => router.push("/udf")}
                                data-testid="UdfButton"
                            >
                                <FunctionSquare size={iconSize} />
                            </Button> : null
                    }
                    <Button
                        title="View and manage your graphs"
                        className={cn(
                            "text-foreground p-1 rounded-lg border border-transparent hover:bg-secondary hover:border-border/10",
                            type === "Graph" && "!text-primary"
                        )}
                        onClick={() => router.push("/graph")}
                        data-testid="GraphsButton"
                    >
                        <GitGraph size={iconSize} />
                    </Button>
                </div>
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
                <Drawer direction="right">
                    <DropdownMenu>
                        <DropdownMenuTrigger onClick={(e) => e.preventDefault()} asChild>
                            <Button className="text-foreground p-2 rounded-lg border border-transparent hover:bg-secondary hover:border-border/10" title="Help">
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
                            className="text-foreground p-2 rounded-lg border border-transparent hover:bg-secondary hover:border-border/10"
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
                {separator}
                <Button
                    title="Log Out"
                    className="text-foreground p-1 rounded-lg border border-transparent hover:bg-secondary hover:border-border/10"
                    data-testid="logoutButton"
                    onClick={() => signOut({ redirect: false }).then(() => router.push("/login"))}
                >
                    <LogOut size={iconSize} />
                </Button>
            </div>
        </div >
    );
}
