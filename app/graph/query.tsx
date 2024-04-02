import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Menu, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Editor, { Monaco } from "@monaco-editor/react";
import { languages, editor } from "monaco-editor";
import GraphsList from "./GraphList";

export class QueryState {
    constructor(
        public query: string,
        public graphName: string,
    ) { }
}

const cypherKeywords = [
    "CALL",
    "CREATE",
    "DELETE",
    "DETACH",
    "FOREACH",
    "LOAD",
    "MATCH",
    "MERGE",
    "OPTIONAL",
    "REMOVE",
    "RETURN",
    "SET",
    "START",
    "UNION",
    "UNWIND",
    "WITH",
    "LIMIT",
    "ORDER",
    "SKIP",
    "WHERE",
    "YIELD",
    "]ASC",
    "ASCENDING",
    "ASSERT",
    "BY",
    "ALL",
    "CASE",
    "COUNT",
    "ELSE",
    "END",
    "EXISTS",
    "THEN",
    "AND",
    "AS",
    "CONTAINS",
    "DISTINCT",
    "ENDS",
    "IN",
    "IS",
    "NOT",
    "OR",
    "CONSTRAINT",
    "CREATE",
    "DROP",
    "EXISTS",
    "INDEX",
    "NODE",
    "KEY",
    "UNIQUE",
    "STARTS",
    "XOR",
    "WHEN",
    "CSV",
    "DESC",
    "DESCENDING",
    "ADD",
    "DO",
    "FOR",
    "MANDATORY",
    "OF",
    "REQUIRE",
    "SCALAR",
    "ON",
    "INDEX",
    "JOIN",
    "false",
    "null",
    "true",
    "SCAN",
    "USING"
]

export function Query({ onSubmit, onQueryUpdate, className = "" }: {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<boolean>,
    onQueryUpdate: (state: QueryState) => void,
    className: string
}) {
    const [query, setQuery] = useState('');
    const [graphName, setGraphName] = useState('');
    const [onDelete, setOnDelete] = useState<boolean>(false);
    const Monaco = useRef<Monaco | null>();
    const monacoEditor = useRef<editor.IStandaloneCodeEditor | null>();
    const { toast } = useToast();

    useEffect(() => {
        const monaco = Monaco.current
        let editor = monacoEditor.current

        if (monaco && editor) {
            const run = async () => {
                const suggestions: languages.CompletionItem[] = []
                const schema = await getSchema()
                suggestions.push(
                    ...schema.labels.map((label: string) => ({
                        label: label,
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: label,
                    })),
                    ...schema.props.map((prop: string) => ({
                        label: prop,
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: prop,
                    })),
                    ...schema.relationships.map((relationship: string) => ({
                        label: relationship,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: relationship,
                    }))
                )

                monaco.languages.registerCompletionItemProvider("cypher", {
                    provideCompletionItems: () => {
                        return {
                            suggestions
                        } as languages.ProviderResult<languages.CompletionList>
                    }
                })
            }
            run()
        }
    }, [graphName])

    const getSchema = async () => {
        debugger
        const data = await fetch(`/api/graph/${encodeURIComponent(graphName)}`, {
            method: "GET"
        })
        if (!data.ok) {
            return
        }
        return await data.json()
    }

    const handelEditorWillMounted = (monaco: Monaco) => {
        monaco.languages.register({ id: "cypher" })
        monaco.languages.registerCompletionItemProvider("cypher", {
            provideCompletionItems: () => {
                return {
                    suggestions: cypherKeywords.map(keyword => {
                        return {
                            label: keyword,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: keyword,
                        }
                    })
                } as languages.ProviderResult<languages.CompletionList>
            }
        })
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    }

    onQueryUpdate(new QueryState(query, graphName))

    const handleDelete = () => {
        fetch(`/api/graph/${encodeURIComponent(graphName)}`, {
            method: 'DELETE',
        }).then(res => res.json()).then((data) => {
            toast({
                title: "Delete graph",
                description: data.message,
            })
            setOnDelete(prev => !prev)
            setGraphName('')
        }).catch(err => {
            toast({
                title: "Error",
                description: (err as Error).message,
            })
        })
    }

    return (
        <form
            className={cn("flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0", className)}
            onSubmit={async (e) => {
                await onSubmit(e) && setQuery('')
            }}>
            <div className="items-center flex flex-row space-x-3">
                <Label htmlFor="query" className="text">Query</Label>
                <GraphsList onDelete={onDelete} onSelectedGraph={setGraphName} />
            </div>
            <div className="flex flex-row space-x-3 w-full md:w-8/12 items-center">
                <Editor
                    value={query}
                    onChange={(val) => val && setQuery(val)}
                    theme="vs-dark"
                    language="cypher"
                    options={{
                        suggest: {
                            showKeywords: true,
                            
                        },
                        minimap: { enabled: false },
                        wordWrap: "on",
                        lineNumbers: "off",
                        lineHeight: 40,
                        fontSize: 30,
                    }}
                    onMount={(editor, monaco) => {
                        Monaco.current = monaco
                        monacoEditor.current = editor
                    }}
                    beforeMount={handelEditorWillMounted}
                />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="submit" className="mr-16"><Search /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Query</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <Menu />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel className="flex justify-around">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {graphName &&
                            <DropdownMenuItem className="flex justify-around">
                                <AlertDialogTrigger className="flex flex-row items-center gap-x-2">
                                    <Trash2 />
                                    <span>Delete graph</span>
                                </AlertDialogTrigger>
                            </DropdownMenuItem>
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure you?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you absolutely sure you want to delete {graphName}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete()}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    )
}