// B09 — Owner-only worker status viewer; no embedded credentials or public status feed.
// The future "sooqak_owner_worker_status" RPC MUST be owner-authorized on the server.
// Until deployed and proven, every robot is stationary and reads "غير متصل".
export const WORKERS = Object.freeze([
  {id:'W1', label:'الواجهات والأداء', task:'مراجعة الواجهة وسرعتها', schedule:'كل ساعة تقريبًا عند الدقيقة 05'},
  {id:'W2', label:'الوظائف والتكامل', task:'فحص الوظائف والاختبارات', schedule:'كل ساعة تقريبًا عند الدقيقة 25'},
  {id:'W3', label:'الأمان والمراجعة', task:'فحص الأمان والصلاحيات', schedule:'يوميًا، موعد تقريبي 3:11 عصرًا'}
]);

const EMPTY = Object.freeze({state:'unknown', label:'غير متصل', detail:'لا توجد إشارة تشغيل موثوقة', task:null, at:null, proof:null});
const LABELS = {running:'يعمل الآن', complete:'أنجز', blocked:'متعثر', scheduled:'مجدول'};
const RECENT_HEARTBEAT_MS = 2 * 60 * 1000;
const MAX_EVENT_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function validTime(value, now, maxAge) {
  if (typeof value !== 'string' || !/T/.test(value) || !/(Z|[+-]\d\d:\d\d)$/.test(value)) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || timestamp > now + 30_000 || now - timestamp > maxAge) return null;
  return timestamp;
}
function safeEvidence(value) {
  if (typeof value !== 'string') return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' || !['github.com','docs.google.com'].includes(parsed.hostname)) return null;
    return parsed.href;
  } catch { return null; }
}

// A scheduled clock time is never evidence of execution. "Running" requires a
// recent heartbeat from an owner-authorized backend; overdue activity fails closed.
export function evaluateWorkerActivity(item, now = Date.now()) {
  if (!item || typeof item !== 'object' || item.server_verified !== true ||
      item.source !== 'automations_verified') return {...EMPTY};
  const at = validTime(item.updated_at, now, MAX_EVENT_AGE_MS);
  if (at === null) return {...EMPTY};
  const task = typeof item.task === 'string' ? item.task.trim().slice(0,100) : null;
  const proof = safeEvidence(item.proof_url);
  if (item.status === 'in_progress') {
    const started = validTime(item.started_at, now, MAX_EVENT_AGE_MS);
    const heartbeat = validTime(item.heartbeat_at, now, RECENT_HEARTBEAT_MS);
    if (started === null || heartbeat === null || heartbeat < started || at < heartbeat)
      return {...EMPTY, detail:'انقطعت إشارة التشغيل؛ لا نفترض استمرار العمل'};
    return {state:'running',label:LABELS.running,detail:'إشارة عمل حديثة مؤكدة',task,at,proof:null};
  }
  if (item.status === 'completed' || item.status === 'failed') {
    const ended = validTime(item.ended_at, now, MAX_EVENT_AGE_MS);
    if (ended === null || at < ended) return {...EMPTY};
    const state = item.status === 'completed' ? 'complete' : 'blocked';
    return {state,label:LABELS[state],detail:state === 'complete'?'آخر تشغيل موثق':'آخر تشغيل تعثر',task,at:ended,proof};
  }
  if (item.status === 'scheduled' && now - at <= RECENT_HEARTBEAT_MS)
    return {state:'scheduled',label:LABELS.scheduled,detail:'الموعد مؤكد؛ لم يبدأ التنفيذ',task,at,proof:null};
  return {...EMPTY};
}
const textNode = (card, selector, value) => {
  const target = card.querySelector(selector);
  if (target) target.textContent = value;
};
const asLocal = value => value == null ? 'غير متوفر' :
  new Intl.DateTimeFormat('ar-SA',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Riyadh'}).format(value);

export function initOwnerWorkers(api, isAuthorized) {
  const root = document.getElementById('ownerWorkers');
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';
  const button = root.querySelector('#refreshWorkerStatus');
  const note = root.querySelector('#workerConnectionNote');
  const cards = new Map([...root.querySelectorAll('[data-worker-id]')].map(card=>[card.dataset.workerId,card]));
  let requestId = 0;
  let lastVerifiedSnapshot = [];
  // Re-evaluate local heartbeat expiry without any extra paid/backend requests.
  // A robot must not remain animated just because its browser tab was left open.
  function draw(items) {
    for (const worker of WORKERS) {
      const card = cards.get(worker.id);
      if (!card) continue;
      const state = evaluateWorkerActivity(items?.find(item=>item?.id === worker.id));
      card.dataset.workerState = state.state;
      textNode(card,'[data-worker-state-label]',state.label);
      textNode(card,'[data-worker-detail]',state.detail);
      textNode(card,'[data-worker-task]',state.task || worker.task);
      textNode(card,'[data-worker-time]',state.at === null?'آخر تنفيذ مؤكد: غير متوفر':'آخر إشارة: '+asLocal(state.at));
      const proof = card.querySelector('[data-worker-proof]');
      if (proof) {
        proof.hidden = !state.proof;
        proof.removeAttribute('href');
        if (state.proof) proof.href = state.proof;
      }
    }
  }
  async function refresh() {
    if (!isAuthorized()) return;
    const current = ++requestId;
    button.disabled = true;
    note.textContent = 'جاري فحص اتصال حالة العمال…';
    try {
      const result = await api.rpc('sooqak_owner_worker_status');
      if (current !== requestId || !isAuthorized()) return;
      if (result?.error || !Array.isArray(result?.data) ||
          !result.data.every(x=>x && typeof x.id === 'string' && ['W1','W2','W3'].includes(x.id))) {
        lastVerifiedSnapshot = [];
        draw([]);
        note.textContent = 'لا يوجد اتصال حي موثوق بعد. الروبوتات لا تتحرك لمجرد مرور موعدها.';
      } else {
        lastVerifiedSnapshot = result.data;
        draw(lastVerifiedSnapshot);
        note.textContent = 'تم فحص المصدر المحمي؛ أي حالة بلا إثبات حديث تظهر غير متصل.';
      }
    } catch {
      if (current !== requestId || !isAuthorized()) return;
      lastVerifiedSnapshot = [];
      draw([]);
      note.textContent = 'تعذر الاتصال بمصدر الحالة الآمن. لا نعرض نشاطًا تخمينيًا.';
    } finally {
      if (current === requestId) button.disabled = false;
    }
  }
  button.addEventListener('click',refresh);
  draw([]);
  const expiryInterval = window.setInterval(() => {
    if (!isAuthorized()) {
      lastVerifiedSnapshot = [];
      draw([]);
      window.clearInterval(expiryInterval);
      return;
    }
    // Updating the UI locally is not an additional query to Supabase or GitHub.
    if (lastVerifiedSnapshot.length) draw(lastVerifiedSnapshot);
  }, 15_000);
  void refresh();
}
