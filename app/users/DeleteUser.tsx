import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/app/api/user/model";
import { securedFetch } from "@/lib/utils";

interface DeleteUserProps {
    users: User[]
    selectedRows: boolean[]
}

export default function DeleteUser({ users, selectedRows} : DeleteUserProps) {

    const selected = users.filter((_: User, index: number) => selectedRows[index])
    
    const deleteSelected = async () => {
        if (selected.length === 0) return
        
        const response = await securedFetch(`/api/user/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ users: selected })
        })

        if (response.ok) {
            toast({
                title: "Success",
                description: "Users deleted",
            })
        } 
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger disabled={selected.length === 0} asChild>
                <Button variant="outline">Delete selected users</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected users.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteSelected} >Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}