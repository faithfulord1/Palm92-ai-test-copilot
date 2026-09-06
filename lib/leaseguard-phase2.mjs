import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { reconcileLeaseInsurance, decideLeaseGuardCase, extractInsuranceDocument } from './leaseguard.mjs';

const DATA_DIR = path.resolve(process.env.LEASEGUARD_DATA_DIR || './data/leaseguard');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}-${crypto.randomUUID()}`;
const clone = (value) => JSON.parse(JSON.stringify(value));

export const ROLES = Object.freeze({
  operations: { label: 'Operations', permissions: ['case:create','case:update','document:upload','renewal:create','analysis:run'] },
  reviewer: { label: 'Reviewer', permissions: ['case:read','analysis:run','decision:review','evidence:read'] },
  approver: { label: 'Approver', permissions: ['case:read','decision:approve','erp:handoff'] },
  auditor: { label: 'Auditor', permissions: ['case:read','audit:read','evidence:read'] },
  admin: { label: 'Administrator', permissions: ['*'] }
});

const defaultState = () => ({
  schemaVersion: 1,
  users: [
    { userId: 'USR-OPS-001', name: 'Olivia Operations', role: 'operations', active: true },
    { userId: 'USR-REV-001', name: 'Ravi Reviewer', role: 'reviewer', active: true },
    { userId: 'USR-APP-001', name: 'Amina Approver', role: 'approver', active: true },
    { userId: 'USR-AUD-001', name: 'Alex Auditor', role: 'auditor', active: true }
  ],
  cases: [],
  documents: [],
  renewals: [],
  audit: [],
  erpHandoffs: []
});

async function ensureStore() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  try { await fs.access(DB_FILE); }
  catch { await fs.writeFile(DB_FILE, JSON.stringify(defaultState(), null, 2), 'utf8'); }
}

async function readState() {
  await ensureStore();
  return JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
}

async function writeState(state) {
  await ensureStore();
  const tmp = `${DB_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), 'utf8');
  await fs.rename(tmp, DB_FILE);
}

function auditEvent({ actor, action, entityType, entityId, detail = {} }) {
  return { auditId: id('AUD'), timestamp: now(), actor, action, entityType, entityId, detail };
}

function requireUser(state, userId) {
  const user = state.users.find((u) => u.userId === userId && u.active);
  if (!user) throw new Error('Active user not found');
  return user;
}

function hasPermission(user, permission) {
  const role = ROLES[user.role];
  return Boolean(role && (role.permissions.includes('*') || role.permissions.includes(permission)));
}

function assertPermission(user, permission) {
  if (!hasPermission(user, permission)) throw new Error(`Role ${user.role} lacks permission ${permission}`);
}

export async function getLeaseGuardWorkspace() {
  const state = await readState();
  return {
    users: clone(state.users),
    roles: ROLES,
    cases: clone(state.cases),
    documents: clone(state.documents),
    renewals: clone(state.renewals),
    audit: clone(state.audit.slice(-100)),
    erpHandoffs: clone(state.erpHandoffs),
    dashboard: buildDashboard(state),
    persistence: { mode: 'json-file-store', dataDirectory: DATA_DIR, productionRecommendation: 'PostgreSQL/Supabase + object storage' }
  };
}

export async function createCase({ actorUserId, caseData }) {
  const state = await readState();
  const actor = requireUser(state, actorUserId);
  assertPermission(actor, 'case:create');

  const caseId = caseData?.caseId || id('CASE');
  if (state.cases.some((c) => c.caseId === caseId)) throw new Error('Case already exists');

  const record = {
    caseId,
    status: 'OPEN',
    createdAt: now(),
    updatedAt: now(),
    createdBy: actor.userId,
    assignedReviewer: null,
    assignedApprover: null,
    caseData: clone(caseData || {}),
    latestAnalysis: null,
    latestDecision: null,
    renewalIds: [],
    documentIds: []
  };

  state.cases.push(record);
  state.audit.push(auditEvent({ actor: actor.userId, action: 'case.created', entityType: 'case', entityId: caseId }));
  await writeState(state);
  return clone(record);
}

export async function assignCase({ actorUserId, caseId, reviewerUserId, approverUserId }) {
  const state = await readState();
  const actor = requireUser(state, actorUserId);
  if (!['operations','admin'].includes(actor.role)) throw new Error('Only operations or admin can assign cases');
  const record = state.cases.find((c) => c.caseId === caseId);
  if (!record) throw new Error('Case not found');

  if (reviewerUserId) {
    const reviewer = requireUser(state, reviewerUserId);
    if (!['reviewer','admin'].includes(reviewer.role)) throw new Error('Assigned reviewer must have reviewer role');
    record.assignedReviewer = reviewer.userId;
  }
  if (approverUserId) {
    const approver = requireUser(state, approverUserId);
    if (!['approver','admin'].includes(approver.role)) throw new Error('Assigned approver must have approver role');
    record.assignedApprover = approver.userId;
  }
  record.updatedAt = now();
  state.audit.push(auditEvent({ actor: actor.userId, action: 'case.assigned', entityType: 'case', entityId: caseId, detail: { reviewerUserId, approverUserId } }));
  await writeState(state);
  return clone(record);
}

