import test from 'node:test';
import assert from 'node:assert/strict';
import {budgetStatus, spendAnomaly, unitEconomics, cashAndExpansion} from '../owner-finance.mjs';

test('unverified spending is never shown as zero or announced safe', () => {
  const r = budgetStatus({});
  assert.equal(r.verified, false);
  assert.equal(r.committedSar, null);
  assert.equal(r.utilizationPercent, null);
  assert.deepEqual(r.newAlertIds, []);
});
test('confirmed zero spending is distinct from missing spending', () => {
  const r = budgetStatus({committedSar: 0});
  assert.equal(r.verified, true);
  assert.equal(r.remainingSar, 1000);
  assert.deepEqual(r.crossedThresholds, []);
});
test('500/800/1000 alerts and idempotent alert identities', () => {
  assert.deepEqual(budgetStatus({committedSar: 500}).newAlertIds, ['budget-50']);
  assert.deepEqual(budgetStatus({committedSar: 800, notifiedThresholds:['budget-50']}).newAlertIds, ['budget-80']);
  assert.deepEqual(budgetStatus({committedSar: 1100, notifiedThresholds:['budget-50','budget-80']}).newAlertIds, ['budget-100']);
  assert.equal(budgetStatus({committedSar: 1100}).remainingSar, -100);
});
test('invalid values cannot silently count as 0', () => {
  assert.equal(budgetStatus({committedSar: '0'}).verified, false);
  assert.equal(budgetStatus({committedSar: -50}).verified, false);
  assert.throws(() => budgetStatus({budgetSar: 0}), RangeError);
});
test('anomaly requires comparable verified periods', () => {
  assert.equal(spendAnomaly({previousPeriodsSar:[10,10],currentPeriodSar:100}).verified,false);
  assert.equal(spendAnomaly({previousPeriodsSar:[10,null,10],currentPeriodSar:100}).anomaly,null);
  assert.equal(spendAnomaly({previousPeriodsSar:[10,10,10],currentPeriodSar:40,minimumIncreaseSar:25}).anomaly,true);
  assert.equal(spendAnomaly({previousPeriodsSar:[10,10,10],currentPeriodSar:20,minimumIncreaseSar:25}).anomaly,false);
  assert.equal(spendAnomaly({previousPeriodsSar:[0,0,0],currentPeriodSar:50}).anomaly,true);
});
test('break-even and cost metrics require real inputs', () => {
  assert.equal(unitEconomics({monthlyOperatingCostSar:300,verifiedContributionPerSaleSar:20,activeUsers:100,monthlyAds:50}).breakEvenSales,15);
  assert.equal(unitEconomics({monthlyOperatingCostSar:300,verifiedContributionPerSaleSar:20,activeUsers:100,monthlyAds:50}).costPerActiveUserSar,3);
  assert.equal(unitEconomics({monthlyOperatingCostSar:300}).breakEvenSales,null);
  assert.equal(unitEconomics({monthlyOperatingCostSar:300,activeUsers:0}).costPerActiveUserSar,null);
});
test('expansion cannot be approved when inputs are unverified', () => {
  assert.equal(cashAndExpansion({}).expansionDecision,'غير متحقق منه');
  assert.equal(cashAndExpansion({verifiedCashBalanceSar:1000,unpaidLiabilitiesSar:0,monthlyBaseCostSar:300,monthlyCollectedNetSar:0,proposedExpansionCostSar:100}).expansionDecision,'يُنصح بتأجيل التوسع');
});
test('expansion gate protects six-month reserve', () => {
  const ok=cashAndExpansion({verifiedCashBalanceSar:5000,unpaidLiabilitiesSar:500,monthlyBaseCostSar:400,monthlyCollectedNetSar:300,proposedExpansionCostSar:1000});
  assert.equal(ok.sixMonthReserveSar,2400);
  assert.equal(ok.cashAfterLiabilitiesSar,4500);
  assert.equal(ok.availableForExpansionSar,2100);
  assert.equal(ok.runwayMonthsIfBurning,45);
  assert.match(ok.expansionDecision,/يحتاج موافقة/);
});
test('positive monthly flow does not make fake runway infinity', () => {
  const ok=cashAndExpansion({verifiedCashBalanceSar:5000,unpaidLiabilitiesSar:0,monthlyBaseCostSar:200,monthlyCollectedNetSar:300,proposedExpansionCostSar:100});
  assert.equal(ok.netMonthlyOperatingFlowSar,100);
  assert.equal(ok.runwayMonthsIfBurning,null);
});
