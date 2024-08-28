import { forwardRef } from 'react';
import ForceGraph3D, { ForceGraphMethods, LinkObject, NodeObject } from 'react-force-graph-3d';
import { Edge, Node } from '../api/graph/model';

export default forwardRef<ForceGraphMethods<NodeObject<Node>, LinkObject<Node, Edge>>>((props, ref) => (
    <ForceGraph3D {...props} ref={ref as React.MutableRefObject<ForceGraphMethods<NodeObject<Node>, LinkObject<Node, Edge>> | undefined>} />
));