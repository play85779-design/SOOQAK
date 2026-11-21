const {test,expect}=require('@playwright/test');

// All records and authenticated users are simulated in-browser, never in Supabase.
const sdk=`
const uid='11111111-1111-4111-8111-111111111111';
const rows=[
 {id:'00000000-0000-4000-8000-000000000001',owner_id:uid,kind:'workshop',name:'ورشة الجبيل التجريبية',city:'الجبيل',district:'الفناتير',specialty:'ميكانيكا سيارات',description:'ورشة وهمية للفحص',status:'active',moderation_state:'approved',created_at:'2026-11-20T00:00:00Z',updated_at:'2026-11-20T00:00:00Z'},
 {id:'00000000-0000-4000-8000-000000000002',owner_id:uid,kind:'plumbing',name:'محل غير معتمد',city:'الجبيل',district:'',specialty:'أدوات صحية',description:'طلب مراجعة',status:'active',moderation_state:'pending',created_at:'2026-11-21T00:00:00Z',updated_at:'2026-11-21T00:00:00Z'},
 {id:'00000000-0000-4000-8000-000000000003',owner_id:uid,kind:'delivery',name:'مندوب توصيل تجريبي',city:'الدمام',district:'',specialty:'توصيل طرود',description:'توصيل وهمي',status:'active',moderation_state:'approved',created_at:'2026-11-20T00:00:00Z',updated_at:'2026-11-20T00:00:00Z'}
];
window.__SOOQAK_SERVICE_INSERTS=[];
function query(table){
 let criteria=[],start=0,size=100,inserted=null;
 const q={
  select:()=>q,
  order:()=>q,
  range:(s,e)=>{start=s;size=e-s+1;return q},
  limit:n=>{size=n;return q},
  eq:(name,value)=>{criteria.push(v=>v[name]===value);return q},
  ilike:(name,expr)=>{const str=expr.replace(/%/g,'').toLowerCase();criteria.push(v=>String(v[name]||'').toLowerCase().includes(str));return q},
  or:()=>q,
  insert:v=>{inserted=v;window.__SOOQAK_SERVICE_INSERTS.push(v);return q},
  update:v=>{inserted=v;return q},
  single:async()=>({data:{id:'00000000-0000-4000-8000-000000000099'},error:null}),
  then:(ok,bad)=>{const selected=table==='sooqak_service_directory'?rows.filter(r=>criteria.every(f=>f(r))):[];return Promise.resolve({data:selected.slice(start,start+size),count:selected.length,error:null}).then(ok,bad)}
 };
 return q;
}
export function createClient(){
 return {
  auth:{getUser:async()=>({data:{user:window.__SOOQAK_SERVICE_AUTH?{id:uid,email_confirmed_at:'2026-11-20T00:00:00Z'}:null},error:window.__SOOQAK_SERVICE_AUTH?null:{name:'AuthSessionMissingError'}})},
  rpc:async()=>({data:false,error:null}),
  from:query
 };
}
`;
async function start(page,url,authenticated=false){
 await page.addInitScript(value=>{window.__SOOQAK_SERVICE_AUTH=value},authenticated);
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',r=>r.fulfill({status:200,contentType:'text/javascript',body:sdk}));
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.goto(url,{waitUntil:'domcontentloaded'});
}
test('pending and suspended business entries are excluded from public service directory',async({page})=>{
 await start(page,'/services.html');
 await expect(page.locator('#cards')).toContainText('ورشة الجبيل التجريبية');
 await expect(page.locator('#cards')).not.toContainText('محل غير معتمد');
 await expect(page.locator('#cards')).toContainText('مندوب توصيل تجريبي');
});
test('workshop category filter excludes approved delivery listings',async({page})=>{
 await start(page,'/services.html?kind=workshop');
 await expect(page.locator('#cards')).toContainText('ورشة الجبيل التجريبية');
 await expect(page.locator('#cards')).not.toContainText('مندوب توصيل تجريبي');
});
test('submission for new service never sets approved state in browser payload',async({page})=>{
 await start(page,'/services.html?kind=workshop',true);
 await page.locator('#addService').click();
 await expect(page.locator('#serviceForm')).toBeVisible();
 await page.locator('#serviceForm [name="name"]').fill('خدمة فحص جديدة');
 await page.locator('#serviceForm [name="city"]').fill('الجبيل');
 await page.locator('#serviceForm [name="description"]').fill('خدمة وهمية للفحص الآلي');
 await page.locator('#serviceForm button[type="submit"]').click();
 await expect.poll(()=>page.evaluate(()=>window.__SOOQAK_SERVICE_INSERTS.length)).toBe(1);
 const payload=await page.evaluate(()=>window.__SOOQAK_SERVICE_INSERTS[0]);
 expect(payload.moderation_state).toBeUndefined();
 expect(payload.status).toBeUndefined();
 expect(payload.name).toBe('خدمة فحص جديدة');
});
test('admin panel stays hidden when signed-in user is not in server allowlist',async({page})=>{
 await start(page,'/admin-services.html',true);
 await expect(page.locator('#adminTools')).toBeHidden();
 await expect(page.locator('#status')).toContainText('للمشرفين');
});
