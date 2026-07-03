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

  const bItems    = Object.values(bucket).filter(v => v != null); // 削除済みキーのnull穴を除去
  const doneCount = bItems.filter(i => i.done).length;

  const jp  = Object.values(visit.japan    || {}).filter(v => !!v).length;
  const cn  = Object.values(visit.china    || {}).filter(v => !!v).length;
  const wld = Object.values(visit.world    || {}).filter(v => !!v).length;
  const her = Object.values(visit.heritage || {}).filter(v => !!v).length;
  const ons = Object.values(visit.onsen    || {}).filter(v => !!v).length;
  const grm = Object.values(visit.gourmet  || {}).filter(v => !!v).length;
  const ram = Object.values(visit.ramen    || {}).filter(v => !!v).length;

  const jpD = visit.japan || {};
  const KANTO    = ["茨城","栃木","群馬","埼玉","千葉","東京","神奈川"];
  const TOHOKU   = ["北海道","青森","岩手","宮城","秋田","山形","福島"];
  const KANSAI   = ["大阪","兵庫","京都","滋賀","奈良","和歌山"];
  const KYUSHU   = ["福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島"];
  const SHIKOKU  = ["徳島","香川","愛媛","高知"];
  const CHUGOKU  = ["鳥取","島根","岡山","広島","山口"];
  const HOKURIKU = ["富山","石川","福井"];
  const TOKAI    = ["愛知","静岡","岐阜","三重"];

  const kantoOk    = KANTO.every(p => !!jpD[p]);
  const tohokuOk   = TOHOKU.every(p => !!jpD[p]);
  const kansaiOk   = KANSAI.every(p => !!jpD[p]);
  const kyushuOk   = KYUSHU.every(p => !!jpD[p]);
  const shikokuOk  = SHIKOKU.every(p => !!jpD[p]);
  const chugokuOk  = CHUGOKU.every(p => !!jpD[p]);
  const hokurikuOk = HOKURIKU.every(p => !!jpD[p]);
  const tokaiOk    = TOKAI.every(p => !!jpD[p]);

  return { doneCount, jp, cn, wld, her, ons, grm, ram,
           kantoOk, tohokuOk, kansaiOk, kyushuOk, shikokuOk, chugokuOk, hokurikuOk, tokaiOk };
}

