import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewProviderEvidence} from '../owner-provider-audit.mjs';

const record = (id, invoiceSar = 0) => ({
  id, plan: 'Free', planEvidenceUrl: 'https://example.test/plan',
  invoiceSar, invoiceMonth: '2026-11', invoiceEvidenceUrl: 'https://example.test/invoice'
});

test('no providers is unknown, never billed zero', () => {
  const r = reviewProviderEvidence();
  assert.equal(r.totalDocumentedInvoiceSar,null);
  assert.equal(r.allInvoicesDocumented,false);
  assert.equal(r.allCapsDocumented,false);
});
test('a documented plan alone never proves its invoice', () => {
  const r = reviewProviderEvidence([{id:'one',plan:'Hobby',planEvidenceUrl:'https://example.test/plan'}]);
  assert.equal(r.rows[0].plan,'Hobby');
  assert.equal(r.rows[0].invoiceSar,null);
  assert.equal(r.totalDocumentedInvoiceSar,null);
});
test('verified-source zero is distinct from unknown, as a recorded value', () => {
  const r = reviewProviderEvidence([record('one',0)]);
  assert.equal(r.totalDocumentedInvoiceSar,0);
  assert.equal(r.allInvoicesDocumented,true);
  assert.equal(r.allCapsDocumented,false);
  assert.equal(r.actualProviderStopTested,false);
});
test('one missing invoice prevents a misleading grand total', () => {
  const r = reviewProviderEvidence([record('one',30),{id:'two',plan:'Free'}]);
  assert.equal(r.totalDocumentedInvoiceSar,null);
  assert.equal(r.rows[0].invoiceSar,30);
  assert.deepEqual(r.rows[1].missingEvidence,['plan','invoice','provider-hard-cap','alert']);
});
test('complete recorded invoices can be added without endorsing any purchase', () => {
  const r = reviewProviderEvidence([record('one',15.5),record('two',24.25)]);
  assert.equal(r.totalDocumentedInvoiceSar,39.75);
  assert.equal(r.automaticSpendStop,false);
});
test('alerts do not count as hard spend caps', () => {
  const r = reviewProviderEvidence([{...record('one',10), alertEnabled:true,alertEvidenceUrl:'https://example.test/alert'}]);
  assert.equal(r.allAlertsDocumented,true);
  assert.equal(r.allCapsDocumented,false);
});
test('a reported hard cap is not a live enforcement test', () => {
  const r = reviewProviderEvidence([{...record('one',10), hardCapEnforced:true,hardCapEvidenceUrl:'https://example.test/cap'}]);
  assert.equal(r.allCapsDocumented,true);
  assert.equal(r.actualProviderStopTested,false);
  assert.equal(r.automaticSpendStop,false);
});
test('malformed, negative, textual and stale-looking invoice fields stay unknown', () => {
  for (const patch of [{invoiceSar:'0'},{invoiceSar:-1},{invoiceSar:NaN},{invoiceMonth:'2026-13'},{invoiceEvidenceUrl:''}]) {
    const r = reviewProviderEvidence([{...record('one',4),...patch}]);
    assert.equal(r.totalDocumentedInvoiceSar,null);
  }
});
test('duplicate or invalid provider IDs and overlarge inventories are rejected', () => {
  assert.throws(() => reviewProviderEvidence([record('one'),record('one')]),TypeError);
  assert.throws(() => reviewProviderEvidence([{id:'../bad'}]),TypeError);
  assert.throws(() => reviewProviderEvidence(new Array(101).fill(null)),TypeError);
});
test('results and nested evidence arrays are immutable', () => {
  const r=reviewProviderEvidence([record('one',2)]);
  assert.ok(Object.isFrozen(r));
  assert.ok(Object.isFrozen(r.rows));
  assert.ok(Object.isFrozen(r.rows[0]));
  assert.ok(Object.isFrozen(r.rows[0].missingEvidence));
});
