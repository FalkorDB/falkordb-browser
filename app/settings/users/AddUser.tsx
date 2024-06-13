import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { securedFetch } from "@/lib/utils";
import { X } from "lucide-react";
import { User } from "@/app/api/user/model";
import Combobox from "../../components/combobox";


export default function AddUser({ setUsers }: {
    setUsers: Dispatch<SetStateAction<User[]>>
}) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("")
    const [open, setOpen] = useState<boolean>(false)

    const addUser = async (event: FormEvent) => {
        event.preventDefault();

        if (!username || !password) return

        const response = await securedFetch('/api/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        })

        if (response.ok) {
            toast({
                title: "Success",
                description: "User created",
            });
            setUsers(prev => [...prev, { username, role, selected: false }])
        }
        setOpen(false)
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="w-[10%] p-2 border-2 border-indigo-600 rounded-xl text-indigo-600"
                    title="Add User"
                    type="button"
                >
                    <p>ADD USER</p>
                </button>
            </DialogTrigger>
            <DialogContent className="h-[60%] w-[40%] p-0 flex flex-col gap-10">
                <DialogHeader className="h-[10%] p-4 text-white bg-indigo-600 flex flex-row justify-between items-center">
                    <DialogTitle>Add User</DialogTitle>
                    <DialogClose>
                        <button
                            title="Close"
                            type="button"
                            aria-label="Close"
                        >
                            <X />
                        </button>
                    </DialogClose>
                </DialogHeader>
                <form className="grow flex flex-col gap-4 p-4" onSubmit={addUser} >
                    <DialogDescription className="grow flex flex-row text-center items-center justify-center text-2xl">
                        Pick a new username to add a new user.
                    </DialogDescription>
                    <div className="flex flex-col gap-2">
                        <p>Username</p>
                        <input className="p-2 border border-gray-200" id="username" onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Password</p>
                        <input className="p-2 border border-gray-200" id="password" type="password" onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Role</p>
                        <Combobox inTable type="Role" options={["Admin", "Read-Write", "Read-Only"]} selectedValue={role} setSelectedValue={setRole} />
                    </div>
                    <div className="flex flex-row justify-end">
                        <button
                            className="w-[20%] p-2 bg-indigo-600 text-white"
                            title="Add User"
                            type="submit"
                        >
                            <p>ADD USER</p>
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}