import { useState } from "react"
import { prepareArg, securedFetch } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import DialogComponent from "./DialogComponent"
import Button from "./ui/Button"
import CloseDialog from "./CloseDialog"

interface Props {
    selectedValue: string
    type: string
}

export default function ExportGraph({ selectedValue, type }: Props) {

    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const handleExport = async () => {
        const name = `${selectedValue}${!type ? "_schema" : ""}`
        const result = await securedFetch(`api/graph/${prepareArg(name)}/export`, {
            method: "GET"
        })

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
        } catch (e) {
            toast({
                title: "Error",
                description: "Error while exporting data",
                variant: "destructive"
            })
        }
    }


    return (
        <DialogComponent
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button
                    label="Export Data"
                    disabled={!selectedValue}
                />
            }
            title="Export your graph"
            description="Export a .dump file of your data"
        >
            <div className="flex gap-4 justify-end">
                <Button
                    className="flex-1"
                    variant="Primary"
                    label="Download"
                    onClick={handleExport}
                />
                <CloseDialog
                    className="flex-1"
                    variant="Cancel"
                    label="Cancel"
                />
            </div>
        </DialogComponent>
    )
}