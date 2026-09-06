const state = { sessions: [], analyses: {}, tests: [], traceability: [], mcp: [], audit: [] };
const byId = (id) => document.getElementById(id);

async function getJson(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.errors?.join(', ') || 'Request failed');
  return data;
}

function esc(value='') {
  return String(value).replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function currentSession() {
  return state.sessions.find((session) => session.id === byId('sessionSelect').value) || state.sessions[0];
}

function renderMetrics() {
  const analyses = Object.values(state.analyses);
  const count = (level) => analyses.filter((a) => a.attention === level).length;
  const pending = analyses.length;
  const outOfWindow = analyses.filter((a) => a.findings.some((f) => f.ruleId === 'FF-R003')).length;
  const sod = analyses.filter((a) => a.findings.some((f) => f.ruleId === 'FF-R008')).length;
  byId('metrics').innerHTML = [
    ['Sessions', analyses.length, 'Synthetic sessions available for review'],
    ['High attention', count('High'), 'Requires focused human review'],
    ['Medium attention', count('Medium'), 'Evidence or control question present'],
    ['Pending review', pending, 'Demo sessions awaiting Controller disposition'],
    ['Outside window', outOfWindow, 'Sessions with approved-time exceptions'],
    ['SoD concern', sod, 'Potential self-review conflict']
  ].map(([label, value, note]) => `<div class="card"><div class="muted">${esc(label)}</div><div class="metric">${esc(value)}</div><div class="muted">${esc(note)}</div></div>`).join('');
}

function attentionClass(level) {
  return level === 'High' ? 'b-high' : level === 'Medium' ? 'b-medium' : 'b-low';
}

function renderSelected() {
  const session = currentSession();
  const analysis = state.analyses[session.id];
  const facts = [
    ['Session', session.id], ['Firefighter user', session.firefighterUser], ['Firefighter ID', session.firefighterId], ['Controller', session.controller],
    ['Reason', session.reasonCode || 'Missing'], ['Ticket', session.incidentTicket || 'Missing'], ['Approved window', `${session.approvedStart} → ${session.approvedEnd}`], ['Actual window', `${session.actualStart} → ${session.actualEnd}`]
  ];
  byId('sessionFacts').innerHTML = facts.map(([k,v]) => `<div class="fact"><strong>${esc(k)}</strong>${esc(v)}</div>`).join('');
  const badge = byId('attentionBadge');
  badge.className = `badge ${attentionClass(analysis.attention)}`;
  badge.textContent = `${analysis.attention} attention · ${analysis.findingCount} finding${analysis.findingCount === 1 ? '' : 's'}`;

  byId('findings').innerHTML = analysis.findings.length ? analysis.findings.map((f) => `
    <div class="finding ${esc(f.severity)}">
      <h4>${esc(f.ruleId)} · ${esc(f.name)} <span class="badge ${f.severity === 'critical' || f.severity === 'high' ? 'b-high' : 'b-medium'}">${esc(f.severity)}</span></h4>
      <p><strong>Evidence:</strong> ${esc(f.evidence)}</p>
      <p class="muted"><strong>Why it matters:</strong> ${esc(f.whyItMatters)}</p>
      <p><strong>Draft Controller question:</strong> ${esc(f.controllerQuestion)}</p>
    </div>`).join('') : '<div class="callout"><strong>No exception finding.</strong> Routine Controller review is still required before completion.</div>';

  byId('activityTimeline').innerHTML = (session.actions || []).map((a) => `<div class="event"><strong>${esc(a.time || '')}</strong><span>${esc(a.description || '')}</span><div class="muted">Category: ${esc(a.category || 'n/a')} · ${a.sensitive ? 'Sensitive privileged action' : 'Standard logged action'}</div></div>`).join('');
  byId('actor').value = session.controller;
  renderReport();
}

function renderTests() {
  byId('testRows').innerHTML = state.tests.map((t) => `<tr><td><span class="code">${esc(t.id)}</span></td><td>${esc(t.requirementId)}</td><td>${esc(t.type)}</td><td>${esc(t.title)}</td><td>${esc(t.expected)}</td><td><span class="badge b-medium">${esc(t.status)}</span></td></tr>`).join('');
}

function renderTraceability() {
  byId('traceRows').innerHTML = state.traceability.map((r) => `<tr><td><strong>${esc(r.id)}</strong><div class="muted">${esc(r.objective)}</div></td><td>${esc(r.control)}</td><td>${(r.ruleIds||[]).map((id)=>`<span class="code">${esc(id)}</span>`).join(' ') || 'Audit / workflow control'}</td><td>${(r.testCases||[]).map((id)=>`<span class="code">${esc(id)}</span>`).join(' ')}</td></tr>`).join('');
}

function renderMcp() {
  byId('mcpRows').innerHTML = state.mcp.map((t) => `<tr><td><span class="code">${esc(t.name)}</span></td><td>${esc(t.mode)}</td><td>${esc(t.approval)}</td><td>${esc(t.purpose)}</td></tr>`).join('');
}

function renderAudit() {
  byId('auditTimeline').innerHTML = state.audit.length ? [...state.audit].reverse().map((e) => `<div class="event"><strong>${esc(e.recordedAt)} · ${esc(e.actor)}</strong><span>${esc(e.action)}</span><div class="muted">${esc(e.rationale || 'No additional rationale')}</div></div>`).join('') : '<div class="event muted">No controller actions recorded in this browser session yet.</div>';
}

function renderReport() {
  const session = currentSession();
  const analysis = state.analyses[session.id];
  const audit = state.audit.filter((a) => a.sessionId === session.id);
  byId('report').innerHTML = `
    <h4 style="margin-top:0">${esc(session.id)} · Controller Review Summary</h4>
    <p><strong>Firefighter:</strong> ${esc(session.firefighterUser)} (${esc(session.firefighterId)}) · <strong>Controller:</strong> ${esc(session.controller)}</p>
    <p><strong>Reason:</strong> ${esc(session.reasonCode || 'Missing')} · <strong>Ticket:</strong> ${esc(session.incidentTicket || 'Missing')}</p>
    <p><strong>Attention:</strong> ${esc(analysis.attention)} · <strong>Findings:</strong> ${analysis.findingCount}</p>
    <p><strong>Finding IDs:</strong> ${analysis.findings.map((f)=>esc(f.ruleId)).join(', ') || 'None'}</p>
    <p><strong>Evidence references:</strong> ${(session.evidenceRefs || []).map(esc).join(', ') || 'None recorded'}</p>
    <p><strong>Controller audit events:</strong> ${audit.length}</p>
    <p class="muted">Final decisions remain the responsibility of the human Controller. This report is generated from synthetic demonstration data.</p>`;
}

async function act(action, confirmed=false) {
  const session = currentSession();
  const actor = byId('actor').value.trim();
  const comment = byId('comment').value.trim();
  const data = await getJson('/api/firefighter/decision', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ session, actor, action, comment, confirmed })
  });
  byId('actionResult').textContent = data.allowed ? `${data.status}: action recorded in audit timeline.` : `${data.status}: ${data.reason || 'Action blocked.'}`;
  if (data.auditEvent) state.audit.push(data.auditEvent);
  renderAudit(); renderReport();
  return data;
}

