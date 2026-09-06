# Palm92 AI Test Copilot

**AI accelerates testing. Humans control quality decisions.**

Palm92 AI Test Copilot is a portfolio-quality governed testing workspace designed to demonstrate two connected capabilities:

1. use AI to accelerate conventional software testing; and
2. independently test AI models and agents themselves.

The product supports requirement analysis, structured test generation, human approve/edit/reject, test execution, evidence capture, defects, BDD/Gherkin, automation starters, AI assurance, Human vs AI coverage comparison, reporting and an audit trail.

## Demo scenarios

- Secure login + MFA
- Motor insurance claim intake and AI classification
- SAP-style purchase-to-pay / supplier invoice workflow
- Northwind multi-agent customer lookup with exact-versus-semantic phone-number evaluation for ANTON / Antonio Moreno

## Core governance design

- AI-created tests begin as `Pending` and cannot silently become human-approved.
- Human edits reset approval to `Pending`.
- Evidence records capture correlation ID, before state, action, expected/actual, after state, verification, environment, tester and approval.
- Northwind evaluation accepts `555-3932` as semantically equivalent to `(5) 555-3932` while still exposing the exact-format mismatch.
- Sensitive MCP actions are blocked until explicit human approval is supplied.
- Final quality and release decisions remain human decisions.

## Run locally

Requirements: Node.js 20+.

```bash
npm start
```

Open `http://localhost:3000`.

No package installation is required for the core demo.

## Optional real AI analysis

The application works without an AI key through a deterministic fallback. To enable server-side AI requirement analysis, copy `.env.example` values into your environment and set `OPENAI_API_KEY`. Do not place secrets in browser code or commit them to Git.

## MCP

A minimal no-dependency stdio MCP-compatible server is included in `mcp/server.mjs`. It supports analysis, draft test generation, Northwind semantic evaluation, evidence records, reports and a governed sensitive-action request.

See `mcp/README.md`.

## Quality checks

```bash
npm run ci
```

This runs static project checks and Node's built-in test suite.

## Architecture and demo

- `docs/architecture.md`
- `docs/demo-guide.md`
- `docs/responsible-ai.md`

## Deployment

The app is a small Node web service and can be hosted on any platform that supports Node 20+. Configure `PORT` if required. The optional AI provider key must be configured as a server-side environment variable.

## Author

Faith Wright  
Palm92 Intelligence

## License

MIT
