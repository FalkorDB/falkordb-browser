self.importScripts('https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js');

self.onmessage = function (e) {
    const { nodes, links, nodeSize, width, height } = e.data;

    const nodesCopy = nodes.map(node => ({
        ...node,
        x: Math.random() * width,
        y: Math.random() * height
    }));

    const linksCopy = links.map(link => ({ ...link }));

    const simulation = d3.forceSimulation(nodesCopy)
        .force('link', d3.forceLink(linksCopy).distance(50).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-1))
        .force('collision', d3.forceCollide(nodeSize * 2).strength(0.1))
        .force('center', d3.forceCenter(width / 2, height / 2))

    const nodeMap = new Map(nodesCopy.map(node => [node.id, node]));

    const updateLinks = () => linksCopy.map(link => ({
        ...link,
        source: nodeMap.get(link.source.id || link.source) || link.source,
        target: nodeMap.get(link.target.id || link.target) || link.target,
    }));

    simulation.on('end', () => {
        self.postMessage({ nodes: nodesCopy, links: updateLinks(), done: true });
    });
};