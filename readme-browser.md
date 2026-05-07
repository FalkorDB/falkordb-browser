# FalkorDB Browser — Features
FalkorDB Browser is a web UI for exploring, querying, and managing FalkorDB graphs.
It allows a developer to interact with graphs loaded to FaklorDB, explore how specific queries behave and review the current data model.


## Main features

### Graph exploration (Graph page)
- **Interactive graph canvas**
  - Visualize query results containing nodes/edges as an interactive graph.
  - Pan/zoom and interact with nodes and relationships.
  - Toggle visibility by **labels** and **relationship types**.
- **Element search (in-canvas search)**
  - Search nodes/edges by:
    - node properties (string prefix match),
    - ids,
    - relationship type,
    - labels.
  - Jump/zoom to the match and select it.
- **Data / inspection panel**
  - Selecting an element opens a side panel for inspecting its properties.
  - Supports editing workflows (see “Data manipulation”).
- **Entity Creation Tools**
  - You can add a node and/or an edge to the current graph from the canvas view.

### Querying
- **Cypher query editor (Monaco)**
  - Editor-style experience for writing Cypher.
  - Keyboard shortcuts include:
    - Run: `Enter` (and `Cmd/Ctrl + Enter` in the query-history editor)
    - Insert newline: `Shift + Enter`
  - Includes Cypher keyword/function completion (based on the Browser’s built-in lists).
- **Results views**
  - **Graph view** for node/edge results.
  - **Table view** for tabular results.
- **Query metadata**
  - Metadata tab shows:
    - query metadata text,
    - explain plan (rendered as a nested tree),
    - profile output (rendered as a nested tree).

### Query history
- **Persistent query history** stored in browser `localStorage`.
- **History browser dialog**
  - Search and filter previous queries.
  - Filter by graph name.
  - Delete single queries, multi-select delete, or “delete all”.
- **Per-query metadata**
  - Review metadata / explain / profile for past queries.

### Data manipulation (nodes/relationships)
- **Create node / create relationship** flows from the Graph UI.
- **Delete elements** (node or relationship) from the Graph UI.
- **Label editing** supported via API routes (the UI provides label management components).

### Graph management
- **Create graphs** from the UI.
- **Delete graphs** (supports deleting multiple selected graphs).
- **Duplicate graphs**
  - Create a copy of an existing graph (including data).
- **Export graphs**
  - Download a `.dump` file via the Browser (`/api/graph/:graph/export`).
- **Upload data**
  - “Upload Data” dialog supports drag-and-drop file selection (Dropzone UI).

### Graph Info panel
- **Memory Usage tracking** Exposes current memory utilization of the graph in MB.
- **Node Label tracking** View all node labels in the graph, control style visualization for labels. Click on a node label to trigger a query to visualize nodes from this label.
- **Edge Type tracking** View all edge types in the graph. Click on an edge type to trigger a graph query showing only nodes connected through this edge type.
- **Proerty Keys tracking** View all property keys in the graph. Click on a key to issue a query that shows nodes and edges where the property exists (not NULL).


### API documentation
- **Built-in Swagger UI** at `/docs`.
  - Loads the Browser’s OpenAPI spec from `/api/swagger`.
  - “Try it out” enabled.
  - Adds an `X-JWT-Only: true` header when calling endpoints from Swagger UI.

### Authentication & access control
- Uses **NextAuth** (credentials-backed) for authentication.
- UI capabilities are role-aware:
  - **Read-Only** users cannot create graphs.
  - **Admin** users can access database configuration and user-management sections in settings.

### Settings
The `/settings` area includes multiple sections:
- **Browser settings**
  - Query execution defaults and limits:
    - timeout
    - result limit
    - run default query on-load
  - User experience:
    - content persistence (auto-save/restore)
    - display-text priority (controls which node property is shown as the node caption)
  - Graph info refresh interval.
  - Tutorial replay.
- **DB configurations** (Admin)
  - View and update server configuration values.
  - Some runtime configs are intentionally read-only.
- **Users** (Admin)
  - List users and adjust roles.
  - Add and delete users.
- **Personal Access Tokens**
  - Generate tokens (with optional expiration).
  - Tokens are shown once at creation (copy-to-clipboard UX).
  - Revoke existing tokens.

### Optional “Chat” (English → Cypher)
If enabled, the Browser includes a **Chat panel** that streams responses from a text-to-cypher service.
- The UI sends messages to `/api/chat` and processes server-sent events.
- Chat configuration lives in Settings (model + secret key).
- The chat backend URL is controlled by `CHAT_URL`.

## Common workflows
### 1) Run a query and visualize results
1. Go to **Graphs** and select a graph.
2. Write a Cypher query in the editor.
3. Run it.
4. Inspect results in:
   - **Graph** tab (interactive canvas), or
   - **Table** tab (rows/columns).
5. Use **Labels/Relationships toggles** to focus the canvas.

### 2) Inspect and edit an element
1. Click a node/edge in the canvas.
2. Use the **Data panel** to inspect properties.
3. Use create/delete actions as needed.

### 3) Use query history
1. Open **Query History**.
2. Filter by graph, search, and select a previous query.
3. Review **Metadata / Explain / Profile**.

### 4) Export a graph
1. Open graph management.
2. Select a graph.
3. Click **Export Data** to download a `.dump`.

