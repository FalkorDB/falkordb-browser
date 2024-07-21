'use client'

/* eslint-disable react/require-default-props */

import { Link, PlusCircle, Shrink, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import Button from "../components/ui/Button";

export default function Toolbar({disabled, chartRef, onDeleteElement, onAddEntity, onAddRelation, deleteDisabled }: {
    disabled?: boolean,
    chartRef: React.RefObject<cytoscape.Core>,
    onDeleteElement?: () => Promise<void>,
    onAddEntity?: () => void,
    onAddRelation?: () => void,
    deleteDisabled?: boolean,
}) {

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

    return (
        <div className="flex items-center gap-6 p-1">
            <div className="flex gap-4">
                <Button
                    disabled
                    variant="Secondary"
                    label="Add Entity"
                    className="flex items-center gap-2"
                    icon={<PlusCircle />}
                />
                <Button
                    disabled
                    variant="Secondary"
                    className="flex items-center gap-2"
                    label="Add Relation"
                    type="button"
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    icon={<Link />}
                />
                <Button
                    className="flex items-center gap-2"
                    variant="Secondary"
                    label="Delete"
                    icon={<Trash2 />}
                    onClick={onDeleteElement}
                    disabled={deleteDisabled}
                />
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