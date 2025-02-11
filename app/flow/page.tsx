/* eslint-disable @typescript-eslint/no-explicit-any */

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
    ReactFlowProvider,
    useReactFlow,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useSession } from 'next-auth/react';
import { cn, securedFetch } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import Button from '../components/ui/Button';
import Dropzone from '../components/ui/Dropzone';
import Input from '../components/ui/Input';

// Add these type definitions near the top of the file, after the imports
interface BaseNodeData extends Record<string, unknown> {
    isProcessing?: boolean;
    success?: boolean;
    value?: File[];
}

interface InputNodeData extends BaseNodeData {
    onChange: (id: string, acceptedFiles: File[]) => void;
}

interface OutputNodeData extends BaseNodeData {
    value: File[];
    graphName: string;
    setGraphName: (id: string, graphName: string) => void;
}

interface FilterNodeData extends BaseNodeData { }

function InputNode({ id, data }: { id: string, data: { onChange: (id: string, acceptedFiles: File[]) => void, value?: File[], isProcessing?: boolean, success?: boolean } }) {
    return (
        <div className={cn('rounded-lg flex flex-col items-start gap-2 p-4', data.isProcessing && 'animate-pulse', data.value?.length === 0 || !data.value ? 'bg-red-500' : 'bg-white')}>
            <Dropzone className='nodrag' label='Upload Files' onFileDrop={(acceptedFiles) => data.onChange(id, acceptedFiles)} />
            {data.isProcessing && <p className="text-blue-500">Processing...</p>}
            {data.success && <p className="text-green-500">Success!</p>}
            <Handle className='w-10 h-10' type="source" position={Position.Bottom} />
        </div>
    )
}

function OutputNode({ id, data }: { id: string, data: { value: File[], isProcessing?: boolean, success?: boolean, graphName: string, setGraphName: (id: string, graphName: string) => void } }) {
    return (
        <div className={`bg-white rounded-lg flex flex-col items-start gap-2 p-4 ${data.isProcessing ? 'animate-pulse' : ''}`}>
            <Handle type="target" position={Position.Top} />
            {data.isProcessing && <p className="text-blue-500">Processing...</p>}
            {data.success && <p className="text-green-500">Success!</p>}
            <p>{data.value.length > 0 ? data.value.map((file: File) => file.name).join(', ') : 'Waiting for input...'}</p>
            <Input
                className='w-full'
                placeholder='Graph Name'
                value={data.graphName}
                onChange={(e) => data.setGraphName(id, e.target.value)}
            />
        </div>
    )
}

