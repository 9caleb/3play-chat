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
const nameInput = document.getElementById("name");
const msgInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

// ===== QR =====
if (qrCanvas) {
  new QRious({
    element: qrCanvas,
    size: 320,
    value: window.location.origin + window.location.pathname
  });
}

// ===== NAME LOCK =====
let lockedName = localStorage.getItem("lockedName");
if (lockedName && nameInput) {
  nameInput.value = lockedName;
  nameInput.disabled = true;
  nameInput.placeholder = "Name locked";
}

// ===== CHAT LISTENER =====
messagesRef.limitToLast(100).on("child_added", snap => {
  if (!chatBox) return;

  const data = snap.val();
  const key = snap.key;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${data.name}</span>${data.message}`;

  if (isAdmin) {
    const del = document.createElement("span");
    del.textContent = " ✕";
    del.style.color = "red";
    del.style.cursor = "pointer";
    del.onclick = () => messagesRef.child(key).remove();
    div.appendChild(del);
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ===== SEND MESSAGE =====
if (sendBtn && !isScreen) {
  sendBtn.onclick = () => {
    const name = nameInput.value.trim();
    const message = msgInput.value.trim();
    if (!name || !message) return;

    if (!lockedName) {
      lockedName = name;
      localStorage.setItem("lockedName", name);
      nameInput.disabled = true;
    } else if (name !== lockedName) {
      nameInput.value = lockedName;
      return alert("Name can only be set once");
    }

    messagesRef.push({ name: lockedName, message });
    msgInput.value = "";
  };
}

// ===== SCREEN PROMO ROTATION（原逻辑保留） =====
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
    if (qrCanvas) qrCanvas.style.display = "block";
    showingPromo = false;
  }

  function showPromo() {
    layout.style.display = "none";
    if (qrCanvas) qrCanvas.style.display = "none";
    promoLayer.style.backgroundImage = `url(${promos[promoIndex]})`;
    promoLayer.style.display = "block";
    promoIndex = (promoIndex + 1) % promos.length;
    showingPromo = true;
  }

  setInterval(() => {
    if (!showingPromo) {
      showPromo();
      setTimeout(showChat, 20000);
    }
  }, 75000);

  setInterval(() => {
    if (showingPromo) {
      promoLayer.style.backgroundImage = `url(${promos[promoIndex]})`;
      promoIndex = (promoIndex + 1) % promos.length;
    }
  }, 5000);
}

