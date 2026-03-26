/* eslint-disable no-case-declarations */
/* eslint-disable react/no-array-index-key */
import { cn, getTheme, Message } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { ChevronDown, ChevronRight, Share2, Copy, Loader2, Play, Search, X, Send, MessagesSquare } from "lucide-react";
import { Tooltip as ShadTooltip, TooltipContent as ShadTooltipContent, TooltipTrigger as ShadTooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { GraphContext, IndicatorContext, QueryLoadingContext, BrowserSettingsContext } from "../components/provider";
import { EventType } from "../api/chat/route";
import ToastButton from "../components/ToastButton";
import { ShineBorder } from "@/components/ui/shine-border";

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

export default function Chat({ onClose }: Props) {
    const { theme } = useTheme();
    const { currentTheme } = getTheme(theme);
    const { setIndicator } = useContext(IndicatorContext);
    const { graphName, runQuery } = useContext(GraphContext);
    const { isQueryLoading } = useContext(QueryLoadingContext);
    const { settings: { chatSettings: { secretKey, model, maxSavedMessages } } } = useContext(BrowserSettingsContext);
    // Cypher Only toggle state, persisted per graph
    const [cypherOnly, setCypherOnly] = useState(false);

    const { toast } = useToast();
    const route = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesList, setMessagesList] = useState<(Message | [Message[], boolean])[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [queryCollapse, setQueryCollapse] = useState<{ [key: string]: boolean }>({});
    const [collapseEligible, setCollapseEligible] = useState<{ [key: number]: boolean }>({});

    // Load messages and cypher only preference for current graph on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem(`chat-${graphName}`);
        const currentMessages = JSON.parse(savedMessages || "[]");
        setMessages(currentMessages);

        const savedCypherOnly = localStorage.getItem(`cypherOnly-${graphName}`);
        setCypherOnly(savedCypherOnly === "true");
    }, [graphName, maxSavedMessages]);

    useEffect(() => {
        let statusGroup: Message[];

        if (messages.length > 0) {
            localStorage.setItem(`chat-${graphName}`, JSON.stringify(getLastUserMessagesWithContext(messages, maxSavedMessages)));
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

        setMessages(newMessages);
        setTimeout(scrollToBottom, 0);
        setNewMessage("");

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

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            const processStream = async () => {
                if (!reader) return;

                const { done, value } = await reader.read();

                if (done) return;

                const chunk = decoder.decode(value, { stream: true });

                const lines = chunk.split('event:').filter(line => line);
                let isResult = false;

                lines.forEach(line => {
                    const eventType: EventType | "error" = line.split(" ")[1] as EventType | "error";
                    const eventData = line.split("data:")[1];
                    switch (eventType) {
                        case "Status":
                            const message = {
                                role: "assistant" as const,
                                content: eventData.trim(),
                                type: eventType
                            };

                            setMessages(prev => [...prev, message]);
                            break;

                        case "CypherQuery":
                            setQueryCollapse(prev => ({ ...prev, [messages.length]: false }));
                            setMessages(prev => [
                                ...prev,
                                {
                                    role: "assistant",
                                    content: eventData.trim().replace(/^cypher\s+/i, ""),
                                    type: eventType
                                }
                            ]);
                            break;

                        case "Result":
                            try {
                                setMessages(prev => [
                                    ...prev,
                                    {
                                        role: "assistant",
                                        content: JSON.parse(eventData.trim()),
                                        type: eventType
                                    }
                                ]);
                            } catch (error) {
                                console.error("Failed to parse Result event data:", error);
                                setMessages(prev => [
                                    ...prev,
                                    {
                                        role: "assistant",
                                        content: eventData.trim(),
                                        type: "Error"
                                    }
                                ]);
                            }
                            isResult = true;
                            break;

                        case "Error":
                            setMessages(prev => [
                                ...prev,
                                {
                                    role: "assistant",
                                    content: eventData.trim(),
                                    type: eventType
                                }
                            ]);
                            isResult = true;
                            break;

                        case "error":
                            const statusCode = Number(line.split("status:")[1].split(" ")[0]);

                            if (statusCode === 401 || statusCode >= 500) setIndicator("offline");

                            toast({
                                title: "Error",
                                description: eventData,
                                variant: "destructive",
                            });

                            isResult = true;
                            break;

                        case "Schema":
                        case "CypherResult":
                            break;

                        default:
                            throw new Error(`Unknown event type: ${eventType}`);
                    }
                });

                setTimeout(scrollToBottom, 0);

                if (!isResult) await processStream();

            };

            processStream();
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
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
                    <p className="text-sm">{message.content}</p>
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
                    <div ref={r => {
                        if (!r) return;
                        const shouldCollapse = r.scrollHeight > 64;
                        setCollapseEligible(prev => {
                            if (prev[i] === shouldCollapse) return prev;
                            return { ...prev, [i]: shouldCollapse };
                        });
                    }} className="flex gap-2 items-start">
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
                        <div className="overflow-hidden SofiaSans">
                            {
                                queryCollapse[i] ? (
                                    <ShadTooltip>
                                        <ShadTooltipTrigger asChild>
                                            <p className="truncate">{message.content}</p>
                                        </ShadTooltipTrigger>
                                        <ShadTooltipContent>
                                            {message.content}
                                        </ShadTooltipContent>
                                    </ShadTooltip>
                                ) : (
                                    <pre className="text-wrap whitespace-pre-wrap break-all">
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
            default:
                return (
                    <p className="text-wrap whitespace-pre-wrap">{message.content}</p>
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
                    <h1 className="text-2xl">Chat</h1>
                    <MessagesSquare size={25} />
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
                            const assistantBg = message.type === "Error" ? "bg-destructive" : "bg-secondary";
                            const avatar = isUser
                                ? <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary">
                                    <p className="text-foreground text-sm truncate text-center">{message.role.charAt(0).toUpperCase()}</p>
                                </div>
                                : <div className="h-8 w-8">
                                    <Image className="rounded-full" src={`/icons/F-${currentTheme}.svg`} style={{ height: "100%", width: "100%" }} alt="Assistant" width={0} height={0} />
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
                                    <div className={cn("max-w-[80%] p-2 rounded-lg overflow-hidden", isUser ? "bg-primary" : assistantBg)}>
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
                                    localStorage.setItem(`cypherOnly-${graphName}`, String(next));
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