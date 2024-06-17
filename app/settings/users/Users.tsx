"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { User } from "@/app/api/user/model";
import { cn, securedFetch } from "@/lib/utils";
import Combobox from "@/app/components/combobox";
import DeleteUser from "./DeleteUser";
import AddUser from "./AddUser";

const ROLES = [
    "Admin",
    "Read-Write",
    "Read-Only"
]

// Shows the details of a current database connection 
export default function Users() {

    const [isHover, setIsHover] = useState<number | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [checked, setChecked] = useState<boolean>(false)

    useEffect(() => {
        const run = async () => {
            const result = await securedFetch("api/user", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (result.ok) {
                const data = await result.json()
                setUsers(data.result)
            }
        }
        run()
    }, [])

    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <div className="flex flex-row-reverse gap-4">
                <AddUser setUsers={setUsers} />
                <DeleteUser isDeleteSelected users={users.filter(user => user.selected)} setUsers={setUsers} />
                <Combobox
                    disabled={users.filter(user => user.selected).length === 0}
                    type="Role"
                    options={ROLES}
                    setSelectedValue={(role) => {
                        setChecked(false)
                        setUsers(prev => prev.map(user => {
                            if (!user.selected) return user
                            const u = user
                            u.role = role
                            u.selected = false
                            return u
                        }))
                    }}
                />
            </div>
            <div className="border border-[#57577B] rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="border-none">
                            <TableHead className="w-[5%]">
                                <Checkbox
                                    checked={checked}
                                    className="border-[#57577B] rounded-lg"
                                    id="select-all"
                                    onCheckedChange={(check: CheckedState) => {
                                        setChecked(check === true)
                                        setUsers(prev => prev.map(user => {
                                            const u = user
                                            u.selected = check === true
                                            return u
                                        }))
                                    }}
                                />
                            </TableHead>
                            <TableHead className="font-medium">USERNAME</TableHead>
                            <TableHead className="font-medium">ROLE</TableHead>
                            <TableHead className="w-[5%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            users.map((user: User, index: number) => (
                                <TableRow
                                    className={cn("border-none last:rounded-b-lg", !(index % 2) && "bg-[#57577B] hover:bg-[#57577B]")}
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                    onMouseEnter={() => setIsHover(index)}
                                    onMouseLeave={() => setIsHover(null)}
                                >
                                    <TableCell>
                                        <Checkbox
                                            className={cn(!(index % 2) && "border-[#57577B]", "border-[#272746] rounded-lg")}
                                            checked={user.selected}
                                            onCheckedChange={(check) => {
                                                setUsers(prev => prev.map(currentUser => {
                                                    if (user.username !== currentUser.username) return currentUser
                                                    const u = currentUser
                                                    u.selected = check === true
                                                    return u
                                                }))
                                            }} />
                                    </TableCell>
                                    <TableCell className="font-light">{user.username}</TableCell>
                                    <TableCell>
                                        <Combobox
                                            inTable
                                            type="Role"
                                            options={ROLES}
                                            selectedValue={user.role || ""}
                                            setSelectedValue={(role) => {
                                                const u = user
                                                u.role = role
                                            }} />
                                    </TableCell>
                                    <TableCell className="p-0">
                                        {
                                            isHover === index &&
                                            <DeleteUser users={[user]} setUsers={setUsers} />
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}