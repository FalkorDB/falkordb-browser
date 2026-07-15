import { FormEvent, useContext, useEffect, useState } from "react";
import { getActiveConnectionIdGlobal, getConnectionEpoch, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import DialogComponent from "../DialogComponent";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { IndicatorContext } from "../provider";

export default function DuplicateGraph({ open, onOpenChange, selectedValue, onDuplicate, disabled }: {
    selectedValue: string,
    open: boolean,
    onOpenChange: (open: boolean) => void
    onDuplicate: (duplicateName: string) => void
    disabled: boolean
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
        const startEpoch = getConnectionEpoch();
        const cid = getActiveConnectionIdGlobal();

        if (duplicateName === "") {
            toast({
                title: "Error",
                description: "Graph name cannot be empty",
            });
            return;
        }

        try {
            setIsLoading(true);
            const result = await securedFetch(`api/graph/${prepareArg(duplicateName)}/duplicate`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sourceName: selectedValue })
            }, toast, setIndicator, cid);

            if (getConnectionEpoch() !== startEpoch) return;
            if (!result.ok) return;

            onDuplicate(duplicateName);
            onOpenChange(false);
            toast({
                title: "Graph duplicated successfully",
                description: "The graph has been duplicated successfully",
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
                className="p-1 text-xs"
                variant="Primary"
                label="Duplicate"
                title={"Create a copy of the selected graph (single graph only)"}
                disabled={disabled}
                data-testid="duplicateGraph"
            />}
            className="w-[25%]"
            title={"Duplicate this Graph"}
        >
            <form onSubmit={handleDuplicate} className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                    <Input
                        data-testid={"duplicateGraphInput"}
                        ref={ref => ref?.focus()}
                        placeholder={"Enter a name for the duplicated graph"}
                        onChange={(e) => setDuplicateName(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Button
                        data-testid={"duplicateGraphConfirm"}
                        indicator={indicator}
                        variant="Primary"
                        label="Duplicate"
                        title={"Confirm duplication of the graph"}
                        type="submit"
                        isLoading={isLoading}
                    />
                    <Button
                        data-testid={"duplicateGraphCancel"}
                        variant="Secondary"
                        label="Cancel"
                        title={"Cancel the duplication of the graph"}
                        onClick={() => onOpenChange(false)}
                    />
                </div>
            </form>
        </DialogComponent>
    );
}