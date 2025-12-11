import { ForceGraphConfig, GraphData } from './falkordb-canvas-types';

declare class FalkorDBForceGraph extends HTMLElement {
  setConfig(config: Partial<ForceGraphConfig>): void;
  getData(): GraphData;
  setData(data: GraphData): void;
  getGraph(): any;
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

