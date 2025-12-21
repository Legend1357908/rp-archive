let characters = [];

fetch("characters.json")
  .then(response => response.json())
  .then(data => characters = data);

const searchInput = document.getElementById("search");
const results = document.getElementById("results");
const details = document.getElementById("details");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  results.innerHTML = "";
  details.innerHTML = "";

  characters
    .filter(c => c.name.toLowerCase().includes(query))
    .forEach(c => {
      const li = document.createElement("li");
      li.textContent = c.name;
      li.onclick = () => showCharacter(c);
      results.appendChild(li);
    });
});

function showCharacter(character) {
  details.innerHTML = `
    <h2>${character.name}</h2>
    <p>${character.backstory}</p>
    <h3>Recent Actions</h3>
    <ul>
      ${character.recentActions.map(a => `<li>${a}</li>`).join("")}
    </ul>
  `;
}
