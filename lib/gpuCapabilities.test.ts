import test from "node:test";
import assert from "node:assert/strict";
import { getGPUCapabilities, readGPUCapabilities } from "./gpuCapabilities.ts";

function probe({ renderer, texture = 16384, renderbuffer = 16384, fail = false }: {
    renderer?: string
    texture?: number
    renderbuffer?: number
    fail?: boolean
} = {}) {
    let released = 0;
    const calls: string[] = [];
    const canvas = {
        getContext: (name: string, attributes: WebGLContextAttributes) => {
            assert.equal(name, "webgl2");
            assert.equal(attributes.antialias, false);
            calls.push("context");
            return {
                MAX_TEXTURE_SIZE: 1,
                MAX_RENDERBUFFER_SIZE: 2,
                getParameter: (parameter: number) => {
                    if (fail) throw new Error("Restricted capability access");
                    return parameter === 1 ? texture : parameter === 2 ? renderbuffer : renderer;
                },
                getExtension: (name: string) => {
                    if (name === "WEBGL_lose_context") return { loseContext: () => { released += 1; } };
                    return renderer === undefined ? null : { UNMASKED_RENDERER_WEBGL: 3 };
                },
            };
        },
    } as unknown as Pick<HTMLCanvasElement, "getContext">;
    return { canvas, calls, released: () => released };
}

test("reads WebGL2 limits and releases the temporary context", () => {
    const stub = probe({ renderer: "ANGLE (Intel, integrated graphics)" });
    assert.deepEqual(readGPUCapabilities(stub.canvas), {
        webgl2: "available", maxTextureSize: 16384, maxRenderbufferSize: 16384, softwareRendering: false,
    });
    assert.equal(stub.released(), 1);
});

test("detects known software renderers without retaining identification strings", () => {
    for (const renderer of ["ANGLE (Google, Vulkan SwiftShader Device)", "llvmpipe", "softpipe", "Microsoft Basic Render Driver"]) {
        const stub = probe({ renderer });
        const result = readGPUCapabilities(stub.canvas);
        assert.equal(result.softwareRendering, true);
        assert.equal(JSON.stringify(result).includes(renderer), false);
        assert.equal(stub.released(), 1);
    }
});

test("hidden renderer information and invalid limits remain unknown", () => {
    const stub = probe({ texture: NaN, renderbuffer: 0 });
    assert.deepEqual(readGPUCapabilities(stub.canvas), {
        webgl2: "available", maxTextureSize: undefined, maxRenderbufferSize: undefined, softwareRendering: undefined,
    });
    assert.equal(stub.released(), 1);
});

test("missing WebGL2 is explicit and does not fall back to WebGL1", () => {
    const canvas = { getContext: (name: string) => {
        assert.equal(name, "webgl2");
        return null;
    } };
    assert.deepEqual(readGPUCapabilities(canvas), { webgl2: "unavailable" });
});

test("restricted capability access logs uncertainty and still releases the context", (t) => {
    const warn = t.mock.method(console, "warn", () => {});
    const stub = probe({ fail: true });
    assert.deepEqual(readGPUCapabilities(stub.canvas), { webgl2: "unknown" });
    assert.equal(warn.mock.callCount(), 1);
    assert.equal(stub.released(), 1);
});

test("GPU capabilities are checked only once across callers", (t) => {
    const stub = probe();
    const original = Object.getOwnPropertyDescriptor(globalThis, "document");
    Object.defineProperty(globalThis, "document", {
        configurable: true, value: { createElement: () => stub.canvas },
    });
    t.after(() => {
        if (original) Object.defineProperty(globalThis, "document", original);
        else Reflect.deleteProperty(globalThis, "document");
    });
    const first = getGPUCapabilities();
    assert.equal(getGPUCapabilities(), first);
    assert.deepEqual(stub.calls, ["context"]);
    assert.equal(stub.released(), 1);
});
