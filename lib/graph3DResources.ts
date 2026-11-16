import type { CanvasDimension, Data, FalkorDBCanvas } from "@falkordb/canvas";
import type { GPUCapabilities } from "./gpuCapabilities.ts";

export interface GraphSize {
    nodes: number
    links: number
}

export interface DeviceResources {
    deviceMemory?: number
    hardwareConcurrency?: number
    gpu?: GPUCapabilities
}

function getCPUMemoryBudget(resources: DeviceResources): GraphSize {
    const hints = [resources.deviceMemory, resources.hardwareConcurrency]
        .filter((value): value is number => value !== undefined && Number.isFinite(value) && value > 0);
    if (hints.some(value => value <= 2)) return { nodes: 500, links: 1000 };
    if (hints.some(value => value <= 4)) return { nodes: 1000, links: 2500 };
    if (hints.length === 2 && hints.every(value => value >= 8)) return { nodes: 4000, links: 10000 };
    return { nodes: 2000, links: 5000 };
}

/** Graphics limits only lower budgets; they do not measure speed or free VRAM. */
export function getGPUBudget(gpu: GPUCapabilities): GraphSize {
    if (gpu.webgl2 === "unavailable") return { nodes: 0, links: 0 };
    if (gpu.softwareRendering) return { nodes: 500, links: 1000 };
    const limits = [gpu.maxTextureSize, gpu.maxRenderbufferSize]
        .filter((value): value is number => value !== undefined && Number.isFinite(value) && value > 0);
    if (limits.some(value => value <= 4096)) return { nodes: 500, links: 1000 };
    if (limits.some(value => value <= 8192)) return { nodes: 1000, links: 2500 };
    if (gpu.webgl2 === "unknown" || limits.length < 2) return { nodes: 2000, links: 5000 };
    return { nodes: 4000, links: 10000 };
}

/** Advisory budgets, not estimates of available RAM or GPU memory. */
export function get3DBudget(resources: DeviceResources): GraphSize {
    const budget = getCPUMemoryBudget(resources);
    if (!resources.gpu) return budget;
    const gpuBudget = getGPUBudget(resources.gpu);
    return { nodes: Math.min(budget.nodes, gpuBudget.nodes), links: Math.min(budget.links, gpuBudget.links) };
}

export function exceeds3DBudget(size: GraphSize, budget: GraphSize): boolean {
    return size.nodes > budget.nodes || size.links > budget.links;
}

export function needs3DWarning(size: GraphSize, resources: DeviceResources, approved?: GraphSize): boolean {
    return exceeds3DBudget(size, get3DBudget(resources))
        && (!approved || exceeds3DBudget(size, approved));
}

export function readDeviceResources(nav: { deviceMemory?: unknown, hardwareConcurrency?: number }, gpu: GPUCapabilities): DeviceResources {
    return {
        deviceMemory: typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined,
        hardwareConcurrency: nav.hardwareConcurrency,
        gpu,
    };
}

/** A pending warning whose graph fits again leaves 3D: the canvas already fell back to 2D unapproved. */
export function decide3DCheck(size: GraphSize, resources: DeviceResources, approved: GraphSize | undefined, warningPending: boolean): "warn" | "allow" | "revertTo2D" {
    if (needs3DWarning(size, resources, approved)) return "warn";
    return warningPending ? "revertTo2D" : "allow";
}

/** How a data write waits for a safe renderer once the 3D check has run. */
export function prepare3DStep(dimension: CanvasDimension, fallbackPending: boolean, fallbackFailed: boolean): "ensure2D" | "awaitFallback" | "useCheck" {
    if (dimension === "2d") return "ensure2D";
    if (fallbackPending) return "awaitFallback";
    return fallbackFailed ? "ensure2D" : "useCheck";
}

type DataCanvas = Pick<FalkorDBCanvas, "setGraphData">;
type DataCheck = (size: GraphSize) => boolean | Promise<boolean>;
const checks = new WeakMap<DataCanvas, DataCheck>();
const writes = new WeakMap<DataCanvas, object>();

export function register3DCheck(canvas: DataCanvas, check: DataCheck): () => void {
    checks.set(canvas, check);
    return () => {
        if (checks.get(canvas) !== check) return;
        checks.delete(canvas);
        writes.delete(canvas);
    };
}

/** Wait for a safe renderer and discard superseded or unmounted data writes. */
export async function writeCanvasData(canvas: DataCanvas, data: Data, write: () => void, isCurrent = () => true): Promise<boolean> {
    if (!isCurrent()) return false;
    const token = {};
    writes.set(canvas, token);
    const check = checks.get(canvas);
    if (check && !await check({ nodes: data.nodes.length, links: data.links.length })) return false;
    if (writes.get(canvas) !== token || checks.get(canvas) !== check || !isCurrent()) return false;
    write();
    return true;
}

/** Mutations use the same awaited pre-render guard as queries and restores. */
export function setCanvasGraphData(canvas: DataCanvas, data: Data, isCurrent?: () => boolean): Promise<boolean> {
    return writeCanvasData(canvas, data, () => canvas.setGraphData(data), isCurrent);
}
