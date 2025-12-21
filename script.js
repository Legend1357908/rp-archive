let characters = [];

fetch("characters.json")
  .then(res => res.json())
  .then(data => characters = data);

const searchInput = document.getElementById("search");
const results = document.getElementById("results");

function applyRedaction(text) {
  return text.replace(
    /\[REDACTED\]/g,
    '<span class="redacted">██████</span>'
  );
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  results.innerHTML = "";

  if (!query) return;

  characters
    .filter(c => c.name.toLowerCase().includes(query))
    .forEach(c => {
      const card = document.createElement("div");
      card.className = "result-card";

      card.innerHTML = `
        <div class="archive-header">
          <span class="archive-id">${c.archiveId}</span>
          <span class="status ${c.status.toLowerCase()}">${c.status}</span>
        </div>

        <div class="result-name">${c.name}</div>
        <div class="result-meta">${c.meta}</div>
        <div class="result-summary">${applyRedaction(c.summary)}</div>
      `;

      card.onclick = () => {
        window.location.href = `character.html?id=${c.id}`;
      };

      results.appendChild(card);
    });
});
