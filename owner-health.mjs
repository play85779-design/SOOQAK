/**
 * SOOQAK B05: proposed and conservative project-health scoring policy.
 * No score until four independently attested, same-period inputs are provided.
 * URLs/flags are upstream claims; this pure function cannot verify invoices.
 * The resulting score is NOT a release gate or deployment authorization.
 */
const month = x => typeof x==='string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(x);
const source = (v,period) => v?.period===period && v?.independentlyVerified===true &&
  typeof v.sourceUrl==='string' && /^https:\/\/[^\s]+$/i.test(v.sourceUrl);
const count = n => Number.isSafeInteger(n) && n>=0;
const money = n => typeof n==='number' && Number.isFinite(n) && n>=0;
const pct = (n,d) => count(n)&&count(d)&&d>0&&n<=d ? n/d : null;
const clamp = x => Math.min(1,Math.max(0,x));
const policy = Object.freeze({active:20,corroboration:30,availability:30,headroom:20});

export function projectHealth({period, activity, operations, spending}={}) {
  if(!month(period))throw new TypeError('period must be YYYY-MM');
  const active = source(activity,period) ? pct(activity.activeUsers,activity.registeredUsers) : null;
  // A seller marking "sold" is not a corroborated deal.
  const corroboration = source(activity,period)
    ? pct(activity.corroboratedSales,activity.sellerDeclaredSales) : null;
  const availability = source(operations,period)
    ? pct(operations.successfulChecks,operations.totalChecks) : null;
  const headroom = source(spending,period) &&
    money(spending.budgetSar) && spending.budgetSar>0 && money(spending.committedSar)
    ? clamp((spending.budgetSar-spending.committedSar)/spending.budgetSar) : null;
  const rates = {active,corroboration,availability,headroom};
  const missingDimensions = Object.entries(rates).filter(([,v])=>v===null).map(([k])=>k);
  const complete = missingDimensions.length===0;
  const score = complete?Math.round(
    active*policy.active+corroboration*policy.corroboration+
    availability*policy.availability+headroom*policy.headroom
  ):null;
  return Object.freeze({
    period, score, possibleMax:100,
    proposedWeights:policy,
    // A numerical score must NEVER be interpreted as launch authorization.
    productionReady:false, paidUpgradeAllowed:false,
    missingDimensions:Object.freeze(missingDimensions),
    evidenceComplete:complete,
    reason:complete
      ? 'درجة تجريبية بأوزان مقترحة؛ تحتاج مراجعة المالك والمصادر الفعلية قبل الاعتماد.'
      : 'لا تعرض أي درجة صحة عند غياب مصدر موثّق أو فترة متجانسة أو مقام صالح؛ لا تحول المجهول إلى صفر.'
  });
}
