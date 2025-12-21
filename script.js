// script.js — search & render logic with debug output
let characters = [];
const statusBar = document.getElementById('statusBar');
const debug = document.getElementById('debug');

function showDebug(msg) {
  console.log(msg);
  debug.style.display = 'block';
  debug.textContent = msg;
}

// Fetch data with error handling
fetch("characters.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to fetch characters.json (status " + res.status + ")");
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error("characters.json is not an array");
    characters = data;
    statusBar.textContent = `Archive loaded: ${characters.length} records`;
    debug.style.display = 'none';
  })
  .catch(err => {
    statusBar.textContent = "Error loading archive (see debug)";
    showDebug("Error loading characters.json: " + err.message + "\nCheck that characters.json exists and is valid JSON and that filenames are exact.");
  });

// Elements
const searchInput = document.getElementById("search");
const results = document.getElementById("results");

// helper: convert [REDACTED] tokens to visual blocks
function applyRedaction(text) {
  if (!text) return '';
  return text.replace(/\[REDACTED\]/g, '<span class="redacted">██████</span>');
}

// render search results
function renderResults(query) {
  results.innerHTML = "";
  if (!characters.length) {
    results.innerHTML = '<div class="no-results">Archive not loaded yet.</div>';
    return;
  }

  if (!query) {
    results.innerHTML = '';
    return;
  }

  const filtered = characters.filter(c => (c.name || '').toLowerCase().includes(query));
  if (filtered.length === 0) {
    results.innerHTML = '<div class="no-results">No matching records found.</div>';
    return;
  }

  filtered.forEach(c => {
    // safety check for required fields
    if (!c.id || !c.name) {
      console.warn('Skipping record with missing id/name:', c);
      return;
    }

    const card = document.createElement('div');
    card.className = 'result-card';

    // archiveId and status handled defensively
    const archiveId = c.archiveId || (c.id ? c.id.toUpperCase() : 'UNKNOWN');
    const status = (c.status || 'ACTIVE').toLowerCase();

    card.innerHTML = `
      <div class="archive-header">
        <span class="archive-id">${archiveId}</span>
        <span class="status ${status}">${(c.status || 'ACTIVE').toUpperCase()}</span>
      </div>

      <div class="result-name">${c.name}</div>
      <div class="result-meta">${c.meta || ''}</div>
      <div class="result-summary">${applyRedaction(c.summary || '')}</div>
    `;

    // use encodeURIComponent in URL
    card.onclick = () => {
      const url = `character.html?id=${encodeURIComponent(c.id)}`;
      // open in same tab
      window.location.href = url;
    };

    results.appendChild(card);
  });
}

// input listener
let inputTimeout = null;
searchInput.addEventListener('input', (e) => {
  // debounce a little to avoid over-rendering
  const q = (e.target.value || '').trim().toLowerCase();
  clearTimeout(inputTimeout);
  inputTimeout = setTimeout(() => renderResults(q), 120);
});

// keyboard: press Enter to focus first result
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const first = results.querySelector('.result-card');
    if (first) first.click();
  }
});

// expose debug helper to console (optional)
window.__archive_debug = { charactersLoaded: () => characters.length };
