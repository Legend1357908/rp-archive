let characters = [];
let lockedCharacter = null;

// FETCH CHARACTER DATA
fetch("characters.json")
  .then(r => r.json())
  .then(data => characters = data)
  .catch(err => console.error("Failed to load characters.json:", err));

// ELEMENTS
const results = document.getElementById("results");
const search = document.getElementById("search");

const overlay = document.getElementById("lockOverlay");
const lockName = document.getElementById("lockName");
const lockInput = document.getElementById("lockInput");
const lockError = document.querySelector(".lock-error");

// REDACTION HELPER
function redact(text) {
  if(!text) return '';
  return text.replace(/\[REDACTED\]/g,'<span class="redacted">██████</span>');
}

// RENDER SEARCH RESULTS
function renderResults(query) {
  results.innerHTML = '';
  if(!characters.length) return;

  const filtered = characters.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  if(filtered.length === 0) {
    results.innerHTML = '<div class="no-results">No matching records found.</div>';
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement("div");
    card.className = "result-card";

    // ribbon if SEALED
    let ribbonHTML = '';
    if(c.status === "SEALED"){
      ribbonHTML = '<span class="sealed-ribbon">FILE SEALED</span>';
    }

    card.innerHTML = `
      <div class="archive-header">
        <span>${c.archiveId}</span>
        <span class="status-${c.status}">${c.status}</span>
      </div>
      ${ribbonHTML}
      <div class="result-name">${c.name}</div>
      <div class="result-meta">${c.meta}</div>
      <div class="result-summary">${redact(c.summary)}</div>
    `;

    card.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if(c.status === "SEALED") {
        lockedCharacter = c;
        lockName.textContent = c.name;
        lockInput.value = "";
        lockError.style.display = "none";
        overlay.style.display = "flex";
        lockInput.focus();
      } else {
        window.location.href = `character.html?id=${c.id}`;
      }
    };

    results.appendChild(card);
  });
}

// SEARCH INPUT
search.addEventListener("input", () => {
  renderResults(search.value);
});

// LOCK INPUT HANDLER
lockInput.addEventListener("keydown", e => {
  if(e.key === "Enter" && lockedCharacter){
    if(lockInput.value === lockedCharacter.lockCode){
      overlay.style.display = "none";
      window.location.href = `character.html?id=${lockedCharacter.id}`;
    } else {
      lockError.style.display = "block";
      lockInput.value = "";
      lockInput.focus();
    }
  }
});

// CLOSE OVERLAY ON ESC OR CLICK OUTSIDE
overlay.addEventListener("click", e => {
  if(e.target === overlay){
    overlay.style.display = "none";
    lockedCharacter = null;
  }
});

document.addEventListener("keydown", e => {
  if(e.key === "Escape" && overlay.style.display === "flex"){
    overlay.style.display = "none";
    lockedCharacter = null;
  }
});
