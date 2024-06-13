import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";
import Dropzone from "./Dropzone";

export default function Upload({ isOpen, onOpen}: {
    isOpen: boolean,
    onOpen: (open: boolean) => void
}) {

    const [files, setFiles] = useState<File[]>([])

    const onUploadData = () => {
        console.log(files)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpen}>
            <DialogContent className="h-[80%] w-fit flex flex-col p-0">
                <DialogHeader className="h-[10%] bg-indigo-600 flex flex-row justify-between p-4 items-center">
                    <DialogTitle className="text-white">Upload Data</DialogTitle>
                    <DialogClose asChild>
                        <button
                            title="Close"
                            type="button"
                            aria-label="Close"
                        >
                            <X color="white" size={30} />
                        </button>
                    </DialogClose>
                </DialogHeader>
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
            </DialogContent>
        </Dialog>
    )
}