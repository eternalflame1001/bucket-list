// ==========================================
// stats.js — 達成バッジ & 進捗グラフ
// ==========================================

// ==========================================
// バッジ定義
// ==========================================
function _getBadgeCounts() {
  const s      = window.appState || {};
  const bucket = s.bucket || {};
  const visit  = s.visit  || {};

  const bItems    = Object.values(bucket);
  const doneCount = bItems.filter(i => i.done).length;

  const jp  = Object.values(visit.japan    || {}).filter(v => !!v).length;
  const cn  = Object.values(visit.china    || {}).filter(v => !!v).length;
  const wld = Object.values(visit.world    || {}).filter(v => !!v).length;
  const her = Object.values(visit.heritage || {}).filter(v => !!v).length;
  const ons = Object.values(visit.onsen    || {}).filter(v => !!v).length;

  // 関東7都県全制覇チェック（prefShortキー）
  const jpD = visit.japan || {};
  const KANTO = ["茨城","栃木","群馬","埼玉","千葉","東京","神奈川"];
  const kantoOk = KANTO.every(p => !!jpD[p]);

  // 北海道東北全制覇
  const TOHOKU = ["北海道","青森","岩手","宮城","秋田","山形","福島"];
  const tohokuOk = TOHOKU.every(p => !!jpD[p]);

  return { doneCount, jp, cn, wld, her, ons, kantoOk, tohokuOk };
}

const BADGE_DEFS = [
  // BucketList
  { id:'bl_1',   icon:'🌱', name:'最初の一歩',      desc:'1つ達成',              cat:'BucketList', check: c => c.doneCount >= 1  },
  { id:'bl_10',  icon:'⭐', name:'10達成',           desc:'10個達成',             cat:'BucketList', check: c => c.doneCount >= 10 },
  { id:'bl_25',  icon:'🏆', name:'25達成',           desc:'25個達成',             cat:'BucketList', check: c => c.doneCount >= 25 },
  { id:'bl_50',  icon:'👑', name:'50達成！',         desc:'50個達成',             cat:'BucketList', check: c => c.doneCount >= 50 },
  // 日本
  { id:'jp_1',   icon:'🗾', name:'日本デビュー',     desc:'1都道府県訪問',        cat:'日本',       check: c => c.jp >= 1  },
  { id:'jp_10',  icon:'🌸', name:'10県達成',         desc:'10都道府県訪問',       cat:'日本',       check: c => c.jp >= 10 },
  { id:'jp_25',  icon:'🗻', name:'25県達成',         desc:'25都道府県訪問',       cat:'日本',       check: c => c.jp >= 25 },
  { id:'jp_knt', icon:'🌆', name:'関東制覇',         desc:'関東7都県を全て訪問',  cat:'日本',       check: c => c.kantoOk  },
  { id:'jp_thk', icon:'🍎', name:'北東北制覇',       desc:'北海道・東北7道県制覇',cat:'日本',       check: c => c.tohokuOk },
  { id:'jp_all', icon:'🎌', name:'全国制覇！',       desc:'47都道府県を全制覇',   cat:'日本',       check: c => c.jp >= 47 },
  // 温泉
  { id:'ons_1',  icon:'♨️', name:'温泉デビュー',     desc:'温泉1か所訪問',        cat:'温泉',       check: c => c.ons >= 1  },
  { id:'ons_5',  icon:'♨️', name:'温泉5か所',        desc:'5か所達成',            cat:'温泉',       check: c => c.ons >= 5  },
  { id:'ons_10', icon:'♨️', name:'温泉10か所',       desc:'10か所達成',           cat:'温泉',       check: c => c.ons >= 10 },
  // 中国
  { id:'cn_1',   icon:'🇨🇳', name:'中国デビュー',   desc:'中国1省訪問',          cat:'中国',       check: c => c.cn >= 1  },
  { id:'cn_5',   icon:'🐉', name:'中国5省',          desc:'5省・自治区訪問',      cat:'中国',       check: c => c.cn >= 5  },
  { id:'cn_10',  icon:'🏯', name:'中国10省',         desc:'10省・自治区訪問',     cat:'中国',       check: c => c.cn >= 10 },
  // 世界
  { id:'wld_1',  icon:'✈️', name:'海外デビュー',     desc:'1か国訪問',            cat:'世界',       check: c => c.wld >= 1  },
  { id:'wld_10', icon:'🌍', name:'10か国',           desc:'10か国訪問',           cat:'世界',       check: c => c.wld >= 10 },
  { id:'wld_20', icon:'🌎', name:'20か国',           desc:'20か国訪問',           cat:'世界',       check: c => c.wld >= 20 },
  { id:'wld_50', icon:'🌏', name:'50か国！',         desc:'50か国訪問',           cat:'世界',       check: c => c.wld >= 50 },
  // 世界遺産
  { id:'her_1',  icon:'⭐', name:'世界遺産デビュー', desc:'世界遺産1か所訪問',    cat:'世界遺産',   check: c => c.her >= 1  },
  { id:'her_10', icon:'🌟', name:'世界遺産10か所',   desc:'10か所達成',           cat:'世界遺産',   check: c => c.her >= 10 },
  { id:'her_20', icon:'💫', name:'世界遺産20か所',   desc:'20か所達成',           cat:'世界遺産',   check: c => c.her >= 20 },
];

