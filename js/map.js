// ==========================================
// map.js v4 — 訪問地管理 + 世界遺産リスト
// 構成: ボタン → SVG地図 → 渡航履歴 → 世界遺産
// ==========================================

// ISO code → 日本語国名
const ISO_JA = {
  ad:"アンドラ",ae:"UAE",af:"アフガニスタン",ag:"アンティグア・バーブーダ",al:"アルバニア",am:"アルメニア",
  ao:"アンゴラ",ar:"アルゼンチン",at:"オーストリア",au:"オーストラリア",
  az:"アゼルバイジャン",ba:"ボスニア・ヘルツェゴビナ",bb:"バルバドス",bd:"バングラデシュ",be:"ベルギー",
  bf:"ブルキナファソ",bg:"ブルガリア",bh:"バーレーン",bj:"ベナン",
  bo:"ボリビア",br:"ブラジル",bt:"ブータン",bw:"ボツワナ",by:"ベラルーシ",bz:"ベリーズ",
  ca:"カナダ",cd:"コンゴ民主共和国",cf:"中央アフリカ",cg:"コンゴ共和国",
  ch:"スイス",ci:"コートジボワール",cl:"チリ",cm:"カメルーン",cn:"中国",
  co:"コロンビア",cr:"コスタリカ",cu:"キューバ",cv:"カーボベルデ",
  cy:"キプロス",cz:"チェコ",de:"ドイツ",dj:"ジブチ",dk:"デンマーク",dm:"ドミニカ国",
  do:"ドミニカ共和国",dz:"アルジェリア",ec:"エクアドル",ee:"エストニア",eg:"エジプト",
  er:"エリトリア",es:"スペイン",et:"エチオピア",fi:"フィンランド",
  fj:"フィジー",fm:"ミクロネシア連邦",fr:"フランス",ga:"ガボン",gb:"イギリス",ge:"ジョージア",
  gh:"ガーナ",gm:"ガンビア",gn:"ギニア",gq:"赤道ギニア",gr:"ギリシャ",
  gt:"グアテマラ",gw:"ギニアビサウ",hn:"ホンジュラス",hr:"クロアチア",ht:"ハイチ",
  hu:"ハンガリー",id:"インドネシア",ie:"アイルランド",il:"イスラエル",
  in:"インド",iq:"イラク",ir:"イラン",is:"アイスランド",it:"イタリア",
  jm:"ジャマイカ",jo:"ヨルダン",jp:"日本",ke:"ケニア",kg:"キルギス",kh:"カンボジア",
  ki:"キリバス",kn:"セントクリストファー・ネービス",kp:"北朝鮮",kr:"韓国",kw:"クウェート",kz:"カザフスタン",la:"ラオス",
  lb:"レバノン",lc:"セントルシア",li:"リヒテンシュタイン",lk:"スリランカ",lr:"リベリア",ls:"レソト",
  lt:"リトアニア",lu:"ルクセンブルク",lv:"ラトビア",ly:"リビア",
  ma:"モロッコ",mc:"モナコ",md:"モルドバ",me:"モンテネグロ",
  mg:"マダガスカル",mh:"マーシャル諸島",mk:"北マケドニア",ml:"マリ",mm:"ミャンマー",mn:"モンゴル",
  mo:"マカオ",mr:"モーリタニア",mt:"マルタ",mu:"モーリシャス",
  mv:"モルディブ",mw:"マラウィ",mx:"メキシコ",my:"マレーシア",
  mz:"モザンビーク",na:"ナミビア",ne:"ニジェール",ng:"ナイジェリア",
  ni:"ニカラグア",nl:"オランダ",no:"ノルウェー",np:"ネパール",
  nz:"ニュージーランド",om:"オマーン",pa:"パナマ",pe:"ペルー",ps:"パレスチナ",pw:"パラオ",
  pg:"パプアニューギニア",ph:"フィリピン",pk:"パキスタン",pl:"ポーランド",
  pt:"ポルトガル",py:"パラグアイ",qa:"カタール",ro:"ルーマニア",
  rs:"セルビア",ru:"ロシア",rw:"ルワンダ",sa:"サウジアラビア",sb:"ソロモン諸島",
  sc:"セーシェル",sd:"スーダン",se:"スウェーデン",sg:"シンガポール",
  si:"スロベニア",sk:"スロバキア",sl:"シエラレオネ",sm:"サンマリノ",
  sn:"セネガル",sr:"スリナム",ss:"南スーダン",sv:"エルサルバドル",
  sy:"シリア",sz:"エスワティニ",td:"チャド",tg:"トーゴ",th:"タイ",
  tj:"タジキスタン",tm:"トルクメニスタン",tn:"チュニジア",tr:"トルコ",
  tz:"タンザニア",ua:"ウクライナ",ug:"ウガンダ",us:"アメリカ",
  uy:"ウルグアイ",uz:"ウズベキスタン",va:"バチカン",ve:"ベネズエラ",
  vn:"ベトナム",vu:"バヌアツ",ws:"サモア",ye:"イエメン",
  za:"南アフリカ",zm:"ザンビア",zw:"ジンバブエ"
};

// 世界遺産リスト フィルター状態
const heritageState = {
  japan: { cat: '', search: '' },
  china: { cat: '', search: '' },
  world: { cat: '', search: '', iso: '', region: '', expanded: new Set() }
};

// ISO → 国旗絵文字
function isoFlag(iso) {
  if (!iso || iso.length !== 2) return '🌐';
  return iso.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('');
}

// UNESCO地域グループ
const UNESCO_REGIONS = [
  { key:'asia',     label:'アジア・太平洋', icon:'🌏',
    isos: new Set(['jp','cn','kr','in','au','nz','id','ph','vn','th','my','sg','kh','la','mn','np','pk','bt','lk','bd','af','kz','kg','tj','tm','uz','fj','pg','vu','ws','mv','ge','am','az','mo']) },
  { key:'mena',     label:'中東・アフリカ', icon:'🌍',
    isos: new Set(['eg','ma','tn','dz','ly','sa','jo','iq','sy','lb','ye','om','qa','kw','bh','ae','mr','ir','et','ke','tz','za','gh','cm','sn','ml','ng','ci','bj','bf','er','dj','cd','cg','cf','ga','mg','mw','mz','na','zm','zw','rw','gm','gn','gq','lr','sl','td','ne','tg','ao','mu','sc','cv','ss','sz','ug','ls','sd']) },
  { key:'americas', label:'南北アメリカ',   icon:'🌎',
    isos: new Set(['us','ca','mx','pe','br','ar','co','cu','bo','ec','cl','cr','gt','hn','ni','pa','sv','uy','ve','py','sr','bz','ht','do']) },
  { key:'europe',   label:'欧州',           icon:'🏰',
    isos: new Set(['fr','it','de','gb','es','pt','gr','ru','pl','cz','be','se','ch','nl','no','dk','fi','at','hu','ro','bg','hr','si','sk','lt','lv','lu','ee','ie','is','mc','sm','li','ad','mt','cy','al','ba','me','mk','rs','ua','by','md','tr']) }
];

// 世界遺産ボタン用短縮名
function heritageShortName(s) {
  const name = (s.name_ja && s.name_ja !== s.name) ? s.name_ja : (s.name || '');
  if (!name) return '?';
  let n = name;
  n = n.replace(/（[^）]*）/g, '').replace(/「[^」]*」/g, '');
  n = n.split('－')[0].split('、')[0].trim();
  if (n.length > 6) {
    const noIdx  = n.indexOf('の') > 0 ? n.indexOf('の') : 999;
    const toIdx  = n.indexOf('と') > 0 ? n.indexOf('と') : 999;
    const dotIdx = n.indexOf('・');
    const dotSafe = dotIdx >= 3 ? dotIdx : 999;
    const cut = Math.min(noIdx, toIdx, dotSafe);
    n = cut < 999 ? n.slice(0, cut) : n.slice(0, 8);
  }
  return n || name.slice(0, 8);
}

