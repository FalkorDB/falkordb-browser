"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    /**
     * Omit when the child already renders its own title and close button —
     * otherwise the sheet shows a second, redundant header.
     */
    title?: ReactNode;
    children: ReactNode;
    /** Share of the host region the sheet covers when open. Ignored when `push`. */
    height?: "half" | "full";
    /**
     * Take space in the flow instead of covering the region, so the content above
     * stays fully visible and interactive. Requires the host to be a flex column.
     */
    push?: boolean;
    /** Catch taps outside the sheet and close it. Deliberately undimmed. */
    withOverlay?: boolean;
    /**
     * Stacking level for this sheet and its overlay, which sits one below it.
     * Sheets that can be open at once pass ascending values so the newest covers
     * the rest.
     */
    zIndex?: number;
    className?: string;
    "data-testid"?: string;
}

const HEIGHTS = {
    half: "h-1/2",
    full: "h-full",
} as const;

/**
 * Mobile stand-in for the desktop side panels.
 *
 * Children stay MOUNTED when closed — the sheet only translates out of its host
 * region — so panel state (search text, scroll, selection) survives every open/close.
 * That is a hard requirement here: unmounting would also drop the canvas underneath.
 *
 * Positioned `absolute`, so it covers only the region it is rendered into rather than
 * the whole screen, keeping the header and navigation visible above it.
 */
export default function BottomSheet({
    open,
    onClose,
    title,
    children,
    height = "half",
    push = false,
    withOverlay = true,
    zIndex = 40,
    className,
    "data-testid": testId,
}: BottomSheetProps) {
    return (
        <>
            {/* Only while open. The sheet itself stays mounted (see below), but an
                overlay has no state to preserve, and a hidden one would leave a
                phantom "Close" control in the accessibility tree — one per sheet. */}
            {withOverlay && !push && open && (
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    style={{ zIndex }}
                    className="absolute inset-0"
                />
            )}
            <div
                data-testid={testId}
                data-state={open ? "open" : "closed"}
                // `inert` keeps the off-screen content out of the tab order and the
                // accessibility tree without unmounting it.
                inert={!open}
                style={push ? undefined : { zIndex: zIndex + 1 }}
                className={cn(
                    "flex flex-col rounded-t-xl border-t border-border bg-background",
                    push
                        ? [
                            "relative shrink-0 max-h-[70%]",
                            // Same reason as the covering branch below: this sheet is the
                            // last row of the region, so under `viewport-fit=cover` its
                            // final control would sit beneath the home indicator. Only
                            // while open — padding on a `h-0` border-box still takes space.
                            open ? "pb-[env(safe-area-inset-bottom)]" : "h-0 overflow-hidden border-t-0",
                        ]
                        : [
                            "absolute inset-x-0 bottom-0 shadow-2xl",
                            "transition-transform duration-200 ease-out will-change-transform",
                            // `viewport-fit=cover` lets the layout run under the home
                            // indicator, so a sheet pinned to the bottom edge has to pad
                            // itself back out. `env()` is 0 where there is no inset.
                            "pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
                            HEIGHTS[height],
                            open ? "translate-y-0" : "translate-y-full",
                        ],
                    className
                )}
            >
                {
                    title !== undefined &&
                    <div className="shrink-0 flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2">
                        <div className="min-w-0 truncate text-sm font-medium">{title}</div>
                        <button
                            type="button"
                            title="Close"
                            aria-label="Close"
                            data-testid={testId ? `${testId}Close` : undefined}
                            onClick={onClose}
                            className="shrink-0 rounded p-1 hover:bg-secondary min-h-11 min-w-11 flex items-center justify-center"
                        >
                            <X size={18} />
                        </button>
                    </div>
                }
                <div className="min-h-0 grow overflow-auto overscroll-contain">{children}</div>
            </div>
        </>
    );
}
