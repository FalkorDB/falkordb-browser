"use client";

import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { User } from "@/app/api/user/model";
import { cn, securedFetch } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Combobox from "@/app/components/ui/combobox";
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
    const [checked, setChecked] = useState<boolean>(false)
    const [hover, setHover] = useState<string>("")

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

    const handelSetRole = async (role: string, username?: string) => {
        const updatedUsers = await Promise.all(users.map(async user => {
            const updated = username ? user.username === username : user.selected
        
            if (!updated) return user
        
            const result = await securedFetch(`api/user/${username}/?role=${role}`, {
                method: 'PATCH'
            })
        
            if (result.ok) {
                return {
                    ...user,
                    role
                }
            }
        
            return user
        }))

        setUsers(updatedUsers)
    }


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
                        handelSetRole(role)
                    }}
                />
            </div>
            <div className="border border-[#57577B] rounded-lg overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-none">
                            {
                                [<Checkbox
                                    key="checkbox"
                                    checked={checked}
                                    className="data-[state=checked]:text-[#57577B] border-[#57577B] data-[state=checked]:bg-[#272746] rounded-lg w-5 h-5"
                                    id="select-all"
                                    onCheckedChange={(check: CheckedState) => {
                                        setChecked(check === true)
                                        setUsers(prev => prev.map(user => {
                                            const u = user
                                            u.selected = check === true
                                            return u
                                        }))
                                    }}
                                />, "USERNAME", "ROLE", ""].map((header, index) => (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <TableHead key={index}>{header}</TableHead>
                                ))
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            users.map(({ username, role, selected }, index) => (
                                <TableRow onMouseEnter={() => setHover(username)} onMouseLeave={() => setHover("")} key={username} className={cn("border-none", !(index % 2) && "bg-[#57577B] hover:bg-[#57577B]")}>
                                    <TableCell className="w-[5%] py-6">
                                        <Checkbox
                                            key="checkbox"
                                            className={cn((index % 2) && "data-[state=checked]:text-[#57577B] border-[#57577B] data-[state=checked]:bg-[#272746]", !(index % 2) && "data-[state=checked]:text-[#272746] border-[#272746] data-[state=checked]:bg-[#57577B]", "rounded-lg w-5 h-5")}
                                            checked={selected}
                                            onCheckedChange={(check) => {
                                                setUsers(prev => prev.map(currentUser => {
                                                    if (username !== currentUser.username) return currentUser
                                                    const u = currentUser
                                                    u.selected = check === true
                                                    return u
                                                }))
                                            }} />
                                    </TableCell>
                                    <TableCell className="w-[35%]">{username}</TableCell>
                                    <TableCell className="w-[50%]">
                                        <Combobox
                                            key="role"
                                            inTable
                                            type="Role"
                                            options={ROLES}
                                            selectedValue={role || ""}
                                            setSelectedValue={(r) => handelSetRole(r, username)} />
                                    </TableCell>
                                    <TableCell className="w-[10%]">
                                        {
                                            hover === username &&
                                            <DeleteUser key="delete" users={[{ username, role, selected }]} setUsers={setUsers} />
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        </div >
    );
}