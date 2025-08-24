/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */

"use client"

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ 
    className, 
    ...props 
}, ref) => (
        <input
            ref={ref}
            className={cn(
                "border border-border p-2 rounded-lg disabled:cursor-not-allowed disabled:opacity-50 bg-input text-foreground",
                className
            )}
            {...props}
        />
    ))

Input.displayName = "Input"

export default Input