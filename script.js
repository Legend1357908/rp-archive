let characters = [];
let lockedCharacter = null;

const results = document.getElementById("results");
const search = document.getElementById("search");
const overlay = document.getElementById("lockOverlay");
const lockName = document.getElementById("lockName");
const lockInput = document.getElementById("lockInput");
const lockError = document.querySelector(".lock-error");

/* ===== INTRO VARIANTS ===== */
const introVariants = [
  [
    "You made your way to the archives...",
    "",
    "Somehow.",
    "",
    "I suppose we all have our ways.",
    "",
    "Be careful what you search for."
  ],
  [
    "The doors were never locked.",
    "",
    "They only waited.",
    "",
    "You step inside anyway."
  ],
  [
    "Dust stirs as you enter.",
    "",
    "These records were not meant for you.",
    "",
    "Yet here you stand."
  ],
  [
    "The candles are still warm.",
    "",
    "Someone was here before you."
  ],
  [
    "You were not summoned.",
    "",
    "You arrived.",
    "",
    "That distinction matters."
  ]
];

const introLines = introVariants[Math.floor(Math.random() * introVariants.length)];
const boot = document.getElementById("boot");
const bootText = document.getElementById("bootText");

let line = 0;
let char = 0;

function typeIntro() {
  if (line >= introLines.length) {
    setTimeout(() => {
      boot.style.opacity = "0";
      setTimeout(() => boot.remove(), 800);
    }, 1200);
    return;
  }
  if (char < introLines[line].length) {
    bootText.textContent += introLines[line][char++];
    setTimeout(typeIntro, 35);
  } else {
    bootText.textContent += "\n";
    line++; char = 0;
    setTimeout(typeIntro, 400);
  }
}

typeIntro();

/* ===== DATA ===== */
fetch("characters.json")
  .then(r => r.json())
  .then(d => characters = d);

/* ===== HELPERS ===== */
function redact(t){
  return t.replace(/\[REDACTED\]/g,'<span class="redacted">██████</span>');
}

/* ===== RENDER ===== */
function render(q=""){
  results.innerHTML="";
  characters
    .filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    .forEach(c=>{
      const card=document.createElement("div");
      card.className="result-card";

      const ribbon = c.status==="SEALED"
        ? `<div class="sealed-ribbon">FILE SEALED</div>` : "";

      card.innerHTML=`
        <div class="archive-header">
          <span>${c.archiveId}</span>
          <span class="status-${c.status}">${c.status}</span>
        </div>
        ${ribbon}
        <div class="result-name">${c.name}</div>
        <div class="result-meta">${c.meta}</div>
        <div class="result-summary">${redact(c.summary)}</div>
      `;

      card.onclick=()=>{
        if(c.status==="SEALED"){
          lockedCharacter=c;
          lockName.textContent=c.name;
          lockInput.value="";
          lockError.style.display="none";
          overlay.style.display="flex";
          lockInput.focus();
        } else {
          setTimeout(()=>location.href=`character.html?id=${c.id}`,250);
        }
      };

      results.appendChild(card);
    });
}

search.oninput=()=>render(search.value);

/* ===== LOCK ===== */
lockInput.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&lockedCharacter){
    if(lockInput.value===lockedCharacter.lockCode){
      overlay.style.display="none";
      location.href=`character.html?id=${lockedCharacter.id}`;
    } else {
      lockError.style.display="block";
      lockInput.value="";
    }
  }
});

overlay.onclick=e=>{
  if(e.target===overlay){
    overlay.style.display="none";
    lockedCharacter=null;
  }
};
