"use client";

import { SignInOptions, SignInResponse, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import FormComponent from "../components/FormComponent";
import Dropzone from "../components/ui/Dropzone";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

export default function LoginForm() {
  const router = useRouter();
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [TLS, setTLS] = useState(false);
  const [CA, setCA] = useState<string>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{
    message: string
    show: boolean
  }>({
    message: "Invalid credentials",
    show: false
  });

  const searchParams = useSearchParams();
  const fields = [
    {
      value: host,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHost(e.target.value),
      label: "Host",
      type: "text",
      placeholder: DEFAULT_HOST,
      required: true
    },
    {
      value: port,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPort(e.target.value),
      label: "Port",
      type: "text",
      placeholder: DEFAULT_PORT,
      required: true
    },
    {
      value: username,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
      label: "Username",
      placeholder: "Default",
      info: "You can skip entering your username when deploying a FalkorDB instance \n from localhost with default credentials.",
      type: "text",
      required: false
    },
    {
      value: password,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
      label: "Password",
      placeholder: "Default",
      info: "You can skip entering your password when deploying a FalkorDB instance \n from localhost with default credentials.",
      type: "password",
      required: false
    }
  ];

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
        setError(prev => ({
          ...prev,
          show: true
        }))
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
    <div className="relative h-full w-full flex flex-col">
      <div className="grow flex items-center justify-center">
        <div className="flex flex-col gap-8 items-center">
          <Image priority src="/BrowserLogo.svg" alt="Loading..." width={500} height={1} />
          <FormComponent
            fields={fields}
            handleSubmit={onSubmit}
            error={error}
            submitButtonLabel="Log in"
          >
            <div className="flex gap-8">
              <div className="flex gap-2">
                <Checkbox
                  className={cn("w-6 h-6 rounded-lg", !TLS && "border-white")}
                  checked={TLS}
                  onCheckedChange={(checked) => setTLS(checked as boolean)}
                />
                <p >TLS Secured Connection</p>
              </div>
              <Dropzone onFileDrop={onFileDrop} disabled={!TLS} />
            </div>
          </FormComponent>
        </div>
      </div>
      <div className="h-5 Gradient" />
    </div>
  );
}
