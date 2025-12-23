let characters = [];
let lockedCharacter = null;

const results = document.getElementById("results");
const search = document.getElementById("search");
const overlay = document.getElementById("lockOverlay");
const lockName = document.getElementById("lockName");
const lockInput = document.getElementById("lockInput");
const lockError = document.querySelector(".lock-error");

// LOAD DATA
fetch("characters.json")
  .then(r => r.json())
  .then(d => characters = d);

// REDACTION
function redact(text){
  return text.replace(/\[REDACTED\]/g,'<span class="redacted">██████</span>');
}

// RENDER
function render(query=""){
  results.innerHTML = "";
  characters
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    .forEach(c => {
      const card = document.createElement("div");
      card.className = "result-card";

      let ribbon = c.status==="SEALED" ? `<div class="sealed-ribbon">FILE SEALED</div>` : "";

      card.innerHTML = `
        <div class="archive-header">
          <span>${c.archiveId}</span>
          <span class="status-${c.status}">${c.status}</span>
        </div>
        ${ribbon}
        <div class="result-name">${c.name}</div>
        <div class="result-meta">${c.meta}</div>
        <div class="result-summary">${redact(c.summary)}</div>
      `;

      card.onclick = () => {
        if(c.status==="SEALED"){
          lockedCharacter = c;
          lockName.textContent = c.name;
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

search.oninput = () => render(search.value);

// LOCK
lockInput.addEventListener("keydown", e => {
  if(e.key==="Enter" && lockedCharacter){
    if(lockInput.value===lockedCharacter.lockCode){
      overlay.style.display="none";
      location.href=`character.html?id=${lockedCharacter.id}`;
    } else {
      lockError.style.display="block";
      lockInput.value="";
    }
  }
});

overlay.onclick = e => {
  if(e.target===overlay){
    overlay.style.display="none";
    lockedCharacter=null;
  }
};

setTimeout(()=>document.getElementById("boot").remove(),2200);
