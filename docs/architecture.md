# Architecture

Browser UI → Node HTTP service → deterministic governed testing engine → optional server-side AI provider.

The same engine is exposed through an stdio MCP-compatible server for agent/tool demonstrations.

## Trust boundaries

- Browser never receives provider secrets.
- AI-generated test cases remain Pending.
- Sensitive MCP actions require explicit human approval.
- Evidence records include correlation ID, before/action/after state, verification and approval context.
- Deterministic fallbacks keep the portfolio demo functional without an external AI key.
