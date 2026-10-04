'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
            <DialogContent {...props} preventOutsideClose={preventOutsideClose} data-testid={`${label}Content`} onEscapeKeyDown={(e) => e.stopPropagation()} className={cn("bg-background p-2 flex flex-col gap-4 rounded-lg border-none max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto", className)} hideClose>
                <DialogHeader className="flex-row justify-between items-center gap-2 border-b-2 border-border pb-2">
                    <DialogTitle className="text-2xl mobile:text-xl font-medium min-w-0">{title}</DialogTitle>
                    <CloseDialog data-testid={`close${label?.charAt(0).toUpperCase()}${label?.slice(1)}`} />
                </DialogHeader>
                {
                    description ?
                        /* Wraps rather than truncates: the tooltip that used to carry the
                           tail never opens on touch, so a trimmed description was simply lost. */
                        <DialogDescription className="p-4 mobile:p-2">
                            {description}
                        </DialogDescription>
                        : <VisuallyHidden>
                            <DialogDescription />
                        </VisuallyHidden>
                }
                {children}
            </DialogContent>
        </Dialog>
    );
}

DialogComponent.defaultProps = {
    open: undefined,
    onOpenChange: undefined,
    description: undefined,
    label: "",
    preventOutsideClose: undefined,
    className: undefined,
};