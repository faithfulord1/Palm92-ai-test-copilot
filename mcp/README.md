# Palm92 AI Test Copilot MCP

This repository includes a small stdio MCP-compatible server for governed software and AI testing demonstrations.

## Run

```bash
npm run mcp
```

## Tools

- `analyze_requirement`
- `generate_test_cases`
- `evaluate_phone_equivalence`
- `create_evidence_record`
- `request_sensitive_action`

## Governance boundary

AI-generated tests remain `Pending` until a human approves them. Sensitive actions are blocked unless explicit approval and an approver identity are supplied. The MCP server is a portfolio/demo integration and should not be treated as an autonomous production release authority.
