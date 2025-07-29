import { useCallback, useContext, useEffect, useState } from "react";
import { securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import Button from "../components/ui/Button";
import { GraphContext, IndicatorContext } from "../components/provider";

export default function GraphInfo({ onClose }: { onClose: () => void }) {
    const { setIndicator } = useContext(IndicatorContext);
    const { graph, graphName, nodesCount, edgesCount, runQuery } = useContext(GraphContext);
    const { toast } = useToast();

    const [propertyKeys, setPropertyKeys] = useState<string[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [relationships, setRelationships] = useState<string[]>([]);

    const fetchInfo = useCallback(async (type: string) => {
        if (!graphName) return []

        const result = await securedFetch(`/api/graph/${graphName}/info?type=${type}`, {
            method: "GET",
        }, toast, setIndicator);

        if (!result.ok) return []

        const json = await result.json();

        return json.result.data.map(({ info }: { info: string }) => info);
    }, [graphName, setIndicator, toast]);

    useEffect(() => {
        Promise.all([
            fetchInfo("(label)"),
            fetchInfo("(relationship type)"),
            fetchInfo("(property key)"),
        ]).then(async ([newLabels, newRelationships, newPropertyKeys]) => {
            setLabels(newLabels);
            setRelationships(newRelationships);
            setPropertyKeys(newPropertyKeys);
        });
    }, [fetchInfo, runQuery]);

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
                <h2>Nodes ({nodesCount})</h2>
                <ul className="flex flex-wrap gap-2 p-2">
                    <li className="max-w-full">
                        <Button
                            className="h-6 w-full p-2 rounded-full flex justify-center items-center bg-gray-500"
                            label="*"
                            title="All labels"
                            onClick={() => runQuery(`MATCH (n) RETURN n`)}
                        />
                    </li>
                    {labels.map((label) => (
                        <li key={label} className="max-w-full">
                            <Button
                                style={{ backgroundColor: graph.getLabelColorValue((graph.LabelsMap.get(label) || graph.createLabel([label])[0]).index) }}
                                className="h-6 w-full p-2 rounded-full flex justify-center items-center"
                                label={label}
                                onClick={() => runQuery(`MATCH (n:${label}) RETURN n`)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2">
                <h2>Edges ({edgesCount})</h2>
                <ul className="flex flex-wrap gap-2 p-2">
                    <li className="max-w-full">
                        <Button
                            className="h-6 w-full p-2 rounded-full flex justify-center items-center bg-gray-500"
                            label="*"
                            title="All relationships"
                            onClick={() => runQuery(`MATCH ()-[e]-() RETURN e`)}
                        />
                    </li>
                    {relationships.map((relationship) => (
                        <li key={relationship} className="max-w-full">
                            <Button
                                style={{ backgroundColor: graph.getLabelColorValue((graph.RelationshipsMap.get(relationship) || graph.createRelationship(relationship)).index) }}
                                className="h-6 w-full p-2 rounded-full flex justify-center items-center"
                                label={relationship}
                                onClick={() => runQuery(`MATCH ()-[e:${relationship}]-() RETURN e`)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2">
                <h2>Property Keys ({propertyKeys.length})</h2>
                <ul className="flex flex-wrap gap-2 p-2">
                    {propertyKeys.map((key) => (
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