import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { Loader2, X, Palette, Network, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, InfoLabel } from "@/lib/utils";
import { getContrastTextColor } from "@falkordb/canvas";
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
        <div aria-disabled={nodesCount === undefined || edgesCount === undefined} data-testid="graphInfoPanel" className={cn(`relative h-full w-full p-2 grid grid-rows-[max-content_max-content_max-content_1fr_1fr_1fr] gap-2`)}>
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
                        <div className=" pr-5 w-full flex justify-between items-center gap-1">
                            <h1 className="text-2xl">Graph Info</h1>
                            <Network size={25} />
                        </div>
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
                                                    ({nodesCount.toLocaleString()})
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
                                        <Search size={16} />
                                        <Input aria-label="Search node labels" value={nodesSearch} onChange={(e) => setNodesSearch(e.target.value)} className="w-1 grow" />
                                    </div>
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
                                {Array.from(Labels.values()).filter(label => label.name.toLowerCase().includes(nodesSearch.toLowerCase())).sort((a, b) => b.count - a.count).map((label) => {
                                    const name = label.name || "Empty";
                                    const labelColor = label.style.color;

                                    return (
                                        <li key={`${name}-${labelColor}`} className="max-w-full flex gap-1 overflow-x-hidden">
                                            <Button
                                                style={{
                                                    backgroundColor: labelColor,
                                                    color: getContrastTextColor(labelColor)
                                                }}
                                                className="w-fit max-w-[calc(100%-24px)] h-6 p-2 rounded-full flex justify-center items-center SofiaSans hover:opacity-80 transition-opacity"
                                                data-testid={`graphInfo${name}Node`}
                                                title={`MATCH (n:${name}) RETURN n
                                                    #: ${label.count.toLocaleString()}`}
                                                label={name}
                                                onClick={() => runQuery(`MATCH (n:${name}) RETURN n`)}
                                                disabled={isQueryLoading}
                                            />
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        className="h-6 w-6 p-1 rounded-full flex justify-center items-center bg-muted hover:bg-muted/80"
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
                                                    ({edgesCount.toLocaleString()})
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
                                        <Search size={16} />
                                        <Input aria-label="Search relationship types" value={edgesSearch} onChange={(e) => setEdgesSearch(e.target.value)} className="w-1 grow" />
                                    </div>
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
                                {Array.from(Relationships.values()).filter(relationship => relationship.name.toLowerCase().includes(edgesSearch.toLowerCase())).sort((a, b) => b.count - a.count).map((relationship) => {
                                    const relationshipColor = relationship.style.color;
                                    const textColor = getContrastTextColor(relationshipColor);

                                    return (
                                        <li key={relationship.name} className="max-w-full">
                                            <Button
                                                title={`MATCH p=()-[:${relationship.name}]-() RETURN p
                                                    #: ${relationship.count.toLocaleString()}`}
                                                style={{
                                                    backgroundColor: relationshipColor,
                                                    color: textColor,
                                                    clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)',
                                                }}
                                                className="h-6 w-fit px-2 py-1 flex justify-center items-center SofiaSans hover:opacity-80 transition-opacity"
                                                data-testid={`graphInfo${relationship.name}Edge`}
                                                label={relationship.name}
                                                onClick={() => runQuery(`MATCH p=()-[:${relationship.name}]-() RETURN p`)}
                                                disabled={isQueryLoading}
                                            />
                                        </li>
                                    );
                                })}
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
                                                    ({PropertyKeys.length.toLocaleString()})
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
                                        <Search size={16} />
                                        <Input aria-label="Search property keys" value={propertyKeysSearch} onChange={(e) => setPropertyKeysSearch(e.target.value)} className="w-1 grow" />
                                    </div>
                                }
                            </div>
                            <ul className="flex flex-wrap gap-2 p-2 overflow-auto">
                                {
                                    PropertyKeys && PropertyKeys.filter(key => key.toLowerCase().includes(propertyKeysSearch.toLowerCase())).sort((a, b) => a.localeCompare(b)).map((key) => (
                                        <li key={key} className="max-w-full">
                                            <Button
                                                title={`MATCH (e) WHERE e.${key} IS NOT NULL RETURN e\nUNION\nMATCH ()-[e]-() WHERE e.${key} IS NOT NULL RETURN e`}
                                                className="h-6 w-full p-2 bg-secondary flex justify-center items-center rounded text-foreground SofiaSans hover:opacity-80 transition-opacity"
                                                label={key}
                                                onClick={() => runQuery(
                                                    `MATCH (e) WHERE e.${key} IS NOT NULL RETURN e\nUNION\nMATCH ()-[e]-() WHERE e.${key} IS NOT NULL RETURN e`
                                                )}
                                                disabled={isQueryLoading}
                                            />
                                        </li>
                                    ))
                                }
                            </ul>
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