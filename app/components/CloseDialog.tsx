'use client';

import { DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import Button, { Variant, Props as ButtonProps } from "./ui/Button";

/* eslint-disable react/require-default-props */
interface Props extends ButtonProps {
    label?: string
    variant?: Variant
}

export default function CloseDialog({ className, label, children, ...props }: Props) {
    return (
        <DialogClose asChild >
            <Button
                aria-label="Close"
                variant={label === "Cancel" ? "Cancel" : undefined}
                className={className}
                label={label}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                {(!label && !children) && <X />}
                {children}
            </Button>
        </DialogClose>
    );
}