const JAPAN_REGIONS = [
  { label: "北海道・東北", prefs: ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県"] },
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
  { label: "特別行政区", areas: ["香港特別行政区","マカオ特別行政区","台湾"] }
];

const WORLD_REGIONS = [
  { label: "東アジア", countries: ["日本","韓国","中国","台湾","北朝鮮","モンゴル","香港","マカオ"] },
  { label: "東南アジア", countries: ["タイ","ベトナム","インドネシア","フィリピン","マレーシア","シンガポール","ミャンマー","カンボジア","ラオス","ブルネイ","東ティモール"] },
  { label: "南アジア", countries: ["インド","パキスタン","バングラデシュ","スリランカ","ネパール","ブータン","モルディブ","アフガニスタン"] },
  { label: "中央アジア", countries: ["カザフスタン","ウズベキスタン","トルクメニスタン","タジキスタン","キルギス"] },
  { label: "西アジア・中東", countries: ["トルコ","イラン","イラク","サウジアラビア","アラブ首長国連邦","イスラエル","ヨルダン","レバノン","シリア","クウェート","カタール","バーレーン","オマーン","イエメン","ジョージア","アルメニア","アゼルバイジャン","キプロス"] },
  { label: "西ヨーロッパ", countries: ["フランス","ドイツ","イギリス","イタリア","スペイン","ポルトガル","オランダ","ベルギー","スイス","オーストリア","ルクセンブルク","アイルランド","モナコ","アンドラ","リヒテンシュタイン","マルタ"] },
  { label: "北ヨーロッパ", countries: ["スウェーデン","ノルウェー","デンマーク","フィンランド","アイスランド","エストニア","ラトビア","リトアニア"] },
  { label: "東ヨーロッパ", countries: ["ロシア","ポーランド","チェコ","スロバキア","ハンガリー","ルーマニア","ブルガリア","ウクライナ","ベラルーシ","モルドバ","クロアチア","スロベニア","ボスニア・ヘルツェゴビナ","セルビア","モンテネグロ","アルバニア","コソボ","ギリシャ"] },
  { label: "北アメリカ", countries: ["アメリカ","カナダ","メキシコ","キューバ","ジャマイカ","ハイチ","ドミニカ共和国","プエルトリコ","グアム"] },
  { label: "中米・カリブ", countries: ["グアテマラ","ベリーズ","ホンジュラス","エルサルバドル","ニカラグア","コスタリカ","パナマ"] },
  { label: "南アメリカ", countries: ["ブラジル","アルゼンチン","チリ","コロンビア","ペルー","ベネズエラ","エクアドル","ボリビア","パラグアイ","ウルグアイ","ガイアナ","スリナム"] },
  { label: "北アフリカ", countries: ["エジプト","モロッコ","チュニジア","アルジェリア","リビア","スーダン"] },
  { label: "サブサハラ・アフリカ", countries: ["南アフリカ","ナイジェリア","ケニア","エチオピア","タンザニア","ガーナ","セネガル","コートジボワール","カメルーン","ウガンダ","ルワンダ","ジンバブエ","モザンビーク","マダガスカル","ナミビア","ボツワナ","ザンビア","マラウイ","アンゴラ","コンゴ共和国","コンゴ民主共和国"] },
  { label: "オセアニア", countries: ["オーストラリア","ニュージーランド","フィジー","パプアニューギニア","ソロモン諸島","バヌアツ","サモア","トンガ","パラオ","ミクロネシア","マーシャル諸島","ニューカレドニア","フランス領ポリネシア"] }
];

// --- 年グラデーション（1975=薄青 〜 現在=濃青）---
function yearToColor(year) {
  // 最濃（最近）= #e8c06a（ヘッダー達成色）、最薄（1975）= #f5e9c8
  if (!year || year === true) return "#eed499"; // 年不明→中間色
  const t = Math.max(0, Math.min(1, (year - 1975) / (new Date().getFullYear() - 1975)));
  const r = Math.round(245 - t * 13);
  const g = Math.round(233 - t * 41);
  const b = Math.round(200 - t * 94);
  return `rgb(${r},${g},${b})`;
}
function prefShort(name) { return name.replace(/[都府県]$/, ""); }

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

  let html = "";

  groups.forEach(group => {
    const items = group.prefs || group.areas || group.countries || [];
    const gVisited = items.filter(n => {
      const key = type === "japan" ? prefShort(n) : n;
      return !!visitData[key];
    }).length;
    const gTotal = items.length;
    const gPct = gTotal ? Math.round(gVisited / gTotal * 100) : 0;
    html += `<div class="visit-group">
      <div class="visit-group-label">
        <span class="group-label-text">${group.label}</span>
        <span class="group-label-stat">${gVisited}/${gTotal} <em>${gPct}%</em></span>
      </div>
      <div class="visit-btn-grid">`;
    items.forEach(name => {
      const key = type === "japan" ? prefShort(name) : name;
      const val = visitData[key];
      const year = (val === true) ? null : (val || null);
      const visited = !!val;
      const color = visited ? yearToColor(year) : "";
      const disp = type === "japan" ? name.replace(/[都府県]$/, "") : name;
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
// ② 世界遺産データ & 星描画ヘルパー
// ==========================================
let _heritageData = null;
async function loadHeritage() {
  if (_heritageData) return _heritageData;
  try {
    const r = await fetch('./heritage.json?v=20260419b');
    _heritageData = await r.json();
  } catch(e) {
    _heritageData = window.HERITAGE_JP_CN || [];
  }
  return _heritageData;
}

function starPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36 - 90) * Math.PI / 180;
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(angle)).toFixed(2)},${(cy + rad * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function heritageStarsSVG(sites, projection, hv, r) {
  let out = '';
  for (const s of sites) {
    if (s.lat == null || s.lon == null) continue;
    const pt = projection([s.lon, s.lat]);
    if (!pt || isNaN(pt[0])) continue;
    const [x, y] = pt;
    const visited = hv && hv[String(s.id)];
    const fill   = visited ? '#FFD700' : 'rgba(255,220,0,0.15)';
    const stroke = visited ? '#b8860b' : '#cc9900';
    const sw     = visited ? 1.5 : 1.2;
    out += `<polygon points="${starPoints(x, y, r)}"
      fill="${fill}" stroke="${stroke}" stroke-width="${sw}"
      class="heritage-star" data-id="${s.id}" data-name-ja="${s.name_ja}"
      data-year="${s.year}" data-cat="${s.cat_ja}" style="cursor:pointer">
      <title>★ ${s.name_ja}（${s.year}年・${s.cat_ja}）</title>
    </polygon>`;
  }
  return out;
}

function attachHeritageClicks(container, tabType) {
  container.querySelectorAll('.heritage-star').forEach(el => {
    el.addEventListener('click', async e => {
      e.stopPropagation();
      const id  = el.dataset.id;
      const name = el.dataset.nameJa;
      const hv   = window.appState?.visit?.heritage || {};
      const val  = hv[id];
      if (val) {
        if (!confirm(`「${name}」の訪問記録を削除しますか？`)) return;
        await saveVisit('heritage', id, null);
      } else {
        const curYear = new Date().getFullYear();
        await openYearDialog('heritage', name, curYear);
      }
      refreshTab(tabType);
    });
  });
}

// ==========================================
// ② SVG地図描画共通ズームヘルパー
// ==========================================
function attachMapZoom(container, maxScale) {
  const svgEl = container.querySelector('svg');
  const gEl   = container.querySelector('svg > g');
  if (!svgEl || !gEl) return;
  const zoom = d3.zoom()
    .scaleExtent([1, maxScale])
    .on('zoom', e => { gEl.setAttribute('transform', e.transform); });
  d3.select(svgEl).call(zoom);
  svgEl.addEventListener('dblclick', () => {
    d3.select(svgEl).transition().duration(300).call(zoom.transform, d3.zoomIdentity);
  });
}

// ==========================================
// ② SVG地図描画（Japanのみ）
// ==========================================
let _japanTopo = null;
async function renderJapanMap(visitData, containerId = "japan-svg-container", readOnly = false) {
  const container = document.getElementById(containerId);
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

  const objKey = Object.keys(_japanTopo.objects)[0];
  const features = topojson.feature(_japanTopo, _japanTopo.objects[objKey]).features;
  const W = container.clientWidth || 370;
  const H = Math.round(W * 1.4);

  // 沖縄を分離してメイン本州・四国・九州・北海道を拡大
  const isOk = f => (f.properties.nam_ja || f.properties.name || '').includes('沖縄');
  const mainFeats = features.filter(f => !isOk(f));
  const okFeats   = features.filter(f =>  isOk(f));

  // メイン投影（沖縄除外で拡大）
  const mainFC = { type: "FeatureCollection", features: mainFeats };
  const projection = d3.geoMercator().fitExtent([[10, 10], [W-10, H-10]], mainFC);
  const pathGen = d3.geoPath().projection(projection);

  // 沖縄インセット（左上）
  const inW = Math.round(W * 0.27);
  const inH = Math.round(inW * 0.95);
  const inX = 8, inY = Math.round(H * 0.18);
  const okFC = { type: "FeatureCollection", features: okFeats };
  const okProj = d3.geoMercator().fitExtent([[inX+5, inY+5], [inX+inW-5, inY+inH-5]], okFC);
  const okPG = d3.geoPath().projection(okProj);

  const featPath = (feat, pg) => {
    const props = feat.properties;
    const full = props.nam_ja || props.name_ja || props.NAME || props.name || props.N03_001 || '';
    const key = prefShort(full);
    const val = visitData[key];
    const year = (val === true) ? null : (val || null);
    const visited = !!val;
    const fill = visited ? yearToColor(year) : "#e8e4dc";
    const d = pg(feat);
    if (!d) return '';
    return `<path d="${d}" fill="${fill}" stroke="#555" stroke-width="0.8" class="svg-pref"
      data-name="${key}" style="cursor:${readOnly ? 'default' : 'pointer'}">
      <title>${full}${year ? " "+year+"年" : visited ? " 訪問済" : " 未訪問"}</title>
    </path>`;
  };

  const heritage = await loadHeritage();
  const hv = window.appState?.visit?.heritage || {};
  const jpSites = heritage.filter(s => {
    const iso = Array.isArray(s.iso) ? s.iso : [s.iso];
    return iso.includes('jp') && s.lat != null;
  });

  // 沖縄エリアの遺産のみ（lat<28.5, lon<132）
  const okSites = jpSites.filter(s => s.lat < 28.5 && s.lon < 132);

  const clipId = containerId.replace(/[^a-z0-9]/gi, '-') + '-ok';
  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="touch-action:none" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs><clipPath id="${clipId}"><rect x="${inX}" y="${inY}" width="${inW}" height="${inH}"/></clipPath></defs>`;
  svg += `<g>`; // ズーム対象：本州・北海道・四国・九州 + 星
  mainFeats.forEach(f => { svg += featPath(f, pathGen); });
  if (readOnly) svg += heritageStarsSVG(jpSites, projection, hv, 7);
  svg += `</g>`;
  // 沖縄インセット（ズーム対象外・固定）
  svg += `<rect x="${inX}" y="${inY}" width="${inW}" height="${inH}"
    fill="#f5f0e8" stroke="#999" stroke-width="1" rx="3"/>`;
  svg += `<g clip-path="url(#${clipId})">`; // 沖縄グループ（固定・クリップあり）
  okFeats.forEach(f => { svg += featPath(f, okPG); });
  if (readOnly) svg += heritageStarsSVG(okSites, okProj, hv, 4);
  svg += `</g>`;
  svg += `</svg>`;
  container.innerHTML = svg;

  if (!readOnly) {
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
  attachHeritageClicks(container, 'japan');
  attachMapZoom(container, 15);
}

// ==========================================
// China 地図
// ==========================================
let _chinaTopo = null;
async function renderChinaMap(visitData, containerId = "china-svg-container", readOnly = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!_chinaTopo) {
    try {
      const r = await fetch("./china.json");
      _chinaTopo = await r.json();
    } catch(e) {
      container.innerHTML = '<div class="map-load-msg">地図データ読み込み失敗</div>';
      return;
    }
  }
  const objKey = Object.keys(_chinaTopo.objects)[0];
  const features = topojson.feature(_chinaTopo, _chinaTopo.objects[objKey]).features;
  const W = container.clientWidth || 370;
  const H = Math.round(W * 0.9);
  const projection = d3.geoMercator().fitExtent([[10, 10], [W-10, H-10]], { type:"FeatureCollection", features });
  const pathGen = d3.geoPath().projection(projection);
  const heritage = await loadHeritage();
  const hv = window.appState?.visit?.heritage || {};
  const cnSites = heritage.filter(s => {
    const iso = Array.isArray(s.iso) ? s.iso : [s.iso];
    return iso.includes('cn') && s.lat != null;
  });

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="touch-action:none" xmlns="http://www.w3.org/2000/svg"><g>`;
  features.forEach(feat => {
    const props = feat.properties;
    const key = props.nam_ja || props.name || '';
    const val = visitData[key];
    const year = (val === true) ? null : (val || null);
    const visited = !!val;
    const fill = visited ? yearToColor(year) : "#e8e4dc";
    const d = pathGen(feat);
    if (!d) return;
    svg += `<path d="${d}" fill="${fill}" stroke="#555" stroke-width="0.8" class="svg-pref"
      data-name="${key}" style="cursor:${readOnly ? 'default' : 'pointer'}">
      <title>${key}${year ? " "+year+"年" : visited ? " 訪問済" : " 未訪問"}</title>
    </path>`;
  });
  if (readOnly) svg += heritageStarsSVG(cnSites, projection, hv, 6);
  svg += `</g></svg>`;
  container.innerHTML = svg;
  if (!readOnly) {
    container.querySelectorAll(".svg-pref").forEach(path => {
      path.addEventListener("click", () => {
        const name = path.dataset.name;
        if (!name) return;
        const val = (window.appState?.visit?.china || {})[name];
        const curYear = (val && val !== true) ? val : new Date().getFullYear();
        openYearDialog("china", name, curYear).then(() => refreshTab("china"));
      });
      path.addEventListener("mouseenter", () => path.style.opacity = "0.7");
      path.addEventListener("mouseleave", () => path.style.opacity = "1");
    });
  }
  attachHeritageClicks(container, 'china');
  attachMapZoom(container, 10);
}

// ==========================================
// World 地図
// ==========================================
let _worldTopo = null;
async function renderWorldMap(visitData, containerId = "world-svg-container", readOnly = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!_worldTopo) {
    try {
      const r = await fetch("./world.json");
      _worldTopo = await r.json();
    } catch(e) {
      container.innerHTML = '<div class="map-load-msg">地図データ読み込み失敗</div>';
      return;
    }
  }
  const features = topojson.feature(_worldTopo, _worldTopo.objects.countries).features;
  const W = container.clientWidth || 370;
  const H = Math.round(W * 0.80);
  // 南極除外でズーム
  const noAntarctica = {
    type: "FeatureCollection",
    features: features.filter(f => {
      const n = f.properties.nam_ja || f.properties.name || '';
      return n !== '南極' && n !== 'Antarctica';
    })
  };
  const projection = d3.geoMercator()
    .rotate([-150, 0])
    .fitExtent([[10, 10], [W-10, H-10]], noAntarctica);
  const pathGen = d3.geoPath().projection(projection);
  const heritage = await loadHeritage();
  const hv = window.appState?.visit?.heritage || {};
  const allSites = heritage.filter(s => s.lat != null);

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="touch-action:none" xmlns="http://www.w3.org/2000/svg"><g>`;
  features.forEach(feat => {
    const key = feat.properties.nam_ja || feat.properties.name || '';
    const val = visitData[key];
    const year = (val === true) ? null : (val || null);
    const visited = !!val;
    const fill = visited ? yearToColor(year) : "#e8e4dc";
    const d = pathGen(feat);
    if (!d) return;
    svg += `<path d="${d}" fill="${fill}" stroke="#555" stroke-width="0.5" class="svg-pref"
      data-name="${key}" style="cursor:${readOnly ? 'default' : 'pointer'}">
      <title>${key}${year ? " "+year+"年" : visited ? " 訪問済" : " 未訪問"}</title>
    </path>`;
  });
  if (readOnly) svg += heritageStarsSVG(allSites, pathGen.projection(), hv, 4);
  svg += `</g></svg>`;
  container.innerHTML = svg;
  if (!readOnly) {
    container.querySelectorAll(".svg-pref").forEach(path => {
      path.addEventListener("click", () => {
        const name = path.dataset.name;
        if (!name) return;
        const val = (window.appState?.visit?.world || {})[name];
        const curYear = (val && val !== true) ? val : new Date().getFullYear();
        openYearDialog("world", name, curYear).then(() => refreshTab("world"));
      });
      path.addEventListener("mouseenter", () => path.style.opacity = "0.7");
      path.addEventListener("mouseleave", () => path.style.opacity = "1");
    });
  }
  attachHeritageClicks(container, 'world');
  attachMapZoom(container, 8);
}

// ==========================================
// ③ 渡航履歴リスト（年ごと・新しい順）
// ==========================================
function renderHistory(container, visitData, type) {
  if (!visitData || typeof visitData !== 'object') {
    container.innerHTML = '<div class="history-empty">まだ訪問履歴がありません</div>';
    return;
  }
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
async function openYearDialog(type, name, defaultYear, saveKey) {
  return new Promise(resolve => {
    const overlay  = document.getElementById("year-dialog-overlay");
    const titleEl  = document.getElementById("year-dialog-title");
    const scroller = document.getElementById("year-picker-scroll");
    const btnSave  = document.getElementById("year-dialog-save");
    const btnCancel= document.getElementById("year-dialog-cancel");

    const curY = new Date().getFullYear();
    const startY = 1975;
    const targetY = defaultYear || curY;

    // アイテム生成
    scroller.innerHTML = "";
    for (let y = curY; y >= startY; y--) {
      const div = document.createElement("div");
      div.className = "year-picker-item";
      div.textContent = y;
      div.dataset.year = y;
      scroller.appendChild(div);
    }

    titleEl.textContent = name;
    overlay.classList.remove("hidden");

    // 選択年にスクロール（アイテム高さ44px）
    const itemH = 44;
    const idx = curY - targetY;
    setTimeout(() => {
      scroller.scrollTop = idx * itemH;
      updateSelected();
    }, 30);

    function updateSelected() {
      const idx = Math.round(scroller.scrollTop / 44);
      scroller.querySelectorAll(".year-picker-item").forEach((el, i) => {
        el.classList.toggle("selected", i === idx);
      });
    }

    function getSelectedYear() {
      const idx = Math.round(scroller.scrollTop / 44);
      const items = scroller.querySelectorAll(".year-picker-item");
      return items[idx] ? parseInt(items[idx].dataset.year) : curY;
    }

    scroller.addEventListener("scroll", updateSelected, { passive: true });

    // アイテムクリックでその年にスナップ
    scroller.addEventListener("click", e => {
      const item = e.target.closest(".year-picker-item");
      if (!item) return;
      const idx = Array.from(scroller.children).indexOf(item);
      scroller.scrollTo({ top: idx * 44, behavior: "smooth" });
    });

    function done() {
      overlay.classList.add("hidden");
      btnSave.onclick = btnCancel.onclick = overlay.onclick = null;
    }

    btnSave.onclick = async () => {
      const yr = getSelectedYear();
      done();
      await saveVisit(type, saveKey || name, yr);
      resolve();
    };
    btnCancel.onclick = () => { done(); resolve(); };
    overlay.onclick = e => { if (e.target === overlay) { done(); resolve(); } };
  });
}

// ==========================================
// グルメ ↔ ラーメン 訪問同期マップ
// ==========================================
const GOURMET_RAMEN_SYNC = {
  "福島喜多方ラーメン":  "喜多方ラーメン",
  "栃木佐野ラーメン":    "佐野ラーメン",
  "千葉勝浦タンタンメン":"勝浦タンタンメン",
  "神奈川家系ラーメン":  "横浜家系ラーメン",
  "富山ブラックラーメン":"富山ブラックラーメン",
  "和歌山ラーメン":      "和歌山ラーメン",
  "鳥取牛骨ラーメン":    "鳥取牛骨ラーメン",
  "徳島ラーメン":        "徳島ラーメン",
  "高知鍋焼きラーメン":  "鍋焼きラーメン",
  "福岡博多ラーメン":    "博多ラーメン",
};
const RAMEN_GOURMET_SYNC = Object.fromEntries(
  Object.entries(GOURMET_RAMEN_SYNC).map(([g, r]) => [r, g])
);

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
    // グルメ ↔ ラーメン 同店同期
    const partnerType = type === "gourmet" ? "ramen" : type === "ramen" ? "gourmet" : null;
    const syncMap = type === "gourmet" ? GOURMET_RAMEN_SYNC : RAMEN_GOURMET_SYNC;
    const partnerKey = partnerType && syncMap[name];
    if (partnerType && partnerKey) {
      if (!window.appState.visit[partnerType]) window.appState.visit[partnerType] = {};
      if (value === null) {
        await FB.delete(`${FB.endpoints.visit}/${partnerType}/${partnerKey}`);
        delete window.appState.visit[partnerType][partnerKey];
      } else {
        await FB.patch(`${FB.endpoints.visit}/${partnerType}`, { [partnerKey]: value });
        window.appState.visit[partnerType][partnerKey] = value;
      }
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

  // 地図
  if (type === "japan") renderJapanMap(visitData);
  if (type === "china") renderChinaMap(visitData);
  if (type === "world") renderWorldMap(visitData);

  // 渡航履歴
  const histEl = document.getElementById(`${type}-history`);
  if (histEl) renderHistory(histEl, visitData, type);
}

// ==========================================
// タブ切替時
// ==========================================
window.onMapTabActivate = function(type) {
  const section = document.getElementById(`tab-${type}`);
  const activeSub = section?.querySelector('.sub-tab.active')?.dataset.sub;
  if (activeSub === `${type}-heritage`) {
    renderHeritageList(type);
  } else {
    refreshTab(type);
  }
};

// ==========================================
// 世界遺産リスト描画
// ==========================================
async function renderHeritageList(scope) {
  const container = document.getElementById(`${scope}-heritage-container`);
  if (!container) return;
  try {
  const heritage = await loadHeritage();
  if (!heritage || !heritage.length) { container.innerHTML = '<div class="heritage-empty">データを読み込めませんでした</div>'; return; }
  const hv = window.appState?.visit?.heritage || {};
  const st = heritageState[scope];
  if (!st) { container.innerHTML = '<div class="heritage-empty">不正なスコープです</div>'; return; }

  // スコープでフィルター
  let sites = heritage;
  if (scope === 'japan') {
    sites = heritage.filter(s => (Array.isArray(s.iso) ? s.iso : [s.iso]).includes('jp'));
  } else if (scope === 'china') {
    sites = heritage.filter(s => (Array.isArray(s.iso) ? s.iso : [s.iso]).includes('cn'));
  }

  // World用 国リスト生成（全データから）
  let isoOptions = [];
  if (scope === 'world') {
    const isoSet = new Set();
    heritage.forEach(s => (Array.isArray(s.iso) ? s.iso : [s.iso]).forEach(c => isoSet.add(c)));
    isoOptions = [...isoSet].filter(c => typeof c === 'string').sort((a, b) => {
      const na = String(ISO_JA[a] || a), nb = String(ISO_JA[b] || b);
      return na.localeCompare(nb);
    });
  }

  // カテゴリフィルター
  let filtered = sites;
  if (st.cat) filtered = filtered.filter(s => s.cat === st.cat);

  // 国フィルター（World）
  if (scope === 'world' && st.iso) {
    filtered = filtered.filter(s => (Array.isArray(s.iso) ? s.iso : [s.iso]).includes(st.iso));
  }

  // 検索フィルター
  if (st.search) {
    const q = st.search.toLowerCase();
    filtered = filtered.filter(s =>
      (s.name_ja && s.name_ja.toLowerCase().includes(q)) ||
      (s.name || '').toLowerCase().includes(q) ||
      (Array.isArray(s.iso) ? s.iso : [s.iso]).some(c => (c || '').includes(q)) ||
      (Array.isArray(s.iso) ? s.iso : [s.iso]).some(c => (ISO_JA[c] || '').includes(q))
    );
  }

  // 年順ソート
  filtered.sort((a, b) => a.year - b.year);

  const visitedCount  = filtered.filter(s => hv[String(s.id)]).length;
  const scopeVisited  = sites.filter(s => hv[String(s.id)]).length;
  const scopeTotal    = sites.length;
  const total         = filtered.length;

  // ---- ボタングリッド（Japan/Chinaのみ） ----
  let html = '';
  if (scope === 'japan' || scope === 'china') {
    const catGroups = [
      { key:'C', label:'文化遺産', icon:'🏛️' },
      { key:'N', label:'自然遺産', icon:'🌿' },
      { key:'M', label:'複合遺産', icon:'🌟' }
    ];
    html += `<div class="heritage-btn-section">`;
    catGroups.forEach(cg => {
      const grpSites = sites.filter(s => s.cat === cg.key).slice().sort((a,b) => a.year - b.year);
      if (!grpSites.length) return;
      const gv = grpSites.filter(s => hv[String(s.id)]).length;
      const gt = grpSites.length;
      const gp = gt ? Math.round(gv/gt*100) : 0;
      html += `<div class="visit-group">
        <div class="visit-group-label">
          <span class="group-label-text">${cg.icon} ${cg.label}</span>
          <span class="group-label-stat">${gv}/${gt} <em>${gp}%</em></span>
        </div>
        <div class="visit-btn-grid heritage-btn-grid">`;
      grpSites.forEach(s => {
        const id = String(s.id);
        const visited = !!hv[id];
        const visitYr = (hv[id] && hv[id] !== true) ? hv[id] : null;
        const color   = visited ? yearToColor(visitYr) : '';
        const short   = heritageShortName(s);
        const fullName = (s.name_ja && s.name_ja !== s.name) ? s.name_ja : (s.name || '');
        html += `<button class="visit-btn heritage-btn${visited?' visited':''}"
          data-hid="${s.id}" data-hscope="${scope}"
          data-hname="${encodeURIComponent(fullName)}"
          ${visited?`style="background:${color};border-color:${color}"`:''}
          title="${esc(fullName)}（${s.year}年）">
          ${esc(short)}${visitYr?`<small>${visitYr}</small>`:visited?`<small>✓</small>`:''}
        </button>`;
      });
      html += `</div></div>`;
    });
    html += `</div>`;
  }

  // ---- World: 地域ナビ + 国別ボタングリッド ----
  if (scope === 'world') {
    html += `<div class="heritage-region-nav">
      <button class="hreg-btn${!st.region ? ' active' : ''}" data-region="">🌐 全地域</button>`;
    UNESCO_REGIONS.forEach(r => {
      html += `<button class="hreg-btn${st.region === r.key ? ' active' : ''}" data-region="${r.key}">${r.icon} ${r.label}</button>`;
    });
    html += `</div>`;

    if (st.region) {
      const region = UNESCO_REGIONS.find(r => r.key === st.region);
      // この地域の国→サイト一覧を作る
      const countryMap = {};
      heritage.forEach(s => {
        const isoArr = Array.isArray(s.iso) ? s.iso : [s.iso];
        const primary = isoArr.find(c => region.isos.has(c));
        if (!primary) return;
        if (!countryMap[primary]) countryMap[primary] = [];
        countryMap[primary].push(s);
      });
      const sortedCountries = Object.entries(countryMap).sort((a, b) => {
        const na = String(ISO_JA[a[0]] || a[0] || '');
        const nb = String(ISO_JA[b[0]] || b[0] || '');
        return na.localeCompare(nb);
      });
      html += `<div class="heritage-country-section">`;
      sortedCountries.forEach(([iso, cSites]) => {
        const cName  = ISO_JA[iso] || iso.toUpperCase();
        const flag   = isoFlag(iso);
        const cVisited = cSites.filter(s => hv[String(s.id)]).length;
        const cTotal   = cSites.length;
        const pct      = cTotal ? Math.round(cVisited / cTotal * 100) : 0;
        const expanded = st.expanded.has(iso);
        cSites.sort((a, b) => a.year - b.year);
        html += `<div class="heritage-country-group">
          <button class="hcountry-header${expanded ? ' expanded' : ''}" data-iso="${iso}">
            <span class="hcountry-flag">${flag}</span>
            <span class="hcountry-name">${cName}</span>
            <span class="hcountry-stat">${cVisited}/${cTotal} <em>${pct}%</em></span>
            <span class="hcountry-arrow">${expanded ? '▲' : '▼'}</span>
          </button>`;
        if (expanded) {
          html += `<div class="hcountry-body"><div class="visit-btn-grid heritage-btn-grid">`;
          cSites.forEach(s => {
            const id      = String(s.id);
            const visited = !!hv[id];
            const visitYr = (hv[id] && hv[id] !== true) ? hv[id] : null;
            const color   = visited ? yearToColor(visitYr) : '';
            const short   = heritageShortName(s);
            const fullName = (s.name_ja && s.name_ja !== s.name) ? s.name_ja : (s.name || '');
            html += `<button class="visit-btn heritage-btn${visited ? ' visited' : ''}"
              data-hid="${s.id}" data-hscope="${scope}"
              data-hname="${encodeURIComponent(fullName)}"
              ${visited ? `style="background:${color};border-color:${color}"` : ''}
              title="${esc(fullName)}（${s.year}年）">
              ${esc(short)}${visitYr ? `<small>${visitYr}</small>` : visited ? `<small>✓</small>` : ''}
            </button>`;
          });
          html += `</div></div>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }
  }

  // ---- 地図（ボタンの直後） ----
  html += `<div class="map-svg-section heritage-inline-map">
    <div class="map-legend">
      <span class="legend-item"><span class="legend-dot" style="background:#e8e4dc"></span>未訪問</span>
      <span class="legend-item"><span class="legend-dot" style="background:#f5e9c8"></span>1975</span>
      <span class="legend-item"><span class="legend-dot" style="background:#e8c06a"></span>最近</span>
    </div>
    <div id="${scope}-heritage-svg-container"></div>
  </div>`;

  // ---- カテゴリフィルターバー ----
  const cats = [
    { key:'', label:'全て',   icon:'📚' },
    { key:'C', label:'文化遺産', icon:'🏛️' },
    { key:'N', label:'自然遺産', icon:'🌿' },
    { key:'M', label:'複合遺産', icon:'🌟' }
  ];
  html += `<div class="heritage-toolbar">`;
  html += `<div class="heritage-cat-filter">`;
  cats.forEach(c => {
    html += `<button class="hcat-btn${st.cat === c.key ? ' active' : ''}"
      data-scope="${scope}" data-cat="${c.key}">${c.icon} ${c.label}</button>`;
  });
  html += `</div>`;

  // World: 国セレクト
  if (scope === 'world') {
    const isoCounts = {};
    heritage.forEach(s => (Array.isArray(s.iso) ? s.iso : [s.iso]).forEach(c => { isoCounts[c] = (isoCounts[c] || 0) + 1; }));
    html += `<select class="heritage-iso-select" data-scope="${scope}">
      <option value="">🌍 全ての国 (${scopeTotal}件)</option>`;
    isoOptions.forEach(iso => {
      const name = ISO_JA[iso] || iso.toUpperCase();
      html += `<option value="${iso}"${st.iso === iso ? ' selected' : ''}>${name} (${isoCounts[iso] || 0}件)</option>`;
    });
    html += `</select>`;
  }

  // 検索 + 統計
  html += `<div class="heritage-search-row">
    <input type="search" class="heritage-search" data-scope="${scope}"
      placeholder="🔍 検索..." value="${(st.search || '').replace(/"/g,'&quot;')}">
    <span class="heritage-stats">${scopeVisited}/${scopeTotal} 訪問済</span>
  </div>`;
  if (st.cat || st.search || st.iso) {
    html += `<div class="heritage-filter-summary">${total}件表示中</div>`;
  }
  html += `</div>`;

  // ---- 一覧 ----
  html += `<div class="heritage-list">`;
  const noFilter = scope === 'world' && !st.region && !st.search && !st.cat && !st.iso;
  if (filtered.length === 0) {
    html += `<div class="heritage-empty">該当する世界遺産がありません</div>`;
  } else if (noFilter) {
    html += `<div class="heritage-empty">⬆️ 地域を選択するか、検索・フィルターで絞り込んでください</div>`;
  } else {
    const MAX = 150;
    const display = filtered.slice(0, MAX);
    display.forEach(s => {
      const id      = String(s.id);
      const visited = !!hv[id];
      const visitYr = (hv[id] && hv[id] !== true) ? hv[id] : null;
      const name    = (s.name_ja && s.name_ja !== s.name) ? s.name_ja : (s.name || '');
      const catIcon = s.cat === 'N' ? '🌿' : s.cat === 'M' ? '🌟' : '🏛️';
      const catCls  = s.cat === 'N' ? 'cat-n' : s.cat === 'M' ? 'cat-m' : 'cat-c';
      const isoArr  = Array.isArray(s.iso) ? s.iso : (s.iso ? [s.iso] : []);
      const locSuffix = isoArr.length === 1
        ? (isoArr[0] === 'jp' ? (JP_PREF_MAP[Number(s.id)] || '') : isoArr[0] === 'cn' ? (CN_PROV_MAP[Number(s.id)] || '') : '')
        : '';
      const countryText = isoArr.filter(Boolean).map(c => ISO_JA[c] || String(c).toUpperCase()).join('・')
        + (locSuffix ? `（${locSuffix}）` : '');

      html += `<div class="heritage-item${visited ? ' visited' : ''}"
        data-id="${s.id}" data-scope="${scope}" data-name="${encodeURIComponent(name)}">
        <div class="heritage-star-icon">${visited ? '★' : '☆'}</div>
        <div class="heritage-item-body">
          <div class="heritage-item-name">${esc(name)}</div>
          <div class="heritage-item-meta">
            <span class="heritage-cat-badge ${catCls}">${catIcon} ${esc(s.cat_ja || s.cat)}</span>
            ${countryText ? `<span class="heritage-country">${esc(countryText)}</span>` : ''}
            <span class="heritage-year">${s.year}年</span>
            ${s.criteria ? `<span class="heritage-criteria">${esc(s.criteria)}</span>` : ''}
            ${visitYr ? `<span class="heritage-visit-year">${visitYr}年訪問</span>` : ''}
          </div>
          ${s.desc_ja ? `<div class="heritage-item-desc">${esc(s.desc_ja)}</div>` : ''}
        </div>
      </div>`;
    });
    if (filtered.length > MAX) {
      html += `<div class="heritage-more">他 ${filtered.length - MAX}件 — 検索で絞り込んでください</div>`;
    }
  }
  html += `</div>`;

  // ---- 訪問履歴セクション ----
  const heritageById = {};
  sites.forEach(s => { heritageById[String(s.id)] = s; });
  const visitedEntries = Object.entries(hv)
    .filter(([k, v]) => v && heritageById[k])
    .map(([k, v]) => ({ id: k, year: (v === true || !v) ? null : v, site: heritageById[k] }))
    .sort((a, b) => (b.year || 0) - (a.year || 0));

  if (visitedEntries.length > 0) {
    const byYear = {};
    const noYear = [];
    visitedEntries.forEach(e => {
      if (e.year) {
        if (!byYear[e.year]) byYear[e.year] = [];
        byYear[e.year].push(e);
      } else {
        noYear.push(e);
      }
    });
    html += `<div class="heritage-history-section">
      <div class="heritage-history-title">訪問履歴 (${visitedEntries.length}件)</div>`;
    Object.keys(byYear).map(Number).sort((a, b) => b - a).forEach(yr => {
      html += `<div class="history-year-group"><div class="history-year-label">${yr}年</div><div class="history-places">`;
      byYear[yr].forEach(e => {
        const n = (e.site.name_ja && e.site.name_ja !== e.site.name) ? e.site.name_ja : e.site.name;
        html += `<button class="history-place-btn heritage-history-btn"
          data-hid="${e.id}" data-scope="${scope}"
          data-hname="${encodeURIComponent(n)}"
          data-year="${yr}">${esc(n)}</button>`;
      });
      html += `</div></div>`;
    });
    if (noYear.length > 0) {
      html += `<div class="history-year-group"><div class="history-year-label">年不明</div><div class="history-places">`;
      noYear.forEach(e => {
        const n = (e.site.name_ja && e.site.name_ja !== e.site.name) ? e.site.name_ja : e.site.name;
        html += `<button class="history-place-btn heritage-history-btn"
          data-hid="${e.id}" data-scope="${scope}"
          data-hname="${encodeURIComponent(n)}"
          data-year="">${esc(n)}</button>`;
      });
      html += `</div></div>`;
    }
    html += `</div>`;
  }

  container.innerHTML = html;

  // 地図レンダリング（DOM挿入後）
  if (scope === 'japan') renderJapanMap(window.appState?.visit?.japan || {}, 'japan-heritage-svg-container', true);
  else if (scope === 'china') renderChinaMap(window.appState?.visit?.china || {}, 'china-heritage-svg-container', true);
  else if (scope === 'world') renderWorldMap(window.appState?.visit?.world || {}, 'world-heritage-svg-container', true);

  // ---- イベント ----
  container.querySelectorAll('.hcat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      heritageState[scope].cat = btn.dataset.cat;
      renderHeritageList(scope);
    });
  });
  const isoSel = container.querySelector('.heritage-iso-select');
  if (isoSel) {
    isoSel.addEventListener('change', () => {
      heritageState[scope].iso = isoSel.value;
      renderHeritageList(scope);
    });
  }
  const searchEl = container.querySelector('.heritage-search');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      heritageState[scope].search = searchEl.value;
      renderHeritageList(scope);
    });
  }
  // ボタンクリック
  container.querySelectorAll('.heritage-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id   = btn.dataset.hid;
      const name = decodeURIComponent(btn.dataset.hname);
      const hv   = window.appState?.visit?.heritage || {};
      if (hv[id]) {
        if (!confirm(`「${name}」の訪問記録を削除しますか？`)) return;
        await saveVisit('heritage', id, null);
      } else {
        await openYearDialog('heritage', name, new Date().getFullYear(), id);
      }
      renderHeritageList(scope);
    });
  });

  // リストアイテムクリック
  container.querySelectorAll('.heritage-item').forEach(el => {
    el.addEventListener('click', async () => {
      const id   = el.dataset.id;
      const name = decodeURIComponent(el.dataset.name);
      const hv   = window.appState?.visit?.heritage || {};
      if (hv[id]) {
        if (!confirm(`「${name}」の訪問記録を削除しますか？`)) return;
        await saveVisit('heritage', id, null);
      } else {
        await openYearDialog('heritage', name, new Date().getFullYear(), id);
      }
      renderHeritageList(scope);
    });
  });

  // 地域ボタン（World）
  container.querySelectorAll('.hreg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      heritageState[scope].region = btn.dataset.region;
      heritageState[scope].expanded = new Set();
      renderHeritageList(scope);
    });
  });

  // 国アコーディオン（World）
  container.querySelectorAll('.hcountry-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const iso = btn.dataset.iso;
      const exp = heritageState[scope].expanded;
      if (exp.has(iso)) exp.delete(iso); else exp.add(iso);
      renderHeritageList(scope);
    });
  });

  // 履歴ボタンクリック
  container.querySelectorAll('.heritage-history-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id   = btn.dataset.hid;
      const name = decodeURIComponent(btn.dataset.hname);
      const hv   = window.appState?.visit?.heritage || {};
      const curYear = (hv[id] && hv[id] !== true) ? hv[id] : new Date().getFullYear();
      if (confirm(`「${name}」の訪問記録を削除しますか？`)) {
        await saveVisit('heritage', id, null);
        renderHeritageList(scope);
      } else {
        await openYearDialog('heritage', name, curYear, id);
        renderHeritageList(scope);
      }
    });
  });
  } catch(e) {
    container.innerHTML = `<div class="heritage-empty">⚠️ 表示エラー: ${e.message}</div>`;
    console.error('renderHeritageList error:', e);
  }
}

