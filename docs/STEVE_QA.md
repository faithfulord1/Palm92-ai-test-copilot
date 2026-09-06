# Steve / TestingElearn — AI Testing Q&A Prep

## What is the difference between using ChatGPT and using an AI agent in testing?

A chat model mainly responds to prompts. An agent can combine a model with tools, memory/state and a workflow so it can inspect requirements, call test utilities, query systems, prepare actions and return evidence. Because agents can act, they need stronger controls around permissions, approval and traceability.

## Where does AI add value in manual testing?

AI can accelerate requirement analysis, identify ambiguity, propose positive/negative/boundary/security cases, create test data, summarise logs and compare expected versus actual results. It is strongest as a force multiplier for the tester, not as an unquestioned oracle.

## Where does AI add value in automation?

It can draft Gherkin, Selenium/Playwright steps, page objects and API test ideas; analyse failures; suggest likely root causes; identify change impact; and prioritise regression coverage. Generated automation still needs review and execution evidence.

## How would you test an AI agent?

Test more than the final answer. Validate:
1. routing — did the right agent receive the request?
2. tool selection — did it use the correct backend/tool?
3. grounding — is the answer supported by backend data?
4. transformation — did normalisation or summarisation alter meaning?
5. permissions — could it perform actions it should not?
6. approval — are sensitive actions blocked until authorised?
7. traceability — can the run be reconstructed from logs/evidence?
8. resilience — what happens when the model, tool or backend fails?

## Explain the Antonio example

Northwind backend ground truth for Antonio Moreno is `(5) 555-3932`. The agent returns `555-3932`. A strict string assertion fails, but the meaningful digits are equivalent. The correct test result is semantic pass plus a format warning unless the requirement explicitly demands exact formatting.

This avoids a false functional failure while still preserving a presentation defect if formatting matters.

## What is human-in-the-loop testing?

The system may analyse, recommend or prepare, but a human reviews the output before a consequential decision or action. In this project, generated tests remain Pending and sensitive MCP actions remain blocked until a named approver explicitly authorises them.

## What evidence would you keep for AI-agent testing?

Correlation/run ID, requirement, prompt/input, routed agent, tool calls, backend evidence, model/agent output, expected result, actual result, before/after state, approval decision, timestamps and verification notes.

## What if the AI model is unavailable?

The Test Copilot has a deterministic fallback. A demo or core testing workflow should not collapse just because an external model API is unavailable. That also makes behaviour easier to test and reproduce.

## What are the main risks of AI-generated tests?

Hallucinated requirements, duplicated cases, missing edge cases, incorrect expected results, insecure test data, over-trust in plausible output and unstable results. Mitigations include explicit source requirements, deterministic checks, human review, stable test IDs, provenance and evidence.

## How do Cucumber and Selenium fit together?

Cucumber expresses expected behaviour in Given/When/Then form. Selenium automates browser actions. A common flow is requirement → Gherkin/Cucumber scenario → step definitions → Selenium execution → assertion/evidence. AI can help draft and maintain each layer, but the test design and result remain human-owned.

## What would you automate first?

Stable, repeatable, high-value regression paths with clear expected outcomes. I would not begin by automating ambiguous requirements or highly volatile interfaces. For AI systems I would also automate deterministic policy and tool-boundary tests before relying on subjective model-output grading.

## What would make you stop an agent automatically?

Attempted unauthorised data access, tool call outside its permission boundary, sensitive action without approval, missing mandatory evidence, confidence/validation below the agreed threshold, or a backend response that contradicts the agent output.

## Strong closing statement

“I use AI to increase testing speed and coverage, but I design the workflow so evidence, permissions and final quality decisions remain controlled by the tester.”
