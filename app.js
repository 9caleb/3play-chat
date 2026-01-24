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

if (isScreen) document.body.classList.add("screen");

/* QR */
const qrCanvas = document.getElementById("qr");
if (qrCanvas && !isAdmin) {
  new QRious({
    element: qrCanvas,
    size: 300,
    value: window.location.origin + window.location.pathname
  });
}

/* CHAT */
const chatBox = document.getElementById("chat");
messagesRef.limitToLast(100).on("child_added", snap => {
  if (!chatBox) return;

  const data = snap.val();
  const key = snap.key;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${data.name}</span>${data.message}`;

  if (isAdmin) {
    const x = document.createElement("button");
    x.textContent = "✕";
    x.onclick = () => messagesRef.child(key).remove();
    div.appendChild(x);
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

messagesRef.on("child_removed", snap => {
  [...document.querySelectorAll(".msg")].forEach(m => {
    if (m.textContent.includes(snap.val().message)) {
      m.remove();
    }
  });
});

/* SEND */
const sendBtn = document.getElementById("sendBtn");
if (sendBtn) {
  const nameInput = document.getElementById("name");
  const msgInput = document.getElementById("message");

  if (localStorage.getItem("lockedName")) {
    nameInput.value = localStorage.getItem("lockedName");
    nameInput.disabled = true;
  }

  sendBtn.onclick = () => {
    const name = nameInput.value.trim();
    const msg = msgInput.value.trim();
    if (!name || !msg) return;

    localStorage.setItem("lockedName", name);
    nameInput.disabled = true;

    messagesRef.push({ name, message: msg });
    msgInput.value = "";
  };
}

/* SCREEN PROMO */
if (isScreen) {
  const promo = document.createElement("div");
  promo.className = "promo-layer";
  promo.innerHTML = `
    <div class="promo-left"></div>
    <div class="promo-right"></div>
  `;
  document.body.appendChild(promo);

  const dj = "dj-poster.jpg";
  const promos = ["promo1.jpg","promo2.jpg","promo3.jpg","promo4.jpg"];
  let i = 0;

  setInterval(() => {
    promo.style.display = "flex";
    document.querySelector(".layout").style.display = "none";

    document.querySelector(".promo-left").style.backgroundImage = `url(${dj})`;
    document.querySelector(".promo-right").style.backgroundImage = `url(${promos[i]})`;

    i = (i + 1) % promos.length;

    setTimeout(() => {
      promo.style.display = "none";
      document.querySelector(".layout").style.display = "flex";
    }, 20000);
  }, 75000);
}

