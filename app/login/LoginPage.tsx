"use client";

import { SignInResponse, signIn, useSession } from "next-auth/react";
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

const LOOKUP_FAILED =
  "Could not read the preconfigured connection. Check the server logs, or log in manually below.";

// A hung lookup must not hold the login form hostage.
const LOOKUP_TIMEOUT_MS = 5000;

export default function LoginPage() {
  const { theme } = useTheme();
  const { currentTheme } = getTheme(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [mounted, setMounted] = useState(false);
  const [initialHost, setInitialHost] = useState("");
  const [initialPort, setInitialPort] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [initialTLS, setInitialTLS] = useState(false);
  // Undefined until the lookup settles, so the form never flashes before an
  // automatic login takes over.
  const [preconfigured, setPreconfigured] = useState<PreconfiguredConnectionInfo | undefined>();
  const [autoConnectError, setAutoConnectError] = useState("");
  const [lookupError, setLookupError] = useState("");
  const autoConnectAttempt = useRef<Promise<SignInResponse | undefined> | null>(null);

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

    // A failed lookup is reported rather than read as "nothing configured": an
    // operator who did configure a connection would otherwise be left staring
    // at an empty form with no idea why.
    const reportFailure = (message: string) => {
      setLookupError(message);
      setPreconfigured({ configured: false, autoConnect: false });
    };

    const lookup = async () => {
      try {
        const res = await fetch("/api/connections/preconfigured", {
          signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { message?: unknown } | null;
          if (active) reportFailure(typeof body?.message === "string" ? body.message : LOOKUP_FAILED);
          return;
        }

        const info = (await res.json()) as PreconfiguredConnectionInfo;
        if (active) setPreconfigured(info);
      } catch {
        // Only the route's own message names something an operator can act on.
        // A throw here is the timeout or the network, and "The operation was
        // aborted" would send them looking in the wrong place.
        if (active) reportFailure(LOOKUP_FAILED);
      }
    };

    void lookup();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // LoginVerification only redirects an authenticated visitor to /graph, it
    // does not stop rendering this page — so signing in here would race that
    // redirect and open a second session.
    if (status !== "unauthenticated") return undefined;
    if (!preconfigured?.autoConnect || signedOut || hasConnectionParams) return undefined;

    // StrictMode replays this effect in development. Reuse the attempt already
    // in flight, so the replay still handles the response instead of leaving
    // the page on the spinner forever.
    autoConnectAttempt.current ??= signIn("credentials", { redirect: false, preconfigured: "true" });

    // The sign-in can outlive this effect — the user may navigate away or add
    // explicit connection params while it is in flight, and a late redirect
    // would override that.
    let active = true;

    autoConnectAttempt.current
      .then((res) => {
        if (!active) return;
        if (res?.error) {
          setAutoConnectError(AUTO_CONNECT_FAILED);
          return;
        }
        router.push("/graph");
      })
      .catch(() => {
        if (active) setAutoConnectError(AUTO_CONNECT_FAILED);
      });

    return () => {
      active = false;
    };
  }, [preconfigured, signedOut, hasConnectionParams, router, status]);

  useEffect(() => {
    const hostParam = searchParams.get("host");
    const portParam = searchParams.get("port");
    const usernameParam = searchParams.get("username");
    const tls = searchParams.get("tls");

    // Neither source needs decoding: URLSearchParams already decoded the query
    // params, and the preconfigured values are plain strings. Decoding again
    // corrupts a literal "%25" and throws URIError on a literal "%".
    setInitialHost(hostParam ?? preconfigured?.host ?? "");
    setInitialPort(portParam ?? (preconfigured?.port ? String(preconfigured.port) : ""));
    setInitialUsername(usernameParam ?? preconfigured?.username ?? "");
    setInitialTLS(tls !== null ? tls === "true" : preconfigured?.tls ?? false);
  }, [searchParams, preconfigured]);

  const handleLogin = async (credentials: LoginFormCredentials) => {
    const params: Record<string, unknown> & { redirect: false } = {
      redirect: false,
      host: credentials.host,
      port: credentials.port,
      tls: credentials.tls,
      ca: credentials.ca,
      cert: credentials.cert,
      key: credentials.key,
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
  // A visit that suppresses auto-connect wants the form, so it never waits.
  const autoConnectPossible = !signedOut && !hasConnectionParams;
  const connecting =
    !autoConnectError &&
    autoConnectPossible &&
    (status !== "unauthenticated" || preconfigured === undefined || preconfigured.autoConnect);

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="grow basis-0 min-h-0 flex items-center justify-center">
        <div className="flex flex-col gap-2 items-center max-h-full min-h-0 w-[500px] mobile:w-full mobile:max-w-[500px] mobile:px-4">
          {mounted && currentTheme && <Image className="h-20 short:h-14 w-auto shrink-0" priority src={`/icons/Browser-${currentTheme}.svg`} alt="FalkorDB Browser Logo" width={0} height={0} />}
          {/* Only the form scrolls, so the logo and the docs link stay put on a short viewport. */}
          <div className="w-full min-h-0 overflow-y-auto flex flex-col gap-2 px-1">
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
                {lookupError && (
                  <p className="text-sm text-center text-red-500" data-testid="loginPreconfiguredError">
                    {lookupError}
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
