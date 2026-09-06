const money = (value) => Number(Number(value || 0).toFixed(2));
const text = (value) => String(value ?? '').trim();
const upper = (value) => text(value).toUpperCase();

export const LEASEGUARD_VERSION = '0.1.0';

export const LEASEGUARD_CONNECTORS = Object.freeze([
  {
    id: 'sap-s4hana',
    name: 'SAP S/4HANA',
    status: 'adapter-blueprint',
    patterns: ['OData', 'BAPI/RFC via approved middleware', 'Integration Suite'],
    boundary: 'No live credentials or production posting are included in the portfolio build.'
  },
  {
    id: 'oracle-fusion',
    name: 'Oracle Fusion Cloud ERP',
    status: 'adapter-blueprint',
    patterns: ['REST APIs', 'Oracle Integration'],
    boundary: 'Connector contract is defined; production authentication is intentionally absent.'
  },
  {
    id: 'dynamics-365',
    name: 'Microsoft Dynamics 365 Finance',
    status: 'adapter-blueprint',
    patterns: ['Data entities', 'OData', 'Power Platform'],
    boundary: 'Connector contract is defined; production authentication is intentionally absent.'
  },
  {
    id: 'generic-rest',
    name: 'Generic ERP / Finance API',
    status: 'demo-ready',
    patterns: ['REST', 'Webhook', 'CSV staging'],
    boundary: 'Used for vendor-neutral demonstrations and contract testing.'
  }
]);

export const LEASEGUARD_RULES = Object.freeze([
  { id: 'LG-R001', layer: 'operations', title: 'Lease and policy must be linked', severity: 'high' },
  { id: 'LG-R002', layer: 'operations', title: 'Coverage must overlap the lease term', severity: 'high' },
  { id: 'LG-R003', layer: 'intelligence', title: 'Invoice premium must reconcile to approved policy premium', severity: 'medium' },
  { id: 'LG-R004', layer: 'intelligence', title: 'Currency must reconcile across contract, policy and invoice', severity: 'high' },
  { id: 'LG-R005', layer: 'intelligence', title: 'Potential duplicate invoice must be blocked', severity: 'critical' },
  { id: 'LG-R006', layer: 'operations', title: 'Required evidence must be present', severity: 'medium' },
  { id: 'LG-R007', layer: 'governance', title: 'Posting proposal requires human approval', severity: 'critical' },
  { id: 'LG-R008', layer: 'governance', title: 'Maker cannot approve own consequential action', severity: 'critical' },
  { id: 'LG-R009', layer: 'governance', title: 'High and critical findings prevent release', severity: 'critical' },
  { id: 'LG-R010', layer: 'governance', title: 'Every decision must create an audit event', severity: 'high' }
]);

export const LEASEGUARD_SAMPLE_CASES = Object.freeze({
  clean: {
    caseId: 'LG-CASE-001',
    source: 'synthetic-demo',
    lease: {
      leaseId: 'LEASE-LON-004',
      property: 'London Commercial Unit 04',
      tenant: 'Northbridge Retail Ltd',
      startDate: '2027-01-01',
      endDate: '2029-12-31',
      currency: 'GBP',
      monthlyRent: 10000,
      companyCode: 'P920'
    },
    policy: {
      policyNumber: 'POL-P92-2027-001',
      leaseId: 'LEASE-LON-004',
      provider: 'Example Commercial Insurance Ltd',
      premium: 1200,
      currency: 'GBP',
      coverageStart: '2027-01-01',
      coverageEnd: '2027-12-31',
      glAccount: '640500',
      costCenter: 'PROP-LON-04'
    },
    invoice: {
      invoiceId: 'INV-INS-2027-001',
      policyNumber: 'POL-P92-2027-001',
      provider: 'Example Commercial Insurance Ltd',
      amount: 1200,
      currency: 'GBP',
      invoiceDate: '2027-01-02',
      serviceFrom: '2027-01-01',
      serviceTo: '2027-12-31',
      duplicateReference: false
    },
    evidence: [
      { id: 'EV-001', type: 'policy-schedule', name: 'policy-schedule.pdf', verified: true },
      { id: 'EV-002', type: 'invoice', name: 'invoice.pdf', verified: true }
    ],
    createdBy: 'operations.user'
  },
  anomaly: {
    caseId: 'LG-CASE-002',
    source: 'synthetic-demo',
    lease: {
      leaseId: 'LEASE-LON-004',
      property: 'London Commercial Unit 04',
      tenant: 'Northbridge Retail Ltd',
      startDate: '2027-01-01',
      endDate: '2029-12-31',
      currency: 'GBP',
      monthlyRent: 10000,
      companyCode: 'P920'
    },
    policy: {
      policyNumber: 'POL-P92-2027-001',
      leaseId: 'LEASE-LON-004',
      provider: 'Example Commercial Insurance Ltd',
      premium: 1200,
      currency: 'GBP',
      coverageStart: '2027-01-01',
      coverageEnd: '2027-12-31',
      glAccount: '640500',
      costCenter: 'PROP-LON-04'
    },
    invoice: {
      invoiceId: 'INV-INS-2027-009',
      policyNumber: 'POL-P92-2027-001',
      provider: 'Example Commercial Insurance Ltd',
      amount: 1260,
      currency: 'GBP',
      invoiceDate: '2027-01-02',
      serviceFrom: '2027-01-01',
      serviceTo: '2027-12-31',
      duplicateReference: true
    },
    evidence: [
      { id: 'EV-009', type: 'invoice', name: 'invoice.pdf', verified: true }
    ],
    createdBy: 'operations.user'
  }
});

