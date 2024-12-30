import { FormEvent, useState } from "react";
import { Toast, prepareArg, securedFetch } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import DialogComponent from "../components/DialogComponent";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Duplicate({ open, onOpenChange, selectedValue, onDuplicate }: {
    selectedValue: string,
    open: boolean,
    onOpenChange: (open: boolean) => void
    onDuplicate: (duplicateName: string) => void
}) {

    const [duplicateName, setDuplicateName] = useState("");

    const handelDuplicate = async (e: FormEvent) => {

        e.preventDefault()

        const result = await securedFetch(`api/graph/${prepareArg(duplicateName)}/?sourceName=${prepareArg(selectedValue)}`, {
            method: "POST"
        })

        if (!result.ok) {
            Toast()
            return
        }

        onOpenChange(false)
        onDuplicate(duplicateName)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogComponent className="w-[25%]" description="Enter a new graph name" title="Duplicate Graph">
                <form onSubmit={handelDuplicate} className="flex flex-col gap-12">
                    <div className="flex flex-col gap-4">
                        <p className="font-medium text-xl">Graph Name</p>
                        <Input variant="Small" onChange={(e) => setDuplicateName(e.target.value)} required />
                    </div>
                    <Button
                        variant="Primary"
                        label="Duplicate"
                        type="submit"
                    />
                </form>
            </DialogComponent>
        </Dialog>
    )
}