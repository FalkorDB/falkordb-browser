"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { CanvasDimension } from "@falkordb/canvas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { needs3DWarning, register3DCheck, type DeviceResources, type GraphSize } from "@/lib/graph3DResources";
import type { GraphRef } from "@/lib/utils";
import { getGPUCapabilities, type GPUCapabilities } from "@/lib/gpuCapabilities";

export default function use3DWarning(dimension: CanvasDimension, setDimension: (value: CanvasDimension) => void, canvasRef: GraphRef) {
    const { toast } = useToast();
    const dimensionRef = useRef(dimension);
    const approvedRef = useRef<GraphSize | undefined>(undefined);
    const [approval, setApproval] = useState(0);
    const [pending, setPending] = useState<GraphSize & { gpu: GPUCapabilities }>();

    useLayoutEffect(() => {
        dimensionRef.current = dimension;
        if (dimension === "2d") {
            approvedRef.current = undefined;
            setPending(undefined);
        }
    }, [dimension]);

    // Called before both dimension changes and data writes. setDimension('2d')
    // tears down 3D synchronously, before a large result reaches the renderer.
    const check3D = useCallback((size: GraphSize) => {
        if (dimensionRef.current !== "3d") return true;
        const gpu = getGPUCapabilities();
        const resources: DeviceResources = {
            deviceMemory: "deviceMemory" in navigator && typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : undefined,
            hardwareConcurrency: navigator.hardwareConcurrency,
            gpu,
        };
        if (!needs3DWarning(size, resources, approvedRef.current)) {
            setPending(undefined);
            return true;
        }
        void canvasRef.current?.setDimension("2d").catch((error: unknown) => {
            console.error("Could not switch to the 2D view", error);
            toast({ title: "Could not switch to the 2D view", description: "Reduce the query result size before continuing.", variant: "destructive" });
        });
        setPending({ ...size, gpu });
        return false;
    }, [canvasRef, toast]);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        return register3DCheck(canvas, check3D);
    }, [canvasRef, check3D]);

    const fallBackTo2D = () => {
        dimensionRef.current = "2d";
        approvedRef.current = undefined;
        setPending(undefined);
        setDimension("2d");
    };

    const warning = (
        <AlertDialog open={pending !== undefined} onOpenChange={(open) => { if (!open) fallBackTo2D(); }}>
            <AlertDialogContent data-testid="graph3DWarning">
                <AlertDialogHeader>
                    <AlertDialogTitle>Large graph in 3D</AlertDialogTitle>
                    <AlertDialogDescription>
                        This graph has {pending?.nodes.toLocaleString()} nodes and {pending?.links.toLocaleString()} relationships.
                        Based on the device information available, 3D may freeze or crash this browser tab.
                        {pending?.gpu.webgl2 === "unavailable" && " WebGL2 could not be started, so 3D may not be available."}
                        {pending?.gpu.softwareRendering && " Software rendering was detected, which uses the CPU instead of hardware GPU acceleration."}
                        {" "}Available GPU memory cannot be reliably checked. The graph is shown in 2D until you choose.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={fallBackTo2D}>Use 2D (recommended)</AlertDialogCancel>
                    <AlertDialogAction onClick={(event) => {
                        // Keep Radix's automatic close from also taking the cancel path.
                        event.preventDefault();
                        approvedRef.current = pending;
                        setPending(undefined);
                        setApproval(value => value + 1);
                    }}>Proceed with 3D</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    return { check3D, approval, warning };
}
