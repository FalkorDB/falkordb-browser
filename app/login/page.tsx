'use client'

import { CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormEvent } from "react"

export default function Page() {
    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        // Read the form data
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        console.log(formData);
    }

    return (
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="p-4">
                <CardTitle className="text-2xl font-semibold">Login FalkorDB server</CardTitle>
                <CardDescription className="text-gray-500">
                    Fill in the form below to login to your FalkorDB server.
                </CardDescription>
            </div>
            <div className="space-y-4 flex flex-col p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="server">Server</Label>
                        <Input id="server" placeholder="localhost" type="text" defaultValue="localhost" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input id="port" placeholder="6379" type="number" min={1} max={65535} defaultValue={6379} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">User Name</Label>
                        <Input id="username" type="text" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" />
                    </div>
                </div>
            </div>
            <div className="flex justify-end p-4">
                <Button type="submit">Connect</Button>
            </div>
        </form>
    )
}