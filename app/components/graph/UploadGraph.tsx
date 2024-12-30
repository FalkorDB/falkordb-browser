import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import Dropzone from "../ui/Dropzone";
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
            {
                !onOpenChange &&
                <DialogTrigger asChild>
                    <Button
                        label="Upload Data"
                        disabled={disabled}
                    />
                </DialogTrigger>
            }
            <DialogContent disableClose className="bg-foreground max-h-[90dvh] max-w-[60dvw]">
                <DialogHeader className="flex-row justify-between items-center border-b border-secondary pb-4">
                    <DialogTitle className="text-2xl font-medium">Upload Data</DialogTitle>
                    <CloseDialog />
                </DialogHeader>
                <form onSubmit={onUploadData} className="grow p-4 flex flex-col gap-6">
                    <Dropzone filesCount className="flex-col" withTable onFileDrop={setFiles} />
                    <Button
                        type="submit"
                        label="Upload"
                        variant="Primary"
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}