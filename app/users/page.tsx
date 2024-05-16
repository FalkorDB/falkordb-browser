"use client";

import React from "react";
import useSWR from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { User } from "@/app/api/user/model";
import { securedFetch } from "@/lib/utils";
import DeleteUser from "./DeleteUser";
import AddUser from "./AddUser";

const fetcher = async (url: string) => {
    const response = await securedFetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.ok) {
        const data = await response.json()
        return data.result
    }
    return { users: [] }
}

// Shows the details of a current database connection 
export default function Page() {

    const { data } = useSWR(`/api/user/`, fetcher, { refreshInterval: 1000 })
    const [selectedRows, setSelectedRows] = React.useState<boolean[]>([])

    const users: User[] = (data && data.users) || []
    if (users.length !== selectedRows.length) {
        setSelectedRows(new Array(users.length).fill(false))
    }

    // Handle the select/unselect a checkbox
    const onSelect = (checked: CheckedState, index: number) => {
        setSelectedRows((prev) => {
            const next = [...prev]
            next[index] = checked === true
            return next
        })
    }

    return (
        <div className="w-full h-full p-2 flex flex-col space-y-4">
            <h1 className="text-2xl font-bold">Users</h1>
            <div className="space-y-2 list-disc border rounded-lg border-gray-300 p-2">
                <div className="flex flex-row space-x-2">
                    <AddUser />
                    <DeleteUser users={users} selectedRows={selectedRows} />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[32px]">
                                <Checkbox id="select-all" onCheckedChange={(checked: CheckedState) => setSelectedRows(new Array(users.length).fill(checked))} />
                            </TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: User, index: number) => (
                            <TableRow key={user.username}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows[index]}
                                        onCheckedChange={(checked) => onSelect(checked, index)} />
                                </TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.role}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}