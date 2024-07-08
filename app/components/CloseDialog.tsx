'use client';

import { DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import IconButton from "./IconButton";
import Button from "./Button";

/* eslint-disable react/require-default-props */
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    icon?: JSX.Element
    label?: string
    variant?: "Large" | "Primary" | "Secondary" | "button"
}
interface Props {
}

export default function CloseDialog({ className, label, variant, icon, ...props }: Props) {
    return (
        <DialogClose asChild >
            {
                label ?
                    <Button
                        icon={icon}
                        className={cn("", className)}
                        variant={variant || "button"}
                        label={label}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        />
                        : <IconButton
                        variant="button"
                        icon={<X />}
                        className={cn("", className)}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                    />
            }
        </DialogClose>
    )
}