// Load character data from JSON
let characters = [];

fetch("characters.json")
  .then(response => response.json())
  .then(data => characters = data)
  .catch(err => console.error("Error loading characters:", err));

// Grab HTML elements
const searchInput = document.getElementById("search");
const results = document.getElementById("results");
const details = document.getElementById("details");

// Listen for input in the search bar
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  results.innerHTML = "";
  details.innerHTML = "";

  // Filter characters by name
  const filtered = characters.filter(c => c.name.toLowerCase().includes(query));

  if(filtered.length === 0 && query.length > 0) {
    results.innerHTML = "<li>No matching records found</li>";
    return;
  }

  // Display matching names
  filtered.forEach(character => {
    const li = document.createElement("li");
    li.textContent = character.name;
    li.onclick = () => showCharacter(character);
    results.appendChild(li);
  });
});

// Function to show character details in a styled card
function showCharacter(character) {
  details.innerHTML = `
    <div class="character-card">
      <h2>${character.name}</h2>
      <p>${character.backstory}</p>
      <h3>Recent Actions</h3>
      <ul>
        ${character.recentActions.map(action => `<li>${action}</li>`).join("")}
      </ul>
    </div>
  `;
}
