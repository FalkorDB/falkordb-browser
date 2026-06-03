
'use client';

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getQuerySettingsNavigationToast } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useSettingsParams } from "@/lib/useUrlParams";
import Users from "./users/Users";
import Configurations from "./Configurations";
import Button from "../components/ui/Button";
import BrowserSettings from "./browserSettings";
import PersonalAccessTokens from "./tokens/PersonalAccessTokens";
import { IndicatorContext, BrowserSettingsContext, ConnectionContext } from "../components/provider";

type Tab = 'Browser' | 'Configurations' | 'Users' | 'Tokens';

const VALID_TABS: Tab[] = ['Browser', 'Configurations', 'Users', 'Tokens'];

function isValidTab(value: string): value is Tab {
    return VALID_TABS.includes(value as Tab);
}

export default function Settings() {

    const { hasChanges, saveSettings, resetSettings } = useContext(BrowserSettingsContext);
    const { activeConnectionId } = useContext(ConnectionContext);
    const { indicator } = useContext(IndicatorContext);
    const { data: session, status: sessionStatus } = useSession();
    const { toast } = useToast();
    const router = useRouter();
    const { tab: urlTab, setTab } = useSettingsParams();

    const [current, setCurrent] = useState<Tab>("Browser");
    const [hasMounted, setHasMounted] = useState(false);
    const prevActiveConnectionIdRef = useRef<string | null | undefined>(undefined);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Sync tab from URL param (after hydration, useSearchParams populates)
    useEffect(() => {
        if (isValidTab(urlTab)) {
            setCurrent(urlTab);
        }
    }, [urlTab]);

    const setCurrentTab = useCallback((tab: Tab) => {
        setCurrent(tab);
        setTab(tab === "Browser" ? "" : tab);
    }, [setTab]);

    const navigateBack = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && current !== "Browser") {
            e.preventDefault();

            router.back();
        }
    }, [current, router]);

    useEffect(() => {
        window.addEventListener("keydown", navigateBack);

        return () => {
            window.removeEventListener("keydown", navigateBack);
        };
    }, [navigateBack]);

    // Reset to Browser whenever the current tab requires admin access but the
    // active connection is not admin (e.g. user switches to a read/write connection).
    const isAdmin = session?.user.role === "Admin" && indicator === "online";
    const adminOnlyTabs: Tab[] = ["Users", "Configurations"];
    useEffect(() => {
        // Don't reset tabs while session is still loading — isAdmin would be
        // false and we'd wrongly kick the user off an admin tab that was
        // requested via the ?tab= URL param.
        if (sessionStatus !== "authenticated") return;
        if (!isAdmin && adminOnlyTabs.includes(current)) {
            setCurrentTab("Browser");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, current, sessionStatus]);

    useEffect(() => {
        const prev = prevActiveConnectionIdRef.current;
        prevActiveConnectionIdRef.current = activeConnectionId;
        // Only reset when the user explicitly switches connections (non-null → different non-null).
        // Skip the initial null → value transition that happens on first connection load.
        if (prev != null && activeConnectionId != null && prev !== activeConnectionId && adminOnlyTabs.includes(current as Tab)) {
            setCurrentTab("Browser");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConnectionId, current]);
    const handleSetCurrent = useCallback((tab: Tab) => {
        if (current === "Browser" && hasChanges) {
            getQuerySettingsNavigationToast(toast, () => {
                saveSettings();
                setCurrentTab(tab);
            }, () => {
                resetSettings();
                setCurrentTab(tab);
            });
        } else {
            setCurrentTab(tab);
        }
    }, [current, hasChanges, resetSettings, saveSettings, setCurrentTab, toast]);

    const getCurrentTab = () => {
        // Guard: render admin-only tabs only when user has admin access.
        // This prevents stale renders if the tab state hasn't been reset yet.
        if (!isAdmin && adminOnlyTabs.includes(current as Tab)) {
            return <BrowserSettings />;
        }
        switch (current) {
            case 'Users':
                return <Users />;
            case 'Configurations':
                return <Configurations />;
            case 'Tokens':
                return <PersonalAccessTokens />;
            default:
                return <BrowserSettings />;
        }
    };

    return (
        <div className="Page p-2 gap-2">
            <p className="text-sm text-foreground"><span className="opacity-50">Settings</span> <span data-testid="settingsCurrentTab">{`> ${current}`}</span></p>
            <div className="w-full bg-background flex flex-wrap gap-2 p-2 rounded-lg justify-center overflow-x-auto">
                <Button
                    data-testid="settingsTabBrowser"
                    className={cn("p-2 rounded-lg", current === "Browser" ? "bg-background" : "text-gray-500")}
                    label="Browser Settings"
                    title="Manage browser settings"
                    onClick={() => handleSetCurrent("Browser")}
                />
                {
                    hasMounted && session?.user.role === "Admin" && indicator === "online" &&
                    <>
                        <Button
                            data-testid="settingsTabConfigurations"
                            className={cn("p-2 rounded-lg", current === "Configurations" ? "bg-background" : "text-gray-500")}
                            label="DB Configurations"
                            title="Configure database settings"
                            onClick={() => handleSetCurrent("Configurations")}
                        />
                        <Button
                            data-testid="settingsTabUsers"
                            className={cn("p-2 rounded-lg", current === "Users" ? "bg-background" : "text-gray-500")}
                            label="Users"
                            title="Manage users accounts"
                            onClick={() => handleSetCurrent("Users")}
                        />
                    </>
                }
                <Button
                    data-testid="settingsTabTokens"
                    className={cn("p-2 rounded-lg", current === "Tokens" ? "bg-background" : "text-gray-500")}
                    label="Personal Access Tokens"
                    title="Manage personal access tokens"
                    onClick={() => handleSetCurrent("Tokens")}
                />
            </div>
            {
                getCurrentTab()
            }
        </div>
    );
}