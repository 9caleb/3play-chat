let db, ref;
let lastSent = 0;
const COOLDOWN = 30000;
const BAD_WORDS = ["fuck","shit","bitch","asshole","cibai","pukimak"];

function initFirebase() {
  firebase.initializeApp({
    apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
    authDomain: "play-chatbox.firebaseapp.com",
    databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "play-chatbox"
  });
  db = firebase.database();
  ref = db.ref("messages");
}

/* ---------- MOBILE ---------- */
function initMobile() {
  const nameInput = document.getElementById("name");
  const msgInput = document.getElementById("message");
  const sendBtn = document.getElementById("send");

  if (localStorage.getItem("name")) {
    nameInput.value = localStorage.getItem("name");
    nameInput.disabled = true;
  }

  sendBtn.onclick = () => {
    const now = Date.now();
    if (now - lastSent < COOLDOWN) return;

    const name = nameInput.value.trim();
    let msg = msgInput.value.trim();
    if (!name || !msg) return;

    BAD_WORDS.forEach(w=>{
      const r = new RegExp(w,"gi");
      msg = msg.replace(r,"***");
    });

    localStorage.setItem("name", name);
    nameInput.disabled = true;

    ref.push({ name, message: msg });
    msgInput.value = "";
    lastSent = now;
  };
}

/* ---------- ADMIN ---------- */
function initAdmin() {
  const chat = document.getElementById("chat");
  const clear = document.getElementById("clear");

  ref.on("child_added", s=>{
    const d = s.val();
    const div = document.createElement("div");
    div.id = s.key;
    div.innerHTML = `<b>${d.name}</b>: ${d.message}
      <button onclick="ref.child('${s.key}').remove()">✕</button>`;
    chat.appendChild(div);
  });

  ref.on("child_removed", s=>{
    const el = document.getElementById(s.key);
    if (el) el.remove();
  });

  clear.onclick = ()=>ref.remove();
}

/* ---------- SCREEN ---------- */
function initScreen() {
  new QRious({
    element: document.getElementById("qr"),
    size: 260,
    value: location.origin + "/index.html"
  });

  const chat = document.getElementById("chat");
  ref.limitToLast(50).on("child_added", s=>{
    const d = s.val();
    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `<span class="user">${d.name}</span>${d.message}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  });
}

