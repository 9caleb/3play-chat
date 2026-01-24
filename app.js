firebase.initializeApp({
  apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
  authDomain: "play-chatbox.firebaseapp.com",
  databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "play-chatbox"
});

const db = firebase.database();
const messagesRef = db.ref("messages");

const params = new URLSearchParams(location.search);
const isAdmin = params.has("admin");
const isScreen = params.has("screen");

/* QR */
const qr = document.getElementById("qr");
if (qr && !isAdmin) {
  new QRious({
    element: qr,
    size: 300,
    value: location.origin + location.pathname
  });
}

/* CHAT */
const chat = document.getElementById("chat");
messagesRef.on("child_added", snap => {
  if (!chat) return;

  const d = snap.val();
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${d.name}</span>${d.message}`;

  if (isAdmin) {
    const x = document.createElement("button");
    x.textContent = "✕";
    x.onclick = () => messagesRef.child(snap.key).remove();
    div.appendChild(x);
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

messagesRef.on("child_removed", snap => {
  if (!chat) return;
  [...chat.children].forEach(el => {
    if (el.textContent.includes(snap.val().message)) {
      el.remove();
    }
  });
});

/* SEND */
const nameInput = document.getElementById("name");
const msgInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

if (localStorage.getItem("lockedName")) {
  nameInput.value = localStorage.getItem("lockedName");
  nameInput.disabled = true;
}

sendBtn.onclick = () => {
  if (!nameInput.value || !msgInput.value) return;

  localStorage.setItem("lockedName", nameInput.value);
  nameInput.disabled = true;

  messagesRef.push({
    name: nameInput.value,
    message: msgInput.value
  });

  msgInput.value = "";
};

/* CLEAR ALL (ADMIN ONLY) */
if (isAdmin) {
  const clearBtn = document.getElementById("clearBtn");
  clearBtn.style.display = "block";
  clearBtn.onclick = () => messagesRef.remove();
}

/* SCREEN PROMO */
if (isScreen) {
  document.querySelector(".input-area").style.display = "none";

  const promo = document.getElementById("screenPromo");
  const dj = promo.querySelector(".promo-dj");
  const img = promo.querySelector(".promo-img");

  const promos = ["promo1.jpg","promo2.jpg","promo3.jpg","promo4.jpg"];
  let i = 0;

  function showPromo() {
    promo.style.display = "flex";
    dj.style.backgroundImage = "url(dj-poster.jpg)";
    img.style.backgroundImage = `url(${promos[i]})`;
    i = (i + 1) % promos.length;

    setTimeout(() => {
      promo.style.display = "none";
    }, 20000);
  }

  setInterval(showPromo, 75000);
  showPromo();
}

