// ==========================================
// map.js v3 — 訪問地管理
// 構成: ボタン → SVG地図 → 渡航履歴
// ==========================================

const JAPAN_REGIONS = [
  { label: "北海道", prefs: ["北海道"] },
  { label: "東北", prefs: ["青森県","岩手県","宮城県","秋田県","山形県","福島県"] },
  { label: "関東", prefs: ["茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県"] },
  { label: "中部", prefs: ["新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県"] },
  { label: "近畿", prefs: ["三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県"] },
  { label: "中国", prefs: ["鳥取県","島根県","岡山県","広島県","山口県"] },
  { label: "四国", prefs: ["徳島県","香川県","愛媛県","高知県"] },
  { label: "九州・沖縄", prefs: ["福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"] }
];

const CHINA_REGIONS = [
  { label: "直轄市", areas: ["北京市","天津市","上海市","重慶市"] },
  { label: "東北", areas: ["遼寧省","吉林省","黒竜江省"] },
  { label: "華北", areas: ["河北省","山西省","内モンゴル自治区"] },
  { label: "華東", areas: ["江蘇省","浙江省","安徽省","福建省","江西省","山東省"] },
  { label: "華中・華南", areas: ["河南省","湖北省","湖南省","広東省","広西チワン族自治区","海南省"] },
  { label: "西南", areas: ["四川省","貴州省","雲南省","チベット自治区"] },
  { label: "西北", areas: ["陝西省","甘粛省","青海省","寧夏回族自治区","新疆ウイグル自治区"] },
  { label: "特別行政区", areas: ["香港特別行政区","マカオ特別行政区"] }
];

const WORLD_REGIONS = [
  { label: "🌏 東アジア", countries: ["日本","韓国","中国","台湾","北朝鮮","モンゴル","香港","マカオ"] },
  { label: "🌏 東南アジア", countries: ["タイ","ベトナム","インドネシア","フィリピン","マレーシア","シンガポール","ミャンマー","カンボジア","ラオス","ブルネイ","東ティモール"] },
  { label: "🌏 南アジア", countries: ["インド","パキスタン","バングラデシュ","スリランカ","ネパール","ブータン","モルディブ","アフガニスタン"] },
  { label: "🌏 中央アジア", countries: ["カザフスタン","ウズベキスタン","トルクメニスタン","タジキスタン","キルギス"] },
  { label: "🌏 西アジア・中東", countries: ["トルコ","イラン","イラク","サウジアラビア","アラブ首長国連邦","イスラエル","ヨルダン","レバノン","シリア","クウェート","カタール","バーレーン","オマーン","イエメン","ジョージア","アルメニア","アゼルバイジャン","キプロス"] },
  { label: "🌍 西ヨーロッパ", countries: ["フランス","ドイツ","イギリス","イタリア","スペイン","ポルトガル","オランダ","ベルギー","スイス","オーストリア","ルクセンブルク","アイルランド","モナコ","アンドラ","リヒテンシュタイン","マルタ"] },
  { label: "🌍 北ヨーロッパ", countries: ["スウェーデン","ノルウェー","デンマーク","フィンランド","アイスランド","エストニア","ラトビア","リトアニア"] },
  { label: "🌍 東ヨーロッパ", countries: ["ロシア","ポーランド","チェコ","スロバキア","ハンガリー","ルーマニア","ブルガリア","ウクライナ","ベラルーシ","モルドバ","クロアチア","スロベニア","ボスニア・ヘルツェゴビナ","セルビア","モンテネグロ","アルバニア","コソボ","ギリシャ"] },
  { label: "🌎 北アメリカ", countries: ["アメリカ","カナダ","メキシコ","キューバ","ジャマイカ","ハイチ","ドミニカ共和国","プエルトリコ","グアム"] },
  { label: "🌎 中米・カリブ", countries: ["グアテマラ","ベリーズ","ホンジュラス","エルサルバドル","ニカラグア","コスタリカ","パナマ"] },
  { label: "🌎 南アメリカ", countries: ["ブラジル","アルゼンチン","チリ","コロンビア","ペルー","ベネズエラ","エクアドル","ボリビア","パラグアイ","ウルグアイ","ガイアナ","スリナム"] },
  { label: "🌍 北アフリカ", countries: ["エジプト","モロッコ","チュニジア","アルジェリア","リビア","スーダン"] },
  { label: "🌍 サブサハラ・アフリカ", countries: ["南アフリカ","ナイジェリア","ケニア","エチオピア","タンザニア","ガーナ","セネガル","コートジボワール","カメルーン","ウガンダ","ルワンダ","ジンバブエ","モザンビーク","マダガスカル","ナミビア","ボツワナ","ザンビア","マラウイ","アンゴラ","コンゴ共和国","コンゴ民主共和国"] },
  { label: "🌏 オセアニア", countries: ["オーストラリア","ニュージーランド","フィジー","パプアニューギニア","ソロモン諸島","バヌアツ","サモア","トンガ","パラオ","ミクロネシア","マーシャル諸島","ニューカレドニア","フランス領ポリネシア"] }
];

