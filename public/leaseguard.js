let currentCase = null;
let currentAnalysis = null;

const output = document.getElementById('output');
const extractOut = document.getElementById('extractOut');
const summary = document.getElementById('summary');
const caseId = document.getElementById('caseId');
const caseStatus = document.getElementById('caseStatus');
const riskScore = document.getElementById('riskScore');
const blockers = document.getElementById('blockers');

function render(value) {
  output.textContent = JSON.stringify(value, null, 2);
}

function setSummary(analysis) {
  caseId.textContent = analysis?.caseId || '-';
  caseStatus.textContent = analysis?.status || '-';
  riskScore.textContent = Number.isFinite(analysis?.riskScore) ? String(analysis.riskScore) : '-';
  blockers.textContent = Number.isFinite(analysis?.blockingFindingCount) ? String(analysis.blockingFindingCount) : '-';
  summary.className = 'status';
  if (!analysis) {
    summary.textContent = 'Choose a case to start the demonstration.';
    return;
  }
  if (analysis.blockingFindingCount > 0) summary.classList.add('bad');
  else if (analysis.findings?.length) summary.classList.add('warn');
  else summary.classList.add('good');

  const findingText = analysis.findings?.length
    ? analysis.findings.map((item) => `${item.ruleId}: ${item.title}`).join(' | ')
    : 'No control findings.';
  summary.textContent = `${analysis.status}. ${findingText}`;
}

async function json(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || `Request failed: ${response.status}`);
  return data;
}

async function load(kind) {
  const bootstrap = await json('/api/leaseguard/bootstrap');
  currentCase = bootstrap.sampleCases[kind];
  currentAnalysis = await json('/api/leaseguard/analyze', {
    method: 'POST',
    body: JSON.stringify({ caseData: currentCase })
  });
  setSummary(currentAnalysis);
  render({ input: currentCase, analysis: currentAnalysis });
}

async function approve({ self = false } = {}) {
  if (!currentAnalysis || !currentCase) {
    render({ error: 'Load a case before requesting approval.' });
    return;
  }
  const decision = await json('/api/leaseguard/decision', {
    method: 'POST',
    body: JSON.stringify({
      analysis: currentAnalysis,
      decision: {
        approved: true,
        actor: self ? currentCase.createdBy : 'independent.reviewer',
        actorRole: self ? 'maker' : 'financial-controller',
        maker: currentCase.createdBy,
        comment: self ? 'Maker attempted own approval.' : 'Independent reviewer approved the clean control outcome.'
      }
    })
  });
  render({ analysis: currentAnalysis, decision });
}

document.getElementById('loadClean').addEventListener('click', () => load('clean').catch((error) => render({ error: error.message })));
document.getElementById('loadRisky').addEventListener('click', () => load('anomaly').catch((error) => render({ error: error.message })));
document.getElementById('approve').addEventListener('click', () => approve().catch((error) => render({ error: error.message })));
document.getElementById('selfApprove').addEventListener('click', () => approve({ self: true }).catch((error) => render({ error: error.message })));
document.getElementById('extract').addEventListener('click', async () => {
  try {
    const rawText = document.getElementById('docText').value;
    const data = await json('/api/leaseguard/extract', { method: 'POST', body: JSON.stringify({ rawText }) });
    extractOut.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    extractOut.textContent = JSON.stringify({ error: error.message }, null, 2);
  }
});
