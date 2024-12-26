import { Dispatch, SetStateAction } from "react"
import { AlertCircle } from "lucide-react"
import DialogComponent from "./DialogComponent"
import Button from "./ui/Button"

interface Props {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    graphName: string
    setGraphName: Dispatch<SetStateAction<string>>
    handleCreateGraph: (e: React.FormEvent<HTMLFormElement>) => void
    trigger: React.ReactNode
}

export default function CreateGraph({ open, setOpen, graphName, setGraphName, handleCreateGraph, trigger }: Props) {
    return (
        <DialogComponent
            open={open}
            onOpenChange={setOpen}
            trigger={trigger}
            title="Create New Graph"
        >
            <form className="flex flex-col gap-4" onSubmit={(e) => {
                e.preventDefault()
                handleCreateGraph(e)
            }}>
                <div className="flex gap-2 items-center">
                    <Button
                        type="button"
                        title="Graph names can be edited later"
                        icon={<AlertCircle size={20} />}
                    />
                    <p className="font-normal text-2xl">Name your graph:</p>
                    <input
                        className="bg-background border text-white rounded-lg p-2"
                        value={graphName}
                        onChange={(e) => setGraphName(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="Primary"
                        label="Create your graph"
                        type="submit"
                    />
                    <Button
                        variant="Cancel"
                        label="Cancel"
                        type="button"
                        onClick={() => {
                            setOpen(false)
                        }}
                    />
                </div>
            </form>
        </DialogComponent>
    )
}