import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { securedFetch } from "@/lib/utils";
import { PlusCircle, X } from "lucide-react";
import { User } from "@/app/api/user/model";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
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
                <Button
                    variant="Primary"
                    icon={<PlusCircle />}
                    label="ADD USER"
                />
            </DialogTrigger>
            <DialogContent displayClose className="h-[60%] w-[40%] p-0 flex flex-col gap-10">
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
                <form className="grow flex flex-col gap-24 p-8" onSubmit={addUser} >
                    <DialogDescription className="flex flex-row text-center items-center justify-center text-2xl">
                        Enter user name and password and select a role.
                    </DialogDescription>
                    <div className="flex flex-col gap-16">
                        <Combobox type="Role" options={["Admin", "Read-Write", "Read-Only"]} selectedValue={role} setSelectedValue={setRole} />
                        <div className="flex flex-col gap-2">
                            <p>Username</p>
                            <Input variant="Small" onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p>Password</p>
                            <Input variant="Small" type="password" onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>
                    <div className="flex flex-row justify-end">
                        <Button
                            variant="Primary"
                            label="ADD USER"
                            icon={<PlusCircle/>}
                            type="submit"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}