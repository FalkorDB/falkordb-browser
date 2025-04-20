import { useContext } from "react"
import { Minus, Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
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
                    <Tooltip>
                        <TooltipTrigger>
                            <h2>Timeout</h2>
                        </TooltipTrigger>
                        <TooltipContent className="flex flex-col gap-2 items-center">
                            <p>Shows a `Timed Out` error if the query takes longer than the timeout in seconds.</p>
                            <Link className="underline underline-offset-2" href="https://docs.falkordb.com/configuration.html#query-configurations" target="_blank">
                                Learn more
                            </Link>
                        </TooltipContent>
                    </Tooltip>
                    <div className="flex border rounded-md w-fit">
                        <Button
                            className="p-2"
                            onClick={() => setTimeout(prev => prev + 1)}
                        >
                            <Plus />
                        </Button>
                        <Input
                            className="text-center bg-foreground rounded-none border-y-0 text-white font-xl"
                            value={timeout === 0 ? "∞" : timeout}
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10)

                                if (value < 0 || Number.isNaN(value)) return

                                setTimeout(value)
                            }}
                        />
                        <Button
                            className="p-2"
                            onClick={() => setTimeout(prev => prev - 1)}
                        >
                            <Minus />
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger>
                            <h2>Limit</h2>
                        </TooltipTrigger>
                        <TooltipContent className="flex flex-col gap-2 items-center">
                            <p>Limits the number of rows returned by the query.</p>
                            <Link className="underline underline-offset-2" href="https://docs.falkordb.com/cypher/limit.html" target="_blank">
                                Learn more
                            </Link>
                        </TooltipContent>
                    </Tooltip>
                    <div className="flex border rounded-md w-fit">
                        <Button
                            className="p-2"
                            onClick={() => setLimit(prev => prev + 1)}
                        >
                            <Plus />
                        </Button>
                        <Input
                            className="text-center bg-foreground rounded-none border-y-0 text-white font-xl"
                            value={limit === 0 ? "∞" : limit}
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10)

                                if (value < 0 || Number.isNaN(value)) return

                                setLimit(value)
                            }}
                        />
                        <Button
                            className="p-2"
                            onClick={() => setLimit(prev => prev - 1)}
                        >
                            <Minus />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}