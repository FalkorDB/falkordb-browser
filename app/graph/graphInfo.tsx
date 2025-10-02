import { useContext } from "react";
import { Loader2, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Button from "../components/ui/Button";
import { GraphContext, QueryLoadingContext } from "../components/provider";

export default function GraphInfoPanel({ onClose }: { onClose: () => void }) {
    const { graphInfo, nodesCount, edgesCount, runQuery, graphName } = useContext(GraphContext);
    const { isQueryLoading } = useContext(QueryLoadingContext)

    return (
        <div className={cn(`relative h-full w-full p-6 grid grid-rows-[max-content_max-content_minmax(0,max-content)_minmax(0,max-content)_minmax(0,max-content)] gap-8 border-r border-border`)}>
            <Button
                className="absolute top-2 right-2"
                title="Close"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl">Graph Information</h1>
            <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                    <h2>Graph Name:</h2>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="truncate pointer-events-auto text-1.5xl SofiaSans">{graphName}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                            {graphName}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
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
                            :
                            <Loader2 data-testid="nodesCountLoader" className="animate-spin" />
                    }
                </div>
                <ul className="flex flex-wrap gap-2 p-2 overflow-auto">
                    <li className="max-w-full">
                        <Button
                            className="pt-1 h-6 w-6 rounded-full flex justify-center items-center bg-border text-white"
                            label="*"
                            title="All labels"
                            onClick={() => runQuery(`MATCH (n) RETURN n`)}
                            disabled={isQueryLoading}
                        />
                    </li>
                    {Array.from(graphInfo.Labels.values()).filter(({ name }) => !!name).map(({ name, color }) => (
                        <li key={name} className="max-w-full">
                            <Button
                                style={{ backgroundColor: color }}
                                className="h-6 w-full p-2 rounded-full flex justify-center items-center text-black SofiaSans"
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
                            label="*"
                            title="All relationships"
                            onClick={() => runQuery(`MATCH p=()-[]-() RETURN p`)}
                            disabled={isQueryLoading}
                        />
                    </li>
                    {Array.from(graphInfo.Relationships.values()).map(({ name, color }) => (
                        <li key={name} className="max-w-full">
                            <Button
                                style={{ backgroundColor: color }}
                                className="h-6 w-full p-2 rounded-full flex justify-center items-center text-black SofiaSans"
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
                        graphInfo.PropertyKeys !== undefined ?
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p
                                        data-testid="propertyKeysCount"
                                        className="truncate pointer-events-auto SofiaSans"
                                    >
                                        ({graphInfo.PropertyKeys.length})
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {graphInfo.PropertyKeys.length}
                                </TooltipContent>
                            </Tooltip>
                            :
                            <Loader2 className="animate-spin" />
                    }
                </div>
                <ul className="flex flex-wrap gap-2 p-2 overflow-auto">
                    {
                        graphInfo.PropertyKeys && graphInfo.PropertyKeys.map((key) => (
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