// ==========================================
// 年別訪問データ集計
// ==========================================
function _collectYearData() {
  const visit  = window.appState?.visit || {};
  const SCOPES = ['japan','china','world','onsen','gourmet','ramen','heritage'];
  const yearMap = {};

  SCOPES.forEach(scope => {
    Object.values(visit[scope] || {}).forEach(val => {
      if (!val || val === true) return;
      const yr = Number(val);
      if (isNaN(yr) || yr < 1950 || yr > 2100) return;
      if (!yearMap[yr]) yearMap[yr] = {};
      yearMap[yr][scope] = (yearMap[yr][scope] || 0) + 1;
    });
  });
  return yearMap;
}

// ==========================================
// Stats メイン描画
// ==========================================
function renderStats() {
  const container = document.getElementById('tab-stats');
  if (!container) return;

  const s      = window.appState || {};
  const visit  = s.visit  || {};
  const bucket = s.bucket || {};
  const counts = _getBadgeCounts();

  const unlocked = BADGE_DEFS.filter(b =>  b.check(counts));
  const locked   = BADGE_DEFS.filter(b => !b.check(counts));

  // ---- セクション1: バッジ ----
  let html = `<div class="stats-section">
    <div class="stats-sec-title">🏆 達成バッジ
      <span class="stats-badge-count">${unlocked.length} / ${BADGE_DEFS.length}</span>
    </div>
    <div class="badge-grid">`;

  [...unlocked, ...locked].forEach(b => {
    const on = b.check(counts);
    html += `<div class="badge-card ${on ? 'badge-on' : 'badge-off'}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
    </div>`;
  });

  html += `</div></div>`;

  // ---- セクション2: 進捗グラフ ----
  html += `<div class="stats-section">
    <div class="stats-sec-title">📊 進捗グラフ</div>`;

  // バケツリストカテゴリ別
  const bItems = Object.values(bucket);
  const bTotal = bItems.length;
  const bDone  = bItems.filter(i => i.done).length;

  html += `<div class="stats-sub-sec">バケツリスト カテゴリ別</div>
    <div class="prog-chart">`;
  html += _progBar('📚 全体', bDone, bTotal, '#c4813a');
  [
    { key:'海外旅行',   icon:'🌍', color:'#4a90d9' },
    { key:'国内旅行',   icon:'🗾', color:'#5ab87e' },
    { key:'食',         icon:'🍜', color:'#e07b4a' },
    { key:'人生の目標', icon:'⭐', color:'#c4813a' },
    { key:'スキル・学習',icon:'✏️',color:'#9b7ec8' },
  ].forEach(({ key, icon, color }) => {
    const items = bItems.filter(i => i.cat === key);
    const done  = items.filter(i => i.done).length;
    html += _progBar(`${icon} ${key}`, done, items.length, color);
  });
  html += `</div>`;

  // 訪問スコア
  html += `<div class="stats-sub-sec" style="margin-top:18px">訪問スコア</div>
    <div class="prog-chart">`;
  const gourmetTotal  = typeof GOURMET_DATA   !== 'undefined' ? GOURMET_DATA.length   : null;
  const ramenTotal    = typeof RAMEN_DATA     !== 'undefined' ? RAMEN_DATA.length     : null;
  const onsenTotal    = typeof ONSEN_DATA     !== 'undefined' ? ONSEN_DATA.length     : null;

  // 世界遺産 JP / CN / 合計 分割
  const _her = typeof HERITAGE_JP_CN !== 'undefined' ? HERITAGE_JP_CN : [];
  const _hasIso = (s, code) => Array.isArray(s.iso) ? s.iso.includes(code) : s.iso === code;
  const herJpIds   = new Set(_her.filter(s => _hasIso(s,'jp')).map(s => String(s.id)));
  const herCnIds   = new Set(_her.filter(s => _hasIso(s,'cn')).map(s => String(s.id)));
  const hv         = visit.heritage || {};
  const herJpDone  = Object.keys(hv).filter(id => hv[id] && herJpIds.has(id)).length;
  const herCnDone  = Object.keys(hv).filter(id => hv[id] && herCnIds.has(id)).length;
  // 🌍 世界合計: heritage.json 全件（キャッシュ済みなら使用）
  const _allHer    = window._heritageCache || _her;
  const herAllTotal = _allHer.length || null;
  const herAllDone  = Object.values(hv).filter(v => !!v).length;

  [
    { scope:'japan',    icon:'🗾', label:'都道府県', total:47,          color:'#5ab87e' },
    { scope:'china',    icon:'🇨🇳',label:'中国省',   total:34,          color:'#e07b4a' },
    { scope:'world',    icon:'🌍', label:'世界各国', total:177,         color:'#4a90d9' },
    { scope:'onsen',    icon:'♨️', label:'温泉',     total:onsenTotal,  color:'#c4813a' },
    { scope:'gourmet',  icon:'🍱', label:'グルメ',   total:gourmetTotal,color:'#9b7ec8' },
    { scope:'ramen',    icon:'🍜', label:'ラーメン', total:ramenTotal,  color:'#d94a4a' },
  ].forEach(({ scope, icon, label, total, color }) => {
    const cnt = Object.values(visit[scope] || {}).filter(v => !!v).length;
    html += _progBar(`${icon} ${label}`, cnt, total, color);
  });

  // 世界遺産 JP・CN・合計
  html += _progBar('⭐️世界遺産🇯🇵', herJpDone,  herJpIds.size,  '#5ab87e');
  html += _progBar('⭐️世界遺産🇨🇳', herCnDone,  herCnIds.size,  '#e07b4a');
  html += _progBar('⭐️世界遺産🌍',  herAllDone, herAllTotal,   '#d4a800');
  html += `</div>`;

  // 年別訪問グラフ
  const yearMap = _collectYearData();
  const years   = Object.keys(yearMap).map(Number).sort((a, b) => a - b);
  if (years.length > 0) {
    html += `<div class="stats-sub-sec" style="margin-top:18px">年別訪問数</div>`;
    html += _yearChart(yearMap, years);
  }

  html += `</div>`;

  container.innerHTML = html;
}

