firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

const db = firebase.database();
const ref = db.ref("messages");

const params = new URLSearchParams(window.location.search);
const isScreen = params.has("screen");
const isAdmin = params.has("admin");

// QR FIX FOR GITHUB PAGES
const qr = document.getElementById("qr");
if (qr) {
  new QRious({
    element: qr,
    value: window.location.href.split("?")[0],
    size: 280
  });
}

// CHAT LISTENER
ref.limitToLast(100).on("child_added", snap => {
  const m = snap.val();
  const key = snap.key;

  const chat = document.getElementById("chat");
  if (chat) {
    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `<span class="user">${m.name}</span>${m.message}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  if (isAdmin) {
    const adminChat = document.getElementById("adminChat");
    const row = document.createElement("div");
    row.className = "admin-msg";
    row.innerHTML = `${m.name}: ${m.message} <button onclick="ref.child('${key}').remove()">X</button>`;
    adminChat.appendChild(row);
  }
});

// SEND
const sendBtn = document.getElementById("sendBtn");
if (sendBtn && !isScreen) {
  sendBtn.onclick = () => {
    const name = document.getElementById("name").value.trim();
    const msg = document.getElementById("message").value.trim();
    if (!name || !msg) return;
    ref.push({ name, message: msg });
    document.getElementById("message").value = "";
  };
}

// SCREEN HIDE INPUT
if (isScreen) {
  const input = document.getElementById("inputArea");
  if (input) input.style.display = "none";
}

// PROMO LOOP (SCREEN)
const promoOverlay = document.getElementById("promoOverlay");
const promoImg = document.getElementById("promoImg");
const promos = ["promo1.jpg", "promo2.jpg", "promo3.jpg", "promo4.jpg"];

if (isScreen && promoOverlay && promoImg) {
  setInterval(() => {
    let i = 0;
    promoOverlay.classList.add("active");
    promoImg.src = promos[i];

    const t = setInterval(() => {
      i++;
      if (i >= promos.length) {
        clearInterval(t);
        promoOverlay.classList.remove("active");
      } else {
        promoImg.src = promos[i];
      }
    }, 5000);

  }, 75000);
}

// ADMIN
if (isAdmin) {
  document.getElementById("adminPanel").style.display = "block";
  document.getElementById("clearAll").onclick = () => {
    if (confirm("Clear all messages?")) ref.remove();
  };
}

