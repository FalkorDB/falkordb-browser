import { FormEvent, useContext, useEffect, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import DialogComponent from "../DialogComponent";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { IndicatorContext } from "../provider";

export default function DuplicateGraph({ open, onOpenChange, selectedValue, onDuplicate, disabled, type }: {
    selectedValue: string,
    open: boolean,
    onOpenChange: (open: boolean) => void
    onDuplicate: (duplicateName: string) => void
    disabled: boolean
    type: "Graph" | "Schema"
}) {

    const [duplicateName, setDuplicateName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { indicator, setIndicator } = useContext(IndicatorContext);

    useEffect(() => {
        if (!open) {
            setDuplicateName("");
            setIsLoading(false);
        }
    }, [open]);

    const handleDuplicate = async (e: FormEvent) => {
        e.preventDefault();

        if (duplicateName === "") {
            toast({
                title: "Error",
                description: "Graph name cannot be empty",
            });
            return;
        }

        try {
            setIsLoading(true);
            const result = await securedFetch(`api/${type === "Graph" ? "graph" : "schema"}/${prepareArg(duplicateName)}/duplicate`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sourceName: selectedValue })
            }, toast, setIndicator);

            if (!result.ok) return;

            onDuplicate(duplicateName);
            onOpenChange(false);
            toast({
                title: `${type} duplicated successfully`,
                description: `The ${type} has been duplicated successfully`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogComponent
            open={open}
            onOpenChange={onOpenChange}
            trigger={<Button
                variant="Primary"
                label="Duplicate"
                title={`Create a copy of the selected ${type} (single graph only)`}
                disabled={disabled}
                data-testid="duplicateGraph"
            />}
            className="w-[25%]"
            title={`Duplicate this ${type}`}
        >
            <form onSubmit={handleDuplicate} className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                    <Input
                        data-testid={`duplicate${type}Input`}
                        ref={ref => ref?.focus()}
                        placeholder={`Enter a name for the duplicated ${type}`}
                        onChange={(e) => setDuplicateName(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Button
                        data-testid={`duplicate${type}Confirm`}
                        indicator={indicator}
                        variant="Primary"
                        label="Duplicate"
                        title={`Confirm duplication of the ${type}`}
                        type="submit"
                        isLoading={isLoading}
                    />
                    <Button
                        data-testid={`duplicate${type}Cancel`}
                        variant="Secondary"
                        label="Cancel"
                        title={`Cancel the duplication of the ${type}`}
                        onClick={() => onOpenChange(false)}
                    />
                </div>
            </form>
        </DialogComponent>
    );
}