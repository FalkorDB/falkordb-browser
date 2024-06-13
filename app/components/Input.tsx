import { cn } from "@/lib/utils"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    variant: "Default" | "Small"
}

export default function Input({ variant, className, ...props }: Props) {

    return (
        <input
            className={cn(
                "text-white p-4",
                variant === "Default" && "bg-white text-black px-4 py-2 focus:border focus:border-[#5D5FEF] rounded-lg",
                variant === "Small" && "bg-[#272746] hover:bg-[#2E2E51] focus:border focus:border-[#5D5FEF] rounded-lg",
                className
            )}
            type="text"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    )

}