window.renderHeritageList = renderHeritageList;

// ==========================================
// 世界遺産 日本県・中国省 マッピング
// ==========================================
const JP_PREF_MAP = {
  776:"広島県", 1246:"島根県", 1362:"東京都", 1142:"和歌山県・奈良県・三重県",
  688:"京都府・滋賀県", 870:"奈良県", 663:"青森県・秋田県", 734:"岐阜県・富山県",
  1193:"北海道", 913:"栃木県", 661:"兵庫県", 1277:"岩手県", 775:"広島県",
  660:"奈良県", 662:"鹿児島県", 972:"沖縄県", 1418:"静岡県・山梨県",
  1449:"群馬県", 1484:"長崎県・熊本県他", 1535:"福岡県", 1495:"長崎県・熊本県",
  1593:"大阪府", 1632:"北海道・青森県・岩手県・秋田県", 1574:"鹿児島県・沖縄県", 1698:"新潟県"
};
const CN_PROV_MAP = {
  1002:"安徽省", 880:"北京市", 1114:"河南省", 1039:"山西省", 1083:"雲南省",
  1112:"広東省", 779:"四川省", 637:"四川省", 704:"山東省", 547:"安徽省",
  1334:"浙江省", 638:"四川省", 1135:"吉林省", 1279:"山西省", 1292:"江西省",
  441:"陝西省", 1213:"四川省", 703:"河北省", 1001:"四川省", 813:"江蘇省",
  437:"山東省", 912:"重慶市", 1248:"広西壮族自治区", 1335:"広東省", 881:"北京市",
  1305:"河南省", 440:"甘粛省", 438:"複数省", 911:"福建省", 1113:"福建省",
  705:"湖北省", 640:"湖南省", 812:"山西省", 449:"北京市", 439:"北京市・遼寧省",
  1110:"マカオ", 1004:"北京市等", 707:"チベット自治区", 1003:"河南省",
  811:"雲南省", 778:"江西省", 1389:"内モンゴル自治区", 1388:"雲南省", 1111:"雲南省",
  1414:"新疆ウイグル自治区", 1443:"複数省", 1508:"広西壮族自治区", 1592:"浙江省",
  1606:"江蘇省等", 1474:"貴州省等", 1509:"湖北省", 1541:"福建省", 1540:"青海省",
  1559:"貴州省", 1561:"福建省", 1665:"雲南省", 1714:"北京市", 1638:"内モンゴル自治区", 1736:"寧夏回族自治区"
};

