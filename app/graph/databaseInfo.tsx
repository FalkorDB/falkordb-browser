import { useContext, useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { securedFetch } from "@/lib/utils";
import { IndicatorContext } from "../components/provider";
import { useToast } from "@/components/ui/use-toast";

export default function DatabaseInfo({ graph, nodesCount, edgesCount, runQuery }: { graph: string, nodesCount: number, edgesCount: number, runQuery: (query: string) => Promise<void> }) {
    const { setIndicator } = useContext(IndicatorContext);
    const { toast } = useToast();

    const [labels, setLabels] = useState<string[]>([]);
    const [relationshipTypes, setRelationshipTypes] = useState<string[]>([]);
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
            const [labels, relationshipTypes, propertyKeys, indexes] = await Promise.all(results);
            console.log(labels, relationshipTypes, propertyKeys, indexes);
            setLabels(labels);
            setRelationshipTypes(relationshipTypes);
            setPropertyKeys(propertyKeys);
            setIndexes(indexes);
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
                    <h2>Relationship Types ({relationshipTypes.length})</h2>
                    <ul>
                        {relationshipTypes.map((type) => (
                            <li key={type}>
                                <Button label={type} onClick={() => runQuery(`MATCH ()-[e:${type}]-() RETURN e`)} />
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