import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRequirement, generateTestCases, evaluatePhoneEquivalence, createEvidenceRecord, requestSensitiveAction } from '../lib/engine.mjs';

test('analyzes authentication requirement',()=>{
  const result = analyzeRequirement('User logs in with password and MFA before viewing personal data.');
  assert.ok(result.risks.some(r=>r.includes('Authentication')));
  assert.ok(result.securityConcerns.length > 0);
});

test('generated tests stay pending',()=>{
  const tests = generateTestCases('User can update profile after login','REQ-101');
  assert.equal(tests.length,4);
  assert.ok(tests.every(t=>t.status==='Pending'));
});

test('Antonio phone numbers can be semantically equal while formatting differs',()=>{
  const result = evaluatePhoneEquivalence('(5) 555-3932','555-3932');
  assert.equal(result.semanticMatch,true);
  assert.equal(result.exactFormatMatch,false);
});

test('evidence record requires correlation id',()=>{
  assert.throws(()=>createEvidenceRecord({correlationId:'',action:'test'}));
  const record = createEvidenceRecord({correlationId:'CORR-1',beforeState:{status:'new'},action:'execute test',expected:'pass',actual:'pass',afterState:{status:'done'},verification:'reviewed'});
  assert.equal(record.correlationId,'CORR-1');
});

test('sensitive actions require human approval',()=>{
  assert.equal(requestSensitiveAction({action:'book appointment'}).allowed,false);
  assert.equal(requestSensitiveAction({action:'book appointment',approved:true,approver:'Faith'}).allowed,true);
});
