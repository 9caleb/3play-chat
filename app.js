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

/* FIXED QR FOR GITHUB PAGES */
const baseURL = "https://9caleb.github.io/3play-chat/";
const qr = document.getElementById("qr");
if (qr) {
  new QRious({ element: qr, value: baseURL, size: 280 });
}

/* CHAT */
ref.on("child_added", snap => {
  const m = snap.val();
  const key = snap.key;
  const chat = document.getElementById("chat");
  if (!chat) return;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${m.name}</span>${m.message}
                   ${isAdmin ? `<span class="del" onclick="ref.child('${key}').remove()">✖</span>` : ""}`;
  chat.appendChild(div);
});

/* SEND */
if (!isScreen) {
  document.getElementById("sendBtn").onclick = () => {
    const name = document.getElementById("name").value.trim();
    const msg = document.getElementById("message").value.trim();
    if (!name || !msg) return;
    ref.push({ name, message: msg });
    document.getElementById("message").value = "";
  };
}

/* CLEAR ALL */
if (isAdmin) {
  document.getElementById("clearAll").onclick = () => {
    if (confirm("Clear all messages?")) ref.remove();
  };
}

/* SCREEN HIDE INPUT */
if (isScreen) {
  document.getElementById("inputArea").style.display = "none";
}

/* PROMO */
const promoOverlay = document.getElementById("promoOverlay");
const promoImg = document.getElementById("promoImg");
const promos = ["promo1.jpg","promo2.jpg","promo3.jpg","promo4.jpg"];

if (isScreen) {
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

