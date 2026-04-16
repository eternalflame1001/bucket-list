// app.js — UI・メイン処理

let state = {
  bucket: {}, trash: {}, visit: {},
  tab: "bucket", editKey: null,
  newUrg: "高", newPrio: "高"
};

const $ = id => document.getElementById(id);
const bucketUL = $("bucket-list");
const searchEl = $("search-input");
const stsFilter = $("status-filter");

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
    buildCatSelect($("add-cat"));
    renderBucket();
    updateStats();
  } catch(e) { toast("データ読み込みエラー", "error"); }
  showLoading(false);
  startListener();
}

// --- カテゴリセレクト構築 ---
function buildCatSelect(el, selected = "") {
  const cats = [...new Set(Object.values(state.bucket).map(i => i.cat).filter(Boolean))].sort();
  el.innerHTML = `<option value="">カテゴリなし</option>` +
    cats.map(c => `<option value="${c}"${c===selected?" selected":""}>${c}</option>`).join("") +
    `<option value="__new__">＋ 新しいカテゴリ</option>`;
}

// --- 統計更新 ---
function updateStats() {
  const total  = Object.keys(state.bucket).length;
  const done   = Object.values(state.bucket).filter(i => i.done).length;
  $("stat-total").textContent  = total;
  $("stat-done").textContent   = done;
  $("stat-remain").textContent = total - done;
}

