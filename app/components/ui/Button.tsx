/* eslint-disable react/jsx-props-no-spreading */
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button as UIButton } from "@falkordb/ui";
import { Loader2 } from "lucide-react";
import React, { forwardRef } from "react";

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

/**
 * The design system's button owns the behaviour; these are the looks this app
 * has of its own, handed over as a class name because `variant="none"` and
 * `size="none"` leave the geometry entirely to the consumer.
 */
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

const Button = forwardRef<HTMLButtonElement, Props>(({ label, variant = "button", open, className, title, type = "button", disabled, children, isLoading = false, loaderSize = 16, indicator, tooltipVariant = variant, tooltipSide, ...props }, ref) =>
    title !== "" && (title || label || indicator === "offline") && variant !== "Cancel" ? (
        <Tooltip>
            <TooltipTrigger asChild>
                <UIButton
                    ref={ref}
                    variant="none"
                    size="none"
                    className={getClassName(variant, disabled, open, isLoading, className)}
                    disabled={disabled || isLoading || indicator === "offline"}
                    aria-label={title}
                    type={type}
                    isLoading={isLoading}
                    loaderSize={loaderSize}
                    label={label || undefined}
                    labelClassName="text-center"
                    {...props}
                >
                    {children}
                </UIButton>
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
        // Without a tooltip the spinner joins the children rather than replacing
        // them, so this branch composes its own content instead of handing
        // `isLoading` to the design system.
        <UIButton
            ref={ref}
            variant="none"
            size="none"
            className={getClassName(variant, disabled, open, isLoading, className)}
            disabled={disabled || isLoading}
            type={type}
            {...props}
        >
            {children}
            {isLoading ? <Loader2 className="animate-spin" /> : label}
        </UIButton>
    ));

Button.displayName = "Button";

export default Button;