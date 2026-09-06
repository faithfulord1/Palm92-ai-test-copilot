# Steve / TestingElearn Demo Script

## 3–5 minute walkthrough

### 1. Opening — 20 seconds

“I built Palm92 AI Test Copilot to show how AI models and agents can accelerate software testing without replacing tester judgement. The design is simple: AI can analyse, generate and prepare; the human tester controls quality decisions and consequential actions.”

### 2. Requirement analysis — 45 seconds

Use the login/MFA requirement on the home screen.

Explain:
- the Copilot identifies actors, risks, security concerns and testability gaps;
- it does not silently invent missing business rules;
- an AI provider can enhance analysis when configured, but a deterministic fallback keeps the demo usable without an API key.

Key line:
“AI helps me expand coverage quickly, but I still own the requirement interpretation and final test scope.”

### 3. Test generation — 45 seconds

Click **Generate test drafts**.

Explain the four test categories:
- functional happy path;
- negative/invalid input;
- security/authorisation boundary;
- governance/evidence verification.

Key line:
“The generated tests remain Pending. AI does not mark its own work approved.”

### 4. Antonio / Northwind agent test — 60 seconds

Click **Run Antonio agent test**.

Ground truth:
- CustomerID: ANTON
- Customer: Antonio Moreno
- Backend phone: `(5) 555-3932`
- Agent output: `555-3932`

Explain:
“The digits are semantically equivalent even though the presentation format differs. A brittle exact-string assertion would create a false functional failure. My test separates semantic correctness from format validation, so the functional result passes while the formatting difference is preserved as a warning.”

What this demonstrates:
- correct agent routing;
- customer-tool selection;
- backend grounding;
- log/evidence traceability;
- output-format validation;
- AI-agent testing beyond a normal web UI assertion.

### 5. Evidence record — 40 seconds

Click **Create evidence record**.

Explain that the record captures:
- correlation ID;
- before state;
- action;
- expected result;
- actual result;
- after state;
- verification;
- tester;
- approval state.

Key line:
“If a test fails or an agent behaves unexpectedly, another tester can reconstruct exactly what happened instead of relying on a screenshot and memory.”

### 6. MCP / human approval — 45 seconds

Click **Try without approval**.

Show that the sensitive action is blocked.

Then click **Approve as Faith**.

Explain:
“This is the governance boundary. An agent can prepare a sensitive action, but it cannot cross the approval boundary unless a human explicitly authorises it.”

Use the real-world example of sending customer data by email or booking an appointment.

### 7. Close — 20 seconds

“Palm92 AI Test Copilot combines traditional QA thinking with AI-agent testing, MCP governance and evidence. I see AI as a testing accelerator: it increases coverage and investigation speed, while the tester remains accountable for requirements, risk, evidence and final decisions.”

---

## If Steve asks about Cucumber and Selenium

**Cucumber** expresses behaviour in business-readable Given/When/Then scenarios and helps connect requirements to acceptance tests.

**Selenium** automates browser interaction and execution.

AI can assist before and after both:
- analyse requirements;
- draft Gherkin scenarios;
- generate test data and edge cases;
- suggest Selenium steps/page objects;
- inspect failures, logs and screenshots;
- prioritise regression tests after changes.

But the tester still validates the generated tests and owns the final result.
