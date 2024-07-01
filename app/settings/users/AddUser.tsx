import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { Toast, securedFetch } from "@/lib/utils";
import { Eye, PlusCircle } from "lucide-react";
import { User } from "@/app/api/user/model";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import DialogComponent from "@/app/components/DialogComponent";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Combobox from "../../components/combobox";

// eslint-disable-next-line no-useless-escape
const PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+])[A-Za-z\d@$!%*?&#+]{8,}$"

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

    const addUser = async (e: FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            Toast("User name and password are required")
            return
        }
        if (password !== confirmPassword) {
            Toast("Passwords do not match")
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
            Toast("Success", "User added successfully")
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
                            }}
                            onInvalid={(e) => e.currentTarget.setCustomValidity("Username is required")}
                            required
                        />
                    </div>
                    <div className="relative flex flex-col gap-2">
                        <p title="Password">Password</p>
                        <button
                            className="absolute top-10 right-2 p-0"
                            title="Show Password"
                            type="button"
                            aria-label="Show Password"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            <Eye strokeWidth={0.5} />
                        </button>
                        <Input
                            pattern={PATTERN}
                            variant="Small"
                            type={showPassword ? "text" : "password"}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                e.currentTarget.setCustomValidity("")
                                if (!e.target.checkValidity()) {
                                    if (!e.target.value) {
                                        e.currentTarget.setCustomValidity("Password is required");
                                    } else if (e.target.validity.patternMismatch) {
                                        e.currentTarget.setCustomValidity(`
                                            Password must contain:
                                            - At least one lowercase letter
                                            - At least one uppercase letter
                                            - At least one digit
                                            - At least one special character (@$!%*?&#+)
                                            - At least 8 characters
                                            `);
                                    }
                                } else {
                                    // If the value is valid or the input is empty, clear the custom validity message
                                    e.currentTarget.setCustomValidity("");
                                }
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
                                e.currentTarget.reportValidity();
                            }}
                            required
                        />
                    </div>
                    <div className="relative flex flex-col gap-2">
                        <p title="Confirm Password">Confirm Password</p>
                        <button
                            className="absolute top-10 right-2 p-0"
                            title="Show Confirm Password"
                            type="button"
                            aria-label="Show Confirm Password"
                            onClick={() => setConfirmShowPassword(prev => !prev)}
                        >
                            <Eye strokeWidth={0.5} />
                        </button>
                        <Input
                            pattern={PATTERN}
                            variant="Small"
                            type={showConfirmPassword ? "text" : "password"}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            required
                        />
                    </div>
                    <div className="flex flex-row justify-end">
                        <Button
                            variant="Primary"
                            label="ADD USER"
                            icon={<PlusCircle />}
                            type="submit"
                        />
                    </div>
                </form>
            </DialogComponent>
        </Dialog>
    )
}