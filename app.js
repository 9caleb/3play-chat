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

/* 屏幕模式隐藏输入 */
if (isScreen && !isAdmin) {
  var ia = document.querySelector(".input-area");
  if (ia) ia.style.display = "none";
}

/* QR（GitHub Pages 修正版） */
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

/* 固定名字 */
var nameInput = document.getElementById("name");
if (nameInput) {
  var savedName = localStorage.getItem("chat_name");
  if (savedName) {
    nameInput.value = savedName;
    nameInput.disabled = true;
  }
}

/* 发消息 */
function sendMessage(){
  if (isScreen && !isAdmin) return;

  var now = Date.now();
  if (now - lastSent < COOLDOWN) return;

  var name = nameInput ? nameInput.value.trim() : "ADMIN";
  var msgEl = document.getElementById("message");
  var msg  = msgEl ? msgEl.value.trim() : "";

  if (!name || !msg || msg.length > MAX_LEN) return;
  if (hasBadWord(msg)) return;

  localStorage.setItem("chat_name", name);
  if (nameInput) nameInput.disabled = true;

  messagesRef.push({ name: name, message: msg, time: now });
  lastSent = now;

  if (msgEl) msgEl.value = "";
}

/* 渲染消息 */
messagesRef.limitToLast(100).on("child_added", snap => {
  var data = snap.val();
  var chat = document.getElementById("chat");
  if (!chat) return;

  var row = document.createElement("div");
  row.className = "msg";
  row.innerHTML = "<span class='user'>" + data.name + "</span>" + data.message;
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
});

/* 清屏（只有 admin） */
function clearChat(){
  if (!isAdmin) return;
  if (confirm("Clear all messages?")) {
    messagesRef.remove();
  }
}

