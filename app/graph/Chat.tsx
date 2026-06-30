import { cn, getTheme, Message, getActiveConnectionIdGlobal, toUserFriendlyMessage } from "@/lib/utils";
import { UDF_CHAT_MAX_LIBRARIES, UDF_CHAT_MAX_FUNCTIONS_PER_LIBRARY, UDF_CHAT_MAX_NAME_LENGTH } from "@/app/utils";
import { memo, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import { useTheme } from "next-themes";
import Image from "next/image";
import { ChevronDown, ChevronRight, Share2, Copy, Loader2, Play, Search, X, Send, Sparkles } from "lucide-react";
import { Tooltip as ShadTooltip, TooltipContent as ShadTooltipContent, TooltipTrigger as ShadTooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { GraphContext, IndicatorContext, QueryLoadingContext, BrowserSettingsContext, UDFContext } from "../components/provider";
import { detectProviderFromApiKey, detectProviderFromModel, getProviderDisplayName } from "@/lib/ai-provider-utils";
import ToastButton from "../components/ToastButton";
import { ShineBorder } from "@/components/ui/shine-border";
import { getConnectionItem, setConnectionItem, getConnectionPrefix } from "@/lib/connection-storage";

const mdInstance = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
});

const MarkdownMessage = memo(function MarkdownMessage({ content }: { content: string }) {
    const sanitizedHtml = useMemo(() => {
        const raw = typeof content === "string" ? content : String(content ?? "");
        return DOMPurify.sanitize(mdInstance.render(raw));
    }, [content]);

    return (
        <div
            data-testid="chatMessageMarkdown"
            className="text-sm markdown-body"

            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
});

// Return the last maxExchanges Q&A exchanges (each user message + its assistant replies counts as 1)
const getLastUserMessagesWithContext = (allMessages: Message[], maxExchanges: number) => {
    const userMessageIndices = allMessages
        .map((msg, index) => msg.role === "user" ? index : -1)
        .filter(index => index !== -1);

    if (userMessageIndices.length <= maxExchanges) return allMessages;

    // Start from the Nth-from-last user message
    const startIndex = userMessageIndices[userMessageIndices.length - maxExchanges];
    return allMessages.slice(startIndex);
};

interface Props {
    onClose: () => void
}

const getErrorStatus = (error: unknown) => {
    if (error instanceof Error && "status" in error && typeof error.status === "number") return error.status;
    return 0;
};

export default function Chat({ onClose }: Props) {
    const { resolvedTheme } = useTheme();
    const { currentTheme } = getTheme(resolvedTheme);
    const { setIndicator } = useContext(IndicatorContext);
    const { runQuery, graphName } = useContext(GraphContext);
    const { isQueryLoading } = useContext(QueryLoadingContext);
    const { udfList } = useContext(UDFContext);
    const { settings: { chatSettings: { secretKey, chatApiKeys, selectedChatApiKeyId, chatModelSource, localLlmProvider, localLlmEndpoint, model, maxSavedMessages } } } = useContext(BrowserSettingsContext);
    // Cypher Only toggle state, persisted per graph
    const [cypherOnly, setCypherOnly] = useState(false);

    const { toast } = useToast();
    const route = useRouter();

    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesList, setMessagesList] = useState<(Message | [Message[], boolean])[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [queryCollapse, setQueryCollapse] = useState<{ [key: string]: boolean }>({});
    const [collapseEligible, setCollapseEligible] = useState<{ [key: number]: boolean }>({});
    const textRefs = useRef<Map<number, HTMLElement>>(new Map());
    const observerRef = useRef<ResizeObserver | null>(null);
    const chatContainerRef = useRef<HTMLUListElement>(null);
    // Derived from messages — automatically in sync with trimmed message history
    const totalTokens = useMemo(
        () => messages.reduce((sum, m) => sum + (m.tokenUsage ?? 0), 0),
        [messages]
    );
    const lastMessageTokens = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].tokenUsage != null) return messages[i].tokenUsage!;
        }
        return null;
    }, [messages]);

    const queryCollapseRef = useRef(queryCollapse);
    queryCollapseRef.current = queryCollapse;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Create a single ResizeObserver that recomputes collapse eligibility on resize
    useEffect(() => {
        observerRef.current = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const el = entry.target as HTMLElement;
                textRefs.current.forEach((ref, i) => {
                    if (ref !== el) return;
                    const shouldCollapse = el.scrollHeight > 64;
                    // Only upgrade to eligible, never downgrade — collapsed items have small height
                    if (!shouldCollapse) return;
                    setCollapseEligible(prev => {
                        if (prev[i]) return prev;
                        return { ...prev, [i]: true };
                    });
                });
            }
        });

        return () => observerRef.current?.disconnect();
    }, []);

    const setTextRef = useCallback((i: number) => (r: HTMLElement | null) => {
        if (r) {
            textRefs.current.set(i, r);
            // Measure on mount — only set eligible if content is tall enough
            if (r.scrollHeight > 64) {
                setCollapseEligible(prev => {
                    if (prev[i]) return prev;
                    return { ...prev, [i]: true };
                });
            }
            observerRef.current?.observe(r);
        } else {
            const prev = textRefs.current.get(i);
            if (prev) observerRef.current?.unobserve(prev);
            textRefs.current.delete(i);
        }
    }, []);

    // Load messages and cypher only preference for current graph on mount
    useEffect(() => {
        if (!getConnectionPrefix()) return;
        const savedMessages = getConnectionItem(`chat-${graphName}`);
        const currentMessages = JSON.parse(savedMessages || "[]");
        setMessages(currentMessages);

        const savedCypherOnly = getConnectionItem(`cypherOnly-${graphName}`);
        setCypherOnly(savedCypherOnly === "true");
    }, [graphName, maxSavedMessages]);

    useEffect(() => {
        let statusGroup: Message[];

        if (messages.length > 0) {
            setConnectionItem(`chat-${graphName}`, JSON.stringify(getLastUserMessagesWithContext(messages, maxSavedMessages)));
        }

        const newMessagesList = messages.map((message, i): Message | [Message[], boolean] | undefined => {
            if (message.type === "Status") {
                if (messages[i - 1]?.type !== "Status") {
                    if (messages[i + 1]?.type !== "Status") return message;
                    statusGroup = [message];
                } else {
                    statusGroup.push(message);
                    if (messages[i + 1]?.type !== "Status") return [statusGroup, false];
                }
            } else {
                return message;
            }

            return undefined;
        }).filter(m => !!m);

        setMessagesList(newMessagesList);
    }, [maxSavedMessages, messages]);

    // Scroll to bottom whenever the rendered message list changes
    useEffect(() => {
        const el = chatContainerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messagesList]);

    const handleSetMessages = (newMessages: Message[] | Message) => {
        setMessages(newMessages instanceof Array ? newMessages : prev => [...prev, newMessages]);
    };

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();

        if (isLoading) {
            toast({
                title: "Please wait",
                description: "You are already sending a message",
                variant: "destructive",
            });
            return;
        }

        if (newMessage.trim() === "") {
            toast({
                title: "Please enter a message",
                description: "You cannot send an empty message",
                variant: "destructive",
            });
            return;
        }

        const ToastActionButton = <ToastButton label="Go to Settings" showUndo={false} onClick={() => {
            onClose();
            setTimeout(() => {
                route.push("/settings");
            }, 500);
        }}>
            Go to Settings
        </ToastButton>;

        if (!model) {
            toast({
                title: "No model selected",
                description: "Please select a model in the settings before sending a message",
                variant: "destructive",
                action: ToastActionButton
            });
            setIsLoading(false);
            return;
        }

        // Check if the selected model has the required key/source configured.
        const modelProvider = detectProviderFromModel(model);
        const selectedChatApiKey = chatApiKeys.find(chatApiKey => chatApiKey.id === selectedChatApiKeyId);
        const requestKey = selectedChatApiKey?.key || secretKey;
        if (chatModelSource === "api-key" && modelProvider !== "unknown" && modelProvider !== "ollama" && !requestKey) {
            const providerName = getProviderDisplayName(modelProvider);
            toast({
                title: "No API Key Provided",
                description: `Please provide a ${providerName} API key in the settings before sending a message`,
                variant: "destructive",
                action: ToastActionButton
            });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const newMessages = [...messages, { role: "user", type: "Text", content: newMessage } as const];

        handleSetMessages(newMessages);
        setNewMessage("");

        try {
            const chatHeaders = new Headers({ "Content-Type": "application/json" });
            const connectionId = getActiveConnectionIdGlobal();
            if (connectionId) chatHeaders.set("X-Connection-Id", connectionId);

            // Surface the instance's user-defined functions (already discovered + capability-gated into
            // UDFContext) so generated Cypher can call them. UDFEntry is [key, libraryName, key, functions]
            // (FalkorDB GRAPH.UDF LIST shape; see app/udf/udfPanel.tsx). Clamp to the API bounds so a large
            // catalog degrades to a bounded subset, and drop empty libraries.
            const udfsPayload = udfList
                .filter(([, libraryName]) => libraryName && libraryName.length <= UDF_CHAT_MAX_NAME_LENGTH)
                .map(([, libraryName, , functions]) => ({
                    name: libraryName,
                    functions: functions
                        .filter((functionName) => functionName && functionName.length <= UDF_CHAT_MAX_NAME_LENGTH)
                        .slice(0, UDF_CHAT_MAX_FUNCTIONS_PER_LIBRARY)
                        .map((functionName) => ({ name: functionName })),
                }))
                .filter((library) => library.functions.length > 0)
                .slice(0, UDF_CHAT_MAX_LIBRARIES);

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: chatHeaders,
                body: JSON.stringify({
                    messages: newMessages.filter(message => message.role === "user" || message.type === "Result").map(({ role, content }) => ({
                        role,
                        content,
                    })),
                    graphName,
                    model,
                    key: chatModelSource === "local" ? localLlmProvider : requestKey,
                    cypherOnly,
                    modelSource: chatModelSource,
                    localProvider: localLlmProvider,
                    localEndpoint: localLlmEndpoint,
                    // Omitted when the (filtered) catalog is empty.
                    udfs: udfsPayload.length > 0 ? udfsPayload : undefined,
                })
            });

            if (response.status === 401 && response.headers.get("X-Session-Invalid") === "1") {
                const { signOut } = await import("next-auth/react");
                signOut({ callbackUrl: "/login" });
                setIndicator("offline");
                setIsLoading(false);
                return;
            }

            let data;
            try {
                data = await response.json();
            } catch {
                handleSetMessages({
                    role: "assistant",
                    content: "Failed to parse server response",
                    type: "Error"
                });
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                if (response.status >= 500) setIndicator("offline");
                handleSetMessages({
                    role: "assistant",
                    content: data.error || "An error occurred",
                    type: "Error"
                });
                setIsLoading(false);
                return;
            }

            setIndicator("online");

            // Show cypher query if available
            if (data.cypherQuery) {
                const cypherContent = typeof data.cypherQuery === "string"
                    ? data.cypherQuery.replace(/^cypher\s+/i, "")
                    : data.cypherQuery;
                setQueryCollapse(prev => ({ ...prev, [newMessages.length]: false }));
                handleSetMessages({
                    role: "assistant",
                    content: cypherContent,
                    type: "CypherQuery"
                });
            }

            // Show cypher result if available
            // if (data.cypherResult) {
            //     handleSetMessages({
            //         role: "assistant",
            //         content: typeof data.cypherResult === "string" ? data.cypherResult : JSON.stringify(data.cypherResult),
            //         type: "CypherResult"
            //     });
            // }

            // Show answer
            if (data.answer) {
                const confidence = typeof data.confidence === "number" ? data.confidence : undefined;
                const tokenUsage = data.tokenUsage ? (data.tokenUsage as { totalTokens: number }).totalTokens : undefined;
                handleSetMessages({
                    role: "assistant",
                    content: typeof data.answer === "string" ? data.answer : JSON.stringify(data.answer),
                    type: "Result",
                    confidence,
                    tokenUsage
                });
            }

            setIsLoading(false);

        } catch (error) {
            const friendly = toUserFriendlyMessage(error instanceof Error ? error.message : error, getErrorStatus(error));
            handleSetMessages({
                role: "assistant",
                content: `${friendly.title}: ${friendly.description}`,
                type: "Error"
            });
            setIsLoading(false);
        }
    };

    const getMessage = (message: Message, index?: number) => {
        switch (message.type) {
            case "Status":
                const content = <>
                    {
                        messages[messages.length - 1].type === "Status" && messages[messages.length - 1] === message &&
                        <Loader2 className="animate-spin" size={15} />
                    }
                    <p className="text-smm">{message.content}</p>
                </>;

                return index !== undefined ? (
                    <li className="flex gap-2 items-center" key={index}>
                        {content}
                    </li>
                ) : (
                    <div className="flex gap-2 items-center">
                        {content}
                    </div>
                );
            case "CypherQuery":
                const i = messages.findIndex(m => m === message);

                return (
                    <div className="flex gap-2 items-start">
                        {
                            collapseEligible[i] &&
                            <Button
                                onClick={() => {
                                    setQueryCollapse(prev => ({ ...prev, [i]: !prev[i] }));
                                }}
                                className="p-1 min-w-8 min-h-8"
                            >
                                {queryCollapse[i] ? <ChevronRight size={25} /> : <ChevronDown size={25} />}
                            </Button>
                        }
                        <div ref={setTextRef(i)} className="overflow-hidden SofiaSans">
                            {
                                queryCollapse[i] ? (
                                    <ShadTooltip>
                                        <ShadTooltipTrigger asChild>
                                            <p className="text-sm truncate">{message.content}</p>
                                        </ShadTooltipTrigger>
                                        <ShadTooltipContent>
                                            {message.content}
                                        </ShadTooltipContent>
                                    </ShadTooltip>
                                ) : (
                                    <pre className="text-sm text-wrap whitespace-pre-wrap break-all">
                                        {message.content}
                                    </pre>
                                )
                            }
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                data-testid="chatRunQueryButton"
                                title="Run Query"
                                onClick={() => runQuery(message.content)}
                                isLoading={isQueryLoading}
                            >
                                <Play size={20} />
                            </Button>
                            <Button
                                data-testid="chatCopyQueryButton"
                                title="Copy Query"
                                onClick={() => {
                                    navigator.clipboard.writeText(message.content);
                                    toast({
                                        title: "Copied to clipboard",
                                        description: "The query has been copied to your clipboard",
                                    });
                                }}
                            >
                                <Copy size={20} />
                            </Button>
                        </div>
                    </div>
                );
            // case "CypherResult":
            //     return (
            //         <pre className="text-sm whitespace-pre-wrap break-all bg-muted p-2 rounded">
            //             {message.content}
            //         </pre>
            //     );

            default:
                return (
                    <div className="flex flex-col gap-1">
                        <MarkdownMessage content={message.content} />
                        {message.type === "Result" && message.confidence != null && (
                            <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded w-fit",
                                message.confidence >= 0.9 ? "bg-green-500/20 text-green-400" :
                                    message.confidence >= 0.7 ? "bg-yellow-500/20 text-yellow-400" :
                                        "bg-red-500/20 text-red-400"
                            )}>
                                Confidence: {Math.round(message.confidence * 100)}%
                            </span>
                        )}
                    </div>
                );
        }
    };

    return (
        <div data-testid="chatPanel" className="border-Gradient-rounded h-full w-full">
            <div className="bg-background relative h-full w-full flex flex-col gap-2 items-center rounded-lg p-2">
                <Button
                    data-testid="chatCloseButton"
                    className="absolute top-2 right-2"
                    title="Close"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
                <div className="w-full flex justify-between items-center pr-8">
                    <h1 className="text-lg font-semibold">Chat</h1>
                    <div className="flex items-center gap-2">
                        <Sparkles size={25} />
                    </div>
                </div>
                <span id="chat-prerequisites" className="text-center">Use English to query the graph. The feature requires LLM model and API key. Update local user parameters in Settings.</span>
                <ul ref={chatContainerRef} data-testid="chatMessagesList" className="w-full h-1 grow flex flex-col gap-[12px] overflow-x-hidden overflow-y-auto chat-container">
                    {
                        messagesList.map((message, index) => {
                            if (Array.isArray(message)) {
                                const [m, collapse] = message;
                                return (
                                    <li className={cn("w-full flex gap-1 justify-start status-group")} key={index} data-key={index}>
                                        <div className="flex gap-1 items-center h-fit">
                                            {m.some(me => messages[messages.length - 1] === me) && !collapse ?
                                                <Loader2 className="animate-spin" size={15} />
                                                : <Search size={15} />}
                                            <p className="text-sm">Status</p>
                                            <Button
                                                onClick={() => {
                                                    setMessagesList(prev => prev.map((me, i) => i === index && Array.isArray(me) ? [me[0], !me[1]] : me));
                                                    setTimeout(() => {
                                                        const statusGroup = document.querySelector(`.status-group[data-key="${index}"]`);
                                                        if (statusGroup) {
                                                            statusGroup.scrollIntoView({ behavior: "smooth" });
                                                        }
                                                    }, 0);
                                                }}
                                            >
                                                {collapse ? <ChevronDown size={25} /> : <ChevronRight size={25} />}
                                            </Button>
                                        </div>
                                        {
                                            collapse &&
                                            <ul className="flex flex-col gap-2">
                                                {
                                                    m.map((me, i) => getMessage(me, i))
                                                }
                                            </ul>
                                        }
                                    </li>
                                );
                            }
                            if (message.type === "Status") {
                                return (
                                    <li className={cn("w-full flex gap-1 justify-start")} key={index}>
                                        {getMessage(message)}
                                    </li>
                                );
                            }
                            const isUser = message.role === "user";
                            const avatar = isUser
                                ? <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary">
                                    <p className="text-foreground text-sm truncate text-center">{message.role.charAt(0).toUpperCase()}</p>
                                </div>
                                : <div className="h-8 w-8 relative">
                                    {mounted && currentTheme && <Image className="rounded-full" src={`/icons/F-${currentTheme}.svg`} alt="Assistant" fill />}
                                </div>;

                            return (
                                <li
                                    data-testid={isUser ? "chatUserMessage" : `chatAssistantMessage-${message.type}`}
                                    className={cn("w-full flex gap-1", isUser ? "justify-end" : "justify-start")}
                                    key={index}
                                >
                                    {
                                        !isUser && avatar
                                    }
                                    <div className={cn("max-w-[80%] p-2 rounded-lg overflow-hidden", isUser ? "bg-primary" : "bg-secondary", message.type === "Error" && "border border-destructive")}>
                                        {getMessage(message)}
                                    </div>
                                    {
                                        isUser && avatar
                                    }
                                </li>
                            );
                        })
                    }
                </ul>
                {
                    (totalTokens > 0 || model) && (() => {
                        const selectedChatApiKey = chatApiKeys.find(k => k.id === selectedChatApiKeyId);
                        const providerLabel = chatModelSource === "local"
                            ? localLlmProvider.charAt(0).toUpperCase() + localLlmProvider.slice(1)
                            : getProviderDisplayName(selectedChatApiKey?.provider ?? detectProviderFromModel(model));
                        return (
                            <div data-testid="chatFooter" className="w-full flex items-center justify-between gap-2 px-1 py-0.5 text-xs text-muted-foreground leading-none">
                                <div className="flex items-center gap-2 min-w-0">
                                    {totalTokens > 0 && (
                                        <>
                                            <span className="font-medium text-foreground/60 shrink-0">Token Usage</span>
                                            <span className="shrink-0">·</span>
                                            {lastMessageTokens !== null && (
                                                <ShadTooltip>
                                                    <ShadTooltipTrigger asChild>
                                                        <span data-testid="chatFooterLastTokens" className="truncate max-w-[6rem]">Last: <span className="font-medium text-foreground">{lastMessageTokens.toLocaleString()}</span></span>
                                                    </ShadTooltipTrigger>
                                                    <ShadTooltipContent side="top">Last message: {lastMessageTokens.toLocaleString()} tokens</ShadTooltipContent>
                                                </ShadTooltip>
                                            )}
                                            <ShadTooltip>
                                                <ShadTooltipTrigger asChild>
                                                    <span data-testid="chatFooterTotalTokens" className="truncate max-w-[6rem]">Total: <span className="font-medium text-foreground">{totalTokens.toLocaleString()}</span></span>
                                                </ShadTooltipTrigger>
                                                <ShadTooltipContent side="top">Session total: {totalTokens.toLocaleString()} tokens</ShadTooltipContent>
                                            </ShadTooltip>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0 min-w-0 max-w-[50%]">
                                    {model && (
                                        <>
                                            <span className="font-medium text-foreground/70 shrink-0">{providerLabel}</span>
                                            <span className="shrink-0">·</span>
                                            <ShadTooltip>
                                                <ShadTooltipTrigger asChild>
                                                    <span data-testid="chatFooterModel" className="truncate">{model}</span>
                                                </ShadTooltipTrigger>
                                                <ShadTooltipContent side="top">{model}</ShadTooltipContent>
                                            </ShadTooltip>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })()
                }
                <form data-testid="chatForm" className="flex gap-2 items-center border border-border rounded-lg w-full p-2" onSubmit={handleSubmit}>
                    <ShadTooltip>
                        <ShadTooltipTrigger asChild>
                            <button
                                type="button"
                                data-testid="cypherOnlySwitch"
                                data-state={cypherOnly ? "checked" : "unchecked"}
                                aria-pressed={cypherOnly}
                                aria-label="Cypher only mode"
                                onClick={() => {
                                    const next = !cypherOnly;
                                    setCypherOnly(next);
                                    setConnectionItem(`cypherOnly-${graphName}`, String(next));
                                }}
                                className={cn(
                                    "shrink-0 flex items-center justify-center rounded-md transition-all duration-150 active:scale-[0.96]",
                                    "h-8 w-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                                    cypherOnly
                                        ? "bg-primary text-background hover:opacity-90"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Share2 size={18} />
                            </button>
                        </ShadTooltipTrigger>
                        <ShadTooltipContent side="top">
                            <span>{cypherOnly ? "Cypher only mode is ON — click to disable" : "Cypher only mode"}</span>
                        </ShadTooltipContent>
                    </ShadTooltip>
                    <Button
                        data-testid="chatSendButton"
                        disabled={newMessage.trim() === ""}
                        title={newMessage.trim() === "" ? "Please enter a message" : "Send"}
                        onClick={handleSubmit}
                        isLoading={isLoading}
                    >
                        <Send size={25} />
                    </Button>
                    <div className="relative flex-1 basis-0 rounded-lg overflow-hidden">
                        <ShineBorder shineColor={["#7568F2", "#B66EBD", "#EC806C"]} />
                        <Input
                            data-testid="chatInput"
                            className="w-full bg-background rounded-md border-none text-foreground text-lg SofiaSans"
                            placeholder="What would you like to know?"
                            aria-describedby="chat-prerequisites"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