function dateValue(value) {
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) ? parsed : null;
}

function overlaps(startA, endA, startB, endB) {
  const a1 = dateValue(startA); const a2 = dateValue(endA);
  const b1 = dateValue(startB); const b2 = dateValue(endB);
  if ([a1, a2, b1, b2].some((v) => v === null)) return false;
  return a1 <= b2 && b1 <= a2;
}

function finding(ruleId, layer, severity, title, expected, observed, explanation, nextAction) {
  return { ruleId, layer, severity, title, expected, observed, explanation, nextAction };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function extractInsuranceDocument(rawText = '') {
  const source = text(rawText);
  const amountMatch = source.match(/(?:premium|amount)\s*[:=-]?\s*(?:£|GBP\s*)?([0-9]+(?:\.[0-9]{1,2})?)/i);
  const policyMatch = source.match(/policy(?:\s*(?:number|no\.?))?\s*[:#=-]?\s*([A-Z0-9-]{5,})/i);
  const invoiceMatch = source.match(/invoice(?:\s*(?:number|no\.?))?\s*[:#=-]?\s*([A-Z0-9-]{5,})/i);
  const currencyMatch = source.match(/\b(GBP|USD|EUR)\b/i);
  const dateMatches = [...source.matchAll(/\b(20\d{2}-\d{2}-\d{2})\b/g)].map((m) => m[1]);

  return {
    extractionMode: 'deterministic-demo-parser',
    fields: {
      policyNumber: policyMatch?.[1] || null,
      invoiceId: invoiceMatch?.[1] || null,
      amount: amountMatch ? money(amountMatch[1]) : null,
      currency: currencyMatch ? upper(currencyMatch[1]) : null,
      dates: dateMatches
    },
    confidence: source ? 0.72 : 0,
    reviewRequired: true,
    governance: 'Document extraction is a draft interpretation. A human or trusted system of record must validate consequential fields.'
  };
}

export function reconcileLeaseInsurance(input = {}) {
  const caseData = clone(input.caseData || input || LEASEGUARD_SAMPLE_CASES.clean);
  const { lease = {}, policy = {}, invoice = {}, evidence = [] } = caseData;
  const findings = [];

  if (!lease.leaseId || policy.leaseId !== lease.leaseId) {
    findings.push(finding('LG-R001', 'operations', 'high', 'Lease-policy linkage failed', lease.leaseId || 'Valid lease ID', policy.leaseId || 'Missing', 'The policy must be explicitly linked to the lease being processed.', 'Resolve the lease/policy relationship before continuing.'));
  }

  if (!overlaps(policy.coverageStart, policy.coverageEnd, lease.startDate, lease.endDate)) {
    findings.push(finding('LG-R002', 'operations', 'high', 'Coverage does not overlap lease term', `${lease.startDate} to ${lease.endDate}`, `${policy.coverageStart || '?'} to ${policy.coverageEnd || '?'}`, 'Insurance coverage outside the lease term can create invalid costs or gaps.', 'Verify policy dates or lease dates.'));
  }

  const premiumVariance = money(Number(invoice.amount || 0) - Number(policy.premium || 0));
  if (premiumVariance !== 0) {
    findings.push(finding('LG-R003', 'intelligence', 'medium', 'Premium variance detected', `${policy.currency || lease.currency} ${money(policy.premium).toFixed(2)}`, `${invoice.currency || '?'} ${money(invoice.amount).toFixed(2)}`, `Invoice differs from the approved policy premium by ${Math.abs(premiumVariance).toFixed(2)}.`, 'Investigate renewal, endorsement, tax or data-entry reasons before approval.'));
  }

  const currencies = [lease.currency, policy.currency, invoice.currency].filter(Boolean).map(upper);
  if (new Set(currencies).size > 1 || currencies.length < 3) {
    findings.push(finding('LG-R004', 'intelligence', 'high', 'Currency reconciliation failed', 'Lease, policy and invoice use the same approved currency', currencies.join(' / ') || 'Missing', 'Currency mismatch can misstate liabilities and expense.', 'Verify source documents and approved FX treatment.'));
  }

  if (Boolean(invoice.duplicateReference)) {
    findings.push(finding('LG-R005', 'intelligence', 'critical', 'Potential duplicate invoice', 'Unique invoice/reference not previously processed', invoice.invoiceId || 'Unknown invoice', 'Duplicate payment is a material financial-control risk.', 'Block release and investigate prior invoices, postings and payments.'));
  }

  const evidenceTypes = new Set((Array.isArray(evidence) ? evidence : []).filter((item) => item?.verified !== false).map((item) => item.type));
  const missingEvidence = ['policy-schedule', 'invoice'].filter((required) => !evidenceTypes.has(required));
  if (missingEvidence.length) {
    findings.push(finding('LG-R006', 'operations', 'medium', 'Evidence pack incomplete', 'Verified policy schedule and invoice', `Missing: ${missingEvidence.join(', ')}`, 'The reviewer must be able to reconstruct why a payment or posting was approved.', 'Obtain and verify the missing evidence.'));
  }

  const severityWeight = { low: 1, medium: 2, high: 5, critical: 10 };
  const riskScore = Math.min(100, findings.reduce((sum, item) => sum + severityWeight[item.severity] * 5, 0));
  const blockers = findings.filter((item) => ['high', 'critical'].includes(item.severity));

  const monthlyAccrual = money(Number(policy.premium || 0) / 12);
  const proposal = {
    proposalId: `LG-PROP-${caseData.caseId || 'UNSET'}`,
    status: 'DRAFT_NOT_RELEASED',
    targetSystem: 'erp-adapter',
    companyCode: lease.companyCode || null,
    leaseId: lease.leaseId || null,
    policyNumber: policy.policyNumber || null,
    invoiceId: invoice.invoiceId || null,
    postingDate: invoice.invoiceDate || null,
    currency: invoice.currency || policy.currency || lease.currency || null,
    amount: money(invoice.amount),
    debit: { glAccount: policy.glAccount || null, costCenter: policy.costCenter || null, amount: money(invoice.amount) },
    credit: { counterparty: invoice.provider || policy.provider || null, amount: money(invoice.amount) },
    monthlyAccrual,
    generatedBy: 'leaseguard-control-engine'
  };

  return {
    product: 'Palm92 LeaseGuard AI',
    version: LEASEGUARD_VERSION,
    caseId: caseData.caseId || null,
    status: blockers.length ? 'REVIEW_REQUIRED' : findings.length ? 'READY_WITH_WARNING' : 'READY_FOR_HUMAN_APPROVAL',
    riskScore,
    findings,
    blockingFindingCount: blockers.length,
    premiumVariance,
    proposal,
    layers: {
      operations: { lease: lease.leaseId || null, policy: policy.policyNumber || null, invoice: invoice.invoiceId || null, evidenceCount: Array.isArray(evidence) ? evidence.length : 0 },
      intelligence: { reconciled: true, anomalyCount: findings.filter((item) => item.layer === 'intelligence').length, premiumVariance },
      governance: { humanApprovalRequired: true, segregationOfDutiesRequired: true, releaseBlocked: blockers.length > 0 }
    },
    explainability: findings.map((item) => ({ ruleId: item.ruleId, because: item.explanation, nextAction: item.nextAction })),
    boundary: 'This portfolio module prepares and tests a financial-control decision. It does not connect to a live ERP or execute a production accounting entry.'
  };
}

export function decideLeaseGuardCase(analysis, decision = {}) {
  if (!analysis?.proposal) throw new Error('A LeaseGuard analysis with a proposal is required');

  const actor = text(decision.actor);
  const actorRole = text(decision.actorRole || 'reviewer');
  const approved = Boolean(decision.approved);
  const maker = text(decision.maker || decision.createdBy || 'operations.user');
  const comment = text(decision.comment);
  const timestamp = new Date().toISOString();

  const auditBase = {
    eventId: `LG-AUD-${Date.now()}`,
    caseId: analysis.caseId,
    actor: actor || null,
    actorRole,
    maker,
    approved,
    comment,
    timestamp,
    riskScore: analysis.riskScore,
    blockingFindingCount: analysis.blockingFindingCount
  };

  if (!approved) {
    return {
      executed: false,
      status: 'NOT_APPROVED',
      reason: 'Reviewer did not approve release.',
      auditEvent: { ...auditBase, outcome: 'not-approved' }
    };
  }

  if (!actor) {
    return {
      executed: false,
      status: 'APPROVER_REQUIRED',
      reason: 'A named human approver is required.',
      auditEvent: { ...auditBase, outcome: 'blocked-missing-approver' }
    };
  }

  if (actor === maker) {
    return {
      executed: false,
      status: 'BLOCKED_BY_SOD',
      reason: 'Segregation of duties prevents the maker from approving their own consequential posting proposal.',
      auditEvent: { ...auditBase, outcome: 'blocked-segregation-of-duties' }
    };
  }

  if (analysis.blockingFindingCount > 0) {
    return {
      executed: false,
      status: 'BLOCKED_BY_CONTROLS',
      reason: 'High or critical control findings must be resolved before release.',
      auditEvent: { ...auditBase, outcome: 'blocked-control-findings' }
    };
  }

  return {
    executed: true,
    status: 'APPROVED_FOR_ERP_HANDOFF',
    reason: 'Human approval and segregation-of-duties checks passed. A production deployment would now invoke the configured ERP adapter.',
    approvedProposal: { ...analysis.proposal, status: 'APPROVED_FOR_INTERFACE', approvedBy: actor, approvedAt: timestamp },
    auditEvent: { ...auditBase, outcome: 'approved-for-erp-handoff' }
  };
}

export function getLeaseGuardBootstrap() {
  return {
    product: 'Palm92 LeaseGuard AI',
    tagline: 'AI-powered Lease, Insurance & Financial Control Automation',
    version: LEASEGUARD_VERSION,
    layers: [
      { name: 'Operations', capabilities: ['Lease management', 'Invoices', 'Policies', 'Renewals', 'Evidence'] },
      { name: 'Intelligence', capabilities: ['Document extraction', 'Matching', 'Anomaly detection', 'Reconciliation', 'AI investigation'] },
      { name: 'Governance', capabilities: ['Approval gates', 'Segregation of duties', 'Audit trail', 'Policy controls', 'Explainability'] }
    ],
    connectors: LEASEGUARD_CONNECTORS,
    rules: LEASEGUARD_RULES,
    sampleCases: LEASEGUARD_SAMPLE_CASES,
    architecturePrinciple: 'AI understands. Deterministic controls verify. Humans authorise.'
  };
}

export const LEASEGUARD_TEST_CASES = Object.freeze([
  { id: 'LG-T001', priority: 'P1', scenario: 'Clean lease-policy-invoice case', expected: 'READY_FOR_HUMAN_APPROVAL with draft proposal only.' },
  { id: 'LG-T002', priority: 'P1', scenario: 'Duplicate invoice', expected: 'LG-R005 critical finding and release blocked.' },
  { id: 'LG-T003', priority: 'P1', scenario: 'Lease-policy link mismatch', expected: 'LG-R001 high finding and release blocked.' },
  { id: 'LG-T004', priority: 'P1', scenario: 'Currency mismatch', expected: 'LG-R004 high finding and release blocked.' },
  { id: 'LG-T005', priority: 'P2', scenario: 'Premium variance only', expected: 'LG-R003 finding with explainable variance.' },
  { id: 'LG-T006', priority: 'P2', scenario: 'Missing policy evidence', expected: 'LG-R006 warning and manual follow-up.' },
  { id: 'LG-T007', priority: 'P1', scenario: 'No named approver', expected: 'APPROVER_REQUIRED and no ERP handoff.' },
  { id: 'LG-T008', priority: 'P1', scenario: 'Maker attempts self-approval', expected: 'BLOCKED_BY_SOD.' },
  { id: 'LG-T009', priority: 'P1', scenario: 'Approver tries to release case with blockers', expected: 'BLOCKED_BY_CONTROLS.' },
  { id: 'LG-T010', priority: 'P1', scenario: 'Independent approver releases clean case', expected: 'APPROVED_FOR_ERP_HANDOFF with audit event.' },
  { id: 'LG-T011', priority: 'P2', scenario: 'Document text extraction', expected: 'Draft structured fields plus reviewRequired=true.' },
  { id: 'LG-T012', priority: 'P2', scenario: 'ERP adapter portability', expected: 'SAP, Oracle, Dynamics and generic connector contracts are exposed without production credentials.' }
]);
