"use client";

import { SignInOptions, SignInResponse, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import FormComponent, { Field } from "../components/FormComponent";
import Dropzone from "../components/ui/Dropzone";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

export default function LoginForm() {
  const router = useRouter();
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

    // // Validate TLS requirements on the frontend
    // if (TLS && (!CA || CA.trim() === "")) {
    //   setError({
    //     message: "Certificate is required for TLS connections.",
    //     show: true
    //   });
    //   return;
    // }

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
          <Image style={{ width: 'auto', height: '80px' }} priority src="/BrowserLogo.svg" alt="FalkorDB Browser Logo" width={0} height={0} />
          <FormComponent
            fields={fields}
            handleSubmit={onSubmit}
            error={error}
            submitButtonLabel="Log in"
          >
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <Checkbox
                  className="w-6 h-6 rounded-full bg-foreground border-primary data-[state=checked]:bg-primary"
                  checked={TLS}
                  onCheckedChange={(checked) => {
                    setTLS(checked as boolean)
                    if (!checked) {
                      // Clear certificate when TLS is disabled
                      setCA(undefined)
                      setUploadedFileName("")
                    }
                  }}
                  data-testid="tls-checkbox"
                />
                <p className="font-medium text-white">TLS Secured Connection</p>
              </div>
              
              {/* Certificate Upload Section */}
              {TLS && (
                <div className="flex flex-col gap-3 p-4 bg-foreground border border-muted/20 rounded-lg transition-all duration-300 ease-in-out">
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
                            <span className="text-sm font-medium text-white">Certificate Uploaded</span>
                            <span className="text-xs text-muted truncate max-w-48">{uploadedFileName}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCA(undefined)
                            setUploadedFileName("")
                          }}
                          className="flex-shrink-0 p-1 text-muted hover:text-white hover:bg-primary/20 rounded transition-colors duration-200"
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
        </div>
      </div>
      <div className="h-5 Gradient" />
    </div>
  );
}