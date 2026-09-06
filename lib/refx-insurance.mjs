const money = (value) => Number(Number(value || 0).toFixed(2));

export const REFX_SAMPLE_CONTRACT = Object.freeze({
  contractId: 'RE-FX-CL-1001',
  companyCode: 'P920',
  businessPartner: 'Northbridge Property Ltd',
  object: 'London Commercial Unit 04',
  leaseStart: '2027-01-01',
  leaseEnd: '2029-12-31',
  currency: 'GBP',
  monthlyRent: 10000,
  insurance: {
    policyNumber: 'POL-P92-2027-001',
    provider: 'Example Commercial Insurance Ltd',
    annualPremium: 1200,
    coverageStart: '2027-01-01',
    coverageEnd: '2027-12-31',
    postingGl: '640500',
    costCenter: 'PROP-LON-04'
  }
});

export const REFX_SAMPLE_INVOICES = Object.freeze({
  clean: {
    invoiceId: 'INV-INS-2027-001',
    policyNumber: 'POL-P92-2027-001',
    provider: 'Example Commercial Insurance Ltd',
    invoiceDate: '2027-01-02',
    serviceFrom: '2027-01-01',
    serviceTo: '2027-12-31',
    currency: 'GBP',
    amount: 1200,
    duplicateReference: false,
    evidence: ['policy-schedule.pdf', 'invoice.pdf']
  },
  anomaly: {
    invoiceId: 'INV-INS-2027-009',
    policyNumber: 'POL-P92-2027-001',
    provider: 'Example Commercial Insurance Ltd',
    invoiceDate: '2027-01-02',
    serviceFrom: '2027-01-01',
    serviceTo: '2027-12-31',
    currency: 'GBP',
    amount: 1260,
    duplicateReference: true,
    evidence: ['invoice.pdf']
  }
});

export const REFX_INSURANCE_RULES = Object.freeze([
  { id: 'RX-R001', name: 'Policy match', severity: 'high' },
  { id: 'RX-R002', name: 'Currency match', severity: 'high' },
  { id: 'RX-R003', name: 'Premium amount match', severity: 'medium' },
  { id: 'RX-R004', name: 'Coverage period match', severity: 'high' },
  { id: 'RX-R005', name: 'Duplicate invoice prevention', severity: 'critical' },
  { id: 'RX-R006', name: 'Evidence completeness', severity: 'medium' },
  { id: 'RX-R007', name: 'Posting date inside lease', severity: 'high' },
  { id: 'RX-R008', name: 'Human approval before posting', severity: 'critical' }
]);

function finding(ruleId, title, severity, observed, expected, recommendation) {
  return { ruleId, title, severity, observed, expected, recommendation };
}

function inRange(date, start, end) {
  const value = new Date(`${date}T00:00:00Z`).getTime();
  return value >= new Date(`${start}T00:00:00Z`).getTime() && value <= new Date(`${end}T00:00:00Z`).getTime();
}

export function analyzeInsuranceInvoice({ contract = REFX_SAMPLE_CONTRACT, invoice = REFX_SAMPLE_INVOICES.clean } = {}) {
  const findings = [];
  const expected = contract.insurance;

  if (invoice.policyNumber !== expected.policyNumber) {
    findings.push(finding('RX-R001', 'Policy number does not match the lease insurance condition', 'high', invoice.policyNumber, expected.policyNumber, 'Hold the posting and verify the policy against the lease contract.'));
  }

  if (invoice.currency !== contract.currency) {
    findings.push(finding('RX-R002', 'Invoice currency differs from the contract currency', 'high', invoice.currency, contract.currency, 'Verify whether currency conversion is contractually permitted before posting.'));
  }

  const variance = money(invoice.amount - expected.annualPremium);
  if (variance !== 0) {
    findings.push(finding('RX-R003', 'Insurance premium differs from the configured annual premium', 'medium', `${invoice.currency} ${money(invoice.amount).toFixed(2)}`, `${contract.currency} ${money(expected.annualPremium).toFixed(2)}`, `Investigate the ${contract.currency} ${Math.abs(variance).toFixed(2)} variance and amend the condition only with authorised evidence.`));
  }

  if (invoice.serviceFrom !== expected.coverageStart || invoice.serviceTo !== expected.coverageEnd) {
    findings.push(finding('RX-R004', 'Insurance service period does not match expected coverage', 'high', `${invoice.serviceFrom} to ${invoice.serviceTo}`, `${expected.coverageStart} to ${expected.coverageEnd}`, 'Verify renewal dates, endorsements or policy changes before posting.'));
  }

  if (invoice.duplicateReference) {
    findings.push(finding('RX-R005', 'Potential duplicate insurance invoice', 'critical', invoice.invoiceId, 'Unique unposted invoice reference', 'Block automatic posting and investigate previous documents or payment records.'));
  }

  const evidence = Array.isArray(invoice.evidence) ? invoice.evidence : [];
  const hasPolicy = evidence.some((item) => /policy/i.test(item));
  const hasInvoice = evidence.some((item) => /invoice/i.test(item));
  if (!hasPolicy || !hasInvoice) {
    findings.push(finding('RX-R006', 'Evidence pack is incomplete', 'medium', evidence.join(', ') || 'No evidence', 'Policy schedule and invoice', 'Request the missing document before final approval.'));
  }

  if (!inRange(invoice.invoiceDate, contract.leaseStart, contract.leaseEnd)) {
    findings.push(finding('RX-R007', 'Invoice date falls outside the lease term', 'high', invoice.invoiceDate, `${contract.leaseStart} to ${contract.leaseEnd}`, 'Do not create the posting proposal until the date is resolved.'));
  }

  const severityWeight = { medium: 2, high: 5, critical: 10 };
  const riskScore = Math.min(100, findings.reduce((sum, item) => sum + (severityWeight[item.severity] || 1), 0) * 5);
  const blockingFindings = findings.filter((item) => ['high', 'critical'].includes(item.severity));
  const status = blockingFindings.length ? 'REVIEW_REQUIRED' : findings.length ? 'READY_WITH_WARNING' : 'READY_FOR_HUMAN_APPROVAL';

  const monthlyAccrual = money(expected.annualPremium / 12);
  const postingProposal = {
    documentType: 'Insurance expense proposal',
    companyCode: contract.companyCode,
    contractId: contract.contractId,
    invoiceId: invoice.invoiceId,
    postingDate: invoice.invoiceDate,
    currency: invoice.currency,
    amount: money(invoice.amount),
    debit: { glAccount: expected.postingGl, costCenter: expected.costCenter, amount: money(invoice.amount) },
    credit: { account: 'INSURANCE_VENDOR', provider: invoice.provider, amount: money(invoice.amount) },
    monthlyAccrual,
    status: 'DRAFT_NOT_POSTED'
  };

  return {
    scenario: 'SAP RE-FX commercial lease insurance pre-posting control',
    status,
    riskScore,
    contract,
    invoice,
    expectedInsurance: expected,
    variance,
    findings,
    blockingFindingCount: blockingFindings.length,
    canPreparePosting: blockingFindings.length === 0,
    postingProposal,
    governance: 'AI/rules may analyse, reconcile and prepare a posting proposal. Final posting requires an authorised human decision.',
    disclaimer: 'Synthetic educational portfolio scenario. No live SAP connection and no accounting entry is posted.'
  };
}