// --- バケットリスト描画 ---
function renderBucket() {
  const q   = searchEl.value.toLowerCase();
  const sts = stsFilter.value;
  const items = Object.entries(state.bucket).filter(([, v]) => {
    if (q   && !v.text?.toLowerCase().includes(q)) return false;
    if (sts === "done" && !v.done) return false;
    if (sts === "todo" && v.done)  return false;
    return true;
  });
  bucketUL.innerHTML = items.length ? "" : `<li class="empty">アイテムがありません</li>`;
  items.forEach(([key, item]) => {
    const li = document.createElement("li");
    li.className = `item${item.done ? " done" : ""}`;
    li.innerHTML = `
      <div class="item-check" data-key="${key}">${item.done ? "✓" : ""}</div>
      <div class="item-body">
        <div class="item-title">${esc(item.text)}</div>
        <div class="item-meta">
          ${item.cat ? `<span class="item-cat-badge">${esc(item.cat)}</span>` : ""}
          ${item.urg ? `<span class="item-num">${esc(item.urg)}</span>` : ""}
        </div>
        <div class="prio-row">
          <span class="prio-row-label">緊急度</span>
          <span class="prio-tag${item.urg==="高"?" on":""}">高</span>
          <span class="prio-tag${item.urg==="中"?" on":""}">中</span>
          <span class="prio-tag${item.urg==="低"?" on":""}">低</span>
          <span class="prio-row-label">重要度</span>
          <span class="prio-tag${item.prio==="高"?" on":""}">高</span>
          <span class="prio-tag${item.prio==="中"?" on":""}">中</span>
          <span class="prio-tag${item.prio==="低"?" on":""}">低</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="act-edit"  data-key="${key}">✏️</button>
        <button class="act-trash" data-key="${key}">×</button>
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
  renderBucket(); updateStats();
  try {
    await FB.patch(`${FB.endpoints.bucket}/${key}`, { done: newDone });
    toast(newDone ? "達成！🎉" : "未達成に戻しました");
  } catch(e) {
    state.bucket[key].done = !newDone;
    renderBucket(); updateStats();
    toast("更新エラー", "error");
  }
}

// --- 追加 ---
async function addItem() {
  const text = $("add-input").value.trim();
  let cat    = $("add-cat").value;
  if (!text) { toast("タイトルを入力してください", "error"); return; }
  if (cat === "__new__") { cat = prompt("新しいカテゴリ名を入力") || ""; }
  const data = { text, cat, prio: state.newPrio, urg: state.newUrg, done: false, createdAt: Date.now() };
  showLoading(true);
  try {
    const maxId = Math.max(0, ...Object.keys(state.bucket).map(Number)) + 1;
    await FB.patch(`${FB.endpoints.bucket}/${maxId}`, data);
    state.bucket[maxId] = data;
    $("add-input").value = "";
    buildCatSelect($("add-cat"));
    renderBucket(); updateStats();
    toast("追加しました🎉");
  } catch(e) { toast("保存エラー", "error"); }
  showLoading(false);
  startListener();
}

// --- ゴミ箱へ ---
async function moveToTrash(key) {
  const item = state.bucket[key];
  if (!item || !confirm(`「${item.text}」を削除しますか？`)) return;
  showLoading(true);
  try {
    await FB.patch(`${FB.endpoints.trash}/${key}`, { ...item, deletedAt: Date.now() });
    await FB.delete(`${FB.endpoints.bucket}/${key}`);
    delete state.bucket[key];
    state.trash[key] = item;
    renderBucket(); updateStats();
    toast("削除しました");
  } catch(e) { toast("エラーが発生しました", "error"); }
  showLoading(false);
  startListener();
}

// --- モーダル ---
function openModal(key) {
  state.editKey = key;
  const item = state.bucket[key] || {};
  $("modal-title").textContent = "編集";
  $("modal-input-text").value = item.text || "";
  $("modal-input-urg").value  = item.urg  || "中";
  $("modal-input-prio").value = item.prio || "中";
  buildCatSelect($("modal-input-cat"), item.cat || "");
  $("modal-overlay").classList.remove("hidden");
  $("modal-input-text").focus();
}
function closeModal() {
  $("modal-overlay").classList.add("hidden");
  state.editKey = null;
}
async function saveModal() {
  let text = $("modal-input-text").value.trim();
  let cat  = $("modal-input-cat").value;
  let urg  = $("modal-input-urg").value;
  let prio = $("modal-input-prio").value;
  if (!text) { toast("タイトルを入力してください", "error"); return; }
  if (cat === "__new__") { cat = prompt("新しいカテゴリ名を入力") || ""; }
  const data = { text, cat, urg, prio, done: state.bucket[state.editKey].done };
  showLoading(true);
  try {
    await FB.patch(`${FB.endpoints.bucket}/${state.editKey}`, data);
    state.bucket[state.editKey] = { ...state.bucket[state.editKey], ...data };
    buildCatSelect($("add-cat"));
    renderBucket();
    closeModal();
    toast("更新しました");
  } catch(e) { toast("保存エラー", "error"); }
  showLoading(false);
  startListener();
}

// --- イベント ---
bucketUL.addEventListener("click", e => {
  const key = e.target.dataset.key;
  if (!key) return;
  if (e.target.classList.contains("item-check")) toggleDone(key);
  if (e.target.classList.contains("act-edit"))   openModal(key);
  if (e.target.classList.contains("act-trash"))  moveToTrash(key);
});

// 優先度ボタン
document.querySelectorAll(".prio-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    document.querySelectorAll(`.prio-btn[data-type="${type}"]`).forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (type === "urg")  state.newUrg  = btn.dataset.val;
    if (type === "prio") state.newPrio = btn.dataset.val;
  });
});

$("btn-add").addEventListener("click", addItem);
$("add-input").addEventListener("keydown", e => { if (e.key === "Enter") addItem(); });
searchEl.addEventListener("input",    renderBucket);
stsFilter.addEventListener("change",  renderBucket);
$("modal-cancel").addEventListener("click", closeModal);
$("modal-save").addEventListener("click",   saveModal);
$("modal-overlay").addEventListener("click", e => {
  if (e.target === $("modal-overlay")) closeModal();
});

// タブ切替
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    state.tab = btn.dataset.tab;
    $(`tab-${state.tab}`).classList.add("active");
  });
});

// --- ユーティリティ ---
function esc(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function showLoading(show) { $("loading").classList.toggle("hidden", !show); }
function toast(msg, type = "ok") {
  const el = $("toast");
  el.textContent = msg;
  el.className = `toast-${type}`;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2500);
}

// --- リアルタイムリスナー起動 ---
function startListener() {
  FB.listen(FB.endpoints.bucket, (data, patch) => {
    if (data) {
      state.bucket = data;
      buildCatSelect($("add-cat"));
      renderBucket();
      updateStats();
    }
  });
}

init();
