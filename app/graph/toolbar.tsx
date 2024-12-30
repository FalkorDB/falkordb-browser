'use client'

/* eslint-disable react/require-default-props */

import { Link, Move, Pause, PlusCircle, Shrink, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import Button from "../components/ui/Button";
import DialogComponent from "../components/DialogComponent";

interface Props {
    addDisabled?: boolean,
    disabled?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartRef: React.RefObject<any>,
    onDeleteElement?: () => Promise<void>,
    onAddEntity?: () => void,
    onAddRelation?: () => void,
    deleteDisabled?: boolean,
    cooldownTime: number | undefined
    setCooldownTime: Dispatch<SetStateAction<number | undefined>>
    handelCooldown: () => void
}

export default function Toolbar({
    disabled,
    addDisabled,
    chartRef,
    onDeleteElement,
    onAddEntity,
    onAddRelation,
    deleteDisabled,
    cooldownTime,
    setCooldownTime,
    handelCooldown,
}: Props) {

    const [deleteOpen, setDeleteOpen] = useState(false)

    const handleZoomClick = (changeFactor: number) => {
        const chart = chartRef.current
        if (chart) {
            chart.zoom(chart.zoom() * changeFactor)
        }
    }

    const handleCenterClick = () => {
        const chart = chartRef.current
        if (chart) {
            chart.zoomToFit(1000, 40)
        }
    }

    const handelDeleteElement = async () => {
        if (!onDeleteElement) return
        await onDeleteElement()
        setDeleteOpen(false)
    }

    return (
        <div className="flex items-center gap-6 p-1">
            <div className="flex gap-4">
                <Button
                    className="text-nowrap"
                    disabled={addDisabled}
                    variant="Primary"
                    label="Add Node"
                    onClick={onAddEntity}
                >
                    <PlusCircle size={20} />
                </Button>
                <Button
                    className="text-nowrap"
                    disabled={addDisabled}
                    variant="Primary"
                    label="Add Relation"
                    onClick={onAddRelation}
                    type="button"
                >
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link size={20} />
                </Button>
                <DialogComponent onOpenChange={setDeleteOpen} open={deleteOpen} title="Delete Elements" description={`Are you sure ???\nThis action will delete all selected elements`} trigger={
                    <Button
                    className="text-nowrap"
                        variant="Primary"
                        label="Delete"
                        disabled={deleteDisabled}
                    >
                        <Trash2 size={20} />
                    </Button>
                }>
                    <div className="flex justify-end gap-4">
                        <Button
                            className="text-nowrap"
                            variant="Primary"
                            label="Delete"
                            onClick={handelDeleteElement}
                            disabled={deleteDisabled}
                        />
                        <Button
                            className="text-nowrap"
                            variant="Primary"
                            label="Cancel"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleteDisabled}
                        />
                    </div>
                </DialogComponent>
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
                <Button
                    className="text-nowrap"
                    disabled={disabled}
                    variant="Secondary"
                    label={cooldownTime !== undefined ? "Move" : "Stay"}
                    onClick={() => {
                        setCooldownTime(cooldownTime !== undefined ? undefined : 2000)
                        if (cooldownTime !== undefined) {
                            handelCooldown()
                        }
                    }}
                >
                    {cooldownTime !== undefined ? <Move size={20} /> : <Pause size={20} />}
                </Button>
            </div>
        </div>
    )
}