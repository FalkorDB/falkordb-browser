/* eslint-disable @typescript-eslint/no-use-before-define */

"use client";

import React, { useEffect, useState, useContext } from "react";
import { CreateUser, User } from "@/app/api/user/model";
import { prepareArg, securedFetch, Row } from "@/lib/utils";
import TableComponent from "@/app/components/TableComponent";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CloseDialog from "@/app/components/CloseDialog";
import { IndicatorContext } from "@/app/components/provider";
import DeleteUser from "./DeleteUser";
import AddUser from "./AddUser";

type SetUser = {
    username: string
    role: string
    oldRole?: string
}

const ROLES = [
    "Admin",
    "Read-Write",
    "Read-Only"
]

// Shows the details of a current database connection 
export default function Users() {

    const [users, setUsers] = useState<User[]>([])
    const [rows, setRows] = useState<Row[]>([])
    const [newUser, setNewUser] = useState<SetUser | null>(null)
    const [open, setOpen] = useState(false)
    const { toast } = useToast()
    const { setIndicator } = useContext(IndicatorContext);

    const handleSetRole = async (user: SetUser) => {
        const { username, role, oldRole } = user
        const result = await securedFetch(`api/user/${prepareArg(username)}`, {
            method: 'PATCH',
            body: JSON.stringify({ role })
        }, toast, setIndicator)

        if (result.ok) {
            setUsers(prev => prev.map(u => u.username === username ? { ...u, role } : u))
            setRows(prev => prev.map((row): Row => row.cells[0].value === username ? { ...row, cells: [row.cells[0], { ...row.cells[1], value: role }] } : row))
            toast({
                title: "Success",
                description: `${username} role updated successfully`,
                action: oldRole ? <ToastAction altText="Undo" onClick={() => handleSetRole({ username, role: oldRole })}>Undo</ToastAction> : undefined
            })
            setOpen(false)
        }
    }

    useEffect(() => {
        (async () => {
            const result = await securedFetch("api/user", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, toast, setIndicator)

            if (result.ok) {
                const data = await result.json()
                setUsers(data.result.map((user: User) => ({ ...user, selected: false })))
                setRows(data.result.map(({ username, role }: User): Row => ({
                    name: username,
                    cells: [{
                        value: username,
                        type: "readonly"
                    }, username === "default" ? {
                        value: role,
                        type: "readonly",
                    } : {
                        value: role,
                        type: "select",
                        onChange: async (value: string) => {
                            setNewUser({ username, role: value, oldRole: role })
                            setOpen(true)
                            return true
                        },
                        options: ROLES,
                        selectType: "Role"
                    }],
                    checked: false,
                })))
            }
        })()
    }, [toast, setIndicator])

    const handleAddUser = async ({ username, password, role }: CreateUser) => {
        const response = await securedFetch('/api/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        }, toast, setIndicator)

        if (response.ok) {
            toast({
                title: "Success",
                description: "User added successfully",
            })
            setUsers(prev => [...prev, { username, role, selected: false }])
            setRows(prev => [...prev, {
                name: username,
                cells: [{
                    value: username,
                    type: "readonly"
                }, {
                    value: role,
                    onChange: async (value: string) => {
                        setNewUser({ username, role: value, oldRole: role })
                        setOpen(true)
                        return true
                    },
                    type: "select",
                    options: ROLES,
                    selectType: "Role"
                }],
                checked: false,
            }] as Row[])
        }
    }

    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <TableComponent
                label="Users"
                entityName="User"
                headers={["Name", "Role"]}
                rows={rows}
                setRows={setRows}
            >
                <div className="flex flex-row-reverse gap-4">
                    <AddUser onAddUser={handleAddUser} />
                    <DeleteUser users={rows.filter(row => row.checked).map(row => users.find(user => user.username === row.cells[0].value)!)} setUsers={setUsers} setRows={setRows} />
                </div>
            </TableComponent>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-background p-8 flex flex-col gap-8 rounded-lg border-none" hideClose>
                    <DialogHeader className="flex-row justify-between items-center border-b border-border pb-4">
                        <DialogTitle className="text-2xl font-medium">Set User Role</DialogTitle>
                        <CloseDialog />
                    </DialogHeader>
                    <DialogDescription>Are you sure you want to set the user role to {newUser?.role}?</DialogDescription>
                    <div className="flex justify-end gap-4">
                        <Button onClick={() => handleSetRole(newUser!)}>Set User</Button>
                        <CloseDialog label="Cancel" />
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}