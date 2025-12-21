let characters = [];

fetch("characters.json")
  .then(res => res.json())
  .then(data => characters = data);

const searchInput = document.getElementById("search");
const results = document.getElementById("results");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  results.innerHTML = "";

  if (!query) return;

  characters
    .filter(c => c.name.toLowerCase().includes(query))
    .forEach(c => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.textContent = c.name;

      card.onclick = () => {
        window.location.href = `character.html?id=${c.id}`;
      };

      results.appendChild(card);
    });
});
