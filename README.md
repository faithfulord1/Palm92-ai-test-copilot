# palm92-ai-test-copilot

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
- SAP GRC Firefighter-style emergency-access review and control testing
- SAP RE-FX commercial lease insurance pre-posting control and approval workflow
- Palm92 LeaseGuard AI persistent lease, insurance and financial-control workspace

## Palm92 LeaseGuard AI - Phase 2

Open `/leaseguard-phase2.html` after starting the app.

**Palm92 LeaseGuard AI** is the ERP-neutral product layer growing out of the SAP RE-FX case study.

Its three layers are:

- **Operations:** lease management, invoices, policies, renewals and evidence;
- **Intelligence:** document extraction, matching, anomaly detection, reconciliation and AI investigation;
- **Governance:** approval gates, segregation of duties, audit trail, policy controls and explainability.

Phase 2 adds persistent case records, users and roles, real PDF/image/text upload, SHA-256 evidence provenance, evidence verification, renewal tracking, dashboard metrics and a sandbox ERP handoff workflow.

Binary PDF and image files are stored and provenance-tracked. The application does not falsely claim OCR has occurred when an OCR provider is absent. Such documents are recorded as `pending-ocr-provider`; the production path is to connect an approved OCR / document-AI service and retain field-level provenance.

The sandbox ERP handoff supports vendor-neutral integration contracts for SAP S/4HANA, Oracle Fusion, Microsoft Dynamics 365 Finance and generic REST systems. No production credentials or real accounting posting are included.

See `docs/leaseguard-phase2.md` for architecture, security controls and the production upgrade path.

## SAP RE-FX Insurance Control Copilot

Open `/refx-insurance.html` after starting the app.

This independent educational module turns a commercial lease insurance scenario into a governed AI-assisted automation and testing case study. It uses synthetic data and does not connect to a live SAP system.

The demo flow is:

**Lease → Policy → Invoice → Evidence → Automated reconciliation → Risk findings → Draft posting proposal → Human approval → Approved SAP interface handoff**

The module checks:

- policy-number consistency;
- contract and invoice currency;
- configured annual premium versus invoice amount;
- coverage-period consistency;
- duplicate invoice risk;
- required supporting evidence;
- posting date against lease term;
- explicit human approval before a posting can be released.

It provides both a clean scenario and a deliberately risky scenario. The risky case contains a premium variance, a potential duplicate invoice and incomplete evidence so the control engine visibly blocks the posting path.

A successful control review produces only a **draft posting proposal**. The demo deliberately separates automated preparation from execution. A human must explicitly approve a clean proposal, while high or critical findings cannot be overridden simply by clicking approve.

This is designed to show Steve / TestingElearn how one AI-assisted testing architecture can extend into enterprise SAP-style financial processes while keeping deterministic controls, auditability and human accountability.

## SAP GRC Firefighter Review Copilot

Open `/firefighter.html` after starting the app.

This independent educational module uses synthetic data to demonstrate controlled emergency privileged access. It does not connect to a live SAP environment and does not claim official SAP affiliation.

The module provides:

- six synthetic emergency-access sessions;
- explainable deterministic control findings with stable rule IDs `FF-R001` to `FF-R008`;
- reason-code, incident/ticket, approved-window, sensitive-action, scope-mismatch, additional-activity, repeated-access and segregation-of-duties checks;
- Controller questions grounded in the exact finding evidence;
- explicit human confirmation before final review completion;
- self-review blocking for final completion;
- an audit timeline of Controller actions;
- 18 practical software test cases;
- requirement → control → rule → test traceability;
- a future-facing MCP catalogue and working MCP tools for Firefighter analysis and governed Controller decisions;
- a printable Controller Review Report;
- interview talking points for software-testing, GRC and SAP-security discussions.

The core design principle is:

**AI investigates. Humans decide.**

See `docs/firefighter-case-study.md` for the portfolio narrative and interview use.

## Core governance design

- AI-created tests begin as `Pending` and cannot silently become human-approved.
- Human edits reset approval to `Pending`.
- Evidence records capture correlation ID, before state, action, expected/actual, after state, verification, environment, tester and approval.
- Northwind evaluation accepts `555-3932` as semantically equivalent to `(5) 555-3932` while still exposing the exact-format mismatch.
- Sensitive MCP actions are blocked until explicit human approval is supplied.
- Firefighter review completion requires explicit human confirmation and is blocked when the Firefighter user attempts to complete their own review.
- RE-FX insurance automation may analyse, reconcile and prepare a draft posting, but final release requires a named human approver.
- High and critical RE-FX insurance findings block approval until resolved.
- LeaseGuard Phase 2 stores evidence with SHA-256 provenance and persistent audit events.
- LeaseGuard maker/approver segregation is enforced before ERP handoff.
- Final quality, release and control decisions remain human decisions.

## Run locally

Requirements: Node.js 20+.

```bash
npm start
```

Open `http://localhost:3000`.

No package installation is required for the core demo.

Local LeaseGuard Phase 2 records are written beneath `data/leaseguard/` and ignored by Git.

## Optional real AI analysis

The application works without an AI key through a deterministic fallback. To enable server-side AI requirement analysis, copy `.env.example` values into your environment and set `OPENAI_API_KEY`. Do not place secrets in browser code or commit them to Git.

The Firefighter and financial control findings deliberately remain deterministic and explainable. AI can be added for extraction, summarisation and drafting, while posting controls and human decision boundaries remain transparent.

## MCP

A minimal no-dependency stdio MCP-compatible server is included in `mcp/server.mjs`. It supports analysis, draft test generation, Northwind semantic evaluation, evidence records, governed sensitive-action requests, Firefighter review tools and LeaseGuard control tools.

See `mcp/README.md`.

## Quality checks

```bash
npm run ci
```

This runs static project checks and Node's built-in test suite, including Firefighter, RE-FX insurance, LeaseGuard control and LeaseGuard Phase 2 persistence tests.

## Architecture and demo

- `docs/architecture.md`
- `docs/demo-guide.md`
- `docs/responsible-ai.md`
- `docs/firefighter-case-study.md`
- `docs/leaseguard-case-study.md`
- `docs/leaseguard-phase2.md`

## Deployment

The app is a small Node web service and can be hosted on any platform that supports Node 20+. Configure `PORT` if required. The optional AI provider key must be configured as a server-side environment variable.

The Phase 2 JSON persistence layer is appropriate for a local portfolio demonstration, not a horizontally scaled production service. Production should use a transactional database, private object storage, enterprise identity and an approved OCR/document-AI provider.

## Author

Faith Wright  
Palm92 Intelligence

## License

MIT
