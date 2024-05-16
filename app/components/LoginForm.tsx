"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignInOptions, SignInResponse, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

export default function LoginForm() {
  const cnInput = "bg-white text-black rounded"
  const cnLabel = "text-[#ADAEC5]"
  const router = useRouter();
  const [error, setError] = useState(false);
  const [host, setHost] = useState(DEFAULT_HOST);
  const [port, setPort] = useState(DEFAULT_PORT);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const hostParam = searchParams.get("host");
    const portParam = searchParams.get("port");
    const usernameParam = searchParams.get("username");

    setHost(decodeURIComponent(hostParam ?? DEFAULT_HOST));
    setPort(decodeURIComponent(portParam ?? DEFAULT_PORT));
    setUsername(decodeURIComponent(usernameParam ?? ""));
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
    <div className="w-full h-full bg-[#191A39] flex flex-row justify-center items-center gap-10">
      <div>
        <Image width={218} height={62} src="FalkorDBLogin.png" alt="" />
      </div>
      <div className="w-[1px] h-full bg-gradient-to-b from-transparent to-transparent via-gray-500" />
      <form
        className="w-1/3 space-y-4 flex flex-col"
        onSubmit={onSubmit}
      >
        <Label className="text-xl text-white" title="Sign In" htmlFor="Sign In">Connect</Label>
        <div>
          <Label className={cn("", cnLabel)} title="host" htmlFor="host">host</Label>
          <Input
            className={cn("", cnInput)}
            id="server"
            type="text"
            onChange={(e) => setHost(e.target.value)}
            value={host}
          />
        </div>
        <div>
          <Label className={cn("", cnLabel)} title="port" htmlFor="port">Port</Label>
          <Input
            className={cn("", cnInput)}
            id="port"
            type="number"
            min={1}
            max={65535}
            onChange={(e) => setPort(e.target.value)}
            value={port}
          />
        </div>
        <div>
          <Label className={cn("", cnLabel)} title="username" htmlFor="username">User Name</Label>
          <Input
            className={cn("", cnInput)}
            id="username"
            type="text"
            placeholder={host === "localhost" ? "(Optional)" : undefined}
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>
        <div className="relative">
          <Label className={cn("", cnLabel)} title="password" htmlFor="password">Password</Label>
          <Button className="absolute top-6 right-2 p-0" title="Show Password" onClick={() => setShowPassword(prev => !prev)}>
            <Eye strokeWidth={0.5} className="text-black" />
          </Button>
          <Input
            className={cn("", cnInput)}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={host === "localhost" ? "(Optional)" : undefined}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <Button className="bg-[#5D5FEF] text-white" type="submit">Connect</Button>
        {error && (
          <div className="bg-red-400 text-center p-2 rounded-lg">
            <p>Wrong credentials</p>
          </div>
        )}
      </form>
    </div>
  );
}
