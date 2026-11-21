import test from 'node:test';
import assert from 'node:assert/strict';
import {buildOwnerBrief,ownerReportWindow} from '../owner-reports.mjs';
const asOf='2026-11-22T12:00:00Z';
const claim=(kind,values,changes={})=>({
  kind,cadence:'daily',periodKey:'2026-11-22',
  attestedByServer:true,observedAt:'2026-11-22T10:00:00Z',
  sourceUrl:'https://example.test/report',values,...changes
});
const build=(evidence=[],extras={})=>buildOwnerBrief({
  cadence:'daily',anchorDate:'2026-11-22',reportAsOfUtc:asOf,evidence,...extras
});
test('Riyadh daily Sunday-based weekly and month boundaries are deterministic',()=>{
  assert.deepEqual(ownerReportWindow('weekly','2026-11-24'),{
    cadence:'weekly',periodKey:'2026-11-22',localStartDate:'2026-11-22',
    localEndExclusiveDate:'2026-11-29',timezone:'Asia/Riyadh'});
  assert.equal(ownerReportWindow('monthly','2026-11-22').localEndExclusiveDate,'2026-12-01');
  assert.equal(ownerReportWindow('daily','2026-11-22').localEndExclusiveDate,'2026-11-23');
});
test('missing evidence never becomes zero, a verified total or a claimed health score',()=>{
  const r=build();
  assert.equal(r.metrics.activeUsers,null);
  assert.equal(r.metrics.committedSpendSar,null);
  assert.equal(r.latestClaimedEvidenceAtUtc,null);
  assert.equal(r.independentlyVerified,false);
  assert.equal(r.ownerAccessVerified,false);
  assert.equal(r.productionReady,false);
  assert.equal(r.paidUpgradeAllowed,false);
  assert.ok(r.lines.every(x=>x.includes('غير متحقق منه')));
});
test('source claims produce source-labeled figures without independent verification',()=>{
  const r=build([
    claim('activity',{registeredUsers:10,activeUsers:4}),
    claim('sales',{sellerDeclaredSales:5,corroboratedSales:2}),
    claim('billing',{committedSpendSar:0,collectedRevenueSar:120.25}),
    claim('operations',{successfulChecks:8,totalChecks:10})
  ]);
  assert.equal(r.metrics.activeUsers,4);
  assert.equal(r.metrics.committedSpendSar,0);
  assert.equal(r.metrics.corroboratedSales,2);
  assert.equal(r.unknownMetrics.length,0);
  assert.equal(r.independentlyVerified,false);
  assert.equal(r.ownerAccessVerified,false);
  assert.equal(r.periodComplete,false);
  assert.ok(r.lines[0].includes('إفادة مصدر'));
});
test('source claims cannot include unwhitelisted identifiers or URLs with token queries',()=>{
  const bad=build([claim('activity',{activeUsers:3,registeredUsers:10,userId:'private'})]);
  assert.equal(bad.metrics.activeUsers,null);
  assert.equal(bad.sources.activity,undefined);
  const token=build([claim('billing',{committedSpendSar:2},{sourceUrl:'https://example.test/evidence?key=secret'})]);
  assert.equal(token.metrics.committedSpendSar,null);
  assert.equal(JSON.stringify(token).includes('secret'),false);
});
test('duplicate or conflicting sources fail closed instead of choosing convenient totals',()=>{
  const a=claim('sales',{sellerDeclaredSales:2,corroboratedSales:1});
  const r=build([a,{...a,values:{sellerDeclaredSales:8,corroboratedSales:8}}]);
  assert.equal(r.metrics.corroboratedSales,null);
  assert.ok(r.blockers.some(x=>x.includes('مكرر')));
});
test('inconsistent counts do not create false financial or sales successes',()=>{
  for(const c of [
    claim('sales',{sellerDeclaredSales:2,corroboratedSales:3}),
    claim('activity',{registeredUsers:2,activeUsers:3}),
    claim('operations',{successfulChecks:3,totalChecks:2})
  ]) assert.equal(build([c]).sources[c.kind],undefined);
});
test('mismatched cadence, source claims, timestamps and future reads are rejected',()=>{
  const variants=[
    {periodKey:'2026-11-21'}, {cadence:'weekly'}, {attestedByServer:false},
    {observedAt:'2026-11-23T10:00:00Z'}, {observedAt:'2026-11-21T20:59:59Z'},
    {observedAt:'invalid'}, {sourceUrl:'http://example.test/read'}
  ];
  for(const patch of variants) {
    const r=build([claim('activity',{activeUsers:2,registeredUsers:2},patch)]);
    assert.equal(r.metrics.activeUsers,null);
  }
});
test('source with a documented zero is different from unknown, but zero denominators stay zero',()=>{
  const r=build([claim('activity',{registeredUsers:0,activeUsers:0})]);
  assert.equal(r.metrics.registeredUsers,0);
  assert.equal(r.metrics.activeUsers,0);
  assert.equal(r.metrics.sellerDeclaredSales,null);
});
test('older monthly and weekly evidence needs matching period keys',()=>{
  const weekly=buildOwnerBrief({cadence:'weekly',anchorDate:'2026-11-24',reportAsOfUtc:asOf,
    evidence:[claim('sales',{sellerDeclaredSales:5,corroboratedSales:1},
      {cadence:'weekly',periodKey:'2026-11-22'})]});
  assert.equal(weekly.metrics.corroboratedSales,1);
  const monthly=buildOwnerBrief({cadence:'monthly',anchorDate:'2026-11-22',reportAsOfUtc:asOf,
    evidence:[claim('billing',{committedSpendSar:21},
      {cadence:'monthly',periodKey:'2026-11'})]});
  assert.equal(monthly.metrics.committedSpendSar,21);
});
test('bad date, oversized inputs and pre-period as-of stop reports',()=>{
  assert.throws(()=>ownerReportWindow('monthly','2026-02-31'),TypeError);
  assert.throws(()=>build([], {reportAsOfUtc:'2026-11-21T20:59:59Z'}),RangeError);
  assert.throws(()=>build([], {evidence:Array(33).fill(null)}),TypeError);
  assert.throws(()=>build([], {cadence:'hourly'}),TypeError);
});