// ==========================================
// グルメ・ラーメン タブ描画
// ==========================================
const FOOD_PREF_REGION = {
  '北海道':'🌸 北海道・東北','青森県':'🌸 北海道・東北','岩手県':'🌸 北海道・東北',
  '宮城県':'🌸 北海道・東北','秋田県':'🌸 北海道・東北','山形県':'🌸 北海道・東北','福島県':'🌸 北海道・東北',
  '茨城県':'🌿 関東','栃木県':'🌿 関東','群馬県':'🌿 関東','埼玉県':'🌿 関東',
  '千葉県':'🌿 関東','東京都':'🌿 関東','神奈川県':'🌿 関東',
  '新潟県':'🍁 中部','富山県':'🍁 中部','石川県':'🍁 中部','福井県':'🍁 中部',
  '山梨県':'🍁 中部','長野県':'🍁 中部','岐阜県':'🍁 中部','静岡県':'🍁 中部','愛知県':'🍁 中部',
  '三重県':'🏯 近畿','滋賀県':'🏯 近畿','京都府':'🏯 近畿','大阪府':'🏯 近畿',
  '兵庫県':'🏯 近畿','奈良県':'🏯 近畿','和歌山県':'🏯 近畿',
  '鳥取県':'⛩️ 中国・四国','島根県':'⛩️ 中国・四国','岡山県':'⛩️ 中国・四国',
  '広島県':'⛩️ 中国・四国','山口県':'⛩️ 中国・四国','徳島県':'⛩️ 中国・四国',
  '香川県':'⛩️ 中国・四国','愛媛県':'⛩️ 中国・四国','高知県':'⛩️ 中国・四国',
  '福岡県':'🌺 九州・沖縄','佐賀県':'🌺 九州・沖縄','長崎県':'🌺 九州・沖縄',
  '熊本県':'🌺 九州・沖縄','大分県':'🌺 九州・沖縄','宮崎県':'🌺 九州・沖縄',
  '鹿児島県':'🌺 九州・沖縄','沖縄県':'🌺 九州・沖縄',
};
const FOOD_REGION_ORDER = ['🌸 北海道・東北','🌿 関東','🍁 中部','🏯 近畿','⛩️ 中国・四国','🌺 九州・沖縄'];

