/* eslint-disable react/require-default-props */

"use client"

import { useState } from "react"
import { AlertCircle, PlusCircle } from "lucide-react"
import { getSchemaName, prepareArg, securedFetch } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import DialogComponent from "./DialogComponent"
import Button from "./ui/Button"
import CloseDialog from "./CloseDialog"
import Input from "./ui/Input"

interface Props {
    onSetGraphName: (name: string) => void
    type: "Graph" | "Schema"
    trigger?: React.ReactNode
}

export default function CreateGraph({
    onSetGraphName,
    type,
    trigger = (
        <Button
            variant="Primary"
            label="Create New Graph"
        >
            <PlusCircle />
        </Button>
    ),
}: Props) {

    const [graphName, setGraphName] = useState("")
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const handleCreateGraph = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (!graphName) {
            toast({
                title: "Error",
                description: `${type} name cannot be empty`,
                variant: "destructive"
            })
            return
        }

        const q = 'RETURN 1'
        const name = type === "Schema" ? getSchemaName(prepareArg(graphName)) : prepareArg(graphName)
        const result = await securedFetch(`api/graph/${name}/?query=${prepareArg(q)}`, {
            method: "GET",
        }, toast)

        if (!result.ok) return

        onSetGraphName(graphName)
        setGraphName("")
        setOpen(false)

        toast({
            title: "Success",
            description: `${type} ${graphName} created successfully`,
        })
    }

    return (
        <DialogComponent
            open={open}
            onOpenChange={setOpen}
            trigger={trigger}
            title={`Create New ${type}`}
        >
            <form className="flex flex-col gap-4" onSubmit={(e) => {
                e.preventDefault()
                handleCreateGraph(e)
            }}>
                <div className="flex gap-2 items-center">
                    <Button
                        className="text-nowrap"
                        type="button"
                        title={`${type} names can be edited later`}
                    >
                        <AlertCircle size={20} />
                    </Button>
                    <p className="font-normal text-2xl">Name your graph:</p>
                    <Input
                        variant="primary"
                        ref={ref => ref?.focus()}
                        value={graphName}
                        onChange={(e) => setGraphName(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 justify-end">
                    <Button
                        variant="Primary"
                        label={`Create your ${type}`}
                        type="submit"
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