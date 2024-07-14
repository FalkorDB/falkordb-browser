import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User } from "@/app/api/user/model";
import { Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import Button from "@/app/components/ui/Button";
import { Toast, securedFetch } from "@/lib/utils";

interface DeleteUserProps {
    // eslint-disable-next-line react/require-default-props
    isDeleteSelected?: boolean
    users: User[]
    setUsers: Dispatch<SetStateAction<User[]>>
}

export default function DeleteUser({ isDeleteSelected, users, setUsers }: DeleteUserProps) {

    const deleteSelected = async () => {
        if (!users) return

        const response = await securedFetch(`/api/user/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ users })
        })

        if (response.ok) {
            Toast("Success", "User deleted successfully")
            setUsers(prev => prev.filter(user => !users.find(u => user.username === u.username)))
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger disabled={users.length === 0} asChild>
                {
                    isDeleteSelected ?
                        <Button
                            disabled={users.length === 0}
                            variant="Primary"
                            icon={<Trash2 />}
                            label="Delete Users"
                        />
                        : <button
                            title="Delete"
                            type="button"
                            aria-label="Delete"
                        >
                            <Trash2 size={15} />
                        </button>
                }
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