import { cn } from "@/lib/utils"

/* eslint-disable react/require-default-props */
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    label: string
    variant: "Large" | "Primary" | "Secondary"
    icon?: JSX.Element
}

export default function Button({ label, variant, icon, className, type = "button", ...props }: Props) {
    
    return (
        <button
            className={cn(
                "rounded-lg",
                variant === "Large" && "py-4 bg-[#7167F6] hover:bg-[#6157E9]",
                variant === "Primary" && "px-3 py-2 bg-[#7167F6] hover:bg-[#6157E9]",
                variant === "Secondary" && "p-2 bg-[#555577] hover:bg-[#57577B]",
                icon && variant === "Primary" && "flex flex-row items-center gap-2", 
                icon && variant === "Secondary" && "flex flex-row items-center gap-1",
                className
            )}
            title={label}
            // eslint-disable-next-line react/button-has-type
            type={type}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {icon}
            <p>{label}</p>
        </button>
    )
}