import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { EditIcon } from "lucide-react";
import { useState } from "react";
import { Toast, prepareArg, securedFetch } from "@/lib/utils";
import DialogComponent from "./DialogComponent";
import CloseDialog from "./CloseDialog";


export default function EditGraph({ graphName }: {
    graphName: string
}) {

    const [name, setName] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const handleSubmit = async () => {
        const result = await securedFetch(`/api/graph/${prepareArg(name)}/?${prepareArg(graphName)}`, {
            method: "PATCH",
        })

        if (!result.ok) {
            Toast("Failed to edit graph")
        }
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    title="Edit Graph"
                    type="button"
                    aria-label="Edit Graph"
                >
                    <p><EditIcon /></p>
                </button>
            </DialogTrigger>
            <DialogComponent
                title="Edit Graph"
                description="Enter new graph name"
            >
                <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">
                        <p>Graph Name</p>
                        <input className="border border-gray-200 rounded-md p-2" type="text" required onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="flex flex-row-reverse">
                        <button
                            className="bg-indigo-600 text-white p-4"
                            title="OK"
                            type="submit"
                        >
                            <p>OK</p>
                        </button>
                    </div>
                </form>
            </DialogComponent>
            <DialogContent className="flex flex-col gap-4 p-0">
                <DialogHeader className="h-[10%] bg-indigo-600 text-white p-4 flex flex-row justify-between items-center">
                    <p className="text-xl font-medium">Edit Graph</p>
                    <CloseDialog/>
                </DialogHeader>

            </DialogContent>
        </Dialog>
    )
}