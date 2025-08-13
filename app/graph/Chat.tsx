import { cn } from "@/lib/utils"
import { useContext, useEffect, useState } from "react"
import { CircleArrowUp, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { GraphContext, IndicatorContext } from "../components/provider"
import { EventType } from "../api/chat/route"

type Message = {
    role: "user" | "bot"
    type: EventType
    content: string
}

interface Props {
    onClose: () => void
}

export default function Chat({ onClose }: Props) {
    const { setIndicator } = useContext(IndicatorContext)
    const { graphName } = useContext(GraphContext)

    const { toast } = useToast()

    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messages,
                        graphName,
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                const processStream = async () => {
                    if (!reader) return;

                    const { done, value } = await reader.read();
                    if (done) return;

                    const chunk = decoder.decode(value, { stream: true });
                    let isResult = false
                    const lines = chunk.split('\n');
                    lines.forEach(line => {
                        if (!line.startsWith("event:")) {
                            return
                        }

                        const eventType: EventType = line.split("event:")[1].split(" ")[0] as EventType
                        const eventData = JSON.parse(line.split("data:")[1])

                        isResult = eventType === "Result"

                        setMessages(prev => [...prev, { role: "bot", type: eventType, content: eventData.Result }])
                    });

                    if (!isResult) {
                        processStream();
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
        })()
    }, [setIndicator, toast])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (newMessage.trim() === "") {
            toast({
                title: "Please enter a message",
                description: "You cannot send an empty message",
                variant: "destructive",
            })
            return
        }

        const newMessages = [...messages, { role: "user", type: "ModelOutputChunk", content: newMessage } as Message]
        setMessages(newMessages)


        setNewMessage("")
    }

    return (
        <div className="relative h-full flex flex-col gap-4 items-center w-[20dvw]">
            <Button
                className="absolute top-2 right-2"
                title="Close"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
            <h1 className="mt-6">Chat</h1>
            <ul className="w-full h-1 grow flex flex-col gap-2 overflow-y-auto p-6">
                {
                    messages.map((message, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <li className={cn("w-full flex gap-1", message.role === "user" ? "justify-end" : "justify-start")} key={index}>
                            <div className={cn("max-w-[80%] p-2 rounded-lg", message.role === "user" ? "bg-primary" : "bg-gray-500")}>
                                <p className="text-wrap">{message.content}</p>
                            </div>
                            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", message.role === "user" ? "bg-primary" : "bg-gray-500")}>
                                <p className="text-white text-sm">{message.role}</p>
                            </div>
                        </li>
                    ))
                }
            </ul>
            <div className="w-full p-4">
                <form className="flex gap-2 border border-white p-2 rounded-lg w-full" onSubmit={handleSubmit}>
                    <Input
                        className="w-1 grow bg-transparent border-none text-white text-lg"
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button
                        disabled={newMessage.trim() === ""}
                        title={newMessage.trim() === "" ? "Please enter a message" : "Send"}
                        type="submit"
                    >
                        <CircleArrowUp />
                    </Button>
                </form>
            </div>
        </div>
    )
}