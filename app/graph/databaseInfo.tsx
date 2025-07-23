import { useContext, useEffect, useState } from "react";
import { securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";
import { Label, Relationship } from "../api/graph/model";

export default function DatabaseInfo({ graph, nodesCount, edgesCount, labels, relationships, runQuery }: { graph: string, nodesCount: number, edgesCount: number, labels: Label[], relationships: Relationship[],  runQuery: (query: string) => Promise<void> }) {
    const { setIndicator } = useContext(IndicatorContext);
    const { toast } = useToast();

    const [propertyKeys, setPropertyKeys] = useState<string[]>([]);
    const [indexes, setIndexes] = useState<string[]>([]);

    useEffect(() => {
        Promise.all([
            securedFetch(`/api/graph/${graph}/suggestions?type=(label)`, {
                method: "POST",
            }, toast, setIndicator),
            securedFetch(`/api/graph/${graph}/suggestions?type=(relationship type)`, {
                method: "POST",
            }, toast, setIndicator),
            securedFetch(`/api/graph/${graph}/suggestions?type=(property key)`, {
                method: "POST",
            }, toast, setIndicator),
            securedFetch(`/api/graph/${graph}/suggestions?type=(index)`, {
                method: "POST",
            }, toast, setIndicator),
        ]).then(results => results.map(result => result.json())).then(async (results) => {
            const [newPropertyKeys, newIndexes] = await Promise.all(results);
            setPropertyKeys(newPropertyKeys);
            setIndexes(newIndexes);
        });
    }, [graph]);

    return (
        <div>
            <h1>Database Information</h1>
            <div>
                <h2>Nodes ({nodesCount})</h2>
                <div>
                    <h2>Labels ({labels.length})</h2>
                    <ul>
                        {labels.map((label) => (
                            <li key={label.name}>
                                <Button label={label.name} onClick={() => runQuery(`MATCH (n:${label.name}) RETURN n`)} />
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
                            <li key={relationship.name}>
                                <Button label={relationship.name} onClick={() => runQuery(`MATCH ()-[e:${relationship.name}]-() RETURN e`)} />
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