import { useContext } from "react";
import { Loader2, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Button from "../components/ui/Button";
import { GraphContext } from "../components/provider";

export default function GraphInfoPanel({ onClose }: { onClose: () => void }) {
    const { graphInfo, nodesCount, edgesCount, runQuery } = useContext(GraphContext);

    return (
        <div className="relative p-6 flex flex-col gap-8 overflow-y-auto  max-w-[20dvw]">
            <Button
                className="absolute top-2 right-2"
                title="Close"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
            <h1>Graph Information</h1>
            <div className="flex flex-col gap-2">
                <h2>Nodes {
                    nodesCount !== undefined ?
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p
                                    data-testid="nodesCount"
                                    className="truncate pointer-events-auto"
                                >
                                    {nodesCount}
                                </p>
                            </TooltipTrigger>
                            <TooltipContent>
                                {nodesCount}
                            </TooltipContent>
                        </Tooltip>
                        :
                        <Loader2 className="animate-spin" />
                }</h2>
                <ul className="flex flex-wrap gap-2 p-2">
                    <li className="max-w-full">
                        <Button
                            className="h-6 w-full p-2 rounded-full flex justify-center items-center bg-gray-500"
                            label="*"
                            title="All labels"
                            onClick={() => runQuery(`MATCH (n) RETURN n`)}
                        />
                    </li>
                    {Array.from(graphInfo.Labels.values()).filter(({ name }) => !!name).map(({ name, color }) => (
                        <li key={name} className="max-w-full">
                            <Button
                                style={{ backgroundColor: color }}
                                className="h-6 w-full p-2 rounded-full flex justify-center items-center"
                                label={name}
                                onClick={() => runQuery(`MATCH (n:${name}) RETURN n`)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2">
                <h2>Edges {
                    edgesCount !== undefined ?
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p
                                    data-testid="edgesCount"
                                    className="truncate pointer-events-auto"
                                >
                                    {edgesCount}
                                </p>
                            </TooltipTrigger>
                            <TooltipContent>
                                {edgesCount}
                            </TooltipContent>
                        </Tooltip>
                        :
                        <Loader2 className="animate-spin" />
                }</h2>
                <ul className="flex flex-wrap gap-2 p-2">
                    <li className="max-w-full">
                        <Button
                            className="h-6 w-full p-2 rounded-full flex justify-center items-center bg-gray-500"
                            label="*"
                            title="All relationships"
                            onClick={() => runQuery(`MATCH p=()-[]-() RETURN p`)}
                        />
                    </li>
                    {Array.from(graphInfo.Relationships.values()).map(({ name, color }) => (
                        <li key={name} className="max-w-full">
                            <Button
                                style={{ backgroundColor: color }}
                                className="h-6 w-full p-2 rounded-full flex justify-center items-center"
                                label={name}
                                onClick={() => runQuery(`MATCH p=()-[:${name}]-() RETURN p`)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2">
                <h2>Property Keys ({graphInfo.PropertyKeys.length})</h2>
                <ul className="flex flex-wrap gap-2 p-2">
                    {graphInfo.PropertyKeys.map((key) => (
                        <li key={key} className="max-w-full">
                            <Button
                                className="h-6 w-full p-2 bg-gray-500 flex justify-center items-center rounded-full"
                                label={key}
                                onClick={() => runQuery(
                                    `MATCH (e) WHERE e.${key} IS NOT NULL RETURN e
                                     UNION
                                     MATCH ()-[e]-() WHERE e.${key} IS NOT NULL RETURN e`
                                )}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}