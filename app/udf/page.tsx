"use client";

import { useContext, useEffect } from "react";
import { securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { IndicatorContext, UDFContext } from "../components/provider";
import Spinning from "../components/ui/spinning";

const EditorComponent = dynamic(() => import("../components/EditorComponent"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-background flex justify-center items-center border border-border rounded-lg">
        <Spinning />
    </div>,
});
export default function Page() {

    const { setUdfList, selectedUdf, setSelectedUdf } = useContext(UDFContext);
    const { setIndicator } = useContext(IndicatorContext);

    const { toast } = useToast();

    useEffect(() => {
        (async () => {
            const res = await securedFetch("/api/udf", {
                method: "GET",
            }, toast, setIndicator);

            if (!res.ok) return;

            const data = await res.json();
            setUdfList(data.result);

            if (data.result.length > 0) {
                setSelectedUdf(data.result[0]);
            }
        })();
    }, [setIndicator, setSelectedUdf, setUdfList, toast]);

    return (
        <div className="Page">
            <EditorComponent
                value={selectedUdf || ""}
                language="javascript"
                height="100%"
                readOnly
            />
        </div>
    );
}