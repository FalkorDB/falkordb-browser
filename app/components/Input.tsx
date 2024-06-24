import { cn } from "@/lib/utils"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    variant: "Default" | "Small"
}

export default function Input({ variant, className, ...props }: Props) {

    return (
        <input
            className={cn(
                "text-white p-2",
                variant === "Default" && "bg-white text-black focus:border focus:border-[#5D5FEF] rounded-lg",
                variant === "Small" && " min-w-72 bg-[#1F1F3D] hover:bg-[#2E2E51] focus:border focus:border-[#5D5FEF] rounded-lg",
                className
            )}
            type="text"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    )

}