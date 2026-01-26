var firebaseConfig = {
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
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

/* QR */
var qrEl = document.getElementById("qr");
if (qrEl && !isAdmin) {
  new QRious({
    element: qrEl,
    value: location.href.split("?")[0],
    size: 320
  });
}

/* 冷却 */
var lastSent = 0;
var COOLDOWN = 15000;

/* 锁名字 */
var nameInput = document.getElementById("name");
if (nameInput) {
  var savedName = localStorage.getItem("chat_name");
  if (savedName) {
    nameInput.value = savedName;
    nameInput.disabled = true;
  }
}

/* 发送 */
function sendMessage(){
  if (isScreen && !isAdmin) return;

  var now = Date.now();
  if (now - lastSent < COOLDOWN) {
    alert("You can only send a message every 15 seconds.");
    return;
  }

  var name = isAdmin ? "ADMIN" : nameInput.value.trim();
  var msgEl = document.getElementById("message");
  var msg = msgEl.value.trim();

  if (!name || !msg) return;

  localStorage.setItem("chat_name", name);
  if (nameInput) nameInput.disabled = true;

  messagesRef.push({ name: name, message: msg, time: now });
  lastSent = now;
  msgEl.value = "";

  alert("Message successfully sent!");
}

/* 渲染（admin + screen） */
messagesRef.limitToLast(100).on("child_added", snap => {
  if (!isAdmin && !isScreen) return;

  var data = snap.val();
  var chat = document.getElementById("chat");
  if (!chat) return;

  var row = document.createElement("div");
  row.className = "msg";
  row.innerHTML = "<span class='user'>" + data.name + "</span>" + data.message;
  chat.appendChild(row);
});

/* 清屏 */
function clearChat(){
  if (!isAdmin) return;
  if (confirm("Clear all messages?")) {
    messagesRef.remove();
  }
}

