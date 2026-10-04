/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-props-no-spreading */
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useLongPress from "@/lib/useLongPress";
import { Loader2 } from "lucide-react";
import React, { forwardRef, useEffect, useRef, useState } from "react";

export type Variant = "Large" | "Primary" | "Secondary" | "Cancel" | "Delete" | "button";

/* eslint-disable react/require-default-props */
export interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    label?: string
    variant?: Variant
    open?: boolean
    side?: "down" | "left" | "right"
    children?: React.ReactNode
    isLoading?: boolean
    loaderSize?: number
    indicator?: "offline" | "online"
    tooltipVariant?: Variant
    tooltipSide?: "top" | "bottom" | "left" | "right"
}

const getClassName = (variant: Variant, disable: boolean | undefined, open: boolean | undefined, isLoading: boolean, classN: string | undefined) => {

    let className = cn(
        "disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-150",
        variant !== "button" && "rounded-lg",
        open !== undefined && "gap-4",
        isLoading && "flex items-center justify-center",
        classN,
    );

    switch (variant) {
        case "Primary":
            className = cn(
                "px-4 py-[10px] bg-primary",
                !disable && "hover:bg-primary/80",
                className
            );
            break;
        case "Secondary":
            className = cn("px-12 py-2 bg-transparent border-2 border-primary text-primary", className);
            break;
        case "Cancel":
            className = cn("px-12 py-2 bg-transparent border-2 border-border", className);
            break;
        case "Delete":
            className = cn("px-4 py-[10px] bg-transparent border-2 border-destructive text-destructive", className);
            break;
        default:
    }
    return className;
};

// How long the held tooltip stays once the finger is off it — long enough to read,
// short enough that it never has to be dismissed.
const TOUCH_TOOLTIP_MS = 2500;

const Button = forwardRef<HTMLButtonElement, Props>(({ label, variant = "button", open, className, title, type = "button", disabled, children, isLoading = false, loaderSize = 16, indicator, tooltipVariant = variant, tooltipSide, ...props }, ref) => {
    // Touch has no hover, so a press and hold is what reveals the tooltip — the
    // gesture Android's own buttons answer to.
    const [touchTooltipOpen, setTouchTooltipOpen] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const pressedButton = useRef<HTMLButtonElement | null>(null);
    // Until when a held tooltip refuses to be closed — see `onOpenChange` below.
    const holdUntil = useRef(0);

    const closeTouchTooltip = () => {
        holdUntil.current = 0;
        setTouchTooltipOpen(false);
    };

    const { handlers: longPressHandlers, consumeClick } = useLongPress(() => {
        // An ancestor that owns the hold itself gets to keep it: two gestures on
        // one press would mean a tooltip over a selection the user just started.
        if (pressedButton.current?.closest("[data-long-press]")) return false;

        holdUntil.current = Date.now() + TOUCH_TOOLTIP_MS;
        setTouchTooltipOpen(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(closeTouchTooltip, TOUCH_TOOLTIP_MS);
        return true;
    });

    useEffect(() => () => clearTimeout(hideTimer.current), []);

    // The consumer's own pointer handlers stay live — Radix passes them in through
    // `asChild`, and dropping them would break every trigger built on this button.
    const touchProps = {
        onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
            // A fresh press dismisses whatever the last one put up.
            holdUntil.current = 0;
            pressedButton.current = e.currentTarget;
            props.onPointerDown?.(e);
            longPressHandlers.onPointerDown(e);
        },
        onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
            props.onPointerMove?.(e);
            longPressHandlers.onPointerMove(e);
        },
        onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
            props.onPointerUp?.(e);
            longPressHandlers.onPointerUp();
        },
        onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
            props.onPointerCancel?.(e);
            longPressHandlers.onPointerCancel();
        },
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
            if (consumeClick()) return;
            props.onClick?.(e);
        },
    };

    return title !== "" && (title || label || indicator === "offline") && variant !== "Cancel" ? (
        <Tooltip
            open={touchTooltipOpen}
            onOpenChange={(next) => {
                // Radix closes a tooltip on the click that ends the press, and on
                // touch that click *is* the gesture that just opened it. A held
                // tooltip therefore ignores the close and waits out its own timer.
                if (!next && Date.now() < holdUntil.current) return;
                setTouchTooltipOpen(next);
            }}
        >
            <TooltipTrigger asChild>
                <button
                    ref={ref}
                    className={getClassName(variant, disabled, open, isLoading, className)}
                    disabled={disabled || isLoading || indicator === "offline"}
                    aria-label={title}
                    type={type}
                    {...props}
                    {...touchProps}
                >
                    {
                        isLoading ?
                            <Loader2 size={loaderSize} className="animate-spin" />
                            : <>
                                {children}
                                {
                                    label &&
                                    <p className="truncate text-center">
                                        {label}
                                    </p>
                                }
                            </>
                    }
                </button>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide} className={cn(tooltipVariant === "Delete" && "bg-destructive border-destructive text-foreground", "whitespace-pre-line")}>
                {
                    indicator === "offline" && "The FalkorDB server is offline"
                }
                {
                    indicator !== "offline" && (
                        isLoading ?
                            "Loading..."
                            : title || label
                    )
                }
            </TooltipContent>
        </Tooltip>
    ) : (
        <button
            ref={ref}
            className={getClassName(variant, disabled, open, isLoading, className)}
            disabled={disabled || isLoading}
            type={type}
            {...props}
        >
            {children}
            {isLoading ? <Loader2 className="animate-spin" /> : label}
        </button>
    );
});

Button.displayName = "Button";

export default Button;