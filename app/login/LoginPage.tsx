"use client";

import { SignInResponse, signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useTheme } from "next-themes";
import { getTheme } from "@/lib/utils";
import type { PreconfiguredConnectionInfo } from "@/lib/preconfiguredConnection";
import Spinning from "@/app/components/ui/spinning";
import LoginForm, { LoginFormCredentials } from "./LoginForm";

const AUTO_CONNECT_FAILED =
  "Could not connect with the preconfigured connection. Check the FALKORDB_* environment variables and the server logs, or log in manually below.";

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
  // Undefined until the lookup settles, so the form never flashes before an
  // automatic login takes over.
  const [preconfigured, setPreconfigured] = useState<PreconfiguredConnectionInfo | undefined>();
  const [autoConnectError, setAutoConnectError] = useState("");
  const autoConnectStarted = useRef(false);

  // An explicit logout must not be undone by the next automatic login.
  const signedOut = searchParams.get("signedOut") === "true";
  // Connection params in the URL are a deliberate request for a different
  // instance, so they outrank the preconfigured connection.
  const hasConnectionParams =
    searchParams.get("host") !== null ||
    searchParams.get("port") !== null ||
    searchParams.get("username") !== null ||
    searchParams.get("tls") !== null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/connections/preconfigured")
      .then((res) => (res.ok ? res.json() : { configured: false, autoConnect: false }))
      .catch(() => ({ configured: false, autoConnect: false }))
      .then((info: PreconfiguredConnectionInfo) => {
        if (active) setPreconfigured(info);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!preconfigured?.autoConnect || signedOut || hasConnectionParams) return;
    // StrictMode invokes effects twice in development; one login attempt is enough.
    if (autoConnectStarted.current) return;
    autoConnectStarted.current = true;

    signIn("credentials", { redirect: false, preconfigured: "true" })
      .then((res) => {
        if (res?.error) {
          setAutoConnectError(AUTO_CONNECT_FAILED);
          return;
        }
        router.push("/graph");
      })
      .catch(() => setAutoConnectError(AUTO_CONNECT_FAILED));
  }, [preconfigured, signedOut, hasConnectionParams, router]);

  useEffect(() => {
    const hostParam = searchParams.get("host");
    const portParam = searchParams.get("port");
    const usernameParam = searchParams.get("username");
    const tls = searchParams.get("tls");

    setInitialHost(decodeURIComponent(hostParam ?? preconfigured?.host ?? ""));
    setInitialPort(decodeURIComponent(portParam ?? (preconfigured?.port ? String(preconfigured.port) : "")));
    setInitialUsername(decodeURIComponent(usernameParam ?? preconfigured?.username ?? ""));
    setInitialTLS(tls !== null ? tls === "true" : preconfigured?.tls ?? false);
  }, [searchParams, preconfigured]);

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

  // Either the lookup has not settled yet, or it has and an automatic login is
  // on its way — both mean the form would only flash before being replaced.
  const connecting =
    !autoConnectError &&
    (preconfigured === undefined ||
      (preconfigured.autoConnect && !signedOut && !hasConnectionParams));

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="grow basis-0 flex items-center justify-center overflow-auto">
        <div className="flex flex-col gap-2 items-center max-h-full w-[500px]">
          {mounted && currentTheme && <Image style={{ width: 'auto', height: '80px' }} priority src={`/icons/Browser-${currentTheme}.svg`} alt="FalkorDB Browser Logo" width={0} height={0} />}
          {connecting ? (
            <div className="flex flex-col gap-4 items-center py-10" data-testid="loginAutoConnecting">
              <Spinning />
              <p className="text-sm text-muted">Connecting…</p>
            </div>
          ) : (
            <>
              {autoConnectError && (
                <p className="text-sm text-center text-red-500" data-testid="loginAutoConnectError">
                  {autoConnectError}
                </p>
              )}
              <LoginForm
                onSubmit={handleLogin}
                submitButtonLabel="Log in"
                initialHost={initialHost}
                initialPort={initialPort}
                initialUsername={initialUsername}
                initialTLS={initialTLS}
              />
            </>
          )}
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
