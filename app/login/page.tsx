'use client'

import { CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Page() {
    const router = useRouter()
    return (
        <div className="flex justify-center mt-5" style={{ marginTop: '10%' }}>
            <div
                className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            >
                <form className="flex flex-col gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        signIn("credentials", { redirect: false });
                        router.push('/graph')
                    }}
                >
                    <div className=" p-4">
                        <CardTitle className="text-2xl font-semibold">Login FalkorDB server</CardTitle>
                        <CardDescription className="text-gray-500">
                            Fill in the form below to login to your FalkorDB server.
                        </CardDescription>
                    </div>
                    <div className="space-y-4 flex flex-col p-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="server">Server</Label>
                                <Input id="server" placeholder="localhost" type="text" defaultValue="localhost" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="port">Port</Label>
                                <Input id="port" placeholder="6379" type="number" min={1} max={65535} defaultValue={6379} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
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
                    <div className="flex justify-center p-4">
                        <Button type="submit">Connect</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}