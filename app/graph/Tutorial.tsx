import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSession } from "next-auth/react";
import CreateGraph from "../components/CreateGraph";

interface Props {
    onSetGraphName: Dispatch<SetStateAction<string>>
    graphNames: string[]
}

export default function Tutorial({ onSetGraphName, graphNames }: Props) {

    const [open, setOpen] = useState<boolean>(false)
    const [showAgain, setShowAgain] = useState<boolean>(false)
    const { data: session } = useSession()

    useEffect(() => {
        setOpen(localStorage.getItem("tutorial") !== "false")
    }, [])

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
            <DrawerContent className="flex flex-col">
                <VisuallyHidden>
                    <DrawerHeader>
                        <DrawerTitle />
                    </DrawerHeader>
                </VisuallyHidden>
                <div className="flex justify-center items-center p-8">
                    <Carousel className="w-1/2 h-1/2">
                        <CarouselContent className="text-2xl">
                            <CarouselItem className="border text-center p-40">
                                <p>Our Browser allows you to visualize, manipulate and explore your data.</p>
                            </CarouselItem>
                            <CarouselItem className="border text-center p-32">
                                <p>Interact with your data with a force-directed layout,
                                    with features including zoom, pan,
                                    node-drag and interactive node/link hover and click events</p>
                            </CarouselItem>
                            <CarouselItem className="border text-center p-40">
                                <p>Configure or export your graph with ease from the control center</p>
                            </CarouselItem>
                            <CarouselItem className="border flex justify-center items-center">
                                {
                                    session?.user?.role !== "Read-Only" &&
                                    <CreateGraph
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
                        checked={showAgain}
                        onCheckedChange={(checked) => setShowAgain(checked as boolean)}
                    />
                    <p>Don&apos;t show this again</p>
                </div>
            </DrawerContent>
        </Drawer>
    )
}