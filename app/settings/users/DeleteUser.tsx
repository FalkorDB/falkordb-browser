import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/app/api/user/model";
import { Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface DeleteUserProps {
    // eslint-disable-next-line react/require-default-props
    isDeleteSelected?: boolean
    users: User[]
    setUsers: Dispatch<SetStateAction<User[]>>
}

export default function DeleteUser({ isDeleteSelected, users, setUsers }: DeleteUserProps) {

    const deleteSelected = async () => {
        if (!users) return

        const response = await fetch(`/api/user/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ users })
        })

        if (response.ok) {
            toast({
                title: "Success",
                description: "Users deleted",
            })
            setUsers(prev => prev.filter(user => !users.find(u => user.username === u.username)))
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger disabled={users.length === 0} asChild>
                {
                    isDeleteSelected ?
                        <button
                            className="w-[10%] p-2 border-2 border-indigo-600 rounded-xl text-indigo-600 disabled:text-gray-300 disabled:border-gray-300"
                            title="Delete User"
                            type="button"
                        >
                            <p>DELETE USER</p>
                        </button>
                        : <button
                            title="Delete"
                            type="button"
                            aria-label="Delete"
                        >
                            <Trash2 size={20} />
                        </button>
                }
            </AlertDialogTrigger>
            <AlertDialogContent  className="flex flex-col gap-10 p-4">
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