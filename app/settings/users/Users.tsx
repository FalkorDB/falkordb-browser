/* eslint-disable @typescript-eslint/no-use-before-define */

"use client";

import React, { useEffect, useState } from "react";
import { CreateUser, User } from "@/app/api/user/model";
import { prepareArg, securedFetch } from "@/lib/utils";
import Combobox from "@/app/components/ui/combobox";
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

    useEffect(() => {
        setRows(users.map((user) => ({
            cells: [{
                value: user.username,
            }, {
                value: user.role,
            }],
            checked: false,
        })))
    }, [users])

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
                        onChange: (value: string) => handleSetRole([user.username], [value], true)
                    }],
                    checked: false,
                })))
            }
        })()

    }, [])

    const handleSetRole = async (usernames: string[], role: string[], isUndo: boolean) => {
        const oldRoles = usernames.map(username => users.find(user => user.username === username)!.role)
        const updatedUsers = await Promise.all(users.map(async (user, i) => {

            if (!usernames.includes(user.username)) return user

            const result = await securedFetch(`api/user/${prepareArg(user.username)}/?role=${role}`, {
                method: 'PATCH'
            }, toast)

            if (result.ok) {
                return {
                    ...user,
                    role: role.length === 1 ? role[0] : role[i]
                }
            }

            return user
        }))

        setUsers(updatedUsers)
        setRows(rows.map(row => {
            if (!usernames.includes(row.cells[0].value as string)) return row
            return {
                ...row,
                cells: [{ ...row.cells[0], value: role.length === 1 ? role[0] : role[usernames.indexOf(row.cells[0].value as string)] }],
                checked: false
            }
        }))
        toast({
            title: "Success",
            description: `${usernames.join(", ")} role updated successfully`,
            action: isUndo ? <ToastAction altText="Undo" onClick={() => handleSetRole(usernames, oldRoles, false)}>Undo</ToastAction> : undefined
        })
        return true
    }

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
            >
                <div className="flex flex-row-reverse gap-4">
                    <AddUser onAddUser={handleAddUser} />
                    <DeleteUser users={rows.filter(row => row.checked).map(row => users.find(user => user.username === row.cells[0].value)!)} setUsers={setUsers} />
                    <Combobox
                        disabled={rows.filter(row => row.checked).length === 0}
                        type="Role"
                        options={ROLES}
                        setSelectedValue={(role) => { handleSetRole(rows.filter(row => row.checked).map(row => row.cells[0].value as string), [role], true) }}
                    />
                </div>
            </TableComponent>
        </div >
    );
}