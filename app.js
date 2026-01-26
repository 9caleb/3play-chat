firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

var db = firebase.database();
var messagesRef = db.ref("messages");

var params   = new URLSearchParams(window.location.search);
var isScreen = params.has("screen");
var isAdmin  = params.has("admin");

if (isScreen) document.body.classList.add("screen");
if (isAdmin)  document.body.classList.add("admin");

/* screen 不显示输入 */
if (isScreen) {
  var ia = document.querySelector(".input-area");
  if (ia) ia.style.display = "none";
}

/* ===== QR：只给 screen ===== */
if (isScreen) {
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

/* 冷却 */
var COOLDOWN = 15000;
var lastSent = 0;

/* 脏话 */
var banned = ["fuck","shit","bitch","asshole","cunt","nigga","retard"];
function hasBadWord(t){
  return banned.some(w => t.toLowerCase().includes(w));
}

/* 名字 */
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

window.sendMessage = function () {
  if (isScreen) return;

  var now = Date.now();
  if (now - lastSent < COOLDOWN) {
    alert("You can only send a message every 15 seconds.");
    return;
  }

  var msgInput = document.getElementById("message");
  var msg = msgInput.value.trim();
  var name = nameInput.value.trim();
  if (!name || !msg) return;
  if (hasBadWord(msg)) return;

  if (!isAdmin) {
    localStorage.setItem("chat_name", name);
    nameInput.disabled = true;
  }

  messagesRef.push({ name, message: msg });
  msgInput.value = "";
  lastSent = now;

  alert("Message successfully sent!");
};

/* 删除（admin） */
function deleteMessage(key){
  if (!isAdmin) return;
  messagesRef.child(key).remove();
}

/* 新消息 */
messagesRef.limitToLast(100).on("child_added", snap => {
  var chat = document.getElementById("chat");
  if (!chat) return;
  if (!isScreen && !isAdmin) return; // 手机不显示历史

  var d = snap.val();
  var key = snap.key;

  var row = document.createElement("div");
  row.className = "msg";
  row.dataset.key = key;

  row.innerHTML =
    "<span class='user'>" + d.name + "</span>" +
    d.message +
    (isAdmin ? " <span class='del' onclick=\"deleteMessage('" + key + "')\">✕</span>" : "");

  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
});

/* 删除即时反映 */
messagesRef.on("child_removed", snap => {
  var el = document.querySelector(".msg[data-key='" + snap.key + "']");
  if (el) el.remove();
});