const BADGE_DEFS = [
  // ---- BucketList (12個) ----
  { id:'bl_1',   icon:'🌱', name:'最初の一歩',      desc:'1つ達成',    cat:'BucketList', check: c => c.doneCount >= 1   },
  { id:'bl_3',   icon:'🌿', name:'3達成',           desc:'3個達成',    cat:'BucketList', check: c => c.doneCount >= 3   },
  { id:'bl_5',   icon:'🎯', name:'5達成',           desc:'5個達成',    cat:'BucketList', check: c => c.doneCount >= 5   },
  { id:'bl_10',  icon:'⭐', name:'10達成',          desc:'10個達成',   cat:'BucketList', check: c => c.doneCount >= 10  },
  { id:'bl_15',  icon:'🌟', name:'15達成',          desc:'15個達成',   cat:'BucketList', check: c => c.doneCount >= 15  },
  { id:'bl_20',  icon:'💡', name:'20達成',          desc:'20個達成',   cat:'BucketList', check: c => c.doneCount >= 20  },
  { id:'bl_25',  icon:'🏆', name:'25達成',          desc:'25個達成',   cat:'BucketList', check: c => c.doneCount >= 25  },
  { id:'bl_30',  icon:'🔥', name:'30達成',          desc:'30個達成',   cat:'BucketList', check: c => c.doneCount >= 30  },
  { id:'bl_40',  icon:'🌕', name:'40達成',          desc:'40個達成',   cat:'BucketList', check: c => c.doneCount >= 40  },
  { id:'bl_50',  icon:'👑', name:'50達成！',        desc:'50個達成',   cat:'BucketList', check: c => c.doneCount >= 50  },
  { id:'bl_75',  icon:'💎', name:'75達成',          desc:'75個達成',   cat:'BucketList', check: c => c.doneCount >= 75  },
  { id:'bl_100', icon:'🏅', name:'100達成！',       desc:'100個達成',  cat:'BucketList', check: c => c.doneCount >= 100 },
  // ---- 日本・都道府県 (10個) ----
  { id:'jp_1',   icon:'🗾', name:'日本デビュー',    desc:'1都道府県訪問',    cat:'日本', check: c => c.jp >= 1  },
  { id:'jp_3',   icon:'🚂', name:'3県達成',         desc:'3都道府県訪問',    cat:'日本', check: c => c.jp >= 3  },
  { id:'jp_5',   icon:'🌸', name:'5県達成',         desc:'5都道府県訪問',    cat:'日本', check: c => c.jp >= 5  },
  { id:'jp_10',  icon:'🗻', name:'10県達成',        desc:'10都道府県訪問',   cat:'日本', check: c => c.jp >= 10 },
  { id:'jp_15',  icon:'🌊', name:'15県達成',        desc:'15都道府県訪問',   cat:'日本', check: c => c.jp >= 15 },
  { id:'jp_20',  icon:'⛩️', name:'20県達成',        desc:'20都道府県訪問',   cat:'日本', check: c => c.jp >= 20 },
  { id:'jp_25',  icon:'⛰️', name:'25県達成',        desc:'25都道府県訪問',   cat:'日本', check: c => c.jp >= 25 },
  { id:'jp_30',  icon:'🏯', name:'30県達成',        desc:'30都道府県訪問',   cat:'日本', check: c => c.jp >= 30 },
  { id:'jp_40',  icon:'🌆', name:'40県達成',        desc:'40都道府県訪問',   cat:'日本', check: c => c.jp >= 40 },
  { id:'jp_all', icon:'🎌', name:'全国制覇！',      desc:'47都道府県を全制覇',cat:'日本', check: c => c.jp >= 47 },
  // ---- 日本・地域制覇 (8個) ----
  { id:'jp_knt',      icon:'🌆', name:'関東制覇',      desc:'関東7都県を全て訪問',     cat:'日本', check: c => c.kantoOk    },
  { id:'jp_thk',      icon:'🍎', name:'北東北制覇',    desc:'北海道・東北7道県制覇',   cat:'日本', check: c => c.tohokuOk   },
  { id:'jp_kansai',   icon:'🌸', name:'関西制覇',      desc:'関西6府県を全て訪問',     cat:'日本', check: c => c.kansaiOk   },
  { id:'jp_kyushu',   icon:'🌺', name:'九州制覇',      desc:'九州7県を全て訪問',       cat:'日本', check: c => c.kyushuOk   },
  { id:'jp_shikoku',  icon:'🍊', name:'四国制覇',      desc:'四国4県を全て訪問',       cat:'日本', check: c => c.shikokuOk  },
  { id:'jp_chugoku',  icon:'🏯', name:'中国地方制覇',  desc:'中国地方5県を全て訪問',   cat:'日本', check: c => c.chugokuOk  },
  { id:'jp_hokuriku', icon:'🏔️', name:'北陸制覇',      desc:'北陸3県を全て訪問',       cat:'日本', check: c => c.hokurikuOk },
  { id:'jp_tokai',    icon:'🍵', name:'東海制覇',      desc:'東海4県を全て訪問',       cat:'日本', check: c => c.tokaiOk    },
  // ---- 温泉 (11個) ----
  { id:'ons_1',   icon:'♨️', name:'温泉デビュー',   desc:'温泉1か所訪問',  cat:'温泉', check: c => c.ons >= 1   },
  { id:'ons_2',   icon:'♨️', name:'温泉2か所',      desc:'2か所達成',      cat:'温泉', check: c => c.ons >= 2   },
  { id:'ons_3',   icon:'♨️', name:'温泉3か所',      desc:'3か所達成',      cat:'温泉', check: c => c.ons >= 3   },
  { id:'ons_5',   icon:'♨️', name:'温泉5か所',      desc:'5か所達成',      cat:'温泉', check: c => c.ons >= 5   },
  { id:'ons_10',  icon:'♨️', name:'温泉10か所',     desc:'10か所達成',     cat:'温泉', check: c => c.ons >= 10  },
  { id:'ons_15',  icon:'♨️', name:'温泉15か所',     desc:'15か所達成',     cat:'温泉', check: c => c.ons >= 15  },
  { id:'ons_20',  icon:'♨️', name:'温泉20か所',     desc:'20か所達成',     cat:'温泉', check: c => c.ons >= 20  },
  { id:'ons_25',  icon:'♨️', name:'温泉25か所',     desc:'25か所達成',     cat:'温泉', check: c => c.ons >= 25  },
  { id:'ons_30',  icon:'♨️', name:'温泉30か所',     desc:'30か所達成',     cat:'温泉', check: c => c.ons >= 30  },
  { id:'ons_50',  icon:'♨️', name:'温泉50か所',     desc:'50か所達成',     cat:'温泉', check: c => c.ons >= 50  },
  { id:'ons_100', icon:'♨️', name:'温泉100か所！',  desc:'100か所達成',    cat:'温泉', check: c => c.ons >= 100 },
  // ---- 中国 (10個) ----
  { id:'cn_1',   icon:'🇨🇳', name:'中国デビュー',   desc:'中国1省訪問',         cat:'中国', check: c => c.cn >= 1  },
  { id:'cn_3',   icon:'🐼',  name:'中国3省',        desc:'3省・自治区訪問',     cat:'中国', check: c => c.cn >= 3  },
  { id:'cn_5',   icon:'🐉',  name:'中国5省',        desc:'5省・自治区訪問',     cat:'中国', check: c => c.cn >= 5  },
  { id:'cn_10',  icon:'🏯',  name:'中国10省',       desc:'10省・自治区訪問',    cat:'中国', check: c => c.cn >= 10 },
  { id:'cn_15',  icon:'🏮',  name:'中国15省',       desc:'15省・自治区訪問',    cat:'中国', check: c => c.cn >= 15 },
  { id:'cn_20',  icon:'🎆',  name:'中国20省',       desc:'20省・自治区訪問',    cat:'中国', check: c => c.cn >= 20 },
  { id:'cn_25',  icon:'🌺',  name:'中国25省',       desc:'25省・自治区訪問',    cat:'中国', check: c => c.cn >= 25 },
  { id:'cn_28',  icon:'🔴',  name:'中国28省',       desc:'28省・自治区訪問',    cat:'中国', check: c => c.cn >= 28 },
  { id:'cn_30',  icon:'🌏',  name:'中国30省',       desc:'30省・自治区訪問',    cat:'中国', check: c => c.cn >= 30 },
  { id:'cn_all', icon:'🐲',  name:'中国全省制覇！', desc:'34省・自治区を全制覇',cat:'中国', check: c => c.cn >= 34 },
  // ---- 世界 (10個) ----
  { id:'wld_1',   icon:'✈️',  name:'海外デビュー',  desc:'1か国訪問',     cat:'世界', check: c => c.wld >= 1   },
  { id:'wld_5',   icon:'🧳',  name:'5か国',         desc:'5か国訪問',     cat:'世界', check: c => c.wld >= 5   },
  { id:'wld_10',  icon:'🌍',  name:'10か国',        desc:'10か国訪問',    cat:'世界', check: c => c.wld >= 10  },
  { id:'wld_20',  icon:'🌎',  name:'20か国',        desc:'20か国訪問',    cat:'世界', check: c => c.wld >= 20  },
  { id:'wld_30',  icon:'🌏',  name:'30か国',        desc:'30か国訪問',    cat:'世界', check: c => c.wld >= 30  },
  { id:'wld_50',  icon:'🌏',  name:'50か国！',      desc:'50か国訪問',    cat:'世界', check: c => c.wld >= 50  },
  { id:'wld_75',  icon:'🗺️',  name:'75か国',        desc:'75か国訪問',    cat:'世界', check: c => c.wld >= 75  },
  { id:'wld_100', icon:'🌐',  name:'100か国！',     desc:'100か国訪問',   cat:'世界', check: c => c.wld >= 100 },
  { id:'wld_150', icon:'🛫',  name:'150か国',       desc:'150か国訪問',   cat:'世界', check: c => c.wld >= 150 },
  { id:'wld_all', icon:'🌍',  name:'世界制覇！',    desc:'193か国を制覇', cat:'世界', check: c => c.wld >= 193 },
  // ---- 世界遺産 (10個) ----
  { id:'her_1',   icon:'⭐',  name:'世界遺産デビュー',  desc:'世界遺産1か所訪問', cat:'世界遺産', check: c => c.her >= 1   },
  { id:'her_5',   icon:'🌟',  name:'世界遺産5か所',     desc:'5か所達成',         cat:'世界遺産', check: c => c.her >= 5   },
  { id:'her_10',  icon:'💫',  name:'世界遺産10か所',    desc:'10か所達成',        cat:'世界遺産', check: c => c.her >= 10  },
  { id:'her_20',  icon:'✨',  name:'世界遺産20か所',    desc:'20か所達成',        cat:'世界遺産', check: c => c.her >= 20  },
  { id:'her_30',  icon:'🌠',  name:'世界遺産30か所',    desc:'30か所達成',        cat:'世界遺産', check: c => c.her >= 30  },
  { id:'her_50',  icon:'🎇',  name:'世界遺産50か所！',  desc:'50か所達成',        cat:'世界遺産', check: c => c.her >= 50  },
  { id:'her_75',  icon:'🏛️',  name:'世界遺産75か所',    desc:'75か所達成',        cat:'世界遺産', check: c => c.her >= 75  },
  { id:'her_100', icon:'🌅',  name:'世界遺産100か所！', desc:'100か所達成',       cat:'世界遺産', check: c => c.her >= 100 },
  { id:'her_150', icon:'💎',  name:'世界遺産150か所',   desc:'150か所達成',       cat:'世界遺産', check: c => c.her >= 150 },
  { id:'her_200', icon:'👑',  name:'世界遺産200か所！', desc:'200か所達成',       cat:'世界遺産', check: c => c.her >= 200 },
  // ---- グルメ (15個) ----
  { id:'grm_1',   icon:'🍱', name:'グルメデビュー',   desc:'グルメ1か所訪問', cat:'グルメ', check: c => c.grm >= 1   },
  { id:'grm_3',   icon:'🍣', name:'グルメ3か所',      desc:'3か所達成',       cat:'グルメ', check: c => c.grm >= 3   },
  { id:'grm_5',   icon:'🍛', name:'グルメ5か所',      desc:'5か所達成',       cat:'グルメ', check: c => c.grm >= 5   },
  { id:'grm_10',  icon:'🍝', name:'グルメ10か所',     desc:'10か所達成',      cat:'グルメ', check: c => c.grm >= 10  },
  { id:'grm_15',  icon:'🥘', name:'グルメ15か所',     desc:'15か所達成',      cat:'グルメ', check: c => c.grm >= 15  },
  { id:'grm_20',  icon:'🍲', name:'グルメ20か所',     desc:'20か所達成',      cat:'グルメ', check: c => c.grm >= 20  },
  { id:'grm_25',  icon:'🥗', name:'グルメ25か所',     desc:'25か所達成',      cat:'グルメ', check: c => c.grm >= 25  },
  { id:'grm_30',  icon:'🍤', name:'グルメ30か所',     desc:'30か所達成',      cat:'グルメ', check: c => c.grm >= 30  },
  { id:'grm_40',  icon:'🍗', name:'グルメ40か所',     desc:'40か所達成',      cat:'グルメ', check: c => c.grm >= 40  },
  { id:'grm_50',  icon:'🍖', name:'グルメ50か所！',   desc:'50か所達成',      cat:'グルメ', check: c => c.grm >= 50  },
  { id:'grm_75',  icon:'🧁', name:'グルメ75か所',     desc:'75か所達成',      cat:'グルメ', check: c => c.grm >= 75  },
  { id:'grm_100', icon:'🍰', name:'グルメ100か所！',  desc:'100か所達成',     cat:'グルメ', check: c => c.grm >= 100 },
  { id:'grm_150', icon:'🎂', name:'グルメ150か所',    desc:'150か所達成',     cat:'グルメ', check: c => c.grm >= 150 },
  { id:'grm_200', icon:'🍽️', name:'グルメ200か所！',  desc:'200か所達成',     cat:'グルメ', check: c => c.grm >= 200 },
  { id:'grm_300', icon:'👨‍🍳', name:'グルメ300か所！',  desc:'300か所達成',     cat:'グルメ', check: c => c.grm >= 300 },
  // ---- ラーメン (14個) ----
  { id:'ram_1',   icon:'🍜', name:'ラーメンデビュー', desc:'ラーメン1杯',   cat:'ラーメン', check: c => c.ram >= 1   },
  { id:'ram_3',   icon:'🥢', name:'ラーメン3杯',      desc:'3杯達成',       cat:'ラーメン', check: c => c.ram >= 3   },
  { id:'ram_5',   icon:'🍥', name:'ラーメン5杯',      desc:'5杯達成',       cat:'ラーメン', check: c => c.ram >= 5   },
  { id:'ram_10',  icon:'🌶️', name:'ラーメン10杯',     desc:'10杯達成',      cat:'ラーメン', check: c => c.ram >= 10  },
  { id:'ram_15',  icon:'🧄', name:'ラーメン15杯',     desc:'15杯達成',      cat:'ラーメン', check: c => c.ram >= 15  },
  { id:'ram_20',  icon:'🥩', name:'ラーメン20杯',     desc:'20杯達成',      cat:'ラーメン', check: c => c.ram >= 20  },
  { id:'ram_25',  icon:'🐓', name:'ラーメン25杯',     desc:'25杯達成',      cat:'ラーメン', check: c => c.ram >= 25  },
  { id:'ram_30',  icon:'🥚', name:'ラーメン30杯',     desc:'30杯達成',      cat:'ラーメン', check: c => c.ram >= 30  },
  { id:'ram_40',  icon:'🫕', name:'ラーメン40杯',     desc:'40杯達成',      cat:'ラーメン', check: c => c.ram >= 40  },
  { id:'ram_50',  icon:'🍲', name:'ラーメン50杯！',   desc:'50杯達成',      cat:'ラーメン', check: c => c.ram >= 50  },
  { id:'ram_75',  icon:'🏆', name:'ラーメン75杯',     desc:'75杯達成',      cat:'ラーメン', check: c => c.ram >= 75  },
  { id:'ram_100', icon:'👑', name:'ラーメン100杯！',  desc:'100杯達成',     cat:'ラーメン', check: c => c.ram >= 100 },
  { id:'ram_150', icon:'💎', name:'ラーメン150杯',    desc:'150杯達成',     cat:'ラーメン', check: c => c.ram >= 150 },
  { id:'ram_200', icon:'🏅', name:'ラーメン200杯！',  desc:'200杯達成',     cat:'ラーメン', check: c => c.ram >= 200 },
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
  const bItems = Object.values(bucket).filter(v => v != null); // 削除済みキーのnull穴を除去
  const bTotal = bItems.length;
  const bDone  = bItems.filter(i => i.done).length;

  html += `<div class="stats-sub-sec">Bucket List　カテゴリ別</div>
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
  html += `<div class="stats-sub-sec" style="margin-top:20px">訪問スコア</div>
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
    { scope:'world',    icon:'🌍', label:'世界各国',
      total: typeof WORLD_REGIONS !== 'undefined'
        ? WORLD_REGIONS.reduce((s, r) => s + r.countries.length, 0) : 160,
      color:'#4a90d9' },
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
    html += `<div class="stats-sub-sec" style="margin-top:20px">年別訪問数</div>`;
    html += _yearChart(yearMap, years);
  }

  html += `</div>`;

  // ---- 金言セクション ----
  html += `<div class="stats-section kingen-section">
    <div class="stats-sec-title">📜 人が死ぬ前に後悔する10のこと</div>
    <ol class="kingen-list">
      <li>
        <span class="kingen-main">本当にやりたいことをやらなかったこと</span>
        <span class="kingen-sub">自分の人生を生きなかった、他人の期待に応じすぎた<br>自分を幸せにすることをしなかった、勇気を持たなかった</span>
      </li>
      <li><span class="kingen-main">健康を大切にしなかったこと</span></li>
      <li>
        <span class="kingen-main">仕事ばかりしていたこと</span>
        <span class="kingen-sub">家族との時間を大切にしなかった など</span>
      </li>
      <li>
        <span class="kingen-main">会いたい人に会いに行かなかったこと</span>
        <span class="kingen-sub">友人関係を大切にしなかった</span>
      </li>
      <li><span class="kingen-main">学ぶべきことを学ばなかったこと</span></li>
      <li>
        <span class="kingen-main">人を許さなかったこと</span>
        <span class="kingen-sub">人を助けなかった など</span>
      </li>
      <li><span class="kingen-main">人の意見に耳を貸さなかったこと</span></li>
      <li>
        <span class="kingen-main">人に感謝の言葉を伝えられなかったこと</span>
        <span class="kingen-sub">感情を表現しなかった</span>
      </li>
      <li><span class="kingen-main">死の準備をしておかなかったこと</span></li>
      <li><span class="kingen-main">生きた証を残さなかったこと</span></li>
    </ol>
    <div class="kingen-quote">
      葬式の弔辞の際に人から言われたいことが、<br>この人生で自分が一番大切なこと
      <span class="kingen-source">――『7つの習慣』</span>
    </div>
  </div>`;

  container.innerHTML = html;
}

