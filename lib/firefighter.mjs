const clean = (value = '') => String(value ?? '').replace(/\s+/g, ' ').trim();
const sameIdentity = (a, b) => clean(a).toLowerCase() && clean(a).toLowerCase() === clean(b).toLowerCase();
const clone = (value) => JSON.parse(JSON.stringify(value));

export const FIREFIGHTER_RULES = [
  { id: 'FF-R001', name: 'Missing Reason Code', severity: 'high', control: 'Emergency access must have a documented business reason.' },
  { id: 'FF-R002', name: 'Missing Incident/Ticket', severity: 'medium', control: 'Emergency access should be linked to supporting incident or change evidence.' },
  { id: 'FF-R003', name: 'Outside Approved Window', severity: 'high', control: 'Emergency access should remain within its approved time boundary.' },
  { id: 'FF-R004', name: 'Sensitive Privileged Action', severity: 'medium', control: 'Sensitive actions require focused controller review and evidence.' },
  { id: 'FF-R005', name: 'Purpose / Activity Scope Mismatch', severity: 'high', control: 'Activity should remain consistent with the stated emergency purpose.' },
  { id: 'FF-R006', name: 'Additional Activity Missing Justification', severity: 'medium', control: 'Additional activity should be explicitly documented and justified.' },
  { id: 'FF-R007', name: 'Repeat Emergency Access Pattern', severity: 'medium', control: 'Repeated emergency access should be reviewed for underlying access or process issues.' },
  { id: 'FF-R008', name: 'Segregation-of-Duties / Self-Review Concern', severity: 'critical', control: 'The Firefighter user should not independently complete their own controller review.' }
];

export const FIREFIGHTER_REQUIREMENTS = [
  { id: 'FF-REQ-001', objective: 'Require a documented reason before emergency privileged access is used.', control: 'Reason capture', ruleIds: ['FF-R001'] },
  { id: 'FF-REQ-002', objective: 'Link emergency access to an incident, change or evidence reference where required.', control: 'Evidence linkage', ruleIds: ['FF-R002'] },
  { id: 'FF-REQ-003', objective: 'Restrict and review emergency access against its approved time window.', control: 'Time-bound access', ruleIds: ['FF-R003'] },
  { id: 'FF-REQ-004', objective: 'Record all privileged activity with sufficient detail for independent review.', control: 'Complete activity logging', ruleIds: ['FF-R004', 'FF-R005'] },
  { id: 'FF-REQ-005', objective: 'Require justification when additional activity is performed.', control: 'Additional-activity governance', ruleIds: ['FF-R006'] },
  { id: 'FF-REQ-006', objective: 'Detect repeated emergency-access patterns that may indicate a persistent access problem.', control: 'Pattern monitoring', ruleIds: ['FF-R007'] },
  { id: 'FF-REQ-007', objective: 'Prevent inappropriate self-review and preserve segregation of duties.', control: 'Independent review', ruleIds: ['FF-R008'] },
  { id: 'FF-REQ-008', objective: 'Preserve controller comments, evidence references and final decision in the audit trail.', control: 'Auditability', ruleIds: [] },
  { id: 'FF-REQ-009', objective: 'Require explicit human confirmation before a review is completed.', control: 'Human-in-the-loop decision', ruleIds: [] }
];

