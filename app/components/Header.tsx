import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Button from "./ui/Button";
import { ConnectionContext, IndicatorContext } from "./provider";
import { useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn, securedFetch } from "@/lib/utils";

/**
 * Format version number to include dots (e.g., "11111" -> "1.11.11")
 */
function formatVersion(version: string | undefined): string {
    if (!version) return '';

    // If already formatted with dots, return as is
    if (version.includes('.')) return version;

    // Format as Major.Minor.Patch (e.g., "11111" -> "1.11.11")
    if (version.length >= 5) {
        const major = version.slice(0, 1);
        const minor = version.slice(1, 3);
        const patch = version.slice(3);
        return `${major}.${minor}.${patch}`;
    }

    return version;
}

export default function Header() {
    const { setIndicator } = useContext(IndicatorContext);
    const { connectionType, connectionInfo, dbVersion } = useContext(ConnectionContext);
    const { data: session } = useSession();
    const { toast } = useToast();

    const [usedMemory, setUsedMemory] = useState<string | null>(null);

    useEffect(() => {
        setUsedMemory(null);
        (async () => {
            const result = await securedFetch("/api/info?section=memory", {
                method: "GET"
            }, toast, setIndicator);

            if (!result.ok) return;

            const data = (await result.json()).result;

            const match = data.match(/used_memory_human:(\S+)/);

            if (!match) return;

            setUsedMemory(match[1]);
        })();
    }, [toast, setIndicator, connectionType, connectionInfo]);

    const handleCopy = useCallback((text: string) => {
        if (!navigator.clipboard?.writeText) {
            toast({ title: "Clipboard not available", variant: "destructive" });
            return;
        }
        navigator.clipboard.writeText(text)
            .then(() => toast({ title: "Copied to clipboard" }))
            .catch(() => toast({ title: "Failed to copy", variant: "destructive" }));
    }, [toast]);

    return (
        <header className="flex gap-4 w-full border-b border-border/50 px-3 py-1.5 items-center text-sm">
            <div className="flex gap-1 items-center">
                <label className="font-bold">User:</label>
                <h2>{session?.user.username || "Default"}</h2>
            </div>
            {
                formatVersion(dbVersion) &&
                <div className="flex gap-1 items-center">
                    <label className="font-bold">FalkorDB:</label>
                    <h2>v{formatVersion(dbVersion)}</h2>
                </div>
            }
            <div className="flex gap-1 items-center">
                <Tooltip>
                    <TooltipTrigger>
                        <label className="font-bold">Memory:</label>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Used Memory</p>
                    </TooltipContent>
                </Tooltip>
                {
                    usedMemory !== null ?
                        <h2>{usedMemory}</h2>
                        : <Loader2 className="animate-spin" size={16} />
                }
            </div>
            <div className="flex gap-1 items-center">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn(
                            "h-6 px-2 rounded-full flex items-center gap-1.5 text-xs font-medium border",
                            connectionType === "Standalone" && "border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                            connectionType === "Sentinel" && "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400",
                            connectionType === "Cluster" && "border-green-700/40 bg-green-700/10 text-green-700 dark:text-green-400",
                        )}>
                            <span className={cn(
                                "h-2 w-2 rounded-full",
                                connectionType === "Standalone" && "bg-yellow-500",
                                connectionType === "Sentinel" && "bg-green-500",
                                connectionType === "Cluster" && "bg-green-700",
                            )} />
                            {connectionType === "Standalone" && "Single"}
                            {connectionType === "Sentinel" && "Sentinel"}
                            {connectionType === "Cluster" && "Cluster"}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Connection type: {connectionType}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            {
                session?.user &&
                <div className="flex gap-1 items-center">
                    <Button
                        title="Copy connection info"
                        className="p-0.5 shrink-0"
                        onClick={() => {
                            let text = `${session.user.host}:${session.user.port}`;
                            if (connectionType === "Sentinel") {
                                if (connectionInfo.sentinelRole === "master" && connectionInfo.sentinelReplicas !== undefined) text += `\nRole: Master (${connectionInfo.sentinelReplicas} replicas)`;
                                if (connectionInfo.sentinelRole === "slave" && connectionInfo.sentinelMasterHost) text += `\nRole: Replica (master: ${connectionInfo.sentinelMasterHost}:${connectionInfo.sentinelMasterPort})`;
                            }
                            if (connectionType === "Cluster" && connectionInfo.clusterNodes) {
                                text += `\nNodes: ${connectionInfo.clusterNodes.length}\n${connectionInfo.clusterNodes.map((node) => `${node.host}:${node.port} (${node.role}${node.slots ? ` ${node.slots}` : ""})`).join("\n")}`;
                            }
                            handleCopy(text);
                        }}
                    >
                        <Copy size={12} />
                    </Button>
                    {connectionType !== "Standalone" ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    className={connectionType === "Sentinel" ? "text-green-500" : "text-green-700"}
                                    label={`${session.user.host}:${session.user.port}`}
                                />
                            </PopoverTrigger>
                            <PopoverContent className={cn("w-fit max-w-full mt-2 border-foreground", connectionType === "Sentinel" ? "text-green-500" : "text-green-700")}>
                                <div className="flex flex-col gap-1.5 text-sm">
                                    <p className="font-medium">{session.user.host}:{session.user.port}</p>
                                    {connectionType === "Sentinel" && (
                                        <>
                                            {connectionInfo.sentinelRole === "master" && connectionInfo.sentinelReplicas !== undefined && (
                                                <p>Role: Master ({connectionInfo.sentinelReplicas} replicas)</p>
                                            )}
                                            {connectionInfo.sentinelRole === "slave" && connectionInfo.sentinelMasterHost && (
                                                <p>Role: Replica (master: {connectionInfo.sentinelMasterHost}:{connectionInfo.sentinelMasterPort})</p>
                                            )}
                                        </>
                                    )}
                                    {connectionType === "Cluster" && connectionInfo.clusterNodes && (
                                        <>
                                            <p className="font-medium">{connectionInfo.clusterNodes.length} nodes</p>
                                            <div className="flex flex-col gap-0.5 text-xs">
                                                {connectionInfo.clusterNodes.map((node) => (
                                                    <p key={`${node.host}:${node.port}`}>
                                                        {node.host}:{node.port} ({node.role}{node.slots ? ` ${node.slots}` : ""})
                                                    </p>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <p className="grow basis-0 truncate text-yellow-500">{session.user.host}:{session.user.port}</p>
                    )}
                </div>
            }
        </header>
    );
}