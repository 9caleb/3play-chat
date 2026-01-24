firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

const db = firebase.database();
const messagesRef = db.ref("messages");

const params = new URLSearchParams(window.location.search);
const isScreen = params.has("screen");
const isAdmin = params.has("admin");

const qrCanvas = document.getElementById("qr");
if (qrCanvas && !isAdmin) {
  new QRious({
    element: qrCanvas,
    value: window.location.origin,
    size: 360
  });
}

/* MODE DISPLAY CONTROL */
if (isScreen) {
  document.getElementById("inputArea").style.display = "none";
}

if (!isAdmin && !isScreen && window.innerWidth < 900) {
  document.getElementById("chat").style.display = "none";
}

if (isAdmin) {
  document.getElementById("qr")?.remove();
}

/* CHAT LISTENER */
messagesRef.limitToLast(200).on("child_added", snap => {
  const data = snap.val();
  const chat = document.getElementById("chat");
  if (!chat) return;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `
    <span class="user">${data.name}</span>${data.message}
    ${isAdmin ? `<span class="delete" data-id="${snap.key}">✕</span>` : ``}
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

/* DELETE SINGLE */
document.addEventListener("click", e => {
  if (e.target.classList.contains("delete")) {
    const id = e.target.dataset.id;
    messagesRef.child(id).remove();
    e.target.parentElement.remove();
  }
});

/* SEND */
document.getElementById("sendBtn")?.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const msg = document.getElementById("message").value.trim();
  if (!name || !msg) return;
  messagesRef.push({ name, message: msg });
  document.getElementById("message").value = "";
});

/* CLEAR ALL */
document.getElementById("clearBtn")?.addEventListener("click", () => {
  if (!isAdmin) return;
  messagesRef.remove();
  document.getElementById("chat").innerHTML = "";
});

