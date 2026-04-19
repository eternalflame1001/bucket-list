// app.js — UI・メイン処理

const CAT_ICONS = { "海外旅行":"🌍","国内旅行":"🗾","食":"🍜","人生の目標":"⭐","スキル・学習":"✏️" };
const CAT_KEYS  = ["海外旅行","国内旅行","食","人生の目標","スキル・学習"];
const SCORE_MAP = { "高":3,"中":2,"低":1 };

let state = {
  bucket: {}, trash: {}, visit: {},
  tab: "bucket",
  newUrg: "高", newPrio: "高", catFilter: ""
};

const $ = id => document.getElementById(id);
const bucketUL = $("bucket-list");
const searchEl = $("search-input");

function score(item) { return (SCORE_MAP[item.urg]||1) + (SCORE_MAP[item.prio]||1); }
function toZen(n)    { return String(n).replace(/[0-9]/g, c => String.fromCharCode(c.charCodeAt(0)+0xFEE0)); }
function esc(str)    { return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function showLoading(show) { $("loading").classList.toggle("hidden", !show); }
function toast(msg, type="ok") {
  const el = $("toast"); el.textContent = msg;
  el.className = `toast-${type}`; el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2500);
}

// --- 初期化 ---
async function init() {
  // 許可ユーザー以外はブロック
  if (typeof USER_VALID !== 'undefined' && !USER_VALID) {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  height:100vh;background:#0a0000;color:#fff;font-family:sans-serif;gap:16px;">
        <div style="font-size:48px;">🔒</div>
        <div style="font-size:20px;font-weight:700;">このリストは存在しません</div>
        <div style="font-size:14px;color:#aaa;">アドレスをご確認ください</div>
      </div>`;
    return;
  }
  // ユーザーラベル表示＋タップで切り替え
  const ulEl = document.getElementById('user-label');
  if (ulEl && typeof USER_LABEL !== 'undefined') {
    ulEl.textContent = USER_LABEL;
    ulEl.title = 'タップでユーザー切り替え';
    ulEl.style.cursor = 'pointer';
    ulEl.addEventListener('click', showUserSwitcher);
  }
  showLoading(true);
  try {
    const [b, t, v] = await Promise.all([
      FB.get(FB.endpoints.bucket),
      FB.get(FB.endpoints.trash),
      FB.get(FB.endpoints.visit)
    ]);
    state.bucket = b || {};
    state.trash  = t || {};
    state.visit  = v || {};
    window.appState = state;
    updateStats();
    renderBucket();
  } catch(e) { toast("データ読み込みエラー", "error"); }
  showLoading(false);
  startListener();
}

// --- 統計・カテゴリバー更新 ---
function updateStats() {
  const all   = Object.values(state.bucket);
  const trash = Object.values(state.trash);
  const total = all.length;
  const done  = all.filter(i => i.done).length;
  $("stat-total").textContent  = total;
  $("stat-done").textContent   = done;
  $("stat-remain").textContent = total - done;

  // ALL
  const allPct = total ? Math.round(done/total*100) : 0;
  $("cpct-all").textContent  = allPct + "%";
  $("cfrac-all").textContent = `${done}/${total}`;

  // 各カテゴリ
  CAT_KEYS.forEach((cat) => {
    const items = all.filter(v => v.cat === cat);
    const d = items.filter(v => v.done).length;
    const pct = items.length ? Math.round(d/items.length*100) : 0;
    const pe = $(`cpct-${cat}`);
    const fe = $(`cfrac-${cat}`);
    if (pe) pe.textContent = pct + "%";
    if (fe) fe.textContent = `${d}/${items.length}`;
  });

  // 達成
  $("cpct-done").textContent  = done ? "100%" : "0%";
  $("cfrac-done").textContent = `${done}/${done}`;

  // ゴミ箱
  $("cfrac-trash").textContent = trash.length + "件";
}

// --- バケットリスト描画 ---
function renderBucket() {
  updateStats();
  const cf = state.catFilter;
  const q  = searchEl.value.toLowerCase();

  // ゴミ箱表示
  if (cf === "__trash__") {
    const items = Object.entries(state.trash);
    bucketUL.innerHTML = items.length ? "" : `<li class="empty">ゴミ箱は空です</li>`;
    items.forEach(([key, item]) => {
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <div class="item-body">
          <div class="item-title">${esc(item.text)}</div>
          ${item.cat?`<div class="item-meta"><span class="item-cat-badge">${CAT_ICONS[item.cat]||""}</span></div>`:""}
        </div>
        <div class="item-actions">
          <button class="act-restore" data-key="${key}">♻️</button>
          <button class="act-delete"  data-key="${key}">❌</button>
        </div>`;
      bucketUL.appendChild(li);
    });
    return;
  }

  let items = Object.entries(state.bucket).filter(([, v]) => {
    if (cf === "__done__" && !v.done) return false;
    if (cf !== "__done__" && cf && v.cat !== cf) return false;
    if (q && !v.text?.toLowerCase().includes(q) &&
        !(v.memo  && v.memo.toLowerCase().includes(q)) &&
        !(v.place && v.place.toLowerCase().includes(q)) &&
        !(v.date  && v.date.toLowerCase().includes(q))) return false;
    return true;
  });

  // スコア降順・達成済みは最後
  items.sort(([,a],[,b]) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return score(b) - score(a);
  });

  const countEl = $("search-result-count");
  countEl.textContent = q ? `${items.length}件ヒット` : "";

  bucketUL.innerHTML = items.length ? "" : `<li class="empty">アイテムがありません</li>`;
  items.forEach(([key, item]) => {
    const li = document.createElement("li");
    li.className = `item${item.done?" done":""}`;
    const s = score(item);
    const hasDetail = item.memo || item.date || item.place;
    li.innerHTML = `
      <div class="item-check" data-key="${key}">${item.done?"✓":""}</div>
      <div class="item-body">
        <div class="item-title">${esc(item.text)}</div>
        <div class="item-meta">
          ${item.cat?`<span class="item-cat-badge">${CAT_ICONS[item.cat]||""}</span>`:""}
          <span class="item-score">${toZen(s)}</span>
          <span class="prio-row-label">緊急度</span>
          <span class="prio-tag${item.urg==="高"?" on":""}">高</span>
          <span class="prio-tag${item.urg==="中"?" on":""}">中</span>
          <span class="prio-tag${item.urg==="低"?" on":""}">低</span>
          <span class="prio-row-label">重要度</span>
          <span class="prio-tag${item.prio==="高"?" on":""}">高</span>
          <span class="prio-tag${item.prio==="中"?" on":""}">中</span>
          <span class="prio-tag${item.prio==="低"?" on":""}">低</span>
        </div>
        ${hasDetail?`<div class="item-detail-preview">
          ${item.date ?`📅 ${esc(item.date)}　`:""}
          ${item.place?`📍 ${esc(item.place)}`:""}
          ${item.memo ?`<br>📝 ${esc(item.memo)}`:""}
        </div>`:""}
        <div class="detail-panel hidden" id="dp-${key}">
          <div class="detail-field"><label>📝 メモ</label><textarea class="dp-memo">${esc(item.memo||"")}</textarea></div>
          <div class="detail-field"><label>📅 目標日・期限</label><input class="dp-date" type="text" value="${esc(item.date||"")}"></div>
          <div class="detail-field"><label>📍 場所・エリア</label><input class="dp-place" type="text" value="${esc(item.place||"")}"></div>
          <button class="dp-save" data-key="${key}">💾 保存</button>
        </div>
      </div>
      <div class="item-actions">
        <button class="act-detail" data-key="${key}">📋</button>
        <button class="act-edit"   data-key="${key}">✏️</button>
        <button class="act-trash"  data-key="${key}">×</button>
      </div>`;
    bucketUL.appendChild(li);
  });
}

