import { useContext } from "react"
import { Info, Minus, Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import Input from "../components/ui/Input"
import { LimitContext, TimeoutContext } from "../components/provider"
import Button from "../components/ui/Button"

export default function QuerySettings() {
    const { timeout, setTimeout } = useContext(TimeoutContext)
    const { limit, setLimit } = useContext(LimitContext)

    return (
        <div className="h-full w-full flex flex-col items-center justify-center">
            <div className="flex flex-col gap-6 p-16 shadow-[0_0_30px_rgba(0,0,0,0.3)] rounded-lg">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2 items-center">
                        <h2>Timeout</h2>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info size={16} />
                            </TooltipTrigger>
                            <TooltipContent className="flex flex-col gap-2 items-center">
                                <p>Shows a `Timed Out` error if the query takes longer than the timeout in seconds.</p>
                                <a className="underline underline-offset-2" href="https://docs.falkordb.com/configuration.html#query-configurations" target="_blank" rel="noreferrer noreferrer">
                                    Learn more
                                </a>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex border rounded-md w-fit">
                        <Button
                            id="increaseTimeoutBtn"
                            className="p-2"
                            onClick={() => {
                                setTimeout(prev => prev + 1)
                                localStorage.setItem("timeout", (timeout + 1).toString())
                            }}
                        >
                            <Plus />
                        </Button>
                        <Input
                            id="timeoutInput"
                            className={cn("text-center bg-foreground rounded-none border-y-0 text-white text-xl")}
                            value={timeout === 0 ? "∞" : timeout}
                            onChange={(e) => {
                                const value = parseInt(e.target.value.replace('∞', ''), 10)

                                if (!value) {
                                    setTimeout(0)
                                    return
                                }

                                if (value < 0 || Number.isNaN(value)) return

                                setTimeout(value)
                                localStorage.setItem("timeout", value.toString())
                            }}
                        />
                        <Button
                            id="decreaseTimeoutBtn"
                            className="p-2"
                            onClick={() => {
                                setTimeout(prev => !prev ? prev : prev - 1)
                                localStorage.setItem("timeout", (timeout - 1).toString())
                            }}
                        >
                            <Minus />
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2 items-center">
                        <h2>Limit</h2>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info size={16} />
                            </TooltipTrigger>
                            <TooltipContent className="flex flex-col gap-2 items-center">
                                <p>Limits the number of rows returned by the query.</p>
                                <a className="underline underline-offset-2" href="https://docs.falkordb.com/cypher/limit.html" target="_blank" rel="noreferrer noreferrer">
                                    Learn more
                                </a>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex border rounded-md w-fit">
                        <Button
                            id="increaseLimitBtn"
                            className="p-2"
                            onClick={() => {
                                setLimit(prev => prev + 1)
                                localStorage.setItem("limit", (limit + 1).toString())
                            }}
                        >
                            <Plus />
                        </Button>
                        <Input
                            id="limitInput"
                            className={cn("text-center bg-foreground rounded-none border-y-0 text-white text-xl")}
                            value={limit === 0 ? "∞" : limit}
                            onChange={(e) => {
                                const value = parseInt(e.target.value.replace('∞', ''), 10)

                                if (!value) {
                                    setLimit(0)
                                    return
                                }

                                if (value < 0 || Number.isNaN(value)) return

                                setLimit(value)
                                localStorage.setItem("limit", value.toString())
                            }}
                        />
                        <Button
                            id="decreaseLimitBtn"
                            className="p-2"
                            onClick={() => {
                                setLimit(prev => !prev ? prev : prev - 1)
                                localStorage.setItem("limit", (limit - 1).toString())
                            }}
                        >
                            <Minus />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}