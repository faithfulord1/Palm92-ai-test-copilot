import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  analyzeRequirement,
  generateTestCases,
  evaluatePhoneEquivalence,
  createEvidenceRecord,
  requestSensitiveAction
} from './lib/engine.mjs';
import {
  analyzeFirefighterSession,
  getSampleFirefighterSessions,
  recordControllerDecision,
  getFirefighterTraceability,
  FIREFIGHTER_TEST_CASES,
  FIREFIGHTER_MCP_CATALOG
} from './lib/firefighter.mjs';
import {
  analyzeInsuranceInvoice,
  decideInsurancePosting,
  REFX_SAMPLE_CONTRACT,
  REFX_SAMPLE_INVOICES,
  REFX_INSURANCE_TEST_CASES,
  REFX_INSURANCE_RULES
} from './lib/refx-insurance.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 3000);

const types = {
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml'
};

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
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && content.text) texts.push(content.text);
    }
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

function antonioDemo() {
  const expected = '(5) 555-3932';
  const actual = '555-3932';
  const comparison = evaluatePhoneEquivalence(expected, actual);
  const verdict = comparison.semanticMatch
    ? comparison.exactFormatMatch ? 'PASS' : 'PASS_WITH_FORMAT_WARNING'
    : 'FAIL';

  const evidence = createEvidenceRecord({
    correlationId:'STEVE-ANTON-001',
    beforeState:{customerId:'ANTON',source:'Northwind OData',expectedPhone:expected},
    action:'Route customer phone-number request to Northwind Agent and compare returned value with backend ground truth',
    expected:'Agent returns Antonio Moreno phone number with semantically correct digits',
    actual:`Agent returned ${actual}`,
    afterState:{semanticMatch:comparison.semanticMatch,exactFormatMatch:comparison.exactFormatMatch,verdict},
    verification:'Digits are semantically equivalent; formatting difference is recorded separately rather than treated as a false functional failure.',
    environment:'Northwind demo',
    tester:'Faith Wright',
    approval:'Human review required for final test disposition'
  });

  return {
    scenario:'Northwind Agent — Antonio phone-number validation',
    requirement:'When asked for customer Antonio Moreno phone number, the routed customer agent must return a value grounded in the Northwind customer record.',
    backendGroundTruth:{customerId:'ANTON',customer:'Antonio Moreno',phone:expected},
    agentOutput:{phone:actual},
    comparison,
    verdict,
    testingLesson:'Separate semantic correctness from exact presentation-format validation so normalization does not create a false functional failure.',
    evidence
  };
}

