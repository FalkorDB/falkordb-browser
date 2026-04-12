import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Button from "./ui/Button";
import { ConnectionContext } from "./provider";
import { useCallback, useContext } from "react";
import { useSession } from "next-auth/react";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

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
    const { connectionType, connectionInfo, dbVersion } = useContext(ConnectionContext);
    const { data: session } = useSession();
    const { toast } = useToast();

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
        <header className="flex gap-4 w-full border-b p-1 items-center">
            <div className="flex gap-1">
                <label>Username:</label>
                <h2>{session?.user.username || "Default"}</h2>
            </div>
            {
                formatVersion(dbVersion) &&
                <div className="flex gap-1">
                    <label>FalkorDB Version:</label>
                    <h2>v{formatVersion(dbVersion)}</h2>
                </div>
            }
            {
                session?.user &&
                <>
                    <div className="flex items-center gap-1">
                        {connectionType !== "Standalone" ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        label={`${session.user.host}:${session.user.port}`}
                                    />
                                </PopoverTrigger>
                                <PopoverContent className="w-fit max-w-full">
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
                            <p className="grow basis-0 truncate">{session.user.host}:{session.user.port}</p>
                        )}
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
                    </div>
                </>
            }
            <div className="flex gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={cn("h-6 w-6 rounded-full bg-yellow-500 text-center", connectionType !== "Standalone" && "opacity-25")}
                        >Si</div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Single</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={cn("h-6 w-6 rounded-full bg-green-500 text-center", connectionType !== "Sentinel" && "opacity-25")}
                        >Se</div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Sentinel</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={cn("h-6 w-6 rounded-full bg-green-700 text-center", connectionType !== "Cluster" && "opacity-25")}
                        >C</div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Cluster</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </header>
    );
}