function safeFilename(name = 'document.bin') {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180) || 'document.bin';
}

export async function uploadDocument({ actorUserId, caseId, filename, mimeType, base64, documentType = 'supporting-evidence', suppliedText = '' }) {
  const state = await readState();
  const actor = requireUser(state, actorUserId);
  assertPermission(actor, 'document:upload');
  const record = state.cases.find((c) => c.caseId === caseId);
  if (!record) throw new Error('Case not found');

  const bytes = Buffer.from(String(base64 || ''), 'base64');
  if (!bytes.length) throw new Error('Document payload is empty');
  if (bytes.length > 10 * 1024 * 1024) throw new Error('Document exceeds 10 MB demo limit');
  const allowed = ['application/pdf','image/png','image/jpeg','image/webp','text/plain'];
  if (!allowed.includes(mimeType)) throw new Error('Unsupported document type');

  const documentId = id('DOC');
  const storedName = `${documentId}-${safeFilename(filename)}`;
  const filePath = path.join(UPLOAD_DIR, storedName);
  await fs.writeFile(filePath, bytes);

  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  const extraction = suppliedText
    ? { ...extractInsuranceDocument(suppliedText), source: 'user-supplied-text', provenance: { documentId, sha256, mimeType, extractedAt: now(), engine: 'deterministic-demo-parser' } }
    : { extractionMode: 'pending-ocr-provider', fields: {}, confidence: 0, reviewRequired: true, source: 'binary-document', provenance: { documentId, sha256, mimeType, extractedAt: now(), engine: null }, message: 'PDF/image stored successfully. Configure a production OCR/document-AI provider to extract text automatically.' };

  const doc = {
    documentId,
    caseId,
    documentType,
    originalFilename: safeFilename(filename),
    storedName,
    mimeType,
    sizeBytes: bytes.length,
    sha256,
    uploadedBy: actor.userId,
    uploadedAt: now(),
    extraction,
    verificationStatus: 'PENDING_HUMAN_REVIEW'
  };

  state.documents.push(doc);
  record.documentIds.push(documentId);
  record.updatedAt = now();
  state.audit.push(auditEvent({ actor: actor.userId, action: 'document.uploaded', entityType: 'document', entityId: documentId, detail: { caseId, sha256, mimeType, sizeBytes: bytes.length } }));
  await writeState(state);
  return clone(doc);
}

export async function verifyDocument({ actorUserId, documentId, verified, comment = '' }) {
  const state = await readState();
  const actor = requireUser(state, actorUserId);
  if (!['reviewer','approver','admin'].includes(actor.role)) throw new Error('Only reviewer, approver or admin can verify evidence');
  const doc = state.documents.find((d) => d.documentId === documentId);
  if (!doc) throw new Error('Document not found');
  doc.verificationStatus = verified ? 'VERIFIED' : 'REJECTED';
  doc.verifiedBy = actor.userId;
  doc.verifiedAt = now();
  doc.verificationComment = String(comment || '').slice(0, 1000);
  state.audit.push(auditEvent({ actor: actor.userId, action: 'document.verified', entityType: 'document', entityId: documentId, detail: { verified: Boolean(verified), comment: doc.verificationComment } }));
  await writeState(state);
  return clone(doc);
}

export async function analysePersistentCase({ actorUserId, caseId }) {
  const state = await readState();
  const actor = requireUser(state, actorUserId);
  assertPermission(actor, 'analysis:run');
  const record = state.cases.find((c) => c.caseId === caseId);
  if (!record) throw new Error('Case not found');

  const evidence = state.documents
    .filter((d) => d.caseId === caseId)
    .map((d) => ({ id: d.documentId, type: d.documentType, name: d.originalFilename, verified: d.verificationStatus === 'VERIFIED' }));
  const analysis = reconcileLeaseInsurance({ caseData: { ...record.caseData, caseId: record.caseId, evidence } });
  record.latestAnalysis = { ...analysis, analysedBy: actor.userId, analysedAt: now() };
  record.status = analysis.blockingFindingCount ? 'REVIEW_REQUIRED' : 'AWAITING_APPROVAL';
  record.updatedAt = now();
  state.audit.push(auditEvent({ actor: actor.userId, action: 'case.analysed', entityType: 'case', entityId: caseId, detail: { riskScore: analysis.riskScore, blockingFindingCount: analysis.blockingFindingCount } }));
  await writeState(state);
  return clone(record.latestAnalysis);
}

