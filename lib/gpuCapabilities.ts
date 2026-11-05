export interface GPUCapabilities {
    webgl2: "available" | "unavailable" | "unknown"
    maxTextureSize?: number
    maxRenderbufferSize?: number
    softwareRendering?: boolean
}

let cached: GPUCapabilities | undefined;

/** Read capabilities once, without drawing or retaining GPU identification strings. */
export function readGPUCapabilities(canvas: Pick<HTMLCanvasElement, "getContext">): GPUCapabilities {
    let gl: WebGL2RenderingContext | null = null;
    try {
        gl = canvas.getContext("webgl2", { antialias: false, depth: false, stencil: false });
        if (!gl) return { webgl2: "unavailable" };
        const context = gl;

        const positiveLimit = (parameter: number): number | undefined => {
            const value: unknown = context.getParameter(parameter);
            return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
        };
        const debug = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer: unknown = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : undefined;
        return {
            webgl2: "available",
            maxTextureSize: positiveLimit(gl.MAX_TEXTURE_SIZE),
            maxRenderbufferSize: positiveLimit(gl.MAX_RENDERBUFFER_SIZE),
            softwareRendering: typeof renderer === "string"
                ? /swiftshader|llvmpipe|softpipe|software rasterizer|software renderer|microsoft basic render driver/i.test(renderer)
                : undefined,
        };
    } catch (error) {
        console.warn("Could not check WebGL2 capabilities; using conservative 3D budgets.", error);
        return { webgl2: "unknown" };
    } finally {
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
    }
}

export function getGPUCapabilities(): GPUCapabilities {
    if (!cached) cached = readGPUCapabilities(document.createElement("canvas"));
    return cached;
}
