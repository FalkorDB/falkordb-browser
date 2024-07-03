import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { Toast, securedFetch } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { User } from "@/app/api/user/model";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import DialogComponent from "@/app/components/DialogComponent";
import { Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import Combobox from "../../components/combobox";


export default function AddUser({ setUsers }: {
    setUsers: Dispatch<SetStateAction<User[]>>
}) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("")

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
            Toast("Success", "User added successfully")
            setUsers(prev => [...prev, { username, role, selected: false }])
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="Primary"
                    icon={<PlusCircle />}
                    label="ADD USER"
                />
            </DialogTrigger>
            <DialogComponent
                title="Add User"
                description="Select a roll for the user and Enter username and password"
            >
                <form className="flex flex-col gap-16" onSubmit={addUser} >
                    <Combobox type="Role" options={["Admin", "Read-Write", "Read-Only"]} selectedValue={role} setSelectedValue={setRole} />
                    <div className="flex flex-col gap-2">
                        <p>Username</p>
                        <Input variant="Small" onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Password</p>
                        <Input variant="Small" type="password" onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="flex flex-row justify-end">
                        <DialogClose asChild>
                            <Button
                                variant="Primary"
                                label="ADD USER"
                                icon={<PlusCircle />}
                                type="submit"
                            />
                        </DialogClose>
                    </div>
                </form>
            </DialogComponent>
        </Dialog>
    )
}