// --- 完了トグル ---
async function toggleDone(key) {
  const item = state.bucket[key];
  if (!item) return;
  const newDone = !item.done;
  state.bucket[key].done = newDone;
  renderBucket();
  try {
    await FB.patch(`${FB.endpoints.bucket}/${key}`, { done: newDone });
    toast(newDone ? "達成！🎉" : "未達成に戻しました");
  } catch(e) {
    state.bucket[key].done = !newDone;
    renderBucket(); toast("更新エラー","error");
  }
}

// --- 追加 ---
async function addItem() {
  let text = $("add-input").value.trim();
  let cat  = $("add-cat").value;
  if (!text) { toast("タイトルを入力してください","error"); return; }
  if (cat === "__new__") { cat = prompt("新しいカテゴリ名を入力") || ""; }
  const data = { text, cat, prio: state.newPrio, urg: state.newUrg, done: false, memo:"", date:"", place:"", createdAt: Date.now() };
  showLoading(true);
  try {
    const nums = Object.keys(state.bucket).map(Number).filter(n => !isNaN(n));
    const maxId = (nums.length ? Math.max(0, ...nums) : 0) + 1;
    await FB.patch(`${FB.endpoints.bucket}/${maxId}`, data);
    state.bucket[maxId] = data;
    $("add-input").value = "";
    renderBucket();
    toast("追加しました🎉");
  } catch(e) { toast("保存エラー","error"); }
  showLoading(false);
}

