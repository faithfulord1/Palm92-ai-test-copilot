import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeFirefighterSession,
  getSampleFirefighterSessions,
  recordControllerDecision,
  FIREFIGHTER_TEST_CASES
} from '../lib/firefighter.mjs';

test('ships at least 18 Firefighter test cases', () => {
  assert.ok(FIREFIGHTER_TEST_CASES.length >= 18);
});

test('clean payment demo is low attention', () => {
  const session = getSampleFirefighterSessions()[0];
  const result = analyzeFirefighterSession(session);
  assert.equal(result.valid, true);
  assert.equal(result.attention, 'Medium');
  assert.ok(result.findings.some((f) => f.ruleId === 'FF-R004'));
  assert.ok(!result.findings.some((f) => ['FF-R001','FF-R002','FF-R003','FF-R005','FF-R006','FF-R008'].includes(f.ruleId)));
});

test('missing ticket is identified', () => {
  const session = getSampleFirefighterSessions().find((s) => s.id === 'FF-DEMO-002');
  const result = analyzeFirefighterSession(session);
  assert.ok(result.findings.some((f) => f.ruleId === 'FF-R002'));
});

test('outside approved window is high attention', () => {
  const session = getSampleFirefighterSessions().find((s) => s.id === 'FF-DEMO-003');
  const result = analyzeFirefighterSession(session);
  assert.equal(result.attention, 'High');
  assert.ok(result.findings.some((f) => f.ruleId === 'FF-R003'));
});

test('scope mismatch drafts explainable controller question', () => {
  const session = getSampleFirefighterSessions().find((s) => s.id === 'FF-DEMO-004');
  const result = analyzeFirefighterSession(session);
  const mismatch = result.findings.find((f) => f.ruleId === 'FF-R005');
  assert.ok(mismatch);
  assert.match(mismatch.controllerQuestion, /stated reason/i);
  assert.match(mismatch.controllerQuestion, /explain why/i);
});

test('additional activity without justification is identified', () => {
  const session = getSampleFirefighterSessions().find((s) => s.id === 'FF-DEMO-005');
  const result = analyzeFirefighterSession(session);
  assert.ok(result.findings.some((f) => f.ruleId === 'FF-R006'));
});

test('self-review concern is critical and blocks completion', () => {
  const session = getSampleFirefighterSessions().find((s) => s.id === 'FF-DEMO-006');
  const result = analyzeFirefighterSession(session);
  const sod = result.findings.find((f) => f.ruleId === 'FF-R008');
  assert.equal(sod.severity, 'critical');
  const decision = recordControllerDecision(session, { actor: session.firefighterUser, action: 'complete', confirmed: true });
  assert.equal(decision.allowed, false);
  assert.equal(decision.status, 'SOD_BLOCKED');
});

test('completion requires explicit human confirmation', () => {
  const session = getSampleFirefighterSessions()[0];
  const unconfirmed = recordControllerDecision(session, { actor: session.controller, action: 'complete', confirmed: false });
  assert.equal(unconfirmed.allowed, false);
  assert.equal(unconfirmed.status, 'HUMAN_CONFIRMATION_REQUIRED');
  const confirmed = recordControllerDecision(session, { actor: session.controller, action: 'complete', comment: 'Reviewed evidence', confirmed: true });
  assert.equal(confirmed.allowed, true);
  assert.equal(confirmed.status, 'REVIEW_COMPLETED');
  assert.equal(confirmed.auditEvent.humanConfirmed, true);
});
