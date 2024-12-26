import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    variant: "Default" | "Small"
}

const Input = forwardRef<HTMLInputElement, Props>(({ variant, className, ...props }: Props, ref) => (
    <input
        ref={ref}
        className={cn(
            "text-white p-2",
            props.disabled && "cursor-not-allowed",
            variant === "Default" && "bg-white text-black focus:border focus:border-[#5D5FEF] rounded-lg",
            variant === "Small" && "bg-[#1F1F3D] focus:border focus:border-[#5D5FEF] rounded-lg",
            variant === "Small" && !props.disabled && "hover:bg-[#2E2E51]",
            className
        )}
        type="text"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
))

Input.displayName = "Input"

export default Input