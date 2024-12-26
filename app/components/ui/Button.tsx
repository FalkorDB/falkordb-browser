import { cn } from "@/lib/utils"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { forwardRef } from "react"

type Variant = "Large" | "Primary" | "Secondary" | "Cancel" | "button"

/* eslint-disable react/require-default-props */
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    label?: string
    variant?: Variant
    icon?: JSX.Element
    iconSide?: "left" | "right"
    open?: boolean
    side?: "down" | "left" | "right"
}

const getChevron = (open: boolean | undefined, side: string) => {
    if (open === undefined) return null
    switch (side) {
        case "left": return open ? <ChevronRight /> : <ChevronLeft />
        case "right": return open ? <ChevronLeft /> : <ChevronRight />
        default: return open ? <ChevronUp /> : <ChevronDown />
    }
}

const getClassName = (variant: Variant, disable: boolean | undefined, open: boolean | undefined, icon: boolean, classN: string | undefined) => {

    let className = cn(
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant !== "button" && "rounded-lg",
        icon && "gap-2",
        (open !== undefined || icon) && "flex items-center",
        open !== undefined && "gap-4",
        classN,
    )

    switch (variant) {
        case "Primary":
            className = cn(
                "px-4 py-2 bg-primary",
                !disable && "hover:bg-primary hover:opacity-90",
                icon && "gap-3.5",
                className
            )
            break
        case "Secondary":
            className = cn("px-12 py-1 bg-transparent border-[3px] border-primary hover:opacity-90", className)
            break
        case "Cancel":
            className = cn("px-12 py-1 bg-transparent border-2 border-secondary hover:opacity-90", className)
            break
        default:
    }
    return className
}

const Button = forwardRef<HTMLButtonElement, Props>(({ label, variant = "button", icon, iconSide = "left", open, side = "down", className, type = "button", disabled, ...props }, ref) => (
    <button
        ref={ref}
        className={getClassName(variant, disabled, open, !!icon, className)}
        disabled={disabled}
        title={label}
        // eslint-disable-next-line react/button-has-type
        type={type}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {iconSide === "left" && icon}
        {side === "left" && getChevron(open, side)}
        {label && <p className="truncate">{label}</p>}
        {side !== "left" && getChevron(open, side)}
        {iconSide === "right" && icon}
    </button>
))

Button.displayName = "Button"

export default Button