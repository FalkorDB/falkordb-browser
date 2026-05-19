"use client";

import { SignInResponse, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useTheme } from "next-themes";
import { getTheme } from "@/lib/utils";
import LoginForm, { LoginFormCredentials } from "./LoginForm";

export default function LoginPage() {
  const { theme } = useTheme();
  const { currentTheme } = getTheme(theme);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [initialHost, setInitialHost] = useState("");
  const [initialPort, setInitialPort] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [initialTLS, setInitialTLS] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const hostParam = searchParams.get("host");
    const portParam = searchParams.get("port");
    const usernameParam = searchParams.get("username");
    const tls = searchParams.get("tls");

    setInitialHost(decodeURIComponent(hostParam || ""));
    setInitialPort(decodeURIComponent(portParam || ""));
    setInitialUsername(decodeURIComponent(usernameParam ?? ""));
    setInitialTLS(tls === "true");
  }, [searchParams]);

  const handleLogin = async (credentials: LoginFormCredentials) => {
    const params: Record<string, unknown> & { redirect: false } = {
      redirect: false,
      host: credentials.host,
      port: credentials.port,
      tls: credentials.tls,
      ca: credentials.ca,
    };

    if (credentials.username) {
      params.username = credentials.username;
    }
    if (credentials.password) {
      params.password = credentials.password;
    }

    const res: SignInResponse | undefined = await signIn("credentials", params);

    if (res?.error) {
      throw new Error("Invalid credentials please recheck username and password or your connection settings. Check server logs for more info.");
    }

    router.push("/graph");
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="grow basis-0 flex items-center justify-center overflow-auto">
        <div className="flex flex-col gap-2 items-center max-h-full w-[500px]">
          {mounted && currentTheme && <Image style={{ width: 'auto', height: '80px' }} priority src={`/icons/Browser-${currentTheme}.svg`} alt="FalkorDB Browser Logo" width={0} height={0} />}
          <LoginForm
            onSubmit={handleLogin}
            submitButtonLabel="Log in"
            initialHost={initialHost}
            initialPort={initialPort}
            initialUsername={initialUsername}
            initialTLS={initialTLS}
          />
          <Link
            href="/docs"
            className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors duration-200"
          >
            <FileText className="w-4 h-4" />
            API Documentation
          </Link>
        </div>
      </div>
      <div className="h-5 Gradient" />
    </div>
  );
}
