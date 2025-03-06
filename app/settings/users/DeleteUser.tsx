import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User } from "@/app/api/user/model";
import { Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import Button from "@/app/components/ui/Button";
import { Row, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

interface DeleteUserProps {
    users: User[]
    setUsers: Dispatch<SetStateAction<User[]>>
    setRows: Dispatch<SetStateAction<Row[]>>
}

export default function DeleteUser({ users, setUsers, setRows }: DeleteUserProps) {
    const { data: session } = useSession()
    const { toast } = useToast()
    
    const deleteSelected = async () => {
        if (!users) return

        const response = await securedFetch('/api/user/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ users })
        }, session?.user?.role, toast)

        if (response.ok) {
            toast({
                title: "Success",
                description: "User deleted successfully",
            })
            setUsers(prev => prev.filter(user => !users.find(u => user.username === u.username)))
            setRows(prev => prev.filter(row => !users.find(u => row.cells[0].value === u.username)))
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger disabled={users.length === 0} asChild>
                <Button
                    disabled={users.length === 0}
                    variant="Primary"
                    label="Delete Users"
                >
                    <Trash2 />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="flex flex-col gap-10 p-4">
                <AlertDialogHeader className="">
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected users.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteSelected} >Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}