export const FIREFIGHTER_TEST_CASES = [
  { id: 'FF-TC-001', requirementId: 'FF-REQ-001', type: 'positive', title: 'Valid reason code permits governed session review', expected: 'Reason is retained and no missing-reason finding is raised.' },
  { id: 'FF-TC-002', requirementId: 'FF-REQ-001', type: 'negative', title: 'Missing reason code is flagged', expected: 'FF-R001 is raised with High severity and evidence identifies the missing field.' },
  { id: 'FF-TC-003', requirementId: 'FF-REQ-002', type: 'negative', title: 'Missing incident or ticket is flagged', expected: 'FF-R002 is raised and controller is prompted to request supporting evidence.' },
  { id: 'FF-TC-004', requirementId: 'FF-REQ-003', type: 'positive', title: 'Activity remains inside approved window', expected: 'No FF-R003 finding is raised.' },
  { id: 'FF-TC-005', requirementId: 'FF-REQ-003', type: 'boundary', title: 'Session starts before approved time', expected: 'FF-R003 is raised with the approved and actual timestamps.' },
  { id: 'FF-TC-006', requirementId: 'FF-REQ-003', type: 'boundary', title: 'Session ends after approved time', expected: 'FF-R003 is raised with the approved and actual timestamps.' },
  { id: 'FF-TC-007', requirementId: 'FF-REQ-004', type: 'security', title: 'Sensitive privileged action receives focused review', expected: 'FF-R004 identifies the sensitive action without automatically declaring misconduct.' },
  { id: 'FF-TC-008', requirementId: 'FF-REQ-004', type: 'governance', title: 'Purpose and activity mismatch is detected', expected: 'FF-R005 is raised and an explainable controller question is drafted.' },
  { id: 'FF-TC-009', requirementId: 'FF-REQ-005', type: 'positive', title: 'Additional activity includes justification', expected: 'No FF-R006 finding is raised.' },
  { id: 'FF-TC-010', requirementId: 'FF-REQ-005', type: 'negative', title: 'Additional activity lacks justification', expected: 'FF-R006 is raised and asks for the missing business justification.' },
  { id: 'FF-TC-011', requirementId: 'FF-REQ-006', type: 'pattern', title: 'Repeat emergency access threshold is reached', expected: 'FF-R007 is raised when recent emergency-use count is at or above the configured demonstration threshold.' },
  { id: 'FF-TC-012', requirementId: 'FF-REQ-007', type: 'security', title: 'Firefighter cannot complete own review', expected: 'Completion is blocked with a segregation-of-duties status.' },
  { id: 'FF-TC-013', requirementId: 'FF-REQ-007', type: 'positive', title: 'Independent controller can review session', expected: 'Controller action is permitted and recorded in the audit trail.' },
  { id: 'FF-TC-014', requirementId: 'FF-REQ-008', type: 'audit', title: 'Controller comment is retained', expected: 'Audit event contains actor, action, timestamp, session ID and rationale.' },
  { id: 'FF-TC-015', requirementId: 'FF-REQ-009', type: 'human-in-loop', title: 'Completion without explicit confirmation is blocked', expected: 'System returns HUMAN_CONFIRMATION_REQUIRED.' },
  { id: 'FF-TC-016', requirementId: 'FF-REQ-009', type: 'human-in-loop', title: 'Confirmed completion is allowed for independent controller', expected: 'Completion succeeds and final audit event is generated.' },
  { id: 'FF-TC-017', requirementId: 'FF-REQ-004', type: 'input-validation', title: 'Malformed uploaded session is rejected safely', expected: 'Validation error identifies missing required session structure without corrupting state.' },
  { id: 'FF-TC-018', requirementId: 'FF-REQ-008', type: 'evidence', title: 'Review report preserves finding evidence and decision rationale', expected: 'Report can be reconstructed from session facts, findings and audit events.' }
].map((test) => ({ ...test, status: 'Pending' }));

export const FIREFIGHTER_MCP_CATALOG = [
  { name: 'ingest_firefighter_log', mode: 'write-draft', approval: 'No', purpose: 'Validate and normalise a synthetic Firefighter session for analysis.' },
  { name: 'analyse_firefighter_session', mode: 'read-only', approval: 'No', purpose: 'Run explainable deterministic Firefighter control checks.' },
  { name: 'get_control_findings', mode: 'read-only', approval: 'No', purpose: 'Return findings, evidence, severities and mapped control objectives.' },
  { name: 'draft_controller_questions', mode: 'read-only', approval: 'No', purpose: 'Draft evidence-based questions for the human Controller.' },
  { name: 'request_evidence', mode: 'prepare-action', approval: 'Human before external send', purpose: 'Prepare an evidence request while keeping outbound action under human control.' },
  { name: 'record_controller_decision', mode: 'write', approval: 'Yes', purpose: 'Record the Controller decision and rationale in the audit trail.' },
  { name: 'complete_firefighter_review', mode: 'consequential write', approval: 'Always', purpose: 'Complete a Firefighter review only after explicit human confirmation and SoD validation.' }
];

