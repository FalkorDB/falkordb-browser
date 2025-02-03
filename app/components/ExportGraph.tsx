import { ReactNode, useState } from "react"
import { prepareArg, securedFetch } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import DialogComponent from "./DialogComponent"
import Button from "./ui/Button"
import CloseDialog from "./CloseDialog"

interface Props {
    selectedValues: string[]
    type: string
    trigger: ReactNode
}

export default function ExportGraph({ selectedValues, type, trigger }: Props) {

    const [open, setOpen] = useState(false)
    const { toast } = useToast()
    const { data: session } = useSession()
    
    const handleExport = () => {
        selectedValues.map(async value => {
            const name = `${value}${!type ? "_schema" : ""}`
            const result = await securedFetch(`api/graph/${prepareArg(name)}/export`, {
                method: "GET"
            }, session?.user?.role, toast)

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
        })
    }


    return (
        <DialogComponent
            open={open}
            onOpenChange={setOpen}
            trigger={trigger}
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