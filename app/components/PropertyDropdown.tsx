import { ChevronDown } from "lucide-react";

interface PropertyEntity {
    name: string,
    displayProperty?: string,
    hoverProperty?: string,
}

interface PropertyDropdownProps<T extends PropertyEntity> {
    label: T,
    availableProperties: string[],
    isOpen: boolean,
    onToggleOpen: () => void,
    onClose: () => void,
    onDisplayPropertyChange: (label: T, property: string | undefined) => void,
    onHoverPropertyChange: (label: T, property: string | undefined) => void,
}

export default function PropertyDropdown<T extends PropertyEntity>({
    label,
    availableProperties,
    isOpen,
    onToggleOpen,
    onClose,
    onDisplayPropertyChange,
    onHoverPropertyChange,
}: PropertyDropdownProps<T>) {
    return (
        <div className="relative">
            <button
                className="h-6 w-6 p-0 border-0 bg-transparent hover:bg-muted rounded flex items-center justify-center"
                onClick={onToggleOpen}
            >
                <ChevronDown className="h-3 w-3" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[99998] bg-black/20"
                        onClick={onClose}
                    />
                    <div
                        className="fixed z-[99999] bg-background border border-border rounded-md shadow-2xl w-56"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div className="p-2">
                            {/* Header */}
                            <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground mb-2 pb-1 border-b">
                                <div>Property</div>
                                <div className="text-center">Display</div>
                                <div className="text-center">Hover</div>
                            </div>

                            {/* Default/header row */}
                            <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 items-center py-2 hover:bg-muted rounded px-1">
                                <div className="text-sm truncate">Default</div>
                                <label className="flex justify-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`${label.name}-display`}
                                        checked={label.displayProperty === undefined}
                                        onChange={() => onDisplayPropertyChange(label, undefined)}
                                        className="h-4 w-4"
                                    />
                                </label>
                                <label className="flex justify-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`${label.name}-hover`}
                                        checked={label.hoverProperty === undefined}
                                        onChange={() => {
                                            onHoverPropertyChange(label, undefined);
                                        }}
                                        className="h-4 w-4"
                                    />
                                </label>
                            </div>

                            {/* Property rows */}
                            {availableProperties.map((property) => (
                                <div key={property} className="grid grid-cols-[2fr_1fr_1fr] gap-2 items-center py-2 hover:bg-muted rounded px-1">
                                    <div className="text-sm truncate">{property}</div>
                                    <label className="flex justify-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`${label.name}-display`}
                                            checked={label.displayProperty === property}
                                            onChange={() => onDisplayPropertyChange(label, property)}
                                            className="h-4 w-4"
                                        />
                                    </label>
                                    <label className="flex justify-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`${label.name}-hover`}
                                            checked={label.hoverProperty === property}
                                            onChange={() => {
                                                onHoverPropertyChange(label, property);
                                            }}
                                            className="h-4 w-4"
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}


