let db, ref;
const BAD = ["fuck","shit","babi","anjing","cibai"];
const COOLDOWN = 30000;
let lastSent = 0;

function initFirebase(){
  firebase.initializeApp({
    apiKey: "AIzaSyBMoeGpRpLb8Ooh47WIlKCrCPC7ocZ2ZUo",
    authDomain: "play-chatbox.firebaseapp.com",
    databaseURL: "https://play-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "play-chatbox"
  });
  db = firebase.database();
  ref = db.ref("messages");
}

function listen(render){
  ref.limitToLast(100).on("child_added", s=>render(s.key, s.val()));
  ref.on("child_removed", s=>{
    const el=document.getElementById(s.key);
    if(el) el.remove();
  });
}

function filterMsg(m){
  let x=m;
  BAD.forEach(w=>x=x.replace(new RegExp(w,"gi"),"***"));
  return x;
}

/* SCREEN */
function initScreen(){
  new QRious({
    element: document.getElementById("qr"),
    size: 300,
    value: location.origin + "/index.html"
  });
  const chat=document.getElementById("chat");
  listen((k,d)=>{
    const div=document.createElement("div");
    div.className="msg";
    div.id=k;
    div.innerHTML=`<span class="user">${d.name}</span>${d.message}`;
    chat.appendChild(div);
    chat.scrollTop=chat.scrollHeight;
  });
}

/* ADMIN */
function initAdmin(){
  const chat=document.getElementById("chat");
  const send=document.getElementById("sendBtn");
  const clear=document.getElementById("clearBtn");
  const msg=document.getElementById("message");

  listen((k,d)=>{
    const div=document.createElement("div");
    div.className="msg";
    div.id=k;
    div.innerHTML=`<span class="user">${d.name}</span>${d.message}
      <button class="x">❌</button>`;
    div.querySelector(".x").onclick=()=>ref.child(k).remove();
    chat.appendChild(div);
  });

  send.onclick=()=>{
    if(!msg.value.trim()) return;
    ref.push({name:"ADMIN", message:filterMsg(msg.value.trim())});
    msg.value="";
  };

  clear.onclick=()=>{
    if(confirm("Are you sure to delete all the messages and reset?")){
      ref.remove();
    }
  };
}

/* MOBILE */
function initMobile(){
  const name=document.getElementById("name");
  const msg=document.getElementById("message");
  const send=document.getElementById("sendBtn");

  if(localStorage.name){
    name.value=localStorage.name;
    name.disabled=true;
  }

  send.onclick=()=>{
    if(!name.value||!msg.value) return;
    if(Date.now()-lastSent<COOLDOWN) return;

    localStorage.name=name.value;
    name.disabled=true;

    ref.push({name:name.value, message:filterMsg(msg.value)});
    msg.value="";
    lastSent=Date.now();
  };
}

