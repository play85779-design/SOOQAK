const {test,expect}=require('@playwright/test');
const uid='11111111-1111-4111-8111-111111111111',aid='22222222-2222-4222-8222-222222222222';
function sdk(variant){
 const user=variant===0?'null':`{id:'${uid}',email_confirmed_at:'2026-11-23'}`;
 const account=variant===1?'null':`{id:'${aid}',display_name:'تجريبي',kind:'business'}`;
 return 'export function createClient(){const user='+user+';const account='+account+
 ';const chain={select:()=>chain,eq:()=>chain,order:()=>chain,maybeSingle:async()=>({data:account,error:null}),limit:async()=>({data:[{id:"item",title:"جوال",status:"active",price:500,city:"الجبيل"}],count:1,error:null})};'+
 'return {auth:{getUser:async()=>({data:{user},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:()=>chain}}';
}
async function open(page,variant){await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:sdk(variant)}));await page.goto('/merchant-dashboard.html',{waitUntil:'domcontentloaded'});}
test('anonymous cannot view merchant data',async({page})=>{await open(page,0);await expect(page.locator('#dashGate')).toContainText('سجّل دخولك');await expect(page.locator('#dashPanel')).toBeHidden()});
test('signed-in personal user cannot view a nonexisting business account',async({page})=>{await open(page,1);await expect(page.locator('#dashGate')).toContainText('ما عندك حساب متجر');await expect(page.locator('#dashPanel')).toBeHidden()});
test('owner-only merchant dashboard reads account listings',async({page})=>{await open(page,2);await expect(page.locator('#dashPanel')).toBeVisible();await expect(page.locator('#dashStoreName')).toHaveText('تجريبي');await expect(page.locator('#dashTotal')).toHaveText('1');await expect(page.locator('#dashPublicStore')).toHaveAttribute('href','./store.html?id='+aid);await expect(page.locator('#dashListings')).toContainText('جوال')});
