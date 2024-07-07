import { Dialog, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import Dropzone from "./Dropzone";
import DialogComponent from "./DialogComponent";
import Button from "./Button";

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
                    <div className="flex flex-row-reverse gap-6 justify-start">
                        <DialogClose asChild>
                            <Button
                                className="w-full"
                                label="Upload"
                                variant="Large"
                                type="submit"
                            />
                        </DialogClose>
                    </div>
                </form>
            </DialogComponent>
        </Dialog>
    )
}