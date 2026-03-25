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

/* QR */
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

/* ===== 用户颜色 ===== */
var COLOR_POOL = [
  "#4da6ff", "#6cff9b", "#ffcf4d", "#ff6cf2",
  "#6cffe7", "#ff6c6c", "#b36cff", "#6cffd1",
  "#ffd36c", "#6ca8ff", "#ff9f6c", "#7dff6c"
];
var userColorMap = {};
var colorIndex = 0;

function getUserColor(name) {
  if (name === "ADMIN") return "#ff3b3b";
  if (!userColorMap[name]) {
    userColorMap[name] = COLOR_POOL[colorIndex % COLOR_POOL.length];
    colorIndex++;
  }
  return userColorMap[name];
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

/* ENTER 发送（admin） */
if (isAdmin) {
  document.addEventListener("keydown", function(e){
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

/* SEND */
window.sendMessage = function () {
  if (isScreen) return;

  var now = Date.now();
  if (!isAdmin && now - lastSent < COOLDOWN) {
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
    lastSent = now;
    alert("Message successfully sent!");
  }

  messagesRef.push({ name, message: msg });
  msgInput.value = "";
};

/* 删除单条 */
function deleteMessage(key){
  if (!isAdmin) return;
  messagesRef.child(key).remove();
}

/* ===== CLEAR 按钮（固定位置） ===== */
if (isAdmin) {
  window.addEventListener("load", function () {

    // 防止重复生成
    if (document.querySelector(".clear-btn")) return;

    var left = document.querySelector(".left");
    if (!left) return;

    var btn = document.createElement("button");
    btn.className = "clear-btn";
    btn.innerText = "CLEAR ALL MESSAGES";

    btn.onclick = function () {
      var ok = confirm("Are you sure you want to reset the chatbox?");
      if (!ok) return;
      messagesRef.remove();
    };

    left.appendChild(btn);
  });
}

/* 渲染 */
messagesRef.limitToLast(100).on("child_added", snap => {
  var chat = document.getElementById("chat");
  if (!chat) return;
  if (!isScreen && !isAdmin) return;

  var d = snap.val();
  var key = snap.key;
  var color = getUserColor(d.name);

  var row = document.createElement("div");
  row.className = "msg";
  row.dataset.key = key;

  row.innerHTML =
    "<span class='user' style='color:" + color + "'>" +
    d.name +
    "</span>" +
    d.message +
    (isAdmin
      ? " <span class='del' onclick=\"deleteMessage('" + key + "')\">❌</span>"
      : "");

  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
});

/* 即时移除 */
messagesRef.on("child_removed", snap => {
  var el = document.querySelector(".msg[data-key='" + snap.key + "']");
  if (el) el.remove();
});
