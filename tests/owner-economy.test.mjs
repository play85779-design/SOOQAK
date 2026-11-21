import test from 'node:test';
import assert from 'node:assert/strict';
import {economyResponse} from '../owner-economy.mjs';

test('missing invoices never become zero spending or an automatic shutdown', () => {
  const r = economyResponse();
  assert.equal(r.level, 'غير متحقق منه');
  assert.equal(r.budgetVerified, false);
  assert.equal(r.remainingSar, null);
  assert.equal(r.anomalousIncrease, null);
  assert.equal(r.automaticProductionChanges, false);
  assert.equal(r.paidUpgradeAllowed, false);
  assert.equal(r.deletionAllowed, false);
});
test('confirmed zero is different from missing consumption', () => {
  const r = economyResponse({verifiedCommittedSar: 0});
  assert.equal(r.level, 'طبيعي');
  assert.equal(r.remainingSar, 1000);
  assert.equal(r.budgetVerified, true);
});
test('levels follow confirmed budget thresholds with no side effects', () => {
  const examples = [[499,'طبيعي'],[500,'مراقبة'],[799,'مراقبة'],[800,'اقتصادي'],[999,'اقتصادي'],[1000,'طارئ'],[1200,'طارئ']];
  for (const [amount,expected] of examples) {
    const r = economyResponse({verifiedCommittedSar: amount});
    assert.equal(r.level, expected);
    assert.equal(r.automaticProductionChanges, false);
    assert.equal(r.coreAccessMustRemainProtected, true);
  }
});
test('unverified increases do not create false anomaly claims', () => {
  const r = economyResponse({verifiedCommittedSar: 100, historicalPeriodCostsSar:[10, null, 10], currentPeriodCostSar:200});
  assert.equal(r.anomalyVerified,false);
  assert.equal(r.anomalousIncrease,null);
});
test('verified sudden increase escalates low budget to review only', () => {
  const r = economyResponse({verifiedCommittedSar:100,historicalPeriodCostsSar:[10,10,10],currentPeriodCostSar:60});
  assert.equal(r.level,'مراقبة');
  assert.equal(r.anomalousIncrease,true);
  assert.ok(r.recommendedActions.some(a => a.includes('غير معتادة')));
});
test('real high spending keeps critical even without a history baseline', () => {
  const r = economyResponse({verifiedCommittedSar:1400});
  assert.equal(r.level,'طارئ');
  assert.equal(r.budgetUsedPercent,140);
  assert.equal(r.remainingSar,-400);
});
test('optional services are never approved automatically', () => {
  const r = economyResponse({verifiedCommittedSar:1000,verifiedProviderStop:true});
  assert.equal(r.paidUpgradeAllowed,false);
  assert.equal(r.automaticProductionChanges,false);
  assert.ok(r.hardSpendCapVerified !== true);
  assert.ok(Object.isFrozen(r));
  assert.ok(Object.isFrozen(r.recommendedActions));
});
test('negative, textual or malformed commitments are unknown', () => {
  for (const amount of ['0',NaN,Infinity,-1]) {
    const r=economyResponse({verifiedCommittedSar:amount});
    assert.equal(r.budgetVerified,false);
    assert.equal(r.level,'غير متحقق منه');
  }
});
