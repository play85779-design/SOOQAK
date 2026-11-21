/**
 * SOOQAK B00/B01 - Offline inventory of provider billing evidence.
 * Advisory only. Source URLs are supplied by a trusted reviewer; their
 * existence is not proof that a provider enforced a budget or issued a bill.
 * This module makes no network calls, purchases, notifications or changes.
 */
const amount = v => typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
const source = v => typeof v === 'string' && /^https:\/\/[^\s]+$/i.test(v);
const month = v => typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
const round = v => Math.round((v + Number.EPSILON) * 100) / 100;

export function reviewProviderEvidence(providers = []) {
  if (!Array.isArray(providers) || providers.length > 100)
    throw new TypeError('providers must be an array of at most 100 records');
  const ids = new Set();
  const rows = providers.map(p => {
    if (!p || typeof p !== 'object' || Array.isArray(p) ||
        typeof p.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(p.id) ||
        ids.has(p.id)) throw new TypeError('invalid or duplicate provider id');
    ids.add(p.id);
    const planDocumented = typeof p.plan === 'string' && p.plan.trim().length > 0 &&
      source(p.planEvidenceUrl);
    const invoiceDocumented = amount(p.invoiceSar) !== null &&
      month(p.invoiceMonth) && source(p.invoiceEvidenceUrl);
    const hardCapDocumented = p.hardCapEnforced === true && source(p.hardCapEvidenceUrl);
    const alertDocumented = p.alertEnabled === true && source(p.alertEvidenceUrl);
    const missing = [];
    if (!planDocumented) missing.push('plan');
    if (!invoiceDocumented) missing.push('invoice');
    if (!hardCapDocumented) missing.push('provider-hard-cap');
    if (!alertDocumented) missing.push('alert');
    return Object.freeze({
      id: p.id,
      plan: planDocumented ? p.plan.trim() : null,
      invoiceMonth: invoiceDocumented ? p.invoiceMonth : null,
      invoiceSar: invoiceDocumented ? round(p.invoiceSar) : null,
      planDocumented,
      invoiceDocumented,
      hardCapDocumented,
      alertDocumented,
      missingEvidence: Object.freeze(missing)
    });
  });
  const allInvoicesDocumented = rows.length > 0 && rows.every(r => r.invoiceDocumented);
  const periods = new Set(rows.filter(r => r.invoiceDocumented).map(r => r.invoiceMonth));
  const sameInvoiceMonth = allInvoicesDocumented && periods.size === 1;
  // Never sum October bills with November bills into a supposed monthly total.
  const sum = sameInvoiceMonth ? rows.reduce((total,r) => total+r.invoiceSar,0) : null;
  const total = sum !== null && Number.isFinite(sum) ? round(sum) : null;
  return Object.freeze({
    providerCount: rows.length,
    rows: Object.freeze(rows),
    totalDocumentedInvoiceSar: total,
    invoiceMonth: sameInvoiceMonth ? rows[0].invoiceMonth : null,
    allInvoicesDocumented: total !== null,
    allCapsDocumented: rows.length > 0 && rows.every(r => r.hardCapDocumented),
    allAlertsDocumented: rows.length > 0 && rows.every(r => r.alertDocumented),
    // Even a documented provider setting is not an authenticated provider test.
    actualProviderStopTested: false,
    automaticSpendStop: false,
    reason: 'غياب فاتورة أو إثبات يظل مجهولًا لا صفراً. التوثيق لا يثبت إجراء إيقاف مالي فعلي.'
  });
}
