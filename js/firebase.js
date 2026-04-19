// ==========================================
// firebase.js — Firebase Realtime DB
// REST API + WebSocketリアルタイム同期
// ==========================================

const DB        = "https://my-bucket-list-1a786-default-rtdb.asia-southeast1.firebasedatabase.app";
const _U        = new URLSearchParams(window.location.search).get('u') || 'master';
const USER      = `users/${_U}`;
const USER_LABEL = _U === 'hideki' ? "HIDEKI's List"
                : _U === 'friend'  ? "Friend's List"
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
