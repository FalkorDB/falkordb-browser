/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */

"use client"

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: "primary" | "secondary" | "default";
    className?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ 
    variant = "default", 
    className, 
    ...props 
}, ref) => (
        <input
            ref={ref}
            className={cn(
                "border p-2 rounded-lg disabled:cursor-not-allowed disabled:opacity-50",
                variant === "default" && "bg-input text-black",
                variant === "primary" && "bg-background text-white",
                variant === "secondary" && "bg-secondary",
                className
            )}
            {...props}
        />
    ))

Input.displayName = "Input"

export default Input