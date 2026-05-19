"use client";

import { useCallback, useEffect, useRef, ReactNode, MouseEvent as ReactMouseEvent } from "react";
import { cn } from "@/lib/utils";

type ResizeDirection = "right" | "bottom" | "bottom-right" | "bottom-left" | "left" | "top" | "top-left" | "top-right";

interface ResizableBoxProps {
    children: ReactNode;
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    direction?: ResizeDirection;
    onResizeEnd: (width: number, height: number) => void;
    className?: string;
    style?: React.CSSProperties;
    "data-testid"?: string;
}

/**
 * A container that can be resized by dragging its right edge, bottom edge, or bottom-right corner.
 * Calls `onResizeEnd` with the final dimensions when the user stops dragging.
 */
export default function ResizableBox({
    children,
    width,
    height,
    minWidth = 200,
    minHeight = 200,
    maxWidth,
    maxHeight,
    direction,
    onResizeEnd,
    className,
    style,
    "data-testid": dataTestId,
}: ResizableBoxProps) {
    const boxRef = useRef<HTMLDivElement>(null);
    const dragging = useRef<ResizeDirection | null>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ width: 0, height: 0 });

    const BOUNDARY_PADDING = 10;

    const clamp = useCallback((value: number, min: number, max: number) => Math.min(Math.max(value, min), max), []);

    const getMaxSize = useCallback((dir: ResizeDirection | null) => {
        if (!boxRef.current) return { maxW: maxWidth ?? 2000, maxH: maxHeight ?? 2000 };
        const rect = boxRef.current.getBoundingClientRect();
        const isLeft = dir === "left" || dir === "top-left" || dir === "bottom-left";
        const isTop = dir === "top" || dir === "top-left" || dir === "top-right";
        const maxW = maxWidth ?? (isLeft ? rect.right - BOUNDARY_PADDING : window.innerWidth - rect.left - BOUNDARY_PADDING);
        const maxH = maxHeight ?? (isTop ? rect.bottom - BOUNDARY_PADDING : window.innerHeight - rect.top - BOUNDARY_PADDING);
        return { maxW, maxH };
    }, [maxWidth, maxHeight]);

    const handleMouseDown = useCallback((dir: ResizeDirection) => (e: ReactMouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragging.current = dir;
        startPos.current = { x: e.clientX, y: e.clientY };
        startSize.current = { width, height };
    }, [width, height]);

    useEffect(() => {
        const handleMouseMove = (e: globalThis.MouseEvent) => {
            if (!dragging.current || !boxRef.current) return;

            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            const { maxW, maxH } = getMaxSize(dragging.current);

            let newWidth = startSize.current.width;
            let newHeight = startSize.current.height;

            if (dragging.current === "right" || dragging.current === "bottom-right" || dragging.current === "top-right") {
                newWidth = clamp(startSize.current.width + dx, minWidth, maxW);
            }
            if (dragging.current === "left" || dragging.current === "top-left" || dragging.current === "bottom-left") {
                newWidth = clamp(startSize.current.width - dx, minWidth, maxW);
            }
            if (dragging.current === "bottom" || dragging.current === "bottom-right" || dragging.current === "bottom-left") {
                newHeight = clamp(startSize.current.height + dy, minHeight, maxH);
            }
            if (dragging.current === "top" || dragging.current === "top-left" || dragging.current === "top-right") {
                newHeight = clamp(startSize.current.height - dy, minHeight, maxH);
            }

            boxRef.current.style.width = `${newWidth}px`;
            boxRef.current.style.height = `${newHeight}px`;
        };

        const handleMouseUp = () => {
            if (!dragging.current || !boxRef.current) return;
            dragging.current = null;
            const finalWidth = boxRef.current.offsetWidth;
            const finalHeight = boxRef.current.offsetHeight;
            onResizeEnd(finalWidth, finalHeight);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [clamp, minWidth, minHeight, getMaxSize, onResizeEnd]);

    return (
        <div
            ref={boxRef}
            className={cn("relative", className)}
            style={{ width, height, ...style }}
            data-testid={dataTestId}
        >
            {children}
            {/* Right edge handle */}
            {(!direction || direction === "right" || direction === "bottom-right" || direction === "top-right") && (
                <div
                    role="separator"
                    aria-orientation="vertical"
                    className="absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-50 after:absolute after:top-[18px] after:right-0 after:w-0 after:h-[calc(100%-36px)] after:border-r-2 after:border-transparent hover:after:border-foreground/30 after:transition-colors after:duration-150"
                    onMouseDown={handleMouseDown("right")}
                />
            )}
            {/* Bottom edge handle */}
            {(!direction || direction === "bottom" || direction === "bottom-right" || direction === "bottom-left") && (
                <div
                    role="separator"
                    aria-orientation="horizontal"
                    className="absolute -bottom-1.5 left-0 h-3 w-full cursor-row-resize z-50 after:absolute after:left-[18px] after:bottom-0 after:h-0 after:w-[calc(100%-36px)] after:border-b-2 after:border-transparent hover:after:border-foreground/30 after:transition-colors after:duration-150"
                    onMouseDown={handleMouseDown("bottom")}
                />
            )}
            {/* Bottom-right corner handle */}
            {(!direction || direction === "bottom-right") && (
                <div
                    role="separator"
                    className="absolute -bottom-2 -right-2 w-8 h-8 cursor-nwse-resize z-50 after:absolute after:bottom-[2px] after:right-[2px] after:w-[24px] after:h-[24px] after:border-b-2 after:border-r-2 after:border-transparent hover:after:border-foreground/30 after:rounded-br-[8px] after:transition-colors after:duration-150"
                    onMouseDown={handleMouseDown("bottom-right")}
                />
            )}
            {/* Bottom-left corner handle */}
            {(!direction || direction === "bottom-left") && (
                <div
                    role="separator"
                    className="absolute -bottom-2 -left-2 w-8 h-8 cursor-nesw-resize z-50 after:absolute after:bottom-[2px] after:left-[2px] after:w-[24px] after:h-[24px] after:border-b-2 after:border-l-2 after:border-transparent hover:after:border-foreground/30 after:rounded-bl-[8px] after:transition-colors after:duration-150"
                    onMouseDown={handleMouseDown("bottom-left")}
                />
            )}
            {/* Left edge handle */}
            {(!direction || direction === "left" || direction === "top-left" || direction === "bottom-left") && (
                <div
                    role="separator"
                    aria-orientation="vertical"
                    className="absolute top-0 -left-1.5 w-3 h-full cursor-col-resize z-50 after:absolute after:top-[18px] after:left-0 after:w-0 after:h-[calc(100%-36px)] after:border-l-2 after:border-transparent hover:after:border-foreground/30 after:transition-colors after:duration-150"
                    onMouseDown={handleMouseDown("left")}
                />
            )}
            {/* Top edge handle */}
            {(!direction || direction === "top" || direction === "top-left" || direction === "top-right") && (
                <div
                    role="separator"
                    aria-orientation="horizontal"
                    className="absolute -top-1.5 left-0 h-3 w-full cursor-row-resize z-50 after:absolute after:left-[18px] after:top-0 after:h-0 after:w-[calc(100%-36px)] after:border-t-2 after:border-transparent hover:after:border-foreground/30 after:transition-colors after:duration-150"
                    onMouseDown={handleMouseDown("top")}
                />
            )}
            {/* Top-right corner handle */}
            {(!direction || direction === "top-right") && (
                <div
                    role="separator"
                    className="absolute -top-2 -right-2 w-8 h-8 cursor-nesw-resize z-50 after:absolute after:top-[2px] after:right-[2px] after:w-[24px] after:h-[24px] after:border-t-2 after:border-r-2 after:border-transparent hover:after:border-foreground/30 after:rounded-tr-[8px] after:transition-colors after:duration-150"
                    onMouseDown={handleMouseDown("top-right")}
                />
            )}
            {/* Top-left corner handle */}
            {(!direction || direction === "top-left") && (
                <div
                    role="separator"
                    className="absolute -top-2 -left-2 w-8 h-8 cursor-nwse-resize z-50 after:absolute after:top-[2px] after:left-[2px] after:w-[24px] after:h-[24px] after:border-t-2 after:border-l-2 after:border-transparent hover:after:border-foreground/30 after:rounded-tl-[8px] after:transition-colors after:duration-150"
                    onMouseDown={handleMouseDown("top-left")}
                />
            )}
        </div>
    );
}
