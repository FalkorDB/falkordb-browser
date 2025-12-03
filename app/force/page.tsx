/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { GraphData, Node } from '../api/graph/model';

export default function ForcePage() {
    const [graphData, setGraphData] = useState<GraphData>({
        nodes: [],
        links: []
    });
    const [theme, setTheme] = useState<string>('system');
    const graphElementRef = useRef<HTMLElement | null>(null);

    const nodes: Node[] = useMemo(() => [
        { id: 1, labels: ['Person'], color: 'hsl(246, 100%, 70%)', visible: true, expand: false, collapsed: false, displayName: ['', ''], data: { name: 'Alice', age: 30 } },
        { id: 2, labels: ['Person'], color: 'hsl(330, 100%, 70%)', visible: true, expand: false, collapsed: false, displayName: ['', ''], data: { name: 'Bob', age: 25 } },
        { id: 3, labels: ['Person'], color: 'hsl(20, 100%, 65%)', visible: true, expand: false, collapsed: false, displayName: ['', ''], data: { name: 'Charlie', age: 35 } },
        { id: 4, labels: ['Person'], color: 'hsl(180, 66%, 70%)', visible: true, expand: false, collapsed: false, displayName: ['', ''], data: { name: 'Diana', age: 28 } }
    ], []);

    // Sample data for demonstration
    const sampleData: GraphData = useMemo(() => ({
        nodes,
        links: [
            { id: 1, relationship: 'KNOWS', color: '#999', source: 1, target: 2, visible: true, expand: false, collapsed: false, curve: 0, data: { since: 2015 } },
            { id: 2, relationship: 'KNOWS', color: '#999', source: 1, target: 3, visible: true, expand: false, collapsed: false, curve: 0, data: { since: 2018 } },
            { id: 3, relationship: 'KNOWS', color: '#999', source: 2, target: 4, visible: true, expand: false, collapsed: false, curve: 0, data: { since: 2020 } },
            { id: 4, relationship: 'KNOWS', color: '#999', source: 3, target: 4, visible: true, expand: false, collapsed: false, curve: 0, data: { since: 2017 } },
            { id: 5, relationship: 'WORKS_WITH', color: '#999', source: 1, target: 4, visible: true, expand: false, collapsed: false, curve: 0, data: {} }
        ]
    }), [nodes]);

    useEffect(() => {
        // Dynamically import the custom element only on client side
        if (typeof window !== 'undefined') {
            import('../components/force-graph-element');
        }

        // Set sample data on mount
        setGraphData(sampleData);

        // Set up event listeners for the custom element
        const element = graphElementRef.current;
        if (element) {
            const handleNodeClick = (e: Event) => {
                const customEvent = e as CustomEvent;
                console.log('Node clicked:', customEvent.detail);
            };

            const handleNodeHover = (e: Event) => {
                const customEvent = e as CustomEvent;
                // Handle node hover if needed
                console.log('Node hover:', customEvent.detail);
            };

            const handleLinkClick = (e: Event) => {
                const customEvent = e as CustomEvent;
                // eslint-disable-next-line no-console
                console.log('Link clicked:', customEvent.detail);
            };

            element.addEventListener('nodeclick', handleNodeClick);
            element.addEventListener('nodehover', handleNodeHover);
            element.addEventListener('linkclick', handleLinkClick);

            return () => {
                element.removeEventListener('nodeclick', handleNodeClick);
                element.removeEventListener('nodehover', handleNodeHover);
                element.removeEventListener('linkclick', handleLinkClick);
            };
        }

        return () => { };
    }, [sampleData]);

    useEffect(() => {
        // Update the custom element when graphData changes
        if (graphElementRef.current) {
            const element = graphElementRef.current as any;
            if (element.graphDataProp !== undefined) {
                element.graphDataProp = graphData;
            } else {
                // Fallback to attribute if property doesn't exist yet
                graphElementRef.current.setAttribute('data', JSON.stringify(graphData));
            }
        }
    }, [graphData]);

    useEffect(() => {
        // Update the custom element when theme changes
        if (graphElementRef.current) {
            const element = graphElementRef.current as any;
            if (element.themeProp !== undefined) {
                element.themeProp = theme;
            } else {
                // Fallback to attribute if property doesn't exist yet
                graphElementRef.current.setAttribute('theme', theme);
            }
        }
    }, [theme]);

    if (typeof window === 'undefined') return null

    const handleLoadSample = () => {
        setGraphData(sampleData);
    };

    const handleClear = () => {
        setGraphData({ nodes: [], links: [] });
    };

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
    };

    return (
        <div className="h-full w-full flex flex-col">
            <div className="p-4 border-b border-border bg-background">
                <h1 className="text-2xl font-bold mb-4">Force Graph Custom Element Demo</h1>
                <div className="flex gap-4 items-center flex-wrap">
                    <button
                        type='button'
                        onClick={handleLoadSample}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Load Sample Data
                    </button>
                    <button
                        type='button'
                        onClick={handleClear}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                    >
                        Clear Graph
                    </button>
                    <div className="flex gap-2 items-center">
                        <label htmlFor="theme-select" className="text-sm">
                            Theme:
                            <select
                                id="theme-select"
                                value={theme}
                                onChange={(e) => handleThemeChange(e.target.value)}
                                className="px-3 py-1 border border-border rounded-md bg-background"
                            >
                                <option value="system">System</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </label>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Nodes: {graphData.nodes.length} | Links: {graphData.links.length}
                    </div>
                </div>
            </div>
            <div className="flex-1 w-full relative">
                {/* eslint-disable-next-line react/no-unknown-property */}
                <force-graph
                    ref={graphElementRef}
                    data={JSON.stringify(graphData)}
                    theme={theme}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    displayTextPriorityProp={[{ "name": "name", "ignore": false }, { "name": "title", "ignore": true }]}
                />
            </div>
        </div>
    );
}

