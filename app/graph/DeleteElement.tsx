/* eslint-disable react/require-default-props */

"use client"

import React, { useState, useContext } from "react";
import CloseDialog from "../components/CloseDialog";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";

interface Props {
    onDeleteElement: () => Promise<void>
    trigger: React.ReactNode
    open: boolean
    setOpen: (open: boolean) => void
    description: string
}

export default function DeleteElement({
    onDeleteElement,
    trigger,
    open,
    setOpen,
    description,
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
                    variant="Primary"
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