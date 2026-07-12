"use client";

import { FormEvent, useContext, useEffect, useState } from "react";
import { Check, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormComponent, { Field } from "../components/FormComponent";
import Dropzone from "../components/ui/Dropzone";
import { IndicatorContext } from "../components/provider";
import { useToast } from "@/components/ui/use-toast";
import { securedFetch } from "@/lib/utils";
import { matchUrl, parseUrlString, validateUrl } from "./urlUtils";

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
      condition: (value: string) => getValue(value) !== "" && handlePortIsNumber(getValue(value)),
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

const parseUrl = (url: string) => {
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

export interface LoginFormCredentials {
  host: string;
  port: string;
  username: string;
  password: string;
  tls: boolean;
  ca?: string;
}

interface LoginFormProps {
  onSubmit: (credentials: LoginFormCredentials) => Promise<void>;
  submitButtonLabel?: string;
  /** Pre-fill values (e.g. from URL search params) */
  initialHost?: string;
  initialPort?: string;
  initialUsername?: string;
  initialTLS?: boolean;
}

export default function LoginForm({
  onSubmit,
  submitButtonLabel = "Log in",
  initialHost = "",
  initialPort = "",
  initialUsername = "",
  initialTLS = false,
}: LoginFormProps) {
  const { toast } = useToast();
  const { setIndicator } = useContext(IndicatorContext);

  const [loginMode, setLoginMode] = useState<LoginMode>("manual");
  const [missingFields, setMissingFields] = useState(false);
  const [rawUrl, setRawUrl] = useState("");
  const [host, setHost] = useState(initialHost);
  const [port, setPort] = useState(initialPort);
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [TLS, setTLS] = useState(initialTLS);
  const [CA, setCA] = useState<string>();
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  useEffect(() => {
    setHost(initialHost);
    setPort(initialPort);
    setUsername(initialUsername);
    setTLS(initialTLS);
  }, [initialHost, initialPort, initialUsername, initialTLS]);
  const [error, setError] = useState<{
    message: React.ReactNode
    show: boolean
  }>({
    message: "",
    show: false
  });

  const buildUrl = ({ host: h, port: p, username: u, password: pw, TLS: tls }: { host?: string, port?: string, username?: string, password?: string, TLS?: boolean }) => {
    if (!h && !p && !u && !pw) return "";
    const hostVal = h || DEFAULT_HOST;
    const protocol = tls ? "falkors" : "falkor";
    const creds = u || pw
      ? `${encodeURIComponent(u || "")}${pw ? `:${encodeURIComponent(pw)}` : ""}@`
      : "";
    return `${protocol}://${creds}${hostVal}${p ? `:${p}` : ""}`;
  };

  const clearError = () => setError({ message: "", show: false });

  const userInputFields: Field[] = [{
    value: username,
    onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
      setRawUrl(buildUrl({ host, port, username: e.target.value, password, TLS }));
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
      setRawUrl(buildUrl({ host, port, username, password: e.target.value, TLS }));
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
          setRawUrl(buildUrl({ host: e.target.value, port, username, password, TLS }));
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
          setRawUrl(buildUrl({ host, port: e.target.value, username, password, TLS }));
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Pre-submit validation for URL mode
    if (loginMode === "url") {
      const parsed = parseUrl(rawUrl);
      const proto = parsed.protocol || "falkor";
      const h = parsed.host || DEFAULT_HOST;
      const p = parsed.port || DEFAULT_PORT;
      const creds = parsed.username || parsed.password
        ? `${encodeURIComponent(parsed.username)}${parsed.password ? `:${encodeURIComponent(parsed.password)}` : ""}@`
        : "";
      const url = `${proto}://${creds}${h}:${p}`;

      setRawUrl(url);
      setPort(p);
      setHost(h);

      if (parsed.username) {
        setUsername(parsed.username);
      }

      if (parsed.password) {
        setPassword(parsed.password);
      }

      const result = await securedFetch("/api/validate-url", {
        method: "POST",
        body: JSON.stringify({ url })
      }, toast, setIndicator);

      if (!result.ok) return;

      const json = await result.json();

      if (json.result) {
        setMissingFields(true);
        return;
      }

      const res = validateUrl(rawUrl || url);
      const { parts } = res;

      if (!res.valid) {
        const good = (text: string) => <span className="text-green-500 font-semibold">{text}</span>;
        const render = (text: string, status: "good" | "warn" | "neutral") => {
          if (status === "good") return good(text);
          return text;
        };

        const protocolNode = render("[prefix[s]://]", parts.protocol);

        let credsNode: React.ReactNode;
        if (parts.at === "good") {
          const userNode = render("[username]", parts.username);
          const passNode = render("[:password]", parts.password);
          const atNode = good("@");
          credsNode = <>{good("[")}{userNode}{passNode}{atNode}{good("]")}</>;
        } else {
          credsNode = "[username[:password]@]";
        }

        const hostNode = render("host", parts.host);
        const portNode = render("[:port]", parts.port);

        setError({
          message:
            <span className="text-xs text-destructive">
              Invalid URL format. Expected: {protocolNode}{credsNode}{hostNode}{portNode}
            </span>,
          show: true
        });
        return;
      }
    }

    try {
      await onSubmit({
        host: host.trim() || DEFAULT_HOST,
        port: port.trim() || DEFAULT_PORT,
        username,
        password,
        tls: TLS,
        ca: CA,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError({ message: <p className="text-xs text-destructive">{msg}</p>, show: true });
    }
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
    <>
      {/* Login Mode Toggle */}
      <RadioGroup
        value={loginMode}
        onValueChange={(value) => {
          const mode = value as LoginMode;
          setLoginMode(mode);
          setMissingFields(false);
          if (mode === "url") {
            setRawUrl(buildUrl({ host, port, username, password, TLS }));
          }
          clearError();
        }}
        className="flex items-center justify-center gap-8 p-4 border border-primary rounded-lg w-full"
      >
        <div className="grow basis-0 flex items-center space-x-2">
          <RadioGroupItem value="manual" id="manual" />
          <label htmlFor="manual" className="text-base font-medium cursor-pointer">Manual Configuration</label>
        </div>
        <div className="grow basis-0 flex items-center space-x-2">
          <RadioGroupItem value="url" id="url" />
          <label htmlFor="url" className="text-base font-medium cursor-pointer">FalkorDB URL</label>
        </div>
      </RadioGroup>
      <FormComponent
        fields={fields}
        handleSubmit={handleSubmit}
        error={error}
        submitButtonLabel={submitButtonLabel}
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
                  setRawUrl(buildUrl({ host, port, username, password, TLS: checked as boolean }));
                  clearError();
                  if (!checked) {
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
                    <div className="relative">
                      <Dropzone title="Upload Certificate" onFileDrop={onFileDrop} disabled={!TLS} />
                      <div className="mt-2 text-xs text-muted/70 flex items-center gap-1">
                        <Info className="w-5 h-5" aria-label="Information icon" />
                        Upload your CA certificate file
                      </div>
                    </div>
                  ) : (
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
    </>
  );
}
