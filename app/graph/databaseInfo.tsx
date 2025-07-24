import { useCallback, useContext, useEffect, useState } from "react";
import { securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/ui/Button";
import { GraphContext, IndicatorContext } from "../components/provider";

export default function DatabaseInfo() {
    const { setIndicator } = useContext(IndicatorContext);
    const { graphName, nodesCount, edgesCount, runQuery } = useContext(GraphContext);
    const { toast } = useToast();

    const [propertyKeys, setPropertyKeys] = useState<string[]>([]);
    const [indexes, setIndexes] = useState<string[]>([]);
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
            fetchInfo("(index)"),
        ]).then(async ([newLabels, newRelationships, newPropertyKeys, newIndexes]) => {
            setLabels(newLabels);
            setRelationships(newRelationships);
            setPropertyKeys(newPropertyKeys);
            setIndexes(newIndexes);
        });
    }, [fetchInfo]);

    return (
        <div className="p-4">
            <h1>Database Information</h1>
            <div>
                <h2>Nodes ({nodesCount})</h2>
                <div>
                    <h2>Labels ({labels.length})</h2>
                    <ul>
                        {labels.map((label) => (
                            <li key={label}>
                                <Button label={label} onClick={() => runQuery(`MATCH (n:${label}) RETURN n`)} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div>
                <h2>Edges ({edgesCount})</h2>
                <div>
                    <h2>Relationships ({relationships.length})</h2>
                    <ul>
                        {relationships.map((relationship) => (
                            <li key={relationship}>
                                <Button label={relationship} onClick={() => runQuery(`MATCH ()-[e:${relationship}]-() RETURN e`)} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div>
                <h2>Property Keys ({propertyKeys.length})</h2>
                <ul>
                    {propertyKeys.map((key) => (
                        <li key={key}>
                            <Button
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
            <div>
                <h2>Indexes ({indexes.length})</h2>
                <ul>
                    {indexes.map((index) => (
                        <li key={index}>
                            <Button label={index} onClick={() => runQuery(`CALL db.index.fulltext.queryNodes('${index}', '${index}')`)} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}