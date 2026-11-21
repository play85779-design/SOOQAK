import { sooqakAuthReturnURL } from './auth-return.mjs';
/* ربط تجريبي اختياري مع Supabase. لا يُحمّل أي كود خارجي عند غياب إعدادات المشروع. */
if (window.SOOQAK_CLOUD_ENABLED) {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const opts = window.SOOQAK_SUPABASE;
    const supabase = createClient(opts.url, opts.publishableKey, {
      auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
    });
    let currentUser = null;
    const verified = u => Boolean(u?.email_confirmed_at);
    function errorIfAny({error}) { if (error) throw error; }
    async function refreshUser() {
      const {data,error} = await supabase.auth.getUser();
      if (error && error.name !== 'AuthSessionMissingError') throw error;
      currentUser = verified(data?.user) ? data.user : null;
      window.dispatchEvent(new CustomEvent('sooqak:auth', {detail:{user:currentUser}}));
    }
    async function ensureAccount(kind, displayName) {
      if (!currentUser) throw new Error('يرجى تسجيل الدخول ببريد مؤكد أولًا');
      if (!['personal','business'].includes(kind)) throw new Error('نوع الحساب غير صحيح');
      const {data:existing,error:lookupErr} = await supabase.from('sooqak_accounts')
        .select('id,kind,display_name').eq('owner_id',currentUser.id).eq('kind',kind).maybeSingle();
      if (lookupErr) throw lookupErr;
      if (existing) return existing;
      const name = String(displayName || currentUser.user_metadata?.full_name ||
        currentUser.email?.split('@')[0] || 'بائع جديد').trim().slice(0,60);
      const {data,error} = await supabase.from('sooqak_accounts')
        .insert({owner_id:currentUser.id,kind,display_name:name.length<2?'مستخدم سوقك':name})
        .select('id,kind,display_name').single();
      if (error) throw error;
      return data;
    }
    // Shared public hydration for search pages and saved favorites. RLS remains authoritative.
    async function enrichListings(data) {
      if(!data?.length)return[];
      const ids=data.map(a=>a.id);
      const photos=await supabase.from('sooqak_listing_photos')
        .select('id,listing_id,storage_path,position,confirmed')
        .in('listing_id',ids).eq('confirmed',true).order('position',{ascending:true}).limit(1000);
      errorIfAny(photos);
      const byListing=new Map();
      for(const photo of photos.data||[]){
        const publicUrl=supabase.storage.from('sooqak-listing-photos').getPublicUrl(photo.storage_path).data.publicUrl;
        const images=byListing.get(photo.listing_id)||[];
        images.push({...photo,url:publicUrl});byListing.set(photo.listing_id,images);
      }
      const result=await supabase.from('sooqak_listing_contacts')
        .select('listing_id,phone_e164,show_whatsapp,show_call')
        .in('listing_id',ids).limit(200);
      errorIfAny(result);
      const byContact=new Map((result.data||[]).map(row=>[row.listing_id,row]));
      return data.map(listing=>({...listing,photos:byListing.get(listing.id)||[],contact:byContact.get(listing.id)||null}));
    }
    async function fetchListings(offset=0,pageSize=60,criteria={}) {
      let query=supabase.from('sooqak_listings')
        .select('id,account_id,seller_user_id,seller_display_name,seller_kind,title,description,category,city,district,listing_kind,price,price_mode,status,created_at,expires_at,bumped_at,reserved_until,hidden_at,renewed_at,renewal_count');
      if(criteria.category)query=query.eq('category',criteria.category);
      if(criteria.city)query=query.eq('city',criteria.city);
      if(criteria.kind)query=query.eq('listing_kind',criteria.kind==='مطلوب'?'wanted':'sale');
      if(criteria.district)query=query.ilike('district','%'+String(criteria.district).replace(/[%_*,()\\]/g,'').slice(0,70)+'%');
      if(criteria.min!=='' && criteria.min!=null && Number.isFinite(Number(criteria.min)))query=query.gte('price',Number(criteria.min));
      if(criteria.max!=='' && criteria.max!=null && Number.isFinite(Number(criteria.max)))query=query.lte('price',Number(criteria.max));
      if(criteria.q){
        // PostgREST safe characters; robust Arabic normalization needs a later DB search index.
        const value=String(criteria.q).replace(/[\\%_*,()]/g,' ').replace(/\s+/g,' ').trim().slice(0,70);
        if(value)query=query.or(`title.ilike.%${value}%,description.ilike.%${value}%`);
      }
      if(criteria.sort==='cheap')query=query.order('price',{ascending:true,nullsFirst:false});
      else if(criteria.sort==='expensive')query=query.order('price',{ascending:false,nullsFirst:false});
      else query=query.order('created_at',{ascending:false});
      const {data,error} = await query.order('id',{ascending:false}).range(Math.max(0,offset),Math.max(0,offset)+Math.min(60,Math.max(1,pageSize))-1);
      if (error) throw error;
      return enrichListings(data);
    }
    // A shared advertisement may be older than the first paginated public feed.
    // Its detail is loaded by exact UUID and always checked by Supabase RLS.
    async function fetchListingById(id) {
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id||'')))return null;
      const response=await supabase.from('sooqak_listings')
        .select('id,account_id,seller_user_id,seller_display_name,seller_kind,title,description,category,city,district,listing_kind,price,price_mode,status,created_at,expires_at,bumped_at,reserved_until,hidden_at,renewed_at,renewal_count')
        .eq('id',id).maybeSingle();
      errorIfAny(response);
      if(!response.data)return null;
      const entries=await enrichListings([response.data]);
      return entries[0]||null;
    }
    // Saved ads must be fetched by their own IDs, not only from the first search page.
    // Requests are batched to keep browser/API URL sizes bounded; RLS excludes forbidden rows.
    async function fetchFavoriteListings() {
      if (!currentUser) return [];
      const ids=[...new Set((await listFavorites()).filter(id=>/^[a-f0-9-]{36}$/i.test(String(id))))].slice(0,300);
      const all=[];
      for(let offset=0;offset<ids.length;offset+=40){
        const batch=ids.slice(offset,offset+40);
        const response=await supabase.from('sooqak_listings')
          .select('id,account_id,seller_user_id,seller_display_name,seller_kind,title,description,category,city,district,listing_kind,price,price_mode,status,created_at,expires_at,bumped_at,reserved_until,hidden_at,renewed_at,renewal_count')
          .in('id',batch).order('created_at',{ascending:false}).limit(40);
        errorIfAny(response);
        all.push(...await enrichListings(response.data||[]));
      }
      return all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    }

    // Owner library is paged independently of the public feed (including sold/hidden ads).
    async function countMyListings(kind='personal') {
      if(!currentUser)throw new Error('سجّل الدخول إلى حسابك أولًا');
      if(!['personal','business'].includes(kind))throw new Error('نوع الحساب غير صالح');
      const r=await supabase.from('sooqak_listings').select('id',{count:'exact',head:true})
        .eq('seller_user_id',currentUser.id).eq('seller_kind',kind);
      errorIfAny(r);
      return Number(r.count)||0;
    }
    async function fetchMyListings(offset=0,pageSize=40,kind='personal') {
      if(!currentUser)throw new Error('سجّل الدخول إلى حسابك أولًا');
      if(!['personal','business'].includes(kind))throw new Error('نوع الحساب غير صالح');
      const start=Math.max(0,Number(offset)||0),count=Math.min(40,Math.max(1,Number(pageSize)||40));
      const response=await supabase.from('sooqak_listings')
        .select('id,account_id,seller_user_id,seller_display_name,seller_kind,title,description,category,city,district,listing_kind,price,price_mode,status,created_at,expires_at,bumped_at,reserved_until,hidden_at,renewed_at,renewal_count')
        .eq('seller_user_id',currentUser.id).eq('seller_kind',kind)
        .order('created_at',{ascending:false}).order('id',{ascending:false})
        .range(start,start+count-1);
      errorIfAny(response);
      return enrichListings(response.data||[]);
    }
    async function saveListing(payload, existingId=null) {
      if (!currentUser) throw new Error('سجّل الدخول أولًا');
      let response;
      if (existingId) {
        // يحمي الخادم ملكية الصف عبر RLS؛ لا نثق بمعرف الحساب من المتصفح.
        const {account_id,...safe} = payload;
        response = await supabase.from('sooqak_listings').update(safe)
          .eq('id',existingId).eq('seller_user_id',currentUser.id).select('id').single();
      } else {
        response = await supabase.from('sooqak_listings').insert(payload).select('id').single();
      }
      errorIfAny(response);
      return response.data?.id;
    }
    async function getSales() {
      if (!currentUser) return [];
      const {data,error} = await supabase.from('sooqak_sales')
        .select('id,listing_id,final_price,commission,recorded_at,account_id,corrected_at,correction_count')
        .eq('seller_user_id',currentUser.id).order('recorded_at',{ascending:false});
      if (error) throw error;
      return data;
    }
    async function getSaleCorrections() {
      if (!currentUser) return [];
      const {data,error} = await supabase.from('sooqak_sale_corrections')
        .select('id,sale_id,listing_id,old_price,new_price,old_commission,new_commission,reason,created_at')
        .eq('seller_user_id',currentUser.id).order('created_at',{ascending:false}).limit(100);
      if (error) throw error;
      return data||[];
    }
    async function correctSalePrice(saleId,price,reason) {
      if (!currentUser) throw new Error('سجّل الدخول أولًا');
      const amount=Number(price);
      if (!Number.isFinite(amount)||amount<=0||amount>999999999.99||Math.round(amount*100)!==amount*100 && Math.abs(Math.round(amount*100)-amount*100)>1e-7)
        throw new Error('السعر النهائي غير صحيح');
      const reasonText=String(reason||'').trim();
      if (reasonText.length<10||reasonText.length>300) throw new Error('اذكر سبب التصحيح من 10 إلى 300 حرف');
      return runRpc('sooqak_correct_sale_price',{p_sale:saleId,p_price:amount,p_reason:reasonText});
    }
    async function getAdminSaleCorrections(){
      if(!currentUser) throw new Error('يلزم تسجيل الدخول');
      return runRpc('sooqak_admin_sale_corrections',{p_limit:30});
    }
    async function removeListing(id) {
      // Preserve conversations and sales: a removed ad is hidden, not physically deleted.
      return runRpc('sooqak_hide_listing',{p_listing:id});
    }
    async function runRpc(name, args) {
      const r=await supabase.rpc(name,args);errorIfAny(r);return r.data;
    }
    async function uploadPhotos(listingId,blobs) {
      if(!currentUser)throw new Error('يجب تسجيل الدخول لرفع الصور');
if(!currentUser)throw new Error('يجب تسجيل الدخول لرفع الصور');
      if(!Array.isArray(blobs)||blobs.length>5)throw new Error('الحد الأقصى 5 صور');
      for (const blob of blobs) {
        if(blob.type!=='image/jpeg'||blob.size>1572864||blob.size===0)
          throw new Error('الصورة المضغوطة يجب أن تكون JPEG وأقل من 1.5 ميجابايت');
        const registered=await supabase.from('sooqak_listing_photos')
          .insert({listing_id:listingId})
          .select('id,storage_path').single();
        errorIfAny(registered);
        const photo=registered.data;
        try {
          const sent=await supabase.storage.from('sooqak-listing-photos')
            .upload(photo.storage_path,blob,{contentType:'image/jpeg',upsert:false,cacheControl:'3600'});
          errorIfAny(sent);
          await runRpc('sooqak_confirm_photo',{p_photo:photo.id});
        } catch(err) {
          // Best effort rollback; incomplete records can be cleaned in admin maintenance.
          await supabase.storage.from('sooqak-listing-photos').remove([photo.storage_path]).catch(()=>{});
          await supabase.from('sooqak_listing_photos').delete().eq('id',photo.id);
          throw err;
        }
      }
    }
    async function removePhoto(photoId,storagePath) {
      if(!currentUser)throw new Error('يجب تسجيل الدخول');
      const existing=await supabase.from('sooqak_listing_photos')
        .select('id,storage_path,owner_id').eq('id',photoId).single();
      errorIfAny(existing);
      if(existing.data.owner_id!==currentUser.id||existing.data.storage_path!==storagePath)
        throw new Error('لا تملك صلاحية هذه الصورة');
      const removed=await supabase.storage.from('sooqak-listing-photos').remove([storagePath]);
      errorIfAny(removed);
      const deleted=await supabase.from('sooqak_listing_photos').delete().eq('id',photoId).select('id').single();
      errorIfAny(deleted);
    }
    async function openOrCreateConversation(listingId) {
      if (!currentUser) throw new Error('يرجى تسجيل الدخول أولًا');
      const table=supabase.from('sooqak_conversations');
      const existing=await table.select('id,listing_id,buyer_id,seller_id,created_at')
        .eq('listing_id',listingId).eq('buyer_id',currentUser.id).maybeSingle();
      errorIfAny(existing);
      if(existing.data)return existing.data;
      const response=await supabase.from('sooqak_conversations').insert({listing_id:listingId})
        .select('id,listing_id,buyer_id,seller_id,created_at').single();
      if(response.error?.code==='23505') {
        const retry=await supabase.from('sooqak_conversations')
          .select('id,listing_id,buyer_id,seller_id,created_at')
          .eq('listing_id',listingId).eq('buyer_id',currentUser.id).single();
        errorIfAny(retry);return retry.data;
      }
      errorIfAny(response);return response.data;
    }
    async function isConversationMuted(conversationId){
      if(!currentUser)return false;
      const r=await supabase.from('sooqak_conversation_mutes').select('muted').eq('conversation_id',conversationId).eq('user_id',currentUser.id).maybeSingle();
      errorIfAny(r);return !!r.data?.muted;
    }
    async function setConversationMuted(conversationId,muted){
      if(!currentUser)throw new Error('سجّل الدخول أولًا');
      const r=await supabase.from('sooqak_conversation_mutes').upsert({conversation_id:conversationId,user_id:currentUser.id,muted:!!muted,updated_at:new Date().toISOString()},{onConflict:'conversation_id,user_id'});
      errorIfAny(r);return true;
    }
    async function getAccountDraft(kind){
      if(!currentUser)return null;
      const r=await supabase.from('sooqak_account_drafts').select('payload').eq('user_id',currentUser.id).eq('account_kind',kind).maybeSingle();
      errorIfAny(r);return r.data?.payload||null;
    }
    async function saveAccountDraft(kind,input){
      if(!currentUser)throw new Error('سجّل الدخول أولًا');
      const allowed=['title','description','category','city','district','kind','price','priceType'];
      const payload={};for(const key of allowed)if(typeof input?.[key]==='string')payload[key]=input[key].slice(0,key==='description'?4000:120);
      const r=await supabase.from('sooqak_account_drafts').upsert({user_id:currentUser.id,account_kind:kind,payload,updated_at:new Date().toISOString()},{onConflict:'user_id,account_kind'});
      errorIfAny(r);return true;
    }
    async function deleteAccountDraft(kind){
      if(!currentUser)return;
      const r=await supabase.from('sooqak_account_drafts').delete().eq('user_id',currentUser.id).eq('account_kind',kind);
      errorIfAny(r);
    }
    async function reorderListingPhotos(listingId,ids){
      if(!currentUser)throw new Error('سجّل دخولك أولًا');
      return runRpc('sooqak_reorder_listing_photos',{p_listing:listingId,p_photo_ids:ids});
    }
    async function listConversations() {
      if(!currentUser)return[];
      const response=await supabase.from('sooqak_conversations')
        .select('id,listing_id,buyer_id,seller_id,created_at')
        .order('created_at',{ascending:false}).limit(100);
      errorIfAny(response);return response.data||[];
    }
    async function listMessages(conversationId) {
      if(!currentUser?.email_confirmed_at)throw new Error('سجّل الدخول بحساب مؤكد أولًا');
      const response=await supabase.from('sooqak_messages')
        .select('id,conversation_id,sender_id,body,created_at')
        .eq('conversation_id',conversationId).order('created_at',{ascending:true}).limit(200);
      errorIfAny(response);return response.data||[];
    }
    async function sendMessage(conversationId,body) {
      if(!currentUser)throw new Error('سجّل دخولك أولًا');
      const message=String(body||'').trim();
      if(message.length<1||message.length>1000)throw new Error('الرسالة يجب أن تكون بين حرف و1000 حرف');
      const response=await supabase.from('sooqak_messages')
        .insert({conversation_id:conversationId,body:message}).select('id').single();
      errorIfAny(response);return response.data;
    }
    async function getConversationBlockStatus(conversationId) {
      if (!currentUser) throw new Error('سجّل الدخول أولًا');
      const [both, mine] = await Promise.all([
        supabase.rpc('sooqak_conversation_is_blocked',{p_conversation:conversationId}),
        supabase.rpc('sooqak_my_conversation_block',{p_conversation:conversationId})
      ]);
      errorIfAny(both);errorIfAny(mine);
      return {blocked:Boolean(both.data),blockedByMe:Boolean(mine.data)};
    }
    async function setConversationBlocked(conversationId,blocked) {
      if (!currentUser) throw new Error('سجّل الدخول أولًا');
      return runRpc('sooqak_set_conversation_block',{
        p_conversation:conversationId,p_block:Boolean(blocked)
      });
    }
    async function submitReport(listingId,reason,details) {
      if(!currentUser)throw new Error('سجّل دخولك أولًا');
      const response=await supabase.from('sooqak_reports').insert({
        listing_id:listingId,reason:String(reason),details:String(details||'').trim().slice(0,1000)
      }).select('id').single();
      errorIfAny(response);return response.data;
    }
    async function isAdmin() {
      if (!currentUser) return false;
      const response=await supabase.rpc('sooqak_is_admin');
      errorIfAny(response);return response.data===true;
    }
    async function getAdminDashboard(status='pending') {
      if (!currentUser) throw new Error('يلزم تسجيل الدخول');
      if (!['pending','reviewing','closed','all'].includes(status)) throw new Error('حالة غير صالحة');
      return runRpc('sooqak_admin_dashboard',{p_status:status,p_limit:50});
    }
    async function adminReviewReport(reportId,status,note){
      return runRpc('sooqak_admin_review_report',{
        p_report:reportId,p_new_status:status,p_note:String(note||'').trim()
      });
    }
    async function adminHideReportedListing(reportId,note){
      return runRpc('sooqak_admin_hide_from_report',{
        p_report:reportId,p_note:String(note||'').trim()
      });
    }

    async function hasAcceptedPledge(){if(!currentUser)throw new Error('سجّل الدخول أولًا');const {data,error}=await supabase.from('sooqak_pledge_consents').select('accepted_at').eq('user_id',currentUser.id).maybeSingle();if(error)throw error;return !!data?.accepted_at;}
    async function acceptPledge(){if(!currentUser)throw new Error('سجّل الدخول أولًا');const {error}=await supabase.from('sooqak_pledge_consents').upsert({user_id:currentUser.id,version:1},{onConflict:'user_id',ignoreDuplicates:true});if(error)throw error;return true;}
    async function getContactPrefs(){if(!currentUser)throw new Error('سجّل الدخول أولًا');const {data,error}=await supabase.from('sooqak_contact_preferences').select('phone_e164,service_opt_in,marketing_opt_in').eq('user_id',currentUser.id).maybeSingle();if(error)throw error;return data;}
    async function saveContactPrefs(data){if(!currentUser)throw new Error('سجّل الدخول أولًا');const {error}=await supabase.from('sooqak_contact_preferences').upsert({user_id:currentUser.id,phone_e164:data.phone_e164,service_opt_in:data.service_opt_in,marketing_opt_in:data.marketing_opt_in},{onConflict:'user_id'});if(error)throw error;return true;}


    async function listFavorites(){
      if(!currentUser)return [];
      const {data,error}=await supabase.from('sooqak_favorites').select('listing_id').eq('user_id',currentUser.id).limit(300);
      if(error)throw error;return (data||[]).map(x=>x.listing_id);
    }
    async function setFavorite(listingId,active){
      if(!currentUser)throw new Error('تسجيل الدخول مطلوب للمفضلة');
      if(active){const {error}=await supabase.from('sooqak_favorites').upsert({user_id:currentUser.id,listing_id:listingId},{onConflict:'user_id,listing_id'});if(error)throw error}
      else{const {error}=await supabase.from('sooqak_favorites').delete().eq('user_id',currentUser.id).eq('listing_id',listingId);if(error)throw error}
      return true;
    }
    async function listSavedSearches(){
      if(!currentUser)throw new Error('تسجيل الدخول مطلوب');
      const {data,error}=await supabase.from('sooqak_saved_searches').select('id,search_query,category,city,listing_kind,min_price,max_price,created_at').eq('user_id',currentUser.id).order('created_at',{ascending:false}).limit(30);
      if(error)throw error;return data||[];
    }
    async function addSavedSearch(payload){
      if(!currentUser)throw new Error('تسجيل الدخول مطلوب');
      const existing=await listSavedSearches();if(existing.length>=30)throw new Error('الحد الأقصى 30 بحثًا محفوظًا');
      const {error}=await supabase.from('sooqak_saved_searches').insert({user_id:currentUser.id,...payload});if(error)throw error;
      return true;
    }
    async function deleteSavedSearch(id){
      if(!currentUser)throw new Error('تسجيل الدخول مطلوب');
      const {error}=await supabase.from('sooqak_saved_searches').delete().eq('id',id).eq('user_id',currentUser.id);if(error)throw error;return true;
    }
    async function getPublicSellerProfile(accountId){
      if(!accountId)return null;
      const {data,error}=await supabase.from('sooqak_public_profiles')
        .select('account_id,display_name,city,about,is_visible,updated_at')
        .eq('account_id',accountId).maybeSingle();
      if(error)throw error;return data||null;
    }
    async function savePublicSellerProfile(kind,payload){
      if(!currentUser)throw new Error('يلزم تسجيل الدخول ببريد موثّق');
      const account=await ensureAccount(kind,payload.display_name);
      const {error}=await supabase.from('sooqak_public_profiles')
        .upsert({account_id:account.id,display_name:payload.display_name,
          city:payload.city,about:payload.about,is_visible:true,updated_at:new Date().toISOString()},
          {onConflict:'account_id'});
      if(error)throw error;return true;
    }

    async function saveListingContact(listingId,consent){
      if(!currentUser)throw new Error('يلزم تسجيل الدخول أولًا');
      const wants=Boolean(consent.show_whatsapp||consent.show_call);
      if(!wants){
        const r=await supabase.from('sooqak_listing_contacts').delete()
          .eq('listing_id',listingId).eq('seller_user_id',currentUser.id);
        errorIfAny(r);return true;
      }
      const value=String(consent.phone_e164||'');
      if(!/^\+[1-9][0-9]{7,14}$/.test(value))throw new Error('رقم التواصل غير صالح');
      const r=await supabase.from('sooqak_listing_contacts')
        .upsert({listing_id:listingId,seller_user_id:currentUser.id,phone_e164:value,
          show_whatsapp:!!consent.show_whatsapp,show_call:!!consent.show_call,updated_at:new Date().toISOString()},
          {onConflict:'listing_id'});
      errorIfAny(r);return true;
    }


    async function loadPrivateProfile(){if(!currentUser)throw Error('سجّل الدخول أولًا');const {data,error}=await supabase.from('sooqak_private_profiles').select('city,district,birth_year').eq('user_id',currentUser.id).maybeSingle();errorIfAny({error});return data;}
    async function savePrivateProfile(v){if(!currentUser)throw Error('سجّل الدخول أولًا');const {error}=await supabase.from('sooqak_private_profiles').upsert({user_id:currentUser.id,city:v.city,district:v.district,birth_year:v.birth_year,updated_at:new Date().toISOString()},{onConflict:'user_id'});errorIfAny({error});const r=await supabase.auth.updateUser({data:{full_name:v.display_name}});errorIfAny(r);if(r.data?.user)currentUser=r.data.user;const own=await supabase.from('sooqak_accounts').update({display_name:v.display_name}).eq('owner_id',currentUser.id);errorIfAny(own);window.dispatchEvent(new CustomEvent('sooqak:auth',{detail:{user:currentUser}}));return true;}
    window.sooqakCloud = Object.freeze({
      getUser:()=>currentUser,
      loadPrivateProfile,savePrivateProfile,hasAcceptedPledge,acceptPledge,getContactPrefs,saveContactPrefs,listFavorites,setFavorite,listSavedSearches,addSavedSearch,deleteSavedSearch,
      ensureAccount,getPublicSellerProfile,savePublicSellerProfile,
      fetchListings,fetchFavoriteListings,fetchListingById,fetchMyListings,countMyListings,
      saveListing,saveListingContact,
      removeListing,
      uploadPhotos,
      removePhoto,
      renewListing:id=>runRpc('sooqak_renew_listing',{p_listing:id}),
      getSales,
      getSaleCorrections,
      correctSalePrice,
      getAdminSaleCorrections,
      openOrCreateConversation,
      isConversationMuted,setConversationMuted,getAccountDraft,saveAccountDraft,deleteAccountDraft,reorderListingPhotos,
      listConversations,
      listMessages,
      sendMessage,
      unreadSummary:()=>runRpc('sooqak_unread_summary',{}),
      markConversationRead:id=>runRpc('sooqak_mark_conversation_read',{p_conversation:id}),
      getConversationBlockStatus,
      setConversationBlocked,
      submitReport,
      isAdmin,
      getAdminDashboard,
      adminReviewReport,
      adminHideReportedListing,
      markSold:(id,price)=>runRpc('sooqak_mark_sold',{p_listing:id,p_price:price}),
      reserve:(id,hours)=>runRpc('sooqak_reserve',{p_listing:id,p_hours:hours}),
      bump:id=>runRpc('sooqak_bump',{p_listing:id}),
      resetPasswordEmail:async email=>{
        const normalized=String(email||'').trim().toLowerCase();
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)||normalized.length>254)throw new Error('البريد الإلكتروني غير صالح');
        const r=await supabase.auth.resetPasswordForEmail(normalized,{redirectTo:sooqakAuthReturnURL()});
        errorIfAny(r);
        return true;
      },
      signInEmail:async (email,{createAccount=false,displayName=''}={})=>{
        const options={emailRedirectTo:sooqakAuthReturnURL(),shouldCreateUser:Boolean(createAccount)};
        if(createAccount&&displayName)options.data={full_name:displayName.slice(0,60)};
        const r=await supabase.auth.signInWithOtp({email,options});
        errorIfAny(r);
      },
      signInPassword:async (email,password)=>{
        const result=await supabase.auth.signInWithPassword({email,password});
        errorIfAny(result);
        return Boolean(result.data?.session);
      },
      signUpPassword:async (email,password,displayName)=>{
        const result=await supabase.auth.signUp({
          email,password,
          options:{emailRedirectTo:sooqakAuthReturnURL(),data:{full_name:String(displayName).slice(0,60)}}
        });
        errorIfAny(result);
        return Boolean(result.data?.session);
      },
      setAccountPassword:async password=>{
        if(!currentUser||!verified(currentUser))throw Error('سجّل دخولك ببريد مؤكّد أولًا');
        const result=await supabase.auth.updateUser({password});
        errorIfAny(result);
        return true;
      },
      signInGoogle:async ()=>{
        const r=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:sooqakAuthReturnURL()}});
        errorIfAny(r);
      },
      signOut:async()=>{errorIfAny(await supabase.auth.signOut());currentUser=null;await refreshUser();}
    });
    window.dispatchEvent(new Event('sooqak:cloud-ready'));
    supabase.auth.onAuthStateChange(event=>{
      if(event==='PASSWORD_RECOVERY'){
        window.sooqakPasswordRecoveryPending=true;
        window.dispatchEvent(new Event('sooqak:password-recovery'));
      }
      setTimeout(()=>refreshUser().catch(err=>{
      window.dispatchEvent(new CustomEvent('sooqak:cloud-error',{detail:{message:err.message}}));
    }),0)});
    await refreshUser();
  } catch(err) {
    window.dispatchEvent(new CustomEvent('sooqak:cloud-error',{detail:{message:'تعذر الاتصال بخدمة الحسابات. '+err.message}}));
  }
}
