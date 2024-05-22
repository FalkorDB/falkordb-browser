"use client";

import { SignInOptions, SignInResponse, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Dropzone from "@/components/custom/Dropzone";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Eye } from "lucide-react";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

export default function LoginForm() {
  const inputCN = "p-2 border border-gray-300 rounded-lg"
  const pCN = "text-indigo-300 opacity-75"
  const router = useRouter();
  const [error, setError] = useState(false);
  const [host, setHost] = useState(DEFAULT_HOST);
  const [port, setPort] = useState(DEFAULT_PORT);
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

  const onFileDrop = (acceptedFiles: File[]) => {
    const reader = new FileReader()

    reader.onload = () => {
      setCA((reader.result as string).split(',').pop())
    }

    reader.readAsDataURL(acceptedFiles[0])
  }

  return (
    <div className="w-full h-full bg-[#191A39] flex flex-row justify-center items-center gap-40">
      <div>
        <Image width={218} height={62} src="FalkorDBLogin.png" alt="" />
      </div>
      <div className="w-[1px] h-full bg-gradient-to-b from-transparent to-transparent via-gray-500" />
      <form
        className="w-1/3 flex flex-col gap-4 p-8"
        onSubmit={onSubmit}
      >
        <p className="text-xl text-white" title="Connect">Connect</p>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p title="Host" className={pCN} >host</p>
            <input
              className={inputCN}
              id="server"
              type="text"
              onChange={(e) => setHost(e.target.value)}
              value={host}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p title="Port" className={pCN} >Port</p>
            <input
              className={inputCN}
              id="port"
              placeholder={DEFAULT_PORT}
              min={1}
              max={65535}
              onChange={(e) => setPort(e.target.value)}
              value={port}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p title="User Name" className={pCN} >User Name</p>
            <input
              className={inputCN}
              id="username"
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          <div className="relative flex flex-col gap-2">
            <p title="Password" className={pCN} >Password</p>
            <button
              className="absolute top-10 right-2 p-0"
              title="Show Password"
              type="button"
              aria-label="Show Password"
              onClick={() => setShowPassword(prev => !prev)}
            >
              <Eye strokeWidth={0.5} />
            </button>
            <input
              className={inputCN}
              id="password"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <div className="flex flex-row gap-8">
            <div className="flex flex-row gap-2">
              <Checkbox
                className="w-6 h-6 rounded-lg bg-white"
                defaultChecked={false}
                checked={TLS}
                onCheckedChange={(checked) => setTLS(checked as boolean)}
              />
              <p className={pCN} >TLS Secured Connection</p>
            </div>
            <Dropzone onFileDrop={onFileDrop} disabled={!TLS} />
          </div>
          <button
            className="w-full bg-indigo-600 p-4 rounded-lg mt-14"
            title="Connect"
            type="submit"
          >
            <p className="text-white">CONNECT</p>
          </button>
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
