import type { Data, FalkorDBCanvas } from "@falkordb/canvas";
import type { GPUCapabilities } from "./gpuCapabilities";

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

type DataCanvas = Pick<FalkorDBCanvas, "setGraphData">;
const checks = new WeakMap<DataCanvas, (size: GraphSize) => boolean>();

export function register3DCheck(canvas: DataCanvas, check: (size: GraphSize) => boolean): () => void {
    checks.set(canvas, check);
    return () => { if (checks.get(canvas) === check) checks.delete(canvas); };
}

/** Mutations must use the same pre-render check as query results and restores. */
export function setCanvasGraphData(canvas: DataCanvas, data: Data): void {
    checks.get(canvas)?.({ nodes: data.nodes.length, links: data.links.length });
    canvas.setGraphData(data);
}
