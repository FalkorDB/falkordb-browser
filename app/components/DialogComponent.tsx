'use client';

import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode } from "react";

/* eslint-disable react/require-default-props */
interface Props {
    children: React.ReactNode
    title: string
    description?: ReactNode
    className?: string
}

export default function DialogComponent({ children, title, description, className }: Props) {
    return (
        <DialogContent className={cn("max-h-[90%] p-0 flex flex-col gap-0", className)} disableClose>
            <DialogHeader className="h-[10%] flex flex-row justify-between items-center p-4 bg-[#7167F6]">
                <DialogTitle>{title}</DialogTitle>
                <DialogClose>
                    <button
                        title="Close"
                        type="button"
                        aria-label="Close"
                    >
                        <X />
                    </button>
                </DialogClose>
            </DialogHeader>
            <div className="h-[90%] p-8 flex flex-col gap-10">
                {
                    description &&
                    <DialogDescription className="text-2xl">
                        {description}
                    </DialogDescription>
                }
                {children}
            </div>
        </DialogContent>
    )
}