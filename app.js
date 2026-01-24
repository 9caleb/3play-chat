// ===== FIREBASE =====
firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

const db = firebase.database();
const messagesRef = db.ref("messages");

// ===== MODE DETECTION =====
const params = new URLSearchParams(window.location.search);
const isScreen = params.has("screen");
const isAdmin = params.has("admin");

// ===== FIXED MOBILE ENTRY URL (GITHUB PAGES) =====
const MOBILE_URL = "https://9caleb.github.io/3play-chat/";

// ===== QR GENERATION (SCREEN ONLY) =====
const qrCanvas = document.getElementById("qr");
if (qrCanvas && isScreen) {
  new QRious({
    element: qrCanvas,
    value: MOBILE_URL,
    size: 360
  });
}

// ===== UI MODE CONTROL =====
const inputArea = document.getElementById("inputArea");
const chatBox = document.getElementById("chat");

// Screen: no input
if (isScreen && inputArea) {
  inputArea.style.display = "none";
}

// Mobile: no chat
if (!isScreen && !isAdmin && chatBox && window.innerWidth < 900) {
  chatBox.style.display = "none";
}

// Admin: no QR
if (isAdmin && qrCanvas) {
  qrCanvas.remove();
}

// ===== CHAT LISTENER =====
messagesRef.limitToLast(200).on("child_added", snap => {
  const data = snap.val();
  const key = snap.key;

  if (!chatBox) return;

  const div = document.createElement("div");
  div.className = "msg";

  div.innerHTML = `
    <span class="user">${data.name}</span>${data.message}
    ${isAdmin ? `<span class="delete" data-id="${key}">✕</span>` : ""}
  `;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ===== DELETE SINGLE (ADMIN) =====
document.addEventListener("click", e => {
  if (!isAdmin) return;
  if (e.target.classList.contains("delete")) {
    const id = e.target.dataset.id;
    messagesRef.child(id).remove();
    e.target.parentElement.remove();
  }
});

// ===== SEND MESSAGE =====
const sendBtn = document.getElementById("sendBtn");
if (sendBtn && !isScreen) {
  sendBtn.addEventListener("click", () => {
    const name = document.getElementById("name")?.value.trim();
    const msg = document.getElementById("message")?.value.trim();
    if (!name || !msg) return;
    messagesRef.push({ name, message: msg });
    document.getElementById("message").value = "";
  });
}

// ===== CLEAR ALL (ADMIN) =====
const clearBtn = document.getElementById("clearBtn");
if (clearBtn && isAdmin) {
  clearBtn.addEventListener("click", () => {
    if (confirm("Clear all messages?")) {
      messagesRef.remove();
      if (chatBox) chatBox.innerHTML = "";
    }
  });
}

