let characters = [];
let lockedCharacter = null;

fetch("characters.json")
  .then(res => res.json())
  .then(data => characters = data);

const results = document.getElementById("results");
const search = document.getElementById("search");

const overlay = document.getElementById("lockOverlay");
const lockName = document.getElementById("lockName");
const lockInput = document.getElementById("lockInput");
const lockError = document.querySelector(".lock-error");

function redact(text) {
  return text.replace(/\[REDACTED\]/g, '<span class="redacted">██████</span>');
}

search.addEventListener("input", () => {
  results.innerHTML = "";
  const q = search.value.toLowerCase();

  characters.filter(c => c.name.toLowerCase().includes(q))
    .forEach(c => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <div class="archive-header">
          <span>${c.archiveId}</span>
          <span>${c.status}</span>
        </div>
        <div class="result-name">${c.name}</div>
        <div class="result-meta">${c.meta}</div>
        <div>${redact(c.summary)}</div>
      `;

      card.onclick = () => {
        if (c.status === "SEALED") {
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
});

// LOCK INPUT
lockInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (lockInput.value === lockedCharacter.lockCode) {
      overlay.style.display = "none";
      window.location.href = `character.html?id=${lockedCharacter.id}`;
    } else {
      lockError.style.display = "block";
      lockInput.value = "";
    }
  }
});