// ---- プログレスバー1行 ----
function _progBar(label, done, total, color) {
  const pct = (total && total > 0) ? Math.round(done / total * 100) : 0;
  const valContent = (total !== null)
    ? `<em>${pct}%</em><span style="margin-left:20px">${done}/${total}</span>`
    : `${done}か所`;
  return `<div class="prog-row">
    <div class="prog-label">${label}</div>
    <div class="prog-bar-wrap">
      <div class="prog-bar-fill" style="width:${pct}%;background:${color}"></div>
    </div>
    <div class="prog-val">${valContent}</div>
  </div>`;
}

// ---- 年別棒グラフ（横型・新しい年が上） ----
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

  // 新しい年を上に
  const sorted = [...years].sort((a, b) => b - a);

  const maxTotal = Math.max(1, ...sorted.map(yr =>
    SCOPES.reduce((s, sc) => s + (yearMap[yr][sc] || 0), 0)
  ));

  const SVG_W  = 370;
  const YEAR_W = 50;   // 年ラベル幅（左詰め）
  const CNT_W  = 44;   // 合計カウント幅（右詰め）
  const GAP    = 8;
  const BAR_W  = SVG_W - YEAR_W - CNT_W - GAP * 2;  // バー幅
  const ROW_H  = 34;
  const ROW_G  = 4;
  const svgH   = sorted.length * (ROW_H + ROW_G);

  // 凡例（使用スコープのみ）— SVGの前に出力
  const usedScopes = SCOPES.filter(sc => sorted.some(yr => (yearMap[yr][sc] || 0) > 0));
  let legend = `<div class="ychart-legend">`;
  usedScopes.forEach(sc => {
    legend += `<span class="ychart-legend-item"><span class="ychart-dot" style="background:${COLORS[sc]}"></span>${LABELS[sc]}</span>`;
  });
  legend += `</div>`;

  let out = `<div class="ychart-outer">${legend}<svg width="${SVG_W}" height="${svgH}" style="display:block;margin-top:10px">`;

  sorted.forEach((yr, i) => {
    const y    = i * (ROW_H + ROW_G);
    const midY = y + ROW_H / 2 + 5;
    const total = SCOPES.reduce((s, sc) => s + (yearMap[yr][sc] || 0), 0);

    // 年ラベル（左詰め・黒）
    out += `<text x="0" y="${midY}" text-anchor="start"
      font-size="24" font-weight="700" fill="#000"
      font-family="Cormorant Garamond, serif">${yr}</text>`;

    // 横積みバー＋バー内数値（黒文字）
    let barX = YEAR_W + GAP;
    SCOPES.forEach(sc => {
      const n = yearMap[yr][sc] || 0;
      if (!n) return;
      const w = Math.max(4, Math.round((n / maxTotal) * BAR_W));
      out += `<rect x="${barX}" y="${y + 2}" width="${w}" height="${ROW_H - 4}"
        fill="${COLORS[sc]}" rx="2">
        <title>${yr}年 ${LABELS[sc]}: ${n}か所</title>
      </rect>`;
      // バー内に数値（幅が16px以上なら表示）
      if (w >= 16) {
        out += `<text x="${barX + w / 2}" y="${midY}" text-anchor="middle"
          font-size="20" font-weight="700" fill="#000"
          font-family="Cormorant Garamond, serif">${n}</text>`;
      }
      barX += w;
    });

    // 合計数（右詰め・黒）
    if (total > 0) {
      out += `<text x="${SVG_W}" y="${midY}" text-anchor="end"
        font-size="24" font-weight="700" fill="#000"
        font-family="Cormorant Garamond, serif">${total}</text>`;
    }
  });

  out += `</svg></div>`;

  return out;
}

window.renderStats = renderStats;
