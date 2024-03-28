import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import GraphsList from "./GraphList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";


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
    const { toast } = useToast();

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
            </div>
            {graphName &&
                <AlertDialog>
                    <AlertDialogTrigger><Trash2 /></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure you?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you absolutely sure you want to delete {graphName}?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handelDelete()}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            }
        </form>
    )
}