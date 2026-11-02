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
    const pendingRef = useRef(false);
    const fallbackRef = useRef<Promise<boolean> | undefined>(undefined);
    const fallbackFailedRef = useRef(false);

    const ensure2D = useCallback(() => {
        if (fallbackRef.current) return fallbackRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return Promise.resolve(false);
        const fallback = canvas.setDimension("2d").then(() => true, (error: unknown) => {
            console.error("Could not switch to the 2D view", error);
            toast({ title: "Could not switch to the 2D view", description: "Reduce the query result size before continuing.", variant: "destructive" });
            return false;
        });
        fallbackRef.current = fallback;
        void fallback.then(succeeded => {
            if (fallbackRef.current !== fallback) return;
            fallbackFailedRef.current = !succeeded;
            fallbackRef.current = undefined;
        });
        return fallback;
    }, [canvasRef, toast]);

    useLayoutEffect(() => {
        dimensionRef.current = dimension;
        if (dimension === "2d") {
            approvedRef.current = undefined;
            pendingRef.current = false;
            setPending(undefined);
        }
    }, [dimension]);

    // The boolean gates entry to 3D; prepareData also awaits the safe fallback.
    const check3D = useCallback((size: GraphSize) => {
        if (dimensionRef.current !== "3d") return true;
        const gpu = getGPUCapabilities();
        const resources: DeviceResources = {
            deviceMemory: "deviceMemory" in navigator && typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : undefined,
            hardwareConcurrency: navigator.hardwareConcurrency,
            gpu,
        };
        if (!needs3DWarning(size, resources, approvedRef.current)) {
            if (pendingRef.current) {
                dimensionRef.current = "2d";
                approvedRef.current = undefined;
                pendingRef.current = false;
                setDimension("2d");
            }
            setPending(undefined);
            return true;
        }
        void ensure2D();
        pendingRef.current = true;
        setPending({ ...size, gpu });
        return false;
    }, [ensure2D, setDimension]);

    const prepareData = useCallback(async (size: GraphSize) => {
        const allowed = check3D(size);
        const fallback = fallbackRef.current;
        if (fallback) return await fallback;
        if (fallbackFailedRef.current) return await ensure2D();
        return allowed;
    }, [check3D, ensure2D]);
    const getRequestedDimension = useCallback(() => dimensionRef.current, []);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        return register3DCheck(canvas, prepareData);
    }, [canvasRef, prepareData]);

    const fallBackTo2D = () => {
        dimensionRef.current = "2d";
        approvedRef.current = undefined;
        pendingRef.current = false;
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
                        pendingRef.current = false;
                        setPending(undefined);
                        setApproval(value => value + 1);
                    }}>Proceed with 3D</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    return { check3D, prepareData, getRequestedDimension, approval, warning };
}
