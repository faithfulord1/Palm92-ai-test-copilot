import fs from 'node:fs';

const required = [
  'README.md','package.json','server.mjs','lib/engine.mjs','lib/firefighter.mjs','mcp/server.mjs','mcp/README.md',
  'public/index.html','public/app.js','public/firefighter.html','public/firefighter-app.js','public/firefighter-standalone.html',
  'tests/engine.test.mjs','tests/firefighter.test.mjs','docs/architecture.md','docs/demo-guide.md',
  'docs/responsible-ai.md','docs/firefighter-case-study.md','docs/firefighter-steve-demo-script.md',
  'docs/firefighter-linkedin-post.md','SECURITY.md','LICENSE','.github/workflows/ci.yml'
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
for (const marker of [
  'AI investigates. Humans decide.',
  'FF-DEMO-006',
  'SOD_BLOCKED',
  'Human confirmation required',
  'FF-TC-018',
  'complete_firefighter_review',
  'Not affiliated with SAP'
]) {
  if (!standalone.includes(marker)) throw new Error(`Standalone Firefighter demo is missing marker: ${marker}`);
}

const firefighterEngine = fs.readFileSync('lib/firefighter.mjs','utf8');
for (let n = 1; n <= 8; n++) {
  const id = `FF-R${String(n).padStart(3,'0')}`;
  if (!firefighterEngine.includes(id)) throw new Error(`Missing Firefighter rule ${id}`);
}

console.log('Static repository checks passed.');
