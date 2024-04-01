'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SignInOptions, SignInResponse, signIn } from "next-auth/react"
import { FormEvent, useRef, useState } from "react"
import { useRouter } from "next/navigation"

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = '6379';

export default function Page() {

    const router = useRouter()
    const [error, setError] = useState(false)

    const host = useRef<HTMLInputElement>(null);
    const port = useRef<HTMLInputElement>(null);
    const username = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        const params: SignInOptions = {
            redirect: false,
            host: host.current?.value ?? DEFAULT_HOST,
            port: port.current?.value ?? DEFAULT_PORT,
        }
        if (username.current) {
            params.username = username.current.value;
        }
        if (password.current) {
            params.password = password.current.value;
        }

        signIn(
            "credentials",
            params
        ).then((res?: SignInResponse) => {
            if (res && res.error) {
                setError(true)
            } else {
                router.push('/graph');
            }

        })
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form className="p-5 w-1/2 space-y-4 border rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col" onSubmit={onSubmit}>
                <div>
                    <Label htmlFor="server">Server</Label>
                    <Input ref={host} id="server" placeholder={DEFAULT_HOST} type="text" defaultValue={DEFAULT_HOST} />
                </div>
                <div>
                    <Label htmlFor="port">Port</Label>
                    <Input ref={port} id="port" placeholder={DEFAULT_PORT} type="number" min={1} max={65535} defaultValue={DEFAULT_PORT} />
                </div>
                <div>
                    <Label htmlFor="username">User Name</Label>
                    <Input ref={username} id="username" type="text" placeholder="(Optional)" />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input ref={password} id="password" type="password" placeholder="(Optional)" />
                </div>
                <div className="flex justify-center p-4">
                    <Button type="submit">Connect</Button>
                </div>
                {error &&
                    <div className="bg-red-400 text-center p-2 rounded-lg">
                        <p>Wrong credentials</p>
                    </div>
                }
            </form>
        </div>
    )
}