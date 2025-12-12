import { useContext } from "react";
import { Loader2, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Button from "../components/ui/Button";
import { BrowserSettingsContext, GraphContext, QueryLoadingContext } from "../components/provider";

/**
 * Render a side panel showing graph metadata and interactive controls to run representative queries.
 *
 * @param onClose - Callback invoked when the panel's close button is clicked
 * @returns The Graph Info panel React element containing graph name, memory usage, node/edge counts, property keys, and query buttons
 */
export default function GraphInfoPanel({ onClose }: { onClose: () => void }) {
    const { graphInfo: { Labels, Relationships, PropertyKeys, MemoryUsage }, nodesCount, edgesCount, runQuery, graphName } = useContext(GraphContext);
    const { isQueryLoading } = useContext(QueryLoadingContext)
    const { settings: { graphInfo: { showMemoryUsage } } } = useContext(BrowserSettingsContext)
    console.log(MemoryUsage.get("total_graph_sz_mb"));
    
    return (
        <div className={cn(`relative h-full w-full p-2 grid grid-rows-[max-content_max-content_minmax(0,max-content)_minmax(0,max-content)_minmax(0,max-content)] gap-8 border-r border-border`)}>
            <Button
                className="absolute top-2 right-2"
                title="Close"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl">Graph Info</h1>
            <div className="flex gap-2 items-center overflow-hidden">
                <h2>Graph Name:</h2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <p className="truncate pointer-events-auto SofiaSans">{graphName}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                        {graphName}
                    </TooltipContent>
                </Tooltip>
            </div>
            {
                showMemoryUsage &&
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <h2>Memory Usage:</h2>
                        {
                            MemoryUsage.get("total_graph_sz_mb") !== undefined
                                ? <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="truncate pointer-events-auto SofiaSans">{MemoryUsage.get("total_graph_sz_mb") || "<1"} MB</p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {MemoryUsage.get("total_graph_sz_mb")} MB
                                    </TooltipContent>
                                </Tooltip>
                                : <Loader2 className="animate-spin" />
                        }
                    </div>
                </div>
            }
            <div className="flex flex-col gap-2 overflow-hidden">
                <div className="flex gap-2 items-center">
                    <h2>Nodes</h2>
                    {
                        nodesCount !== undefined ?
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p
                                        data-testid="nodesCount"
                                        className="truncate pointer-events-auto SofiaSans"
                                    >
                                        ({nodesCount})
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {nodesCount}
                                </TooltipContent>
                            </Tooltip>
                            : <Loader2 data-testid="nodesCountLoader" className="animate-spin" />
                    }
                </div>
                <ul className="flex flex-wrap gap-2 p-2 overflow-auto">
                    <li className="max-w-full">
                        <Button
                            className="pt-1 h-6 w-6 rounded-full flex justify-center items-center bg-border text-white"
                            data-testid="graphInfoAllNodes"
                            label="*"
                            title="All labels"
                            onClick={() => runQuery(`MATCH (n) RETURN n`)}
                            disabled={isQueryLoading}
                        />
                    </li>
                    {Array.from(Labels.values()).filter(({ name }) => !!name).map(({ name, color }) => (
                        <li key={name} className="max-w-full">
                            <Button
                                style={{ backgroundColor: color }}
                                className="h-6 w-full p-2 rounded-full flex justify-center items-center text-black SofiaSans"
                                data-testid={`graphInfo${name}Node`}
                                label={name}
                                onClick={() => runQuery(`MATCH (n:${name}) RETURN n`)}
                                disabled={isQueryLoading}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2 overflow-hidden">
                <div className="flex gap-2 items-center">
                    <h2>Edges</h2>
                    {
                        edgesCount !== undefined ?
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p
                                        data-testid="edgesCount"
                                        className="truncate pointer-events-auto SofiaSans"
                                    >
                                        ({edgesCount})
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {edgesCount}
                                </TooltipContent>
                            </Tooltip>
                            :
                            <Loader2 data-testid="edgesCountLoader" className="animate-spin" />
                    }
                </div>
                <ul className="flex flex-wrap gap-2 p-2 overflow-auto">
                    <li className="max-w-full">
                        <Button
                            className="pt-1 h-6 w-6 rounded-full flex justify-center items-center bg-border text-white"
                            data-testid="graphInfoAllEdges"
                            label="*"
                            title="All relationships"
                            onClick={() => runQuery(`MATCH p=()-[]-() RETURN p`)}
                            disabled={isQueryLoading}
                        />
                    </li>
                    {Array.from(Relationships.values()).map(({ name, color }) => (
                        <li key={name} className="max-w-full">
                            <Button
                                style={{ backgroundColor: color }}
                                className="h-6 w-full p-2 rounded-full flex justify-center items-center text-black SofiaSans"
                                data-testid={`graphInfo${name}Edge`}
                                label={name}
                                onClick={() => runQuery(`MATCH p=()-[:${name}]-() RETURN p`)}
                                disabled={isQueryLoading}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2 overflow-hidden">
                <div className="flex gap-2 items-center">
                    <h2>Property Keys</h2>
                    {
                        PropertyKeys !== undefined ?
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p
                                        data-testid="propertyKeysCount"
                                        className="truncate pointer-events-auto SofiaSans"
                                    >
                                        ({PropertyKeys.length})
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {PropertyKeys.length}
                                </TooltipContent>
                            </Tooltip>
                            :
                            <Loader2 className="animate-spin" />
                    }
                </div>
                <ul className="flex flex-wrap gap-2 p-2 overflow-auto">
                    {
                        PropertyKeys && PropertyKeys.map((key) => (
                            <li key={key} className="max-w-full">
                                <Button
                                    className="h-6 w-full p-2 bg-border flex justify-center items-center rounded-full text-white SofiaSans"
                                    label={key}
                                    onClick={() => runQuery(
                                        `MATCH (e) WHERE e.${key} IS NOT NULL RETURN e\nUNION\nMATCH ()-[e]-() WHERE e.${key} IS NOT NULL RETURN e`
                                    )}
                                    disabled={isQueryLoading}
                                />
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    )
}