const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/api/health') {
      return send(res,200,JSON.stringify({
        ok:true,
        service:'palm92-ai-test-copilot',
        mode:process.env.OPENAI_API_KEY?'ai+deterministic-fallback':'deterministic-fallback',
        governance:'human-in-the-loop',
        firefighterModule:true,
        refxInsuranceModule:true
      }));
    }

    if (url.pathname === '/api/firefighter/bootstrap' && req.method === 'GET') {
      return send(res,200,JSON.stringify({
        sessions:getSampleFirefighterSessions(),
        testCases:FIREFIGHTER_TEST_CASES,
        traceability:getFirefighterTraceability(),
        mcpCatalog:FIREFIGHTER_MCP_CATALOG,
        disclaimer:'Independent educational portfolio demo. No live SAP connection. Synthetic data only.'
      }));
    }

    if (url.pathname === '/api/firefighter/analyze' && req.method === 'POST') {
      const body = await readJson(req);
      const result = analyzeFirefighterSession(body);
      return send(res,result.valid?200:400,JSON.stringify(result));
    }

    if (url.pathname === '/api/firefighter/decision' && req.method === 'POST') {
      const body = await readJson(req);
      const result = recordControllerDecision(body.session || {}, {
        actor:body.actor,
        action:body.action,
        comment:body.comment,
        confirmed:Boolean(body.confirmed)
      });
      return send(res,200,JSON.stringify(result));
    }

    if (url.pathname === '/api/refx-insurance/sample' && req.method === 'POST') {
      const body = await readJson(req);
      const scenario = body.scenario === 'anomaly' ? 'anomaly' : 'clean';
      return send(res,200,JSON.stringify({
        contract:REFX_SAMPLE_CONTRACT,
        invoice:REFX_SAMPLE_INVOICES[scenario],
        scenario,
        rules:REFX_INSURANCE_RULES,
        testCases:REFX_INSURANCE_TEST_CASES,
        disclaimer:'Synthetic educational data only. No live SAP connection.'
      }));
    }

    if (url.pathname === '/api/refx-insurance/analyze' && req.method === 'POST') {
      const body = await readJson(req);
      const scenario = body.scenario === 'anomaly' ? 'anomaly' : 'clean';
      const result = analyzeInsuranceInvoice({
        contract:body.contract || REFX_SAMPLE_CONTRACT,
        invoice:body.invoice || REFX_SAMPLE_INVOICES[scenario]
      });
      return send(res,200,JSON.stringify(result));
    }

    if (url.pathname === '/api/refx-insurance/decision' && req.method === 'POST') {
      const body = await readJson(req);
      const result = decideInsurancePosting(body.analysis, {
        approved:Boolean(body.approved),
        approver:body.approver || '',
        comment:body.comment || ''
      });
      return send(res,200,JSON.stringify(result));
    }

    if (url.pathname === '/api/analyze' && req.method === 'POST') {
      const body = await readJson(req);
      const text = String(body.text || '').slice(0,20000);
      if (!text.trim()) return send(res,400,JSON.stringify({error:'Requirement text is required'}));
      let result;
      try { result = await tryOpenAI(text); } catch { result = null; }
      if (result) return send(res,200,JSON.stringify({...result, mode:'ai-provider'}));
      return send(res,200,JSON.stringify(analyzeRequirement(text)));
    }

    if (url.pathname === '/api/tests' && req.method === 'POST') {
      const body = await readJson(req);
      const text = String(body.text || '').slice(0,20000);
      if (!text.trim()) return send(res,400,JSON.stringify({error:'Requirement text is required'}));
      return send(res,200,JSON.stringify({
        tests:generateTestCases(text, body.requirementId || 'REQ-001'),
        mode:'deterministic-governed-generator',
        governance:'All generated tests remain Pending until a human reviews them.'
      }));
    }

    if (url.pathname === '/api/demo/antonio' && ['GET','POST'].includes(req.method)) {
      return send(res,200,JSON.stringify(antonioDemo()));
    }

    if (url.pathname === '/api/evidence' && req.method === 'POST') {
      const body = await readJson(req);
      return send(res,200,JSON.stringify(createEvidenceRecord({
        correlationId:body.correlationId || 'STEVE-EVID-001',
        beforeState:body.beforeState || {status:'test prepared'},
        action:body.action || 'Execute governed test and capture outcome',
        expected:body.expected || 'Expected result is satisfied',
        actual:body.actual || 'Observed result recorded',
        afterState:body.afterState || {status:'evidence captured'},
        verification:body.verification || 'Human reviewer verifies evidence against requirement and test result',
        environment:body.environment || 'demo',
        tester:body.tester || 'Faith Wright',
        approval:body.approval || 'Pending'
      })));
    }

    if (url.pathname === '/api/sensitive-action' && req.method === 'POST') {
      const body = await readJson(req);
      return send(res,200,JSON.stringify(requestSensitiveAction({
        action:body.action || 'Send customer data by email',
        approved:Boolean(body.approved),
        approver:body.approver || ''
      })));
    }

    if (!['GET','HEAD'].includes(req.method)) {
      return send(res,405,JSON.stringify({error:'Method not allowed'}));
    }

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
    return send(res,500,JSON.stringify({
      error:'Unexpected server error',
      detail:process.env.NODE_ENV==='development'?error.message:undefined
    }));
  }
});

server.listen(port, ()=>console.log(`Palm92 AI Test Copilot listening on http://localhost:${port}`));
