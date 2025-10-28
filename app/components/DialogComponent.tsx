'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DialogContentProps } from "@radix-ui/react-dialog";
import CloseDialog from "./CloseDialog";

interface Props extends DialogContentProps {
    children: React.ReactNode
    title: string
    trigger: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    description?: ReactNode
    label?: string
    preventOutsideClose?: boolean
    className?: string
}

export default function DialogComponent({
    children,
    title,
    trigger,
    open,
    onOpenChange,
    description,
    label = "",
    preventOutsideClose,
    className,
    ...props
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <DialogContent {...props} preventOutsideClose={preventOutsideClose} data-testid={`${label}Content`} onEscapeKeyDown={(e) => e.stopPropagation()} className={cn("bg-background p-8 flex flex-col gap-8 rounded-lg border-none", className)} hideClose>
                <DialogHeader className="flex-row justify-between items-center border-b-2 border-border pb-4">
                    <DialogTitle className="text-2xl font-medium">{title}</DialogTitle>
                    <CloseDialog data-testid={`close${label?.charAt(0).toUpperCase()}${label?.slice(1)}`} />
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
    open: undefined,
    onOpenChange: undefined,
    description: undefined,
    label: "",
    preventOutsideClose: undefined,
    className: undefined,
}