async function load() {
  try {
    const data = await getJson('/api/firefighter/bootstrap');
    state.sessions = data.sessions;
    state.tests = data.testCases;
    state.traceability = data.traceability;
    state.mcp = data.mcpCatalog;
    for (const session of state.sessions) state.analyses[session.id] = await getJson('/api/firefighter/analyze', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(session)});
    byId('sessionSelect').innerHTML = state.sessions.map((s) => `<option value="${esc(s.id)}">${esc(s.id)} · ${esc(s.firefighterUser)} · ${esc(state.analyses[s.id].attention)}</option>`).join('');
    renderMetrics(); renderTests(); renderTraceability(); renderMcp(); renderSelected(); renderAudit();
  } catch (error) {
    document.querySelector('main').insertAdjacentHTML('afterbegin', `<div class="notice"><strong>Could not load Firefighter demo:</strong> ${esc(error.message)}</div>`);
  }
}

byId('sessionSelect').addEventListener('change', renderSelected);
byId('refresh').addEventListener('click', () => location.reload());
document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => act(button.dataset.action)));
byId('completeBtn').addEventListener('click', async () => {
  const first = await act('complete', false);
  if (!first.allowed && first.status === 'HUMAN_CONFIRMATION_REQUIRED') {
    if (window.confirm('Final completion is a human decision. Confirm that you have reviewed the findings and evidence and want to complete this synthetic review?')) await act('complete', true);
  }
});
byId('printReport').addEventListener('click', () => window.print());
load();
