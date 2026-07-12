import type FalkorDBCanvas from "@falkordb/canvas";
import type { CanvasRenderMode } from "@falkordb/canvas";

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "falkordb-canvas": React.DetailedHTMLProps<
                React.HTMLAttributes<FalkorDBCanvas> & {
                    "node-mode"?: CanvasRenderMode;
                    "link-mode"?: CanvasRenderMode;
                },
                FalkorDBCanvas
            >;
        }
    }
}
