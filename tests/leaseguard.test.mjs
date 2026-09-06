import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEASEGUARD_SAMPLE_CASES,
  extractInsuranceDocument,
  reconcileLeaseInsurance,
  decideLeaseGuardCase,
  getLeaseGuardBootstrap
} from '../lib/leaseguard.mjs';

test('clean case is ready for human approval', () => {
  const result = reconcileLeaseInsurance(LEASEGUARD_SAMPLE_CASES.clean);
  assert.equal(result.status, 'READY_FOR_HUMAN_APPROVAL');
  assert.equal(result.blockingFindingCount, 0);
  assert.equal(result.proposal.status, 'DRAFT_NOT_RELEASED');
});

test('risky case blocks release because duplicate invoice is critical', () => {
  const result = reconcileLeaseInsurance(LEASEGUARD_SAMPLE_CASES.anomaly);
  assert.equal(result.status, 'REVIEW_REQUIRED');
  assert.ok(result.findings.some((item) => item.ruleId === 'LG-R005' && item.severity === 'critical'));
  assert.ok(result.blockingFindingCount > 0);
});

test('maker cannot self approve clean case', () => {
  const analysis = reconcileLeaseInsurance(LEASEGUARD_SAMPLE_CASES.clean);
  const decision = decideLeaseGuardCase(analysis, {
    approved: true,
    actor: 'operations.user',
    actorRole: 'maker',
    maker: 'operations.user'
  });
  assert.equal(decision.executed, false);
  assert.equal(decision.status, 'BLOCKED_BY_SOD');
});

test('independent reviewer can approve clean case for ERP handoff', () => {
  const analysis = reconcileLeaseInsurance(LEASEGUARD_SAMPLE_CASES.clean);
  const decision = decideLeaseGuardCase(analysis, {
    approved: true,
    actor: 'financial.controller',
    actorRole: 'financial-controller',
    maker: 'operations.user'
  });
  assert.equal(decision.executed, true);
  assert.equal(decision.status, 'APPROVED_FOR_ERP_HANDOFF');
  assert.equal(decision.auditEvent.outcome, 'approved-for-erp-handoff');
});

test('control blockers cannot be overridden by approval', () => {
  const analysis = reconcileLeaseInsurance(LEASEGUARD_SAMPLE_CASES.anomaly);
  const decision = decideLeaseGuardCase(analysis, {
    approved: true,
    actor: 'financial.controller',
    actorRole: 'financial-controller',
    maker: 'operations.user'
  });
  assert.equal(decision.executed, false);
  assert.equal(decision.status, 'BLOCKED_BY_CONTROLS');
});

test('document extraction returns draft structured fields and requires review', () => {
  const result = extractInsuranceDocument('Policy Number: POL-P92-2027-001\nInvoice Number: INV-INS-2027-001\nPremium: GBP 1200\nCoverage: 2027-01-01 to 2027-12-31');
  assert.equal(result.fields.policyNumber, 'POL-P92-2027-001');
  assert.equal(result.fields.invoiceId, 'INV-INS-2027-001');
  assert.equal(result.fields.amount, 1200);
  assert.equal(result.fields.currency, 'GBP');
  assert.equal(result.reviewRequired, true);
});

test('bootstrap exposes three layers and multiple ERP adapter blueprints', () => {
  const bootstrap = getLeaseGuardBootstrap();
  assert.equal(bootstrap.layers.length, 3);
  assert.ok(bootstrap.connectors.some((item) => item.id === 'sap-s4hana'));
  assert.ok(bootstrap.connectors.some((item) => item.id === 'oracle-fusion'));
  assert.ok(bootstrap.connectors.some((item) => item.id === 'dynamics-365'));
});
