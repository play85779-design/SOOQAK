/**
 * SOOQAK zero-cost release-safety regression gates (static only).
 * These checks do NOT establish live Supabase RLS, SMTP, backup, or billing safety.
 * A deliberate, reviewed production release may adjust these gates separately.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('static Vercel configuration keeps baseline browser hardening', () => {
  const config = JSON.parse(read('vercel.json'));
  const global = config.headers?.find(rule => rule.source === '/(.*)');
  assert.ok(global, 'a global security-header rule is required');
  const headers = Object.fromEntries(
    global.headers.map(({ key, value }) => [key.toLowerCase(), value])
  );
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['x-frame-options'], 'DENY');
  assert.ok(headers['referrer-policy']);
  const csp = headers['content-security-policy'] || '';
  for (const directive of ["frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'"]) {
    assert.ok(csp.includes(directive), 'missing required CSP directive');
  }
  assert.ok((headers['permissions-policy'] || '').includes('camera=()'));
});

test('owner dashboard is hidden in the source before any async authorization', () => {
  const html = read('owner-center.html');
  assert.match(html, /<section\s+id="ownerPanel"\s+hidden\b/);
  assert.match(html, /<meta\s+name="robots"\s+content="noindex,nofollow,noarchive"/);
  assert.match(html, /\[hidden\]\s*\{display:none!important\}/);
});

test('owner dashboard code retains strict server-side role gating', () => {
  const js = read('owner-center.js');
  assert.match(js, /auth\.getUser\(\)/);
  assert.match(js, /email_confirmed_at/);
  assert.match(js, /api\.rpc\('sooqak_is_owner'\)/);
  assert.match(js, /permission\?\.data\s*!==\s*true/);
  assert.match(js, /panel\.hidden\s*=\s*true/);
  assert.match(js, /initializeOwnerPanel\(\)\.catch/);
});

test('public top-level browser files do not contain privileged Supabase credentials', () => {
  const names = fs.readdirSync(root).filter(name => /\.(?:html|js|mjs)$/.test(name));
  for (const name of names) {
    const content = read(name);
    assert.doesNotMatch(content, /sb_secret_[A-Za-z0-9_-]{8,}/, 'secret Supabase API key in public browser file');
    assert.doesNotMatch(content, /(?:SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_SECRET)\s*[:=]\s*['"`][^'"`]{8,}/i,
      'privileged server credential in public browser file');
  }
});

test('versioned workflows do not deploy or migrate production automatically', () => {
  const dir = path.join(root, '.github', 'workflows');
  for (const name of fs.readdirSync(dir).filter(x => /\.ya?ml$/.test(x))) {
    const source = fs.readFileSync(path.join(dir, name), 'utf8');
    assert.doesNotMatch(source, /\bvercel\s+(?:deploy\s+)?--prod\b/i, 'unreviewed production deployment');
    assert.doesNotMatch(source, /\bsupabase\s+db\s+push\b/i, 'unreviewed database push');
    assert.doesNotMatch(source, /\bsupabase\s+migration\s+up\b/i, 'unreviewed database migration');
  }
});

test('quality workflow retains no-cost syntactic, secret, browser and synthetic-restore checks', () => {
  const ci = read('.github/workflows/quality-smoke.yml');
  assert.match(ci, /python3 scripts\/check-secrets\.py/);
  assert.match(ci, /node --check/);
  assert.match(ci, /npx playwright test/);
  assert.match(ci, /scripts\/test-backup-restore\.sh/);
  assert.match(ci, /contents:\s*read/);
});

test('owner preview does not assert unverifiable financial amounts', () => {
  const html = read('owner-center.html');
  assert.equal((html.match(/data-financial-value>غير متحقق منه/g) || []).length, 4);
  assert.ok(!html.includes('sb_secret_'));
});