const SAMPLE_SESSIONS = [
  {
    id: 'FF-DEMO-001', attentionHint: 'Low', firefighterUser: 'Maya Chen', firefighterId: 'FF-FIN-01', controller: 'Daniel Brooks',
    reasonCode: 'Production payment batch recovery', incidentTicket: 'INC-4102', purposeCategory: 'payment',
    approvedStart: '2026-09-05T21:00:00Z', approvedEnd: '2026-09-05T22:00:00Z', actualStart: '2026-09-05T21:08:00Z', actualEnd: '2026-09-05T21:42:00Z',
    recentEmergencyUseCount: 1,
    actions: [
      { time: '2026-09-05T21:14:00Z', description: 'Review failed payment batch status', category: 'payment', sensitive: false },
      { time: '2026-09-05T21:27:00Z', description: 'Restart payment processing job', category: 'payment', sensitive: true }
    ],
    additionalActivity: '', additionalJustification: '', evidenceRefs: ['INC-4102', 'CHG-8901']
  },
  {
    id: 'FF-DEMO-002', attentionHint: 'Medium', firefighterUser: 'Noah Patel', firefighterId: 'FF-BASIS-03', controller: 'Grace Miller',
    reasonCode: 'Restore failed background processing', incidentTicket: '', purposeCategory: 'operations',
    approvedStart: '2026-09-05T18:00:00Z', approvedEnd: '2026-09-05T19:00:00Z', actualStart: '2026-09-05T18:05:00Z', actualEnd: '2026-09-05T18:31:00Z',
    recentEmergencyUseCount: 1,
    actions: [{ time: '2026-09-05T18:14:00Z', description: 'Restart background processing service', category: 'operations', sensitive: true }],
    additionalActivity: '', additionalJustification: '', evidenceRefs: []
  },
  {
    id: 'FF-DEMO-003', attentionHint: 'High', firefighterUser: 'Aisha Morgan', firefighterId: 'FF-OPS-04', controller: 'Leo Grant',
    reasonCode: 'Resolve urgent interface failure', incidentTicket: 'INC-4177', purposeCategory: 'operations',
    approvedStart: '2026-09-05T20:00:00Z', approvedEnd: '2026-09-05T20:45:00Z', actualStart: '2026-09-05T19:48:00Z', actualEnd: '2026-09-05T20:52:00Z',
    recentEmergencyUseCount: 2,
    actions: [{ time: '2026-09-05T20:04:00Z', description: 'Restart interface processing', category: 'operations', sensitive: true }],
    additionalActivity: '', additionalJustification: '', evidenceRefs: ['INC-4177']
  },
  {
    id: 'FF-DEMO-004', attentionHint: 'High', firefighterUser: 'Ethan Cole', firefighterId: 'FF-FIN-02', controller: 'Priya Shah',
    reasonCode: 'Restore failed payment batch', incidentTicket: 'INC-4200', purposeCategory: 'payment',
    approvedStart: '2026-09-06T01:00:00Z', approvedEnd: '2026-09-06T02:00:00Z', actualStart: '2026-09-06T01:06:00Z', actualEnd: '2026-09-06T01:49:00Z',
    recentEmergencyUseCount: 1,
    actions: [
      { time: '2026-09-06T01:14:00Z', description: 'Inspect failed payment processing', category: 'payment', sensitive: false },
      { time: '2026-09-06T01:31:00Z', description: 'Change privileged user access assignment', category: 'user_admin', sensitive: true, scopeMismatch: true }
    ],
    additionalActivity: 'User administration action', additionalJustification: 'Required during troubleshooting; evidence pending', evidenceRefs: ['INC-4200']
  },
  {
    id: 'FF-DEMO-005', attentionHint: 'Medium', firefighterUser: 'Sofia Reed', firefighterId: 'FF-LOG-02', controller: 'Owen Price',
    reasonCode: 'Restore urgent outbound document processing', incidentTicket: 'INC-4211', purposeCategory: 'operations',
    approvedStart: '2026-09-06T03:00:00Z', approvedEnd: '2026-09-06T04:00:00Z', actualStart: '2026-09-06T03:10:00Z', actualEnd: '2026-09-06T03:44:00Z',
    recentEmergencyUseCount: 1,
    actions: [{ time: '2026-09-06T03:24:00Z', description: 'Adjust processing configuration', category: 'operations', sensitive: true }],
    additionalActivity: 'Temporary configuration adjustment', additionalJustification: '', evidenceRefs: ['INC-4211']
  },
  {
    id: 'FF-DEMO-006', attentionHint: 'High', firefighterUser: 'Liam Stone', firefighterId: 'FF-SEC-01', controller: 'Liam Stone',
    reasonCode: 'Emergency access recovery', incidentTicket: 'INC-4220', purposeCategory: 'security',
    approvedStart: '2026-09-06T04:00:00Z', approvedEnd: '2026-09-06T04:30:00Z', actualStart: '2026-09-06T04:03:00Z', actualEnd: '2026-09-06T04:24:00Z',
    recentEmergencyUseCount: 4,
    actions: [{ time: '2026-09-06T04:11:00Z', description: 'Review privileged role assignment', category: 'security', sensitive: true }],
    additionalActivity: '', additionalJustification: '', evidenceRefs: ['INC-4220']
  }
];