export function decideInsurancePosting(analysis, { approved = false, approver = '', comment = '' } = {}) {
  if (!analysis || typeof analysis !== 'object') throw new Error('Analysis is required');

  const timestamp = new Date().toISOString();
  if (analysis.blockingFindingCount > 0) {
    return {
      executed: false,
      status: 'BLOCKED_BY_CONTROLS',
      reason: 'High or critical control findings must be resolved before posting approval.',
      approver: approver || null,
      comment,
      timestamp
    };
  }

  if (!approved || !String(approver).trim()) {
    return {
      executed: false,
      status: 'AWAITING_HUMAN_APPROVAL',
      reason: 'The system can prepare the insurance posting but cannot execute it without explicit authorised human approval.',
      approver: null,
      comment,
      timestamp
    };
  }

  return {
    executed: true,
    status: 'APPROVED_FOR_SAP_POSTING',
    reason: 'Human approval recorded. In a production integration this would now call the approved SAP posting interface.',
    approver: String(approver).trim(),
    comment,
    proposal: { ...analysis.postingProposal, status: 'APPROVED_FOR_INTERFACE' },
    timestamp,
    auditEventId: `RX-AUD-${Date.now()}`
  };
}

export const REFX_INSURANCE_TEST_CASES = Object.freeze([
  { id: 'RX-T001', priority: 'P1', test: 'Matching policy, premium, dates, currency and evidence produces a posting proposal.', expected: 'READY_FOR_HUMAN_APPROVAL and no automatic posting.' },
  { id: 'RX-T002', priority: 'P1', test: 'Duplicate invoice reference is detected.', expected: 'Critical finding RX-R005 and posting blocked.' },
  { id: 'RX-T003', priority: 'P1', test: 'Wrong policy number is supplied.', expected: 'High finding RX-R001 and posting blocked.' },
  { id: 'RX-T004', priority: 'P1', test: 'Wrong currency is supplied.', expected: 'High finding RX-R002 and posting blocked.' },
  { id: 'RX-T005', priority: 'P2', test: 'Premium differs from configured annual premium.', expected: 'Variance is exposed with RX-R003 for investigation.' },
  { id: 'RX-T006', priority: 'P1', test: 'Coverage dates differ from policy condition.', expected: 'High finding RX-R004 and posting blocked.' },
  { id: 'RX-T007', priority: 'P2', test: 'Policy schedule evidence is missing.', expected: 'RX-R006 warning and human review required.' },
  { id: 'RX-T008', priority: 'P1', test: 'Invoice date is outside lease term.', expected: 'High finding RX-R007 and posting blocked.' },
  { id: 'RX-T009', priority: 'P1', test: 'Clean proposal is submitted without human approval.', expected: 'AWAITING_HUMAN_APPROVAL and no execution.' },
  { id: 'RX-T010', priority: 'P1', test: 'Clean proposal is explicitly approved by authorised human.', expected: 'APPROVED_FOR_SAP_POSTING with audit event.' },
  { id: 'RX-T011', priority: 'P1', test: 'Human attempts approval while critical finding remains.', expected: 'BLOCKED_BY_CONTROLS.' },
  { id: 'RX-T012', priority: 'P2', test: 'Annual premium is divided into monthly accrual.', expected: 'Monthly accrual equals annual premium / 12 with currency rounding.' }
]);
