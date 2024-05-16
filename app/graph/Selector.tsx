import { useEffect, useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, ChevronLeft, Circle, X } from "lucide-react";
import CytoscapeComponent from "react-cytoscapejs";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { EdgeDataDefinition, EventObject, NodeDataDefinition } from "cytoscape";
import Combobox from "../components/combobox";
import DataPanel from "./DataPanel";

export default function Selector({ onChange }: { onChange: (graphName: string) => void }) {

    const [options, setOptions] = useState<string[]>([]);
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [selectedObject, setSelectedObject] = useState<NodeDataDefinition | EdgeDataDefinition>();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const dataPanel = useRef<ImperativePanelHandle>(null);

    useEffect(() => {
        const run = async () => {
            const result = await fetch("api/graph", {
                method: "GET"
            })

            const json = await result.json()
            setOptions(json.result)
        }
        run()
        dataPanel.current?.collapse()
    }, [])

    const handelOnChange = (graphName: string) => {
        setSelectedValue(graphName)
        onChange(graphName)
    }

    const onDuplicate = async () => {
        // const result = await fetch(`api/graph/${selectedValue}/?newName=${}`)
    }

    const onExpand = () => {
        if (dataPanel.current) {
            const panel = dataPanel.current
            if (panel.isCollapsed()) {
                panel.expand()
            } else {
                panel.collapse()
            }
        }
    }

    const handleTap = (evt: EventObject) => {
        const object = evt.target.json().data;
        setSelectedObject(object);
        dataPanel.current?.expand()
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
                <Combobox options={options} selectedValue={selectedValue} setSelectedValue={handelOnChange} />
                <div className="flex flex-row gap-16">
                    <button
                        className=""
                        title=""
                        type="button"
                    >
                        <p className="text-blue-700">Versions(4)</p>
                    </button>
                    <button
                        className=""
                        title="Duplicate"
                        type="button"
                        onClick={onDuplicate}
                    >
                        <p className="text-blue-700">Duplicate</p>
                    </button>
                </div>
            </div>
            <div className="flex flex-row gap-4 justify-between items-center shadow-xl ring-offset-white p-4 rounded-xl">
                <div className="space-x-12">
                    <span className="text-[#CDCDCD]">Created on 2/2 24</span>
                    <span className="text-[#47556980]">12 Data sources &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 2,542 Nodes &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 1,600 connections</span>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            title="View Schema"
                            type="button"
                        >
                            <p>View Schema</p>
                        </button>
                    </DialogTrigger>
                    <DialogContent displayClose={false} className="w-[90%] h-[90%] flex flex-col p-0 shadow-xl ring-offset-white bg-white rounded-xl">
                        <DialogHeader className="h-[10%] p-4 bg-blue-800 flex flex-row justify-between rounded-t-xl">
                            <DialogTitle className="flex flex-row items-center text-white">
                                {selectedValue} Schema
                            </DialogTitle>
                            <DialogClose asChild>
                                <button
                                    title="Close"
                                    type="button"
                                    aria-label="Close"
                                >
                                    <X color="white" size={30} />
                                </button>
                            </DialogClose>
                        </DialogHeader>
                        <DialogDescription className="flex flex-row gap-8 px-8 items-center">
                            <p>Edit Schema: </p>
                            <div className="flex flex-row gap-12">
                                <button
                                    className="flex flex-row items-center gap-2"
                                    title="Add Entity"
                                    type="button"
                                >
                                    <Circle />
                                    <p>Add Entity</p>
                                </button>
                                <button
                                    className="flex flex-row items-center gap-2"
                                    title="Add Relation"
                                    type="button"
                                >
                                    <p>Add Relation</p>
                                </button>
                                <button
                                    className="flex flex-row items-center gap-2"
                                    title="Add Relation"
                                    type="button"
                                >
                                    <AlertCircle />
                                    <p>Create index</p>
                                </button>
                            </div>
                        </DialogDescription>
                        <ResizablePanelGroup className="relative grow px-8" direction="horizontal">
                            <ResizablePanel
                                defaultSize={100}
                            >
                                <CytoscapeComponent
                                    elements={[]}
                                    cy={(cy) => {
                                        cy.on("tap", handleTap)
                                    }}
                                />
                                {
                                    isCollapsed &&
                                    <button
                                        className="absolute top-8 right-8 p-4 bg-blue-800 rounded-se-xl"
                                        title="Close"
                                        type="button"
                                        aria-label="Close"
                                    >
                                        <ChevronLeft className="border border-white" color="white" />
                                    </button>
                                }
                            </ResizablePanel>
                            <ResizablePanel
                                ref={dataPanel}
                                onCollapse={() => setIsCollapsed(true)}
                                onExpand={() => setIsCollapsed(false)}
                                defaultSize={20}
                                collapsedSize={0}
                            >
                                {selectedObject && <DataPanel object={selectedObject} onExpand={onExpand} />}
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}