import { cn } from "@/lib/utils"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { forwardRef } from "react"

type Variant = "Large" | "Primary" | "Secondary" | "button"

/* eslint-disable react/require-default-props */
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    label?: string
    variant?: Variant
    icon?: JSX.Element
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

const getClassName = (variant: Variant, disable: boolean | undefined, open: boolean | undefined, icon: boolean) => {
    
    let className = "disabled:opacity-50 disabled:cursor-not-allowed"
    className += variant !== "button" ? " rounded-lg" : ""
    className += icon ? " gap-2" : ""
    className += (open !== undefined || icon) ? " flex items-center" : ""
    className += open !== undefined ? " gap-4" : ""
    
    switch (variant) {
        case "Large":
            className += " p-4 bg-[#7167F6]"
            className += !disable ? " hover:bg-[#6157E9]" : ""
            className += icon ? " gap-5" : ""
            break
        case "Primary":
            className += " px-4 py-2 bg-[#7167F6]"
            className += !disable ? " hover:bg-[#6157E9]" : ""
            className += icon ? " gap-3.5" : ""
            break
        case "Secondary":
            className += " px-3 py-2 bg-[#57577B]"
            className += !disable ? " hover:bg-[#444466]" : ""
            break
        default:
    }

    return className
}

const Button = forwardRef<HTMLButtonElement, Props>(({ label, variant = "button", icon, open, side = "down", className, type = "button", disabled, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            getClassName(variant, disabled, open, !!icon),
            className
        )}
        disabled={disabled}
        title={label}
        // eslint-disable-next-line react/button-has-type
        type={type}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {icon}
        {side === "left" && getChevron(open, side)}
        {label && <p>{label}</p>}
        {side !== "left" && getChevron(open, side)}
    </button>
))

Button.displayName = "Button"

export default Button