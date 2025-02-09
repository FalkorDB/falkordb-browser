/* eslint-disable react/require-default-props */

"use client"

import { useState } from "react"
import { InfoIcon, PlusCircle } from "lucide-react"
import { prepareArg, securedFetch } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSession } from "next-auth/react"
import DialogComponent from "./DialogComponent"
import Button from "./ui/Button"
import CloseDialog from "./CloseDialog"
import Input from "./ui/Input"

interface Props {
    onSetGraphName: (name: string) => void
    type: string
    trigger?: React.ReactNode
}

export default function CreateGraph({
    onSetGraphName,
    type,
    trigger = (
        <Button
            variant="Primary"
            label={`Create New ${type}`}
        >
            <PlusCircle />
        </Button>
    ),
}: Props) {

    const [graphName, setGraphName] = useState("")
    const [open, setOpen] = useState(false)
    const { toast } = useToast()
    const { data: session } = useSession()
    
    const handleCreateGraph = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const name = graphName.trim()
        if (!name) {
            toast({
                title: "Error",
                description: "Graph name cannot be empty",
                variant: "destructive"
            })
            return
        }
        const q = 'RETURN 1'
        const result = await securedFetch(`api/graph/${prepareArg(name)}/?query=${prepareArg(q)}`, {
            method: "GET",
        }, session?.user?.role, toast)

        if (!result.ok) return

        onSetGraphName(name)
        setGraphName("")
        setOpen(false)
        toast({
            title: "Graph created successfully",
            description: "The graph has been created successfully",
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