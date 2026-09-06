# Palm92 Firefighter Review Copilot

## Portfolio case study

Palm92 Firefighter Review Copilot is an independent educational demonstration of how emergency privileged-access activity can be tested and reviewed using transparent controls and human oversight.

It is inspired by generally understood SAP GRC Emergency Access Management / Firefighter concepts. It does not connect to SAP, does not use customer data, does not reproduce proprietary transaction codes, and does not claim official SAP affiliation.

## Business problem

Emergency access creates a tension between speed and control. A user may genuinely need elevated permissions to restore a critical service, but the organisation must still be able to explain:

- who used the privileged access;
- why it was required;
- whether it stayed within the approved time window;
- what activity was performed;
- whether extra activity was justified;
- whether supporting incident/change evidence exists;
- whether an independent Controller reviewed the session; and
- whether the final decision is preserved in an auditable record.

## Solution

The demo ingests a synthetic Firefighter session and applies eight explainable control rules:

- `FF-R001` Missing Reason Code
- `FF-R002` Missing Incident/Ticket
- `FF-R003` Outside Approved Window
- `FF-R004` Sensitive Privileged Action
- `FF-R005` Purpose / Activity Scope Mismatch
- `FF-R006` Additional Activity Missing Justification
- `FF-R007` Repeat Emergency Access Pattern
- `FF-R008` Segregation-of-Duties / Self-Review Concern

Each finding provides the rule ID, severity, evidence, why it matters and a draft Controller question.

The system deliberately avoids language that declares misconduct. It identifies conditions that require review. The Controller remains accountable for the conclusion.

## Human-in-the-loop control

A final review cannot be completed silently by automation.

Two controls are enforced in the demo:

1. explicit human confirmation is required before final completion; and
2. the Firefighter user cannot independently complete their own review.

This demonstrates the principle:

**AI investigates. Humans decide.**

## Demo scenario

A synthetic payment-recovery session has the stated purpose “Restore failed payment batch.”

During the session, a privileged user-administration action is also recorded.

The rules engine raises a scope-mismatch finding and drafts a question asking why the user-administration activity was necessary and what incident/change evidence supports it.

This is intentionally not treated as automatic wrongdoing. The evidence is surfaced for human review.

## Software-testing coverage

The project includes 18 mapped test cases covering:

- positive flows;
- negative validation;
- access-window boundaries;
- sensitive privileged activity;
- scope mismatch;
- additional-activity justification;
- repeat-use patterns;
- segregation of duties;
- audit logging;
- human confirmation;
- malformed input; and
- report/evidence reconstruction.

The traceability view maps:

`Requirement → Control Objective → Rule ID → Test Case`

## Architecture

`Firefighter Log → Deterministic Rules / AI Triage → Explainable Findings → Controller Review → Human Decision → Audit Evidence`

The deterministic layer is important because the core control conclusions should remain reproducible and understandable. AI is most useful for summarisation, prioritisation and drafting questions, not as an opaque replacement for the Controller.

## Interview use

### 20-second answer

“Firefighter is controlled emergency privileged access. I would test the whole lifecycle, not only login: reason and approval, time-bound access, activity logging, additional-activity justification, independent Controller review, evidence, segregation of duties and the final audit trail.”

### 45-second project pitch

“I built a governed Firefighter Review Copilot using synthetic data. It applies transparent rules to emergency-access sessions, flags missing evidence, out-of-window activity, sensitive actions, scope mismatch and segregation-of-duties concerns, then drafts evidence-based Controller questions. The system cannot silently complete a review, because final completion requires explicit human confirmation and blocks self-review. I also built 18 software tests and traceability from control objective to test evidence, so the project demonstrates SAP GRC concepts, software testing and AI governance in one case.”

## Competencies demonstrated

- SAP GRC concepts
- Emergency Access Management
- Privileged Access Management
- Segregation of Duties
- software testing
- security testing
- workflow testing
- control assurance
- audit evidence
- requirements traceability
- explainable automation
- AI governance
- human-in-the-loop design
- MCP tool governance

## What this project does not claim

This portfolio project is not a substitute for a production SAP GRC implementation, official SAP training, customer-specific control design or professional audit judgement. Its purpose is to demonstrate understanding, test design, governance thinking and a working technical prototype using synthetic data.
