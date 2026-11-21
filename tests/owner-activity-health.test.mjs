import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewActivityExport} from '../owner-activity.mjs';
import {projectHealth} from '../owner-health.mjs';

const id = n => '00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const source = {kind:'audited-server-export',integrityChecked:true,
  url:'https://example.test/server-audit',observedAt:'2026-11-21T22:00:00Z'};
const event = (n,actor,kind='listing-published',occurredAt='2026-11-20T10:00:00Z') =>
  ({id:id(n),actorId:id(actor),kind,origin:'server',occurredAt});
const sale = (n,state='seller-declared',buyer=2) => ({
  id:id(n),sellerId:id(1),buyerId:id(buyer),state,
  sellerDeclaredAt:'2026-11-20T08:00:00Z',
  buyerConfirmedAt:'2026-11-20T09:00:00Z',reconciledAt:'2026-11-20T10:00:00Z',
  serverProofId:'audit-receipt-'+n
});

test('missing server evidence must not become 0 registered or active', () => {
  const r=reviewActivityExport({period:'2026-11'});
  assert.equal(r.evidenceRecorded,false);
  assert.equal(r.activeUsers,null);
  assert.equal(r.sellerDeclaredSales,null);
  assert.equal(r.independentlyVerified,false);
});
test('counts unique server activity and only corroborated sales, with no identifiers in output', () => {
  const r=reviewActivityExport({
    period:'2026-11',source,registeredActors:[id(1),id(2),id(3)],
    activityEvents:[event(20,1),event(20,1),event(21,2,'message-sent'),
      event(22,3,'service-order-created','2026-10-31T12:00:00Z'),event(23,9)],
    sales:[sale(30,'corroborated'),sale(31)]
  });
  assert.equal(r.evidenceRecorded,true);
  assert.equal(r.registeredUsers,3);
  assert.equal(r.activeUsers,2);
  assert.equal(r.duplicateEvents,1);
  assert.equal(r.sellerDeclaredSales,2);
  assert.equal(r.corroboratedSales,1);
  assert.equal(r.activeRatePercent,66.67);
  assert.equal(r.corroborationRatePercent,50);
  assert.equal(r.independentlyVerified,false);
  assert.equal(JSON.stringify(r).includes(id(1)),false);
  assert.equal(Object.isFrozen(r),true);
});
test('seller declaring sold alone is not corroborated sale',()=>{
  const r=reviewActivityExport({period:'2026-11',source,registeredActors:[id(1)],activityEvents:[],
    sales:[sale(40)]});
  assert.equal(r.sellerDeclaredSales,1);
  assert.equal(r.corroboratedSales,0);
  assert.equal(r.corroborationRatePercent,0);
});
test('self-confirmation, missing server proof and future reconciliations do not count',()=>{
  const badSelf=sale(41,'corroborated',1);
  const badProof={...sale(42,'corroborated'),serverProofId:''};
  const late={...sale(43,'corroborated'),reconciledAt:'2026-11-22T08:00:00Z'};
  const r=reviewActivityExport({period:'2026-11',source,registeredActors:[id(1),id(2)],
    activityEvents:[],sales:[badSelf,badProof,late]});
  assert.equal(r.sellerDeclaredSales,3);
  assert.equal(r.corroboratedSales,0);
});
test('complete empty export can document zero, but ratios without denominators remain unknown',()=>{
  const r=reviewActivityExport({period:'2026-11',source,registeredActors:[],activityEvents:[],sales:[]});
  assert.equal(r.evidenceRecorded,true);
  assert.equal(r.registeredUsers,0);
  assert.equal(r.activeUsers,0);
  assert.equal(r.activeRatePercent,null);
  assert.equal(r.corroborationRatePercent,null);
});
test('invalid source date and future-only evidence do not imply true 0',()=>{
  const invalid=reviewActivityExport({period:'2026-11',
    source:{...source,observedAt:'2026-10-21T22:00:00Z'},
    registeredActors:[],activityEvents:[],sales:[]});
  assert.equal(invalid.activeUsers,null);
  const missing=reviewActivityExport({period:'2026-11',
    source:{...source,integrityChecked:false},
    registeredActors:[],activityEvents:[],sales:[]});
  assert.equal(missing.activeUsers,null);
});
test('malformed or conflicting audit data fails closed',()=>{
  const base={period:'2026-11',source,registeredActors:[id(1)],activityEvents:[],sales:[]};
  assert.throws(()=>reviewActivityExport({...base,registeredActors:[id(1),id(1)]}),TypeError);
  assert.throws(()=>reviewActivityExport({...base,activityEvents:[event(5,1,'page-view')]}),TypeError);
  assert.throws(()=>reviewActivityExport({...base,sales:[sale(5),sale(5)]}),TypeError);
  assert.throws(()=>reviewActivityExport({...base,registeredActors:new Array(10001).fill(id(1))}),RangeError);
  assert.throws(()=>reviewActivityExport({...base,period:'November'}),TypeError);
});
test('unknown project metrics never produce an invented health score',()=>{
  const r=projectHealth({period:'2026-11'});
  assert.equal(r.score,null);
  assert.equal(r.evidenceComplete,false);
  assert.deepEqual(r.missingDimensions,['active','corroboration','availability','headroom']);
  assert.equal(r.productionReady,false);
  assert.equal(r.paidUpgradeAllowed,false);
});
const audited = {
  period:'2026-11',independentlyVerified:true,sourceUrl:'https://example.test/verified',
  activeUsers:4,registeredUsers:10,corroboratedSales:2,sellerDeclaredSales:4
};
const operations = {period:'2026-11',independentlyVerified:true,
  sourceUrl:'https://example.test/uptime',successfulChecks:9,totalChecks:10};
const spending = {period:'2026-11',independentlyVerified:true,
  sourceUrl:'https://example.test/invoice',budgetSar:1000,committedSar:250};
test('a claimed server export alone cannot trigger a published score',()=>{
  const r=reviewActivityExport({period:'2026-11',source,registeredActors:[id(1)],
    activityEvents:[event(5,1)],sales:[sale(6)]});
  assert.equal(projectHealth({period:'2026-11',activity:r,operations,spending}).score,null);
});
test('complete separately attested same-period evidence yields proposed weighted score only',()=>{
  const r=projectHealth({period:'2026-11',activity:audited,operations,spending});
  assert.equal(r.evidenceComplete,true);
  assert.equal(r.score,65);
  assert.equal(r.possibleMax,100);
  assert.equal(r.productionReady,false);
  assert.equal(Object.isFrozen(r.proposedWeights),true);
});
test('period mismatch, missing sales and fake numeric strings hide the entire score',()=>{
  const variants=[
    {activity:{...audited,period:'2026-10'}},
    {activity:{...audited,sellerDeclaredSales:0,corroboratedSales:0}},
    {operations:{...operations,totalChecks:0}},
    {spending:{...spending,committedSar:'0'}},
    {spending:{...spending,sourceUrl:'http://insecure.local'}},
    {activity:{...audited,independentlyVerified:false}}
  ];
  for(const patch of variants){
    const r=projectHealth({period:'2026-11',activity:audited,operations,spending,...patch});
    assert.equal(r.score,null);
    assert.ok(r.missingDimensions.length>0);
  }
});
test('overspent budget is bounded at zero headroom without authorizing actions',()=>{
  const r=projectHealth({period:'2026-11',activity:audited,operations,
    spending:{...spending,committedSar:1500}});
  assert.equal(r.score,50);
  assert.equal(r.paidUpgradeAllowed,false);
});
