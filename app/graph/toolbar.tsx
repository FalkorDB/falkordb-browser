'use client'

/* eslint-disable react/require-default-props */

import { Link, PlusCircle, Shrink, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { MutableRefObject, useState } from "react";
import { ForceGraphMethods } from "react-force-graph-2d";
import { handleZoomToFit } from "@/lib/utils";
import { Node, Link as LinkType } from "../api/graph/model";
import Button from "../components/ui/Button";
import DeleteElement from "./DeleteElement";

interface Props {
    disabled?: boolean,
    chartRef: MutableRefObject<ForceGraphMethods<Node, LinkType>>,
    onDeleteElement?: () => Promise<void>,
    onAddEntity?: () => void,
    onAddRelation?: () => void,
    deleteDisabled?: boolean,
    selectedElementsLength: number,
    displayAdd: boolean
}

export default function Toolbar({
    disabled,
    chartRef,
    onDeleteElement,
    onAddEntity,
    onAddRelation,
    deleteDisabled,
    selectedElementsLength,
    displayAdd
}: Props) {

    const [deleteOpen, setDeleteOpen] = useState(false)

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
            <div className="flex gap-4">
                {
                    displayAdd &&
                    <>
                        <Button
                            className="text-nowrap"
                            disabled={disabled}
                            variant="Primary"
                            label="Add Node"
                            onClick={onAddEntity}
                        >
                            <PlusCircle size={20} />
                        </Button>
                        <Button
                            className="text-nowrap"
                            disabled={disabled}
                            variant="Primary"
                            label="Add Relation"
                            onClick={onAddRelation}
                            type="button"
                        >
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <Link size={20} />
                        </Button>
                    </>
                }
                <DeleteElement
                    description={`Are you sure you want to delete this ${selectedElementsLength > 1 ? "elements" : "element"}?`}
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
            </div>
            {
                (onAddEntity || onAddRelation || onDeleteElement) &&
                <p className="text-slate-600">|</p>
            }
            <div className="flex items-center gap-4">
                <Button
                    className="text-nowrap"
                    disabled={disabled}
                    variant="Secondary"
                    label="Zoom In"
                    onClick={() => handleZoomClick(1.1)}
                >
                    <ZoomIn size={20} />
                </Button>
                <Button
                    className="text-nowrap"
                    disabled={disabled}
                    variant="Secondary"
                    label="Zoom Out"
                    onClick={() => handleZoomClick(0.9)}
                >
                    <ZoomOut size={20} />
                </Button>
                <Button
                    className="text-nowrap"
                    disabled={disabled}
                    variant="Secondary"
                    label="Fit To Size"
                    onClick={() => handleCenterClick()}
                >
                    <Shrink size={20} />
                </Button>
            </div>
        </div>
    )
}