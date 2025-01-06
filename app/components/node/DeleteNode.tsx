/* eslint-disable react/require-default-props */

'use client';

import { Trash2 } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Button from "../ui/Button";
import DialogComponent from "../DialogComponent";

interface Props {
    disabled?: boolean
    onDelete: () => void
}

export default function DeleteNode({ disabled, onDelete }: Props) {

    const { toast } = useToast()

    const onDeleteNode = async () => {
        onDelete()
        toast({
            title: "Success",
            description: "Node deleted",
        })
    }

    return (
        <DialogComponent
            trigger={
                <Button
                    variant="Secondary"
                    label="Delete"
                    disabled={disabled}
                >
                    <Trash2 />
                </Button>
            }
            title="Delete Node"
            description="Are you sure you want to delete nodes?"
        >
            <div className="flex flex-row-reverse gap-4">
                <DialogClose asChild>
                    <Button
                        variant="Primary"
                        label="Delete"
                        onClick={onDeleteNode}
                    />
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        variant="Secondary"
                        label="Cancel"
                    />
                </DialogClose>
            </div>
        </DialogComponent>
    )
}