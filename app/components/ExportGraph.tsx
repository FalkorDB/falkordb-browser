import React, { useContext, useState } from "react"
import { prepareArg, securedFetch } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import DialogComponent from "./DialogComponent"
import Button from "./ui/Button"
import CloseDialog from "./CloseDialog"
import { IndicatorContext } from "./provider"

interface Props {
    selectedValues: string[]
    type: "Graph" | "Schema"
}

export default function ExportGraph({ selectedValues, type }: Props) {

    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const { indicator, setIndicator } = useContext(IndicatorContext)

    const handleExport = async () => {
        try {
            setIsLoading(true)
            await Promise.all(selectedValues.map(async value => {
                const name = `${value}${type === "Schema" ? "_schema" : ""}`
                const result = await securedFetch(`api/graph/${prepareArg(name)}/export`, {
                    method: "GET"
                }, toast, setIndicator)

                if (!result.ok) return

                const blob = await result.blob()
                const url = window.URL.createObjectURL(blob)
                try {
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `${name}.dump`)
                    document.body.appendChild(link)
                    link.click()
                    link.parentNode?.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    setOpen(false)
                } catch (e) {
                    toast({
                        title: "Error",
                        description: "Error while exporting data",
                        variant: "destructive"
                    })
                }
            }))
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <DialogComponent
            overlayClassName="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button
                    data-testid="exportGraph"
                    variant="Primary"
                    label="Export Data"
                    title="Export graph data to a .dump file"
                    disabled={selectedValues.length === 0}
                />
            }
            title="Export your graph"
            description="Export a .dump file of your data"
        >
            <div className="flex gap-4 justify-end">
                <Button
                    data-testid="exportGraphConfirm"
                    className="flex-1"
                    indicator={indicator}
                    variant="Primary"
                    label="Download"
                    onClick={handleExport}
                    isLoading={isLoading}
                />
                <CloseDialog
                    data-testid="exportGraphCancel"
                    className="flex-1"
                    variant="Cancel"
                    label="Cancel"
                />
            </div>
        </DialogComponent>
    )
}