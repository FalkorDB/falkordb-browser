'use client';

import { DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Button from "./ui/Button";

/* eslint-disable react/require-default-props */
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    icon?: JSX.Element
    label?: string
    variant?: "Large" | "Primary" | "Secondary" | "button"
}

export default function CloseDialog({ className, label, variant, icon, ...props }: Props) {
    return (
        <DialogClose asChild >
            <Button
                icon={icon || (!label ? <X /> : undefined)}
                className={cn("", className)}
                variant={variant}
                label={label}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </DialogClose>
    )
}