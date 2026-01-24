// ===== FIREBASE =====
firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

const db = firebase.database();
const messagesRef = db.ref("messages");

// ===== SCREEN CHECK =====
const params = new URLSearchParams(window.location.search);
const isScreen = params.has("screen");

// ===== QR =====
const qrCanvas = document.getElementById("qr");
if (qrCanvas) {
  new QRious({
    element: qrCanvas,
    value: window.location.origin,
    size: 280
  });
}

// ===== CHAT =====
messagesRef.limitToLast(100).on("child_added", snap => {
  const data = snap.val();
  const chat = document.getElementById("chat");
  if (!chat) return;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${data.name}</span>${data.message}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

// ===== SEND =====
const sendBtn = document.getElementById("sendBtn");
if (sendBtn) {
  sendBtn.onclick = () => {
    const name = document.getElementById("name").value.trim();
    const message = document.getElementById("message").value.trim();
    if (!name || !message) return;

    messagesRef.push({ name, message });
    document.getElementById("message").value = "";
  };
}

// ===== PROMO LOOP (SCREEN ONLY) =====
const promoOverlay = document.getElementById("promoOverlay");
const promoImg = document.getElementById("promoImg");
const promos = ["promo1.jpg", "promo2.jpg", "promo3.jpg", "promo4.jpg"];

if (isScreen && promoOverlay && promoImg) {
  setInterval(() => {
    let index = 0;
    promoImg.src = promos[index];
    promoOverlay.classList.add("active");

    const timer = setInterval(() => {
      index++;
      if (index >= promos.length) {
        clearInterval(timer);
        promoOverlay.classList.remove("active");
      } else {
        promoImg.src = promos[index];
      }
    }, 5000);

  }, 75000);
}

