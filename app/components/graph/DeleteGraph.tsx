import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Toast, securedFetch } from "@/lib/utils";

export default function DeleteGraph({ graphName, isOpen, onOpen, onDeleteGraph, isSchema }: {
    graphName: string
    isOpen: boolean
    onOpen: (open: boolean) => void
    onDeleteGraph: (option: string) => void
    isSchema: boolean
}) {

    const type = isSchema ? "Schema" : "Graph"

    const deleteGraph = async () => {
        const name = `${graphName}${isSchema ? "_schema" : ""}`
        const result = await securedFetch(`/api/graph/${name}`, {
            method: "DELETE",
        });

        if (result.ok) {
            Toast(`${type} ${graphName} deleted`, "Success")
            onDeleteGraph(graphName)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpen}>
            <AlertDialogContent className="flex flex-col gap-10 p-4">
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription className="text-xl">
                    This action cannot be undone !
                    <br />
                    This will permanently delete the {graphName} graph.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteGraph} >Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}