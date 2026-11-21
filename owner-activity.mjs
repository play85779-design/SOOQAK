/**
 * SOOQAK B04: privacy-minimizing, offline audit export classification.
 * Inputs must come from a separately authenticated, reconciled SERVER export.
 * The client can forge the source descriptor; this helper is not proof of truth.
 * No identifiers are returned, logged or stored. No network access.
 */
const uuid = x => typeof x==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
const month = x => typeof x==='string' && /^\\d{4}-(0[1-9]|1[0-2])$/.test(x);
const sourceUrl = x => typeof x==='string' && /^https:\/\/[^\s]+$/i.test(x);
const day = x => typeof x==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(x) &&
  Number.isFinite(Date.parse(x));
const activityKinds = new Set(['listing-published','message-sent','service-order-created','buyer-confirmed-sale']);

export function reviewActivityExport({period, source, registeredActors, activityEvents, sales}={}) {
  if(!month(period))throw new TypeError('period must be YYYY-MM');
  const pending = reason => Object.freeze({
    period, evidenceRecorded:false, registeredUsers:null, activeUsers:null,
    sellerDeclaredSales:null, corroboratedSales:null, duplicateEvents:null,
    activeRatePercent:null, corroborationRatePercent:null,
    independentlyVerified:false, sourceUrl:null, reason
  });
  if(!source || source.kind!=='audited-server-export' || source.integrityChecked!==true ||
     !sourceUrl(source.url) || !day(source.observedAt) ||
     !Array.isArray(registeredActors) || !Array.isArray(activityEvents) || !Array.isArray(sales))
    return pending('سجل الخادم أو اكتمال التصدير غير متحقق منه؛ لا تفسر الغياب بأنه صفر.');

  if(registeredActors.length>10000 || activityEvents.length>20000 || sales.length>10000)
    throw new RangeError('bounded audit export required');
  if(!registeredActors.every(uuid) || new Set(registeredActors).size!==registeredActors.length)
    throw new TypeError('registeredActors must be distinct pseudonymous UUIDs');
  const registered=new Set(registeredActors);
  const start=Date.parse(period+'-01T00:00:00Z');
  const [y,m]=period.split('-').map(Number);
  const end=Date.UTC(y,m,1);
  const asOf=Date.parse(source.observedAt);
  if(asOf<start)return pending('تاريخ الدليل أقدم من فترة التقرير.');
  const inside=x=>day(x) && Date.parse(x)>=start && Date.parse(x)<end && Date.parse(x)<=asOf;
  const seenEvents=new Set(), active=new Set(), seenSales=new Set();
  let duplicateEvents=0, sellerDeclaredSales=0, corroboratedSales=0;
  for(const e of activityEvents){
    if(!e || !uuid(e.id) || !uuid(e.actorId) || !day(e.occurredAt) || !activityKinds.has(e.kind) || e.origin!=='server')
      throw new TypeError('invalid server activity record');
    if(seenEvents.has(e.id)){duplicateEvents++;continue;}
    seenEvents.add(e.id);
    if(inside(e.occurredAt) && registered.has(e.actorId))active.add(e.actorId);
  }
  for(const s of sales){
    if(!s || !uuid(s.id) || !uuid(s.sellerId) || !uuid(s.buyerId) ||
       !day(s.sellerDeclaredAt) || !['seller-declared','corroborated'].includes(s.state))
      throw new TypeError('invalid sale audit record');
    if(seenSales.has(s.id))throw new TypeError('duplicate sale identifier');
    seenSales.add(s.id);
    if(!inside(s.sellerDeclaredAt))continue;
    sellerDeclaredSales++;
    if(s.state==='corroborated' && s.sellerId!==s.buyerId &&
       inside(s.buyerConfirmedAt) && inside(s.reconciledAt) &&
       typeof s.serverProofId==='string' && /^[a-zA-Z0-9_-]{8,128}$/.test(s.serverProofId))
      corroboratedSales++;
  }
  const round=n=>Math.round(n*100)/100;
  return Object.freeze({
    period, evidenceRecorded:true, registeredUsers:registered.size, activeUsers:active.size,
    sellerDeclaredSales, corroboratedSales, duplicateEvents,
    activeRatePercent:registered.size>0?round(active.size/registered.size*100):null,
    corroborationRatePercent:sellerDeclaredSales>0?round(corroboratedSales/sellerDeclaredSales*100):null,
    independentlyVerified:false, sourceUrl:source.url,
    reason:'أرقام من تصدير ادعى المدخل أنه مدقق؛ لا توثّق صحة المصدر خارجيًا ولا تعتبر إعلان البائع صفقة مثبتة.'
  });
}
