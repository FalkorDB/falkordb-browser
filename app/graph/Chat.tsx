/* eslint-disable no-case-declarations */
/* eslint-disable react/no-array-index-key */
import { cn, Message } from "@/lib/utils"
import { useContext, useEffect, useState } from "react"
import { ChevronDown, ChevronRight, CircleArrowUp, Copy, Loader2, Play, Search, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { GraphContext, IndicatorContext, QueryLoadingContext, BrowserSettingsContext } from "../components/provider"
import { EventType } from "../api/chat/route"

interface Props {
    onClose: () => void
}

export default function Chat({ onClose }: Props) {
    const { setIndicator } = useContext(IndicatorContext)
    const { graphName, runQuery } = useContext(GraphContext)
    const { isQueryLoading } = useContext(QueryLoadingContext)
    const { settings: { chatSettings: { secretKey, model } } } = useContext(BrowserSettingsContext)

    const { toast } = useToast()

    const [messages, setMessages] = useState<Message[]>([])
    const [messagesList, setMessagesList] = useState<(Message | [Message[], boolean])[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [queryCollapse, setQueryCollapse] = useState<{ [key: string]: boolean }>({})

    useEffect(() => {
        let statusGroup: Message[]

        const newMessagesList = messages.map((message, i): Message | [Message[], boolean] | undefined => {
            if (message.type === "Status") {
                if (messages[i - 1]?.type !== "Status") {
                    if (messages[i + 1]?.type !== "Status") return message
                    statusGroup = [message]
                } else {
                    statusGroup.push(message)
                    if (messages[i + 1]?.type !== "Status") return [statusGroup, false]
                }
            } else {
                return message
            }

            return undefined
        }).filter(m => !!m)

        setMessagesList(newMessagesList)
    }, [messages])

    const scrollToBottom = () => {
        const chatContainer = document.querySelector(".chat-container")
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight
        }
    }

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault()

        if (isLoading) {
            toast({
                title: "Please wait",
                description: "You are already sending a message",
                variant: "destructive",
            })
            return
        }

        if (newMessage.trim() === "") {
            toast({
                title: "Please enter a message",
                description: "You cannot send an empty message",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        const newMessages = [...messages, { role: "user", type: "Text", content: newMessage } as const]

        setMessages(newMessages)
        setTimeout(scrollToBottom, 0)
        setNewMessage("")

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body: any = {
            messages: newMessages.filter(message => message.role === "user" || message.type === "Result").map(({ role, content }) => ({
                role,
                content
            })),
            graphName,
        }

        if (model) {
            body.model = model
        }

        if (secretKey) {
            body.key = secretKey
        }

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Something went wrong`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            const processStream = async () => {
                if (!reader) return;

                const { done, value } = await reader.read();

                if (done) return;

                const chunk = decoder.decode(value, { stream: true });

                const lines = chunk.split('event:').filter(line => line);
                let isResult = false

                lines.forEach(line => {
                    const eventType: EventType | "error" = line.split(" ")[1] as EventType | "error"
                    const eventData = line.split("data:")[1]
                    switch (eventType) {
                        case "Status":
                            const message = {
                                role: "assistant" as const,
                                content: eventData.trim(),
                                type: eventType
                            }

                            setMessages(prev => [...prev, message])
                            break;

                        case "CypherQuery":
                            setQueryCollapse(prev => ({ ...prev, [messages.length]: false }))
                            setMessages(prev => [
                                ...prev,
                                {
                                    role: "assistant",
                                    content: eventData.trim(),
                                    type: eventType
                                }
                            ]);
                            break;

                        case "ModelOutputChunk":
                            setMessages(prev => {
                                const lastMessage = prev[prev.length - 1]

                                if (lastMessage.role === "assistant" && lastMessage.type === "Result") {
                                    return [...prev.slice(0, -1), {
                                        ...lastMessage,
                                        content: `${lastMessage.content} ${eventData.trim()}`
                                    }]
                                }

                                return [...prev, {
                                    role: "assistant",
                                    type: "Result",
                                    content: eventData.trim()
                                }]
                            })
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
                            isResult = true
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
                            isResult = true
                            break;

                        case "error":
                            const statusCode = Number(line.split("status:")[1].split(" ")[0])

                            if (statusCode === 401 || statusCode >= 500) setIndicator("offline")

                            toast({
                                title: "Error",
                                description: eventData,
                                variant: "destructive",
                            })

                            isResult = true
                            break;

                        case "Schema":
                        case "CypherResult":
                            break;

                        default:
                            throw new Error(`Unknown event type: ${eventType}`)
                    }
                });

                setTimeout(scrollToBottom, 0)

                if (!isResult) await processStream();

                setIsLoading(false)
            };

            processStream();
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            })
        }
    }

    const getMessage = (message: Message, index?: number) => {
        switch (message.type) {
            case "Status":
                const content = <>
                    {
                        messages[messages.length - 1].type === "Status" && messages[messages.length - 1] === message &&
                        <Loader2 className="animate-spin" size={15} />
                    }
                    <p className="text-sm">{message.content}</p>
                </>

                return index !== undefined ? (
                    <li className="flex gap-2 items-center" key={index}>
                        {content}
                    </li>
                ) : (
                    <div className="flex gap-2 items-center">
                        {content}
                    </div>
                )
            case "CypherQuery":
                const i = messages.findIndex(m => m === message)

                return (
                    <div className="flex gap-2 items-start">
                        <Button
                            onClick={() => {
                                setQueryCollapse(prev => ({ ...prev, [i]: !prev[i] }))
                            }}
                            className="p-1 min-w-8 min-h-8"
                        >
                            {queryCollapse[i] ? <ChevronRight size={25} /> : <ChevronDown size={25} />}
                        </Button>
                        <div className="overflow-hidden SofiaSans">
                            {
                                queryCollapse[i] ? (
                                    <Tooltip>
                                        <TooltipTrigger className="w-full">
                                            <p className="truncate">{message.content}</p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {message.content}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <pre className="text-wrap whitespace-pre-wrap">
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
                                    navigator.clipboard.writeText(message.content)
                                    toast({
                                        title: "Copied to clipboard",
                                        description: "The query has been copied to your clipboard",
                                    })
                                }}
                            >
                                <Copy size={20} />
                            </Button>
                        </div>
                    </div>
                )
            default:
                return (
                    <p className="text-wrap whitespace-pre-wrap">{message.content}</p>
                )
        }
    }

    return (
        <div data-testid="chatPanel" className="border-Gradient-rounded h-full w-full">
            <div className="bg-background relative h-full w-full flex flex-col gap-4 items-center rounded-lg p-4">
                <Button
                    data-testid="chatCloseButton"
                    className="absolute top-2 right-2"
                    title="Close"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
                <h1 className="mt-6 text-center">Chat with your database in natural language</h1>
                <ul data-testid="chatMessagesList" className="w-full h-1 grow flex flex-col gap-6 overflow-x-hidden overflow-y-auto chat-container">
                    {
                        messagesList.map((message, index) => {
                            if (Array.isArray(message)) {
                                const [m, collapse] = message
                                return (
                                    <li className={cn("w-full flex gap-1 justify-start status-group")} key={index}>
                                        <div className="flex gap-1 items-center h-fit">
                                            {m.some(me => messages[messages.length - 1] === me) && !collapse ?
                                                <Loader2 className="animate-spin" size={15} />
                                                : <Search size={15} />}
                                            <p className="text-sm">Status</p>
                                            <Button
                                                onClick={() => {
                                                    setMessagesList(prev => prev.map((me, i) => i === index && Array.isArray(me) ? [me[0], !me[1]] : me))
                                                    setTimeout(() => {
                                                        const statusGroup = document.querySelector(`.status-group[key="${index}"]`)
                                                        if (statusGroup) {
                                                            statusGroup.scrollIntoView({ behavior: "smooth" })
                                                        }
                                                    }, 0)
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
                                )
                            }
                            if (message.type === "Status") {
                                return (
                                    <li className={cn("w-full flex gap-1 justify-start")} key={index}>
                                        {getMessage(message)}
                                    </li>
                                )
                            }
                            const isUser = message.role === "user"
                            const assistantBg = message.type === "Error" ? "bg-destructive" : "bg-secondary"
                            const avatar = <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", isUser ? "bg-primary" : assistantBg)}>
                                <p className="text-foreground text-sm truncate text-center">{message.role.charAt(0).toUpperCase()}</p>
                            </div>
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
                            )
                        })
                    }
                </ul>
                <form data-testid="chatForm" className="flex gap-2 items-center border border-border rounded-lg w-full p-2" onSubmit={handleSubmit}>
                    <Input
                        data-testid="chatInput"
                        className="w-1 grow bg-transparent border-none text-foreground text-lg SofiaSans"
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button
                        data-testid="chatSendButton"
                        disabled={newMessage.trim() === ""}
                        title={newMessage.trim() === "" ? "Please enter a message" : "Send"}
                        onClick={handleSubmit}
                        isLoading={isLoading}
                    >
                        <CircleArrowUp size={25} />
                    </Button>
                </form>
            </div>
        </div>
    )
}