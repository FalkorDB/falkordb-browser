import { Circle, X, ZoomIn, ZoomOut } from "lucide-react";

export default function Toolbar({ chartRef, onDelete, deleteDisable }: {
    chartRef: React.RefObject<cytoscape.Core>,
    onDelete: () => Promise<void>,
    deleteDisable: boolean
}) {

    function handleZoomClick(changeFactor: number) {
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
            <p>Edit Graph: </p>
            <div className="flex flex-row gap-12">
                <button
                    className="flex flex-row items-center gap-2"
                    title="Add Entity"
                    type="button"
                >
                    <Circle size={30} />
                    <p>Add Entity</p>
                </button>
                <button
                    className="flex flex-row gap-2"
                    title="Add Relation"
                    type="button"
                >
                    <p>Add Relation</p>
                </button>
                <button
                    className="flex flex-row items-center gap-2"
                    title="Delete"
                    type="button"
                    onClick={onDelete}
                    disabled={deleteDisable}
                >
                    <X size={30} />
                    <p>Delete</p>
                </button>
                <p>|</p>
                <div className="flex flex-row items-center gap-6">
                    <button
                        className="flex flex-row items-center gap-2"
                        title="Zoom In"
                        type="button"
                        onClick={() => handleZoomClick(1.1)}
                    >
                        <ZoomIn size={30} />
                        <p>Zoom In</p>
                    </button>
                    <button
                        className="flex flex-row gap-2"
                        title="Zoom Out"
                        type="button"
                        onClick={() => handleZoomClick(0.9)}
                    >
                        <ZoomOut size={30} />
                        <p>Zoom Out</p>
                    </button>
                    <button
                        className="flex flex-row items-center gap-2"
                        title="Fit To Size"
                        type="button"
                        onClick={() => handleCenterClick()}
                    >
                        <X size={30} />
                        <p>Fit To Size</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
