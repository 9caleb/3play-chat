// ===== FIREBASE =====
firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

const db = firebase.database();
const messagesRef = db.ref("messages");

// ===== MODE =====
const params = new URLSearchParams(window.location.search);
const isScreen = params.has("screen");
const isAdmin = params.has("admin");

// ===== ELEMENTS =====
const layout = document.querySelector(".layout");
const chatBox = document.getElementById("chat");
const qrCanvas = document.getElementById("qr");

// ===== QR =====
if (qrCanvas) {
  new QRious({
    element: qrCanvas,
    size: 320,
    value: window.location.origin + window.location.pathname
  });
}

// ===== CHAT LISTENER =====
messagesRef.limitToLast(100).on("child_added", snap => {
  if (!chatBox) return;

  const data = snap.val();
  const key = snap.key;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${data.name}</span>${data.message}`;

  // admin delete ✕（原本就有，没动）
  if (isAdmin) {
    const del = document.createElement("button");
    del.textContent = "✕";
    del.style.marginLeft = "10px";
    del.onclick = () => messagesRef.child(key).remove();
    div.appendChild(del);
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ===== SEND MESSAGE（原逻辑，不动）=====
const sendBtn = document.getElementById("sendBtn");
if (sendBtn) {
  sendBtn.onclick = () => {
    const nameInput = document.getElementById("name");
    const msgInput = document.getElementById("message");

    const name = nameInput.value.trim();
    const message = msgInput.value.trim();
    if (!name || !message) return;

    messagesRef.push({ name, message });
    msgInput.value = "";
  };
}

// ===== SCREEN PROMO ROTATION =====
if (isScreen) {

  const promos = [
    "dj-poster.jpg",
    "promo1.jpg",
    "promo2.jpg",
    "promo3.jpg",
    "promo4.jpg"
  ];

  let promoIndex = 0;
  let showingPromo = false;

  const promoLayer = document.createElement("div");
  promoLayer.style.position = "fixed";
  promoLayer.style.inset = "0";
  promoLayer.style.backgroundSize = "cover";
  promoLayer.style.backgroundPosition = "center";
  promoLayer.style.display = "none";
  promoLayer.style.zIndex = "999";
  document.body.appendChild(promoLayer);

  function showChat() {
    promoLayer.style.display = "none";
    layout.style.display = "flex";

    // ✅ 关键修复：回到 chat 时一定把 QR 打开
    if (qrCanvas) qrCanvas.style.display = "block";

    showingPromo = false;
  }

  function showPromo() {
    layout.style.display = "none";

    // promo 时隐藏 QR（原本就有）
    if (qrCanvas) qrCanvas.style.display = "none";

    promoLayer.style.backgroundImage =
      `url(${promos[promoIndex]})`;
    promoLayer.style.display = "block";

    promoIndex = (promoIndex + 1) % promos.length;
    showingPromo = true;
  }

  // 75s chat → 20s promo
  setInterval(() => {
    if (!showingPromo) {
      showPromo();
      setTimeout(showChat, 20000);
    }
  }, 75000);

  // promo slide every 5s（原本就会动，你已确认）
  setInterval(() => {
    if (showingPromo) {
      promoLayer.style.backgroundImage =
        `url(${promos[promoIndex]})`;
      promoIndex = (promoIndex + 1) % promos.length;
    }
  }, 5000);
}

