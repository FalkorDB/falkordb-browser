import { Plus } from "lucide-react";
import { useState, useContext } from "react";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import CloseDialog from "../components/CloseDialog";
import { IndicatorContext } from "../components/provider";

interface Props {
    trigger?: React.ReactNode
    onAddLabel: (label: string) => Promise<boolean>
}

export default function AddLabel({
    trigger = <Button
        variant="Primary"
        label="Add Label"
        title=""
    >
        <Plus size={15} />
    </Button>,
    onAddLabel
}: Props) {

    const { indicator } = useContext(IndicatorContext)

    const [open, setOpen] = useState(false)
    const [label, setLabel] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleAddLabel = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setIsLoading(true)
        try {
            const success = await onAddLabel(label)
            if (success) {
                setLabel("")
                setOpen(false)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DialogComponent
            title="Add Label"
            trigger={trigger}
            open={open}
            onOpenChange={setOpen}
        >
            <form
                className="flex flex-col gap-4"
                onSubmit={handleAddLabel}
            >
                <Input
                    data-testid="addLabelInput"
                    variant="primary"
                    ref={ref => ref?.focus()}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                />
                <div className="flex gap-4 justify-end">
                    <Button
                        indicator={indicator}
                        variant="Primary"
                        label="Add label"
                        title="Add a new label"
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

AddLabel.defaultProps = {
    trigger: undefined
}