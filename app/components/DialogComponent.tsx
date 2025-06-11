'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CloseDialog from "./CloseDialog";

interface Props {
    children: React.ReactNode
    title: string
    trigger: React.ReactNode
    onEscapeKeyDown?: (e: KeyboardEvent) => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
    description?: ReactNode
    className?: string
}

export default function DialogComponent({
    children,
    title,
    trigger,
    onEscapeKeyDown,
    open,
    onOpenChange,
    description,
    className,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent onEscapeKeyDown={onEscapeKeyDown} className={cn("bg-foreground p-8 flex flex-col gap-8 rounded-lg border-none", className)} disableClose>
                <DialogHeader className="flex-row justify-between items-center border-b border-secondary pb-4">
                    <DialogTitle className="text-2xl font-medium">{title}</DialogTitle>
                    <CloseDialog />
                </DialogHeader>
                {
                    description ?
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogDescription className="p-4 truncate">
                                {description}
                            </DialogDescription>
                        </TooltipTrigger>
                        <TooltipContent>
                            {description}
                        </TooltipContent>
                    </Tooltip>
                        : <VisuallyHidden>
                            <DialogDescription />
                        </VisuallyHidden>
                }
                {children}
            </DialogContent>
        </Dialog>
    )
}

DialogComponent.defaultProps = {
    onEscapeKeyDown: undefined,
    open: undefined,
    onOpenChange: undefined,
    description: undefined,
    className: undefined
}