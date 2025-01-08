/* eslint-disable no-param-reassign */

"use client"

import { FormEvent, useState } from "react"
import { PlusCircle } from "lucide-react";
import { CreateUser } from "@/app/api/user/model";
import Button from "@/app/components/ui/Button";
import FormComponent, { Error, Field } from "@/app/components/FormComponent";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function AddUser({ onAddUser }: {
    onAddUser: (user: CreateUser) => void
}) {
    const [open, setOpen] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState("")

    const fields: Field[] = [
        {
            value: username,
            onChange: (e) => setUsername(e.target.value),
            label: "Username",
            type: "text",
            required: true,
        },
        {
            value: password,
            onChange: (e) => setPassword(e.target.value),
            label: "Password",
            type: "password",
            required: true,
            show: false,
            error: {
                message: "Password must be at least 8 characters long",
                condition: (value: string, error: Error) => {
                    error.message = "Password must be at least 8 characters long"
                    return value.length < 8
                }
            }
        },
        {
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value),
            label: "Confirm Password",
            type: "password",
            required: true,
            show: false,
            error: {
                message: "Password don't match",
                condition: (value: string, error: Error) => {
                    error.message = "Password don't match"
                    return value !== password
                }
            }
        },
        {
            value: role,
            onSelectedValue: (value) => setRole(value),
            label: "Role",
            type: "select",
            options: ["Admin", "Read-Write", "Read-Only"],
            required: true,
        }
    ]

    const handleClose = () => {
        setPassword("")
        setConfirmPassword("")
        setUsername("")
        setRole("")
    }

    const handleAddUser = async (e: FormEvent) => {
        e.preventDefault();

        onAddUser({ username, password, role })

        setOpen(false)

        handleClose()
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="Primary"
                    label="Add User"
                >
                    <PlusCircle size={20} />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-6">
                <SheetHeader>
                    <SheetTitle className="text-2xl text-white">Add User</SheetTitle>
                </SheetHeader>
                <FormComponent
                    handleSubmit={handleAddUser}
                    fields={fields}
                />
            </SheetContent>
        </Sheet>
    )
}