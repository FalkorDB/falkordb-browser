"use client";

import { toast } from "@/components/ui/use-toast";
import { signOut } from "next-auth/react";
import React from "react";
import useSWR from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import DeleteUser from "./DeleteUser";
import AddUser from "./AddUser";

const fetcher = (url: string) => fetch(url, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}).then((response) => {
    const { status } = response

    if (status >= 300) {
        response.text().then((message) => {
            toast({
                title: "Error",
                description: message,
            })
        }).then(() => {
            if (status === 401 || status >= 500) {
                signOut({ callbackUrl: '/login' })
            }
        })
        return { users: [] }
    }
    return response.json()
}).then((data) => data.result)


// Shows the details of a current database connection 
export default function Page() {

    const { data } = useSWR(`/api/user/`, fetcher, { refreshInterval: 1000 })
    const [selectedRows, setSelectedRows] = React.useState<boolean[]>([])

    const users = data && data.users || [] as string[]
    if (users.length !== selectedRows.length) {
        setSelectedRows(new Array(users.length).fill(false))
    }

    // Handle the select/unselect all checkboxs
    const onSelectAll = (checked: CheckedState) => {
        if (checked === true) {
            setSelectedRows(new Array(users.length).fill(true))
        } else {
            setSelectedRows(new Array(users.length).fill(false))
        }
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
                                <Checkbox id="select-all" onCheckedChange={onSelectAll} />
                            </TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: string, index: number) => (
                            <TableRow key={user}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows[index]}
                                        onCheckedChange={(checked) => onSelect(checked, index)} />
                                </TableCell>
                                <TableCell>{user}</TableCell>
                                {/* <TableCell>{role}</TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}