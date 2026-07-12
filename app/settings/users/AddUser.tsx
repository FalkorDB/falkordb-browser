/* eslint-disable no-param-reassign */

"use client";

import { FormEvent, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { CreateUser } from "@/app/api/user/model";
import Button from "@/app/components/ui/Button";
import FormComponent, { Field } from "@/app/components/FormComponent";
import { Drawer, DrawerDescription, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

export default function AddUser({ onAddUser }: {
    onAddUser: (user: CreateUser, keys: string[]) => Promise<boolean>
}) {
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [keys, setKeys] = useState<string[]>([]);

    const handleClose = () => {
        setPassword("");
        setConfirmPassword("");
        setUsername("");
        setRole("");
        setKeys([]);
    };

    useEffect(() => {
        if (!open) handleClose();
    }, [open]);

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
            onChange: (value) => setRole(value),
            label: "Role",
            type: "select",
            selectType: "Role",
            options: ["Admin", "Read-Write", "Read-Only"],
            required: true,
            errors: [
                {
                    message: "Role is required",
                    condition: (value: string) => !value
                }
            ]
        },
        {
            value: keys.join(" "),
            label: "Key / Graph Permissions",
            type: "tag",
            tags: keys,
            onAddTag: (tag) => setKeys(prev => [...prev, tag]),
            onRemoveTag: (index) => setKeys(prev => prev.filter((_, i) => i !== index)),
            required: false,
            placeholder: "*",
            description: "Pattern for accessible keys / graphs (e.g. mygraph, myprefix*, *)",
            info: "Defines which keys / graphs this user can access",
            errors: []
        }
    ];

    const handleAddUser = async (e: FormEvent) => {
        e.preventDefault();

        const normalizedKeys = keys.length === 0 ? ["*"] : keys;
        const ok = await onAddUser({ username, password, role, }, normalizedKeys);
        if (ok) {
            setOpen(false);
        }
    };

    return (
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="Primary"
                    label="Add User"
                    id="add-user"
                    title="Add a new user to the system"
                >
                    <PlusCircle size={20} />
                </Button>
            </DrawerTrigger>
            <DrawerContent side="right" className="w-[30rem] max-w-[90vw] gap-2 after:hidden">
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <DrawerHeader className="px-6 pt-6 pb-2 text-left border-b border-border">
                        <DrawerTitle className="text-xl">Add User</DrawerTitle>
                        <DrawerDescription>
                            Create a new user with role-based access permissions.
                        </DrawerDescription>
                    </DrawerHeader>
                    <FormComponent
                        className="px-6 py-4"
                        handleSubmit={handleAddUser}
                        fields={fields}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}