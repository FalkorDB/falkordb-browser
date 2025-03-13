import { FormEvent, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Duplicate({ open, onOpenChange, selectedValue, onDuplicate, type, disabled }: {
    selectedValue: string,
    open: boolean,
    onOpenChange: (open: boolean) => void
    onDuplicate: (duplicateName: string) => void
    type: "Graph" | "Schema",
    disabled: boolean
}) {

    const [duplicateName, setDuplicateName] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    
    const handleDuplicate = async (e: FormEvent) => {
        e.preventDefault()
        try {

            setIsLoading(true)
            const graphName = type === "Schema" ? `${duplicateName}_schema` : duplicateName
            const sourceName = type === "Schema" ? `${selectedValue}_schema` : selectedValue

        const result = await securedFetch(`api/graph/${prepareArg(graphName)}/?sourceName=${prepareArg(sourceName)}`, {
            method: "POST"
        }, toast)

            if (!result.ok) return

            onDuplicate(duplicateName)
            onOpenChange(false)
            toast({
                title: "Graph duplicated successfully",
                description: "The graph has been duplicated successfully",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DialogComponent
            open={open}
            onOpenChange={onOpenChange}
            trigger={<Button label="Duplicate" disabled={disabled} />}
            className="w-[25%]"
            title="Duplicate this Graph"
        >
            <form onSubmit={handleDuplicate} className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Enter a name for the duplicated graph"
                        onChange={(e) => setDuplicateName(e.target.value)}
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="Primary"
                        label="Duplicate"
                        type="submit"
                        isLoading={isLoading}
                    />
                    <Button
                        variant="Secondary"
                        label="Cancel"
                        onClick={() => onOpenChange(false)}
                    />
                </div>
            </form>
        </DialogComponent>
    )
}