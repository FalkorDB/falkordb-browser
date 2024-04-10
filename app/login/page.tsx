"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignInOptions, SignInResponse, signIn } from "next-auth/react";
import { FormEvent, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

export default function Page() {
  const router = useRouter();
  const [error, setError] = useState(false);

  const [host, setHost] = useState(DEFAULT_HOST);
  const [port, setPort] = useState(DEFAULT_PORT);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const hostParam = searchParams.get("host");
    const portParam = searchParams.get("port");
    const usernameParam = searchParams.get("username");

    setHost(hostParam ?? DEFAULT_HOST);
    setPort(portParam ?? DEFAULT_PORT);
    setUsername(usernameParam ?? "");
  }, [searchParams]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    const params: SignInOptions = {
      redirect: false,
      host: host ?? DEFAULT_HOST,
      port: port ?? DEFAULT_PORT,
    };
    if (username) {
      params.username = username;
    }
    if (password) {
      params.password = password;
    }

    signIn("credentials", params).then((res?: SignInResponse) => {
      if (res && res.error) {
        setError(true);
      } else {
        router.push("/graph");
      }
    });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        className="p-5 w-1/2 space-y-4 border rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col"
        onSubmit={onSubmit}
      >
        <div>
          <Label htmlFor="server">Server</Label>
          <Input
            id="server"
            placeholder={DEFAULT_HOST}
            type="text"
            onChange={(e) => setHost(e.target.value)}
            value={host}
          />
        </div>
        <div>
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            placeholder={DEFAULT_PORT}
            type="number"
            min={1}
            max={65535}
            onChange={(e) => setPort(e.target.value)}
            value={port}
          />
        </div>
        <div>
          <Label htmlFor="username">User Name</Label>
          <Input
            id="username"
            type="text"
            placeholder="(Optional)"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="(Optional)"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div className="flex justify-center p-4">
          <Button type="submit">Connect</Button>
        </div>
        {error && (
          <div className="bg-red-400 text-center p-2 rounded-lg">
            <p>Wrong credentials</p>
          </div>
        )}
      </form>
    </div>
  );
}
