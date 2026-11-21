/**
 * SOOQAK owner-only financial rules (B01/B03/B06/B11).
 * Pure calculations; does not fetch billing, authorize users, send alerts, or change plans.
 * Never substitute 0 for an unverified number. Input SAR values must be documented upstream.
 */
const toAmount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
const roundSar = value => Math.round((value + Number.EPSILON) * 100) / 100;
const isCount = value => Number.isInteger(value) && value >= 0;

export function budgetStatus({budgetSar = 1000, committedSar, notifiedThresholds = []} = {}) {
  const budget = toAmount(budgetSar);
  const committed = toAmount(committedSar);
  if (budget === null || budget <= 0) throw new RangeError('budgetSar must be a positive number');
  if (!Array.isArray(notifiedThresholds)) throw new TypeError('notifiedThresholds must be an array');
  if (committed === null) return {
    verified: false, budgetSar: budget, committedSar: null,
    remainingSar: null, utilizationPercent: null,
    crossedThresholds: [], newAlertIds: [],
    reason: 'الإنفاق التراكمي غير متحقق منه؛ لا تعتبره صفراً أو سقفاً محمياً.'
  };
  const utilization = (committed / budget) * 100;
  const crossed = [50, 80, 100].filter(threshold => utilization >= threshold);
  return {
    verified: true, budgetSar: budget, committedSar: committed,
    remainingSar: roundSar(budget - committed), utilizationPercent: roundSar(utilization),
    crossedThresholds: crossed,
    newAlertIds: crossed.filter(threshold => !notifiedThresholds.includes('budget-' + threshold))
      .map(threshold => 'budget-' + threshold),
    reason: 'هذه إشارات برمجية فقط؛ لا توقف رسوم المزود ولا تثبت وجود سقف إنفاق فعلي.'
  };
}

export function spendAnomaly({previousPeriodsSar, currentPeriodSar, multiplier = 2, minimumIncreaseSar = 25} = {}) {
  const current = toAmount(currentPeriodSar);
  const floor = toAmount(minimumIncreaseSar);
  if (!Array.isArray(previousPeriodsSar) || previousPeriodsSar.length < 3 || current === null || floor === null ||
      typeof multiplier !== 'number' || !Number.isFinite(multiplier) || multiplier <= 1) {
    return {verified: false, anomaly: null, reason: 'تحتاج ثلاث فترات سابقة متجانسة على الأقل، وتكاليف مؤكدة.'};
  }
  const prior = previousPeriodsSar.map(toAmount);
  if (prior.some(x => x === null)) {
    return {verified: false, anomaly: null, reason: 'إحدى الفترات السابقة غير متحقق منها.'};
  }
  const baseline = prior.reduce((sum, x) => sum + x, 0) / prior.length;
  const increase = current - baseline;
  return {
    verified: true,
    baselineSar: roundSar(baseline), currentSar: current,
    increaseSar: roundSar(increase),
    anomaly: increase >= floor && (baseline === 0 ? current > 0 : current >= baseline * multiplier),
    reason: 'مؤشر مقارنة فقط؛ يلزم التحقق من الفاتورة وسبب الزيادة قبل اتخاذ إجراء.'
  };
}

export function unitEconomics({monthlyOperatingCostSar, verifiedContributionPerSaleSar, activeUsers, monthlyAds} = {}) {
  const operating = toAmount(monthlyOperatingCostSar);
  const margin = toAmount(verifiedContributionPerSaleSar);
  return {
    verifiedCostSar: operating,
    costPerActiveUserSar: operating !== null && isCount(activeUsers) && activeUsers > 0 ? roundSar(operating / activeUsers) : null,
    costPerAdSar: operating !== null && isCount(monthlyAds) && monthlyAds > 0 ? roundSar(operating / monthlyAds) : null,
    breakEvenSales: operating !== null && margin !== null && margin > 0 ? Math.ceil(operating / margin) : null,
    reason: 'يجب أن يكون هامش الصفقة مساهمة محصلة فعلاً بعد الرسوم والرديات والتكاليف المباشرة؛ الأرقام المجهولة تبقى فارغة.'
  };
}

export function cashAndExpansion({verifiedCashBalanceSar, unpaidLiabilitiesSar, monthlyBaseCostSar,
  monthlyCollectedNetSar, proposedExpansionCostSar} = {}) {
  const cash = toAmount(verifiedCashBalanceSar);
  const payables = toAmount(unpaidLiabilitiesSar);
  const base = toAmount(monthlyBaseCostSar);
  const collected = toAmount(monthlyCollectedNetSar);
  const proposed = toAmount(proposedExpansionCostSar);
  const afterPayables = cash !== null && payables !== null ? roundSar(cash - payables) : null;
  const reserve = base !== null ? roundSar(base * 6) : null;
  const netMonthly = base !== null && collected !== null ? roundSar(collected - base) : null;
  const runway = afterPayables !== null && netMonthly !== null && netMonthly < 0 && afterPayables > 0
    ? roundSar(afterPayables / -netMonthly) : null;
  const availableForExpansion = afterPayables !== null && reserve !== null ? roundSar(afterPayables - reserve) : null;
  const complete = [cash, payables, base, collected, proposed].every(value => value !== null);
  let expansionDecision = 'غير متحقق منه';
  if (complete) expansionDecision = (availableForExpansion >= proposed && afterPayables >= 0)
    ? 'مناسب ماليًا مبدئيًا — يحتاج موافقة المالك' : 'يُنصح بتأجيل التوسع';
  return {
    cashAfterLiabilitiesSar: afterPayables,
    sixMonthReserveSar: reserve,
    netMonthlyOperatingFlowSar: netMonthly,
    runwayMonthsIfBurning: runway,
    availableForExpansionSar: availableForExpansion,
    expansionDecision,
    reason: 'الحسبة قرار مساعد لا موافقة على الشراء؛ لا تشمل بنودًا غير مدخلة أو التزامات مستقبلية غير موثقة.'
  };
}
