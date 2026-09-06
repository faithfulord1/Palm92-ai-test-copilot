import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeInsuranceInvoice,
  decideInsurancePosting,
  REFX_SAMPLE_INVOICES
} from '../lib/refx-insurance.mjs';

test('clean insurance invoice is ready for human approval', () => {
  const result = analyzeInsuranceInvoice({ invoice: REFX_SAMPLE_INVOICES.clean });
  assert.equal(result.status, 'READY_FOR_HUMAN_APPROVAL');
  assert.equal(result.blockingFindingCount, 0);
  assert.equal(result.canPreparePosting, true);
  assert.equal(result.postingProposal.monthlyAccrual, 100);
});

test('risky insurance invoice is blocked by duplicate and variance controls', () => {
  const result = analyzeInsuranceInvoice({ invoice: REFX_SAMPLE_INVOICES.anomaly });
  assert.equal(result.status, 'REVIEW_REQUIRED');
  assert.ok(result.blockingFindingCount > 0);
  assert.ok(result.findings.some((item) => item.ruleId === 'RX-R005'));
  assert.equal(result.variance, 60);
});

test('clean posting cannot execute without explicit approval', () => {
  const analysis = analyzeInsuranceInvoice({ invoice: REFX_SAMPLE_INVOICES.clean });
  const decision = decideInsurancePosting(analysis, { approved: false });
  assert.equal(decision.executed, false);
  assert.equal(decision.status, 'AWAITING_HUMAN_APPROVAL');
});

test('clean posting can be approved by named human', () => {
  const analysis = analyzeInsuranceInvoice({ invoice: REFX_SAMPLE_INVOICES.clean });
  const decision = decideInsurancePosting(analysis, { approved: true, approver: 'Faith Wright' });
  assert.equal(decision.executed, true);
  assert.equal(decision.status, 'APPROVED_FOR_SAP_POSTING');
  assert.equal(decision.approver, 'Faith Wright');
});

test('critical findings cannot be overridden by approval click', () => {
  const analysis = analyzeInsuranceInvoice({ invoice: REFX_SAMPLE_INVOICES.anomaly });
  const decision = decideInsurancePosting(analysis, { approved: true, approver: 'Faith Wright' });
  assert.equal(decision.executed, false);
  assert.equal(decision.status, 'BLOCKED_BY_CONTROLS');
});
