firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

const db = firebase.database();
const ref = db.ref("messages");

const params = new URLSearchParams(location.search);
const isAdmin = params.has("admin");
const isScreen = params.has("screen");

/* QR */
const qr = document.getElementById("qr");
if (qr && !isAdmin && !isScreen) {
  new QRious({
    element: qr,
    size: 300,
    value: location.origin + location.pathname
  });
}

/* CHAT */
const chat = document.getElementById("chat");
ref.on("child_added", s => {
  if (!chat) return;
  const d = s.val();
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${d.name}</span>${d.message}`;

  if (isAdmin) {
    const x = document.createElement("button");
    x.textContent = "✕";
    x.onclick = () => ref.child(s.key).remove();
    div.appendChild(x);
  }

  chat.appendChild(div);
});

ref.on("child_removed", s => {
  [...document.querySelectorAll(".msg")].forEach(m => {
    if (m.textContent.includes(s.val().message)) m.remove();
  });
});

/* SEND */
const nameInput = document.getElementById("name");
const msgInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

if (localStorage.getItem("name")) {
  nameInput.value = localStorage.getItem("name");
  nameInput.disabled = true;
}

sendBtn.onclick = () => {
  if (!nameInput.value || !msgInput.value) return;
  localStorage.setItem("name", nameInput.value);
  nameInput.disabled = true;
  ref.push({ name: nameInput.value, message: msgInput.value });
  msgInput.value = "";
};

/* CLEAR ALL */
if (isAdmin) {
  const clearBtn = document.getElementById("clearBtn");
  clearBtn.style.display = "block";
  clearBtn.onclick = () => ref.remove();
}

/* SCREEN PROMO */
if (isScreen) {
  document.querySelector(".input-area").style.display = "none";

  const promo = document.getElementById("promo");
  const left = document.querySelector(".promo-left");
  const right = document.querySelector(".promo-right");

  const promos = ["promo1.jpg","promo2.jpg","promo3.jpg","promo4.jpg"];
  let i = 0;

  setInterval(() => {
    promo.style.display = "flex";
    left.style.backgroundImage = "url(dj-poster.jpg)";
    right.style.backgroundImage = `url(${promos[i]})`;
    i = (i + 1) % promos.length;

    setTimeout(() => {
      promo.style.display = "none";
    }, 20000);
  }, 75000);
}

