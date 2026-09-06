const clean = (value = '') => String(value).replace(/\s+/g, ' ').trim();

export function analyzeRequirement(input) {
  const text = clean(input);
  const lower = text.toLowerCase();
  const actors = [];
  if (/user|customer|member|tester/.test(lower)) actors.push('User');
  if (/admin|manager|approver/.test(lower)) actors.push('Authorised reviewer');
  if (/agent|ai|model/.test(lower)) actors.push('AI/agent');

  const risks = [];
  if (/login|password|mfa|2fa|auth/.test(lower)) risks.push('Authentication and account-access failure');
  if (/payment|money|invoice|claim/.test(lower)) risks.push('Financial or transaction integrity risk');
  if (/personal|customer|child|health|medical|email|phone/.test(lower)) risks.push('Personal-data handling and privacy risk');
  if (/ai|agent|model|classif|recommend/.test(lower)) risks.push('AI output may be incorrect, incomplete or over-confident');

  const securityConcerns = [];
  if (/login|auth|password|mfa|2fa/.test(lower)) securityConcerns.push('Verify authentication, authorisation, session and lockout controls');
  if (/upload|file|document|image/.test(lower)) securityConcerns.push('Validate file type, size, content and unsafe upload handling');
  if (/api|agent|mcp|tool/.test(lower)) securityConcerns.push('Validate tool permissions, input boundaries and sensitive-action approval gates');

  return {
    mode: 'deterministic-fallback',
    objective: text.split(/[.!?]/)[0] || text,
    actors: actors.length ? actors : ['Primary user'],
    preconditions: ['Required service is available', 'User has any required permissions'],
    functionalRequirements: [text],
    nonFunctionalRequirements: ['Clear error handling', 'Traceable outcomes', 'Accessible and understandable feedback'],
    acceptanceCriteria: [
      'The stated user outcome can be completed successfully',
      'Invalid or incomplete input is handled safely',
      'Sensitive actions require the correct authorisation',
      'The result is recorded with enough evidence to verify what happened'
    ],
    dependencies: ['Application under test', 'Test environment and test data'],
    risks: risks.length ? risks : ['Requirement ambiguity may create incomplete test coverage'],
    ambiguities: text.length < 80 ? ['Requirement is brief; actors, exceptions and measurable acceptance criteria may need clarification'] : [],
    assumptions: ['No unstated business rule is treated as confirmed fact'],
    testabilityConcerns: ['Expected outcomes and failure behaviour should be explicit and measurable'],
    securityConcerns
  };
}

export function generateTestCases(input, requirementId = 'REQ-001') {
  const analysis = analyzeRequirement(input);
  const base = requirementId.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 30) || 'REQ-001';
  return [
    {
      id: `${base}-TC-001`,
      title: 'Happy path completes the intended outcome',
      type: 'functional',
      priority: 'high',
      status: 'Pending',
      preconditions: analysis.preconditions,
      steps: ['Prepare valid test data', 'Perform the requirement flow', 'Capture the resulting state'],
      expected: 'The intended outcome completes successfully and is traceable.'
    },
    {
      id: `${base}-TC-002`,
      title: 'Invalid or missing input is rejected safely',
      type: 'negative',
      priority: 'high',
      status: 'Pending',
      preconditions: ['Application is available'],
      steps: ['Submit missing, malformed or invalid input', 'Observe validation and system state'],
      expected: 'The action is blocked or handled safely without corrupting state or exposing sensitive detail.'
    },
    {
      id: `${base}-TC-003`,
      title: 'Authorisation boundary is enforced',
      type: 'security',
      priority: 'critical',
      status: 'Pending',
      preconditions: ['A user without the required approval or permission is available'],
      steps: ['Attempt the sensitive action without approval', 'Repeat with explicit authorised approval'],
      expected: 'The first attempt is blocked and the authorised attempt is traceable.'
    },
    {
      id: `${base}-TC-004`,
      title: 'Evidence record supports independent verification',
      type: 'governance',
      priority: 'high',
      status: 'Pending',
      preconditions: ['A completed test execution exists'],
      steps: ['Review correlation ID, before state, action, expected/actual result, after state and approval'],
      expected: 'The evidence is complete enough for another reviewer to understand and verify the decision.'
    }
  ];
}

export function normalizePhone(value = '') {
  return String(value).replace(/[^0-9+]/g, '').replace(/^\+?0+/, '');
}

export function evaluatePhoneEquivalence(expected, actual) {
  const e = normalizePhone(expected);
  const a = normalizePhone(actual);
  const semanticMatch = e === a || e.endsWith(a) || a.endsWith(e);
  return {
    semanticMatch,
    exactFormatMatch: clean(expected) === clean(actual),
    expected: clean(expected),
    actual: clean(actual),
    note: semanticMatch && clean(expected) !== clean(actual)
      ? 'Values are semantically equivalent but the output format differs.'
      : semanticMatch ? 'Values match.' : 'Values do not match.'
  };
}

export function createEvidenceRecord({ correlationId, beforeState, action, expected, actual, afterState, verification, environment = 'demo', tester = 'Faith Wright', approval = 'Pending' }) {
  if (!clean(correlationId)) throw new Error('correlationId is required');
  return {
    correlationId: clean(correlationId),
    beforeState,
    action: clean(action),
    expected: clean(expected),
    actual: clean(actual),
    afterState,
    verification: clean(verification),
    environment: clean(environment),
    tester: clean(tester),
    approval,
    recordedAt: new Date().toISOString()
  };
}

export function requestSensitiveAction({ action, approved = false, approver = '' }) {
  if (!approved) return { allowed: false, status: 'HUMAN_APPROVAL_REQUIRED', action: clean(action) };
  if (!clean(approver)) return { allowed: false, status: 'APPROVER_ID_REQUIRED', action: clean(action) };
  return { allowed: true, status: 'APPROVED', action: clean(action), approver: clean(approver) };
}
