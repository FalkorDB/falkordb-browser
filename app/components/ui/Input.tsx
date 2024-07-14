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
            variant === "Default" && "bg-white text-black focus:border focus:border-[#5D5FEF] rounded-lg",
            variant === "Small" && "bg-[#1F1F3D] hover:bg-[#2E2E51] focus:border focus:border-[#5D5FEF] rounded-lg",
            className
        )}
        type="text"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
))

Input.displayName = "Input"

export default Input