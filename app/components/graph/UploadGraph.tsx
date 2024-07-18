import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import Dropzone from "../ui/Dropzone";
import DialogComponent from "../DialogComponent";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";

export default function UploadGraph({ disabled, open, onOpenChange }: {
    /* eslint-disable react/require-default-props */
    disabled?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {

    const [files, setFiles] = useState<File[]>([])

    const onUploadData = () => {
        console.log(files)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {
                    !onOpenChange &&
                    <Button
                        label="Upload Data"
                        disabled={disabled}
                    />
                }
            </DialogTrigger>
            <DialogComponent className="h-[90%]" title="Upload Data">
                <form onSubmit={onUploadData} className="grow p-4 flex flex-col gap-6">
                    <Dropzone filesCount className="flex-col" withTable onFileDrop={setFiles} />
                    <CloseDialog
                        label="Upload"
                        variant="Large"
                    />
                </form>
            </DialogComponent>
        </Dialog>
    )
}