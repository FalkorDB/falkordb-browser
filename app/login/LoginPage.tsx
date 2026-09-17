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
      <div className="grow basis-0 min-h-0 flex items-center justify-center">
        <div className="flex flex-col gap-2 items-center max-h-full min-h-0 w-[500px] mobile:w-full mobile:max-w-[500px] mobile:px-4">
          {mounted && currentTheme && <Image className="h-20 short:h-14 w-auto shrink-0" priority src={`/icons/Browser-${currentTheme}.svg`} alt="FalkorDB Browser Logo" width={0} height={0} />}
          {/* Only the form scrolls, so the logo and the docs link stay put on a short viewport. */}
          <div className="w-full min-h-0 overflow-y-auto flex flex-col gap-2 px-1">
            <LoginForm
              onSubmit={handleLogin}
              submitButtonLabel="Log in"
              initialHost={initialHost}
              initialPort={initialPort}
              initialUsername={initialUsername}
              initialTLS={initialTLS}
            />
          </div>
          <Link
            href="/docs"
            className="shrink-0 flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors duration-200"
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