function renderFoodTab(dataType) {
  const DATA = dataType === "gourmet" ? (typeof GOURMET_DATA !== "undefined" ? GOURMET_DATA : [])
                                      : (typeof RAMEN_DATA   !== "undefined" ? RAMEN_DATA   : []);
  const containerId = `japan-${dataType}-container`;
  const container = document.getElementById(containerId);
  if (!container || !DATA.length) return;

  const visitData = window.appState?.visit?.[dataType] || {};

  // 地域グループ化
  const regionMap = {};
  DATA.forEach(item => {
    const region = FOOD_PREF_REGION[item.pref] || '🌸 北海道・東北';
    if (!regionMap[region]) regionMap[region] = [];
    regionMap[region].push(item);
  });

  const visitedTotal = DATA.filter(item => !!visitData[item.key]).length;
  const total = DATA.length;
  const pct = total ? Math.round(visitedTotal / total * 100) : 0;
  const label = dataType === "gourmet" ? "🍽 グルメ" : "🍜 ラーメン";

  let html = `<div class="map-header-bar">
    <h2 class="map-title">${label}</h2>
    <div class="map-stats-line"><span class="mstat-num">${visitedTotal}</span> / ${total} <span class="mstat-pct">${pct}%</span></div>
  </div>`;

  FOOD_REGION_ORDER.forEach(region => {
    const items = regionMap[region];
    if (!items) return;
    const gVisited = items.filter(item => !!visitData[item.key]).length;
    const gTotal = items.length;
    const gPct = gTotal ? Math.round(gVisited / gTotal * 100) : 0;
    html += `<div class="visit-group">
      <div class="visit-group-label">
        <span class="group-label-text">${region}</span>
        <span class="group-label-stat">${gVisited}/${gTotal} <em>${gPct}%</em></span>
      </div>
      <div class="visit-btn-grid food-btn-grid">`;
    items.forEach(item => {
      const val = visitData[item.key];
      const year = (val === true) ? null : (val || null);
      const visited = !!val;
      const color = visited ? yearToColor(year) : "";
      html += `<button class="visit-btn food-btn ${visited ? "visited" : ""}"
        data-key="${item.key}" data-type="${dataType}" data-visited="${visited}" data-food="${item.food}"
        ${visited ? `style="background:${color};border-color:${color}"` : ""}>
        ${item.food}${year ? `<small>${year}</small>` : visited ? `<small>✓</small>` : ""}
      </button>`;
    });
    html += `</div></div>`;
  });

  // ---- 一覧リスト（世界遺産スタイル） ----
  const foodIcon = dataType === 'gourmet' ? '🍽' : '🍜';
  html += `<div class="extra-list-section">
    <div class="extra-list-title">一覧 <span class="extra-list-stat">${visitedTotal} / ${total}件</span></div>
    <div class="heritage-list">`;
  DATA.forEach(item => {
    const val = visitData[item.key];
    const year = (val === true) ? null : (val || null);
    const visited = !!val;
    html += `<div class="heritage-item${visited ? ' visited' : ''}"
      data-key="${item.key}" data-type="${dataType}" data-food="${item.food}" data-visited="${visited}">
      <div class="heritage-star-icon">${visited ? '★' : '☆'}</div>
      <div class="heritage-item-body">
        <div class="heritage-item-name">${esc(item.food)}</div>
        <div class="heritage-item-meta">
          <span class="extra-food-badge">${foodIcon}</span>
          <span class="heritage-country">${esc(item.pref)}${item.city ? ' · ' + esc(item.city) : ''}</span>
          ${visited ? `<span class="heritage-visit-year">${year ? year + '年訪問' : '訪問済'}</span>` : ''}
        </div>
        ${item.shop ? `<div class="heritage-item-desc">📍 ${esc(item.shop)}</div>` : ''}
        ${item.desc ? `<div class="extra-item-sub">${esc(item.desc)}</div>` : ''}
      </div>
    </div>`;
  });
  html += `</div></div>`;

  // ---- 訪問履歴 ----
  const visitedItems = DATA.filter(item => !!visitData[item.key]);
  if (visitedItems.length > 0) {
    const byYear = {}, noYear = [];
    visitedItems.forEach(item => {
      const v = visitData[item.key];
      const yr = (v === true || !v) ? null : v;
      if (yr) { if (!byYear[yr]) byYear[yr] = []; byYear[yr].push(item); }
      else noYear.push(item);
    });
    html += `<div class="heritage-history-section">
      <div class="heritage-history-title">訪問履歴 (${visitedItems.length}件)</div>`;
    Object.keys(byYear).map(Number).sort((a, b) => b - a).forEach(yr => {
      html += `<div class="history-year-group"><div class="history-year-label">${yr}年</div><div class="history-places">`;
      byYear[yr].forEach(item => {
        html += `<button class="history-place-btn extra-history-btn"
          data-key="${item.key}" data-type="${dataType}" data-food="${item.food}" data-year="${yr}">${item.food}</button>`;
      });
      html += `</div></div>`;
    });
    if (noYear.length) {
      html += `<div class="history-year-group"><div class="history-year-label">年不明</div><div class="history-places">`;
      noYear.forEach(item => {
        html += `<button class="history-place-btn extra-history-btn"
          data-key="${item.key}" data-type="${dataType}" data-food="${item.food}" data-year="">${item.food}</button>`;
      });
      html += `</div></div>`;
    }
    html += `</div>`;
  }

  container.innerHTML = html;

  // ボタンイベント
  container.querySelectorAll(".food-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const key = btn.dataset.key, type = btn.dataset.type;
      const visited = btn.dataset.visited === "true", disp = btn.dataset.food;
      const syncPartner = () => {
        const p = type === "gourmet" ? "ramen" : "gourmet";
        if (document.getElementById(`japan-${p}`)?.classList.contains("active")) renderFoodTab(p);
      };
      if (visited) {
        if (confirm(`「${disp}」の食事記録を削除しますか？`)) { await saveVisit(type, key, null); renderFoodTab(type); syncPartner(); }
      } else { await openYearDialog(type, disp, new Date().getFullYear(), key); renderFoodTab(type); syncPartner(); }
    });
  });

  // 一覧リストイベント
  container.querySelectorAll(".extra-list-section .heritage-item").forEach(row => {
    row.addEventListener("click", async () => {
      const key = row.dataset.key, type = row.dataset.type, disp = row.dataset.food;
      const visited = row.dataset.visited === "true";
      const syncPartner = () => {
        const p = type === "gourmet" ? "ramen" : "gourmet";
        if (document.getElementById(`japan-${p}`)?.classList.contains("active")) renderFoodTab(p);
      };
      if (visited) {
        if (confirm(`「${disp}」の食事記録を削除しますか？`)) { await saveVisit(type, key, null); renderFoodTab(type); syncPartner(); }
      } else { await openYearDialog(type, disp, new Date().getFullYear(), key); renderFoodTab(type); syncPartner(); }
    });
  });

  // 訪問履歴ボタンイベント
  container.querySelectorAll(".extra-history-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const key = btn.dataset.key, type = btn.dataset.type, disp = btn.dataset.food;
      const yr = Number(btn.dataset.year) || new Date().getFullYear();
      const syncPartner = () => {
        const p = type === "gourmet" ? "ramen" : "gourmet";
        if (document.getElementById(`japan-${p}`)?.classList.contains("active")) renderFoodTab(p);
      };
      if (confirm(`「${disp}」の食事記録を削除しますか？`)) { await saveVisit(type, key, null); renderFoodTab(type); syncPartner(); }
      else { await openYearDialog(type, disp, yr, key); renderFoodTab(type); syncPartner(); }
    });
  });
}

