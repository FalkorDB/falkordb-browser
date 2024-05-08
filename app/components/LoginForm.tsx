"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignInOptions, SignInResponse, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import Dropzone from "@/components/custom/Dropzone";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

export default function LoginForm() {
  const userPlaceholder = "(Optional)"
  const router = useRouter();
  const [error, setError] = useState<boolean>();
  const [host, setHost] = useState(DEFAULT_HOST);
  const [port, setPort] = useState(DEFAULT_PORT);
  const [TLS, setTLS] = useState(false);
  const [CA, setCA] = useState<string>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const hostParam = searchParams.get("host");
    const portParam = searchParams.get("port");
    const usernameParam = searchParams.get("username");
    const tls = searchParams.get("tls");

    setHost(decodeURIComponent(hostParam ?? DEFAULT_HOST));
    setPort(decodeURIComponent(portParam ?? DEFAULT_PORT));
    setUsername(decodeURIComponent(usernameParam ?? ""));
    setTLS(tls === "true")
  }, [searchParams]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const params: SignInOptions = {
      redirect: false,
      host: host ?? DEFAULT_HOST,
      port: port ?? DEFAULT_PORT,
      tls: TLS,
      ca: CA
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
          placeholder={userPlaceholder}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder={userPlaceholder}
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
      </div>
      <div className="space-x-2">
        <Checkbox
          defaultChecked={false}
          checked={TLS}
          onCheckedChange={(checked) => setTLS(checked as boolean)}
        />
        <Label htmlFor="TLS">TLS</Label>
      </div>
      <div className="border border-separate text-center w-2/3">
        <Dropzone onFileDrop={setCA} disabled={!TLS} />
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
  );
}
