'use client'

/* eslint-disable react/require-default-props */

import { Link, PlusCircle, Shrink, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { useContext, useState } from "react";
import { handleZoomToFit, GraphRef } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Button from "../components/ui/Button";
import DeleteElement from "./DeleteElement";
import { IndicatorContext } from "../components/provider";

interface Props {
    disabled?: boolean,
    chartRef: GraphRef,
    onDeleteElement?: () => Promise<void>,
    onAddEntity?: () => void,
    onAddRelation?: () => void,
    deleteDisabled?: boolean,
    displayAdd: boolean,
    type: "Graph" | "Schema"
}

export default function Toolbar({
    disabled,
    chartRef,
    onDeleteElement,
    onAddEntity,
    onAddRelation,
    deleteDisabled,
    displayAdd,
    type
}: Props) {

    const [deleteOpen, setDeleteOpen] = useState(false)
    const { data: session } = useSession()
    const { indicator } = useContext(IndicatorContext)

    const handleZoomClick = (changeFactor: number) => {
        const chart = chartRef.current
        if (chart) {
            chart.zoom(chart.zoom() * changeFactor)
        }
    }

    const handleCenterClick = () => {
        handleZoomToFit(chartRef)
    }

    const handleDeleteElement = async () => {
        if (!onDeleteElement) return
        await onDeleteElement()
        setDeleteOpen(false)
    }

    return (
        <div className="flex items-center gap-6 p-1">
            {
                session?.user?.role !== "Read-Only" &&
                <div className="flex gap-4">
                    {
                        displayAdd &&
                        <>
                            <Button
                                className="text-nowrap"
                                disabled={disabled}
                                variant="Primary"
                                label="Add Node"
                                title={`Add a new node to the ${type}`}
                                onClick={onAddEntity}
                            >
                                <PlusCircle size={20} />
                            </Button>
                            <Button
                                className="text-nowrap"
                                disabled={disabled}
                                variant="Primary"
                                label="Add Relation"
                                title={`Add a new relation to the ${type}`}
                                onClick={onAddRelation}
                                type="button"
                            >
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <Link size={20} />
                            </Button>
                        </>
                    }
                    <DeleteElement
                        description="Are you sure you want to delete this element(s)?"
                        open={deleteOpen}
                        setOpen={setDeleteOpen}
                        onDeleteElement={handleDeleteElement}
                        trigger={
                            <Button
                                className="text-nowrap"
                                variant="Primary"
                                label="Delete"
                                disabled={deleteDisabled || disabled}
                            >
                                <Trash2 size={20} />
                            </Button>
                        }
                    />
                </div>}
            {
                (onAddEntity || onAddRelation || onDeleteElement) && session?.user?.role !== "Read-Only" &&
                <p className="text-slate-600">|</p>
            }
            <div className="flex items-center gap-4">
                <Button
                    className="text-nowrap"
                    disabled={disabled || indicator === "offline"}
                    variant="Secondary"
                    label="Zoom In"
                    title="Zoom in for a closer view"
                    onClick={() => handleZoomClick(1.1)}
                >   
                    <ZoomIn size={20} />
                </Button>
                <Button
                    className="text-nowrap"
                    disabled={disabled || indicator === "offline"}
                    variant="Secondary"
                    label="Zoom Out"
                    title="Zoom out for a broader view"
                    onClick={() => handleZoomClick(0.9)}
                >
                    <ZoomOut size={20} />
                </Button>
                <Button
                    className="text-nowrap"
                    disabled={disabled || indicator === "offline"}
                    variant="Secondary"
                    label="Fit To Size"
                    title="Center and fit the graph to the screen"
                    onClick={() => handleCenterClick()}
                >
                    <Shrink size={20} />
                </Button>
            </div>
        </div>
    )
}