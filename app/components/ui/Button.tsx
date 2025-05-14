/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-props-no-spreading */
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { forwardRef } from "react"

export type Variant = "Large" | "Primary" | "Secondary" | "Cancel" | "Delete" | "button"

/* eslint-disable react/require-default-props */
export interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    label?: string
    variant?: Variant
    open?: boolean
    side?: "down" | "left" | "right"
    children?: React.ReactNode
    isLoading?: boolean
    indicator?: "offline" | "online"
}

const getClassName = (variant: Variant, disable: boolean | undefined, open: boolean | undefined, isLoading: boolean, classN: string | undefined) => {

    let className = cn(
        "disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
        variant !== "button" && "rounded-lg hover:opacity-90",
        open !== undefined && "gap-4",
        isLoading && "flex items-center justify-center",
        classN,
    )

    switch (variant) {
        case "Primary":
            className = cn(
                "px-4 py-2 bg-primary",
                !disable && "hover:bg-primary",
                className
            )
            break
        case "Secondary":
            className = cn("px-12 py-1 bg-transparent border-[3px] border-primary", className)
            break
        case "Cancel":
            className = cn("px-12 py-1 bg-transparent border-2 border-secondary", className)
            break
        case "Delete":
            className = cn("px-12 py-1 bg-transparent border-2 border-red-500", className)
            break
        default:
    }
    return className
}

const Button = forwardRef<HTMLButtonElement, Props>(({ label, variant = "button", open, className, title, type = "button", disabled, children, isLoading = false, indicator, ...props }, ref) =>
    (title || label || indicator === "offline") ? (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    ref={ref}
                    className={getClassName(variant, disabled, open, isLoading, className)}
                    disabled={disabled || isLoading || indicator === "offline"}
                    aria-label={title}
                    type={type}
                    {...props}
                >
                    {
                        isLoading ?
                            <Loader2 className="animate-spin" />
                            : <>
                                {children}
                                {label}
                            </>
                    }
                </button>
            </TooltipTrigger>
            <TooltipContent className={cn(variant === "Delete" && "bg-red-500")}>
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
    ))

Button.displayName = "Button"

export default Button