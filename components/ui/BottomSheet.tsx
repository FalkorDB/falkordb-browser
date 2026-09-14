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
    className,
    "data-testid": testId,
}: BottomSheetProps) {
    return (
        <>
            {withOverlay && !push && (
                <button
                    type="button"
                    aria-label="Close"
                    tabIndex={open ? 0 : -1}
                    onClick={onClose}
                    className={cn(
                        "absolute inset-0 z-40",
                        !open && "pointer-events-none"
                    )}
                />
            )}
            <div
                data-testid={testId}
                data-state={open ? "open" : "closed"}
                // `inert` keeps the off-screen content out of the tab order and the
                // accessibility tree without unmounting it.
                inert={!open}
                className={cn(
                    "flex flex-col rounded-t-xl border-t border-border bg-background",
                    push
                        ? ["relative shrink-0 max-h-[70%]", !open && "h-0 overflow-hidden border-t-0"]
                        : [
                            "absolute inset-x-0 bottom-0 z-40 shadow-2xl",
                            "transition-transform duration-200 ease-out will-change-transform",
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
                            className="shrink-0 rounded p-1 hover:bg-secondary"
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
