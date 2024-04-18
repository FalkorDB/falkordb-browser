import { cn } from "@/lib/utils";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Copy, Edit, Maximize, Menu, Play, Trash2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { QueryState } from "./page"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Combobox from "../components/combobox";

export default function Query({ onSubmit, onMainSubmit, setMainQueryState, queryState, onDelete, className = "" }: {
    onMainSubmit?: (e: FormEvent<HTMLFormElement>, queryState: QueryState) => Promise<void>,
    setMainQueryState?: (queryState: QueryState) => void,
    onSubmit?: (e: FormEvent<HTMLFormElement>, queryState: QueryState) => Promise<any>,
    queryState?: QueryState,
    onDelete: (graphName: string) => void,
    className: string,
}) {
    const lineHeight = 40
    const [query, setQuery] = useState<string | undefined>(queryState?.query);
    const [graphName, setGraphName] = useState(queryState?.graphName || '');
    const { theme, systemTheme } = useTheme()
    const [graphs, setGraphs] = useState<string[]>([]);
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")
    const inputCopyRef = useRef<HTMLInputElement>(null)
    const inputRenameRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const iconSize = 22

    const getHeight = () => {
        if (!query) return lineHeight
        switch (query.split("\n").length) {
            case 1: return lineHeight
            case 2: return lineHeight * 2
            case 3: return lineHeight * 3
            default: return lineHeight * 4
        }
    }

    const height = getHeight();

    useEffect(() => {
        fetch('/api/graph', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((result) => {
                if (result.status < 300) {
                    return result.json()
                }
                toast({
                    title: "Error",
                    description: result.text(),
                })
                return { result: [] }
            }).then((result) => {
                setGraphs(result.result.graphs ?? [])
            })
    }, [toast])

    useEffect(() => {
        if (setMainQueryState) {
            setMainQueryState({ id: 0, graphName, query })
        }
    }, [query, graphName])

    const handelDelete = (graphName: string) => {
        setGraphName('')
        onDelete(graphName)
        setGraphs((prevGraphs: string[]) => [...prevGraphs.filter(graph => graph !== graphName)]);
        fetch(`/api/graph/${encodeURIComponent(graphName)}`, {
            method: 'DELETE',
        }).then(() =>
            toast({
                title: 'Graph Deleted',
                description: `Graph ${graphName} deleted`,
            })
        ).catch((error) => {
            toast({
                title: "Error",
                description: error.message,
            })
        })
    }

    const handelCopy = async () => {
        const newName = inputCopyRef.current?.value
        if (!newName) return
        const response = await fetch(`/api/graph/${encodeURIComponent(graphName)}?newName=${newName}`, {
            method: 'POST',
        })
        const json = await response.json()
        if (response.status >= 300) {
            toast({
                title: "Error",
                description: json.message,
            })
            return
        }
        setGraphs(prev => [...prev, newName])
    }

    const handelRename = async () => {
        const newName = inputRenameRef.current?.value
        if (!newName) return
        const response = await fetch(`/api/graph/${encodeURIComponent(graphName)}?newName=${newName}`, {
            method: 'PATCH',
        })
        const json = await response.json()
        if (response.status >= 300) {
            toast({
                title: "Error",
                description: json.message,
            })
            return
        }
        setGraphName(newName)
        setGraphs(prev => [...prev.filter(name => name !== graphName), newName])
        toast({
            title: "Rename",
            description: `Graph ${graphName} Rename to ${newName}`,
        })
    }

    const addOption = (newGraph: string) => {
        setGraphs((prevGraphs: string[]) => [...prevGraphs, newGraph]);
        setGraphName(newGraph)
    }

    return (
        <form
            className={cn("w-full flex xl:flex-row md:flex-col gap-2 items-start", className)}
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                if (onSubmit) {
                    await onSubmit(e, { id: 0, graphName, query })
                } else if (onMainSubmit) {
                    await onMainSubmit(e, { id: 0, graphName, query })
                    setQuery("")
                }
            }}
        >
            {
                queryState ?
                    <p className="text-xl pt-1">{graphName}</p>
                    : <Combobox addOption={addOption} options={graphs} selectedValue={graphName} setSelectedValue={setGraphName} />
            }
            <div className="w-1 grow relative">
                <Editor
                    className="border rounded-lg overflow-hidden"
                    height={height}
                    value={query}
                    onChange={setQuery}
                    theme={`${darkmode ? "vs-dark" : "light"}`}
                    language="cypher"
                    options={{
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 2,
                        scrollBeyondLastLine: false,
                        suggest: {
                            showKeywords: true,
                        },
                        minimap: { enabled: false },
                        wordWrap: "on",
                        lineHeight,
                        fontSize: 30,
                        find: {
                            addExtraSpaceOnTop: false,
                            autoFindInSelection: "never",
                            seedSearchStringFromSelection: "never",
                        },
                        scrollbar: {
                            horizontal: "hidden",
                        },
                    }}
                />
                {
                    !queryState &&
                    <Dialog>
                        <DialogTrigger asChild>
                            <button title="Maximize" className="absolute top-2 right-2" type="button">
                                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                                <Maximize />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="h-4/5 max-w-[80%]">
                            <Editor
                                value={query}
                                onChange={setQuery}
                                theme={`${darkmode ? "vs-dark" : "light"}`}
                                language="cypher"
                            />
                        </DialogContent>
                    </Dialog >
                }
            </div>
            <button title="Run Query" className="pt-2" type="submit">
                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                <Play />
            </button>
            {
                !queryState && graphName &&
                <DropdownMenu>
                    <DropdownMenuTrigger title="menu" className="pt-2 focus-visible:outline-none">
                        <Menu />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} title="Delete">
                                    <Trash2 size={iconSize} />
                                    <DropdownMenuLabel>Delete</DropdownMenuLabel>
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure you?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you absolutely sure you want to delete {graphName}?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handelDelete(graphName)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <DropdownMenuSeparator />
                        <Dialog>
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} title="Rename">
                                    <Copy size={iconSize} />
                                    <DropdownMenuLabel>Rename</DropdownMenuLabel>
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        <h1>Rename Graph</h1>
                                    </DialogTitle>
                                    <DialogDescription>
                                        <Input required ref={inputRenameRef} placeholder="Enter Graph Name..." />
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button onClick={() => handelRename()}>
                                            <span>Rename</span>
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <DropdownMenuSeparator />
                        <Dialog>
                            <DialogTrigger>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} title="Copy">
                                    <Edit size={iconSize} />
                                    <DropdownMenuLabel>Copy</DropdownMenuLabel>
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        <h1>Copy Graph</h1>
                                    </DialogTitle>
                                    <DialogDescription>
                                        <Input required ref={inputCopyRef} placeholder="Enter Copied Graph Name..." />
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button onClick={() => handelCopy()}>
                                            <span>Copy</span>
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            }
        </form >
    )
}