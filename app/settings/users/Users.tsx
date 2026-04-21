/* eslint-disable @typescript-eslint/no-use-before-define */

"use client";

import React, { useEffect, useState, useContext } from "react";
import { Save } from "lucide-react";
import { CreateUser, User } from "@/app/api/user/model";
import { prepareArg, securedFetch, Row } from "@/lib/utils";
import TableComponent from "@/app/components/TableComponent";
import { useToast } from "@/components/ui/use-toast";
import ActionButton from "@/app/components/ui/Button";
import { IndicatorContext } from "@/app/components/provider";
import DeleteUser from "./DeleteUser";
import AddUser from "./AddUser";
import EditUser from "./EditUser";

const ROLES = [
    "Admin",
    "Read-Write",
    "Read-Only"
];

// Shows the details of a current database connection 
export default function Users() {

    const [users, setUsers] = useState<User[]>([]);
    const [rows, setRows] = useState<Row[]>([]);
    const { toast } = useToast();
    const { setIndicator } = useContext(IndicatorContext);

    useEffect(() => {
        (async () => {
            const result = await securedFetch("api/user", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, toast, setIndicator);

            if (result.ok) {
                const data = await result.json();
                setUsers(data.result.map((user: User) => ({ ...user, selected: false })));
                setRows(data.result.map(({ username, role, keys }: { username: string, role: string, keys: string }): Row => ({
                    name: username,
                    cells: [{
                        value: username,
                        type: "readonly"
                    }, {
                        value: role,
                        type: "readonly",
                    }, {
                        value: keys || "*",
                        type: "readonly"
                    }],
                    checked: false,
                })));
            }
        })();
    }, [toast, setIndicator]);

    const handleSaveUsers = async () => {
        const response = await securedFetch('/api/user/save', {
            method: 'POST',
        }, toast, setIndicator);

        if (response.ok) {
            toast({
                title: "Success",
                description: "Users saved to disk",
            });
        }
    };

    const handleAddUser = async ({ username, password, role }: CreateUser, keys: string) => {
        const response = await securedFetch('/api/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role, keys })
        }, toast, setIndicator);

        if (response.ok) {
            toast({
                title: "Success",
                description: "User added successfully",
            });
            setUsers(prev => [...prev, { username, role, selected: false }]);
            setRows(prev => [...prev, {
                name: username,
                cells: [{
                    value: username,
                    type: "readonly"
                }, {
                    value: role,
                    type: "readonly",
                }, {
                    value: keys || "*",
                    type: "readonly"
                }],
                checked: false,
            }] as Row[]);
        }
    };

    const handleEditUser = async (username: string, role: string, keys: string, password?: string) => {
        const result = await securedFetch(`api/user/${prepareArg(username)}`, {
            method: 'PATCH',
            body: JSON.stringify({ role, keys, password })
        }, toast, setIndicator);

        if (result.ok) {
            setUsers(prev => prev.map(u => u.username === username ? { ...u, role, keys: keys || "*" } : u));
            setRows(prev => prev.map((row): Row => row.cells[0].value === username ? { ...row, cells: [row.cells[0], { ...row.cells[1], value: role }, { ...row.cells[2], value: keys || "*" }] } : row));
            toast({
                title: "Success",
                description: `${username} updated successfully`,
            });
        }

        return result.ok;
    };

    const checkedRows = rows.filter(row => row.checked);
    const selectedUserData = checkedRows.length === 1 ? {
        username: checkedRows[0].cells[0].value as string,
        role: checkedRows[0].cells[1].value as string,
        keys: checkedRows[0].cells[2].value as string,
    } : null;

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-foreground">Users</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {users.length} {users.length === 1 ? "user" : "users"}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">
                    Manage users, roles, and key/graph permissions for this database.
                </p>
            </div>
            <div className="flex-1 min-h-0 rounded-lg border border-border bg-background p-4">
                <TableComponent
                    label="Users"
                    entityName="User"
                    headers={["Name", "Role", "Key / Graph Permissions"]}
                    rows={rows}
                    setRows={setRows}
                    itemHeight={40}
                >
                    <div className="flex flex-row-reverse gap-2">
                        <AddUser onAddUser={handleAddUser} />
                        <EditUser
                            username={selectedUserData?.username || ""}
                            role={selectedUserData?.role || ""}
                            keys={selectedUserData?.keys || "*"}
                            onEditUser={handleEditUser}
                            disabled={!selectedUserData || selectedUserData.username === "default"}
                        />
                        <DeleteUser users={rows.filter(row => row.checked && row.cells[0].value !== "default").map(row => users.find(user => user.username === row.cells[0].value)!)} setUsers={setUsers} setRows={setRows} />
                        <ActionButton
                            variant="Secondary"
                            label="Save Users"
                            title="Save users to disk"
                            className="px-4 py-[10px]"
                            onClick={handleSaveUsers}
                        >
                            <Save size={20} />
                        </ActionButton>
                    </div>
                </TableComponent>
            </div>
        </div >
    );
}