function FilterPngNode({ data }: { data: { isProcessing?: boolean, success?: boolean, value?: File[] } }) {
    return (
        <div className={`bg-white rounded-lg flex flex-col items-start gap-2 p-4 ${data.isProcessing ? 'animate-pulse' : ''}`}>
            <Handle type="target" position={Position.Top} />
            {data.isProcessing && <p className="text-blue-500">Processing...</p>}
            {data.success && <p className="text-green-500">Success!</p>}
            <p>Filter png files</p>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

function FilterMdNode({ data }: { data: { isProcessing?: boolean, success?: boolean, value?: File[] } }) {
    return (
        <div className={`bg-white rounded-lg flex flex-col items-start gap-2 p-4 ${data.isProcessing ? 'animate-pulse' : ''}`}>
            <Handle type="target" position={Position.Top} />
            {data.isProcessing && <p className="text-blue-500">Processing...</p>}
            {data.success && <p className="text-green-500">Success!</p>}
            <p>Filter md files</p>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

const nodeTypes = {
    filterPng: FilterPngNode,
    filterMd: FilterMdNode,
    input: InputNode,
    output: OutputNode,
}

type NodeTypes = keyof typeof nodeTypes;

type FlowNode = Node<InputNodeData | OutputNodeData | FilterNodeData>;
type FlowEdge = Edge;

function NodePanel() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
    };

    const [nodes, setNodes] = useState<{ type: string }[]>([]);

    useEffect(() => {
        setNodes([
            { type: 'input' },
            { type: 'filterPng' },
            { type: 'filterMd' },
            { type: 'output' },
        ]);
    }, []);

    return (
        <div className="fixed left-0 top-0 z-10 h-full w-64 bg-white p-4 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Nodes</h3>
            <div className="flex flex-col gap-4">
                {nodes.map((node) => (
                    <div
                        key={node.type}
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
    const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
    const reactFlowInstance = useReactFlow();
    const { data: session } = useSession();
    const { toast } = useToast();

    const handleFilter = useCallback((filterPngId: string, files: File[], type: string) => {
        // Find connected output nodes
        const connectedEdges = edges.filter(edge => edge.source === filterPngId);

        setNodes(nds => nds.map(node => {
            if (connectedEdges.some(edge => edge.target === node.id) && node.type === 'output') {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        value: files.filter((file: File) => file.type.includes(type) || file.name.toLowerCase().endsWith(type))
                    }
                };
            }

            if (node.id === filterPngId) {
                return {
                    ...node,
                    data: { ...node.data, value: files }
                };
            }
            return node;
        }));
    }, [edges, setNodes]);

    const handleInputChange = useCallback((inputId: string, acceptedFiles: File[]) => {
        // Find connected output nodes
        const connectedEdges = edges.filter(edge => edge.source === inputId);

        setNodes(nds => nds.map(node => {
            // Update connected output nodes
            if (connectedEdges.some(edge => edge.target === node.id)) {
                if (node.type === 'filterPng') {
                    handleFilter(node.id, acceptedFiles, 'png');
                    return node;
                }
                if (node.type === 'filterMd') {
                    handleFilter(node.id, acceptedFiles, 'md');
                    return node;
                }
                if (node.type === 'output') {
                    return {
                        ...node,
                        data: { ...node.data, value: acceptedFiles }
                    };
                }
            }
            // Update input node with onChange handler and value
            if (node.id === inputId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        onChange: handleInputChange,
                        value: acceptedFiles
                    }
                };
            }
            return node;
        }));
    }, [edges, handleFilter, setNodes]);

    useEffect(() => {
        setNodes(prev => prev.map(node => {
            if (node.type === 'input') {
                return {
                    ...node,
                    data: { ...node.data, onChange: handleInputChange }
                };
            }
            return node;
        }));
    }, [handleInputChange, setNodes]);

    // Add function to load a flow
    const loadFlow = useCallback(async () => {
        try {
            // Query to get all nodes
            const nodesQuery = `
                MATCH (n)
                RETURN n
            `;

            const nodesResponse = await securedFetch(
                `/api/graph/flows?query=${encodeURIComponent(nodesQuery)}`,
                { method: 'GET' },
                session?.user?.role,
                toast
            );

            if (!nodesResponse.ok) throw new Error('Failed to load nodes');
            const nodesData = (await nodesResponse.json()).result.data;

            // Transform nodes data with proper typing
            const loadedNodes = nodesData.map((record: any) => {
                const nodeType = record.n.properties.type as NodeTypes;
                const baseData = JSON.parse(record.n.properties.data);

                let typedData: InputNodeData | OutputNodeData | FilterNodeData = {
                    isProcessing: false,
                    success: false
                }

                switch (nodeType) {
                    case 'input':
                        typedData = {
                            ...baseData,
                            ...typedData,
                            onChange: handleInputChange,
                            value: baseData.value || [],
                        };
                        break;
                    case 'output':
                    case 'filterPng':
                    case 'filterMd':
                        typedData = {
                            ...baseData,
                            ...typedData,
                            value: baseData.value || []
                        };
                        break;
                    default:
                        typedData = baseData;
                }

                return {
                    id: record.n.properties.id,
                    type: nodeType,
                    position: {
                        x: record.n.properties.positionX,
                        y: record.n.properties.positionY
                    },
                    data: typedData
                };
            });

            // Query to get all relationships
            const edgesQuery = `
                MATCH (source)-[r:FLOWS_TO]->(target)
                RETURN source.id as sourceId, target.id as targetId, ID(r) as edgeId
            `;

            const edgesResponse = await securedFetch(
                `/api/graph/flows?query=${encodeURIComponent(edgesQuery)}`,
                { method: 'GET' },
                session?.user?.role,
                toast
            );

            const edgesResult = await edgesResponse.json();

            // Transform edges data
            const loadedEdges = edgesResult.result.data.map((record: any) => ({
                id: record.edgeId,
                source: record.sourceId,
                target: record.targetId,
                type: 'default',
                animated: false
            }));

            setNodes(loadedNodes);
            setEdges(loadedEdges);
        } catch (error) {
            console.error('Error loading flow:', error);
            toast({
                title: 'Error',
                description: 'Failed to load flow',
            });
        }
    }, [session?.user?.role, toast, setNodes, setEdges, handleInputChange]);

    useEffect(() => {
        loadFlow();
    }, []);

    const onConnect = useCallback((params: Connection) => {
        const source = nodes.find(node => node.id === params.source);
        const target = nodes.find(node => node.id === params.target);

        if (((source?.type === "input" || source?.type === "filterPng" || source?.type === "filterMd") && target?.type === "output") || (source?.type === "input" && (target?.type === "filterPng" || target?.type === "filterMd"))) {
            // Get the input node's data value if it exists
            const inputNode = nodes.find(node => node.id === source.id);
            const inputValue = inputNode?.data?.value || [];

            // Filter value based on target type
            let filteredValue = inputValue;
            if (target?.type === 'filterPng') {
                filteredValue = inputValue.filter((file: File) => file.type.includes('png') || file.name.toLowerCase().endsWith('png'));
            } else if (target?.type === 'filterMd') {
                filteredValue = inputValue.filter((file: File) => file.type.includes('md') || file.name.toLowerCase().endsWith('md'));
            }

            // Update the target node with the filtered value
            setNodes(nds => nds.map(node => {
                if (node.id === target.id) {
                    return {
                        ...node,
                        data: { ...node.data, value: filteredValue }
                    };
                }
                return node;
            }));
        }

        setEdges((eds) => addEdge(params, eds));
    }, [nodes, setEdges, setNodes]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
    }, []);

    const getNodeData = useCallback((type: NodeTypes): InputNodeData | OutputNodeData | FilterNodeData => {
        switch (type) {
            case 'input':
                return {
                    onChange: handleInputChange,
                    value: []
                };
            case 'output':
                return {
                    graphName: '',
                    setGraphName: (id: string, graphName: string) => setNodes(nds => nds.map(node => {
                        if (node.id === id) {
                            return { ...node, data: { ...node.data, graphName } };
                        }
                        return node;
                    })),
                    value: [],
                    isProcessing: false,
                    success: false
                };
            case 'filterPng':
            case 'filterMd':
                return {
                    value: []
                };
            default:
                return {};
        }
    }, [handleInputChange, setNodes]);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();

        const reactFlowBounds = (event.target as Element)
            .closest('.react-flow')
            ?.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow') as NodeTypes;

        if (!type || !reactFlowBounds) return;

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        const newNode: FlowNode = {
            id: `${type}_${Date.now()}`,
            type,
            position,
            data: getNodeData(type),
        };

        setNodes((nds) => [...nds, newNode]);
    }, [reactFlowInstance, getNodeData, setNodes]);

    const findConnectedNodes = useCallback((startNodeId: string, visited = new Set<string>()): string[] => {
        if (visited.has(startNodeId)) return [];
        visited.add(startNodeId);

        const connectedIds = edges
            .filter(edge => edge.source === startNodeId || edge.target === startNodeId)
            .map(edge => edge.source === startNodeId ? edge.target : edge.source);

        return [startNodeId, ...connectedIds.flatMap(id => findConnectedNodes(id, visited))];
    }, [edges]);

    // Add function to save the flow
    const saveFlow = useCallback(async () => {
        if (nodes.length === 0) return;

        try {
            // Delete all existing nodes and relationships
            const deleteQuery = `
                MATCH (n)
                DETACH DELETE n
            `;

            await securedFetch(
                `/api/graph/flows?query=${encodeURIComponent(deleteQuery)}`,
                { method: 'GET' },
                session?.user?.role,
                toast
            );

            // Create nodes with sanitized data
            const createNodesQuery = `
                ${nodes.map(node => {
                // Create a sanitized copy of the node data
                const sanitizedData = {
                    ...node.data,
                    // Remove the onChange function as it can't be serialized
                    onChange: undefined,
                    // Ensure value is an array of file names instead of File objects
                    value: node.data.value ? (node.data.value as File[]).map(file => ({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        lastModified: file.lastModified
                    })) : []
                };

                return `
                        CREATE (:${node.type} {
                            id: '${node.id}',
                            type: '${node.type}',
                            positionX: ${node.position.x},
                            positionY: ${node.position.y},
                            data: '${JSON.stringify(sanitizedData).replace(/'/g, "\\'")}'
                        })`;
            }).join('\n')}
            `;

            // Execute create nodes query
            await securedFetch(
                `/api/graph/flows?query=${encodeURIComponent(createNodesQuery)}`,
                { method: 'GET' },
                session?.user?.role,
                toast
            );

            // Create relationships if there are any edges
            if (edges.length > 0) {
                const edgeQueries = edges.map(edge => `
                    MATCH (source {id: '${edge.source}'})
                    MATCH (target {id: '${edge.target}'})
                    CREATE (source)-[:FLOWS_TO]->(target)
                `);

                // Execute all edge creation queries in parallel
                await Promise.all(
                    edgeQueries.map(async (edgeQuery) => {
                        const response = await securedFetch(
                            `/api/graph/flows?query=${encodeURIComponent(edgeQuery)}`,
                            { method: 'GET' },
                            session?.user?.role,
                            toast
                        );
                        return response.json();
                    })
                );
            }

            toast({
                title: 'Flow saved successfully!',
                description: 'Graph has been updated',
            });
        } catch (error) {
            console.error('Error saving flow:', error);
            toast({
                title: 'Error',
                description: 'Failed to save flow',
            });
        }
    }, [nodes, session?.user?.role, toast, edges]);


    const processNodes = useCallback(async () => {
        saveFlow();

        // Find all input nodes first
        const inputNodes = nodes.filter(node => node.type === 'input');
        const processedNodes = new Set<string>();
        // Process input nodes sequentially
        await inputNodes.reduce(async (promise, inputNode) => {
            await promise;

            // Process input node
            setNodes(nds => nds.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    isProcessing: node.id === inputNode.id,
                    success: false
                }
            })));

            await new Promise(resolve => { setTimeout(resolve, 5000) });
            processedNodes.add(inputNode.id);

            // Find all paths from this input node
            const paths: FlowNode[][] = [];
            const findPaths = (currentNode: FlowNode, currentPath: FlowNode[] = []) => {
                const newPath = [...currentPath, currentNode];

                if (currentNode.type === 'output') {
                    paths.push(newPath);
                    return;
                }

                const connectedNodeIds = edges
                    .filter(edge => edge.source === currentNode.id)
                    .map(edge => edge.target);

                connectedNodeIds.forEach(nodeId => {
                    const nextNode = nodes.find(n => n.id === nodeId);
                    if (nextNode && !currentPath.includes(nextNode)) {
                        findPaths(nextNode, newPath);
                    }
                });
            };

            // Start finding paths from nodes connected to input
            const initialNodes = edges
                .filter(edge => edge.source === inputNode.id)
                .map(edge => nodes.find(n => n.id === edge.target))
                .filter((n): n is FlowNode => n !== undefined);

            // Find paths starting from each node connected to input
            initialNodes.forEach(node => {
                findPaths(node, []);
            });

            // Process paths sequentially
            await paths.reduce(async (pathPromise, path) => {
                await pathPromise;

                // Process nodes in path sequentially 
                await path.reduce(async (nodePromise, currentNode) => {
                    await nodePromise;

                    if (processedNodes.has(currentNode.id)) {
                        return;
                    }

                    setNodes(nds => nds.map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            isProcessing: node.id === currentNode.id,
                            success: node.data.success && node.id !== currentNode.id
                        }
                    })));

                    // Animate edges connected to this node
                    setEdges(eds => eds.map(edge => ({
                        ...edge,
                        animated: edge.source === currentNode.id &&
                            path.some(n => n.id === edge.target)
                    })));

                    await new Promise(resolve => { setTimeout(resolve, 5000) });
                    processedNodes.add(currentNode.id);

                    setNodes(nds => nds.map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            isProcessing: false,
                            success: (node.data.success && node.id !== currentNode.id) ||
                                (node.id === currentNode.id && currentNode.type === 'output')
                        }
                    })));

                    if (currentNode.type === 'output') {
                        console.log("Graph:", currentNode.data.graphName, currentNode.data.value);

                        setTimeout(() => {
                            setNodes(nds => nds.map(node => ({
                                ...node,
                                data: {
                                    ...node.data,
                                    success: node.id !== currentNode.id ? node.data.success : false
                                }
                            })));
                        }, 3000);
                    }
                }, Promise.resolve());
            }, Promise.resolve());

            // Reset edge animations
            setEdges(eds => eds.map(edge => ({
                ...edge,
                animated: false
            })));
        }, Promise.resolve());
    }, [saveFlow, nodes, edges, setNodes, setEdges]);

    const removeFlow = useCallback(async () => {
        const deleteQuery = `
            MATCH (n) OPTIONAL MATCH (n)-[r]-()
            DETACH DELETE n, r
        `;

        await securedFetch(
            `/api/graph/flows?query=${encodeURIComponent(deleteQuery)}`,
            { method: 'GET' },
            session?.user?.role,
            toast
        );

        toast({
            title: 'Flow removed successfully!',
            description: 'Graph has been deleted',
        });

        setNodes([]);
        setEdges([]);
    }, [session?.user?.role, toast, setNodes, setEdges]);

    return (
        <>
            <NodePanel />
            <div className="flex gap-4 fixed left-72 bottom-0 z-10 p-4 rounded-t-lg shadow-lg bg-white items-center">
                <Controls className='!relative border border-black rounded-lg' />
                <div className="flex flex-col gap-4">
                    <Button
                        disabled={
                            nodes.some(node => node.type === 'input' && (node.data as { value?: File[] }).value?.length === 0)
                            || !nodes.every(node => edges.some(edge => edge.source === node.id || edge.target === node.id))
                            || nodes.length === 0
                        }
                        variant='Primary'
                        onClick={processNodes}
                    >
                        Run Flow
                    </Button>
                    <Button
                        disabled={nodes.length === 0}
                        variant='Primary'
                        onClick={removeFlow}
                    >
                        Remove Flow
                    </Button>
                </div>
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
                selectionKeyCode={null}
                defaultEdgeOptions={{ animated: false }}
                selectNodesOnDrag
                deleteKeyCode={['Delete']}
            >
                {/* eslint-disable-next-line react/no-unknown-property */}
                <style jsx global>
                    {
                        '.react-flow__node { padding: 0 !important; border-radius: 0.6rem !important; }'
                    }
                </style>
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