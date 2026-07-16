"use client";

import { useCallback, useContext, useRef, useState } from "react";
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
    beginConnectionSwitch,
    endConnectionSwitch,
    handoffConnectionSwitch,
    isConnectionSwitchInProgress,
    getLastCommittedConnId,
    isLatestSwitch,
  } = useContext(ConnectionContext);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ conn: SessionConnection; isLast: boolean } | null>(null);
  const [removing, setRemoving] = useState(false);
  // Mirrors `removing` synchronously so handleSelect can block a switch while a
  // removal (commit + DELETE) is mid-flight — the two must be mutually exclusive
  // so a select can't target a connection that is being deleted.
  const removingRef = useRef(false);

  const handleSelect = useCallback(async (connId: string) => {
    // A no-op only when nothing is pending; while a switch is in flight, re-selecting
    // the displayed connection must be allowed so it can supersede the pending one
    // (e.g. A→B→A must end on A, not B).
    if (connId === activeConnectionId && !isConnectionSwitchInProgress()) return;
    // Mutually exclusive with a removal: don't switch onto a connection whose DELETE
    // may be in flight.
    if (removingRef.current) return;
    // Block/supersede graph ops while the switch is mid-flight (its global id and
    // React state briefly disagree). The ticket lets us ignore a stale completion
    // if the user starts a newer switch before this one resolves.
    const ticket = beginConnectionSwitch();
    // Set the global ID immediately so periodic timers (memory, count, etc.)
    // that fire DURING the commit use the correct connection.
    setActiveConnectionIdGlobal(connId);
    localStorage.setItem("lastActiveConnectionId", connId);
    let handedOff = false;
    try {
      // Commit the JWT (serialized + validated). Throws on failure so we roll back.
      await updateSession({ activeConnectionId: connId });
      if (!isLatestSwitch(ticket)) {
        // A newer switch superseded this one — don't publish this (older) target;
        // the finally releases this switch's gate ticket.
        return;
      }
      if (connId === activeConnectionId) {
        // React already shows this connection (A→B→A): setActiveConnectionId would
        // be a no-op so the reset effect won't fire — release the ticket directly
        // and re-pin the global rather than handing off to an effect that won't run.
        setActiveConnectionIdGlobal(connId);
        endConnectionSwitch(ticket);
        handedOff = true;
      } else {
        // Publish React state AFTER the JWT commit, and hand this ticket to the reset
        // effect so the gate stays closed until graph state is re-pinned.
        handoffConnectionSwitch(ticket, connId);
        handedOff = true;
        setActiveConnectionId(connId);
      }
    } catch (error) {
      console.error("Failed to switch connection:", error);
      if (isLatestSwitch(ticket)) {
        // Converge all three states on the last validated connection (which
        // exists), not on this failed target.
        const rollbackId = getLastCommittedConnId() ?? activeConnectionId;
        setActiveConnectionIdGlobal(rollbackId);
        if (rollbackId !== null) localStorage.setItem("lastActiveConnectionId", rollbackId);
        else localStorage.removeItem("lastActiveConnectionId");
        if (rollbackId !== activeConnectionId) {
          // The rollback changes React state → release via that reset effect too.
          handoffConnectionSwitch(ticket, rollbackId);
          handedOff = true;
          setActiveConnectionId(rollbackId);
        }
      }
    } finally {
      if (!handedOff) endConnectionSwitch(ticket);
    }
  }, [activeConnectionId, setActiveConnectionId, updateSession, beginConnectionSwitch, endConnectionSwitch, handoffConnectionSwitch, isConnectionSwitchInProgress, getLastCommittedConnId, isLatestSwitch]);

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

    // If this is the last connection, sign out instead (before any switch/ticket).
    if (isLast) {
      setRemoving(true);
      removingRef.current = true;
      try {
        await signOut({ callbackUrl: "/login" });
      } finally {
        setRemoving(false);
        removingRef.current = false;
      }
      return;
    }

    // Don't remove while a connection switch is mid-flight — the gate set can't
    // identify the in-flight target, so block all removals (safe + simple).
    if (isConnectionSwitchInProgress()) {
      toast({ title: "Please wait for the connection switch to finish", variant: "destructive" });
      return;
    }

    setRemoving(true);
    // Held through the whole commit + DELETE so handleSelect can't switch onto the
    // connection being deleted (mutual exclusion).
    removingRef.current = true;
    try {
      const removingActive = activeConnectionId === connId;
      const remaining = additionalConnections.filter(c => c.id !== connId);

      if (removingActive && remaining.length > 0) {
        // Commit-before-delete: move the session to a valid replacement BEFORE
        // deleting the old row, so the JWT never points at a deleted connection.
        const newActive = remaining[remaining.length - 1].id;
        const ticket = beginConnectionSwitch();
        setActiveConnectionIdGlobal(newActive);
        localStorage.setItem("lastActiveConnectionId", newActive);
        let handedOff = false;
        try {
          await updateSession({ activeConnectionId: newActive });
          if (!isLatestSwitch(ticket)) { setRemoveTarget(null); return; }
          handoffConnectionSwitch(ticket, newActive);
          handedOff = true;
          setActiveConnectionId(newActive);
        } catch (error) {
          console.error("Failed to switch connection after removal:", error);
          toast({ title: "Failed to switch to remaining connection", variant: "destructive" });
          if (isLatestSwitch(ticket)) {
            const rollbackId = getLastCommittedConnId() ?? activeConnectionId;
            setActiveConnectionIdGlobal(rollbackId);
            if (rollbackId !== null) localStorage.setItem("lastActiveConnectionId", rollbackId);
            else localStorage.removeItem("lastActiveConnectionId");
            if (rollbackId !== activeConnectionId) {
              handoffConnectionSwitch(ticket, rollbackId);
              handedOff = true;
              setActiveConnectionId(rollbackId);
            }
          }
          setRemoveTarget(null);
          return;   // nothing deleted — the old connection is still valid
        } finally {
          if (!handedOff) endConnectionSwitch(ticket);
        }
      }

      // Only now delete the (no-longer-active) old connection.
      let result: Response;
      try {
        result = await securedFetch(`/api/connections/${encodeURIComponent(connId)}`, {
          method: "DELETE",
        }, toast, setIndicator);
      } catch (error) {
        // Ambiguous network failure — don't assume the row survived; refetch the list.
        console.error("Failed to remove connection:", error);
        // securedFetch only toasts for HTTP responses, so surface the thrown error.
        toast({ title: "Failed to remove connection", variant: "destructive" });
        try {
          const listRes = await securedFetch("/api/connections", { method: "GET" }, toast, setIndicator);
          if (listRes.ok) {
            const listJson = await listRes.json();
            if (listJson?.connections) setAdditionalConnections(listJson.connections);
          }
        } catch { /* best-effort refresh */ }
        setRemoveTarget(null);
        return;
      }

      if (result.ok) {
        // Update the list only after a successful DELETE.
        setAdditionalConnections(remaining);
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
      removingRef.current = false;
    }
  }, [removeTarget, toast, additionalConnections, setAdditionalConnections, activeConnectionId, setActiveConnectionId, setIndicator, updateSession, beginConnectionSwitch, endConnectionSwitch, handoffConnectionSwitch, isConnectionSwitchInProgress, getLastCommittedConnId, isLatestSwitch]);

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
      // Auto-switch to the newly added connection.
      const ticket = beginConnectionSwitch();
      setActiveConnectionIdGlobal(newConn.id);
      localStorage.setItem("lastActiveConnectionId", newConn.id);
      let handedOff = false;
      try {
        await updateSession({ activeConnectionId: newConn.id });
        if (!isLatestSwitch(ticket)) return;
        handoffConnectionSwitch(ticket, newConn.id);
        handedOff = true;
        setActiveConnectionId(newConn.id);
        toast({ title: `Connection added for ${credentials.username}` });
        setDialogOpen(false);
      } catch (error) {
        console.error("Failed to switch to new connection:", error);
        toast({ title: "Connection added but switch failed", variant: "destructive" });
        if (isLatestSwitch(ticket)) {
          const rollbackId = getLastCommittedConnId() ?? activeConnectionId;
          setActiveConnectionIdGlobal(rollbackId);
          if (rollbackId !== null) localStorage.setItem("lastActiveConnectionId", rollbackId);
          else localStorage.removeItem("lastActiveConnectionId");
          if (rollbackId !== activeConnectionId) {
            handoffConnectionSwitch(ticket, rollbackId);
            handedOff = true;
            setActiveConnectionId(rollbackId);
          }
        }
      } finally {
        if (!handedOff) endConnectionSwitch(ticket);
      }
    } else {
      throw new Error("Failed to add connection");
    }
  }, [toast, setAdditionalConnections, setIndicator, setActiveConnectionId, updateSession, beginConnectionSwitch, endConnectionSwitch, handoffConnectionSwitch, getLastCommittedConnId, isLatestSwitch, activeConnectionId]);

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
