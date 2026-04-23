"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import Button from "@/app/components/ui/Button";
import FormComponent, { Field } from "@/app/components/FormComponent";
import { Drawer, DrawerDescription, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

interface EditUserProps {
    username: string
    role: string
    keys: string[]
    onEditUser: (username: string, role: string, keys: string[], password?: string) => Promise<boolean>
    disabled?: boolean
}

export default function EditUser({ username, role: initialRole, keys: initialKeys, onEditUser, disabled = false }: EditUserProps) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState(initialRole);
    const [keys, setKeys] = useState<string[]>(initialKeys ? initialKeys : []);

    const [prevOpen, setPrevOpen] = useState(false);

    useEffect(() => {
        if (open && !prevOpen) {
            setRole(initialRole);
            setKeys(initialKeys ? initialKeys : []);
            setPassword("");
            setConfirmPassword("");
        }
        setPrevOpen(open);
    }, [open, prevOpen, initialRole, initialKeys]);

    const fields: Field[] = [
        {
            value: username,
            onChange: () => {},
            label: "Username",
            type: "text",
            required: false,
            disabled: true,
        },
        {
            value: password,
            onChange: (e) => setPassword(e.target.value),
            label: "New Password",
            type: "password",
            required: false,
            show: false,
            placeholder: "Leave empty to keep current",
            errors: password ? [
                {
                    message: "Password must be at least 8 characters long",
                    condition: (value: string) => value.length > 0 && value.length < 8
                },
                {
                    message: "Password must contain at least one uppercase letter",
                    condition: (value: string) => value.length > 0 && !/[A-Z]/.test(value)
                },
                {
                    message: "Password must contain at least one lowercase letter",
                    condition: (value: string) => value.length > 0 && !/[a-z]/.test(value)
                },
                {
                    message: "Password must contain at least one number",
                    condition: (value: string) => value.length > 0 && !/[0-9]/.test(value)
                },
                {
                    message: "Password must contain at least one special character",
                    condition: (value: string) => value.length > 0 && !/[!@#$%^&*]/.test(value)
                }
            ] : []
        },
        {
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value),
            label: "Confirm Password",
            type: "password",
            required: false,
            show: false,
            errors: password ? [
                {
                    message: "Passwords don't match",
                    condition: (value: string, pass?: string) => value !== (pass ?? password)
                },
            ] : []
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
            description: "Pattern for accessible keys / graphs (e.g. *, mygraph, myprefix*)",
            info: "Defines which keys / graphs this user can access",
            errors: []
        }
    ];

    const handleEditUser = async (e: FormEvent) => {
        e.preventDefault();

        const normalizedKeys = keys.length === 0 ? ["*"] : keys;
        const ok = await onEditUser(username, role, normalizedKeys, password || undefined);
        if (ok) {
            setOpen(false);
        }
    };

    return (
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    disabled={disabled}
                    variant="Primary"
                    label="Edit User"
                    id="edit-user"
                    title="Edit selected user"
                >
                    <Pencil size={20} />
                </Button>
            </DrawerTrigger>
            <DrawerContent side="right" className="w-[30rem] max-w-[90vw] gap-2 after:hidden">
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <DrawerHeader className="px-6 pt-6 pb-2 text-left border-b border-border">
                        <DrawerTitle className="text-xl">Edit User</DrawerTitle>
                        <DrawerDescription>
                            Update role, key/graph permissions, or password for this user.
                        </DrawerDescription>
                    </DrawerHeader>
                    <FormComponent
                        className="px-6 py-4"
                        handleSubmit={handleEditUser}
                        fields={fields}
                        submitButtonLabel="Save"
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
