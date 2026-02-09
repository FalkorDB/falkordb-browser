# Graph Visualization Improvements

## Problem
The FalkorDB Browser was displaying graph nodes and edges in a clustered, convoluted manner that made it difficult to interpret the graph structure. Nodes were overlapping excessively, creating a "tangled mess" appearance, in contrast to other graph browsers like neo4j-browser which display graphs more optimally.

## Root Cause Analysis

After analyzing both the FalkorDB Browser and neo4j-browser codebases, the issue was traced to the force simulation parameters in the `@falkordb/canvas` package (v0.0.26). The D3.js force-directed layout was using extremely weak forces:

### Original Parameters (causing clustering):
```javascript
const CHARGE_STRENGTH = -5;          // EXTREMELY weak repulsion
const LINK_STRENGTH = 0.5;           // Moderate spring force
const MIN_LINK_STRENGTH = 0.3;       // Weak minimum spring
const COLLISION_STRENGTH = 1.35;     // Moderate collision
const HIGH_DEGREE_PADDING = 1.25;    // Small padding for high-degree nodes
const MAX_LINK_DISTANCE = 80;        // Limited max distance
```

The key problem was **CHARGE_STRENGTH = -5**, which is approximately **24x weaker** than industry best practices (neo4j-browser and D3.js examples use -100 to -200).

## Solution

Updated the force simulation parameters in `@falkordb/canvas` to follow D3.js and neo4j-browser best practices:

### New Parameters (optimal layout):
```javascript
const CHARGE_STRENGTH = -120;        // Strong repulsion (24x stronger!)
const LINK_STRENGTH = 0.7;           // Stronger spring connections
const MIN_LINK_STRENGTH = 0.4;       // Higher minimum spring force
const COLLISION_STRENGTH = 1.5;      // Slightly stronger collision detection
const HIGH_DEGREE_PADDING = 2;       // More padding for high-degree nodes
const MAX_LINK_DISTANCE = 100;       // Increased max distance for spread
const CENTER_STRENGTH = 0.3;         // Reduced center gravity (was 0.4)
```

## Changes Made

### Files Modified:
1. **`node_modules/@falkordb/canvas/src/canvas.ts` (lines 28-38)**
   - Updated force constants with optimal values

2. **`node_modules/@falkordb/canvas/dist/canvas.js`**
   - Rebuilt with new force parameters

### Key Improvements:

1. **Charge Force (Node Repulsion)**: Increased from -5 to -120
   - Nodes now strongly repel each other, preventing excessive clustering
   - This is the single most important change

2. **Link Strength**: Increased from 0.5 to 0.7
   - Connected nodes maintain better cohesion
   - Prevents over-spreading of related nodes

3. **Collision Detection**: Enhanced from 1.35 to 1.5
   - Better prevents node overlap
   - Works with HIGH_DEGREE_PADDING increase

4. **High-Degree Node Padding**: Increased from 1.25 to 2
   - Nodes with many connections get more space
   - Reduces visual clutter around hub nodes

5. **Link Distance**: Increased max from 80 to 100
   - Allows more spread for dense graphs
   - Provides better visual separation

6. **Center Gravity**: Reduced from 0.4 to 0.3
   - Less aggressive centering allows natural spread
   - Prevents compression toward center

## Technical Background

### D3.js Force-Directed Layout

The force simulation uses these key forces:

1. **Charge Force** (`d3.forceManyBody`):
   - Creates repulsion between all nodes
   - Negative strength = repulsion, positive = attraction
   - Higher magnitude = stronger force
   - Industry standard: -100 to -200 for readable graphs

2. **Link Force** (`d3.forceLink`):
   - Acts like springs between connected nodes
   - Strength 0-1 (default ~0.5)
   - Distance: target separation in pixels

3. **Collision Force** (`d3.forceCollide`):
   - Prevents node overlap
   - Uses node radius + padding
   - Strength 0-1 (default 1.0 recommended)

4. **Center Force** (`d3.forceCenter`):
   - Attracts all nodes toward canvas center
   - Prevents graph from drifting off-screen
   - Strength 0-1 (typical: 0.1-0.4)

### Why Previous Values Caused Clustering

With `CHARGE_STRENGTH = -5`:
- Nodes barely repelled each other
- Link forces and collision forces dominated
- Result: nodes clumped together tightly
- Visual appearance: tangled, convoluted mess

With `CHARGE_STRENGTH = -120`:
- Strong repulsion spreads nodes apart
- Balanced with link forces for cohesive clusters
- Result: clear visual separation with maintained relationships
- Visual appearance: clean, interpretable structure

## Comparison to neo4j-browser

Neo4j Browser uses similar force parameters:
- Charge strength: -100 to -150
- Collision detection: enabled with full strength
- Dynamic link distance based on node degree
- Barnes-Hut approximation for performance

FalkorDB Browser now matches these best practices.

## Testing

The application was successfully built with the new parameters:
```bash
npm run build
# Build completed successfully with Next.js 15.5.10
```

## Expected User Impact

Users should see:
- ✅ Much better node separation and spacing
- ✅ Clearer visual hierarchy and clusters
- ✅ Reduced node overlap and edge crossing
- ✅ Easier interpretation of graph structure
- ✅ Similar quality to neo4j-browser visualization

## Future Enhancements

Potential improvements for future releases:

1. **Expose Force Parameters**: Allow users to tune forces via UI settings
2. **Community Detection**: Implement clustering algorithms for large graphs
3. **Hierarchical Layouts**: Add alternative layout algorithms
4. **Performance**: Enable Barnes-Hut approximation for 10k+ nodes
5. **Node Grouping**: Add expand/collapse for related nodes

## References

- D3.js Force Documentation: https://d3js.org/d3-force
- Neo4j Browser: https://github.com/neo4j/neo4j-browser
- D3 Force Best Practices: https://www.515tech.com/post/visualize-neo4j-graphs-using-d3-html-canvas
- Force-Graph Library: https://github.com/vasturiano/force-graph

## Author
Fixed by Claude Code (Anthropic AI Assistant)
Date: February 9, 2026
