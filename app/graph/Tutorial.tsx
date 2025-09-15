import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useContext, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSession } from "next-auth/react";
import CreateGraph from "../components/CreateGraph";
import { GraphContext } from "../components/provider";
import Button from "../components/ui/Button";

interface Props {
    open: boolean
    setOpen: (open: boolean) => void
}

export default function Tutorial({ open, setOpen }: Props) {

    const [showAgain, setShowAgain] = useState<boolean>(false)
    const { setGraphName: onSetGraphName, graphNames } = useContext(GraphContext)
    const { data: session } = useSession()

    const handleSetGraphName = (name: string) => {
        onSetGraphName(name)
        setOpen(false)
    }

    return (
        <Drawer open={open} onOpenChange={(o) => {
            if (showAgain) {
                localStorage.setItem("tutorial", "false")
            }
            setOpen(o)
        }}>
            <DrawerContent className="flex flex-co">
                <VisuallyHidden>
                    <DrawerHeader>
                        <DrawerTitle />
                    </DrawerHeader>
                </VisuallyHidden>
                <div className="flex justify-center items-center p-8" id="graphTutorial">
                    <Carousel className="w-1/2 h-full">
                        <CarouselContent className="text-2xl">
                            <CarouselItem className="border border-border text-center px-[20%] py-[10%]">
                                <p>Our Browser allows you to visualize, manipulate and explore your data.</p>
                            </CarouselItem>
                            <CarouselItem className="border border-border text-center px-[20%] py-[10%]">
                                <p>Interact with your data on a force-directed layout,
                                    with features including zoom, pan,
                                    node-drag and interactive node/link hover and click events.</p>
                            </CarouselItem>
                            <CarouselItem className="border border-border text-center px-[20%] py-[10%]">
                                <p>Configure or export your graph with ease from the control center</p>
                            </CarouselItem>
                            <CarouselItem className="border border-border flex justify-center items-center">
                                {
                                    session?.user?.role !== "Read-Only" &&
                                    <CreateGraph
                                        trigger={
                                            <Button
                                                data-testid="createGraph"
                                                variant="Primary"
                                            >
                                                Create new graph
                                            </Button>
                                        }
                                        label="Tutorial"
                                        graphNames={graphNames}
                                        onSetGraphName={handleSetGraphName}
                                        type="Graph"
                                    />
                                }
                            </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
                <div className="flex justify-end gap-4 items-center p-8">
                    <Checkbox
                        className="w-6 h-6 rounded-full bg-background border-primary data-[state=checked]:bg-primary"
                        checked={showAgain}
                        onCheckedChange={(checked) => setShowAgain(checked as boolean)}
                    />
                    <p>Don&apos;t show this again</p>
                </div>
            </DrawerContent>
        </Drawer>
    )
}