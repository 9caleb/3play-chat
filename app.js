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
const layout   = document.querySelector(".layout");
const chatBox  = document.getElementById("chat");
const qrCanvas = document.getElementById("qr");

// ===== CHAT LISTENER =====
messagesRef.limitToLast(100).on("child_added", snap => {
  if (!chatBox) return;
  const data = snap.val();

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${data.name}</span>${data.message}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ===== SCREEN LOGIC ONLY =====
if (isScreen) {

  /* ---------- PROMO CONTAINER (左右无缝) ---------- */
  const promoWrap = document.createElement("div");
  promoWrap.id = "promoWrap";
  promoWrap.style.position = "fixed";
  promoWrap.style.inset = "0";
  promoWrap.style.display = "none";
  promoWrap.style.zIndex = "9999";
  promoWrap.style.background = "#000";
  promoWrap.style.display = "flex";
  promoWrap.style.gap = "0";           // 关键：没有黑线
  promoWrap.style.margin = "0";
  promoWrap.style.padding = "0";

  promoWrap.innerHTML = `
    <img id="djImg" style="width:50%;height:100%;object-fit:cover" src="dj.jpg">
    <img id="promoImg" style="width:50%;height:100%;object-fit:cover" src="promo1.jpg">
  `;

  document.body.appendChild(promoWrap);

  const promoImgs = ["promo1.jpg","promo2.jpg","promo3.jpg","promo4.jpg"];
  let promoIndex = 0;
  let promoTimer = null;

  /* ---------- 显示 CHAT ---------- */
  function showChat() {
    promoWrap.style.display = "none";
    layout.style.display = "flex";
    if (qrCanvas) qrCanvas.style.display = "block";
    if (promoTimer) {
      clearInterval(promoTimer);
      promoTimer = null;
    }
  }

  /* ---------- 显示 PROMO ---------- */
  function showPromo() {
    layout.style.display = "none";
    if (qrCanvas) qrCanvas.style.display = "none";
    promoWrap.style.display = "flex";

    promoIndex = 0;
    document.getElementById("promoImg").src = promoImgs[promoIndex];

    promoTimer = setInterval(() => {
      promoIndex++;
      if (promoIndex >= promoImgs.length) {
        clearInterval(promoTimer);
        promoTimer = null;
        showChat();
      } else {
        document.getElementById("promoImg").src = promoImgs[promoIndex];
      }
    }, 5000);
  }

  /* ---------- 时间控制 ---------- */
  // 75 秒 chat → 20 秒 promo（4 张 × 5 秒）
  setInterval(showPromo, 75000);
}

