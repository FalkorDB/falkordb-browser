"use client";

import { SignInOptions, SignInResponse, signIn } from "next-auth/react";
import { FormEvent, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, Info, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "next-themes";
import { getTheme, securedFetch } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormComponent, { Field } from "../components/FormComponent";
import Dropzone from "../components/ui/Dropzone";
import { IndicatorContext } from "../components/provider";
import { useToast } from "@/components/ui/use-toast";
import { matchUrl, parseUrlString, validateUrl } from "../login/urlUtils";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

type LoginMode = "manual" | "url";

const handlePortIsNumber = (value: string) => !/^\d+$/.test(value);

const handleIsPortFormat = (value: string) => {
  const port = Number(value);

  return !(port >= 1 && port <= 65535);
};

const handleIsPortValid = (value: string) => value.startsWith("0");

const getPortErrors = (func?: (value: string) => string) => {
  const getValue = (v: string) => func ? func(v) : v;  

  return [
    {
      condition: (value: string) => { console.log(getValue(value)); return getValue(value) !== "" && handlePortIsNumber(getValue(value)) },
      message: "Port must be a number"
    },
    {
      condition: (value: string) => getValue(value) !== "" && !handlePortIsNumber(getValue(value)) && handleIsPortFormat(getValue(value)),
      message: "Port must be a number between 1 and 65535"
    },
    {
      condition: (value: string) => getValue(value) !== "" && !handlePortIsNumber(getValue(value)) && handleIsPortValid(getValue(value)),
      message: "Invalid port format (port can't start with 0)"
    }
  ]
}

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// Parse a URL string and update shared state
const parseUrl = (url: string) => {
  debugger;
  const match = matchUrl(url);
  let parsed: ReturnType<typeof parseUrlString>;

  if (match || !url) {
    const [, protocol = "", u = "", p = "", h = "", pt = ""] = match || [];
    parsed = {
      protocol: protocol,
      username: safeDecode(u),
      password: safeDecode(p),
      host: h,
      port: pt,
      tls: protocol === "falkors" || protocol === "rediss",
    };
  } else {
    parsed = parseUrlString(url);
  }

  return parsed;
};

export default function LoginForm() {
  const { theme } = useTheme();
  const { currentTheme } = getTheme(theme);
  const router = useRouter();
  const { toast } = useToast();
  const { setIndicator } = useContext(IndicatorContext);

  const [mounted, setMounted] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("manual");
  const [missingFields, setMissingFields] = useState(false);
  const [rawUrl, setRawUrl] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [TLS, setTLS] = useState(false);
  const [CA, setCA] = useState<string>();
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [error, setError] = useState<{
    message: React.ReactNode
    show: boolean
  }>({
    message: "",
    show: false
  });

  const searchParams = useSearchParams();

  // Build a display URL from the shared state
  const buildUrl = () => {
    if (!host && !port && !username && !password) return "";
    const h = host || DEFAULT_HOST;
    const protocol = TLS ? "falkors" : "falkor";
    const creds = username || password
      ? `${encodeURIComponent(username || "")}${password ? `:${encodeURIComponent(password)}` : ""}@`
      : "";
    return `${protocol}://${creds}${h}${port ? `:${port}` : ""}`;
  };

  const clearError = () => setError({ message: "", show: false });

  const userInputFields: Field[] = [{
    value: username,
    onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
      clearError();

      return true;
    },
    label: "Username",
    placeholder: "Default",
    info: "You can skip entering your username when deploying a FalkorDB instance \n from localhost with default credentials.",
    type: "text",
    required: false
  },
  {
    value: password,
    onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      clearError();

      return true;
    },
    label: "Password",
    placeholder: "Default",
    info: "You can skip entering your password when deploying a FalkorDB instance \n from localhost with default credentials.",
    type: "password",
    required: false
  }];

  const urlFields: Field[] = !missingFields ? [{
    value: rawUrl,
    onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const parsed = parseUrl(val);

      setHost(parsed.host);
      setPort(parsed.port);
      setUsername(parsed.username);
      setPassword(parsed.password);
      setTLS(parsed.tls);
      setRawUrl(val);

      clearError();

      return true;
    },
    errors: [
      ...getPortErrors((value) => parseUrl(value).port)
    ],
    label: "FalkorDB URL",
    type: "text",
    placeholder: `falkor://Default:Default@${DEFAULT_HOST}:${DEFAULT_PORT}`,
    required: true
  }] : userInputFields;

  const fields: Field[] = loginMode === "url" ?
    urlFields
    : [
      {
        value: host,
        onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
          setHost(e.target.value);
          clearError();

          return true;
        },
        label: "Host",
        type: "text",
        placeholder: DEFAULT_HOST,
        required: true
      },
      {
        value: port,
        onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
          setPort(e.target.value);
          clearError();

          return true;
        },
        errors: [...getPortErrors()],
        label: "Port",
        type: "text",
        placeholder: DEFAULT_PORT,
        required: true
      },
      ...userInputFields
    ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const hostParam = searchParams.get("host");
    const portParam = searchParams.get("port");
    const usernameParam = searchParams.get("username");
    const tls = searchParams.get("tls");

    setHost(decodeURIComponent(hostParam || ""));
    setPort(decodeURIComponent(portParam || ""));
    setUsername(decodeURIComponent(usernameParam ?? ""));
    setTLS(tls === "true");
  }, [searchParams]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Pre-submit validation for URL mode — show colored format errors
    if (loginMode === "url") {
      let url = rawUrl || "falkor://localhost:6379";
      
      if (missingFields) {
        url = buildUrl();
      }
      
      const result = await securedFetch("/api/validate-url", {
        method: "POST",
        body: JSON.stringify({ url })
      }, toast, setIndicator);

      if (!result.ok) return

      const json = await result.json();

      if (json.result) {
        setMissingFields(true);
        return;
      }

      const res = validateUrl(url);
      const { parts } = res;

      if (!res.valid) {
        const good = (text: string) => <span className="text-green-500 font-semibold">{text}</span>;
        const render = (text: string, status: "good" | "warn" | "neutral") => {
          if (status === "good") return good(text);
          return text;
        };

        // Protocol: [prefix[s]://]
        const protocolNode = render("[prefix[s]://]", parts.protocol);

        // Credentials block: [username[:password]@]
        let credsNode: React.ReactNode;
        if (parts.at === "good") {
          // @ is present — show each sub-part colored, brackets are green since @ is good
          const userNode = render("[username]", parts.username);
          const passNode = render("[:password]", parts.password);
          const atNode = good("@");
          credsNode = <>{good("[")}{userNode}{passNode}{atNode}{good("]")}</>;
        } else {
          credsNode = "[username[:password]@]";
        }

        // Host
        const hostNode = render("host", parts.host);

        // Port
        const portNode = render("[:port]", parts.port);

        setError({
          message:
            <span className="text-xs text-destructive">
              Invalid URL format. Expected: {protocolNode}{credsNode}{hostNode}{portNode}
            </span>
          ,
          show: true
        });
        return;
      }
    }

    const params: SignInOptions = {
      redirect: false,
    };

    // All modes use the shared state — always submit in manual format
    params.host = host.trim() || DEFAULT_HOST;
    params.port = port.trim() || DEFAULT_PORT;
    params.tls = TLS;
    params.ca = CA;
    if (username) {
      params.username = username;
    }
    if (password) {
      params.password = password;
    }

    signIn("credentials", params).then((res?: SignInResponse) => {
      if (res?.error) {
        setError({
          message: <p className="text-xs text-destructive">Invalid credentials please recheck username and password or your connection settings {loginMode === "url" ? <span className="text-green-700">[prefix[s]://][[username][:password]@]host[:port]</span> : null}</p>,
          show: true
        });
      } else {
        router.push("/graph");
      }
    });
  };

  const onFileDrop = (acceptedFiles: File[]) => {
    const reader = new FileReader();

    reader.onload = () => {
      clearError();
      setCA((reader.result as string).split(',').pop());
      setUploadedFileName(acceptedFiles[0].name);
    };

    reader.readAsDataURL(acceptedFiles[0]);
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="grow basis-0 flex items-center justify-center overflow-auto">
        <div className="flex flex-col gap-8 items-center max-h-full w-[500px]">
          {mounted && currentTheme && <Image style={{ width: 'auto', height: '80px' }} priority src={`/icons/Browser-${currentTheme}.svg`} alt="FalkorDB Browser Logo" width={0} height={0} />}

          {/* Login Mode Toggle */}
          <RadioGroup
            value={loginMode}
            onValueChange={(value) => {
              const mode = value as LoginMode;
              setLoginMode(mode);
              if (mode === "url") {
                setRawUrl(buildUrl());
              }
              clearError();
            }}
            className="flex items-center justify-center gap-8 p-4 border border-primary rounded-lg w-full"
          >
            <div className="grow basis-0 flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" />
              {/* Label is correctly associated via htmlFor, but eslint doesn't recognize Radix RadioGroupItem */}
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="manual" className="text-base font-medium cursor-pointer">Manual Configuration</label>
            </div>
            <div className="grow basis-0 flex items-center space-x-2">
              <RadioGroupItem value="url" id="url" />
              {/* Label is correctly associated via htmlFor, but eslint doesn't recognize Radix RadioGroupItem */}
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="url" className="text-base font-medium cursor-pointer">FalkorDB URL</label>
            </div>
          </RadioGroup>
          <FormComponent
            fields={fields}
            handleSubmit={onSubmit}
            error={error}
            submitButtonLabel="Log in"
          >
            {
              loginMode !== "url" &&
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    className="w-6 h-6 rounded-full bg-background border-primary data-[state=checked]:bg-primary"
                    checked={TLS}
                    onCheckedChange={(checked) => {
                      setTLS(checked as boolean);
                      clearError();
                      if (!checked) {
                        // Clear certificate when TLS is disabled
                        setCA(undefined);
                        setUploadedFileName("");
                      }
                    }}
                    data-testid="tls-checkbox"
                  />
                  <p className="font-medium text-foreground">TLS Secured Connection</p>
                </div>

                {/* Certificate Upload Section */}
                {TLS && (
                  <div id="tls-section" className="flex flex-col gap-3 p-4 bg-background border border-border rounded-lg transition-all duration-300 ease-in-out">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm font-semibold text-muted">Certificate Authentication</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!uploadedFileName ? (
                        // Upload State
                        <div className="relative">
                          <Dropzone title="Upload Certificate" onFileDrop={onFileDrop} disabled={!TLS} />
                          <div className="mt-2 text-xs text-muted/70 flex items-center gap-1">
                            <Info className="w-5 h-5" aria-label="Information icon" />
                            Upload your CA certificate file
                          </div>
                        </div>
                      ) : (
                        // Success State
                        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-md transition-all duration-300 ease-in-out" data-testid="certificate-uploaded-status">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <Check size={16} className="text-primary" />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">Certificate Uploaded</span>
                              <span className="text-xs text-muted truncate max-w-48">{uploadedFileName}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              clearError();
                              setCA(undefined);
                              setUploadedFileName("");
                            }}
                            className="flex-shrink-0 p-1 text-muted hover:text-foreground hover:bg-primary/20 rounded transition-colors duration-200"
                            title="Remove certificate"
                            data-testid="remove-certificate-btn"
                            aria-label="Remove certificate"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            }
          </FormComponent>
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