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

const chatBox = document.getElementById("chat");
const nameInput = document.getElementById("name");
const msgInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

if (document.getElementById("qr")) {
  new QRious({
    element: document.getElementById("qr"),
    size: 300,
    value: window.location.origin + window.location.pathname
  });
}

/* NAME LOCK */
if (localStorage.getItem("lockedName")) {
  nameInput.value = localStorage.getItem("lockedName");
  nameInput.disabled = true;
}

/* CHAT LISTENER */
messagesRef.limitToLast(100).on("child_added", snap => {
  if (!chatBox) return;

  const data = snap.val();
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${data.name}</span>${data.message}`;

  if (isAdmin) {
    const x = document.createElement("button");
    x.textContent = "✕";
    x.onclick = () => messagesRef.child(snap.key).remove();
    div.appendChild(x);
  }

  chatBox.appendChild(div);
});

/* REMOVE LIVE */
messagesRef.on("child_removed", snap => {
  [...chatBox.children].forEach(el => {
    if (el.innerHTML.includes(snap.val().message)) {
      el.remove();
    }
  });
});

/* SEND */
sendBtn.onclick = () => {
  if (nameInput.disabled === false) {
    localStorage.setItem("lockedName", nameInput.value);
    nameInput.disabled = true;
  }

  messagesRef.push({
    name: nameInput.value,
    message: msgInput.value
  });

  msgInput.value = "";
};

/* ADMIN CLEAR ALL */
if (isAdmin) {
  clearBtn.style.display = "block";
  clearBtn.onclick = () => messagesRef.remove();
}

/* SCREEN PROMO */
if (isScreen) {
  document.querySelector(".layout").style.display = "none";
  const promo = document.getElementById("promo-screen");
  promo.style.display = "flex";

  const posters = [
    ["dj-poster.jpg", "promo1.jpg"],
    ["dj-poster.jpg", "promo2.jpg"],
    ["dj-poster.jpg", "promo3.jpg"],
    ["dj-poster.jpg", "promo4.jpg"]
  ];

  let i = 0;
  setInterval(() => {
    document.querySelector(".promo-left").style.backgroundImage = `url(${posters[i][0]})`;
    document.querySelector(".promo-right").style.backgroundImage = `url(${posters[i][1]})`;
    i = (i + 1) % posters.length;
  }, 5000);
}

