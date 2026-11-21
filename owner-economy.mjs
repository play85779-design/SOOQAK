/**
 * SOOQAK B02: safe, advisory-only emergency economy policy.
 * No provider API, billing change, account lockout, or database operation.
 * Callers MUST enforce restrictions on the server only after owner approval
 * and after testing authenticated roles, rate limits and rollback.
 */
import {budgetStatus, spendAnomaly} from './owner-finance.mjs';

export function economyResponse({
  budgetSar = 1000,
  verifiedCommittedSar,
  historicalPeriodCostsSar,
  currentPeriodCostSar,
  verifiedProviderStop = false
} = {}) {
  const budget = budgetStatus({budgetSar, committedSar: verifiedCommittedSar});
  const anomaly = spendAnomaly({
    previousPeriodsSar: historicalPeriodCostsSar,
    currentPeriodSar: currentPeriodCostSar
  });

  // Do not translate missing invoices to zero consumption or assume safety.
  let level = 'غير متحقق منه';
  if (budget.verified) {
    const pct = budget.utilizationPercent;
    level = pct >= 100 ? 'طارئ' : pct >= 80 ? 'اقتصادي' : pct >= 50 ? 'مراقبة' : 'طبيعي';
    if (anomaly.verified && anomaly.anomaly && level === 'طبيعي') level = 'مراقبة';
  }

  const actions = [];
  if (level === 'غير متحقق منه') {
    actions.push('تحقق من الفواتير والتزامات الموردين أولًا، ولا تعتبر الميزانية محمية.');
  } else if (level === 'طبيعي') {
    actions.push('راقب الاستهلاك على فترات منخفضة التكلفة؛ لا تضف خدمة مدفوعة دون موافقة.');
  } else if (level === 'مراقبة') {
    actions.push('راجع مصدر ارتفاع الاستهلاك وقارن القياس بالفواتير الحقيقية.');
  } else if (level === 'اقتصادي') {
    actions.push('اقترح تأجيل العمليات الاختيارية المكلفة، بعد التأكد من عدم الإضرار بالخدمة والبيانات.');
    actions.push('راجع حجم الصور والرسائل الآلية والوظائف الدورية لتقليل الاستهلاك.');
  } else {
    actions.push('جمّد أي توسع أو شراء اختياري جديد، وراجع الالتزامات والمدفوعات مع المالك.');
    actions.push('جهز خطة تخفيف مصادقًا عليها تحافظ على تسجيل الدخول والبيانات والأمن والاستعادة.');
  }
  if (anomaly.verified && anomaly.anomaly) {
    actions.push('الزيادة غير معتادة؛ تحقق من محرك التكلفة ووجود نشاط آلي أو خطأ تكرار.');
  }

  return Object.freeze({
    level,
    budgetVerified: budget.verified,
    budgetUsedPercent: budget.utilizationPercent,
    remainingSar: budget.remainingSar,
    anomalyVerified: anomaly.verified,
    anomalousIncrease: anomaly.anomaly,
    // The following are recommendations, NOT changes made by this function.
    recommendedActions: Object.freeze(actions),
    paidUpgradeAllowed: false,
    coreAccessMustRemainProtected: true,
    deletionAllowed: false,
    automaticProductionChanges: false,
    hardSpendCapVerified: verifiedProviderStop === true ? 'requires-provider-evidence' : 'غير متحقق منه',
    reason: 'السياسة توصية فقط؛ لا تنفذ إيقافًا أو تغييرًا في الإنتاج أو مصروفًا دون إذن المالك.'
  });
}
