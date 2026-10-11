'use client';

import { ReactElement } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import useAppDownload from "@/lib/useAppDownload";

interface Props {
    className: string
    iconSize?: number
    onSelect?: () => void
    /** Inside a dropdown: register as a menu item, so arrow keys and Enter reach it. */
    asMenuItem?: boolean
}

/**
 * "Download for macOS" / "Get the Android app" / … for the visitor's OS, or
 * nothing when there is no app for it or they are already in one.
 */
export default function AppDownloadLink({ className, iconSize = 20, onSelect, asMenuItem = false }: Props) {
    const download = useAppDownload();
    const { toast } = useToast();

    if (!download) return null;

    const item = (control: ReactElement) => (asMenuItem ? <DropdownMenuItem asChild>{control}</DropdownMenuItem> : control);

    // iOS has no installable app until one is in the App Store, so it gets
    // instructions instead. A toast outlives the menu that opened it.
    if (download.kind === "homeScreen") {
        return item(
            <button
                type="button"
                className={className}
                data-testid="appDownload"
                onClick={() => {
                    onSelect?.();
                    toast({
                        title: "Add FalkorDB Browser to your Home Screen",
                        description: "Tap the Share button, then \"Add to Home Screen\". It opens full screen, like an app.",
                    });
                }}
            >
                <Download size={iconSize} />
                <span>{download.label}</span>
            </button>
        );
    }

    return item(
        <a className={className} href={download.href} target="_blank" rel="noreferrer" data-testid="appDownload" onClick={onSelect}>
            <Download size={iconSize} />
            <span>{download.label}</span>
            <ArrowUpRight size={15} className="ml-auto" />
        </a>
    );
}
