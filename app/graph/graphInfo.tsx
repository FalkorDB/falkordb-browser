import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { Loader2, X, Palette, Network, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, InfoLabel } from "@/lib/utils";
import Button from "../components/ui/Button";
import { BrowserSettingsContext, GraphContext, QueryLoadingContext } from "../components/provider";
import CustomizeStylePanel from "./CustomizeStylePanel";
import Input from "../components/ui/Input";

/**
 * Render a side panel showing graph metadata and interactive controls to run representative queries.
 *
 * @param onClose - Callback invoked when the panel's close button is clicked
 * @returns The Graph Info panel React element containing graph name, memory usage, node/edge counts, property keys, and query buttons
 */
export default function GraphInfoPanel({ onClose, customizingLabel, setCustomizingLabel }: { onClose: () => void, customizingLabel: InfoLabel | null, setCustomizingLabel: Dispatch<SetStateAction<InfoLabel | null>> }) {
    const { graphInfo: { Labels, Relationships, PropertyKeys, MemoryUsage }, nodesCount, edgesCount, runQuery, graphName } = useContext(GraphContext);
    const { isQueryLoading } = useContext(QueryLoadingContext);
    const { settings: { graphInfo: { showMemoryUsage, maxItemsForSearch } } } = useContext(BrowserSettingsContext);

    const [nodesSearch, setNodesSearch] = useState("");
    const [edgesSearch, setEdgesSearch] = useState("");
    const [propertyKeysSearch, setPropertyKeysSearch] = useState("");

    useEffect(() => { setNodesSearch(""); }, [Labels, maxItemsForSearch]);
    useEffect(() => { setEdgesSearch(""); }, [Relationships, maxItemsForSearch]);
    useEffect(() => { setPropertyKeysSearch(""); }, [PropertyKeys, maxItemsForSearch]);

    return (
        <div aria-disabled={nodesCount === undefined || edgesCount === undefined} data-testid="graphInfoPanel" className={cn(`relative h-full w-full p-3 grid grid-rows-[max-content_max-content_max-content_1fr_1fr_1fr] gap-3`)}>
            {
                !customizingLabel ? (
                    <>
                        <Button
                            className="absolute top-2 right-2"
                            title="Close"
                            onClick={onClose}
                        >
                            <X size={16} />
                        </Button>
                        <div className="pr-5 w-full flex justify-between items-center gap-1">
                            <h1 className="text-lg font-semibold">Graph Info</h1>
                            <Network size={20} className="text-foreground/50" />
                        </div>
                        <div className="flex gap-2 items-center overflow-hidden">
                            <h2 className="text-xs uppercase tracking-wider text-foreground/60 font-medium">Name</h2>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p tabIndex={0} role="text" aria-label={graphName} className="truncate pointer-events-auto text-sm font-semibold">{graphName}</p>
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
                                    <h2 className="text-xs uppercase tracking-wider text-foreground/60 font-medium">Memory</h2>
                                    {
                                        MemoryUsage.get("total_graph_sz_mb") !== undefined
                                            ? <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p tabIndex={0} role="text" aria-label={`${MemoryUsage.get("total_graph_sz_mb") || "<1"} MB`} className="truncate pointer-events-auto text-sm font-semibold">{MemoryUsage.get("total_graph_sz_mb") || "<1"} MB</p>
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
                        <div className="flex flex-col gap-3 overflow-hidden">
                            <div className="flex gap-2 items-center">
                                <h2 className="text-xs uppercase tracking-wider text-foreground/60 font-medium">Nodes</h2>
                                {
                                    nodesCount !== undefined ?
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p
                                                    data-testid="nodesCount"
                                                    tabIndex={0}
                                                    role="text"
                                                    aria-label={`${nodesCount.toLocaleString()} nodes`}
                                                    className="truncate pointer-events-auto text-sm font-semibold"
                                                >
                                                    {nodesCount.toLocaleString()}
                                                </p>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {nodesCount.toLocaleString()}
                                            </TooltipContent>
                                        </Tooltip>
                                        : <Loader2 data-testid="nodesCountLoader" className="animate-spin" />
                                }
                                {
                                    Labels.size > maxItemsForSearch &&
                                    <div className="basis-0 grow flex gap-1 items-center">
                                        <Search size={14} />
                                        <Input aria-label="Search node labels" value={nodesSearch} onChange={(e) => setNodesSearch(e.target.value)} className="w-1 grow" />
                                    </div>
                                }
                            </div>
                            <ul className="flex flex-wrap gap-1.5 p-1 overflow-auto">
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
                                {Array.from(Labels.values()).filter(label => label.name.toLowerCase().includes(nodesSearch.toLowerCase())).sort((a, b) => b.count - a.count).map((label) => {
                                    const name = label.name || "Empty";
                                    const labelColor = label.style.color;

                                    return (
                                        <li key={`${name}-${labelColor}`} className="max-w-full flex gap-1 items-center overflow-x-hidden">
                                            <Button
                                                className="w-fit max-w-[calc(100%-16px)] h-6 px-2 rounded-md flex items-center gap-1.5 bg-secondary text-foreground text-xs hover:bg-secondary/80 transition-colors"
                                                data-testid={`graphInfo${name}Node`}
                                                title={`MATCH (n:${name}) RETURN n
                                                    #: ${label.count.toLocaleString()}`}
                                                onClick={() => runQuery(`MATCH (n:${name}) RETURN n`)}
                                                disabled={isQueryLoading}
                                            >
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: labelColor }} />
                                                <span className="truncate">{name}</span>
                                            </Button>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        className="h-4 w-4 p-1 rounded-full flex justify-center items-center bg-muted hover:bg-muted/80"
                                                        data-testid={`customizeStyle${name}`}
                                                        title="Customize Style"
                                                        onClick={() => setCustomizingLabel(label)}
                                                    >
                                                        <Palette className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Customize Style
                                                </TooltipContent>
                                            </Tooltip>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className="flex flex-col gap-3 overflow-hidden">
                            <div className="flex gap-2 items-center">
                                <h2 className="text-xs uppercase tracking-wider text-foreground/60 font-medium">Edges</h2>
                                {
                                    edgesCount !== undefined ?
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p
                                                    data-testid="edgesCount"
                                                    tabIndex={0}
                                                    role="text"
                                                    aria-label={`${edgesCount.toLocaleString()} edges`}
                                                    className="truncate pointer-events-auto text-sm font-semibold"
                                                >
                                                    {edgesCount.toLocaleString()}
                                                </p>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {edgesCount.toLocaleString()}
                                            </TooltipContent>
                                        </Tooltip>
                                        :
                                        <Loader2 data-testid="edgesCountLoader" className="animate-spin" />
                                }
                                {
                                    Relationships.size > maxItemsForSearch &&
                                    <div className="basis-0 grow flex gap-1 items-center">
                                        <Search size={14} />
                                        <Input aria-label="Search relationship types" value={edgesSearch} onChange={(e) => setEdgesSearch(e.target.value)} className="w-1 grow" />
                                    </div>
                                }
                            </div>
                            <ul className="flex flex-wrap gap-1.5 p-1 overflow-auto">
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
                                {Array.from(Relationships.values()).filter(relationship => relationship.name.toLowerCase().includes(edgesSearch.toLowerCase())).sort((a, b) => b.count - a.count).map((relationship) => {
                                    const relationshipColor = relationship.style.color;

                                    return (
                                        <li key={relationship.name} className="max-w-full">
                                            <Button
                                                title={`MATCH p=()-[:${relationship.name}]-() RETURN p
                                                    #: ${relationship.count.toLocaleString()}`}
                                                className="h-6 max-w-full px-2 rounded-md flex items-center gap-1.5 bg-secondary text-foreground text-xs hover:bg-secondary/80 transition-colors overflow-hidden"
                                                data-testid={`graphInfo${relationship.name}Edge`}
                                                onClick={() => runQuery(`MATCH p=()-[:${relationship.name}]-() RETURN p`)}
                                                disabled={isQueryLoading}
                                            >
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: relationshipColor }} />
                                                <span className="truncate">{relationship.name}</span>
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className="flex flex-col gap-3 overflow-hidden">
                            <div className="flex gap-2 items-center">
                                <h2 className="text-xs uppercase tracking-wider text-foreground/60 font-medium">Property Keys</h2>
                                {
                                    PropertyKeys !== undefined ?
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p
                                                    data-testid="propertyKeysCount"
                                                    tabIndex={0}
                                                    role="text"
                                                    aria-label={`${PropertyKeys.length.toLocaleString()} property keys`}
                                                    className="truncate pointer-events-auto text-sm font-semibold"
                                                >
                                                    {PropertyKeys.length.toLocaleString()}
                                                </p>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {PropertyKeys.length.toLocaleString()}
                                            </TooltipContent>
                                        </Tooltip>
                                        :
                                        <Loader2 className="animate-spin" />
                                }
                                {
                                    PropertyKeys && PropertyKeys.length > maxItemsForSearch &&
                                    <div className="basis-0 grow flex gap-1 items-center">
                                        <Search size={14} />
                                        <Input aria-label="Search property keys" value={propertyKeysSearch} onChange={(e) => setPropertyKeysSearch(e.target.value)} className="w-1 grow" />
                                    </div>
                                }
                            </div>
                            <div className="p-2 overflow-auto">
                                <ul className="flex gap-1 flex-wrap text-sm text-foreground/80 leading-relaxed list-none p-0 m-0" role="list">
                                    {
                                        PropertyKeys && PropertyKeys.filter(key => key.toLowerCase().includes(propertyKeysSearch.toLowerCase())).sort((a, b) => a.localeCompare(b)).map((key, index, arr) => (
                                            <li key={key} className="inline">
                                                <Button
                                                    title={`MATCH (e) WHERE e.${key} IS NOT NULL RETURN e\nUNION\nMATCH ()-[e]-() WHERE e.${key} IS NOT NULL RETURN e`}
                                                    className="inline text-foreground/80 hover:text-primary transition-colors"
                                                    onClick={() => runQuery(
                                                        `MATCH (e) WHERE e.${key} IS NOT NULL RETURN e\nUNION\nMATCH ()-[e]-() WHERE e.${key} IS NOT NULL RETURN e`
                                                    )}
                                                    disabled={isQueryLoading}
                                                    label={index < arr.length - 1 ? `${key}, ` : key}
                                                />
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        </div>
                    </>
                ) : (
                    <CustomizeStylePanel
                        label={customizingLabel}
                        onClose={() => setCustomizingLabel(null)}
                    />
                )
            }
        </div>
    );
}