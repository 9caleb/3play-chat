// ===== FIREBASE =====
firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

var db = firebase.database();
var messagesRef = db.ref("messages");

// ===== MODE =====
var params   = new URLSearchParams(window.location.search);
var isScreen = params.has("screen");
var isAdmin  = params.has("admin");

// 标记 screen（给 CSS 用）
if (isScreen) document.body.classList.add("screen");

// ===== SCREEN 不显示输入 =====
if (isScreen) {
  var ia = document.querySelector(".input-area");
  if (ia) ia.style.display = "none";
}

// ===== QR（只给客人 & screen，admin 不要）=====
if (!isAdmin) {
  window.addEventListener("load", function () {
    var qr = document.getElementById("qr");
    if (!qr) return;

    new QRious({
      element: qr,
      value: window.location.origin + window.location.pathname,
      size: 320
    });
  });
}

// ===== 冷却 & 限制 =====
var COOLDOWN = 15000;
var lastSent = 0;
var MAX_LEN  = 80;

// ===== 脏话过滤 =====
var banned = ["fuck","shit","bitch","asshole","cunt","nigga","retard"];
function hasBadWord(t){
  t = t.toLowerCase();
  return banned.some(w => t.includes(w));
}

// ===== 名字锁定 =====
var nameInput = document.getElementById("name");

if (isAdmin && nameInput) {
  nameInput.value = "ADMIN";
  nameInput.disabled = true;
} else {
  var saved = localStorage.getItem("chat_name");
  if (saved && nameInput) {
    nameInput.value = saved;
    nameInput.disabled = true;
  }
}

// ===== 发送消息 =====
window.sendMessage = function () {
  if (isScreen) return;

  var now = Date.now();
  if (now - lastSent < COOLDOWN) {
    alert("You can only send a message every 15 seconds.");
    return;
  }

  var name = nameInput ? nameInput.value.trim() : "";
  var msg  = document.getElementById("message").value.trim();

  if (!name || !msg) return;
  if (msg.length > MAX_LEN) return;
  if (hasBadWord(msg)) return;

  if (!isAdmin) {
    localStorage.setItem("chat_name", name);
    if (nameInput) nameInput.disabled = true;
  }

  messagesRef.push({
    name: name,
    message: msg,
    time: now
  });

  document.getElementById("message").value = "";
  lastSent = now;

  alert("Message successfully sent!");
};

// ===== 删除单条（admin）=====
function deleteMessage(key){
  if (!isAdmin) return;
  messagesRef.child(key).remove();
}

// ===== 渲染消息 =====
messagesRef.limitToLast(100).on("child_added", snap => {
  var chat = document.getElementById("chat");
  if (!chat) return;

  // 手机端不显示历史
  if (!isScreen && !isAdmin) return;

  var d   = snap.val();
  var key = snap.key;

  var row = document.createElement("div");
  row.className = "msg";

  var html = "<span class='user'>" + d.name + "</span>" + d.message;

  if (isAdmin) {
    html +=
      " <span style='color:#ff4d4d;cursor:pointer;margin-left:10px' " +
      "onclick=\"deleteMessage('" + key + "')\">✕</span>";
  }

  row.innerHTML = html;
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
});

