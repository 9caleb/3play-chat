// ===== FIREBASE =====
firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

const db = firebase.database();
const ref = db.ref("messages");

// ===== MODE =====
const params = new URLSearchParams(window.location.search);
const isScreen = params.has("screen");
const isAdmin  = params.has("admin");

// ===== ELEMENTS =====
const chat      = document.getElementById("chat");
const inputArea = document.getElementById("inputArea");
const nameInput = document.getElementById("name");
const msgInput  = document.getElementById("message");
const sendBtn   = document.getElementById("sendBtn");
const clearBtn  = document.getElementById("clearBtn");
const qr        = document.getElementById("qr");
const layout    = document.querySelector(".layout");

// ===== VISIBILITY RULES（不乱动） =====
if (isScreen && inputArea) inputArea.style.display = "none";
if (!isAdmin && clearBtn) clearBtn.style.display = "none";

// ===== NAME LOCK（一次性） =====
let lockedName = localStorage.getItem("lockedName");
if (lockedName && nameInput) {
  nameInput.value = lockedName;
  nameInput.disabled = true;
  nameInput.placeholder = "Name locked";
} else if (nameInput) {
  nameInput.placeholder = "Enter your name (one time only)";
}

// ===== BAD WORD FILTER =====
const badWords = ["fuck","bitch","cunt","nigger","nigga","pussy","babi","anjing","cibai"];
function hasBadWord(text) {
  const t = text.toLowerCase();
  return badWords.some(w => t.includes(w));
}

// ===== COOLDOWN =====
let lastSend = localStorage.getItem("lastSend") || 0;

// ===== CHAT LISTENER（admin ✕ 保留） =====
ref.limitToLast(200).on("child_added", snap => {
  if (!chat) return;

  const data = snap.val();
  const key  = snap.key;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `
    <span class="user">${data.name}</span>${data.message}
    ${isAdmin ? `<span class="delete" data-id="${key}">✕</span>` : ""}
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

// ===== DELETE SINGLE（admin） =====
document.addEventListener("click", e => {
  if (!isAdmin) return;
  if (e.target.classList.contains("delete")) {
    const id = e.target.dataset.id;
    ref.child(id).remove();
    e.target.parentElement.remove();
  }
});

// ===== SEND MESSAGE =====
if (sendBtn && !isScreen) {
  sendBtn.onclick = () => {
    const now = Date.now();
    const name = nameInput.value.trim();
    const msg  = msgInput.value.trim();

    if (!name || !msg) return alert("Name and message required");

    // lock name
    if (!lockedName) {
      lockedName = name;
      localStorage.setItem("lockedName", name);
      nameInput.disabled = true;
    } else if (name !== lockedName) {
      nameInput.value = lockedName;
      return alert("Name can only be set once");
    }

    // cooldown 30s
    if (now - lastSend < 30000) {
      const wait = Math.ceil((30000 - (now - lastSend)) / 1000);
      return alert(`Please wait ${wait}s`);
    }

    // bad words
    if (hasBadWord(msg)) {
      return alert("Inappropriate words are not allowed");
    }

    ref.push({ name: lockedName, message: msg });
    msgInput.value = "";
    lastSend = now;
    localStorage.setItem("lastSend", now);
  };
}

// ===== CLEAR ALL（admin，逻辑保留） =====
if (clearBtn && isAdmin) {
  clearBtn.onclick = () => {
    if (confirm("Clear all messages?")) {
      ref.remove();
      chat.innerHTML = "";
    }
  };
}

// ===== SCREEN PROMO（最稳版本） =====
if (isScreen) {

  const promoWrap = document.createElement("div");
  promoWrap.style.position = "fixed";
  promoWrap.style.inset = "0";
  promoWrap.style.background = "#000";
  promoWrap.style.display = "none";
  promoWrap.style.zIndex = "9999";
  promoWrap.style.display = "flex";

  promoWrap.innerHTML = `
    <div style="width:50%;display:flex;align-items:center;justify-content:center">
      <img src="dj.jpg" style="max-width:90%;max-height:90%">
    </div>
    <div style="width:50%;display:flex;align-items:center;justify-content:center">
      <img id="promoImg" src="promo1.jpg" style="max-width:90%;max-height:90%">
    </div>
  `;

  document.body.appendChild(promoWrap);

  const promos = ["promo1.jpg","promo2.jpg","promo3.jpg","promo4.jpg"];
  let idx = 0;

  function showPromo() {
    if (qr) qr.style.display = "none";
    layout.style.display = "none";
    promoWrap.style.display = "flex";
    idx = 0;
    document.getElementById("promoImg").src = promos[idx];

    const timer = setInterval(() => {
      idx++;
      if (idx >= promos.length) {
        clearInterval(timer);
        promoWrap.style.display = "none";
        layout.style.display = "flex";
        if (qr) qr.style.display = "block";
      } else {
        document.getElementById("promoImg").src = promos[idx];
      }
    }, 5000);
  }

  setInterval(showPromo, 75000);
}

