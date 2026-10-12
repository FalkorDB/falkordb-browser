import type { ReleaseNote } from "./releaseNotes.ts";

// Release notes listed in the Help menu's "Releases" drawer.
//
// `npm run release-notes [version]` drafts an entry from the PRs merged since
// the previous tag and inserts it at the marker below. Rewrite the titles for
// users, delete what nobody needs to hear about, then remove `draft: true` —
// drafts only show in development.
export const RELEASE_NOTES: ReleaseNote[] = [
    // @release-notes:insert
    {
        version: "2.6.2",
        date: "2026-10-11",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Match canvas search text anywhere in a property value" }, // #2128
        ],
    },
    {
        version: "2.6.0",
        date: "2026-10-04",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Support a preconfigured connection that signs in automatically" }, // #2102
            { kind: "feature", title: "Responsive layout for viewports under 1100px" }, // #2094
            { kind: "feature", title: "Shareable links that open a tab's graph and query anywhere" }, // #2116
            { kind: "feature", title: "Share by copying the address bar instead of a copy-link button" }, // #2120
            { kind: "improvement", title: "Add a configurable graph list order (newest first by default)" }, // #2096
            { kind: "fix", title: "Drop leftover demo graphs before re-creating them" }, // #2101
            { kind: "fix", title: "Parse LOAD CSV and VECTOR INDEX, and catch unrunnable CSV sources" }, // #2099
            { kind: "fix", title: "Parameterise Cypher inputs, bind ciphertext to its owner, drop the baked AUTH_SECRET" }, // #2097
            { kind: "fix", title: "A share link opens on a first visit instead of the tutorial" }, // #2119
        ],
    },
    {
        version: "2.5.1",
        date: "2026-09-03",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Hide user management for LDAP-backed enterprise connections" }, // #2067
            { kind: "improvement", title: "Improve UDF library panel expansion and function-to-code navigation" }, // #2066
            { kind: "improvement", title: "Harden Helm chart defaults for Pod Security `restricted` and add regression check" }, // #2070
            { kind: "fix", title: "Keep CYPHER keyword on parameter headers in displayed queries" }, // #2078
        ],
    },
    {
        version: "2.5.0",
        date: "2026-08-19",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Enhance tutorial steps for edge customization and tab management" }, // #2051
            { kind: "feature", title: "Set current tab to \"Graph\" when tutorial opens" }, // #2057
            { kind: "feature", title: "Enhance tutorial step descriptions and improve sub-menu event handling" }, // #2060
            { kind: "feature", title: "Enhance date validation and improve tutorial step handling" }, // #2065
            { kind: "improvement", title: "Add schema view" }, // #2047
            { kind: "improvement", title: "Remove nonexistent MCP port from Helm chart and docs" }, // #2049
            { kind: "improvement", title: "Schema property rules" }, // #2055
        ],
    },
    {
        version: "2.4.0",
        date: "2026-08-11",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Enhance relationship styling and customization" }, // #2021
            { kind: "feature", title: "Add enterprise graph offloading support and related indicators" }, // #2022
            { kind: "improvement", title: "Multi tab" }, // #2031
            { kind: "improvement", title: "Helm chart: add optional `image.registry` for container image resolution" }, // #2035
            { kind: "improvement", title: "Helm chart: support `global.imageRegistry` and robust image reference rendering" }, // #2038
            { kind: "improvement", title: "Expand Cypher grammar auto-completion to full OpenCypher keyword set with FalkorDB extensions" }, // #1920
        ],
    },
    {
        version: "2.3.2",
        date: "2026-07-29",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "improvement", title: "Remove sql from batch cypher upload" }, // #1985
            { kind: "fix", title: "Optimize graph deletion logic by using memoized selectedGraphs" }, // #1993
        ],
    },
    {
        version: "2.3.0",
        date: "2026-07-20",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Implement GraphInfoProvider for isolated state management" }, // #1921
            { kind: "feature", title: "Manage Graph → Upload Data — Cypher batch + native LOAD CSV (streaming object storage, hardened); dump restore gated" }, // #1911
            { kind: "feature", title: "Implement direct CSV upload support for cloud storage" }, // #1962
            { kind: "improvement", title: "Fix tab navigation" }, // #1910
            { kind: "improvement", title: "Confidence badge on 0-100 scale with text-to-cypher 0.2.3" }, // #1923
            { kind: "improvement", title: "Refactor graph names handling to support undefined state and improve safety" }, // #1946
            { kind: "fix", title: "Scope graph-info polling to its connection (cancel + epoch)" }, // #1939
            { kind: "fix", title: "Update layout and display node/edge counts in GraphView" }, // #1947
            { kind: "fix", title: "Update context structure for user experience settings and improve related components" }, // #1950
            { kind: "fix", title: "Make Token DB the sole authority for the connection target" }, // #1938
            { kind: "fix", title: "Pin graph ops by connection + generation to stop stale applies" }, // #1951
            { kind: "fix", title: "Improve graph handling and memory usage checks in various components" }, // #1974
        ],
    },
    {
        version: "2.2.0",
        date: "2026-07-01",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Use instance UDFs in chat (text-to-cypher 0.2.0)" }, // #1865
            { kind: "feature", title: "Actionable Cypher query errors — hints, \"Did you mean?\", editor diagnostics, \"Fix with AI\", and a live drift guard" }, // #1861
            { kind: "feature", title: "Enhance error handling and logging in BrowserSettings for model fetching" }, // #1874
            { kind: "improvement", title: "Add focus mode" }, // #1878
            { kind: "improvement", title: "Allow custom local LLM endpoint ports and paths" }, // #1875
            { kind: "improvement", title: "Fix PATH cell extraction for algo.SPpaths visualization" }, // #1888
            { kind: "improvement", title: "Enhance CypherEditor and EditorComponent with improved suggestion handling and diagnostics" }, // #1894
            { kind: "fix", title: "Chown .data volume on startup to resolve EACCES for non-root nextjs user" }, // #1864
            { kind: "fix", title: "Update ITEM_HEIGHT and improve suggestion handling in Toolbar component" }, // #1885
            { kind: "fix", title: "Update sentinel role handling and improve query execution logic" }, // #1891
            { kind: "fix", title: "Add type guard to setProperty array branch; use explicit restore flag" }, // #1899
            { kind: "fix", title: "Use explicit isNodeCell/isLinkCell predicates with correct polarity; remove empty ForgeGraph.tsx" }, // #1901
        ],
    },
    {
        version: "2.1.1",
        date: "2026-06-17",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "fix", title: "Update base image to use node:24-alpine for consistency" }, // #1857
        ],
    },
    {
        version: "2.1.0",
        date: "2026-06-17",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Enhance settings configuration and validation tests for new parameters" }, // #1817
            { kind: "feature", title: "Implement sub-menu keep-alive mechanism during step transitions" }, // #1821
            { kind: "feature", title: "Enhance chat functionality and improve error handling" }, // #1818
            { kind: "improvement", title: "Improve release image build resilience" }, // #1807
            { kind: "improvement", title: "Add configurable CSP connect sources" }, // #1838
            { kind: "improvement", title: "Cypher editor: trigger property autocomplete on '.' filtered by element type" }, // #1824
            { kind: "fix", title: "Prevent premature removal of savedContent on unauthenticated status" }, // #1816
            { kind: "fix", title: "Improve timeout handling by fetching server config for TIMEOUT_MAX" }, // #1833
        ],
    },
    {
        version: "2.0.10",
        date: "2026-06-01",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "improvement", title: "Refactor base path handling and validation for NextAuth URL" }, // #1794
            { kind: "improvement", title: "Add encryption key management to Helm chart" }, // #1796
            { kind: "improvement", title: "Add layouts" }, // #1801
        ],
    },
    {
        version: "2.0.9",
        date: "2026-05-27",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "improvement", title: "Add support for serving the browser under a sub-path" }, // #1791
        ],
    },
    {
        version: "2.0.8",
        date: "2026-05-26",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "improvement", title: "Update text-to-cypher to 0.1.14" }, // #1783
        ],
    },
    {
        version: "2.0.7",
        date: "2026-05-25",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "fix", title: "Restore bundled Monaco loader" }, // #1780
        ],
    },
    {
        version: "2.0.6",
        date: "2026-05-24",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Implement resizable panels and add useResizableSize hook" }, // #1768
            { kind: "feature", title: "Add connectWithQueryParams method for login flow with URL parameters" }, // #1778
        ],
    },
    {
        version: "2.0.5",
        date: "2026-05-18",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "improvement", title: "Add query params" }, // #1742
            { kind: "improvement", title: "Fix security" }, // #1729
            { kind: "improvement", title: "Confirm before logging out, and distinguish \"Logout All\" from per-connection sign-out" }, // #1747
            { kind: "fix", title: "Bundle Monaco editor loader" }, // #1737
            { kind: "fix", title: "Improve error handling and session management across various components" }, // #1753
            { kind: "fix", title: "Serialize file token writes" }, // #1760
        ],
    },
    {
        version: "2.0.4",
        date: "2026-05-11",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "improvement", title: "Add line-wrap toggle to Query History editor" }, // #1722
            { kind: "improvement", title: "Trust same-origin requests for auto NextAuth URL" }, // #1730
            { kind: "fix", title: "Update Dockerfile for improved entrypoint handling and add .dockerignore" }, // #1724
        ],
    },
    {
        version: "2.0.3",
        date: "2026-05-06",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "fix", title: "Adjust styles for PaginationList and QueryHistoryPanel components" }, // #1712
            { kind: "fix", title: "Streamline session management by removing connections array from JWT and updating related logic" }, // #1717
            { kind: "fix", title: "Improve session connection handling by stabilizing updateSession reference and refining state management on sign-out" }, // #1718
        ],
    },
    {
        version: "2.0.2",
        date: "2026-05-04",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Enhance user-friendly error messages across the application" }, // #1684
            { kind: "feature", title: "Add hideTitle prop to Profile, Metadata, and Explain components for conditional title rendering" }, // #1699
            { kind: "improvement", title: "Unrestricted file upload to publicly served directory" }, // #1669
            { kind: "improvement", title: "Multi db connection" }, // #1692
            { kind: "improvement", title: "Convert Query History to a dropdown popover and drop the favorites dropdown" }, // #1697
            { kind: "improvement", title: "Convert Graph Manage dialog into a floating panel" }, // #1696
            { kind: "improvement", title: "Render chat result messages as markdown" }, // #1691
            { kind: "improvement", title: "Fix auto NextAuth origin detection" }, // #1702
            { kind: "fix", title: "Don't reset Users tab on initial connection load" }, // #1694
            { kind: "fix", title: "Update TableComponent cell alignment and adjust Selector popover dimensions" }, // #1701
            { kind: "fix", title: "Adjust font sizes for buttons and text in various components; enhance UI consistency" }, // #1707
            { kind: "fix", title: "Improve file handling in GET request for uploads" }, // #1710
        ],
    },
    {
        version: "2.0.1",
        date: "2026-04-23",
        // Generated from merged PRs: rewrite for users, add descriptions, drop what
        // doesn't belong, then remove `draft` so production shows it.
        draft: true,
        items: [
            { kind: "feature", title: "Add expand state management to GraphContext and ProvidersWithSession" }, // #1632
            { kind: "feature", title: "Add xAI (Grok) provider support" }, // #1576
            { kind: "feature", title: "Update user permissions handling and improve UI for key management" }, // #1665
            { kind: "improvement", title: "Fix connection details" }, // #1628
            { kind: "improvement", title: "Fix login" }, // #1624
            { kind: "improvement", title: "Fix connect login" }, // #1625
            { kind: "improvement", title: "Fix more changes" }, // #1641
            { kind: "improvement", title: "Fix left menu" }, // #1640
            { kind: "improvement", title: "Fix users" }, // #1655
            { kind: "improvement", title: "Security/improve session password flow" }, // #1649
            { kind: "fix", title: "Conditionally apply server identity check based on environment variable" }, // #1656
            { kind: "fix", title: "Update key pattern descriptions for clarity in AddUser and EditUser components" }, // #1671
            { kind: "fix", title: "Optimize error handling by re-validating only on layout changes" }, // #1672
            { kind: "fix", title: "Improve tag handling in TagInput and update user role handling in AddUser and EditUser components" }, // #1673
            { kind: "fix", title: "Enhance timeout settings for node movement tests and improve chat toggle button rendering check" }, // #1674
        ],
    },
];
