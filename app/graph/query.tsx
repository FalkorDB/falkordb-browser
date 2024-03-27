import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import GraphsList from "./GraphList";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Menu, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";


export class QueryState {
    constructor(
        public query: string,
        public graphName: string,
    ) { }
}

export function Query({ onSubmit, onQueryUpdate, className = "" }: {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
    onQueryUpdate: (state: QueryState) => void,
    className: string
}) {
    const [query, setQuery] = useState('');
    const [graphName, setGraphName] = useState('');

    onQueryUpdate(new QueryState(query, graphName))

    const handelDelete = async () => {
        const result = await fetch(`/api/graph/${encodeURIComponent(graphName)}`, {
            method: 'DELETE',
        })
        console.log(result.status);
        if (result.status >= 300) {
            return
        }
        toast({
            title: "Delete",
            description: "Graph deleted successfully"
        })
    }

    return (
        <form
            className={cn("flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0", className)}
            onSubmit={onSubmit}>
            <div className="items-center flex flex-row space-x-3">
                <Label htmlFor="query" className="text">Query</Label>
                <GraphsList onSelectedGraph={setGraphName} />
            </div>
            <div className="flex flex-row space-x-3 w-full md:w-8/12 items-center">
                <Input id="query" className="border-gray-500 w-full"
                    placeholder="MATCH (n)-[e]-() RETURN n,e limit 100" type="text" onChange={(event) => setQuery(event.target.value)} />
                <Button type="submit" className="mr-16">Run</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button><Menu/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32 flex flex-col p-4 items-center mt-2 gap-y-2 rounded-lg bg-black border-white border">
                            <DropdownMenuItem onClick={() => handelDelete()} className="flex flex-row gap-x-2">
                                <Trash2/>
                                <span>delete</span>
                            </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </form>
    )
}