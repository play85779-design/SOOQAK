/**
 * SOOQAK B08: zero-cost, offline owner brief for daily/weekly/monthly review.
 * Never call this in a public route with sensitive inputs. A trusted server
 * must authenticate the owner, independently validate source records, and
 * redact raw personal information BEFORE invoking this pure formatter.
 * Input flags and URLs are claims, NOT independently verified by this module.
 * No network calls, persistence, AI subscription, notifications, or deployment.
 */
const kinds = Object.freeze({
  activity: {registeredUsers:'count',activeUsers:'count'},
  sales: {sellerDeclaredSales:'count',corroboratedSales:'count'},
  billing: {collectedRevenueSar:'money',committedSpendSar:'money'},
  operations: {successfulChecks:'count',totalChecks:'count'}
});
const labels = Object.freeze({
  registeredUsers:'المستخدمون المسجلون',
  activeUsers:'المستخدمون النشطون',
  sellerDeclaredSales:'الصفقات المعلنة من البائع',
  corroboratedSales:'الصفقات ذات الإثبات الإضافي',
  collectedRevenueSar:'الإيرادات المحصلة (ريال)',
  committedSpendSar:'المصاريف المسجلة (ريال)',
  successfulChecks:'فحوص التشغيل الناجحة',
  totalChecks:'إجمالي فحوص التشغيل'
});
const validDay = s => typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  Number.isFinite(Date.parse(s+'T00:00:00Z')) &&
  new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const validStamp = s => typeof s==='string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s) &&
  Number.isFinite(Date.parse(s)) && new Date(s).toISOString()===s.replace('Z','.000Z');
const shift = (s,n) => new Date(Date.parse(s+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const sourceUrl = s => {
  if(typeof s!=='string' || s.length>350) return false;
  try { const u=new URL(s); return u.protocol==='https:' && Boolean(u.hostname) &&
    !u.username && !u.password && !u.search && !u.hash; } catch { return false; }
};
const validValue = (v,t) => t==='count' ? Number.isSafeInteger(v) && v>=0 :
  typeof v==='number' && Number.isFinite(v) && v>=0 && v<=1000000000000;
export function ownerReportWindow(cadence,anchorDate) {
  if(!['daily','weekly','monthly'].includes(cadence) || !validDay(anchorDate))
    throw new TypeError('cadence must be daily/weekly/monthly and anchorDate a real YYYY-MM-DD');
  let start=anchorDate, end;
  if(cadence==='weekly') {
    start=shift(anchorDate,-new Date(anchorDate+'T00:00:00Z').getUTCDay());
    end=shift(start,7);
  } else if(cadence==='monthly') {
    start=anchorDate.slice(0,7)+'-01';
    const [y,m]=start.split('-').map(Number);
    end=new Date(Date.UTC(y,m,1)).toISOString().slice(0,10);
  } else end=shift(start,1);
  return Object.freeze({cadence,periodKey:cadence==='monthly'?start.slice(0,7):start,
    localStartDate:start,localEndExclusiveDate:end,timezone:'Asia/Riyadh'});
}
export function buildOwnerBrief({cadence,anchorDate,reportAsOfUtc,evidence=[]}={}) {
  const window=ownerReportWindow(cadence,anchorDate);
  if(!validStamp(reportAsOfUtc) || !Array.isArray(evidence) || evidence.length>32)
    throw new TypeError('UTC as-of timestamp and bounded evidence array required');
  const reportTime=Date.parse(reportAsOfUtc);
  // Riyadh has UTC+03:00 year round; report date boundaries are local, not UTC.
  const startTime=Date.parse(window.localStartDate+'T00:00:00Z')-3*3600000;
  const endTime=Date.parse(window.localEndExclusiveDate+'T00:00:00Z')-3*3600000;
  if(reportTime<startTime) throw new RangeError('as-of timestamp precedes report period');
  const values={}, sourceKinds={}, missing=[], rejected=[], used=[];
  for(const spec of Object.values(kinds)) for(const key of Object.keys(spec)) values[key]=null;
  for(const kind of Object.keys(kinds)) {
    const matching=evidence.filter(e=>e && e.kind===kind);
    if(matching.length!==1) {
      (matching.length>1?rejected:missing).push(kind);
      continue;
    }
    const e=matching[0];
    const ts=Date.parse(e.observedAt);
    const valid=e.cadence===cadence && e.periodKey===window.periodKey &&
      e.attestedByServer===true && validStamp(e.observedAt) &&
      ts>=startTime && ts<=reportTime && sourceUrl(e.sourceUrl) &&
      e.values && typeof e.values==='object' && !Array.isArray(e.values) &&
      Object.keys(e.values).every(k=>Object.hasOwn(kinds[kind],k) &&
        validValue(e.values[k],kinds[kind][k]));
    if(!valid) { rejected.push(kind); continue; }
    if((kind==='activity' && e.values.activeUsers>e.values.registeredUsers) ||
       (kind==='sales' && e.values.corroboratedSales>e.values.sellerDeclaredSales) ||
       (kind==='operations' && e.values.successfulChecks>e.values.totalChecks)) {
      rejected.push(kind); continue;
    }
    for(const k of Object.keys(kinds[kind])) {
      if(Object.hasOwn(e.values,k)) values[k]=e.values[k];
    }
    sourceKinds[kind]={sourceUrl:e.sourceUrl,observedAtUtc:e.observedAt,
      status:'upstream-attestation-claim-only'};
    used.push(ts);
  }
  const unknown=Object.keys(values).filter(k=>values[k]===null);
  const lines=Object.entries(labels).map(([k,label])=>label+': '+
    (values[k]===null?'غير متحقق منه':String(values[k])+' (إفادة مصدر لم تُدقق هنا)'));
  const blockers=Object.freeze([
    ...missing.map(k=>'مصدر '+k+' غير متاح'),
    ...rejected.map(k=>'مصدر '+k+' مكرر أو غير صالح'),
    ...(unknown.length?['بعض المؤشرات غير متاحة أو لم يتم توثيقها']:[])
  ]);
  return Object.freeze({
    ...window,reportAsOfUtc,
    periodComplete:reportTime>=endTime,
    latestClaimedEvidenceAtUtc:used.length?new Date(Math.max(...used)).toISOString():null,
    metrics:Object.freeze(values),sources:Object.freeze(sourceKinds),
    unknownMetrics:Object.freeze(unknown),blockers,
    lines:Object.freeze(lines),
    independentlyVerified:false,ownerAccessVerified:false,
    productionReady:false,paidUpgradeAllowed:false,
    mode:'offline-private-review-only',
    disclaimer:'يجب التحقق من هوية المالك وأصالة الفواتير والسجلات على الخادم؛ لا تعد هذه المدخلات توثيقًا مستقلًا أو إذن صرف أو إطلاق.'
  });
}