export function getSampleFirefighterSessions() {
  return clone(SAMPLE_SESSIONS);
}

export function validateFirefighterSession(input = {}) {
  const session = { ...input };
  const errors = [];
  if (!clean(session.id)) errors.push('Session id is required.');
  if (!clean(session.firefighterUser)) errors.push('Firefighter user is required.');
  if (!clean(session.firefighterId)) errors.push('Firefighter ID is required.');
  if (!clean(session.controller)) errors.push('Assigned controller is required.');
  if (!Array.isArray(session.actions)) errors.push('Actions must be an array.');
  for (const field of ['approvedStart', 'approvedEnd', 'actualStart', 'actualEnd']) {
    if (!clean(session[field]) || Number.isNaN(Date.parse(session[field]))) errors.push(`${field} must be a valid date/time.`);
  }
  return { valid: errors.length === 0, errors };
}

function makeFinding(ruleId, evidence, whyItMatters, controllerQuestion) {
  const rule = FIREFIGHTER_RULES.find((item) => item.id === ruleId);
  return {
    ruleId,
    name: rule?.name || ruleId,
    severity: rule?.severity || 'medium',
    controlObjective: rule?.control || '',
    evidence,
    whyItMatters,
    controllerQuestion,
    status: 'Open'
  };
}

export function analyzeFirefighterSession(input = {}) {
  const validation = validateFirefighterSession(input);
  if (!validation.valid) return { valid: false, errors: validation.errors, findings: [] };

  const session = clone(input);
  const findings = [];

  if (!clean(session.reasonCode)) {
    findings.push(makeFinding('FF-R001', 'reasonCode is empty', 'Without a documented reason, the emergency-access purpose cannot be independently verified.', 'Please provide the business reason or approved reason code for this emergency session.'));
  }

  if (!clean(session.incidentTicket)) {
    findings.push(makeFinding('FF-R002', 'incidentTicket is empty', 'Supporting incident or change evidence helps the Controller verify that emergency access was necessary.', 'Please provide the incident, change or other evidence reference supporting this session.'));
  }

  const approvedStart = Date.parse(session.approvedStart);
  const approvedEnd = Date.parse(session.approvedEnd);
  const actualStart = Date.parse(session.actualStart);
  const actualEnd = Date.parse(session.actualEnd);
  if (actualStart < approvedStart || actualEnd > approvedEnd) {
    findings.push(makeFinding(
      'FF-R003',
      `Approved ${session.approvedStart} → ${session.approvedEnd}; actual ${session.actualStart} → ${session.actualEnd}`,
      'Use outside the approved window may indicate the emergency access exceeded its authorised boundary.',
      'The recorded session falls outside the approved access window. Please explain the timing and provide any extension approval.'
    ));
  }

  const sensitiveActions = (session.actions || []).filter((action) => Boolean(action.sensitive));
  if (sensitiveActions.length) {
    findings.push(makeFinding(
      'FF-R004',
      sensitiveActions.map((action) => `${action.time || 'time unknown'}: ${action.description || 'Sensitive action'}`).join(' | '),
      'Sensitive privileged activity deserves explicit human review even when it may be legitimate.',
      `Please confirm why the sensitive privileged action${sensitiveActions.length > 1 ? 's were' : ' was'} necessary for the stated emergency and identify supporting evidence.`
    ));
  }

  const mismatches = (session.actions || []).filter((action) => Boolean(action.scopeMismatch));
  if (mismatches.length) {
    findings.push(makeFinding(
      'FF-R005',
      `Purpose: ${session.reasonCode}; mismatched activity: ${mismatches.map((action) => action.description).join(' | ')}`,
      'A mismatch between the stated emergency and recorded activity requires explanation before the Controller can complete the review.',
      `The stated reason relates to ${clean(session.reasonCode).toLowerCase()}, but ${mismatches.map((action) => clean(action.description)).join('; ')} was recorded. Please explain why this activity was necessary and provide the related incident/change evidence.`
    ));
  }

  if (clean(session.additionalActivity) && !clean(session.additionalJustification)) {
    findings.push(makeFinding(
      'FF-R006',
      `Additional activity recorded: ${clean(session.additionalActivity)}; justification is empty`,
      'Additional activity should be traceable to a documented necessity rather than silently expanding the emergency scope.',
      'Additional activity was recorded without justification. Please explain why it was necessary and attach the supporting evidence reference.'
    ));
  }

  if (Number(session.recentEmergencyUseCount || 0) >= 3) {
    findings.push(makeFinding(
      'FF-R007',
      `Recent emergency-use count: ${Number(session.recentEmergencyUseCount || 0)}`,
      'Repeated use may point to a recurring operational issue, an access-design problem or a need for a permanent controlled solution.',
      'This user or Firefighter ID shows repeated emergency use. Has the underlying access or operational cause been reviewed?' 
    ));
  }

  if (sameIdentity(session.firefighterUser, session.controller)) {
    findings.push(makeFinding(
      'FF-R008',
      `Firefighter user and Controller are both ${clean(session.firefighterUser)}`,
      'Independent review is weakened when the same person performs and completes the privileged activity review.',
      'Please assign an independent Controller before this review is completed.'
    ));
  }

  const severityRank = { low: 1, medium: 2, high: 3, critical: 4 };
  const maxSeverity = findings.reduce((max, item) => Math.max(max, severityRank[item.severity] || 0), 0);
  const attention = maxSeverity >= 3 ? 'High' : maxSeverity === 2 ? 'Medium' : 'Low';

  return {
    valid: true,
    session,
    attention,
    findingCount: findings.length,
    findings,
    controllerQuestions: findings.map((finding) => ({ ruleId: finding.ruleId, question: finding.controllerQuestion })),
    governance: 'AI/rules may triage and draft questions. A human Controller makes the final review decision.',
    disclaimer: 'Independent educational portfolio demo. No live SAP connection. Synthetic data only.'
  };
}