// --- ゴミ箱へ ---
async function moveToTrash(key) {
  const item = state.bucket[key];
  if (!item || !confirm(`「${item.text}」を削除しますか？\nこの操作は元に戻せません。`)) return;
  showLoading(true);
  try {
    await FB.patch(`${FB.endpoints.trash}/${key}`, { ...item, deletedAt: Date.now() });
    await FB.delete(`${FB.endpoints.bucket}/${key}`);
    delete state.bucket[key];
    state.trash[key] = item;
    renderBucket(); toast("削除しました");
  } catch(e) { toast("エラーが発生しました","error"); }
  showLoading(false);
}

// --- ゴミ箱から復元 ---
async function restoreFromTrash(key) {
  const item = state.trash[key];
  if (!item) return;
  showLoading(true);
  try {
    const { deletedAt, ...restored } = item;
    await FB.patch(`${FB.endpoints.bucket}/${key}`, restored);
    await FB.delete(`${FB.endpoints.trash}/${key}`);
    delete state.trash[key];
    state.bucket[key] = restored;
    renderBucket(); toast("復元しました");
  } catch(e) { toast("エラーが発生しました","error"); }
  showLoading(false);
}

// --- 完全削除 ---
async function deleteFromTrash(key) {
  if (!confirm("完全に削除しますか？元に戻せません。")) return;
  showLoading(true);
  try {
    await FB.delete(`${FB.endpoints.trash}/${key}`);
    delete state.trash[key];
    renderBucket(); toast("完全削除しました");
  } catch(e) { toast("エラーが発生しました","error"); }
  showLoading(false);
}

// --- 詳細保存 ---
async function saveDetail(key) {
  const panel = $(`dp-${key}`);
  if (!panel) return;
  const memo  = panel.querySelector(".dp-memo").value;
  const date  = panel.querySelector(".dp-date").value;
  const place = panel.querySelector(".dp-place").value;
  showLoading(true);
  try {
    await FB.patch(`${FB.endpoints.bucket}/${key}`, { memo, date, place });
    state.bucket[key] = { ...state.bucket[key], memo, date, place };
    renderBucket(); toast("詳細を保存しました");
  } catch(e) { toast("保存エラー","error"); }
  showLoading(false);
}

