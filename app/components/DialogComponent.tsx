'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DialogContentProps } from "@radix-ui/react-dialog";
import CloseDialog from "./CloseDialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

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
    overlayClassName?: string
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
    overlayClassName,
    ...props
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay className={overlayClassName} />
                <DialogPrimitive.Content
                    {...props}
                    data-testid={`${label}Content`}
                    onEscapeKeyDown={(e) => e.stopPropagation()}
                    className={cn(
                        "fixed left-[50%] top-[50%] z-30 grid translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-8 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg border-none flex flex-col gap-8",
                        overlayClassName && "z-[41]", // If overlay has custom z-index, content should be +1
                        className
                    )}
                    onInteractOutside={preventOutsideClose ? (e) => e.preventDefault() : undefined}
                >
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
                </DialogPrimitive.Content>
            </DialogPortal>
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
    overlayClassName: undefined,
}