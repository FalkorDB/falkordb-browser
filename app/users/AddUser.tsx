import { Button } from "@/components/ui/button";
import { createRef, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { securedFetch } from "@/lib/utils";
import Combobox from "../components/combobox";


export default function AddUser() {
    const usernameInputRef = createRef<HTMLInputElement>()
    const passwordInputRef = createRef<HTMLInputElement>()
    const [selectedValue, setSelectedValue] = useState("Read-Only")

    const addUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const username = usernameInputRef.current?.value;
        const password = passwordInputRef.current?.value;
        if (!username || !password) {
            return;
        }
        const response = await securedFetch('/api/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role: selectedValue})
        })        

        if (response.ok) {
            toast({
                title: "Success",
                description: "User created",
            });
        }
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add new user</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={addUser} >
                    <DialogHeader>
                        <DialogTitle>Add User</DialogTitle>
                        <DialogDescription>
                            Pick a new username to add a new user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input id="username" ref={usernameInputRef} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input id="password" type="password" ref={passwordInputRef} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Role
                            </Label>
                            <Combobox type="Role" options={["Admin", "Read-Write", "Read-Only"]} selectedValue={selectedValue} setSelectedValue={setSelectedValue} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit" variant="secondary">Add</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}