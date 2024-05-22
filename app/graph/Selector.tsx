import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";
import CytoscapeComponent from "react-cytoscapejs";
import fcose from "cytoscape-fcose";
import cytoscape from "cytoscape";
import Combobox from "../components/combobox";

const LAYOUT = {
    name: "fcose",
    fit: true,
    padding: 30,
}

cytoscape.use(fcose);

function getStyle() {

    const style: cytoscape.Stylesheet[] = [
        {
            selector: "core",
            style: {
                'active-bg-size': 0,  // hide gray circle when panning
                // All of the following styles are meaningless and are specified
                // to satisfy the linter...
                'active-bg-color': 'blue',
                'active-bg-opacity': 0.3,
                "selection-box-border-color": 'blue',
                "selection-box-border-width": 0,
                "selection-box-opacity": 1,
                "selection-box-color": 'blue',
                "outside-texture-bg-color": 'blue',
                "outside-texture-bg-opacity": 1,
            },
        },
        {
            selector: "node",
            style: {
                label: "data(name)",
                content: "adz;uhlgn",
                "text-valign": "center",
                "text-halign": "center",
                "text-wrap": "ellipsis",
                // "text-max-width": "10rem",
                shape: "rectangle",
                height: "30rem",
                width: "30rem",
                "border-width": 0.15,
                "border-opacity": 0.5,
                "background-color": "data(color)",
                "font-size": "3rem",
                "overlay-padding": "1rem",
            },
        },
        {
            selector: "node:active",
            style: {
                "overlay-opacity": 0,  // hide gray box around active node
            },
        },
        {
            selector: "edge",
            style: {
                width: 0.5,
                "line-color": "#ccc",
                "arrow-scale": 0.3,
                "target-arrow-shape": "triangle",
                label: "data(label)",
                'curve-style': 'straight',
                "text-background-color": "white",
                "color": "black",
                "text-background-opacity": 1,
                "font-size": "3rem",
                "overlay-padding": "2rem",

            },
        },
    ]
    return style
}

export default function Selector({ graphName, onChange }: {
    graphName: string
    onChange: (graphName: string) => void
}) {

    const [options, setOptions] = useState<string[]>([]);
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [reload, setReload] = useState<number>(1);

    useEffect(() => {
        const run = async () => {
            const result = await fetch("api/graph", {
                method: "GET"
            })

            const json = await result.json()
            setOptions(json.result)
        }
        run()
    }, [reload])

    const handelOnChange = (name: string) => {
        setSelectedValue(name)
        onChange(name)
    }

    const onDuplicate = async () => {
        fetch(`api/graph/${selectedValue}/?newName=${graphName + reload}`)
        setReload(reload + 1)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
                <Combobox options={options} selectedValue={selectedValue} setSelectedValue={handelOnChange} />
                <div className="flex flex-row gap-16 text-indigo-600">
                    <p>Versions()</p>
                    <button
                        className="disabled:text-gray-400 disabled:text-opacity-70"
                        title="Duplicate"
                        type="button"
                        onClick={onDuplicate}
                        disabled={!graphName}
                    >
                        <p>Duplicate</p>
                    </button>
                </div>
            </div>
            <div className="flex flex-row gap-4 justify-between items-center shadow-lg p-4 rounded-xl">
                <div className="space-x-12">
                    <span className="text-gray-400 opacity-70">Created on 2/2 24</span>
                    <span className="text-slate-700 opacity-60">12 Data sources &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 2,542 Nodes &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 1,600 connections</span>
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
                    <DialogContent displayClose={false} className="w-[90%] h-[90%] flex flex-col p-0 shadow-lg bg-white rounded-xl">
                        <DialogHeader className="h-[10%] p-4 bg-indigo-600 flex flex-row justify-between rounded-t-xl">
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
                        <CytoscapeComponent
                            className="w-full h-full"
                            layout={LAYOUT}
                            stylesheet={getStyle()}
                            elements={[
                                {
                                    data: {
                                        id: '0',
                                        name: 'anchel',
                                        age: 20,
                                        color: "red"
                                    }
                                },
                                {
                                    data: {
                                        id: 'ujfiuol',
                                        source: '0',
                                        target: '1',
                                    }
                                },
                                {
                                    data: {
                                        id: '1',
                                        name: 'guy',
                                        age: 30,
                                        color: "blue"
                                    }
                                }
                            ]}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div >
    )
}