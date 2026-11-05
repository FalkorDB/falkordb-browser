"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Copy, FileCode2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { copyText } from "@/lib/clipboard";
import Button from "./ui/Button";

interface Props {
    query: string;
    onInsert: (query: string) => void;
    title?: string;
    insertDisabled?: boolean;
    insertDisabledReason?: string;
    collapsible?: boolean;
    testIds: { query: string; copy: string; insert: string };
}

export default function SuggestedQuery({
    query,
    onInsert,
    title = "Suggested query",
    insertDisabled = false,
    insertDisabledReason,
    collapsible = false,
    testIds,
}: Props) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [canCollapse, setCanCollapse] = useState(false);
    const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queryRef = useRef<HTMLPreElement>(null);
    const contentId = useId();

    useEffect(() => {
        setCopied(false);
        setCollapsed(false);
        setCanCollapse(false);
        return () => {
            if (copyResetRef.current) clearTimeout(copyResetRef.current);
        };
    }, [query]);

    useEffect(() => {
        const element = queryRef.current;
        if (!collapsible || collapsed || !element) return undefined;
        const measure = () => {
            setCanCollapse(element.scrollHeight > 64);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [collapsible, collapsed, query]);

    const handleCopy = async () => {
        if (!await copyText(navigator.clipboard?.writeText?.bind(navigator.clipboard), query)) {
            toast({
                title: "Couldn't copy query",
                description: "Clipboard access is unavailable. Select and copy the query manually.",
                variant: "destructive",
            });
            return;
        }
        setCopied(true);
        if (copyResetRef.current) clearTimeout(copyResetRef.current);
        copyResetRef.current = setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="w-full min-w-0 shrink-0 overflow-hidden rounded-lg border border-border" data-testid="suggestedQuery">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/20 px-4 py-2 mobile:px-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <FileCode2 size={16} className="shrink-0 text-primary" />
                    {title}
                </h3>
                <div className="flex items-center gap-1">
                    {collapsible && canCollapse && (
                        <Button
                            title={collapsed ? "Expand query" : "Collapse query"}
                            aria-expanded={!collapsed}
                            aria-controls={contentId}
                            className="min-h-11 min-w-11 justify-center"
                            onClick={() => setCollapsed(value => !value)}
                        >
                            <ChevronDown size={16} className={collapsed ? "" : "rotate-180"} />
                        </Button>
                    )}
                    <Button data-testid={testIds.copy} onClick={() => void handleCopy()} className="min-h-11 gap-2 px-2 text-sm" aria-label={copied ? "Query copied" : "Copy suggested query"}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "Copied!" : "Copy"}
                    </Button>
                </div>
            </div>
            <pre
                ref={queryRef}
                id={contentId}
                data-testid={testIds.query}
                className={collapsed
                    ? "truncate bg-zinc-950 p-3 font-mono text-sm text-emerald-300"
                    : "max-h-72 overflow-auto whitespace-pre-wrap break-words bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-emerald-300 mobile:p-3"}
                tabIndex={0}
                aria-label={title}
            >
                {query}
            </pre>
            <div className="flex flex-col gap-3 border-t border-border p-3">
                {insertDisabledReason && <p className="text-xs text-muted-foreground">{insertDisabledReason}</p>}
                <Button variant="Primary" className="min-h-11 w-full justify-center" data-testid={testIds.insert} disabled={insertDisabled} onClick={() => onInsert(query)}>
                    Insert into editor
                </Button>
                <p className="text-center text-xs text-muted-foreground">Inserts the suggestion without running it.</p>
            </div>
        </section>
    );
}
