/* eslint-disable react/require-default-props */

"use client"

import React, { useState, useContext, useEffect } from "react";
import { Trash2 } from "lucide-react";
import CloseDialog from "../components/CloseDialog";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";

interface Props {
    onDeleteElement: () => Promise<void>
    open: boolean
    setOpen: (open: boolean) => void
    description: string
    label?: "Graph" | "Schema"
}

export default function DeleteElement({
    onDeleteElement,
    open,
    setOpen,
    description,
    label = "Graph"
}: Props) {

    const { indicator } = useContext(IndicatorContext)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!open) {
            setIsLoading(false)
        }
    }, [open])

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
            trigger={(
                <Button
                    data-testid={`deleteElement${label}`}
                    className="pointer-events-auto bg-background"
                    variant="Delete"
                    title="Delete Element(s)"
                >
                    <Trash2 size={20} />
                </Button>
            )}
        >
            <div className="flex justify-end gap-4">
                <Button
                    data-testid={`deleteElementConfirm${label}`}
                    indicator={indicator}
                    className="text-nowrap"
                    variant="Delete"
                    label="Delete"
                    title="Remove the selected element(s)"
                    onClick={handleDelete}
                    isLoading={isLoading}
                />
                <CloseDialog
                    data-testid={`deleteElementCancel${label}`}
                    className="text-nowrap"
                    variant="Cancel"
                    label="Cancel"
                />
            </div>
        </DialogComponent>
    )
}