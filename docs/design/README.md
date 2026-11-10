# Design docs

Short plans for non-trivial changes, kept next to the code they describe. A plan is
documentation, not history: **update it when the implementation diverges**, and note at the
top when the work has shipped.

## Template

```
# <Title>
Goal — one paragraph: what outcome, for whom.
Problem today — what a user or developer experiences now.
Mechanism — the design, naming real files/symbols (prefer symbols over line numbers).
Tests — unit / smoke / e2e plan, and how the ≥ 95% coverage bar is met.
Risks and deferred — what is intentionally left out and why.
```

## Index

| Doc | Topic |
| --- | --- |
| [clear-cypher-errors-ideas.md](clear-cypher-errors-ideas.md) | Backlog for clearer Cypher error messages |
| [idea-1-did-you-mean-plan.md](idea-1-did-you-mean-plan.md) | "Did you mean…?" suggestions |
| [idea-2-editor-diagnostics-plan.md](idea-2-editor-diagnostics-plan.md) | Inline editor diagnostics and quick fixes |
| [idea-3-ai-fix-plan.md](idea-3-ai-fix-plan.md) | "Fix with AI" |
| [idea-5-coverage-drift-plan.md](idea-5-coverage-drift-plan.md) | More error hints + drift guard against a real FalkorDB |
| [idea-6-connection-epoch-pinning-plan.md](idea-6-connection-epoch-pinning-plan.md) | Ownership tokens against stale connection/graph/query results |

Add a row here when you add a doc.
