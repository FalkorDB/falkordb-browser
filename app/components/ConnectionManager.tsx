"use client";

import { useCallback, useContext, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Check, ChevronDown, LogOut, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { securedFetch, setActiveConnectionIdGlobal } from "@/lib/utils";

import { ConnectionContext, IndicatorContext, SessionConnection } from "./provider";
import Button from "./ui/Button";
import FormComponent, { Field } from "./FormComponent";
import Dropzone from "./ui/Dropzone";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "6379";

const handlePortIsNumber = (value: string) => !/^\d+$/.test(value);

const handleIsPortFormat = (value: string) => {
  const port = Number(value);
  return !(port >= 1 && port <= 65535);
};

const handleIsPortValid = (value: string) => value.startsWith("0");

const getPortErrors = () => [
  {
    condition: (value: string) => value !== "" && handlePortIsNumber(value),
    message: "Port must be a number"
  },
  {
    condition: (value: string) => value !== "" && !handlePortIsNumber(value) && handleIsPortFormat(value),
    message: "Port must be a number between 1 and 65535"
  },
  {
    condition: (value: string) => value !== "" && !handlePortIsNumber(value) && handleIsPortValid(value),
    message: "Invalid port format (port can't start with 0)"
  }
];

export default function ConnectionManager() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { setIndicator } = useContext(IndicatorContext);
  const {
    additionalConnections,
    setAdditionalConnections,
    activeConnectionId,
    setActiveConnectionId,
    updateSession,
  } = useContext(ConnectionContext);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  // Form state for add-connection dialog
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [TLS, setTLS] = useState(false);
  const [CA, setCA] = useState<string>();
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [error, setError] = useState<{ message: React.ReactNode; show: boolean }>({ message: "", show: false });

  const clearError = () => setError({ message: "", show: false });

  const resetForm = () => {
    setHost("");
    setPort("");
    setUsername("");
    setPassword("");
    setTLS(false);
    setCA(undefined);
    setUploadedFileName("");
    clearError();
  };

  const handleSelect = useCallback((connId: string) => {
    setActiveConnectionId(connId);
    setActiveConnectionIdGlobal(connId);
    localStorage.setItem("lastActiveConnectionId", connId);
    updateSession({ connections: additionalConnections, activeConnectionId: connId });
  }, [setActiveConnectionId, updateSession, additionalConnections]);

  const handleRemove = useCallback(async (e: React.MouseEvent, connId: string) => {
    e.stopPropagation();
    e.preventDefault();

    // If this is the last connection, sign out instead
    if (additionalConnections.length <= 1) {
      await signOut({ callbackUrl: "/login" });
      return;
    }

    try {
      const result = await securedFetch(`/api/connections/${encodeURIComponent(connId)}`, {
        method: "DELETE",
      }, toast, setIndicator);

      if (result.ok) {
        setAdditionalConnections((prev: SessionConnection[]) => {
          const remaining = prev.filter(c => c.id !== connId);
          // If we removed the active connection, switch to the last remaining one
          if (activeConnectionId === connId && remaining.length > 0) {
            const newActive = remaining[remaining.length - 1].id;
            setActiveConnectionId(newActive);
            setActiveConnectionIdGlobal(newActive);
            localStorage.setItem("lastActiveConnectionId", newActive);
            updateSession({ connections: remaining, activeConnectionId: newActive });
          } else {
            updateSession({ connections: remaining });
          }
          return remaining;
        });
        toast({ title: "Connection removed" });
      }
    } catch {
      toast({ title: "Failed to remove connection", variant: "destructive" });
    }
  }, [toast, setAdditionalConnections, activeConnectionId, setActiveConnectionId, setIndicator, additionalConnections.length, updateSession]);

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      setError({ message: <p className="text-xs text-destructive">Username is required</p>, show: true });
      return;
    }

    if (!password) {
      setError({ message: <p className="text-xs text-destructive">Password is required</p>, show: true });
      return;
    }

    setAdding(true);
    try {
      const result = await securedFetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: host || undefined,
          port: port || undefined,
          username,
          password,
          tls: TLS || undefined,
          ca: CA || undefined,
        }),
      }, toast, setIndicator);

      if (result.ok) {
        const json = await result.json();
        const newConn = json.connection;
        const updated = [...additionalConnections, newConn];
        setAdditionalConnections(updated);
        // Auto-switch to the newly added connection
        setActiveConnectionId(newConn.id);
        setActiveConnectionIdGlobal(newConn.id);
        localStorage.setItem("lastActiveConnectionId", newConn.id);
        updateSession({ connections: updated, activeConnectionId: newConn.id });
        toast({ title: `Connection added for ${username}` });
        resetForm();
        setDialogOpen(false);
      }
    } catch {
      toast({ title: "Failed to add connection", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  }, [host, port, username, password, TLS, CA, toast, setAdditionalConnections, setIndicator, additionalConnections, setActiveConnectionId, updateSession]);

  const onFileDrop = (acceptedFiles: File[]) => {
    const reader = new FileReader();
    reader.onload = () => {
      clearError();
      setCA((reader.result as string).split(',').pop());
      setUploadedFileName(acceptedFiles[0].name);
    };
    reader.readAsDataURL(acceptedFiles[0]);
  };

  if (!session?.user) return null;

  const activeConn = additionalConnections.find(c => c.id === activeConnectionId);

  if (!activeConn) return null;

  const getConnectionLabel = (conn: SessionConnection) => `${conn.username}@${conn.host}:${conn.port}`;

  const fields: Field[] = [
    {
      value: host,
      onChange: async (e: React.ChangeEvent<HTMLInputElement>) => { setHost(e.target.value); clearError(); return true; },
      label: "Host",
      type: "text",
      placeholder: DEFAULT_HOST,
      required: false,
      info: "Leave empty to use the same host as the current connection.",
    },
    {
      value: port,
      onChange: async (e: React.ChangeEvent<HTMLInputElement>) => { setPort(e.target.value); clearError(); return true; },
      errors: [...getPortErrors()],
      label: "Port",
      type: "text",
      placeholder: DEFAULT_PORT,
      required: false,
      info: "Leave empty to use the same port as the current connection.",
    },
    {
      value: username,
      onChange: async (e: React.ChangeEvent<HTMLInputElement>) => { setUsername(e.target.value); clearError(); return true; },
      label: "Username",
      type: "text",
      placeholder: "ACL username",
      required: true,
    },
    {
      value: password,
      onChange: async (e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value); clearError(); return true; },
      label: "Password",
      type: "password",
      placeholder: "Password",
      required: true,
    },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
          >
            <span>Connections</span>
            <ChevronDown size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Connections</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* All connections shown equally */}
          {additionalConnections.map((conn) => (
            <DropdownMenuItem
              key={conn.id}
              className="flex items-center justify-between gap-2 px-2 py-2 cursor-pointer"
              onClick={() => handleSelect(conn.id)}
            >
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2 min-w-0">
                  {activeConnectionId === conn.id && <Check size={14} className="shrink-0 text-primary" />}
                  {activeConnectionId !== conn.id && <span className="w-[14px]" />}
                  <span className="truncate font-medium">{getConnectionLabel(conn)}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{conn.role}</span>
                </TooltipTrigger>
                <TooltipContent>
                  {getConnectionLabel(conn)}
                </TooltipContent>
              </Tooltip>
              <button
                type="button"
                className="p-1 rounded hover:bg-destructive/10 transition-colors shrink-0"
                onClick={(e) => handleRemove(e, conn.id)}
                aria-label={`Remove ${conn.username}`}
              >
                <LogOut size={12} className="text-destructive" />
              </button>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 px-2 py-2 cursor-pointer text-primary"
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus size={14} />
            <span>Add Connection</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Connection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Connection</DialogTitle>
            <DialogDescription>Connect to another FalkorDB instance using ACL credentials.</DialogDescription>
          </DialogHeader>
          <FormComponent
            fields={fields}
            handleSubmit={handleAdd}
            error={error}
            submitButtonLabel={adding ? "Connecting..." : "Add Connection"}
          >
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <Checkbox
                  className="w-6 h-6 rounded-full bg-background border-primary data-[state=checked]:bg-primary"
                  checked={TLS}
                  onCheckedChange={(checked) => {
                    setTLS(checked as boolean);
                    clearError();
                    if (!checked) {
                      setCA(undefined);
                      setUploadedFileName("");
                    }
                  }}
                />
                <p className="font-medium text-foreground">TLS Secured Connection</p>
              </div>

              {TLS && (
                <div className="flex flex-col gap-3 p-4 bg-background border border-border rounded-lg">
                  <span className="text-sm font-semibold text-muted">Certificate Authentication</span>
                  {!uploadedFileName ? (
                    <Dropzone title="Upload Certificate" onFileDrop={onFileDrop} disabled={!TLS} />
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <Check size={16} className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Certificate Uploaded</span>
                          <span className="text-xs text-muted truncate max-w-48">{uploadedFileName}</span>
                        </div>
                      </div>
                      <Button
                        className="p-1"
                        onClick={() => { setCA(undefined); setUploadedFileName(""); }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </FormComponent>
        </DialogContent>
      </Dialog>
    </>
  );
}
