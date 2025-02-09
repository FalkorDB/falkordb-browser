"use client"

import React, { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useEdgesState,
    useNodesState,
    addEdge,
    Connection,
    Node,
    Edge,
    Handle,
    Position,
    SelectionMode,
    ReactFlowProvider,
    useReactFlow,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function InputNode({ id, data }: { id: string, data: { onChange: (id: string, value: string) => void, isProcessing?: boolean, success?: boolean } }) {
    return (
        <div className={`flex flex-col items-start gap-2 p-4 ${data.isProcessing ? 'animate-pulse' : ''}`}>
            <Input
                className="w-full"
                type='text'
                placeholder='Input'
                onChange={(e) => data.onChange(id, e.target.value)}
            />
            {data.isProcessing && <p className="text-blue-500">Processing...</p>}
            {data.success && <p className="text-green-500">Success!</p>}
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

function OutputNode({ data }: { data: { output: string, isProcessing?: boolean, success?: boolean } }) {
    return (
        <div className={`flex flex-col items-start gap-2 p-4 ${data.isProcessing ? 'animate-pulse' : ''}`}>
            <Handle type="target" position={Position.Top} />
            {data.isProcessing && <p className="text-blue-500">Processing...</p>}
            {data.success && <p className="text-green-500">Success!</p>}
            <p>{data.output || 'Waiting for input...'}</p>
        </div>
    )
}

function DefaultNode({ data }: { data: { label: string, isProcessing?: boolean, success?: boolean } }) {
    return (
        <div className={`flex flex-col items-start gap-2 p-4 ${data.isProcessing ? 'animate-pulse' : ''}`}>
            <Handle type="target" position={Position.Top} />
            {data.isProcessing && <p className="text-blue-500">Processing...</p>}
            {data.success && <p className="text-green-500">Success!</p>}
            <p>{data.label}</p>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

const nodeTypes = {
    default: DefaultNode,
    input: InputNode,
    output: OutputNode,
}

function NodePanel() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
    };

    const [nodes, setNodes] = useState<Node[]>([]);

    useEffect(() => {
        setNodes([
            { id: '1', type: 'input', position: { x: 0, y: 0 }, data: { onChange: () => { } } },
            { id: '2', type: 'output', position: { x: 0, y: 0 }, data: { output: '' } },
            { id: '3', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Default' } },
        ]);
    }, []);

    return (
        <div className="fixed left-0 top-0 z-10 h-full w-64 bg-white p-4 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Nodes</h3>
            <div className="flex flex-col gap-4">
                {nodes.map((node) => (
                    <div
                        key={node.id}
                        className="rounded border border-gray-200 p-3 cursor-move hover:bg-gray-50"
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type || 'default')}
                    >
                        {node.type} Node
                    </div>
                ))}
            </div>
        </div>
    );
}

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const reactFlowInstance = useReactFlow();


    const onConnect = useCallback((params: Connection) =>
        setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const handleInputChange = useCallback((inputId: string, value: string) => {
        // Find connected output nodes
        const connectedEdges = edges.filter(edge => edge.source === inputId);

        setNodes(nds => nds.map(node => {
            // Update connected output nodes
            if (connectedEdges.some(edge => edge.target === node.id)) {
                return {
                    ...node,
                    data: { ...node.data, output: value }
                };
            }
            // Update input node with onChange handler
            if (node.id === inputId) {
                return {
                    ...node,
                    data: { ...node.data, onChange: handleInputChange }
                };
            }
            return node;
        }));
    }, [edges, setNodes]);

    useEffect(() => {
        setNodes(nodes.map(node => {
            if (node.type === 'input') {
                return {
                    ...node,
                    data: { ...node.data, onChange: handleInputChange }
                };
            }
            return node;
        }));
    }, [handleInputChange]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
    }, []);

    const getNodeData = (type: string) => {
        switch (type) {
            case 'input':
                return {
                    onChange: handleInputChange
                };
            case 'output':
                return {
                    output: ''
                };
            default:
                return {
                    label: type
                };
        }
    };

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const reactFlowBounds = (event.target as Element)
                .closest('.react-flow')
                ?.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow');

            if (!type || !reactFlowBounds) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode = {
                id: `${type}_${Date.now()}`,
                type,
                position,
                data: getNodeData(type),
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [setNodes, reactFlowInstance]
    );

    const findConnectedNodes = (startNodeId: string, visited = new Set<string>()): string[] => {
        if (visited.has(startNodeId)) return [];
        visited.add(startNodeId);

        const connectedIds = edges
            .filter(edge => edge.source === startNodeId || edge.target === startNodeId)
            .map(edge => edge.source === startNodeId ? edge.target : edge.source);

        return [startNodeId, ...connectedIds.flatMap(id => findConnectedNodes(id, visited))];
    };

    const sortNodesByConnections = (nodeIds: string[]): Node[] => {
        const groupNodes = nodes.filter(node => nodeIds.includes(node.id));
        const sorted: Node[] = [];
        const visited = new Set<string>();

        // Find root nodes (nodes with no incoming edges within the group)
        const getRootNodes = () => groupNodes.filter(node => !edges.some(edge =>
            edge.target === node.id && nodeIds.includes(edge.source)
        ));

        // Recursive function to add nodes in correct order
        const addNodesInOrder = (currentNode: Node) => {
            if (visited.has(currentNode.id)) return;
            visited.add(currentNode.id);
            sorted.push(currentNode);

            // Find and sort children
            const children = edges
                .filter(edge => edge.source === currentNode.id && nodeIds.includes(edge.target))
                .map(edge => groupNodes.find(node => node.id === edge.target)!)
                .filter(Boolean);

            children.forEach(child => addNodesInOrder(child));
        };

        // Start with root nodes
        const rootNodes = getRootNodes();
        rootNodes.forEach(node => addNodesInOrder(node));

        // Add any remaining nodes (in case of cycles or disconnected nodes within group)
        groupNodes.forEach(node => {
            if (!visited.has(node.id)) {
                addNodesInOrder(node);
            }
        });

        return sorted;
    };

    const processNodes = useCallback(async () => {

        // Group nodes by their connections
        const nodeGroups: string[][] = [];
        const processedNodes = new Set<string>();

        nodes.forEach(node => {
            if (!processedNodes.has(node.id)) {
                const connectedNodes = findConnectedNodes(node.id);
                nodeGroups.push(connectedNodes);
                connectedNodes.forEach(id => processedNodes.add(id));
            }
        });
        // Process each group one after another
        nodeGroups.reduce(async (promise, group) => {
            await promise;
            const groupNodes = sortNodesByConnections(group);
            const lastNodeInGroup = groupNodes[groupNodes.length - 1];

            // Process nodes in group sequentially
            await groupNodes.reduce(async (nodePromise, currentNode) => {
                await nodePromise;

                // Update current node to processing state
                setNodes(nds => nds.map(node => ({
                    ...node,
                    data: {
                        ...node.data,
                        isProcessing: node.id === currentNode.id,
                        // Maintain existing success states for other groups
                        success: node.data.success && node.id !== currentNode.id
                    }
                })));

                // Animate edges connected to this node
                setEdges(eds => eds.map(edge => ({
                    ...edge,
                    animated: edge.source === currentNode.id && group.includes(edge.target)
                })));

                // Wait for 5 seconds
                await new Promise((resolve) => {
                    setTimeout(resolve, 5000);
                });

                // Update processing state
                setNodes(nds => nds.map(node => ({
                    ...node,
                    data: {
                        ...node.data,
                        isProcessing: false,
                        // Maintain existing success states and set new one if it's the last node
                        success: (node.data.success && node.id !== currentNode.id) ||
                            (node.id === lastNodeInGroup.id && currentNode.id === lastNodeInGroup.id)
                    }
                })));
            }, Promise.resolve());

            // Reset edge animations after group is done
            setEdges(eds => eds.map(edge => ({
                ...edge,
                animated: false
            })));
        }, Promise.resolve());
    }, [nodes, edges, setNodes, setEdges]);

    return (
        <>
            <NodePanel />
            <div className="flex gap-20 fixed left-64 bottom-0 z-10 p-4">
                <Controls className='!relative bg-white' />
                <Button
                    className='text-white'
                    variant='Primary'
                    onClick={processNodes}
                >
                    Run Flow
                </Button>
            </div>
            <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                defaultEdgeOptions={{ animated: false }}
                selectionMode={SelectionMode.Full}
                selectNodesOnDrag
                multiSelectionKeyCode={['Control']}
                deleteKeyCode={['Delete']}
            >
                <MiniMap />
                <Background />
            </ReactFlow>
        </>
    );
}

export default function Page() {
    return (
        <div className='Page text-black'>
            <ReactFlowProvider>
                <Flow />
            </ReactFlowProvider>
        </div>
    )
}