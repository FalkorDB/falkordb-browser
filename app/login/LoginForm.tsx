"use client";

import { SignInOptions, SignInResponse, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "next-themes";
import { getTheme } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormComponent, { Field } from "../components/FormComponent";
import Dropzone from "../components/ui/Dropzone";
import Input from "../components/ui/Input";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

type LoginMode = "manual" | "url";

// Parse FalkorDB URL format: falkordb://[username]:[password]@host:port[/graph]
function parseFalkorDBUrl(url: string): {
  host: string;
  port: string;
  username?: string;
  password?: string;
  tls: boolean;
} | null {
  try {
    // Handle both falkordb:// and falkordb+tls:// protocols
    const isTLS = url.startsWith("falkordb+tls://");
    const cleanUrl = url.replace(/^falkordb(\+tls)?:\/\//, "");
    
    // Pattern: [username]:[password]@host:port[/graph]
    const match = cleanUrl.match(/^(?:([^:@]+)(?::([^@]+))?@)?([^:/]+)(?::(\d+))?/);
    
    if (!match) return null;
    
    const [, username, password, host, port] = match;
    
    return {
      host: host || DEFAULT_HOST,
      port: port || DEFAULT_PORT,
      username: username || undefined,
      password: password || undefined,
      tls: isTLS
    };
  } catch {
    return null;
  }
}

export default function LoginForm() {
  const { theme } = useTheme();
  const { currentTheme } = getTheme(theme)
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("manual");
  const [falkordbUrl, setFalkordbUrl] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [TLS, setTLS] = useState(false);
  const [CA, setCA] = useState<string>();
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
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
  const fields: Field[] = [
    {
      value: host,
      onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
        setHost(e.target.value)
        setError(prev => ({
          ...prev,
          show: false
        }))
        return true
      },
      label: "Host",
      type: "text",
      placeholder: DEFAULT_HOST,
      required: true
    },
    {
      value: port,
      onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
        setPort(e.target.value)
        setError(prev => ({
          ...prev,
          show: false
        }))
        return true
      },
      label: "Port",
      type: "text",
      placeholder: DEFAULT_PORT,
      required: true
    },
    {
      value: username,
      onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
        setError(prev => ({
          ...prev,
          show: false
        }))
        return true
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
        setPassword(e.target.value)
        setError(prev => ({
          ...prev,
          show: false
        }))
        return true
      },
      label: "Password",
      placeholder: "Default",
      info: "You can skip entering your password when deploying a FalkorDB instance \n from localhost with default credentials.",
      type: "password",
      required: false
    }
  ];

  useEffect(() => {
    setMounted(true)
  }, [])

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

    let connectionParams: {
      host: string;
      port: string;
      username?: string;
      password?: string;
      tls: boolean;
    };

    // Handle URL mode
    if (loginMode === "url") {
      const parsed = parseFalkorDBUrl(falkordbUrl);
      if (!parsed) {
        setError({
          message: "Invalid FalkorDB URL format. Expected: falkordb://[user:pass@]host:port",
          show: true
        });
        return;
      }
      connectionParams = parsed;
    } else {
      // Manual mode
      connectionParams = {
        host: host.trim(),
        port: port.trim(),
        username,
        password,
        tls: TLS
      };
    }

    const params: SignInOptions = {
      redirect: false,
      host: connectionParams.host,
      port: connectionParams.port,
      tls: connectionParams.tls,
      ca: CA
    };
    if (connectionParams.username) {
      params.username = connectionParams.username;
    }
    if (connectionParams.password) {
      params.password = connectionParams.password;
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
      setError(prev => ({
        ...prev,
        show: false
      }))
      setCA((reader.result as string).split(',').pop())
      setUploadedFileName(acceptedFiles[0].name)
      setError(prev => ({
        ...prev,
        show: false
      }))
    }

    reader.readAsDataURL(acceptedFiles[0])
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="grow flex items-center justify-center">
        <div className="flex flex-col gap-8 items-center">
          {mounted && currentTheme && <Image style={{ width: 'auto', height: '80px' }} priority src={`/icons/Browser-${currentTheme}.svg`} alt="FalkorDB Browser Logo" width={0} height={0} />}
          
          {/* Login Mode Toggle */}
          <RadioGroup
            value={loginMode}
            onValueChange={(value) => {
              setLoginMode(value as LoginMode);
              setError({ message: "Invalid credentials", show: false });
            }}
            className="flex items-center justify-center gap-8 p-4 border border-primary rounded-lg w-full"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="manual" className="text-base font-medium cursor-pointer">Manual Configuration</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="url" id="url" />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="url" className="text-base font-medium cursor-pointer">FalkorDB URL</label>
            </div>
          </RadioGroup>

          {loginMode === "url" ? (
            // URL Mode
            <form className="flex flex-col gap-4 w-full" onSubmit={onSubmit}>
              <div className="flex flex-col gap-2">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="falkordb-url" className="font-medium">FalkorDB URL</label>
                <Input
                  id="falkordb-url"
                  type="text"
                  placeholder="falkordb://user:pass@host:port/graph"
                  value={falkordbUrl}
                  onChange={(e) => {
                    setFalkordbUrl(e.target.value);
                    setError({ message: "Invalid credentials", show: false });
                  }}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive h-5">{error.show ? error.message : ""}</p>}
              <button
                type="submit"
                className="w-full bg-primary p-4 rounded-lg flex justify-center items-center gap-2 text-primary-foreground font-medium hover:bg-primary/90"
              >
                Log in
              </button>
            </form>
          ) : (
            // Manual Configuration Mode
            <FormComponent
              fields={fields}
              handleSubmit={onSubmit}
              error={error}
              submitButtonLabel="Log in"
            >
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <Checkbox
                  className="w-6 h-6 rounded-full bg-background border-primary data-[state=checked]:bg-primary"
                  checked={TLS}
                  onCheckedChange={(checked) => {
                    setTLS(checked as boolean)
                    setError(prev => ({
                      ...prev,
                      show: false
                    }))
                    if (!checked) {
                      // Clear certificate when TLS is disabled
                      setCA(undefined)
                      setUploadedFileName("")
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
                        <Dropzone onFileDrop={onFileDrop} disabled={!TLS} />
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
                            setError(prev => ({
                              ...prev,
                              show: false
                            }))
                            setCA(undefined)
                            setUploadedFileName("")
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
          </FormComponent>
          )}
        </div>
      </div>
      <div className="h-5 Gradient" />
    </div>
  );
}