// --- 年グラデーション（1975=薄青 〜 現在=濃青）---
function yearToColor(year) {
  if (!year || year === true) return "#4a90d9";
  const t = Math.max(0, Math.min(1, (year - 1975) / (new Date().getFullYear() - 1975)));
  const r = Math.round(179 - t * 166);
  const g = Math.round(212 - t * 153);
  const b = Math.round(240 - t * 130);
  return `rgb(${r},${g},${b})`;
}
function prefShort(name) { return name.replace(/[都道府県]$/, ""); }

// ==========================================
// ① ボタングリッド描画
// ==========================================
function renderButtons(container, groups, visitData, type) {
  const allItems = groups.flatMap(g => g.prefs || g.areas || g.countries || []);
  const visitedCount = allItems.filter(n => {
    const key = type === "japan" ? prefShort(n) : n;
    return !!visitData[key];
  }).length;
  const total = allItems.length;
  const pct = total ? Math.round(visitedCount / total * 100) : 0;

  let html = `<div class="map-stat-bar">
    <span class="map-stat-visited">${visitedCount} / ${total}</span>
    <div class="map-stat-track"><div class="map-stat-fill" style="width:${pct}%"></div></div>
    <span class="map-stat-pct">${pct}%</span>
  </div>`;

  groups.forEach(group => {
    const items = group.prefs || group.areas || group.countries || [];
    html += `<div class="visit-group">
      <div class="visit-group-label">${group.label}</div>
      <div class="visit-btn-grid">`;
    items.forEach(name => {
      const key = type === "japan" ? prefShort(name) : name;
      const val = visitData[key];
      const year = (val === true) ? null : (val || null);
      const visited = !!val;
      const color = visited ? yearToColor(year) : "";
      const disp = type === "japan" ? name.replace(/[都道府県]$/, "") : name;
      html += `<button class="visit-btn ${visited ? "visited" : ""}"
        data-name="${key}" data-type="${type}" data-visited="${visited}"
        ${visited ? `style="background:${color};border-color:${color}"` : ""}>
        ${disp}${year ? `<small>${year}</small>` : visited ? `<small>✓</small>` : ""}
      </button>`;
    });
    html += `</div></div>`;
  });

  container.innerHTML = html;
  container.querySelectorAll(".visit-btn").forEach(btn => {
    btn.addEventListener("click", () => onBtnClick(btn, type));
  });
}

// ==========================================
// ② SVG地図描画（Japanのみ）
// ==========================================
let _japanTopo = null;
async function renderJapanMap(visitData) {
  const container = document.getElementById("japan-svg-container");
  if (!container) return;

  if (!_japanTopo) {
    try {
      const r = await fetch("./japan.json");
      _japanTopo = await r.json();
    } catch(e) {
      container.innerHTML = '<div class="map-load-msg">地図データ読み込み失敗</div>';
      return;
    }
  }

  const features = topojson.feature(_japanTopo, _japanTopo.objects.japan).features;
  const W = container.clientWidth || 370;
  const H = Math.round(W * 1.05);
  const projection = d3.geoMercator().fitSize([W, H], { type: "FeatureCollection", features });
  const pathGen = d3.geoPath().projection(projection);

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" xmlns="http://www.w3.org/2000/svg">`;
  features.forEach(feat => {
    const full = feat.properties.nam_ja;
    const key = prefShort(full);
    const val = visitData[key];
    const year = (val === true) ? null : (val || null);
    const visited = !!val;
    const fill = visited ? yearToColor(year) : "#e8e4dc";
    const d = pathGen(feat);
    if (!d) return;
    svg += `<path d="${d}" fill="${fill}" stroke="#fff" stroke-width="0.8" class="svg-pref"
      data-name="${key}" style="cursor:pointer">
      <title>${full}${year ? " "+year+"年" : visited ? " 訪問済" : " 未訪問"}</title>
    </path>`;
  });
  svg += `</svg>`;
  container.innerHTML = svg;

  container.querySelectorAll(".svg-pref").forEach(path => {
    path.addEventListener("click", () => {
      const name = path.dataset.name;
      const val = (window.appState?.visit?.japan || {})[name];
      const curYear = (val && val !== true) ? val : new Date().getFullYear();
      openYearDialog("japan", name, curYear).then(() => refreshTab("japan"));
    });
    path.addEventListener("mouseenter", () => path.style.opacity = "0.7");
    path.addEventListener("mouseleave", () => path.style.opacity = "1");
  });
}

