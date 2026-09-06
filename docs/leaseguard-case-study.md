# Palm92 LeaseGuard AI

**AI-powered Lease, Insurance & Financial Control Automation**

Palm92 LeaseGuard AI is a vendor-neutral control platform concept built from a practical SAP RE-FX insurance-processing scenario and expanded into an ERP-agnostic product architecture.

## Problem

Commercial lease and insurance processes frequently require people to compare data across leases, policies, invoices, renewals, evidence records and finance systems. Manual comparison creates delay, duplicate-payment risk, inconsistent evidence, weak traceability and avoidable control failure.

LeaseGuard separates the problem into three layers.

## 1. Operations

The system of work:

- lease records;
- policy records;
- invoice intake;
- renewals;
- evidence;
- case lifecycle.

## 2. Intelligence

The system of understanding:

- OCR/document extraction contract;
- matching;
- premium and currency reconciliation;
- duplicate detection;
- anomaly detection;
- AI-assisted investigation;
- explainable variance summaries.

AI does not decide whether a financial posting is correct. It supports interpretation and investigation.

## 3. Governance

The system of control:

- human approval gates;
- segregation of duties;
- deterministic release blockers;
- rule IDs and explainability;
- evidence completeness;
- audit events;
- controlled ERP handoff.

The design principle is:

**AI understands. Deterministic controls verify. Humans authorise.**

## Current professional MVP

The portfolio MVP uses synthetic commercial lease data and supports two scenarios:

1. a clean policy/invoice/evidence case that reconciles successfully and becomes ready for human approval; and
2. a risky case containing a premium variance, duplicate-invoice signal and incomplete evidence.

A clean case creates a draft posting proposal only. It cannot proceed to ERP handoff until a named independent reviewer approves it.

The maker cannot approve their own consequential action. A case with high or critical findings remains blocked even if a reviewer attempts approval.

## ERP portability

SAP is treated as one execution backend rather than the product itself.

Adapter blueprints are exposed for:

- SAP S/4HANA;
- Oracle Fusion Cloud ERP;
- Microsoft Dynamics 365 Finance;
- generic REST/webhook/CSV finance integrations.

No production credentials are stored and the portfolio build does not execute a real accounting entry.

## Demonstration flow

**Lease → Policy → Invoice → Evidence → Reconciliation → Risk findings → Draft posting proposal → Human approval → ERP adapter handoff**

## Software testing proof

The module is also a testing case study. It covers:

- requirement-to-rule traceability;
- deterministic financial controls;
- positive and negative paths;
- duplicate prevention;
- evidence validation;
- segregation of duties;
- approval bypass attempts;
- audit-event verification;
- document-extraction review boundaries;
- multi-ERP adapter contracts.

## Steve / TestingElearn talking point

> I started from an SAP RE-FX commercial lease insurance process, modelled the business rules, and then separated the solution from SAP. LeaseGuard uses AI for document understanding and investigation, deterministic controls for financial correctness, and human approval for consequential actions. I can test each layer independently and then test the complete workflow end to end.

## Production roadmap

### Phase 1: portfolio MVP

- synthetic lease, policy and invoice cases;
- deterministic reconciliation;
- explainable findings;
- human approval;
- SoD control;
- audit event;
- MCP tools;
- automated tests.

### Phase 2: document automation

- PDF/image upload;
- OCR/document AI;
- confidence scoring;
- field-level provenance;
- human correction workflow.

### Phase 3: operational platform

- persisted cases and users;
- RBAC;
- renewal calendar;
- evidence vault;
- notification workflow;
- dashboards and reporting.

### Phase 4: enterprise integrations

- sandbox ERP connectors;
- adapter contract testing;
- idempotency and duplicate protection;
- reconciliation back from ERP document IDs;
- secrets management;
- production observability.

### Phase 5: assurance

- model evaluation;
- prompt/version traceability;
- access reviews;
- control testing;
- DPIA/security review;
- operational resilience and incident procedures.

## Boundary

Palm92 LeaseGuard AI is currently an independent educational and portfolio implementation. It is not affiliated with SAP, Oracle or Microsoft, does not contain live enterprise credentials and does not perform production financial postings.
