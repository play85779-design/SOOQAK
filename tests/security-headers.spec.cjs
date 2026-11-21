const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
test('Vercel preview config defines conservative security response headers',async()=>{
 const config=JSON.parse(fs.readFileSync(path.join(process.cwd(),'vercel.json'),'utf8'));
 const global=config.headers.find(h=>h.source==='/(.*)');
 expect(global).toBeTruthy();
 const headers=Object.fromEntries(global.headers.map(h=>[h.key.toLowerCase(),h.value]));
 expect(headers['x-content-type-options']).toBe('nosniff');
 expect(headers['x-frame-options']).toBe('DENY');
 expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
 expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
 expect(headers['content-security-policy']).toContain("base-uri 'self'");
 expect(headers['content-security-policy']).toContain("object-src 'none'");
 expect(headers['permissions-policy']).toContain('camera=()');
});
