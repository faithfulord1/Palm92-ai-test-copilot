import fs from 'node:fs';

const required = [
  'README.md','package.json','server.mjs','lib/engine.mjs','mcp/server.mjs','mcp/README.md',
  'public/index.html','public/app.js','tests/engine.test.mjs','docs/architecture.md','docs/demo-guide.md',
  'docs/responsible-ai.md','SECURITY.md','LICENSE','.github/workflows/ci.yml'
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('Missing required project files:', missing.join(', '));
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
if (pkg.name !== 'palm92-ai-test-copilot') throw new Error('Unexpected package name');
if (!pkg.scripts?.test || !pkg.scripts?.ci) throw new Error('Required scripts are missing');

console.log('Static repository checks passed.');
