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
const isAdmin = params.has("admin");

// ===== ELEMENTS =====
const chat = document.getElementById("chat");
const inputArea = document.getElementById("inputArea");
const nameInput = document.getElementById("name");
const msgInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

// ===== MOBILE NAME LOCK =====
let lockedName = localStorage.getItem("lockedName");
if (lockedName && nameInput) {
  nameInput.value = lockedName;
  nameInput.disabled = true;
  nameInput.placeholder = "Name locked";
}

// ===== BAD WORD FILTER (BASIC) =====
const badWords = [
  "fuck","fuk","shit","bitch","asshole","cunt",
  "nigger","niga","nigga","retard","pussy"
];

function hasBadWord(text) {
  const t = text.toLowerCase();
  return badWords.some(w => t.includes(w));
}

// ===== COOLDOWN (30s) =====
let lastSendTime = localStorage.getItem("lastSendTime") || 0;

// ===== MODE UI CONTROL =====
if (isScreen && inputArea) inputArea.style.display = "none";
if (!isScreen && !isAdmin && chat) chat.style.display = "none";
if (isAdmin) document.getElementById("qr")?.remove();

// ===== CHAT LISTENER =====
ref.limitToLast(200).on("child_added", snap => {
  const data = snap.val();
  const key = snap.key;

  if (!chat) return;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `
    <span class="user">${data.name}</span>${data.message}
    ${isAdmin ? `<span class="delete" data-id="${key}">✕</span>` : ""}
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

// ===== DELETE SINGLE (ADMIN) =====
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
    const msg = msgInput.value.trim();

    if (!name || !msg) return alert("Name and message required");

    // name lock
    if (!lockedName) {
      localStorage.setItem("lockedName", name);
      lockedName = name;
      nameInput.disabled = true;
    } else if (name !== lockedName) {
      nameInput.value = lockedName;
      return alert("Name can only be set once");
    }

    // cooldown
    if (now - lastSendTime < 30000) {
      const wait = Math.ceil((30000 - (now - lastSendTime)) / 1000);
      return alert(`Please wait ${wait}s before sending again`);
    }

    // bad words
    if (hasBadWord(msg)) {
      return alert("Message contains inappropriate words");
    }

    ref.push({ name, message: msg });
    msgInput.value = "";
    lastSendTime = now;
    localStorage.setItem("lastSendTime", now);
  };
}

// ===== CLEAR ALL (ADMIN) =====
if (clearBtn && isAdmin) {
  clearBtn.onclick = () => {
    if (confirm("Clear all messages?")) {
      ref.remove();
      chat.innerHTML = "";
    }
  };
}

// ===== PROMO LOOP (SCREEN ONLY) =====
const promoOverlay = document.getElementById("promoOverlay");
const promoImg = document.getElementById("promoImg");
const promos = ["promo1.jpg","promo2.jpg","promo3.jpg","promo4.jpg"];

if (isScreen && promoOverlay && promoImg) {
  // first run quick so you SEE it
  setTimeout(runPromo, 10000);
  // then normal loop
  setInterval(runPromo, 75000);

  function runPromo() {
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
  }
}

