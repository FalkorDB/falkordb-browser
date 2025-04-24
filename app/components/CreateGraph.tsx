/* eslint-disable react/require-default-props */

"use client"

import React, { useState, useContext } from "react"
import { InfoIcon, PlusCircle } from "lucide-react"
import { prepareArg, securedFetch } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import DialogComponent from "./DialogComponent"
import Button from "./ui/Button"
import CloseDialog from "./CloseDialog"
import Input from "./ui/Input"
import { IndicatorContext } from "./provider"

interface Props {
    onSetGraphName: (name: string) => void
    type: "Graph" | "Schema"
    graphNames: string[]
    trigger?: React.ReactNode
}

export default function CreateGraph({
    onSetGraphName,
    type,
    graphNames,
    trigger = (
        <Button
            variant="Primary"
            title={`Create New ${type}`}
        >
            <PlusCircle size={20} />
        </Button>
    ),
}: Props) {

    const { indicator, setIndicator } = useContext(IndicatorContext)
    const [graphName, setGraphName] = useState("")
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleCreateGraph = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            const name = graphName.trim()
            if (!name) {
                toast({
                    title: "Error",
                    description: `${type} name cannot be empty`,
                    variant: "destructive"
                })
                return
            }
            if (graphNames.includes(name)) {
                toast({
                    title: "Error",
                    description: `${type} name already exists`,
                    variant: "destructive"
                })
                return
            }
            const result = await securedFetch(`api/${type === "Schema" ? "schema" : "graph"}/${prepareArg(name)}`, {
                method: "POST",
            }, toast, setIndicator)

            if (!result.ok) return

            onSetGraphName(name)
            setGraphName("")
            setOpen(false)
            toast({
                title: `${type} created successfully`,
                description: `The ${type.toLowerCase()} has been created successfully`,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DialogComponent
            open={open}
            onOpenChange={setOpen}
            trigger={trigger}
            title={`Create New ${type}`}
        >
            <form className="flex flex-col gap-4" onSubmit={isLoading ? undefined : handleCreateGraph}>
                <div className="flex gap-2 items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <InfoIcon size={20} />
                        </TooltipTrigger>
                        <TooltipContent>
                            {`${type} names can be edited later`}
                        </TooltipContent>
                    </Tooltip>
                    <p className="font-normal text-2xl">Name your {type}:</p>
                    <Input
                        variant="primary"
                        ref={ref => ref?.focus()}
                        value={graphName}
                        onChange={(e) => setGraphName(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 justify-end">
                    <Button
                        indicator={indicator}
                        variant="Primary"
                        label={`Create your ${type}`}
                        title={`Build and customize your ${type}`}
                        type="submit"
                        isLoading={isLoading}
                    />
                    <CloseDialog
                        variant="Cancel"
                        label="Cancel"
                        type="button"
                    />
                </div>
            </form>
        </DialogComponent>
    )
}