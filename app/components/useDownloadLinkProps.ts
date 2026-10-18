'use client';

import { useToast } from "@/components/ui/use-toast";
import { AppPlatform, INSTALL_STEPS, isDirectDownload } from "@/lib/appDownload";

// Long enough to read the steps while the download finishes.
const STEPS_DURATION_MS = 20_000;

/**
 * Props for a link to an app. An installer file downloads in place, with the
 * install steps shown on this page: a new tab would hold nothing but a blank
 * page while the file downloads. A store page opens in a new tab as usual.
 */
export default function useDownloadLinkProps() {
    const { toast } = useToast();

    return (href: string, platform: AppPlatform, onSelect?: () => void) => {
        if (!isDirectDownload(href)) {
            return { href, target: "_blank", rel: "noreferrer", onClick: onSelect };
        }
        return {
            href,
            onClick: () => {
                onSelect?.();
                toast({ title: "Downloading FalkorDB Browser", description: INSTALL_STEPS[platform], duration: STEPS_DURATION_MS });
            },
        };
    };
}
