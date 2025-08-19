import { cn } from "@/lib/utils"
import { useContext, useState } from "react"
import { CircleArrowUp, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { GraphContext, IndicatorContext } from "../components/provider"
import { EventType } from "../api/chat/route"

type Message = { role: "user" | "assistant"; content: string, type?: "Text" | "Result" | "Error" | "Status" | "CypherQuery" | "CypherResult" | "Schema" }

interface Props {
    onClose: () => void
}

export default function Chat({ onClose }: Props) {
    const { setIndicator } = useContext(IndicatorContext)
    const { graphName, runQuery } = useContext(GraphContext)

    const { toast } = useToast()

    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("how many friends does grace has ?")
    const [isLoading, setIsLoading] = useState(false)

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
        // setNewMessage("")

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: newMessages.filter(message => message.role === "user" || message.type === "Result").map(({ role, content }) => ({
                        role,
                        content
                    })),
                    graphName,
                })
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

                const lines = chunk.split('\n').filter(line => line);
                let isResult = false

                lines.forEach(line => {
                    const eventType: EventType | "error" = line.split("event:")[1].split(" ")[1] as EventType | "error"
                    const eventData = line.split("data:")[1]

                    switch (eventType) {
                        case "Status":
                        case "CypherResult":
                            setMessages(prev => [
                                ...prev,
                                {
                                    role: "assistant",
                                    content: eventData.trim(),
                                    type: eventType
                                }
                            ]);
                            break;

                        case "Schema":
                            setMessages(prev => [
                                ...prev,
                                {
                                    role: "assistant",
                                    content: JSON.stringify(JSON.parse(eventData.trim()), null, 2),
                                    type: eventType
                                }
                            ]);
                            break;

                        case "CypherQuery":
                            setMessages(prev => [
                                ...prev,
                                {
                                    role: "assistant",
                                    content: eventData.trim(),
                                    type: eventType
                                }
                            ]);

                            runQuery(eventData)

                            break;

                        case "ModelOutputChunk":
                            setMessages(prev => {
                                const lastMessage = prev[prev.length - 1]

                                if (lastMessage.role === "assistant" && lastMessage.type === "Result") {
                                    return [...prev.slice(0, -1), {
                                        ...lastMessage,
                                        content: (lastMessage.content + eventData).trim()
                                    }]
                                }

                                return [...prev, {
                                    role: "assistant",
                                    type: "Result",
                                    content: eventData.trim()
                                }]
                            })
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

                        case "Result":
                            isResult = true
                            break;

                        case "error":
                            // eslint-disable-next-line no-case-declarations
                            const status = Number(line.split("status:")[1].split(" ")[0])

                            if (status === 401 || status >= 500) setIndicator("offline")

                            toast({
                                title: "Error",
                                description: eventData,
                                variant: "destructive",
                            })
                            break;
                        default:
                            throw new Error(`Unknown event type: ${eventType}`)
                    }
                });

                if (!isResult) {
                    setTimeout(scrollToBottom, 0)
                    await processStream();
                } else {
                    setIsLoading(false)
                }
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

    return (
        <div className="border-Gradient-rounded h-full w-full">
            <div className="bg-background relative h-full w-full flex flex-col gap-4 items-center rounded-lg">
                <Button
                    className="absolute top-2 right-2"
                    title="Close"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
                <h1 className="mt-6">Chat</h1>
                <ul className="w-full h-1 grow flex flex-col gap-2 overflow-x-hidden overflow-y-auto p-6 chat-container">
                    {
                        messages.map((message, index) => {
                            const avatar = <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", message.role === "user" ? "bg-primary" : "bg-gray-500 text-white")}>
                                <p className="text-white text-sm truncate text-center">{message.role.charAt(0).toUpperCase()}</p>
                            </div>
                            const isUser = message.role === "user"
                            return (
                                // eslint-disable-next-line react/no-array-index-key
                                <li className={cn("w-full flex gap-1", isUser ? "justify-end" : "justify-start")} key={index}>
                                    {
                                        !isUser && avatar
                                    }
                                    <div className={cn(`max-w-[80%] p-2 rounded-lg`, isUser ? "bg-primary" : "bg-gray-500")}>
                                        <p className="text-wrap whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {
                                        isUser && avatar
                                    }
                                </li>
                            )
                        })
                    }
                </ul>
                <div className="w-full p-4">
                    <form className="flex gap-2 border border-foreground p-2 rounded-lg w-full" onSubmit={handleSubmit}>
                        <Input
                            className="w-1 grow bg-transparent border-none text-foreground text-lg"
                            placeholder="Type your message here..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button
                            disabled={newMessage.trim() === ""}
                            title={newMessage.trim() === "" ? "Please enter a message" : "Send"}
                            onClick={handleSubmit}
                            isLoading={isLoading}
                        >
                            <CircleArrowUp />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}