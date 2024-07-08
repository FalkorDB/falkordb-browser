import { cn } from "@/lib/utils"

/* eslint-disable react/require-default-props */
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    variant?: "Large" | "Primary" | "Secondary" | "button"
    icon?: JSX.Element
}

export default function IconButton({ icon, variant = "button", className, type = "button", ...props }: Props) {
    
    return (
        <button
            className={cn(
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variant !== "button" && "rounded-lg",
                variant === "Large" && "py-4 bg-[#7167F6] hover:bg-[#6157E9] px-32",
                variant === "Primary" && "px-3 py-2 bg-[#7167F6] hover:bg-[#6157E9]",
                variant === "Secondary" && "p-2 bg-[#555577] hover:bg-[#57577B]",
                className
            )}
            // eslint-disable-next-line react/button-has-type
            type={type}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {icon} 
        </button>
    )
}