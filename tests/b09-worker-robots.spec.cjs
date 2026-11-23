const {test,expect} = require('@playwright/test');
const owner={id:'worker-owner',email_confirmed_at:'2026-11-23T00:00:00Z'};
async function mockClient(page,{user=owner,allow=true,activity=[],error=false}={}) {
  const body=[
    'export function createClient(){',
    ' window.__workerRpcCalls=[];let cb=()=>{};',
    ' return {auth:{getUser:async()=>({data:{user:'+JSON.stringify(user)+'},error:null}),',
    ' onAuthStateChange:(fn)=>{cb=fn;return {data:{subscription:{unsubscribe(){}}}};}},',
    ' rpc:async(name)=>{window.__workerRpcCalls.push(name);',
    ' if(name==="sooqak_is_owner")return {data:'+JSON.stringify(allow)+',error:null};',
    ' if(name==="sooqak_owner_worker_status")return {data:'+JSON.stringify(activity)+',error:'+JSON.stringify(error?{message:'not connected'}:null)+'};',
    ' return {data:null,error:{message:"not found"}};',
    ' }};',
    '}'
  ].join('');
  await page.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({contentType:'text/javascript',body}));
}
test('B09 robots: visitor and non-owner never trigger worker RPC or see dashboard',async({page})=>{
  await mockClient(page,{user:null});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerPanel')).toBeHidden();
  expect(await page.evaluate(()=>window.__workerRpcCalls)).toEqual([]);
  await mockClient(page,{allow:false});
  await page.reload();
  await expect(page.locator('#ownerPanel')).toBeHidden();
  expect(await page.evaluate(()=>window.__workerRpcCalls)).toEqual(['sooqak_is_owner']);
});
test('B09 robots: owner with missing backend sees three stationary robots and working refresh button',async({page})=>{
  await mockClient(page,{error:true});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerPanel')).toBeVisible();
  await expect(page.locator('[data-worker-id]')).toHaveCount(3);
  await expect(page.locator('[data-worker-state="unknown"]')).toHaveCount(3);
  await expect(page.locator('#workerConnectionNote')).toContainText('لا يوجد اتصال حي');
  await page.locator('#refreshWorkerStatus').click();
  await expect.poll(()=>page.evaluate(()=>window.__workerRpcCalls.filter(x=>x==="sooqak_owner_worker_status").length)).toBe(2);
  await expect(page.locator('[data-worker-state="running"]')).toHaveCount(0);
});
test('B09 robots: only fresh verified heartbeat animates the correct worker',async({page})=>{
  const now=Date.now(),iso=v=>new Date(v).toISOString();
  const activity=[
    {id:'W1',source:'automations_verified',server_verified:true,status:'in_progress',updated_at:iso(now-3000),started_at:iso(now-45000),heartbeat_at:iso(now-10000),task:'فحص تجربة المستخدم'},
    {id:'W2',source:'automations_verified',server_verified:true,status:'in_progress',updated_at:iso(now-3000),started_at:iso(now-450000),heartbeat_at:iso(now-300000),task:'فحص قديم'}
  ];
  await mockClient(page,{activity});
  await page.goto('/owner-center.html');
  await expect(page.locator('[data-worker-id="W1"]')).toHaveAttribute('data-worker-state','running');
  await expect(page.locator('[data-worker-id="W1"] [data-worker-state-label]')).toHaveText('يعمل الآن');
  await expect(page.locator('[data-worker-id="W2"]')).toHaveAttribute('data-worker-state','unknown');
  await expect(page.locator('[data-worker-id="W3"]')).toHaveAttribute('data-worker-state','unknown');
});
test('B09 robots: malformed activity or unverified data cannot claim success',async({page})=>{
  await mockClient(page,{activity:[{id:'W1',status:'completed',task:'<img src=x onerror=alert(1)>'}]});
  await page.goto('/owner-center.html');
  await expect(page.locator('[data-worker-id="W1"]')).toHaveAttribute('data-worker-state','unknown');
  await expect(page.locator('[data-worker-id="W1"] [data-worker-proof]')).toBeHidden();
});

test('B09 robots: working animation expires on an open tab without another backend call',async({page})=>{
  await page.clock.install();
  const now=Date.now(),iso=v=>new Date(v).toISOString();
  await mockClient(page,{activity:[{
    id:'W1',source:'automations_verified',server_verified:true,status:'in_progress',
    updated_at:iso(now-2000),started_at:iso(now-50000),
    heartbeat_at:iso(now-10000),task:'فحص جارٍ'
  }]});
  await page.goto('/owner-center.html');
  await expect(page.locator('[data-worker-id="W1"]')).toHaveAttribute('data-worker-state','running');
  await page.clock.fastForward(140000);
  await expect(page.locator('[data-worker-id="W1"]')).toHaveAttribute('data-worker-state','unknown');
  await expect(page.locator('[data-worker-id="W1"] [data-worker-state-label]')).toHaveText('غير متصل');
  expect(await page.evaluate(()=>window.__workerRpcCalls.filter(x=>x==='sooqak_owner_worker_status').length)).toBe(1);
});

test('B09 robots: worker state unit suite is exercised in existing CI',async()=>{
  const {execFileSync}=require('node:child_process');
  const path=require('node:path');
  const report=execFileSync(process.execPath,['--test','tests/owner-workers.test.mjs'],{
    cwd:path.resolve(__dirname,'..'),encoding:'utf8',timeout:10000
  });
  expect(report).toMatch(/# tests 6/);
  expect(report).toMatch(/# pass 6/);
  expect(report).toMatch(/# fail 0/);
});
