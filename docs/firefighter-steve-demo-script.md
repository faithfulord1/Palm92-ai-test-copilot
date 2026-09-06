# Palm92 Firefighter Review Copilot — Steve Demo Script

## 90-second version

### Opening
“This is a governed emergency-access testing scenario based on SAP GRC Firefighter concepts. I am not trying to automate the Controller out of the process. The system analyses evidence, highlights exceptions and drafts questions. The human Controller decides.”

### Step 1 — Show the review queue
“Here I have six synthetic Firefighter sessions. The app calculates an attention level from deterministic control rules rather than producing an unexplained AI risk score.”

### Step 2 — Open FF-DEMO-004
“This session was approved for a failed payment batch. The recorded activity includes a privileged user-access assignment. The system flags a purpose/activity scope mismatch and shows the exact evidence that caused the finding.”

### Step 3 — Explain the neutral question
“Instead of declaring wrongdoing, it drafts a neutral Controller question asking why the user-administration action was necessary and what evidence supports it.”

### Step 4 — Show the testing layer
“I also derived 18 tests covering reason capture, incident evidence, approved time windows, sensitive actions, scope mismatch, additional-activity justification, repeat access, segregation of duties, audit evidence and explicit human completion.”

### Step 5 — Demonstrate the human gate
“Completing a review requires explicit confirmation. In the self-review scenario, the Firefighter user and Controller are the same person, so final completion is blocked on segregation-of-duties grounds.”

### Close
“This is the kind of AI-assisted testing model I mean when I say AI accelerates investigation but does not silently make the quality or governance decision. AI investigates. Humans decide.”

## 3-minute version

1. Start on the Executive Overview and explain the queue, high-attention count and open findings.
2. Open FF-DEMO-001 to show a comparatively normal session. Explain that sensitive activity still receives review attention without automatically failing the session.
3. Open FF-DEMO-003 and show the approved-window breach. Explain boundary testing and evidence capture.
4. Open FF-DEMO-004 and show the payment-purpose versus privileged-user-administration mismatch.
5. Open FF-DEMO-005 and show an additional activity without justification.
6. Open FF-DEMO-006 and attempt final completion. Explain why self-review is blocked.
7. Open Test Lab and point out the 18 mapped tests. Stress that generated/preloaded tests remain Pending until a human tester reviews them.
8. Show Traceability: Requirement → Control → Rule → Test.
9. Show MCP & Agentic Architecture and explain read-only tools versus prepare-action and consequential-write tools.
10. Finish with the Controller Review Report and audit trail.

## Strong interview answer

“I would test Firefighter as a control lifecycle, not only as a UI. I would validate approval and reason capture, correct Firefighter assignment, time-bound access, complete privileged activity logging, additional-activity justification, Controller routing, evidence retention, segregation of duties and final auditability. I would use AI to help triage logs and draft evidence-based questions, but I would keep final Controller and quality decisions human-controlled.”

## Questions Steve may ask

**Why deterministic rules instead of pure AI?**
Because control findings should be explainable and reproducible. AI can assist with summarisation and drafting, but the reason a finding was raised should remain traceable to a known rule and session fact.

**What would you automate first in a real programme?**
Log ingestion, rule evaluation, test-data validation, traceability checks, report preparation and low-risk triage. I would keep consequential approval or review completion behind human confirmation.

**How would you test the AI/agent itself?**
I would verify grounding, tool selection, permission boundaries, false-positive/false-negative behaviour, prompt/input robustness, evidence traceability, and whether the agent respects human approval gates.

**What is the main governance principle?**
AI investigates. Humans decide.
