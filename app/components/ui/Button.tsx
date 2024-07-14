import { cn } from "@/lib/utils"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"

/* eslint-disable react/require-default-props */
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    label: string
    variant?: "Large" | "Primary" | "Secondary" | "button"
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

export default function Button({ label, variant = "button", icon, open, side = "down", className, type = "button", ...props }: Props) {


    return (
        <button
            className={cn(
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variant !== "button" && "rounded-lg",
                variant === "Large" && "py-4 bg-[#7167F6] hover:bg-[#6157E9] px-32",
                variant === "Primary" && "px-4 py-2 bg-[#7167F6] hover:bg-[#6157E9]",
                variant === "Secondary" && "p-2 bg-[#555577] hover:bg-[#57577B]",
                (icon || open !== undefined) && "flex flex-row items-center",
                open !== undefined && "gap-4",
                icon && variant === "Large" && "gap-4",
                icon && variant === "Primary" && "gap-2",
                icon && variant === "Secondary" && "gap-1",
                className
            )}
            title={label}
            // eslint-disable-next-line react/button-has-type
            type={type}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {icon}
            {side === "left" && getChevron(open, side)}
            <p>{label}</p>
            {side !== "left" && getChevron(open, side)}
        </button>
    )
}