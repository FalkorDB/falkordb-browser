import { Trash2 } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import CloseDialog from "../components/CloseDialog";
import { IndicatorContext } from "../components/provider";

interface Props {
    trigger?: React.ReactNode
    onRemoveLabel: (label: string) => Promise<boolean>
    selectedLabel: string
}

export default function RemoveLabel({
    selectedLabel,
    trigger = <Button
        variant="Delete"
        label="Delete Label"
        title=""
        disabled={!selectedLabel}
    >
        <Trash2 />
    </Button>,
    onRemoveLabel,
}: Props) {
    const { indicator } = useContext(IndicatorContext);
    
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setIsLoading(false);
        }
    }, [open]);

    const handleRemoveLabel = async () => {
        setIsLoading(true);
        try {
            const success = await onRemoveLabel(selectedLabel);
            if (success) {
                setOpen(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogComponent
            title="Remove Label"
            trigger={trigger}
            open={open}
            onOpenChange={setOpen}
            description="Are you sure you want to remove this label?"
        >
            <div className="flex gap-4 justify-end">
                <Button
                    variant="Delete"
                    label="Remove Label"
                    title=""
                    onClick={handleRemoveLabel}
                    isLoading={isLoading}
                    indicator={indicator}
                    data-testid="removeLabelButton"
                />
                <CloseDialog
                    variant="Cancel"
                    label="Cancel"
                    type="button"
                    data-testid="cancelLabelButton"
                />
            </div>
        </DialogComponent>
    );
}

RemoveLabel.defaultProps = {
    trigger: undefined
};