import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface DeleteUserProps {
    users: string[]
    selectedRows: boolean[]
}

export default function DeleteUser({ users, selectedRows} : DeleteUserProps) {

    const deleteSelected = () => {
        const selected = users.filter((_: string, index: number) => selectedRows[index])
        if (selected.length === 0) {
            return
        }
        fetch(`/api/user/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ users: selected })
        }).then((response) => {
            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "Users deleted",
                })
            } else {
                response.text().then((message) => {
                    toast({
                        title: "Error",
                        description: message,
                    })
                })
            }
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Delete selected users</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteSelected}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}