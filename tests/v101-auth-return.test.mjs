import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sooqakAuthReturnURL} from '../v101/auth-return.mjs';
const cases = [
  ['nested preview', 'https://preview.example.org/v101/index.html?code=placeholder#access_token=placeholder','https://preview.example.org/v101/index.html'],
  ['v101 folder', 'https://preview.example.org/v101/','https://preview.example.org/v101/index.html'],
  ['v101 nested route', 'https://preview.example.org/v101/services/workshops','https://preview.example.org/v101/index.html'],
  ['flattened preview', 'https://preview.example.org/index.html#auth','https://preview.example.org/index.html'],
  ['other nested route', 'https://preview.example.org/category/vehicles','https://preview.example.org/index.html'],
  ['lookalike path', 'https://preview.example.org/v101-other/index.html','https://preview.example.org/index.html'],
  ['localhost v101', 'http://127.0.0.1:4173/v101/index.html?error=placeholder','http://127.0.0.1:4173/v101/index.html'],
  ['no credential leakage', 'https://name:password@preview.example.org/v101/index.html?code=x#token_hash=x','https://preview.example.org/v101/index.html'],
];
for(const [name,input,expected] of cases) test(name,()=>assert.equal(sooqakAuthReturnURL(input),expected));
for(const input of ['http://example.org/v101/index.html','file:///tmp/v101/index.html']) test('refuse '+input,()=>assert.throws(()=>sooqakAuthReturnURL(input)));
