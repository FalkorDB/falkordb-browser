/* eslint-disable @typescript-eslint/no-use-before-define */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CreateUser, User } from "@/app/api/user/model";
import { prepareArg, securedFetch } from "@/lib/utils";
import TableComponent, { Row } from "@/app/components/TableComponent";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import DeleteUser from "./DeleteUser";
import AddUser from "./AddUser";

const ROLES = [
    "Admin",
    "Read-Write",
    "Read-Only"
]

// Shows the details of a current database connection 
export default function Users() {

    const [users, setUsers] = useState<User[]>([])
    const [rows, setRows] = useState<Row[]>([])
    const { toast } = useToast()

    const handleSetRole = useCallback(async (username: string, role: string, isUndo: boolean) => {
        const oldRole = users.find(user => user.username === username)!.role

        const result = await securedFetch(`api/user/${prepareArg(username)}/?role=${role}`, {
            method: 'PATCH'
        }, toast)

        if (result.ok) {
            setUsers(users.map(user => user.username === username ? { ...user, role } : user))
            setRows(rows.map(row => row.cells[0].value === username ? { ...row, cells: [{ ...row.cells[0], value: role }] } : row))

            toast({
                title: "Success",
                description: `${username} role updated successfully`,
                action: isUndo ? <ToastAction altText="Undo" onClick={() => handleSetRole(username, oldRole, false)}>Undo</ToastAction> : undefined
            })
        }
    }, [users, toast, rows])

    useEffect(() => {
        (async () => {
            const result = await securedFetch("api/user", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, toast)

            if (result.ok) {
                const data = await result.json()
                setUsers(data.result.map((user: User) => ({ ...user, selected: false })))
                setRows(data.result.map((user: User) => ({
                    cells: [{
                        value: user.username,
                    }, {
                        value: user.role,
                        onChange: user.username === "default" ? undefined : (value: string) => handleSetRole(user.username, value, true),
                        type: "combobox"
                    }],
                    checked: false,
                })))
            }
        })()
    }, [handleSetRole, toast])

    const handleAddUser = async ({ username, password, role }: CreateUser) => {
        if (!role) {
            toast({
                title: "Error",
                description: "Select role is required",
                variant: "destructive"
            })
            return
        }

        const response = await securedFetch('/api/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        }, toast)

        if (response.ok) {
            toast({
                title: "Success",
                description: "User added successfully",
            })
            setUsers(prev => [...prev, { username, role, selected: false }])
        }
    }

    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <TableComponent
                headers={["Name", "Role"]}
                rows={rows}
                setRows={setRows}
                options={ROLES}
            >
                <div className="flex flex-row-reverse gap-4">
                    <AddUser onAddUser={handleAddUser} />
                    <DeleteUser users={rows.filter(row => row.checked).map(row => users.find(user => user.username === row.cells[0].value)!)} setUsers={setUsers} />
                </div>
            </TableComponent>
        </div >
    );
}