export async function decidePersistentCase({ actorUserId, caseId, approved, comment = '' }) {
  const state = await readState();
  const actor = requireUser(state, actorUserId);
  assertPermission(actor, approved ? 'decision:approve' : 'decision:review');
  const record = state.cases.find((c) => c.caseId === caseId);
  if (!record?.latestAnalysis) throw new Error('Case must be analysed before decision');

  const decision = decideLeaseGuardCase(record.latestAnalysis, {
    approved: Boolean(approved),
    actor: actor.userId,
    actorRole: actor.role,
    maker: record.createdBy,
    comment
  });
  record.latestDecision = decision;
  record.updatedAt = now();
  record.status = decision.status === 'APPROVED_FOR_ERP_HANDOFF' ? 'APPROVED' : decision.status;
  state.audit.push(auditEvent({ actor: actor.userId, action: 'case.decision', entityType: 'case', entityId: caseId, detail: { status: decision.status, approved: Boolean(approved) } }));
  await writeState(state);
  return clone(decision);
}

export async function createRenewal({ actorUserId, caseId, renewalDate, type = 'insurance-policy', ownerUserId = null }) {
  const state = await readState();
  const actor = requireUser(state, actorUserId);
  assertPermission(actor, 'renewal:create');
  const record = state.cases.find((c) => c.caseId === caseId);
  if (!record) throw new Error('Case not found');
  if (!Date.parse(`${renewalDate}T00:00:00Z`)) throw new Error('Valid renewalDate is required');

  const renewal = {
    renewalId: id('REN'),
    caseId,
    type,
    renewalDate,
    ownerUserId: ownerUserId || actor.userId,
    status: 'OPEN',
    createdAt: now(),
    createdBy: actor.userId
  };
  state.renewals.push(renewal);
  record.renewalIds.push(renewal.renewalId);
  state.audit.push(auditEvent({ actor: actor.userId, action: 'renewal.created', entityType: 'renewal', entityId: renewal.renewalId, detail: { caseId, renewalDate } }));
  await writeState(state);
  return clone(renewal);
}

export async function sandboxErpHandoff({ actorUserId, caseId, adapter = 'generic-rest' }) {
  const state = await readState();
  const actor = requireUser(state, actorUserId);
  assertPermission(actor, 'erp:handoff');
  const record = state.cases.find((c) => c.caseId === caseId);
  if (!record) throw new Error('Case not found');
  if (record.latestDecision?.status !== 'APPROVED_FOR_ERP_HANDOFF') throw new Error('Case is not approved for ERP handoff');

  const handoff = {
    handoffId: id('ERP'),
    caseId,
    adapter,
    mode: 'sandbox',
    status: 'ACCEPTED_BY_SANDBOX',
    payload: clone(record.latestDecision.approvedProposal),
    requestedBy: actor.userId,
    requestedAt: now(),
    response: { externalReference: `SBX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, message: 'Sandbox accepted proposal. No real accounting entry was created.' }
  };
  state.erpHandoffs.push(handoff);
  record.status = 'HANDED_OFF_TO_SANDBOX';
  record.updatedAt = now();
  state.audit.push(auditEvent({ actor: actor.userId, action: 'erp.sandbox_handoff', entityType: 'case', entityId: caseId, detail: { adapter, handoffId: handoff.handoffId } }));
  await writeState(state);
  return clone(handoff);
}

export function buildDashboard(state) {
  const current = new Date();
  const inDays = (date) => Math.ceil((new Date(`${date}T00:00:00Z`) - current) / 86400000);
  return {
    totalCases: state.cases.length,
    openCases: state.cases.filter((c) => !['HANDED_OFF_TO_SANDBOX','CLOSED'].includes(c.status)).length,
    reviewRequired: state.cases.filter((c) => c.status === 'REVIEW_REQUIRED').length,
    awaitingApproval: state.cases.filter((c) => c.status === 'AWAITING_APPROVAL').length,
    approved: state.cases.filter((c) => c.status === 'APPROVED').length,
    evidenceDocuments: state.documents.length,
    verifiedDocuments: state.documents.filter((d) => d.verificationStatus === 'VERIFIED').length,
    renewalsDue90Days: state.renewals.filter((r) => r.status === 'OPEN' && inDays(r.renewalDate) >= 0 && inDays(r.renewalDate) <= 90).length,
    sandboxHandoffs: state.erpHandoffs.length,
    recentAuditEvents: state.audit.slice(-10).reverse()
  };
}

export async function resetLeaseGuardDemoData() {
  await fs.rm(DATA_DIR, { recursive: true, force: true });
  await ensureStore();
  return { reset: true, dataDirectory: DATA_DIR };
}
