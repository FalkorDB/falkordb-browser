/* eslint-disable @typescript-eslint/no-use-before-define */

"use client";

import React, { useEffect, useState } from "react";
import { CreateUser, User } from "@/app/api/user/model";
import { prepareArg, securedFetch, Row } from "@/lib/utils";
import TableComponent from "@/app/components/TableComponent";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useSession } from "next-auth/react";
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
    const { data: session } = useSession()

    const handleSetRole = async (username: string, role: string, oldRole?: string) => {
        const result = await securedFetch(`api/user/${prepareArg(username)}?userRole=${role}`, {
            method: 'PATCH'
        }, session?.user?.role, toast)

        if (result.ok) {
            setUsers(prev => prev.map(user => user.username === username ? { ...user, role } : user))
            setRows(prev => prev.map(row => row.cells[0].value === username ? { ...row, cells: [row.cells[0], { ...row.cells[1], value: role }] } : row))

            toast({
                title: "Success",
                description: `${username} role updated successfully`,
                action: oldRole ? <ToastAction altText="Undo" onClick={() => handleSetRole(username, oldRole)}>Undo</ToastAction> : undefined
            })
        }
    }

    useEffect(() => {
        (async () => {
            const result = await securedFetch("api/user", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, session?.user?.role, toast)

            if (result.ok) {
                const data = await result.json()
                setUsers(data.result.map((user: User) => ({ ...user, selected: false })))
                setRows(data.result.map(({ username, role }: User) => ({
                    cells: [{
                        value: username,
                    }, {
                        value: role,
                        onChange: username === "default" ? undefined : (value: string) => handleSetRole(username, value, role),
                        type: "combobox",
                        comboboxType: "Role",
                    }],
                    checked: false,
                })))
            }
        })()
    }, [toast])

    const handleAddUser = async ({ username, password, role }: CreateUser) => {
        const response = await securedFetch('/api/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        }, session?.user?.role, toast)

        if (response.ok) {
            toast({
                title: "Success",
                description: "User added successfully",
            })
            setUsers(prev => [...prev, { username, role, selected: false }])
            setRows(prev => [...prev, {
                cells: [{
                    value: username,
                }, {
                    value: role,
                    onChange: (value: string) => handleSetRole(username, value, role),
                    type: "combobox",
                    comboboxType: "Role"
                }],
                checked: false,
            }] as Row[])
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
                    <DeleteUser users={rows.filter(row => row.checked).map(row => users.find(user => user.username === row.cells[0].value)!)} setUsers={setUsers} setRows={setRows} />
                </div>
            </TableComponent>
        </div >
    );
}