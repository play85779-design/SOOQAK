// B09: safe review-only owner page. Never embed billing or banking data in public JS.
import {initOwnerWorkers} from './owner-workers.mjs';
const status = document.getElementById('ownerStatus');
const panel = document.getElementById('ownerPanel');
let activeUserId = null;
let requestEpoch = 0;
function deny(message) {
  ++requestEpoch;
  activeUserId = null;
  panel.hidden = true;
  status.textContent = message;
}
async function initializeOwnerPanel() {
  const {createClient} = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const api = createClient(
    'https://zwbtiyqgrgjybwaguuyn.supabase.co',
    'sb_publishable_42t2ty_ID8MfKoxQkw3CkA_3p1GG4kr',
    {auth:{persistSession:true,detectSessionInUrl:false,autoRefreshToken:true}}
  );
  api.auth.onAuthStateChange?.((event, session) => {
    // Invalidate in-flight getUser() too: a sign-out or account switch can
    // arrive before activeUserId has been set, otherwise stale async results
    // could open a panel for a session that has already ended.
    if (event === 'SIGNED_OUT' ||
        (event === 'SIGNED_IN' && !activeUserId) ||
        (activeUserId && (!session?.user || session.user.id !== activeUserId ||
                          !session.user.email_confirmed_at))) {
      deny('تغيرت الجلسة. أعد فتح الصفحة بعد تسجيل الدخول بحساب المالك.');
    }
  });
  const epoch = ++requestEpoch;
  const authResult = await api.auth.getUser();
  if (epoch !== requestEpoch) return;
  const user = authResult?.data?.user;
  if (authResult?.error || !user?.id || !user.email_confirmed_at) {
    deny('الدخول محظور: يلزم حساب موثّق وصلاحية مالك مؤكدة من الخادم.');
    return;
  }
  activeUserId = user.id; // Enable session-change invalidation while permission check is pending.
  // No admin shortcut: the owner role must be approved separately and checked by a secure RPC.
  // If this RPC does not yet exist, or fails for any reason, deny by default.
  const permission = await api.rpc('sooqak_is_owner');
  if (epoch !== requestEpoch || activeUserId !== user.id) return;
  if (permission?.error || permission?.data !== true) {
    deny('الصفحة غير مفعّلة لحسابك: صلاحية المالك على الخادم غير متحقّق منها.');
    return;
  }
  activeUserId = user.id;
  panel.hidden = false;
  status.textContent = 'تم التحقق من صلاحية المالك. مؤشرات النسخة التجريبية غير متصلة بمصادر مالية مؤكدة.';
  // Only after owner RPC authorization: no worker RPC or rendered panel for visitors.
  initOwnerWorkers(api, () => requestEpoch === epoch && activeUserId === user.id && !panel.hidden);
}
initializeOwnerPanel().catch(() => {
  deny('تعذر التحقق من صلاحيات المالك. لم تُعرض أي بيانات خاصة.');
});