window.renderFoodTab = renderFoodTab;

// ==========================================
// 温泉タブ描画
// ==========================================
const ONSEN_REGION_ORDER = ['🌨️ 北海道','🍎 東北','🌸 関東','⛰️ 中部','🦌 近畿','⛩️ 中国・四国','🌺 九州・沖縄'];

function renderOnsenTab() {
  const DATA = typeof ONSEN_DATA !== "undefined" ? ONSEN_DATA : [];
  const container = document.getElementById("japan-onsen-container");
  if (!container || !DATA.length) return;

  const visitData = window.appState?.visit?.onsen || {};

  // 地域グループ化
  const regionMap = {};
  DATA.forEach(item => {
    if (!regionMap[item.region]) regionMap[item.region] = [];
    regionMap[item.region].push(item);
  });

  const visitedTotal = DATA.filter(item => !!visitData[item.key]).length;
  const total = DATA.length;
  const pct = total ? Math.round(visitedTotal / total * 100) : 0;

  // ★ → ♨️ 変換ヘルパー
  const toOnsenStar = str => (str || '').replace(/⭐/g, '♨️');

  let html = `<div class="map-header-bar">
    <h2 class="map-title">♨️ 温泉</h2>
    <div class="map-stats-line"><span class="mstat-num">${visitedTotal}</span> / ${total} <span class="mstat-pct">${pct}%</span></div>
  </div>`;

  // ---- ボタングリッド ----
  ONSEN_REGION_ORDER.forEach(region => {
    const items = regionMap[region];
    if (!items) return;
    const gVisited = items.filter(item => !!visitData[item.key]).length;
    const gTotal = items.length;
    const gPct = gTotal ? Math.round(gVisited / gTotal * 100) : 0;
    html += `<div class="visit-group">
      <div class="visit-group-label">
        <span class="group-label-text">${region}</span>
        <span class="group-label-stat">${gVisited}/${gTotal} <em>${gPct}%</em></span>
      </div>
      <div class="visit-btn-grid onsen-btn-grid">`;
    items.forEach(item => {
      const val = visitData[item.key];
      const year = (val === true) ? null : (val || null);
      const visited = !!val;
      const color = visited ? yearToColor(year) : "";
      html += `<button class="visit-btn onsen-btn ${visited ? "visited" : ""}"
        data-key="${item.key}" data-name="${item.name}" data-visited="${visited}"
        ${visited ? `style="background:${color};border-color:${color}"` : ""}>
        ${item.name}
        <small>${visited ? (year ? year : "✓") : toOnsenStar(item.starStr)}</small>
      </button>`;
    });
    html += `</div></div>`;
  });

  // ---- 一覧リスト（世界遺産スタイル） ----
  html += `<div class="extra-list-section">
    <div class="extra-list-title">一覧 <span class="extra-list-stat">${visitedTotal} / ${total}件</span></div>
    <div class="heritage-list">`;
  DATA.forEach(item => {
    const val = visitData[item.key];
    const year = (val === true) ? null : (val || null);
    const visited = !!val;
    html += `<div class="heritage-item${visited ? ' visited' : ''}"
      data-key="${item.key}" data-name="${item.name}" data-visited="${visited}">
      <div class="heritage-star-icon">${visited ? '★' : '☆'}</div>
      <div class="heritage-item-body">
        <div class="heritage-item-name">${esc(item.name)}</div>
        <div class="heritage-item-meta">
          ${item.starStr ? `<span class="extra-rank-badge">${toOnsenStar(item.starStr)}</span>` : ''}
          <span class="heritage-country">${esc(item.pref)}</span>
          ${visited ? `<span class="heritage-visit-year">${year ? year + '年訪問' : '訪問済'}</span>` : ''}
        </div>
        ${item.dayBath ? `<div class="heritage-item-desc">日帰り: ${esc(item.dayBath)}</div>` : ''}
      </div>
    </div>`;
  });
  html += `</div></div>`;

  // ---- 訪問履歴 ----
  const visitedItems = DATA.filter(item => !!visitData[item.key]);
  if (visitedItems.length > 0) {
    const byYear = {}, noYear = [];
    visitedItems.forEach(item => {
      const v = visitData[item.key];
      const yr = (v === true || !v) ? null : v;
      if (yr) { if (!byYear[yr]) byYear[yr] = []; byYear[yr].push(item); }
      else noYear.push(item);
    });
    html += `<div class="heritage-history-section">
      <div class="heritage-history-title">訪問履歴 (${visitedItems.length}件)</div>`;
    Object.keys(byYear).map(Number).sort((a, b) => b - a).forEach(yr => {
      html += `<div class="history-year-group"><div class="history-year-label">${yr}年</div><div class="history-places">`;
      byYear[yr].forEach(item => {
        html += `<button class="history-place-btn extra-history-btn"
          data-key="${item.key}" data-name="${item.name}" data-year="${yr}">${item.name}</button>`;
      });
      html += `</div></div>`;
    });
    if (noYear.length) {
      html += `<div class="history-year-group"><div class="history-year-label">年不明</div><div class="history-places">`;
      noYear.forEach(item => {
        html += `<button class="history-place-btn extra-history-btn"
          data-key="${item.key}" data-name="${item.name}" data-year="">${item.name}</button>`;
      });
      html += `</div></div>`;
    }
    html += `</div>`;
  }

  container.innerHTML = html;

  // ボタンイベント
  container.querySelectorAll(".onsen-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const key = btn.dataset.key, name = btn.dataset.name;
      const visited = btn.dataset.visited === "true";
      if (visited) {
        if (confirm(`「${name}」の訪問記録を削除しますか？`)) { await saveVisit("onsen", key, null); renderOnsenTab(); }
      } else { await openYearDialog("onsen", name, new Date().getFullYear(), key); renderOnsenTab(); }
    });
  });

  // 一覧リストイベント
  container.querySelectorAll(".extra-list-section .heritage-item").forEach(row => {
    row.addEventListener("click", async () => {
      const key = row.dataset.key, name = row.dataset.name;
      const visited = row.dataset.visited === "true";
      if (visited) {
        if (confirm(`「${name}」の訪問記録を削除しますか？`)) { await saveVisit("onsen", key, null); renderOnsenTab(); }
      } else { await openYearDialog("onsen", name, new Date().getFullYear(), key); renderOnsenTab(); }
    });
  });

  // 訪問履歴ボタンイベント
  container.querySelectorAll(".extra-history-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const key = btn.dataset.key, name = btn.dataset.name, yr = Number(btn.dataset.year) || new Date().getFullYear();
      if (confirm(`「${name}」の訪問記録を削除しますか？`)) { await saveVisit("onsen", key, null); renderOnsenTab(); }
      else { await openYearDialog("onsen", name, yr, key); renderOnsenTab(); }
    });
  });
}

window.renderOnsenTab = renderOnsenTab;
