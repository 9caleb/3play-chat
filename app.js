var firebaseConfig = {
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox",
  storageBucket: "play-chatbox.firebasestorage.app",
  messagingSenderId: "822745508232",
  appId: "1:822745508232:web:20b6baa7e4929668db723d"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();
var messagesRef = db.ref("messages");

var params   = new URLSearchParams(window.location.search);
var isScreen = params.has("screen");
var isAdmin  = params.has("admin");

/* screen 隐藏输入 */
if (isScreen && !isAdmin) {
  var ia = document.querySelector(".input-area");
  if (ia) ia.style.display = "none";
}

/* QR（不动 screen） */
var qrEl = document.getElementById("qr");
if (qrEl && !isAdmin) {
  new QRious({
    element: qrEl,
    value: location.href.split("?")[0],
    size: 320
  });
}

/* 防刷屏 */
var lastSent = 0;
var COOLDOWN = 30000;
var MAX_LEN  = 80;

/* 脏话过滤 */
var bannedWords = ["fuck","shit","bitch","asshole","cunt","nigger","retard"];
function hasBadWord(t){
  t = t.toLowerCase();
  return bannedWords.some(w => t.includes(w));
}

/* 锁名字 */
var nameInput = document.getElementById("name");
if (nameInput) {
  var savedName = localStorage.getItem("chat_name");
  if (savedName) {
    nameInput.value = savedName;
    nameInput.disabled = true;
  }
}

/* 发送消息 */
function sendMessage(){
  if (isScreen && !isAdmin) return;

  var now = Date.now();
  if (now - lastSent < COOLDOWN) return;

  var name = isAdmin ? "ADMIN" : nameInput.value.trim();
  var msgEl = document.getElementById("message");
  var msg = msgEl.value.trim();

  if (!name || !msg || msg.length > MAX_LEN) return;
  if (hasBadWord(msg)) return;

  localStorage.setItem("chat_name", name);
  if (nameInput) nameInput.disabled = true;

  messagesRef.push({ name: name, message: msg, time: now });
  lastSent = now;
  msgEl.value = "";
}

/* 渲染消息 */
messagesRef.limitToLast(100).on("child_added", snap => {
  var data = snap.val();
  var key  = snap.key;

  /* 手机端：完全不显示聊天记录 */
  if (!isAdmin && !isScreen) return;

  var chat = document.getElementById("chat");
  if (!chat) return;

  var row = document.createElement("div");
  row.className = "msg";
  row.id = key;

  row.innerHTML =
    "<span class='user'>" + data.name + "</span>" +
    data.message;

  /* admin 删除按钮 */
  if (isAdmin) {
    var del = document.createElement("button");
    del.textContent = "❌";
    del.style.marginLeft = "10px";
    del.onclick = function(){
      messagesRef.child(key).remove();
    };
    row.appendChild(del);
  }

  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
});

/* 实时移除（admin 删后不用刷新） */
messagesRef.on("child_removed", snap => {
  var el = document.getElementById(snap.key);
  if (el) el.remove();
});

/* 清屏（admin only） */
function clearChat(){
  if (!isAdmin) return;
  if (confirm("Clear all messages?")) {
    messagesRef.remove();
  }
}

