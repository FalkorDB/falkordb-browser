import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button as UIButton, type ButtonProps as UIButtonProps } from "@falkordb/ui";
import { Loader2 } from "lucide-react";
import React, { forwardRef } from "react";

export type Variant = "Primary" | "Secondary" | "Cancel" | "Delete" | "button";

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

/** This app's names for the looks the design system ships. */
const LOOKS: Record<Variant, Pick<UIButtonProps, "variant" | "size">> = {
    Primary: { variant: "default", size: "default" },
    Secondary: { variant: "secondary", size: "wide" },
    Cancel: { variant: "cancel", size: "wide" },
    Delete: { variant: "destructive", size: "default" },
    button: { variant: "none", size: "none" },
};

const Button = forwardRef<HTMLButtonElement, Props>(({ label, variant = "button", open, className, title, type = "button", disabled, children, isLoading = false, loaderSize = 16, indicator, tooltipVariant = variant, tooltipSide, ...props }, ref) =>
    title !== "" && (title || label || indicator === "offline") && variant !== "Cancel" ? (
        <Tooltip>
            <TooltipTrigger asChild>
                <UIButton
                    ref={ref}
                    {...LOOKS[variant]}
                    className={cn(open !== undefined && "gap-4", className)}
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
            {...LOOKS[variant]}
            className={cn(open !== undefined && "gap-4", isLoading && "justify-center", className)}
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