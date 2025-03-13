import { FormEvent, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Duplicate({ open, onOpenChange, selectedValue, onDuplicate, disabled, type }: {
    selectedValue: string,
    open: boolean,
    onOpenChange: (open: boolean) => void
    onDuplicate: (duplicateName: string) => void
    disabled: boolean
    type: "Graph" | "Schema"
}) {

    const [duplicateName, setDuplicateName] = useState("");
    const { toast } = useToast()
    const { data: session } = useSession()

    const handleDuplicate = async (e: FormEvent) => {

        e.preventDefault()

        const result = await securedFetch(`api/graph/${prepareArg(duplicateName)}/?sourceName=${prepareArg(selectedValue)}`, {
            method: "POST"
        }, session?.user?.role, toast)

        if (!result.ok) return

        onDuplicate(duplicateName)
        onOpenChange(false)
        toast({
            title: `${type} duplicated successfully`,
            description: `The ${type} has been duplicated successfully`,
        })
    }

    return (
        <DialogComponent
            open={open}
            onOpenChange={onOpenChange}
            trigger={<Button
                    label="Duplicate"
                    disabled={disabled}
                    title={`Create a copy of the selected ${type}`}
                />}
            className="w-[25%]"
            title={`Duplicate this ${type}`}
        >
            <form onSubmit={handleDuplicate} className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder={`Enter a name for the duplicated ${type}`}
                        onChange={(e) => setDuplicateName(e.target.value)}
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="Primary"
                        label="Duplicate"
                        title={`Confirm duplication of the ${type}`}
                        type="submit"
                    />
                    <Button
                        variant="Secondary"
                        label="Cancel"
                        title={`Cancel the duplication of the ${type}`}
                        onClick={() => onOpenChange(false)}
                    />
                </div>
            </form>
        </DialogComponent>
    )
}