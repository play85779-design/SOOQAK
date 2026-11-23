import test from 'node:test';
import assert from 'node:assert/strict';
import {WORKERS,evaluateWorkerActivity} from '../owner-workers.mjs';
const now = Date.parse('2026-11-23T09:00:00Z');
const iso = ms => new Date(ms).toISOString();
const entry = (status,override={}) => ({
  id:'W1',source:'automations_verified',server_verified:true,status,
  updated_at:iso(now-5000),started_at:iso(now-50000),
  heartbeat_at:iso(now-15000),ended_at:iso(now-5000),
  task:'Check layout',proof_url:'https://github.com/play85779-design/SOOQAK/pull/37',
  ...override
});
test('B09 workers: three distinct workers; schedules are only labels',()=>{
  assert.deepEqual(WORKERS.map(x=>x.id),['W1','W2','W3']);
  for(const x of WORKERS) assert.equal(evaluateWorkerActivity({id:x.id,status:'in_progress'},now).state,'unknown');
});
test('B09 workers: no source, forged source or absent verification always fail closed',()=>{
  assert.equal(evaluateWorkerActivity(null,now).state,'unknown');
  assert.equal(evaluateWorkerActivity(entry('in_progress',{source:'public_browser'}),now).state,'unknown');
  assert.equal(evaluateWorkerActivity(entry('in_progress',{server_verified:'true'}),now).state,'unknown');
});
test('B09 workers: recent heartbeat is required for animation',()=>{
  assert.equal(evaluateWorkerActivity(entry('in_progress'),now).state,'running');
  assert.equal(evaluateWorkerActivity(entry('in_progress',{heartbeat_at:iso(now-180000)}),now).state,'unknown');
  assert.equal(evaluateWorkerActivity(entry('in_progress',{heartbeat_at:iso(now+60000)}),now).state,'unknown');
});
test('B09 workers: missing or stale timestamps cannot claim completed or failed',()=>{
  assert.equal(evaluateWorkerActivity(entry('completed'),now).state,'complete');
  assert.equal(evaluateWorkerActivity(entry('failed'),now).state,'blocked');
  assert.equal(evaluateWorkerActivity(entry('completed',{ended_at:iso(now-40*24*3600000)}),now).state,'unknown');
  assert.equal(evaluateWorkerActivity(entry('in_progress',{updated_at:'not a timestamp'}),now).state,'unknown');
});
test('B09 workers: only allowlisted evidence is returned',()=>{
  assert.equal(evaluateWorkerActivity(entry('completed',{proof_url:'javascript:alert(1)'}),now).proof,null);
  assert.equal(evaluateWorkerActivity(entry('completed',{proof_url:'https://evil.example/?x=1'}),now).proof,null);
  assert.match(evaluateWorkerActivity(entry('completed'),now).proof,/github.com/);
});
test('B09 workers: schedule is a non-moving verified state, not work',()=>{
  assert.equal(evaluateWorkerActivity(entry('scheduled'),now).state,'scheduled');
  assert.equal(evaluateWorkerActivity(entry('scheduled',{updated_at:iso(now-3600000)}),now).state,'unknown');
});
