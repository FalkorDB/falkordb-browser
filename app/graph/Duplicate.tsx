import { FormEvent, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import DialogComponent from "../components/DialogComponent";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Duplicate({ open, onOpenChange, selectedValue, onDuplicate, disabled }: {
    selectedValue: string,
    open: boolean,
    onOpenChange: (open: boolean) => void
    onDuplicate: (duplicateName: string) => void
    disabled: boolean
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
            title: "Graph duplicated successfully",
            description: "The graph has been duplicated successfully",
        })
    }

    return (
        <DialogComponent
            open={open}
            onOpenChange={onOpenChange}
            trigger={<Button label="Duplicate" disabled={disabled} />}
            className="w-[25%]"
            description="Enter a new graph name"
            title="Duplicate Graph"
        >
            <form onSubmit={handleDuplicate} className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                    <p className="font-medium text-xl">Graph Name</p>
                    <Input
                        onChange={(e) => setDuplicateName(e.target.value)}
                        required
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        variant="Primary"
                        label="Duplicate"
                        type="submit"
                    />
                </div>
            </form>
        </DialogComponent>
    )
}