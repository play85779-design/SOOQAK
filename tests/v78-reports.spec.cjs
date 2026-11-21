const {test,expect}=require('@playwright/test');
test('V78 delayed open reports cannot replace closed reports or survive sign-out',async({page})=>{
 await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:`
 export function createClient(){
  return {auth:{getUser:async()=>({data:{user:{id:'admin',email_confirmed_at:'now'}}}),onAuthStateChange:cb=>window.changeSession=cb},
   rpc:async()=>({data:true}),from:table=>{
    let status;
    const q={select:()=>q,order:()=>q,eq:(key,value)=>{status=value;return q},limit:()=>{
     if(table==='sooqak_service_directory')return Promise.resolve({data:[]});
     const result={data:[{id:status,reason:status,created_at:'2026-11-21'}]};
     if(status==='pending')return new Promise(resolve=>window.finishOpen=()=>resolve(result));
     return Promise.resolve(result);
    }};
    return q;
   }
  }
 }
 `}));
 await page.goto('/admin-services.html');
 await page.waitForFunction(()=>typeof window.finishOpen==='function');
 await page.locator('#statusFilter').selectOption('closed');
 await expect(page.locator('#reports')).toContainText('closed');
 await page.evaluate(()=>window.finishOpen());
 await expect(page.locator('#reports')).not.toContainText('pending');
 await page.evaluate(()=>window.changeSession('SIGNED_OUT',null));
 await expect(page.locator('#adminTools')).toBeHidden();
 await expect(page.locator('#reports article')).toHaveCount(0);
});

test('V77 closing the marketplace dashboard invalidates pending private report data',async({page})=>{
 await page.route('**/cloud.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  window.SOOQAK_CLOUD_ENABLED=true;state.account={id:'moderator'};
  let complete;
  window.sooqakCloud={getAdminDashboard:()=>new Promise(resolve=>complete=resolve)};
  const pending=openCloudAdminDashboard();
  closeModal();
  complete({reports:[{id:'private',details:'محتوى خاص'}]});
  await pending;
 });
 await expect(page.locator('#modalContent')).toBeEmpty();
});
