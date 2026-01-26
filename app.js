firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

var db = firebase.database();
var messagesRef = db.ref("messages");

var params = new URLSearchParams(window.location.search);
var isScreen = params.has("screen");
var isAdmin  = params.has("admin");

/* screen 不显示输入 */
if (isScreen) {
  var ia = document.querySelector(".input-area");
  if (ia) ia.style.display = "none";
}

/* QR */
if (!isAdmin && !isScreen) {
  new QRious({
    element: document.getElementById("qr"),
    value: window.location.origin + window.location.pathname,
    size: 320
  });
}

/* 冷却 */
var COOLDOWN = 15000;
var lastSent = 0;

/* 脏话 */
var banned = ["fuck","shit","bitch","asshole","cunt","nigger","retard"];
function hasBadWord(t){
  t = t.toLowerCase();
  return banned.some(w => t.includes(w));
}

/* 名字锁定 */
var nameInput = document.getElementById("name");
var saved = localStorage.getItem("chat_name");
if (saved && nameInput) {
  nameInput.value = saved;
  nameInput.disabled = true;
}

function sendMessage(){
  if (isScreen) return;

  var now = Date.now();
  if (now - lastSent < COOLDOWN) {
    alert("You can only send a message every 15 seconds.");
    return;
  }

  var name = nameInput.value.trim();
  var msg  = document.getElementById("message").value.trim();
  if (!name || !msg) return;
  if (hasBadWord(msg)) return;

  localStorage.setItem("chat_name", name);
  nameInput.disabled = true;

  messagesRef.push({ name: name, message: msg });
  document.getElementById("message").value = "";
  lastSent = now;

  alert("Message successfully sent!");
}

/* render（screen / admin 用） */
messagesRef.limitToLast(100).on("child_added", snap => {
  var chat = document.getElementById("chat");
  if (!chat) return;

  var d = snap.val();
  var row = document.createElement("div");
  row.className = "msg";
  row.innerHTML = "<span class='user'>" + d.name + "</span>" + d.message;
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
});

