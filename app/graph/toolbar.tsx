'use client'

/* eslint-disable react/require-default-props */

import { Link, PlusCircle, Shrink, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import Button from "../components/ui/Button";
import DialogComponent from "../components/DialogComponent";

export default function Toolbar({ disabled, chartRef, onDeleteElement, onAddEntity, onAddRelation, deleteDisabled }: {
    disabled?: boolean,
    chartRef: React.RefObject<cytoscape.Core>,
    onDeleteElement?: () => Promise<void>,
    onAddEntity?: () => void,
    onAddRelation?: () => void,
    deleteDisabled?: boolean,
}) {

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
            chart.fit()
            chart.center()
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
                    disabled={disabled}
                    variant="Secondary"
                    label="Add Entity"
                    className="flex items-center gap-2"
                    onClick={onAddEntity}
                    icon={<PlusCircle />}
                />
                <Button
                    disabled={disabled}
                    variant="Secondary"
                    className="flex items-center gap-2"
                    label="Add Relation"
                    onClick={onAddRelation}
                    type="button"
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    icon={<Link />}
                />
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="Secondary"
                            label="Delete"
                            icon={<Trash2 />}
                            disabled={deleteDisabled}
                        />
                    </DialogTrigger>
                    <DialogComponent title="Delete Elements" description={`Are you sure ???\nThis action will delete all selected elements`}>
                        <div className="flex justify-end gap-4">
                            <Button
                                variant="Primary"
                                label="Delete"
                                onClick={handelDeleteElement}
                                disabled={deleteDisabled}
                            />
                            <Button
                                variant="Primary"
                                label="Cancel"
                                onClick={() => setDeleteOpen(false)}
                                disabled={deleteDisabled}
                            />
                        </div>
                    </DialogComponent>
                </Dialog>

            </div>
            {
                (onAddEntity || onAddRelation || onDeleteElement) &&
                <p className="text-slate-600">|</p>
            }
            <div className="flex items-center gap-4">
                <Button
                    disabled={disabled}
                    variant="Secondary"
                    label="Zoom In"
                    icon={<ZoomIn />}
                    onClick={() => handleZoomClick(1.1)}
                />
                <Button
                    disabled={disabled}
                    variant="Secondary"
                    label="Zoom Out"
                    icon={<ZoomOut />}
                    onClick={() => handleZoomClick(0.9)}
                />
                <Button
                    disabled={disabled}
                    variant="Secondary"
                    label="Fit To Size"
                    icon={<Shrink />}
                    onClick={() => handleCenterClick()}
                />
            </div>
        </div>
    )
}