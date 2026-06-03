import { cn, getTheme, Message, toUserFriendlyMessage } from "@/lib/utils";
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
import { GraphContext, IndicatorContext, QueryLoadingContext, BrowserSettingsContext } from "../components/provider";
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

// Function to get the last maxSavedMessages user messages and all messages in between
const getLastUserMessagesWithContext = (allMessages: Message[], maxUserMessages: number) => {
    // Find indices of all user messages
    const userMessageIndices = allMessages
        .map((msg, index) => msg.role === "user" ? index : -1)
        .filter(index => index !== -1);

    // If there are fewer user messages than maxUserMessages, return all messages
    if (userMessageIndices.length <= maxUserMessages) {
        return allMessages;
    }

    // Get the index of the Nth-from-last user message
    const startIndex = userMessageIndices[userMessageIndices.length - maxUserMessages];

    // Return all messages from that point forward
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
    const { settings: { chatSettings: { secretKey, model, maxSavedMessages } } } = useContext(BrowserSettingsContext);
    // Cypher Only toggle state, persisted per graph
    const [cypherOnly, setCypherOnly] = useState(false);

    const { toast } = useToast();
    const route = useRouter();

    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesList, setMessagesList] = useState<(Message | [Message[], boolean])[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [totalTokens, setTotalTokens] = useState(0);
    const [queryCollapse, setQueryCollapse] = useState<{ [key: string]: boolean }>({});
    const [collapseEligible, setCollapseEligible] = useState<{ [key: number]: boolean }>({});
    const textRefs = useRef<Map<number, HTMLElement>>(new Map());
    const observerRef = useRef<ResizeObserver | null>(null);
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

    const scrollToBottom = () => {
        const chatContainer = document.querySelector(".chat-container");
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };

    const handleSetMessages = (newMessages: Message[] | Message) => {
        setMessages(newMessages instanceof Array ? newMessages : prev => [...prev, newMessages]);
        setTimeout(scrollToBottom, 0);
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

        if (!secretKey) {
            toast({
                title: "No Api Key Provided",
                description: "Please provide a Api Key in the settings before sending a message",
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

        // Client-side fail-fast: detect model/API key provider mismatch before making any request
        const modelProvider = detectProviderFromModel(model);
        const keyProvider = detectProviderFromApiKey(secretKey);
        if (modelProvider !== "unknown" && keyProvider !== "unknown" && modelProvider !== keyProvider && modelProvider !== "ollama") {
            const modelProviderName = getProviderDisplayName(modelProvider);
            const keyProviderName = getProviderDisplayName(keyProvider);
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: `Model/API key mismatch: You selected a ${modelProviderName} model but provided a ${keyProviderName} API key. Please update your API key in Settings to match your selected model.`,
                    type: "Error"
                }
            ]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: newMessages.filter(message => message.role === "user" || message.type === "Result").map(({ role, content }) => ({
                        role,
                        content,
                    })),
                    graphName,
                    model,
                    key: secretKey,
                    cypherOnly
                })
            });

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
                if (response.status === 401 || response.status >= 500) setIndicator("offline");
                handleSetMessages({
                    role: "assistant",
                    content: data.error || "An error occurred",
                    type: "Error"
                });
                setIsLoading(false);
                return;
            }

            // Show cypher query if available
            if (data.cypherQuery) {
                const cypherContent = typeof data.cypherQuery === "string"
                    ? data.cypherQuery.replace(/^cypher\s+/i, "")
                    : data.cypherQuery;
                setQueryCollapse(prev => ({ ...prev, [messages.length]: false }));
                handleSetMessages({
                    role: "assistant",
                    content: cypherContent,
                    type: "CypherQuery"
                });
            }

            // Show token usage if available
            if (data.tokenUsage) {
                const usage = data.tokenUsage;

                const newTotal = totalTokens + usage.totalTokens;

                setTotalTokens(newTotal);

                handleSetMessages({
                    role: "assistant",
                    content: `${usage.totalTokens} - ${newTotal}`,
                    type: "Usage"
                });
            }

            // Show answer
            if (data.answer) {
                const confidence = typeof data.confidence === "number" ? data.confidence : undefined;
                handleSetMessages({
                    role: "assistant",
                    content: typeof data.answer === "string" ? data.answer : JSON.stringify(data.answer),
                    type: "Result",
                    confidence
                });
            }

            setTimeout(scrollToBottom, 0);
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
            case "Usage": {
                return (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs px-1.5 py-0.5 rounded w-fit">
                            Session Tokens: {message.content}
                        </span>
                    </div>
                );
            }
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
                <ul data-testid="chatMessagesList" className="w-full h-1 grow flex flex-col gap-[12px] overflow-x-hidden overflow-y-auto chat-container">
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
                            const isInfo = message.role === "info";
                            const assistantBg = message.type === "Error" ? "bg-destructive" : "bg-secondary";
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
                                        !isUser && !isInfo && avatar
                                    }
                                    <div className={cn("max-w-[80%] p-2 rounded-lg overflow-hidden", isUser ? "bg-primary" : assistantBg)}>
                                        {getMessage(message)}
                                    </div>
                                    {
                                        isUser && !isInfo && avatar
                                    }
                                </li>
                            );
                        })
                    }
                </ul>
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
