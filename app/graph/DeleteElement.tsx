/* eslint-disable react/require-default-props */

"use client"

import React, { useState, useContext } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CloseDialog from "../components/CloseDialog";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";

interface Props {
    onDeleteElement: () => Promise<void>
    open: boolean
    setOpen: (open: boolean) => void
    description: string
    backgroundColor?: string
    trigger?: React.ReactNode
}

export default function DeleteElement({
    onDeleteElement,
    open,
    setOpen,
    description,
    backgroundColor,
    trigger = <Button
        className={cn("pointer-events-auto", backgroundColor)}
        variant="Delete"
        title="Delete Element(s)"
    >
        <Trash2 size={20} />
    </Button>,
}: Props) {

    const { indicator } = useContext(IndicatorContext)
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        try {
            setIsLoading(true)
            await onDeleteElement()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DialogComponent
            onOpenChange={setOpen}
            open={open}
            title="Delete Elements"
            description={description}
            trigger={trigger}
        >
            <div className="flex justify-end gap-4">
                <Button
                    indicator={indicator}
                    className="text-nowrap"
                    variant="Delete"
                    label="Delete"
                    title="Remove the selected element(s)"
                    onClick={handleDelete}
                    isLoading={isLoading}
                />
                <CloseDialog
                    className="text-nowrap"
                    variant="Cancel"
                    label="Cancel"
                />
            </div>
        </DialogComponent>
    )
}