import { Dialog, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import Dropzone from "./Dropzone";
import DialogComponent from "./DialogComponent";

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
                <form onSubmit={onUploadData} className="grow p-8 flex flex-col gap-6 overflow-auto">
                    <Dropzone filesCount className="grow overflow-auto flex-col gap-10" withTable onFileDrop={setFiles} />
                    <div className="flex flex-row-reverse gap-6 justify-start">
                        <DialogClose asChild>
                            <button
                                className="bg-indigo-600 text-white p-4 w-[20%]"
                                type="submit"
                            >
                                <p>Upload</p>
                            </button>
                        </DialogClose>
                        <DialogClose asChild>
                            <button
                                className="text-indigo-600"
                                type="button"
                            >
                                <p>Cancel</p>
                            </button>
                        </DialogClose>
                    </div>
                </form>
            </DialogComponent>
        </Dialog>
    )
}