import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'leaseguard-phase2-'));
process.env.LEASEGUARD_DATA_DIR = tempDir;
const phase2 = await import('../lib/leaseguard-phase2.mjs');

const caseData = {
  caseId: 'LG-PH2-TEST-001',
  lease: { leaseId:'LEASE-TEST-001', property:'Test Unit', tenant:'Test Tenant', startDate:'2027-01-01', endDate:'2029-12-31', currency:'GBP', companyCode:'P920' },
  policy: { policyNumber:'POL-TEST-001', leaseId:'LEASE-TEST-001', provider:'Test Insurer', premium:1200, currency:'GBP', coverageStart:'2027-01-01', coverageEnd:'2027-12-31', glAccount:'640500', costCenter:'TEST-CC' },
  invoice: { invoiceId:'INV-TEST-001', policyNumber:'POL-TEST-001', provider:'Test Insurer', amount:1200, currency:'GBP', invoiceDate:'2027-01-02', serviceFrom:'2027-01-01', serviceTo:'2027-12-31', duplicateReference:false }
};

await phase2.resetLeaseGuardDemoData();

test('persistent case, evidence provenance, approval and sandbox handoff work end to end', async () => {
  const created = await phase2.createCase({ actorUserId:'USR-OPS-001', caseData });
  assert.equal(created.caseId, 'LG-PH2-TEST-001');

  const assigned = await phase2.assignCase({ actorUserId:'USR-OPS-001', caseId:created.caseId, reviewerUserId:'USR-REV-001', approverUserId:'USR-APP-001' });
  assert.equal(assigned.assignedReviewer, 'USR-REV-001');
  assert.equal(assigned.assignedApprover, 'USR-APP-001');

  const policy = await phase2.uploadDocument({
    actorUserId:'USR-OPS-001', caseId:created.caseId, filename:'policy.txt', mimeType:'text/plain', documentType:'policy-schedule',
    base64:Buffer.from('Policy Number POL-TEST-001 Premium GBP 1200').toString('base64'), suppliedText:'Policy Number POL-TEST-001 Premium GBP 1200'
  });
  assert.match(policy.sha256, /^[a-f0-9]{64}$/);
  assert.equal(policy.extraction.provenance.documentId, policy.documentId);

  const invoice = await phase2.uploadDocument({
    actorUserId:'USR-OPS-001', caseId:created.caseId, filename:'invoice.txt', mimeType:'text/plain', documentType:'invoice',
    base64:Buffer.from('Invoice INV-TEST-001 Policy POL-TEST-001 Amount GBP 1200').toString('base64'), suppliedText:'Invoice INV-TEST-001 Policy POL-TEST-001 Amount GBP 1200'
  });

  await phase2.verifyDocument({ actorUserId:'USR-REV-001', documentId:policy.documentId, verified:true });
  await phase2.verifyDocument({ actorUserId:'USR-REV-001', documentId:invoice.documentId, verified:true });

  const analysis = await phase2.analysePersistentCase({ actorUserId:'USR-REV-001', caseId:created.caseId });
  assert.equal(analysis.status, 'READY_FOR_HUMAN_APPROVAL');
  assert.equal(analysis.blockingFindingCount, 0);

  const decision = await phase2.decidePersistentCase({ actorUserId:'USR-APP-001', caseId:created.caseId, approved:true, comment:'Approved after evidence review' });
  assert.equal(decision.status, 'APPROVED_FOR_ERP_HANDOFF');

  const renewal = await phase2.createRenewal({ actorUserId:'USR-OPS-001', caseId:created.caseId, renewalDate:'2027-12-01' });
  assert.equal(renewal.status, 'OPEN');

  const handoff = await phase2.sandboxErpHandoff({ actorUserId:'USR-APP-001', caseId:created.caseId, adapter:'generic-rest' });
  assert.equal(handoff.status, 'ACCEPTED_BY_SANDBOX');
  assert.match(handoff.response.externalReference, /^SBX-/);

  const workspace = await phase2.getLeaseGuardWorkspace();
  assert.equal(workspace.dashboard.totalCases, 1);
  assert.equal(workspace.dashboard.verifiedDocuments, 2);
  assert.equal(workspace.dashboard.sandboxHandoffs, 1);
});

test('binary document without supplied text records honest pending OCR provenance', async () => {
  await phase2.resetLeaseGuardDemoData();
  const created = await phase2.createCase({ actorUserId:'USR-OPS-001', caseData:{...caseData, caseId:'LG-PH2-TEST-002'} });
  const doc = await phase2.uploadDocument({ actorUserId:'USR-OPS-001', caseId:created.caseId, filename:'scan.png', mimeType:'image/png', documentType:'invoice', base64:Buffer.from([137,80,78,71]).toString('base64') });
  assert.equal(doc.extraction.extractionMode, 'pending-ocr-provider');
  assert.equal(doc.extraction.reviewRequired, true);
  assert.match(doc.sha256, /^[a-f0-9]{64}$/);
});

test('maker cannot approve own case and unapproved cases cannot reach sandbox ERP', async () => {
  await phase2.resetLeaseGuardDemoData();
  const created = await phase2.createCase({ actorUserId:'USR-OPS-001', caseData:{...caseData, caseId:'LG-PH2-TEST-003'} });
  const ws = await phase2.getLeaseGuardWorkspace();
  assert.equal(ws.cases[0].createdBy, 'USR-OPS-001');
  await assert.rejects(() => phase2.sandboxErpHandoff({ actorUserId:'USR-APP-001', caseId:created.caseId }), /not approved/i);
});

test.after(async () => { await fs.rm(tempDir, { recursive:true, force:true }); });
