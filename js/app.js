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
  const all   = Object.values(state.bucket).filter(v => v != null);
  const trash = Object.values(state.trash).filter(v => v != null);
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
    const items = Object.entries(state.trash).filter(([, v]) => v != null);
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
    if (v == null) return false;
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
    // detail-view HTML を外で組み立て（三重ネスト回避）
    let dvHtml = '';
    if (hasDetail) {
      let rows = '';
      if (item.memo)  rows += '<div class="dv-row">📝 ' + esc(item.memo)  + '</div>';
      if (item.date)  rows += '<div class="dv-row">📅 ' + esc(item.date)  + '</div>';
      if (item.place) rows += '<div class="dv-row">📍 ' + esc(item.place) + '</div>';
      dvHtml = '<div class="detail-view hidden" id="dv-' + key + '">' + rows + '</div>';
    }
    li.innerHTML = `
      <div class="item-check" data-key="${key}">${item.done?"✓":""}</div>
      <div class="item-body">
        <div class="item-title">${esc(item.text)}</div>
        <div class="item-meta">
          ${item.cat?`<span class="item-cat-badge">${CAT_ICONS[item.cat]||""}</span>`:""}
          <span class="item-score">${toZen(s)}</span>
          <span class="prio-group" data-type="urg" data-key="${key}">
            <span class="prio-row-label">緊急度</span>
            <span class="prio-tag${item.urg==="高"?" on":""}" data-val="高">高</span>
            <span class="prio-tag${item.urg==="中"?" on":""}" data-val="中">中</span>
            <span class="prio-tag${item.urg==="低"?" on":""}" data-val="低">低</span>
          </span>
          <span class="prio-group" data-type="prio" data-key="${key}">
            <span class="prio-row-label">重要度</span>
            <span class="prio-tag${item.prio==="高"?" on":""}" data-val="高">高</span>
            <span class="prio-tag${item.prio==="中"?" on":""}" data-val="中">中</span>
            <span class="prio-tag${item.prio==="低"?" on":""}" data-val="低">低</span>
          </span>
        </div>
        ${dvHtml}
        <div class="detail-panel hidden" id="dp-${key}">
          <div class="detail-field"><label>📝 メモ</label><textarea class="dp-memo">${esc(item.memo||"")}</textarea></div>
          <div class="detail-field"><label>📅 目標日・期限</label><input class="dp-date" type="text" value="${esc(item.date||"")}"></div>
          <div class="detail-field"><label>📍 場所・エリア</label><input class="dp-place" type="text" value="${esc(item.place||"")}"></div>
          <button class="dp-save" data-key="${key}">💾 保存</button>
        </div>
      </div>
      <div class="item-actions">
        <button class="act-detail${hasDetail?' has-content':''}" data-key="${key}">📋</button>
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

  // アニメ用: 再描画前にチェックボタンの位置を取得
  const checkEl = bucketUL.querySelector(`.item-check[data-key="${key}"]`);
  const rect = checkEl ? checkEl.getBoundingClientRect() : null;
  const cx = rect ? rect.left + rect.width / 2 : 0;
  const cy = rect ? rect.top  + rect.height / 2 : 0;

  state.bucket[key].done = newDone;
  renderBucket();

  // 達成時: 行グロー + コンフェッティ
  if (newDone && rect) {
    requestAnimationFrame(() => {
      const li = bucketUL.querySelector(`.item-check[data-key="${key}"]`)?.closest('li');
      if (li) {
        li.classList.add('just-done');
        li.addEventListener('animationend', () => li.classList.remove('just-done'), { once: true });
      }
      window.popConfetti?.(cx, cy, 14);
    });
  }

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

// --- 緊急度・重要度更新 ---
async function updatePrio(key, type, val) {
  const item = state.bucket[key];
  if (!item) return;
  const prev = type === "urg" ? item.urg : item.prio;
  const data = type === "urg" ? { urg: val } : { prio: val };
  state.bucket[key] = { ...item, ...data };
  renderBucket();
  try {
    await FB.patch(`${FB.endpoints.bucket}/${key}`, data);
  } catch(e) {
    state.bucket[key] = { ...state.bucket[key], ...(type === "urg" ? { urg: prev } : { prio: prev }) };
    renderBucket();
    toast("保存エラー", "error");
  }
}

// --- イベント委任 ---
bucketUL.addEventListener("click", e => {
  const tag = e.target.closest(".prio-tag");
  if (tag) {
    const group = tag.closest(".prio-group");
    if (!group) return;
    const key = group.dataset.key;
    const type = group.dataset.type;
    const val = tag.dataset.val;
    if (key && type && val) updatePrio(key, type, val);
    return;
  }

  const titleEl = e.target.closest(".item-title");
  if (titleEl) {
    const key = titleEl.closest("li")?.querySelector(".item-check")?.dataset.key;
    if (key) openEdit(key);
    return;
  }

  const btn = e.target.closest("button, .item-check");
  if (!btn) return;
  const key = btn.dataset.key;
  if (!key) return;

  if (btn.classList.contains("item-check"))  { toggleDone(key); }
  else if (btn.classList.contains("act-edit")) {
    const panel = $(`dp-${key}`);
    if (panel) {
      const isOpen = !panel.classList.contains("hidden");
      panel.classList.toggle("hidden", isOpen);
      btn.classList.toggle("open", !isOpen);
    }
  }
  else if (btn.classList.contains("act-trash"))   { moveToTrash(key); }
  else if (btn.classList.contains("act-restore")) { restoreFromTrash(key); }
  else if (btn.classList.contains("act-delete"))  { deleteFromTrash(key); }
  else if (btn.classList.contains("dp-save"))     { saveDetail(key); }
  else if (btn.classList.contains("act-detail")) {
    const view = $(`dv-${key}`);
    if (view) {
      const isOpen = !view.classList.contains("hidden");
      view.classList.toggle("hidden", isOpen);
      btn.classList.toggle("open", !isOpen);
    }
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
    const onsenNav = document.getElementById('onsen-toolbar-nav');
    if (onsenNav) onsenNav.style.display = 'none';
    if (['japan','china','world'].includes(state.tab)) {
      setTimeout(() => window.onMapTabActivate?.(state.tab), 50);
    }
    if (state.tab === 'stats') {
      setTimeout(() => window.renderStats?.(), 50);
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
    // 温泉ツールバーの表示切替
    const onsenNav = document.getElementById('onsen-toolbar-nav');
    if (onsenNav) onsenNav.style.display = sub === 'japan-onsen' ? '' : 'none';
    // 温泉・グルメ・ラーメンタブ
    if (sub === "japan-onsen")   window.renderOnsenTab?.();
    if (sub === "japan-gourmet") window.renderFoodTab?.("gourmet");
    if (sub === "japan-ramen")   window.renderFoodTab?.("ramen");
  });
});

// --- リアルタイムリスナー ---
function startListener() {
  FB.listen(FB.endpoints.bucket, (data, patch) => {
    if (patch) {
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null) delete state.bucket[k];
        else state.bucket[k] = v;
      });
      renderBucket();
    } else if (data) {
      state.bucket = data;
      renderBucket();
    }
  });

}

// --- コンフェッティ ---
window.popConfetti = function(cx, cy, count = 12) {
  const colors = ['#c4813a','#e8c06a','#5ab87e','#4a90d9','#e07b4a','#9b7ec8','#cc3333'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const dist  = 45 + Math.random() * 65;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist - 15;
    const size  = 5 + Math.random() * 6;
    el.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;` +
      `width:${size}px;height:${size}px;` +
      `background:${colors[Math.floor(Math.random() * colors.length)]};` +
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'};` +
      `pointer-events:none;z-index:9999;`;
    document.body.appendChild(el);
    el.animate([
      { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)',   opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0) rotate(180deg)`, opacity: 0 }
    ], { duration: 550 + Math.random() * 300, easing: 'ease-out', fill: 'forwards' })
      .onfinish = () => el.remove();
  }
};

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

