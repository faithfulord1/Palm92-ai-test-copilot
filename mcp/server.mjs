#!/usr/bin/env node
import readline from 'node:readline';
import { analyzeRequirement, generateTestCases, evaluatePhoneEquivalence, createEvidenceRecord, requestSensitiveAction } from '../lib/engine.mjs';
import { analyzeFirefighterSession, getSampleFirefighterSessions, recordControllerDecision, getFirefighterTraceability } from '../lib/firefighter.mjs';

const tools = [
  {name:'analyze_requirement',description:'Analyse a software or AI requirement without inventing missing facts.'},
  {name:'generate_test_cases',description:'Generate governed test drafts. All generated tests remain Pending until human approval.'},
  {name:'evaluate_phone_equivalence',description:'Compare exact and semantic phone-number equivalence for data-normalisation testing.'},
  {name:'create_evidence_record',description:'Create a traceable remediation or test evidence record.'},
  {name:'request_sensitive_action',description:'Gate a sensitive action behind explicit human approval.'},
  {name:'analyse_firefighter_session',description:'Run explainable deterministic SAP GRC Firefighter-style control checks on synthetic session data.'},
  {name:'get_firefighter_demo_sessions',description:'Return synthetic Firefighter sessions for portfolio demonstrations.'},
  {name:'get_firefighter_traceability',description:'Return requirement-to-control-to-test traceability for the Firefighter demo.'},
  {name:'record_controller_decision',description:'Record a Controller action. Final completion requires explicit human confirmation and blocks self-review.'}
];

function respond(id,result){ process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,result})+'\n'); }
function error(id,message){ process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,error:{code:-32000,message}})+'\n'); }

async function handle(msg){
  const {id,method,params={}} = msg;
  if(method==='initialize') return respond(id,{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'palm92-ai-test-copilot',version:'0.2.0'}});
  if(method==='tools/list') return respond(id,{tools:tools.map(t=>({...t,inputSchema:{type:'object',additionalProperties:true}}))});
  if(method==='tools/call'){
    const name=params.name; const a=params.arguments||{};
    try{
      let data;
      if(name==='analyze_requirement') data=analyzeRequirement(a.text||'');
      else if(name==='generate_test_cases') data={tests:generateTestCases(a.text||'',a.requirementId||'REQ-001')};
      else if(name==='evaluate_phone_equivalence') data=evaluatePhoneEquivalence(a.expected,a.actual);
      else if(name==='create_evidence_record') data=createEvidenceRecord(a);
      else if(name==='request_sensitive_action') data=requestSensitiveAction(a);
      else if(name==='analyse_firefighter_session') data=analyzeFirefighterSession(a.session || a);
      else if(name==='get_firefighter_demo_sessions') data={sessions:getSampleFirefighterSessions()};
      else if(name==='get_firefighter_traceability') data={traceability:getFirefighterTraceability()};
      else if(name==='record_controller_decision') data=recordControllerDecision(a.session || {}, {actor:a.actor,action:a.action,comment:a.comment,confirmed:Boolean(a.confirmed)});
      else throw new Error('Unknown tool');
      return respond(id,{content:[{type:'text',text:JSON.stringify(data,null,2)}],structuredContent:data});
    }catch(e){return error(id,e.message)}
  }
  if(id!==undefined) respond(id,{});
}

const rl=readline.createInterface({input:process.stdin,terminal:false});
rl.on('line',line=>{ try{handle(JSON.parse(line));}catch(e){error(null,e.message)} });
