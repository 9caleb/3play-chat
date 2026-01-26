// Firebase
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

// CHAT LISTENER
messagesRef.limitToLast(100).on("child_added", snap => {
  const data = snap.val();
  const chat = document.getElementById("chat");

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="user">${data.name}</span>${data.message}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

// SEND
window.sendMessage = function () {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  if (!name || !message) return;

  messagesRef.push({ name, message