// ==========================================
// ③ 渡航履歴リスト（年ごと・新しい順）
// ==========================================
function renderHistory(container, visitData, type) {
  // 年ごとにグループ化
  const byYear = {};
  const noYear = [];
  Object.entries(visitData).forEach(([name, val]) => {
    if (!val) return;
    const year = (val === true) ? null : val;
    if (year) {
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(name);
    } else {
      noYear.push(name);
    }
  });

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  if (years.length === 0 && noYear.length === 0) {
    container.innerHTML = '<div class="history-empty">まだ訪問履歴がありません</div>';
    return;
  }

  let html = '<div class="history-list">';

  years.forEach(yr => {
    html += `<div class="history-year-group">
      <div class="history-year-label">${yr}年</div>
      <div class="history-places">`;
    byYear[yr].sort().forEach(name => {
      html += `<button class="history-place-btn" data-name="${name}" data-type="${type}" data-year="${yr}">${name}</button>`;
    });
    html += `</div></div>`;
  });

  if (noYear.length > 0) {
    html += `<div class="history-year-group">
      <div class="history-year-label">年不明</div>
      <div class="history-places">`;
    noYear.sort().forEach(name => {
      html += `<button class="history-place-btn" data-name="${name}" data-type="${type}" data-year="">${name}</button>`;
    });
    html += `</div></div>`;
  }

  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll(".history-place-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const curYear = btn.dataset.year ? parseInt(btn.dataset.year) : new Date().getFullYear();
      openYearDialog(btn.dataset.type, btn.dataset.name, curYear)
        .then(() => refreshTab(btn.dataset.type));
    });
  });
}

// ==========================================
// ボタンクリック処理
// ==========================================
async function onBtnClick(btn, type) {
  const name = btn.dataset.name;
  const visited = btn.dataset.visited === "true";
  if (visited) {
    // 2回目: 削除確認
    const disp = btn.textContent.replace(/\d{4}|✓/g, "").trim();
    if (confirm(`「${disp}」の訪問履歴を削除しますか？`)) {
      await saveVisit(type, name, null);
      refreshTab(type);
    }
  } else {
    await openYearDialog(type, name, new Date().getFullYear());
    refreshTab(type);
  }
}

// ==========================================
// 年号ダイアログ
// ==========================================
async function openYearDialog(type, name, defaultYear) {
  return new Promise(resolve => {
    const overlay = document.getElementById("year-dialog-overlay");
    const titleEl = document.getElementById("year-dialog-title");
    const input   = document.getElementById("year-dialog-input");
    const btnSave = document.getElementById("year-dialog-save");
    const btnCancel = document.getElementById("year-dialog-cancel");

    titleEl.textContent = name;
    input.value = defaultYear || new Date().getFullYear();
    overlay.classList.remove("hidden");
    setTimeout(() => { input.focus(); input.select(); }, 50);

    function done() {
      overlay.classList.add("hidden");
      btnSave.onclick = btnCancel.onclick = overlay.onclick = input.onkeydown = null;
    }
    btnSave.onclick = async () => {
      const yr = parseInt(input.value);
      const curY = new Date().getFullYear();
      if (isNaN(yr) || yr < 1975 || yr > curY) {
        alert(`1975〜${curY}の年を入力してください`);
        return;
      }
      done();
      await saveVisit(type, name, yr);
      resolve();
    };
    btnCancel.onclick = () => { done(); resolve(); };
    overlay.onclick = e => { if (e.target === overlay) { done(); resolve(); } };
    input.onkeydown = e => { if (e.key === "Enter") btnSave.onclick(); };
  });
}

// ==========================================
// Firebase保存
// ==========================================
async function saveVisit(type, name, value) {
  if (!window.appState) return;
  if (!window.appState.visit) window.appState.visit = {};
  if (!window.appState.visit[type]) window.appState.visit[type] = {};
  try {
    if (value === null) {
      await FB.delete(`${FB.endpoints.visit}/${type}/${name}`);
      delete window.appState.visit[type][name];
    } else {
      await FB.patch(`${FB.endpoints.visit}/${type}`, { [name]: value });
      window.appState.visit[type][name] = value;
    }
    if (typeof toast === "function") toast("保存しました ✓");
  } catch(e) {
    if (typeof toast === "function") toast("保存エラー", "error");
  }
}

// ==========================================
// タブ全体リフレッシュ
// ==========================================
function refreshTab(type) {
  const visitData = window.appState?.visit?.[type] || {};
  const groups = type === "japan" ? JAPAN_REGIONS : type === "china" ? CHINA_REGIONS : WORLD_REGIONS;
  const allItems = groups.flatMap(g => g.prefs || g.areas || g.countries || []);
  const total = allItems.length;
  const visitedCount = Object.keys(visitData).length;
  const pct = total ? Math.round(visitedCount / total * 100) : 0;

  // 統計
  const statsEl = document.getElementById(`${type}-map-stats`);
  if (statsEl) statsEl.innerHTML = `<span class="mstat-num">${visitedCount}</span> / ${total} <span class="mstat-pct">${pct}%</span>`;

  // ボタン
  const btnEl = document.getElementById(`${type}-btn-container`);
  if (btnEl) renderButtons(btnEl, groups, visitData, type);

  // 地図（Japanのみ）
  if (type === "japan") renderJapanMap(visitData);

  // 渡航履歴
  const histEl = document.getElementById(`${type}-history`);
  if (histEl) renderHistory(histEl, visitData, type);
}

// ==========================================
// タブ切替時
// ==========================================
window.onMapTabActivate = function(type) {
  refreshTab(type);
};