// ---- プログレスバー1行 ----
function _progBar(label, done, total, color) {
  const pct    = (total && total > 0) ? Math.round(done / total * 100) : 0;
  const valStr = (total !== null) ? `${done}/${total}` : `${done}か所`;
  const pctStr = (total !== null) ? ` <em>${pct}%</em>` : '';
  return `<div class="prog-row">
    <div class="prog-label">${label}</div>
    <div class="prog-bar-wrap">
      <div class="prog-bar-fill" style="width:${pct}%;background:${color}"></div>
    </div>
    <div class="prog-val">${valStr}${pctStr}</div>
  </div>`;
}

// ---- 年別棒グラフ ----
function _yearChart(yearMap, years) {
  const COLORS = {
    japan:'#5ab87e', china:'#e07b4a', world:'#4a90d9',
    onsen:'#c4813a', gourmet:'#9b7ec8', ramen:'#d94a4a', heritage:'#d4a800'
  };
  const LABELS = {
    japan:'都道府県', china:'中国省', world:'世界各国',
    onsen:'温泉', gourmet:'グルメ', ramen:'ラーメン', heritage:'世界遺産'
  };
  const SCOPES = ['japan','china','world','onsen','gourmet','ramen','heritage'];

  const maxTotal = Math.max(1, ...years.map(yr =>
    SCOPES.reduce((s, sc) => s + (yearMap[yr][sc] || 0), 0)
  ));

  const BAR_W  = 34;
  const GAP    = 6;
  const BAR_H  = 100;
  const PAD_T  = 22;   // space above bar for count label
  const PAD_B  = 36;   // space below bar for year label
  const svgW   = years.length * (BAR_W + GAP);
  const svgH   = PAD_T + BAR_H + PAD_B;

  let out = `<div class="ychart-outer"><svg width="${svgW}" height="${svgH}"
    style="display:block;overflow:visible">`;

  years.forEach((yr, i) => {
    const x     = i * (BAR_W + GAP);
    const total = SCOPES.reduce((s, sc) => s + (yearMap[yr][sc] || 0), 0);

    // stacked segments (bottom → top)
    let segY = PAD_T + BAR_H;
    SCOPES.forEach(sc => {
      const n = yearMap[yr][sc] || 0;
      if (!n) return;
      const h = Math.max(2, Math.round((n / maxTotal) * BAR_H));
      segY -= h;
      out += `<rect x="${x}" y="${segY}" width="${BAR_W}" height="${h}"
        fill="${COLORS[sc]}" rx="2">
        <title>${yr}年 ${LABELS[sc]}: ${n}か所</title>
      </rect>`;
    });

    // count label above top of bar
    if (total > 0) {
      const topBarY = SCOPES.reduce((acc, sc) => {
        const n = yearMap[yr][sc] || 0;
        return n ? acc - Math.max(2, Math.round((n / maxTotal) * BAR_H)) : acc;
      }, PAD_T + BAR_H);
      out += `<text x="${x + BAR_W / 2}" y="${topBarY - 3}"
        text-anchor="middle" font-size="12" font-weight="700" fill="${COLORS[SCOPES.find(sc => (yearMap[yr][sc]||0)>0)]}">${total}</text>`;
    }

    // year label (rotated -90°)
    const lx = x + BAR_W / 2;
    const ly = PAD_T + BAR_H + 4;
    out += `<text x="${lx}" y="${ly}" text-anchor="start"
      font-size="12" fill="#7a6a55"
      transform="rotate(-90,${lx},${ly})">${yr}</text>`;
  });

  out += `</svg>`;

  // legend — only scopes that appear in data
  const usedScopes = SCOPES.filter(sc => years.some(yr => (yearMap[yr][sc] || 0) > 0));
  out += `<div class="ychart-legend">`;
  usedScopes.forEach(sc => {
    out += `<span class="ychart-legend-item">
      <span class="ychart-dot" style="background:${COLORS[sc]}"></span>${LABELS[sc]}
    </span>`;
  });
  out += `</div></div>`;

  return out;
}

window.renderStats = renderStats;
