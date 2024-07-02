import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Toast, securedFetch } from "@/lib/utils";

export default function DeleteGraph({ graphName, isOpen, onOpen }: {
    graphName: string
    isOpen: boolean
    onOpen: (open: boolean) => void
}) {

    const deleteGraph = async () => {
        const result = await securedFetch(`/api/graph/${graphName}`, {
            method: "DELETE",
        });

        if (result.ok) {
            Toast("Success", "Graph deleted")
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpen}>
            <AlertDialogContent className="flex flex-col gap-10 p-4">
                <AlertDialogHeader className="">
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected graph.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteGraph} >Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}