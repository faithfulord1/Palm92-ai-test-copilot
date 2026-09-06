import fs from 'node:fs';

const required = [
  'README.md','package.json','server.mjs','lib/engine.mjs','lib/firefighter.mjs','lib/leaseguard.mjs','lib/leaseguard-phase2.mjs','mcp/server.mjs','mcp/README.md',
  'public/index.html','public/app.js','public/firefighter.html','public/firefighter.js','public/firefighter-standalone.html',
  'public/leaseguard.html','public/leaseguard.js','public/leaseguard-phase2.html','public/leaseguard-phase2.js',
  'tests/engine.test.mjs','tests/firefighter.test.mjs','tests/leaseguard.test.mjs','tests/leaseguard-phase2.test.mjs','docs/architecture.md','docs/demo-guide.md',
  'docs/responsible-ai.md','docs/firefighter-case-study.md','docs/firefighter-steve-demo-script.md',
  'docs/firefighter-linkedin-post.md','docs/leaseguard-professional-case-study.md','docs/leaseguard-phase2.md','SECURITY.md','LICENSE','.github/workflows/ci.yml'
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('Missing required project files:', missing.join(', '));
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
if (pkg.name !== 'palm92-ai-test-copilot') throw new Error('Unexpected package name');
if (!pkg.scripts?.test || !pkg.scripts?.ci) throw new Error('Required scripts are missing');

const standalone = fs.readFileSync('public/firefighter-standalone.html','utf8');
for (const marker of ['AI investigates. Humans decide.','FF-DEMO-006','SOD_BLOCKED','Human confirmation required','FF-TC-018','complete_firefighter_review','Not affiliated with SAP']) {
  if (!standalone.includes(marker)) throw new Error(`Standalone Firefighter demo is missing marker: ${marker}`);
}

const firefighterEngine = fs.readFileSync('lib/firefighter.mjs','utf8');
for (let n = 1; n <= 8; n++) {
  const id = `FF-R${String(n).padStart(3,'0')}`;
  if (!firefighterEngine.includes(id)) throw new Error(`Missing Firefighter rule ${id}`);
}

const leaseguardEngine = fs.readFileSync('lib/leaseguard.mjs','utf8');
for (const marker of ['Palm92 LeaseGuard AI','LG-R005','BLOCKED_BY_SOD','APPROVED_FOR_ERP_HANDOFF']) {
  if (!leaseguardEngine.includes(marker)) throw new Error(`LeaseGuard engine is missing marker: ${marker}`);
}

const phase2 = fs.readFileSync('lib/leaseguard-phase2.mjs','utf8');
for (const marker of ['json-file-store','uploadDocument','verificationStatus','createRenewal','sandboxErpHandoff','sha256']) {
  if (!phase2.includes(marker)) throw new Error(`LeaseGuard Phase 2 is missing marker: ${marker}`);
}

console.log('Static repository checks passed.');
