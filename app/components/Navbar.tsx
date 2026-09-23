/* eslint-disable react/require-default-props */

'use client';

import { ArrowUpRight, FileCode, Info, LogOut, Menu, Monitor, Moon, Sun, Settings, FunctionSquare, GitGraph } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { cn, getTheme } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import pkg from '@/package.json';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/components/ui/use-toast";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useTheme } from "next-themes";
import useIsMobile from "@/lib/useIsMobile";
import Button from "./ui/Button";
import DialogComponent from "./DialogComponent";
import CloseDialog from "./CloseDialog";

interface Props {
    showUDF: boolean
}

function getPathType(pathname: string): "Graph" | "Settings" | "UDF" | undefined {
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
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const [mounted, setMounted] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleConfirmLogout = async () => {
        setLoggingOut(true);
        try {
            await signOut({ redirect: false });
            setLogoutDialogOpen(false);
            // The marker stops a preconfigured connection logging the user straight back in.
            router.push("/login?signedOut=true");
        } catch {
            toast({ title: "Failed to sign out", description: "Please try again.", variant: "destructive" });
        } finally {
            setLoggingOut(false);
        }
    };

    const type = getPathType(pathname);

    useEffect(() => {
        setMounted(true);
    }, []);

    const separator = <div className="h-px w-[80%] bg-border/50 rounded-full" />;

    const aboutContent = (
        <div className="h-full flex flex-col gap-8 max-w-[30rem] p-4 mobile:gap-6 mobile:overflow-y-auto">
            <div className="h-1 grow flex flex-col gap-8 items-center justify-center mobile:gap-6">
                {mounted && currentTheme && <Image style={{ width: 'auto', height: '50px' }} priority src={`/icons/Falkordb-${currentTheme}.svg`} alt="" width={0} height={0} />}
                <h1 className="text-3xl font-bold mobile:text-2xl mobile:text-center">We Make AI Reliable</h1>
                <p className="text-xl text-center mobile:text-base">
                    Delivering a scalable,
                    low-latency graph database designed for development teams managing
                    structured and unstructured interconnected data in real-time or interactive environments.
                </p>
            </div>
            <div className="flex flex-col gap-8 items-center mobile:gap-4">
                <p>Version: {pkg.version}</p>
                {/* Too wide for a phone in one line, and forcing it there scrolls the drawer sideways. */}
                <p className="text-sm text-nowrap mobile:text-wrap mobile:text-center">All Rights Reserved © 2024 - {new Date().getFullYear()} falkordb.com</p>
            </div>
        </div>
    );

    if (isMobile) {
        const item = "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-secondary";
        const go = (href: string) => {
            setMenuOpen(false);
            router.push(href);
        };

        return (
            <>
                <Drawer direction="left" open={menuOpen} onOpenChange={setMenuOpen}>
                    <DrawerTrigger asChild>
                        <Button
                            data-testid="mobileNavToggle"
                            title="Menu"
                            className="shrink-0 text-foreground p-1 rounded-lg hover:bg-secondary min-h-11 min-w-11 justify-center"
                        >
                            <Menu size={22} />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent side="left" className="w-[80vw] max-w-[320px] bg-background text-foreground">
                        <VisuallyHidden>
                            <DrawerTitle>Navigation</DrawerTitle>
                            <DrawerDescription />
                        </VisuallyHidden>
                        <div className="h-full w-full flex flex-col gap-1 overflow-y-auto p-3">
                            {mounted && currentTheme && (
                                <Link
                                    className="mb-2 ml-3 h-12 w-12 shrink-0 overflow-hidden rounded-full"
                                    aria-label="FalkorDB"
                                    href="https://www.falkordb.com"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Image style={{ width: 'auto', height: '48px' }} priority src={`/icons/F-${currentTheme}.svg`} alt="FalkorDB Logo" width={0} height={0} />
                                </Link>
                            )}
                            <div data-testid="NavigationButtons" className="flex flex-col gap-1">
                                <button type="button" className={cn(item, type === "Graph" && "text-primary")} onClick={() => go("/graph")} data-testid="GraphsButton">
                                    <GitGraph size={20} />
                                    <span>Graphs</span>
                                </button>
                                {showUDF && (
                                    <button type="button" className={cn(item, type === "UDF" && "text-primary")} onClick={() => go("/udf")} data-testid="UdfButton">
                                        <FunctionSquare size={20} />
                                        <span>Functions</span>
                                    </button>
                                )}
                                <button type="button" className={cn(item, type === "Settings" && "text-primary")} onClick={() => go("/settings")} data-testid="settings">
                                    <Settings size={20} />
                                    <span>Settings</span>
                                </button>
                            </div>
                            {/* Help, theme and logout sit at the bottom, away from the navigation. */}
                            <div className="mt-auto flex shrink-0 flex-col gap-1 pt-4">
                                <a className={item} href="https://docs.falkordb.com/" target="_blank" rel="noreferrer">
                                    <FileCode size={20} />
                                    <span>Documentation</span>
                                    <ArrowUpRight size={15} className="ml-auto" />
                                </a>
                                <Link className={item} href="/docs" onClick={() => setMenuOpen(false)}>
                                    <FileCode size={20} />
                                    <span>API Documentation</span>
                                    <ArrowUpRight size={15} className="ml-auto" />
                                </Link>
                                <a className={item} href="https://discord.com/invite/jyUgBweNQz" target="_blank" rel="noreferrer">
                                    <Image className="shrink-0" style={{ width: 'auto', height: '18px' }} src={`/icons/Discord-${currentTheme}.svg`} alt="" width={0} height={0} />
                                    <span>Get Support</span>
                                    <ArrowUpRight size={15} className="ml-auto" />
                                </a>
                                {/* Opened after the nav drawer closes: two drawers at once would
                                    fight over focus and leave two scrims stacked. */}
                                <button
                                    type="button"
                                    className={item}
                                    data-testid="mobileAboutButton"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setAboutOpen(true);
                                    }}
                                >
                                    <Info size={20} />
                                    <span>About</span>
                                </button>
                                <div className="my-2 h-px bg-border/50" />
                                {mounted && (
                                    <button
                                        type="button"
                                        className={item}
                                        data-testid="themeToggle"
                                        onClick={() => {
                                            let newTheme = "";
                                            if (theme === "dark") newTheme = "light";
                                            else if (theme === "light") newTheme = "system";
                                            else newTheme = "dark";
                                            setTheme(newTheme);
                                        }}
                                    >
                                        {theme === "dark" && <Sun size={20} />}
                                        {theme === "light" && <Monitor size={20} />}
                                        {theme === "system" && <Moon size={20} />}
                                        <span>Theme: {theme}</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={cn(item, "text-destructive")}
                                    data-testid="mobileLogoutButton"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setLogoutDialogOpen(true);
                                    }}
                                >
                                    <LogOut size={20} />
                                    <span>Logout All</span>
                                </button>
                                <p className="pt-2 text-center text-xs text-muted-foreground">
                                    Version {pkg.version} · © 2024 - {new Date().getFullYear()} falkordb.com
                                </p>
                            </div>
                        </div>
                    </DrawerContent>
                </Drawer>
                <Drawer direction="right" open={aboutOpen} onOpenChange={setAboutOpen}>
                    <DrawerContent side="right" className="w-[92vw] max-w-[400px] bg-background items-center text-foreground overflow-hidden" id="about" data-testid="mobileAboutPanel">
                        <VisuallyHidden>
                            <DrawerTitle>About</DrawerTitle>
                            <DrawerDescription />
                        </VisuallyHidden>
                        {aboutContent}
                    </DrawerContent>
                </Drawer>
                <DialogComponent
                    open={logoutDialogOpen}
                    onOpenChange={(open) => { if (!loggingOut) setLogoutDialogOpen(open); }}
                    title="Logout All?"
                    className="max-w-md"
                    description="In addition to logging out of every connection, this will end your FalkorDB Browser session, remove all stored connection credentials from this session, and require you to log in again to reconnect."
                    trigger={<span className="hidden" />}
                >
                    <div className="flex justify-end gap-2">
                        <Button
                            data-testid="logoutConfirm"
                            variant="Delete"
                            label="Logout All"
                            onClick={handleConfirmLogout}
                            isLoading={loggingOut}
                        />
                        <CloseDialog
                            data-testid="logoutCancel"
                            label="Cancel"
                            disabled={loggingOut}
                        />
                    </div>
                </DialogComponent>
            </>
        );
    }

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
                </div>
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
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
                {separator}
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
                        {aboutContent}
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
                <DialogComponent
                    open={logoutDialogOpen}
                    onOpenChange={(open) => { if (!loggingOut) setLogoutDialogOpen(open); }}
                    title="Logout All?"
                    className="max-w-md"
                    description="In addition to logging out of every connection, this will end your FalkorDB Browser session, remove all stored connection credentials from this session, and require you to log in again to reconnect."
                    trigger={
                        <Button
                            title="Logout All"
                            className="text-foreground p-1 rounded-lg border border-transparent hover:bg-secondary hover:border-border/10"
                            data-testid="logoutButton"
                        >
                            <LogOut size={iconSize} />
                        </Button>
                    }
                >
                    <div className="flex justify-end gap-2">
                        <Button
                            data-testid="logoutConfirm"
                            variant="Delete"
                            label="Logout All"
                            onClick={handleConfirmLogout}
                            isLoading={loggingOut}
                        />
                        <CloseDialog
                            data-testid="logoutCancel"
                            label="Cancel"
                            disabled={loggingOut}
                        />
                    </div>
                </DialogComponent>
            </div>
        </div >
    );
}