// --- 編集モーダル ---
const editModal = $("edit-modal-overlay");
function openEdit(key) {
  const item = state.bucket[key];
  if (!item) return;
  $("edit-text").value  = item.text;
  $("edit-urg").value   = item.urg  || "中";
  $("edit-prio").value  = item.prio || "中";
  $("edit-cat").value   = item.cat  || "";
  $("edit-save").dataset.key = key;
  editModal.classList.remove("hidden");
}
$("edit-cancel").addEventListener("click", () => editModal.classList.add("hidden"));
editModal.addEventListener("click", e => { if (e.target === editModal) editModal.classList.add("hidden"); });
$("edit-save").addEventListener("click", async () => {
  const key  = $("edit-save").dataset.key;
  if (!state.bucket[key]) { toast("アイテムが見つかりません","error"); return; }
  const data = {
    text: $("edit-text").value.trim() || state.bucket[key].text,
    urg:  $("edit-urg").value,
    prio: $("edit-prio").value,
    cat:  $("edit-cat").value,
    done: state.bucket[key].done
  };
  showLoading(true);
  try {
    await FB.patch(`${FB.endpoints.bucket}/${key}`, data);
    state.bucket[key] = { ...state.bucket[key], ...data };
    editModal.classList.add("hidden");
    renderBucket(); toast("更新しました");
  } catch(e) { toast("保存エラー","error"); }
  showLoading(false);
});

// --- イベント委任 ---
bucketUL.addEventListener("click", e => {
  const btn = e.target.closest("button, .item-check");
  if (!btn) return;
  const key = btn.dataset.key;
  if (!key) return;

  if (btn.classList.contains("item-check"))  toggleDone(key);
  if (btn.classList.contains("act-edit"))    openEdit(key);
  if (btn.classList.contains("act-trash"))   moveToTrash(key);
  if (btn.classList.contains("act-restore")) restoreFromTrash(key);
  if (btn.classList.contains("act-delete"))  deleteFromTrash(key);
  if (btn.classList.contains("dp-save"))     saveDetail(key);
  if (btn.classList.contains("act-detail")) {
    const panel = $(`dp-${key}`);
    if (!panel) return;
    const isOpen = !panel.classList.contains("hidden");
    panel.classList.toggle("hidden", isOpen);
    btn.classList.toggle("open", !isOpen);
  }
});

// --- 優先度ボタン ---
document.querySelectorAll(".prio-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    document.querySelectorAll(`.prio-btn[data-type="${type}"]`).forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (type === "urg")  state.newUrg  = btn.dataset.val;
    if (type === "prio") state.newPrio = btn.dataset.val;
  });
});

// --- 追加ボタン ---
$("btn-add").addEventListener("click", addItem);
$("add-input").addEventListener("keydown", e => { if (e.key === "Enter") addItem(); });

// --- 検索 ---
searchEl.addEventListener("input", renderBucket);

// --- タブ切替 ---
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    state.tab = btn.dataset.tab;
    // フィルターバーはbucketタブのみ表示
    document.getElementById("cat-filter-bar").classList.toggle("hidden", state.tab !== "bucket");
    // サブナビ表示切替
    ["japan","china","world"].forEach(t => {
      const nav = document.getElementById(t + "-sub-nav");
      if (nav) nav.style.display = (state.tab === t) ? "flex" : "none";
    });
    if (['japan','china','world'].includes(state.tab)) {
      setTimeout(() => window.onMapTabActivate?.(state.tab), 50);
    }
    $(`tab-${state.tab}`).classList.add("active");
  });
});

// --- カテゴリフィルター ---
document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.catFilter = btn.dataset.cat;
    renderBucket();
  });
});

// --- サブタブ（sticky-navスコープ） ---
document.querySelectorAll(".sub-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const group = btn.dataset.group;
    const subNavEl = document.getElementById(group + "-sub-nav");
    const sectionEl = document.getElementById("tab-" + group);
    // サブナビのアクティブ切替
    subNavEl?.querySelectorAll(".sub-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    // コンテンツのアクティブ切替
    sectionEl?.querySelectorAll(".sub-tab-content").forEach(s => s.classList.remove("active"));
    $(btn.dataset.sub)?.classList.add("active");
    // 世界遺産タブなら地図を描画
    const sub = btn.dataset.sub;
    if (sub.endsWith("-heritage")) {
      const scope = sub.replace("-heritage", "");
      window.renderHeritageList?.(scope);
    }
    // 温泉・グルメ・ラーメンタブ
    if (sub === "japan-onsen")   window.renderOnsenTab?.();
    if (sub === "japan-gourmet") window.renderFoodTab?.("gourmet");
    if (sub === "japan-ramen")   window.renderFoodTab?.("ramen");
  });
});

