'use client'

/* eslint-disable react/require-default-props */
/* eslint-disable react-hooks/exhaustive-deps */

import { Link, PlusCircle, Shrink, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { ImperativePanelHandle } from "react-resizable-panels";
import Button from "../components/Button";

export default function Toolbar({ dataPanel, chartRef, onDeleteElementGraph, onDeleteElementSchema, deleteDisable, setIsAdd }: {
    chartRef: React.RefObject<cytoscape.Core>,
    dataPanel?: React.RefObject<ImperativePanelHandle>,
    onDeleteElementGraph?: () => Promise<void>,
    onDeleteElementSchema?: () => void,
    setIsAdd?: (isAddType: "node" | "edge") => void,
    deleteDisable?: boolean,
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
        <div className="flex flex-row items-center gap-6">
            <div className="flex flex-row gap-8 items-center">
                {
                    setIsAdd &&
                    <div className="flex flex-row gap-4">
                        {
                            onDeleteElementGraph ?
                                <>
                                    < Button
                                        disabled={!dataPanel}
                                        variant="Secondary"
                                        label="Add Entity"
                                        className="flex flex-row items-center gap-2"
                                        icon={<PlusCircle />}
                                        onClick={() => {
                                            setIsAdd("node")
                                            if (!dataPanel) return
                                            dataPanel.current?.expand()
                                        }}
                                    />
                                    <Button
                                        disabled={!dataPanel}
                                        variant="Secondary"
                                        className="flex flex-row items-center gap-2"
                                        label="Add Relation"
                                        type="button"
                                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                        icon={<Link />}
                                        onClick={() => {
                                            setIsAdd("edge")
                                            if (!dataPanel) return
                                            dataPanel.current?.expand()
                                        }}
                                    />
                                    <Button
                                        className="flex flex-row items-center gap-2"
                                        variant="Secondary"
                                        label="Delete"
                                        icon={<Trash2 />}
                                        onClick={onDeleteElementGraph}
                                        disabled={deleteDisable || !dataPanel}
                                    />
                                </>
                                : onDeleteElementSchema &&
                                <>
                                    <Button
                                        disabled={!chartRef}
                                        variant="Secondary"
                                        label="Add Entity"
                                        icon={<PlusCircle />}
                                        onClick={() => {
                                            setIsAdd("node")
                                            if (!dataPanel) return
                                            dataPanel.current?.expand()
                                        }}
                                    />
                                    <Button
                                        disabled={!chartRef}
                                        variant="Secondary"
                                        label="Add Relation"
                                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                        icon={<Link />}
                                        onClick={() => {
                                            setIsAdd("edge")
                                            if (!dataPanel) return
                                            dataPanel.current?.expand()
                                        }}
                                    />
                                    <Button
                                        disabled={!chartRef}
                                        variant="Secondary"
                                        label="Delete"
                                        icon={<Trash2 />}
                                        onClick={onDeleteElementSchema}
                                    />
                                </>
                        }
                    </div>
                }
                {
                    setIsAdd && (onDeleteElementSchema || onDeleteElementGraph) &&
                    <p className="text-slate-600">|</p>
                }
                <div className="flex flex-row items-center gap-4">
                    <Button
                        disabled={!chartRef}
                        variant="Secondary"
                        label="Zoom In"
                        icon={<ZoomIn />}
                        onClick={() => handleZoomClick(1.1)}
                    />
                    <Button
                        disabled={!chartRef}
                        variant="Secondary"
                        label="Zoom Out"
                        icon={<ZoomOut />}
                        onClick={() => handleZoomClick(0.9)}
                    />
                    <Button
                        disabled={!chartRef}
                        variant="Secondary"
                        label="Fit To Size"
                        icon={<Shrink />}
                        onClick={() => handleCenterClick()}
                    />
                </div>
            </div>
        </div >
    )
}