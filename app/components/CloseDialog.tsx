'use client';

import { DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import Button, { Variant } from "./ui/Button";

/* eslint-disable react/require-default-props */
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    icon?: JSX.Element
    label?: string
    variant?: Variant
}

export default function CloseDialog({ className, label, icon, ...props }: Props) {
    return (
        <DialogClose asChild >
            <Button
                className={className}
                label={label}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                {!label && <X />}
            </Button>
        </DialogClose>
    )
}