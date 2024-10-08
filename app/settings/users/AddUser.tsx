import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { Toast, securedFetch } from "@/lib/utils";
import { Eye, PlusCircle } from "lucide-react";
import { User } from "@/app/api/user/model";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import DialogComponent from "@/app/components/DialogComponent";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Combobox from "../../components/ui/combobox";

// eslint-disable-next-line no-useless-escape
const PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&#+]{8,}$"

export default function AddUser({ setUsers }: {
    setUsers: Dispatch<SetStateAction<User[]>>
}) {
    const [open, setOpen] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setConfirmShowPassword] = useState(false)
    const [role, setRole] = useState("")

    const handelClose = () => {
        setPassword("")
        setConfirmPassword("")
        setUsername("")
        setRole("")
        setConfirmShowPassword(false)
        setShowPassword(false)
    }

    const addUser = async (e: FormEvent) => {
        e.preventDefault();

        if (!role) {
            Toast("select role is required")
            return
        }

        const response = await securedFetch('/api/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        })

        if (response.ok) {
            Toast("User added successfully", "Success")
            setUsers(prev => [...prev, { username, role, selected: false }])
        }
        setOpen(false)

        handelClose()
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                setOpen(o)
                handelClose()
            }}
        >
            <DialogTrigger asChild>
                <Button
                    variant="Primary"
                    icon={<PlusCircle />}
                    label="Add User"
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
                        <Input
                            type="text"
                            variant="Small"
                            onChange={(e) => {
                                setUsername(e.target.value)
                                e.currentTarget.setCustomValidity("")
                                e.currentTarget.reportValidity()
                            }}
                            onInvalid={(e) => e.currentTarget.setCustomValidity("Username is required")}
                            required
                        />
                    </div>
                    <div className="relative flex flex-col gap-2">
                        <p title="Password">Password</p>
                        <Button
                            className="absolute top-10 right-2 p-0"
                            icon={<Eye strokeWidth={0.5} />}
                            onClick={() => setShowPassword(prev => !prev)}
                        />
                        <Input
                            pattern={PATTERN}
                            variant="Small"
                            type={showPassword ? "text" : "password"}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                e.currentTarget.setCustomValidity("")
                                e.currentTarget.reportValidity()
                            }}
                            value={password}
                            onInvalid={(e) => {
                                if (!e.currentTarget.value) {
                                    e.currentTarget.setCustomValidity("Password is required");
                                } else if (e.currentTarget.validity.patternMismatch) {
                                    e.currentTarget.setCustomValidity(`
                                            password must contain:
                                            - At least one lowercase letter
                                            - At least one uppercase letter
                                            - At least one digit
                                            - At least one special (@$!%*?&)
                                            - At least 8 characters
                                            `);
                                }
                            }}
                            required
                        />
                    </div>
                    <div className="relative flex flex-col gap-2">
                        <p title="Confirm Password">Confirm Password</p>
                        <Button
                            className="absolute top-10 right-2 p-0"
                            icon={<Eye strokeWidth={0.5} />}
                            onClick={() => setConfirmShowPassword(prev => !prev)}
                        />
                        <Input
                            pattern={PATTERN}
                            variant="Small"
                            type={showConfirmPassword ? "text" : "password"}
                            onChange={(e) => {
                                const val = e.target.value
                                setConfirmPassword(val)
                                e.currentTarget.setCustomValidity("")
                                const valid = e.target.reportValidity()
                                if (valid && password !== val) {
                                    e.currentTarget.setCustomValidity("password do not match")
                                }
                            }}
                            value={confirmPassword}
                            onInvalid={(e) => {
                                const val = e.currentTarget.value
                                if (!val) {
                                    e.currentTarget.setCustomValidity("Confirm Password is required");
                                } else if (e.currentTarget.validity.patternMismatch) {
                                    e.currentTarget.setCustomValidity(`
                                            password must contain:
                                            - At least one lowercase letter
                                            - At least one uppercase letter
                                            - At least one digit
                                            - At least one special (@$!%*?&)
                                            - At least 8 characters
                                            `);
                                }
                            }}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            variant="Primary"
                            label="Add User"
                            icon={<PlusCircle />}
                            type="submit"
                        />
                    </div>
                </form>
            </DialogComponent>
        </Dialog >
    )
}