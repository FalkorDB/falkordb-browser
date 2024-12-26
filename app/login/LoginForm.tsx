"use client";

import { SignInOptions, SignInResponse, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Dropzone from "@/app/components/ui/Dropzone";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye } from "lucide-react";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Image from "next/image";
import { cn } from "@/lib/utils";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [TLS, setTLS] = useState(false);
  const [CA, setCA] = useState<string>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const hostParam = searchParams.get("host");
    const portParam = searchParams.get("port");
    const usernameParam = searchParams.get("username");
    const tls = searchParams.get("tls");

    setHost(decodeURIComponent(hostParam || ""));
    setPort(decodeURIComponent(portParam || ""));
    setUsername(decodeURIComponent(usernameParam ?? ""));
    setTLS(tls === "true")
  }, [searchParams]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const params: SignInOptions = {
      redirect: false,
      host: host.trim(),
      port: port.trim(),
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
      if (res?.error) {
        setError(true);
      } else {
        router.push("/graph");
      }
    });
  };

  const onFileDrop = (acceptedFiles: File[]) => {
    const reader = new FileReader()

    reader.onload = () => {
      setCA((reader.result as string).split(',').pop())
    }

    reader.readAsDataURL(acceptedFiles[0])
  }

  const onChangeSetError = (func: (val: string) => void, val: string) => {
    func(val);
    setError(false);
  }
  return (
    <div className="w-full h-full flex items-center justify-center gap-80 LoginForm">
      <Image priority src="/Logo.svg" alt="" width={451} height={126} />
      <form
        className="flex flex-col gap-4 p-2"
        onSubmit={onSubmit}
      >
        <p className="text-4xl text-white border-b border-slate-200 border-opacity-25 pb-6" title="Connect">Connect</p>
        <div className="flex flex-col gap-8">
          <div className="flex gap-6">
            <div className="grow flex flex-col gap-2">
              <p title="Host">* Host</p>
              <Input
                variant="Default"
                id="server"
                placeholder={DEFAULT_HOST}
                type="text"
                onChange={(e) => onChangeSetError(setHost, e.target.value)}
                value={host}
              />
            </div>
            <div className="w-1/3 flex flex-col gap-2">
              <p title="Port" >* Port</p>
              <Input
                variant="Default"
                id="port"
                placeholder={DEFAULT_PORT}
                min={1}
                max={65535}
                onChange={(e) => onChangeSetError(setPort, e.target.value)}
                value={port}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p title="User Name" >{host !== DEFAULT_HOST && "* "} User Name</p>
            <Input
              variant="Default"
              id="username"
              type="text"
              onChange={(e) => onChangeSetError(setUsername, e.target.value)}
              value={username}
            />
          </div>
          <div className="relative flex flex-col gap-2">
            <p title="Password">{host !== DEFAULT_HOST && "* "}Password</p>
            <Button
              className="absolute top-10 right-2 p-0"
              icon={<Eye strokeWidth={0.5} color="black" />}
              onClick={() => setShowPassword(prev => !prev)}
            />
            <Input
              id="password"
              variant="Default"
              type={showPassword ? "text" : "password"}
              onChange={(e) => onChangeSetError(setPassword, e.target.value)}
              value={password}
            />
          </div>
          <div className="flex gap-8">
            <div className="flex gap-2">
              <Checkbox
                className={cn("w-6 h-6 rounded-lg", !TLS && "border-white")}
                defaultChecked={false}
                checked={TLS}
                onCheckedChange={(checked) => setTLS(checked as boolean)}
              />
              <p >TLS Secured Connection</p>
            </div>
            <Dropzone onFileDrop={onFileDrop} disabled={!TLS} />
          </div>
          <Button
            label="Connect"
            variant="Large"
            type="submit"
          />
          {error && (
            <div className="bg-red-400 text-center p-2 rounded-lg">
              <p>Wrong credentials</p>
            </div>

          )}
        </div>
      </form>
    </div >
  );
}
