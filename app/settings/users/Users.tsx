"use client";

import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { User } from "@/app/api/user/model";
import { cn, securedFetch } from "@/lib/utils";
import Combobox from "@/app/components/combobox";
import TableView from "@/app/components/TableView";
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
    const tableHeaders = [
        <Checkbox
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
        />,
        "USERNAME",
        "ROLE",
        ""
    ]
    const tableRows = users.map((user, index) => [
        <Checkbox
            key="checkbox"
            className={cn(!(index % 2) && "data-[state=checked]:text-[#57577B] border-[#57577B] data-[state=checked]:bg-[#272746]", "data-[state=checked]:text-[#272746] border-[#272746] data-[state=checked]:bg-[#57577B] rounded-lg w-5 h-5")}
            checked={user.selected}
            onCheckedChange={(check) => {
                setUsers(prev => prev.map(currentUser => {
                    if (user.username !== currentUser.username) return currentUser
                    const u = currentUser
                    u.selected = check === true
                    return u
                }))
            }} />,
        user.username,
        <Combobox
            key="role"
            inTable
            type="Role"
            options={ROLES}
            selectedValue={user.role || ""}
            setSelectedValue={(role) => {
                const u = user
                u.role = role
            }} />,
        <DeleteUser key="delete" users={[user]} setUsers={setUsers} />
    ])

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
            <TableView editableCells={[]} tableHeaders={tableHeaders} tableRows={tableRows} onHoverCells={[3]}/>
        </div >
    );
}