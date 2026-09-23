"use client"

import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import useIsMobile from "@/lib/useIsMobile"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Props {
    /** The hint itself. */
    children: React.ReactNode
    /** Defaults to an info glyph. */
    trigger?: React.ReactNode
    className?: string
    contentClassName?: string
    "data-testid"?: string
}

/**
 * A hint whose trigger has no other job.
 *
 * Radix tooltips never open on touch — they bail out of `onPointerMove` when
 * `pointerType === "touch"` and close on `pointerdown` — so a hover-only hint is
 * simply invisible on a phone, and its trigger becomes a glyph that does nothing
 * when tapped. Popovers do open on tap, so use one there.
 *
 * Only for hints. Where the trigger is a real control (a button that uploads,
 * runs, deletes) keep the plain tooltip: the tap already does something, and
 * popping a bubble on top of that is noise.
 */
export default function HelpTip({ children, trigger, className, contentClassName, ...props }: Props) {
    const isMobile = useIsMobile()
    const testId = props["data-testid"]
    const triggerClassName = cn("flex items-center gap-1 text-foreground/60", className)
    const content = trigger ?? <Info size={16} />

    if (isMobile) {
        return (
            <Popover>
                {/* The glyph is 16px and sits inline next to text, so the tap area is
                    grown with a pseudo-element rather than by padding the trigger out
                    and shifting whatever it labels. */}
                <PopoverTrigger type="button" data-testid={testId} aria-label="More information" className={cn(triggerClassName, "relative after:absolute after:-inset-[14px] after:content-['']")}>
                    {content}
                </PopoverTrigger>
                {/* Mirrors TooltipContent's colours and leading icon so the hint reads
                    the same on both layouts. */}
                <PopoverContent
                    align="start"
                    className={cn(
                        "z-[9999] flex w-[80vw] max-w-[320px] items-start gap-2 whitespace-pre-line bg-popover-foreground p-3 text-sm text-popover",
                        contentClassName
                    )}
                >
                    <Info className="mt-0.5 shrink-0" size={16} />
                    <span>{children}</span>
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Tooltip>
            <TooltipTrigger type="button" data-testid={testId} aria-label="More information" className={triggerClassName}>
                {content}
            </TooltipTrigger>
            <TooltipContent className={contentClassName}>{children}</TooltipContent>
        </Tooltip>
    )
}
