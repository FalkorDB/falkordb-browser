import { useCallback, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import { preflightQuery } from "@/lib/queryPreflight";
import { CsvLoadContext } from "./provider";
import ToastButton from "./ToastButton";

/**
 * Gate a query on the pre-flight checks in `lib/queryPreflight`.
 *
 * Syntax is the editor's business; this is about queries that parse but that we
 * already know the server will reject — today, a `LOAD CSV` source FalkorDB
 * cannot fetch. The Run button deliberately stays enabled (the query is not
 * *malformed*), so this runs at submit time and blocks the request there,
 * offering the upload flow when uploading the file is what would fix it.
 *
 * Returns `true` when the query was blocked, i.e. the caller must not run it.
 */
export default function useQueryPreflight() {
    const { toast } = useToast();
    const { fileUriSupported, uploadEnabled, openCsvUpload } = useContext(CsvLoadContext);

    return useCallback((query: string): boolean => {
        const [issue] = preflightQuery(query, { fileUriSupported });
        if (!issue) return false;

        const canUpload = uploadEnabled && issue.fixableByUpload;

        toast({
            title: "This query cannot run",
            description: canUpload
                ? `${issue.message} ${issue.hint} Upload the CSV instead and the browser will store it and fill in the URI for you.`
                : `${issue.message} ${issue.hint}`,
            variant: "destructive",
            query,
            action: canUpload ? <ToastButton label="Upload CSV" onClick={openCsvUpload} /> : undefined,
        });

        return true;
    }, [toast, fileUriSupported, uploadEnabled, openCsvUpload]);
}