export function recordControllerDecision(session, { actor = '', action = 'comment', comment = '', confirmed = false } = {}) {
  const validation = validateFirefighterSession(session);
  if (!validation.valid) return { allowed: false, status: 'INVALID_SESSION', errors: validation.errors };

  const normalizedAction = clean(action).toLowerCase();
  const completionActions = new Set(['complete', 'approve', 'close']);

  if (completionActions.has(normalizedAction) && sameIdentity(actor, session.firefighterUser)) {
    return { allowed: false, status: 'SOD_BLOCKED', reason: 'The Firefighter user cannot independently complete their own review.' };
  }

  if (completionActions.has(normalizedAction) && !confirmed) {
    return { allowed: false, status: 'HUMAN_CONFIRMATION_REQUIRED', reason: 'Explicit human confirmation is required before final review completion.' };
  }

  if (!clean(actor)) return { allowed: false, status: 'ACTOR_REQUIRED' };

  const auditEvent = {
    sessionId: clean(session.id),
    actor: clean(actor),
    action: normalizedAction || 'comment',
    rationale: clean(comment),
    recordedAt: new Date().toISOString(),
    humanConfirmed: completionActions.has(normalizedAction) ? Boolean(confirmed) : null
  };

  return {
    allowed: true,
    status: completionActions.has(normalizedAction) ? 'REVIEW_COMPLETED' : 'REVIEW_UPDATED',
    auditEvent
  };
}

export function getFirefighterTraceability() {
  return FIREFIGHTER_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    testCases: FIREFIGHTER_TEST_CASES.filter((test) => test.requirementId === requirement.id).map((test) => test.id)
  }));
}
