import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import GraphsList from "./GraphList";
import Editor, { Monaco } from "@monaco-editor/react"
import { editor, languages } from "monaco-editor";

export class QueryState {
    constructor(
        public query: string,
        public graphName: string,
    ) { }
}

const cypherKeywords: string[] = [
    "CREATE",
    "MATCH",
    "WHERE",
    "RETURN",
    "OPTIONAL MATCH",
    "WITH",
    "ORDER BY",
    "SKIP",
    "LIMIT",
    "UNION",
    "UNION ALL",
    "LOAD CSV",
    "START",
    "MERGE",
    "DELETE",
    "DETACH DELETE",
    "SET",
    "REMOVE",
    "FOREACH",
    "CALL",
    "YIELD",
    "USING",
    "INDEX",
    "EXPLAIN",
    "PROFILE"
];


export function Query({ onSubmit, onQueryUpdate, className = "" }: {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
    onQueryUpdate: (state: QueryState) => void,
    className: string
}) {
    const [query, setQuery] = useState('MATCH (n)-[e]-() RETURN n,e LIMIT 100');
    const [graphName, setGraphName] = useState('');
    const [nodeLK, setNodeLK] = useState<{ lable: string, keys: string[] } | null>(null);
    const [edgeLK, setEdgeLK] = useState<{ lable: string, keys: string[] } | null>(null);

    const suggestions = [...cypherKeywords.map(keyword => ({ label: keyword, kind: languages.CompletionItemKind.Keyword, insertText: keyword}))]
    
    useEffect(() => {
        if (graphName) {
            const run = async () => {
                const schema = await getSchema()
                setNodeLK(schema.resultN)
                setEdgeLK(schema.resultE)
            }
            run()
        }
    }, [graphName])

    function handleEditorWillMount(monaco: Monaco) {
        console.log(suggestions);
        monaco.languages.register({ id: 'cypherX' });
        monaco.languages.setMonarchTokensProvider('cypherX', {
            tokenizer: {
                root: [
                    [/\/\/.*$/, 'comment'],
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"/, 'string', '@string'],
                    [`/(${cypherKeywords.join("|")})\b/i`, 'keyword'],
                    [/[a-z_$][\w$]*/, 'identifier'],
                    [/\b\d+\b/, 'number']
                ],
                string: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, 'string', '@pop']
                ]
            }
        });

        monaco.languages.registerCompletionItemProvider('cypherX', {
            provideCompletionItems: (model, position) => {
                return { 
                    suggestions,
                 } as languages.CompletionList;
            },
        });
      }

    const getSchema = async () => {
        const result = await fetch(`/api/graph/${encodeURIComponent(graphName.trim())}/schema`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return await result.json()
    }

    onQueryUpdate(new QueryState(query, graphName))

    return (
        <form
            className={cn("flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0", className)}
            onSubmit={onSubmit}>
            <div className="items-center flex flex-row space-x-3">
                <Label htmlFor="query" className="text">Query</Label>
                <GraphsList onSelectedGraph={setGraphName} />
            </div>
            <div className="flex flex-row space-x-3 w-full md:w-8/12">
                <Editor
                    defaultLanguage="cypherX"
                    language="cypherX"
                    onChange={(val) => val && setQuery(val)}
                    theme="vs-dark"
                    options={{
                        suggest: {
                            showKeywords: true,
                        },
                        minimap: { enabled: false },
                        lineNumbers: "off",
                        wordWrap: "on",
                        automaticLayout: true,
                    }}
                    beforeMount={handleEditorWillMount}
                />
                <Button type="submit">Run</Button>
            </div>
        </form>
    )
}