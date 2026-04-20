/* eslint-disable no-param-reassign */

"use client";

import { FormEvent, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { CreateUser } from "@/app/api/user/model";
import Button from "@/app/components/ui/Button";
import FormComponent, { Field } from "@/app/components/FormComponent";
import { Drawer, DrawerDescription, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

export default function AddUser({ onAddUser }: {
    onAddUser: (user: CreateUser, keys: string) => Promise<void>
}) {
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Admin");
    const [keys, setKeys] = useState("");

    const handleClose = () => {
        setPassword("");
        setConfirmPassword("");
        setUsername("");
        setRole("");
        setKeys("");
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
            value: keys,
            onChange: (e) => setKeys(e.target.value),
            label: "Key / Graph Permissions",
            type: "text",
            required: false,
            placeholder: "*",
            description: "Pattern for accessible keys / graphs (e.g. *, user:*, ~myprefix:*)",
            info: "Defines which keys / graphs this user can access. See Redis ACL documentation for pattern syntax.",
            link: {
                label: "Learn more",
                url: "https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/#key-permissions"
            },
            errors: []
        }
    ];

    const handleAddUser = async (e: FormEvent) => {
        e.preventDefault();

        await onAddUser({ username, password, role }, keys);

        setOpen(false);

        handleClose();
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
            <DrawerContent side="right" className="w-[28rem] max-w-[90vw] gap-2 after:hidden overflow-y-auto">
                <DrawerHeader className="px-4 pt-4 pb-0">
                    <DrawerTitle>Add User</DrawerTitle>
                    <DrawerDescription>
                        Create a new user with role-based access permissions.
                    </DrawerDescription>
                </DrawerHeader>
                <FormComponent
                    className="p-4"
                    handleSubmit={handleAddUser}
                    fields={fields}
                />
            </DrawerContent>
        </Drawer>
    );
}