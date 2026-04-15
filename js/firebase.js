// ==========================================
// firebase.js — Firebase Realtime DB (REST)
// ==========================================

const DB   = “https://my-bucket-list-1a786-default-rtdb.asia-southeast1.firebasedatabase.app”;
const USER = “users/hideki”;

const FB = {
// — 取得 —
async get(path) {
const res = await fetch(`${DB}/${path}.json`);
if (!res.ok) throw new Error(`GET failed: ${path}`);
return res.json();
},

// — 全件保存（PUT） —
async put(path, data) {
const res = await fetch(`${DB}/${path}.json`, {
method: “PUT”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify(data)
});
if (!res.ok) throw new Error(`PUT failed: ${path}`);
return res.json();
},

// — 1件追加（POST） —
async post(path, data) {
const res = await fetch(`${DB}/${path}.json`, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify(data)
});
if (!res.ok) throw new Error(`POST failed: ${path}`);
return res.json();
},

// — 1件更新（PATCH） —
async patch(path, data) {
const res = await fetch(`${DB}/${path}.json`, {
method: “PATCH”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify(data)
});
if (!res.ok) throw new Error(`PATCH failed: ${path}`);
return res.json();
},

// — 1件削除（DELETE） —
async delete(path) {
const res = await fetch(`${DB}/${path}.json`, { method: “DELETE” });
if (!res.ok) throw new Error(`DELETE failed: ${path}`);
return res.json();
},

// — エンドポイント定義 —
endpoints: {
bucket: `${USER}/bucketList`,
trash:  `${USER}/trashList`,
visit:  `${USER}/visitData`
}
};
