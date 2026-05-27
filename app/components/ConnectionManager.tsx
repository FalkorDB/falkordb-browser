"use client";

import { useCallback, useContext, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Check, ChevronDown, LogOut, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { securedFetch, setActiveConnectionIdGlobal } from "@/lib/utils";

import { ConnectionContext, IndicatorContext, SessionConnection } from "./provider";
import Button from "./ui/Button";
import LoginForm, { LoginFormCredentials } from "../login/LoginForm";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [removeTarget, setRemoveTarget] = useState<{ conn: SessionConnection; isLast: boolean } | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleSelect = useCallback(async (connId: string) => {
    // Set the global ID immediately so periodic timers (memory, count, etc.)
    // that fire DURING the updateSession await use the correct connection and
    // don't fall back to Token DB which might pick the wrong entry.
    setActiveConnectionIdGlobal(connId);
    localStorage.setItem("lastActiveConnectionId", connId);
    // Update the JWT so session.user.role is correct before React effects
    // (graph-list reload, query execution) fire. The JWT callback looks up
    // the connection details from Token DB.
    await updateSession({ activeConnectionId: connId });
    // Update React state AFTER the JWT is updated so the prevActiveConnectionId
    // effect fires with the correct role already in sessionData.
    setActiveConnectionId(connId);
  }, [setActiveConnectionId, updateSession]);

  // Determine whether the user only has one connection. The session always
  // has at least one (the primary), so we treat an empty additionalConnections
  // list as a single connection.
  const isLastConnection = (additionalConnections.length > 0 ? additionalConnections.length : 1) <= 1;

  const handleRemove = useCallback((e: React.MouseEvent, conn: SessionConnection) => {
    e.stopPropagation();
    e.preventDefault();
    // Open the confirmation dialog. The actual removal/sign-out happens in
    // confirmRemove() so the user is always asked first — this avoids the
    // surprise of accidentally killing their last connection (which performs
    // a full browser sign-out and tears down all session state).
    setRemoveTarget({ conn, isLast: isLastConnection });
  }, [isLastConnection]);

  const confirmRemove = useCallback(async () => {
    if (!removeTarget) return;
    const { conn, isLast } = removeTarget;
    const connId = conn.id;

    setRemoving(true);
    try {
      // If this is the last connection, sign out instead.
      if (isLast) {
        await signOut({ callbackUrl: "/login" });
        return;
      }

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
            updateSession({ activeConnectionId: newActive });
          }
          return remaining;
        });
        toast({ title: "Connection removed" });
      } else {
        toast({ title: "Failed to remove connection", variant: "destructive" });
      }
      setRemoveTarget(null);
    } catch {
      toast({ title: "Failed to remove connection", variant: "destructive" });
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  }, [removeTarget, toast, setAdditionalConnections, activeConnectionId, setActiveConnectionId, setIndicator, updateSession]);

  const handleAddConnection = useCallback(async (credentials: LoginFormCredentials) => {
    const result = await securedFetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: credentials.host || undefined,
        port: credentials.port || undefined,
        username: credentials.username,
        password: credentials.password,
        tls: credentials.tls,
        ca: credentials.ca || undefined,
      }),
    }, toast, setIndicator);

    if (result.ok) {
      const json = await result.json();
      const newConn = json.connection;
      setAdditionalConnections((prev) => [...prev, newConn]);
      // Auto-switch to the newly added connection
      setActiveConnectionId(newConn.id);
      setActiveConnectionIdGlobal(newConn.id);
      localStorage.setItem("lastActiveConnectionId", newConn.id);
      updateSession({ activeConnectionId: newConn.id });
      toast({ title: `Connection added for ${credentials.username}` });
      setDialogOpen(false);
    } else {
      throw new Error("Failed to add connection");
    }
  }, [toast, setAdditionalConnections, setIndicator, setActiveConnectionId, updateSession]);

  // Use the explicitly active connection, or fall back to the first one while
  // activeConnectionId is still being resolved (e.g. on initial page load).
  const effectiveActiveId = activeConnectionId ?? session?.activeConnectionId;

  const activeConn =
    additionalConnections.find(c => c.id === effectiveActiveId) ??
    additionalConnections[0] ??
    null;

  const getConnectionLabel = (conn: SessionConnection) => `${conn.username}@${conn.host}:${conn.port}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid="connections-dropdown-trigger"
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
          >
            <span>Connections</span>
            <ChevronDown size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[300px]" data-testid="connections-dropdown-content">
          <DropdownMenuLabel>Connections</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* All connections shown equally */}
          {additionalConnections.map((conn) => (
            <DropdownMenuItem
              key={conn.id}
              data-testid={`connection-item-${conn.id}`}
              className="flex items-center justify-between gap-2 px-2 py-2 cursor-pointer"
              onClick={() => handleSelect(conn.id)}
            >
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2 min-w-0">
                  {activeConn?.id === conn.id && <Check size={14} className="shrink-0 text-primary" />}
                  {activeConn?.id !== conn.id && <span className="w-[14px]" />}
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
                onClick={(e) => handleRemove(e, conn)}
                aria-label={`Sign out of connection ${getConnectionLabel(conn)}`}
                title={`Sign out of this connection (${getConnectionLabel(conn)})`}
                data-testid={`connection-logout-${conn.id}`}
              >
                <LogOut size={12} className="text-destructive" />
              </button>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 px-2 py-2 cursor-pointer text-primary"
            onClick={() => {
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
          <LoginForm
            onSubmit={handleAddConnection}
            submitButtonLabel="Add Connection"
          />
        </DialogContent>
      </Dialog>

      {/* Confirm per-connection sign-out dialog */}
      {removeTarget && (() => {
        const { conn: targetConn, isLast } = removeTarget;
        const label = getConnectionLabel(targetConn);
        return (
          <Dialog
            open
            onOpenChange={(open) => { if (!open && !removing) setRemoveTarget(null); }}
          >
            <DialogContent className="max-w-md" data-testid="connectionLogoutDialog">
              <DialogHeader>
                <DialogTitle>{isLast ? "Logout All?" : "Logout from this connection?"}</DialogTitle>
                <DialogDescription>
                  {isLast
                    ? `${label} is your only connection. In addition to logging out of it, this will end your FalkorDB Browser session, remove all stored connection credentials from this session, and require you to log in again to reconnect.`
                    : `This will close the connection to ${label} and remove it from your session. Your other connections will remain active.`}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button
                  data-testid="connectionLogoutCancel"
                  variant="Cancel"
                  label="Cancel"
                  disabled={removing}
                  onClick={() => setRemoveTarget(null)}
                />
                <Button
                  data-testid="connectionLogoutConfirm"
                  variant="Delete"
                  label={isLast ? "Logout All" : "Logout"}
                  onClick={confirmRemove}
                  isLoading={removing}
                />
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </>
  );
}
