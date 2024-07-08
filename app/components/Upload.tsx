import { Dialog } from "@/components/ui/dialog";
import { useState } from "react";
import Dropzone from "./Dropzone";
import DialogComponent from "./DialogComponent";
import CloseDialog from "./CloseDialog";

export default function Upload({ isOpen, onOpen }: {
    isOpen: boolean,
    onOpen: (open: boolean) => void
}) {

    const [files, setFiles] = useState<File[]>([])

    const onUploadData = () => {
        console.log(files)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpen}>
            <DialogComponent className="h-[90%]" title="Upload Data">
                <form onSubmit={onUploadData} className="grow p-8 flex flex-col gap-6">
                    <Dropzone filesCount className="flex-col gap-10" withTable onFileDrop={setFiles} />
                    <CloseDialog className="w-full" label="Upload" variant="Primary"/>
                </form>
            </DialogComponent>
        </Dialog>
    )
}