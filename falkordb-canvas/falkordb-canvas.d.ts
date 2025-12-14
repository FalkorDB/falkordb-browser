import { ForceGraphConfig, Data, ForceGraphInstance } from './falkordb-canvas-types';

declare class FalkorDBForceGraph extends HTMLElement {
  setConfig(config: Partial<ForceGraphConfig>): void;
  getData(): Data;
  setData(data: Data): void;
  getGraph(): ForceGraphInstance | undefined;
}

export default FalkorDBForceGraph;

// Extend JSX IntrinsicElements for React TypeScript support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'falkordb-canvas': React.DetailedHTMLProps<
        React.HTMLAttributes<FalkorDBForceGraph>,
        FalkorDBForceGraph
      >;
    }
  }
}

