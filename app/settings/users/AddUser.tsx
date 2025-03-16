/* eslint-disable no-param-reassign */

"use client"

import { FormEvent, useEffect, useState } from "react"
import { PlusCircle } from "lucide-react";
import { CreateUser } from "@/app/api/user/model";
import Button from "@/app/components/ui/Button";
import FormComponent, { Field } from "@/app/components/FormComponent";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Drawer, DrawerDescription, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

export default function AddUser({ onAddUser }: {
    onAddUser: (user: CreateUser) => Promise<void>
}) {
    const [open, setOpen] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState("")

    const handleClose = () => {
        setPassword("")
        setConfirmPassword("")
        setUsername("")
        setRole("")
    }

    useEffect(() => {
        if (!open) handleClose()
    }, [open])

    const fields: Field[] = [
        {
            value: username,
            onChange: (e) => setUsername(e.target.value),
            label: "Username",
            type: "text",
            required: true,
            errors: [
                {
                    message: "Username is required",
                    condition: (value: string) => !value
                }
            ]
        },
        {
            value: password,
            onChange: (e) => setPassword(e.target.value),
            label: "Password",
            type: "password",
            required: true,
            show: false,
            errors: [
                {
                    message: "Password is required",
                    condition: (value: string) => !value
                },
                {
                    message: "Password must be at least 8 characters long",
                    condition: (value: string) => value.length < 8
                },
                {
                    message: "Password must contain at least one uppercase letter",
                    condition: (value: string) => !/[A-Z]/.test(value)
                },
                {
                    message: "Password must contain at least one lowercase letter",
                    condition: (value: string) => !/[a-z]/.test(value)
                },
                {
                    message: "Password must contain at least one number",
                    condition: (value: string) => !/[0-9]/.test(value)
                },
                {
                    message: "Password must contain at least one special character",
                    condition: (value: string) => !/[!@#$%^&*]/.test(value)
                }
            ]
        },
        {
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value),
            label: "Confirm Password",
            type: "password",
            required: true,
            show: false,
            errors: [
                {
                    message: "Confirm password is required",
                    condition: (value: string) => !value
                },
                {
                    message: "Password don't match",
                    condition: (value: string, pass?: string) => value !== (pass ?? password)
                },
            ]
        },
        {
            value: role,
            onSelectedValue: (value) => setRole(value),
            label: "Role",
            type: "select",
            options: ["Admin", "Read-Write", "Read-Only"],
            required: true,
            errors: [
                {
                    message: "Role is required",
                    condition: (value: string) => !value
                }
            ]
        }
    ]

    const handleAddUser = async (e: FormEvent) => {
        e.preventDefault();

        await onAddUser({ username, password, role })

        setOpen(false)

        handleClose()
    };

    return (
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="Primary"
                    label="Add User"
                    title="Add a new user to the system"
                >
                    <PlusCircle size={20} />
                </Button>
            </DrawerTrigger>
            <DrawerContent side="right" className="gap-6 after:hidden">
                <VisuallyHidden>
                    <DrawerTitle />
                    <DrawerDescription />
                </VisuallyHidden>
                <FormComponent
                    className="p-4"
                    handleSubmit={handleAddUser}
                    fields={fields}
                />
            </DrawerContent>
        </Drawer>
    )
}