# FalkorDB Canvas

A standalone custom HTML element for rendering force-directed graphs using vanilla JavaScript.

## Installation

Install the required dependency:

```bash
npm install force-graph
```

## Usage

### Basic Usage

```html
<falkordb-canvas id="myGraph"></falkordb-canvas>

<script type="module">
  import './falkordb-canvas.js';

  const graphElement = document.getElementById('myGraph');
  
  // Set data (links have source/target as numbers)
  const data = {
    nodes: [
      { id: 1, labels: ['Person'], color: '#ff0000', visible: true, expand: false, collapsed: false, displayName: ['', ''], data: { name: 'Alice' } },
      { id: 2, labels: ['Person'], color: '#00ff00', visible: true, expand: false, collapsed: false, displayName: ['', ''], data: { name: 'Bob' } }
    ],
    links: [
      { id: 1, relationship: 'KNOWS', color: '#0000ff', source: 1, target: 2, visible: true, expand: false, collapsed: false, curve: 0, data: {} }
    ]
  };

  graphElement.updateData(data);
</script>
```

### Configuration

```javascript
graphElement.setConfig({
  displayTextPriority: [
    { name: 'name', ignore: false },
    { name: 'title', ignore: false }
  ],
  theme: 'dark' // 'light' | 'dark' | 'system'
});
```

### Interaction Methods

```javascript
// Zoom to fit all nodes
graphElement.zoomToFit();

// Zoom to specific level
graphElement.zoom(2, 500); // zoom level, duration in ms

// Center at specific coordinates
graphElement.centerAt(100, 200, 500);

// Get current zoom and center
const zoom = graphElement.getZoom();
const center = graphElement.getCenter();

// Update data
graphElement.updateData(newData);

// Get current data (serialized)
const currentData = graphElement.getData();

// Reheat simulation
graphElement.reheat();
```

### Events

```javascript
// Node toggle (double-click)
graphElement.addEventListener('node-toggle', (e) => {
  console.log('Node toggled:', e.detail.node, e.detail.expanded);
});

// Selection change (right-click)
graphElement.addEventListener('selection-change', (e) => {
  console.log('Selected elements:', e.detail.elements);
});
```

### Attributes

```html
<!-- Set data via attribute (JSON string) -->
<falkordb-canvas data='{"nodes":[...],"links":[...]}'></falkordb-canvas>

<!-- Set theme -->
<falkordb-canvas theme="dark"></falkordb-canvas>

<!-- Set loading state -->
<falkordb-canvas loading="true"></falkordb-canvas>
```

## Data Format

### Serializable GraphData (Input)

Links have `source` and `target` as **numbers** (node IDs):

```typescript
{
  nodes: SerializableNode[];
  links: SerializableLink[]; // source: number, target: number
}
```

### Parsed GraphData (Internal)

Links have `source` and `target` as **Node objects**:

```typescript
{
  nodes: Node[];
  links: Link[]; // source: Node, target: Node
}
```

The component automatically parses serializable data to parsed data when `updateData()` is called.

## Features

- ✅ Standalone custom HTML element
- ✅ Handles loading and cooldown states
- ✅ Caches display names on nodes (like source/target in links)
- ✅ Relationship metadata map for text measurements
- ✅ Same canvas object styles as ForceGraph.tsx
- ✅ Exports interaction functions
- ✅ Organized with separate utils and types files
- ✅ No dependencies on browser-specific code

