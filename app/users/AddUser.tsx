import { Button } from "@/components/ui/button";
import { createRef } from "react"
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";


export default function AddUser() {
    const usernameInputRef = createRef<HTMLInputElement>()
    const passwordInputRef = createRef<HTMLInputElement>()

    const addUser = () => {
        const username = usernameInputRef.current?.value
        const password = passwordInputRef.current?.value
        if (!username || !password) {
            return
        }
        fetch(`/api/user/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        }).then((response) => {
            if (response.status === 201) {
                toast({
                    title: "Success",
                    description: "User created",
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
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={addUser}>Add new user</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
                        <Input id="username" ref={usernameInputRef} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                            Password
                        </Label>
                        <Input id="password" type="password" ref={passwordInputRef} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={addUser}>Add</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}