/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-props-no-spreading */
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export type Variant = "Large" | "Primary" | "Secondary" | "Cancel" | "button"

/* eslint-disable react/require-default-props */
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    label?: string
    variant?: Variant
    open?: boolean
    side?: "down" | "left" | "right"
    children?: React.ReactNode
}

const getClassName = (variant: Variant, disable: boolean | undefined, open: boolean | undefined, classN: string | undefined) => {

    let className = cn(
        "disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
        variant !== "button" && "rounded-lg hover:opacity-90",
        open !== undefined && "gap-4",
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
        default:
    }
    return className
}

const Button = forwardRef<HTMLButtonElement, Props>(({ label, variant = "button", open, className, title, type = "button", disabled, children, ...props }, ref) =>
    (title || label) ? (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    ref={ref}
                    className={getClassName(variant, disabled, open, className)}
                    disabled={disabled}
                    type={type}
                    {...props}
                >
                    {children}
                    {label}
                </button>
            </TooltipTrigger>
            <TooltipContent>
                {title || label}
            </TooltipContent>
        </Tooltip>
    ) : (
        <button
            ref={ref}
            className={getClassName(variant, disabled, open, className)}
            disabled={disabled}
            type={type}
            {...props}
        >
            {children}
            {label}
        </button>
    ))

Button.displayName = "Button"

export default Button