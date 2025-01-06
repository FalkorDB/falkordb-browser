'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import CloseDialog from "./CloseDialog";

/* eslint-disable react/require-default-props */
interface Props {
    children: React.ReactNode
    title: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger: React.ReactNode
    description?: ReactNode
    className?: string
}

export default function DialogComponent({
    children,
    open,
    onOpenChange,
    trigger,
    title,
    description,
    className,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className={cn("bg-foreground p-8 flex flex-col gap-8 rounded-lg border-none", className)} disableClose>
                <DialogHeader className="flex-row justify-between items-center border-b border-secondary pb-4">
                    <DialogTitle className="text-2xl font-medium">{title}</DialogTitle>
                    <CloseDialog />
                </DialogHeader>
                {
                    description &&
                    <DialogDescription className="p-4">
                        {description}
                    </DialogDescription>
                }
                {children}
            </DialogContent>
        </Dialog>
    )
}
