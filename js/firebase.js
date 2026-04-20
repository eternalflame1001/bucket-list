// ==========================================
// firebase.js — Firebase Realtime DB
// REST API + WebSocketリアルタイム同期
// ==========================================

const DB        = "https://my-bucket-list-1a786-default-rtdb.asia-southeast1.firebasedatabase.app";

// 許可ユーザー一覧（ここにないパラメータはアクセス拒否）
const ALLOWED_USERS = new Set(['master','hideki','friend','f01','f02','f03']);

// Cookie操作（SafariとPWAで共有される唯一の手段）
function _setCookie(val) {
  const exp = new Date(Date.now() + 365 * 864e5).toUTCString();
  document.cookie = `bucket_user=${val};expires=${exp};path=/;SameSite=Lax`;
}
function _getCookie() {
  const m = document.cookie.match(/(?:^|; )bucket_user=([^;]+)/);
  return m ? m[1] : null;
}

// URLパラメータ優先 → Cookie → localStorage → master の順で決定
const _paramU = new URLSearchParams(window.location.search).get('u');
if (_paramU && ALLOWED_USERS.has(_paramU)) {
  _setCookie(_paramU);                                    // Cookie（PWAと共有）
  try { localStorage.setItem('bucket_user', _paramU); } catch(e) {}
}
const _U = _paramU
        || _getCookie()
        || (() => { try { return localStorage.getItem('bucket_user'); } catch(e) { return null; } })()
        || 'master';

const USER_VALID    = ALLOWED_USERS.has(_U);

const USER      = `users/${_U}`;
const USER_LABEL = _U === 'hideki' ? "Hideki's List"
                : _U === 'friend'  ? "Friend's List"
                : _U === 'f01'     ? "f01's List"
                : _U === 'f02'     ? "f02's List"
                : _U === 'f03'     ? "f03's List"
                : "Master's List";

const FB = {
  // --- REST: 取得 ---
  async get(path) {
    const res = await fetch(`${DB}/${path}.json`);
    if (!res.ok) throw new Error(`GET failed: ${path}`);
    return res.json();
  },
  // --- REST: 更新（PATCH） ---
  async patch(path, data) {
    const res = await fetch(`${DB}/${path}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`PATCH failed: ${path}`);
    return res.json();
  },
  // --- REST: 削除（DELETE） ---
  async delete(path) {
    const res = await fetch(`${DB}/${path}.json`, { method: "DELETE" });
    if (!res.ok) throw new Error(`DELETE failed: ${path}`);
    return res.json();
  },

  // --- WebSocket: リアルタイムリスナー ---
  listen(path, callback) {
    const url = `${DB}/${path}.json`;
    const es  = new EventSource(url);
    es.addEventListener("put", e => {
      const msg = JSON.parse(e.data);
      if (msg.data !== null) callback(msg.data);
    });
    es.addEventListener("patch", e => {
      const msg = JSON.parse(e.data);
      callback(null, msg.data); // patch通知
    });
    es.onerror = () => {
      document.getElementById("sync-dot")?.classList.remove("active");
    };
    es.onopen = () => {
      document.getElementById("sync-dot")?.classList.add("active");
    };
    return es; // closeしたい場合は es.close()
  },

  endpoints: {
    bucket: `${USER}/bucketList`,
    trash:  `${USER}/trashList`,
    visit:  `${USER}/visitData`
  }
};
