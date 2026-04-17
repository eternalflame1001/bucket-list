// app.js — UI・メイン処理

const CAT_ICONS = { "海外旅行":"🌍","国内旅行":"🗾","食":"🍜","人生の目標":"⭐","スキル・学習":"✏️" };
const CAT_KEYS  = ["海外旅行","国内旅行","食","人生の目標","スキル・学習"];
const SCORE_MAP = { "高":3,"中":2,"低":1 };

let state = {
  bucket: {}, trash: {}, visit: {},
  tab: "bucket", editKey: null,
  newUrg: "高", newPrio: "高", catFilter: ""
};

const $ = id => document.getElementById(id);
const bucketUL = $("bucket-list");
const searchEl = $("search-input");

function score(item) { return (SCORE_MAP[item.urg]||1) * (SCORE_MAP[item.prio]||1); }
function toZen(n)    { return String(n).replace(/[0-9]/g, c => String.fromCharCode(c.charCodeAt(0)+0xFEE0)); }
function esc(str)    { return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function showLoading(show) { $("loading").classList.toggle("hidden", !show); }
window.toast = function(msg, type="ok") {};
function toast(msg, type="ok") {
  const el = $("toast"); el.textContent = msg;
  el.className = `toast-${type}`; el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2500);
}

// --- 初期化 ---
async function init() {
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
    const maxId = Math.max(0, ...Object.keys(state.bucket).map(Number)) + 1;
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

// --- サブタブ（セクション内スコープ） ---
document.querySelectorAll(".sub-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.closest(".tab-content");
    section.querySelectorAll(".sub-tab").forEach(b => b.classList.remove("active"));
    section.querySelectorAll(".sub-tab-content").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.sub).classList.add("active");
    const sub = btn.dataset.sub;
    if (sub.endsWith("-heritage")) {
      const scope = sub.replace("-heritage", "");
      window.renderHeritageList?.(scope);
    }
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