// --- リアルタイムリスナー ---
function startListener() {
  FB.listen(FB.endpoints.bucket, data => {
    if (data) {
      state.bucket = data;
      renderBucket();
    }
  });

}

init();

// ==========================================
// ピンチ拡大縮小（指を離すと元に戻る）
// ==========================================
(function() {
  let startDist  = 0;
  let startScale = 1;
  let curScale   = 1;
  const SCALE_MAX = 4;
  const el = document.body;

  function pinchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  el.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      startDist  = pinchDist(e.touches);
      startScale = curScale;
      el.style.transition = 'none';
      // ピンチの中心点を body 座標系で設定（スクロール量を加算）
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      el.style.transformOrigin = `${mx + window.scrollX}px ${my + window.scrollY}px`;
    }
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const ratio = pinchDist(e.touches) / startDist;
    curScale = Math.min(SCALE_MAX, Math.max(1, startScale * ratio));
    el.style.transform = `scale(${curScale})`;
  }, { passive: false });

  function snapBack() {
    if (curScale !== 1) {
      el.style.transition = 'transform 0.35s ease';
      el.style.transform  = 'scale(1)';
      curScale = 1;
    }
  }

  el.addEventListener('touchend',    snapBack, { passive: true });
  el.addEventListener('touchcancel', snapBack, { passive: true });
})();

// ==========================================
// ユーザー切り替えダイアログ
// ==========================================
function showUserSwitcher() {
  const USERS = [
    { key: 'master', label: "Master's List" },
    { key: 'hideki', label: "Hideki's List" },
    { key: 'friend', label: "Friend's List" },
    { key: 'f01',    label: "f01's List" },
    { key: 'f02',    label: "f02's List" },
    { key: 'f03',    label: "f03's List" },
  ];
  const current = typeof _U !== 'undefined' ? _U : 'master';

  // オーバーレイ生成
  const overlay = document.createElement('div');
  overlay.id = 'user-switcher-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,0.65);
    display:flex;align-items:center;justify-content:center;`;

  const box = document.createElement('div');
  box.style.cssText = `
    background:#1a1208;border:1px solid #6b5a3a;border-radius:12px;
    padding:20px 24px;min-width:220px;`;

  const title = document.createElement('div');
  title.textContent = 'ユーザーを切り替え';
  title.style.cssText = 'color:#d4b483;font-size:14px;font-weight:700;margin-bottom:14px;text-align:center;';
  box.appendChild(title);

  USERS.forEach(u => {
    const btn = document.createElement('button');
    btn.textContent = u.label;
    const isCurrent = u.key === current;
    btn.style.cssText = `
      display:block;width:100%;padding:10px 14px;margin-bottom:8px;
      border-radius:8px;border:1px solid ${isCurrent ? '#c89b3c' : '#4a3a1a'};
      background:${isCurrent ? '#3a2a08' : 'transparent'};
      color:${isCurrent ? '#f0c060' : '#c8b090'};
      font-size:14px;font-weight:${isCurrent ? '700' : '400'};
      cursor:pointer;text-align:left;`;
    if (isCurrent) {
      btn.textContent = '✓ ' + u.label;
    }
    btn.addEventListener('click', () => {
      localStorage.setItem('bucket_user', u.key);
      document.body.removeChild(overlay);
      window.location.href = window.location.pathname + '?u=' + u.key;
    });
    box.appendChild(btn);
  });

  const cancel = document.createElement('button');
  cancel.textContent = 'キャンセル';
  cancel.style.cssText = `
    display:block;width:100%;padding:8px;margin-top:4px;
    border:none;background:transparent;color:#888;font-size:13px;cursor:pointer;`;
  cancel.addEventListener('click', () => document.body.removeChild(overlay));
  box.appendChild(cancel);

  overlay.appendChild(box);
  overlay.addEventListener('click', e => { if (e.target === overlay) document.body.removeChild(overlay); });
  document.body.appendChild(overlay);
}
