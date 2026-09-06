# Palm92 LeaseGuard AI — Phase 2

## Objective

Phase 2 moves LeaseGuard from a stateless portfolio demonstration toward a persistent enterprise workflow.

The product principle remains:

**AI understands. Deterministic controls verify. Humans authorise.**

## Implemented capabilities

### 1. Persistent case management

Cases survive application restarts through a JSON file store in `data/leaseguard/store.json`.

Each case records:

- lease, policy and invoice business data;
- creator / maker;
- assigned reviewer and approver;
- document references;
- renewal references;
- latest control analysis;
- latest human decision;
- case status and timestamps.

The JSON store is deliberately small and dependency-free for the portfolio build. Production should migrate to PostgreSQL or Supabase with row-level controls, migrations, backups and concurrency management.

### 2. Real file intake

The browser accepts PDF, PNG, JPEG, WebP and text files up to 10 MB.

Uploaded bytes are written to the LeaseGuard upload directory. Metadata includes:

- original filename;
- MIME type;
- size;
- uploader;
- timestamp;
- SHA-256 digest;
- linked case;
- document type;
- verification status.

The SHA-256 digest is the provenance anchor. A reviewer can show which exact uploaded bytes produced a document record.

### 3. OCR and extraction boundary

The application does **not** pretend that binary PDF or image OCR has occurred when no OCR engine is configured.

For binary uploads without supplied extracted text, the record is created with:

`extractionMode: pending-ocr-provider`

This is intentional. A production deployment should plug in an approved OCR / document-AI provider and write extracted text, field-level confidence, page coordinates and provider version into the provenance record.

For the demonstration, supplied text can be parsed through the deterministic LeaseGuard extraction contract and is still linked to the uploaded document SHA-256.

Recommended production provider options include cloud document intelligence services or an internal OCR service selected after privacy, security, cost and data-residency review.

### 4. Evidence verification

Uploaded evidence begins as:

`PENDING_HUMAN_REVIEW`

A reviewer or authorised role can verify or reject it. The verification creates an audit event and records who performed the review and when.

### 5. Users, roles and segregation of duties

Phase 2 includes a small role model:

- Operations
- Reviewer
- Approver
- Auditor
- Administrator

The maker of a consequential proposal cannot approve their own proposal. An approved case cannot reach the ERP sandbox until the approval control has passed.

This is a portfolio RBAC model, not a replacement for enterprise identity. Production should use SSO/OIDC, managed groups, least privilege, MFA and central lifecycle management.

### 6. Renewal workflow

Insurance-policy renewals are persistent records attached to cases. The dashboard reports renewals due within 90 days.

Future production extensions:

- scheduled reminders;
- policy renewal evidence requests;
- renewal quotation comparison;
- overdue escalation;
- broker / insurer workflow;
- renewal approval and replacement of superseded evidence.

### 7. Dashboard

The Phase 2 workspace surfaces:

- total and open cases;
- cases requiring review;
- cases awaiting approval;
- evidence volume and verified evidence;
- renewals due within 90 days;
- sandbox ERP handoffs;
- recent audit events.

### 8. Sandbox ERP adapter

After a clean case receives independent approval, the approver can send the approved proposal to a sandbox adapter.

The sandbox returns an external reference and records the handoff in the audit trail.

It creates **no real accounting entry**.

The adapter parameter supports:

- `generic-rest`
- `sap-s4hana`
- `oracle-fusion`
- `dynamics-365`

The named ERP adapters remain blueprints until real sandbox credentials and vendor-specific integration contracts are configured.

## Phase 2 API surface

- `GET /api/leaseguard/workspace`
- `POST /api/leaseguard/cases`
- `POST /api/leaseguard/cases/assign`
- `POST /api/leaseguard/documents`
- `POST /api/leaseguard/documents/verify`
- `POST /api/leaseguard/cases/analyse`
- `POST /api/leaseguard/cases/decide`
- `POST /api/leaseguard/renewals`
- `POST /api/leaseguard/erp/sandbox`
- `POST /api/leaseguard/reset`

## Security and governance controls

- file type allow-list;
- 10 MB file limit;
- SHA-256 document provenance;
- path-safe generated storage names;
- role-based action checks;
- maker / approver segregation;
- deterministic release blockers;
- explicit approval requirement;
- audit events for state-changing actions;
- no production ERP credentials in the repository;
- no claim of OCR success without an OCR provider.

## Production upgrade path

### Data

Replace JSON persistence with PostgreSQL / Supabase.

Suggested entities:

- organisations
- users
- roles
- leases
- policies
- invoices
- cases
- documents
- document_extractions
- evidence_verifications
- control_findings
- decisions
- renewals
- erp_handoffs
- audit_events

### Storage

Move document bytes to private object storage with:

- server-side encryption;
- signed URLs;
- malware scanning;
- retention rules;
- legal hold where applicable;
- tenant isolation.

### Identity

Add OIDC / SSO, MFA and enterprise role mapping.

### OCR / document AI

Add a provider abstraction supporting:

1. document upload;
2. OCR / layout extraction;
3. field extraction with confidence;
4. field-to-page provenance;
5. human correction;
6. immutable original evidence reference.

### ERP integration

Implement one sandbox connector first, recommended sequence:

1. generic REST contract test server;
2. SAP S/4HANA sandbox / approved middleware;
3. Oracle Fusion sandbox;
4. Dynamics 365 sandbox.

Production posting must preserve the LeaseGuard approval identifier and correlation ID in the downstream transaction where possible.

## Demo route

Run the Node application and open:

`/leaseguard-phase2.html`

Recommended demonstration:

1. create case;
2. assign reviewer and approver;
3. upload policy and invoice evidence;
4. verify evidence;
5. run reconciliation;
6. approve with independent approver;
7. create renewal task;
8. send approved proposal to generic REST sandbox;
9. show dashboard and audit trail.

This demonstrates that LeaseGuard has moved beyond a single-screen SAP example into a controlled, ERP-neutral operational workflow.
