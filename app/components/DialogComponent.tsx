'use client';

import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import CloseDialog from "./CloseDialog";

/* eslint-disable react/require-default-props */
interface Props {
    children: React.ReactNode
    title: string
    description?: ReactNode
    className?: string
}

export default function DialogComponent({ children, title, description, className }: Props) {
    return (
        <DialogContent className={cn("max-h-[90%] p-0 flex flex-col gap-0 rounded-lg border-2 overflow-hidden", className)} disableClose>
            <DialogHeader className="flex-row justify-between items-center p-8 bg-[#7167F6]">
                <DialogTitle>{title}</DialogTitle>
                <CloseDialog />               
            </DialogHeader>
            <div className="h-[90%] p-8 flex flex-col gap-10 overflow-auto">
                {
                    description &&
                    <DialogDescription className="text-xl">
                        {description}
                    </DialogDescription>
                }
                {children}
            </div>
        </DialogContent>
    )
}