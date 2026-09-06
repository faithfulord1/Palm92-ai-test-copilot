import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeRequirement, generateTestCases } from './lib/engine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 3000);

const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml' };

function send(res, status, body, type='application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self' https://api.openai.com"
  });
  res.end(body);
}

async function readJson(req) {
  let raw='';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error('Request too large');
  }
  return raw ? JSON.parse(raw) : {};
}

function extractResponseText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;
  const texts=[];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) if (content?.type === 'output_text' && content.text) texts.push(content.text);
  }
  return texts.join('\n');
}

async function tryOpenAI(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || 'gpt-5.2';
  const prompt = `You are a senior QA and AI assurance analyst. Analyze the requirement below. Return concise JSON with keys: objective, actors, preconditions, functionalRequirements, nonFunctionalRequirements, acceptanceCriteria, dependencies, risks, ambiguities, assumptions, testabilityConcerns, securityConcerns. Do not invent missing facts; mark ambiguities. Requirement:\n${text}`;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method:'POST',
    headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
    body: JSON.stringify({model,input:prompt,text:{verbosity:'low'}})
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const data = await response.json();
  const output = extractResponseText(data);
  try { return JSON.parse(output); } catch { return { narrative: output }; }
}

const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/api/health') return send(res,200,JSON.stringify({ok:true,service:'palm92-ai-test-copilot',mode:process.env.OPENAI_API_KEY?'ai+fallback':'deterministic-fallback'}));
    if (url.pathname === '/api/analyze' && req.method === 'POST') {
      const body = await readJson(req);
      const text = String(body.text || '').slice(0,20000);
      if (!text.trim()) return send(res,400,JSON.stringify({error:'Requirement text is required'}));
      let result;
      try { result = await tryOpenAI(text); } catch (error) { result = null; }
      if (result) return send(res,200,JSON.stringify({...result, mode:'ai-provider'}));
      return send(res,200,JSON.stringify(analyzeRequirement(text)));
    }
    if (url.pathname === '/api/tests' && req.method === 'POST') {
      const body = await readJson(req);
      const text = String(body.text || '').slice(0,20000);
      if (!text.trim()) return send(res,400,JSON.stringify({error:'Requirement text is required'}));
      return send(res,200,JSON.stringify({tests:generateTestCases(text, body.requirementId || 'REQ-001'),mode:'deterministic-governed-generator'}));
    }
    if (!['GET','HEAD'].includes(req.method)) return send(res,405,JSON.stringify({error:'Method not allowed'}));
    let rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    rel = path.normalize(rel).replace(/^([.][.][/\\])+/, '');
    const file = path.join(publicDir, rel);
    if (!file.startsWith(publicDir)) return send(res,403,'Forbidden','text/plain');
    try {
      const content = await fs.readFile(file);
      if (req.method === 'HEAD') return send(res,200,'',types[path.extname(file)] || 'application/octet-stream');
      return send(res,200,content,types[path.extname(file)] || 'application/octet-stream');
    } catch {
      const app = await fs.readFile(path.join(publicDir,'index.html'));
      if (req.method === 'HEAD') return send(res,200,'',types['.html']);
      return send(res,200,app,types['.html']);
    }
  } catch (error) {
    return send(res,500,JSON.stringify({error:'Unexpected server error',detail:process.env.NODE_ENV==='development'?error.message:undefined}));
  }
});

server.listen(port, ()=>console.log(`Palm92 AI Test Copilot listening on http://localhost:${port}`));
