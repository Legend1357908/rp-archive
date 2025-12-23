/* script.js
 *
 * Shared script for:
 * - index.html (renders file list from characters.json)
 * - character.html (renders a single character by id)
 *
 * Behavior:
 * - Blackout overlay with short cryptic lines on open/close/click
 * - Restricted files cannot be opened (flash message)
 * - Uses characters.json in same folder
 */

(() => {
  /* --- Cryptic lines --- */
  const openLines = [
    "Zou rummages through paper...",
    "A folded note slips free...",
    "You pry open a brittle envelope...",
    "Fingers trace a faded stamp...",
    "A whisper of dust and ink..."
  ];

  const closeLines = [
    "You put them back, neat...",
    "Pages settle; the room exhales...",
    "You tuck it away, quiet...",
    "The paper folds into shadow...",
    "You slide it back; echoes thin..."
  ];

  /* --- Helpers --- */
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const blackoutEl = document.getElementById('blackout');
  const blackoutMessageEl = document.getElementById('blackoutMessage');

  function showBlackout(message, visibleMs = 600) {
    return new Promise((resolve) => {
      if (!blackoutEl || !blackoutMessageEl) {
        // If overlay missing, just wait a short time
        setTimeout(resolve, visibleMs);
        return;
      }
      blackoutMessageEl.textContent = message;
      blackoutEl.classList.add('show');
      // Keep visible for visibleMs, then fade
      setTimeout(() => {
        blackoutEl.classList.remove('show');
        // wait for CSS transition to finish
        setTimeout(resolve, 220);
      }, visibleMs);
    });
  }

  function flashMessage(msg, ms = 900) {
    return showBlackout(msg, ms);
  }

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  /* --- Fetch characters.json --- */
  async function fetchCharacters() {
    try {
      const res = await fetch('characters.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load characters.json');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid JSON format');
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /* --- Index page logic (file list) --- */
  async function initIndex() {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;

    const characters = await fetchCharacters();
    if (!characters) {
      fileList.innerHTML = '<li class="file"><span class="filename">Unable to load archive.</span></li>';
      return;
    }

    // Render list items
    fileList.innerHTML = '';
    characters.forEach((c) => {
      // Skip sealed entries if present by property sealed=true (compat)
      if (c.sealed) return;

      const li = document.createElement('li');
      li.className = 'file';
      li.setAttribute('role', 'listitem');
      li.tabIndex = 0;
      li.dataset.id = c.id;
      li.dataset.restricted = c.restricted ? 'true' : 'false';

      const left = document.createElement('span');
      left.className = 'filename';
      left.textContent = c.name || c.id;

      const right = document.createElement('span');
      right.className = 'meta';
      // Only show restricted badge visually if restricted
      if (c.restricted) {
        const badge = document.createElement('span');
        badge.className = 'status-badge';
        badge.textContent = 'restricted';
        right.appendChild(badge);
      }

      li.appendChild(left);
      li.appendChild(right);
      fileList.appendChild(li);
    });

    // Click / keyboard handlers
    fileList.addEventListener('click', async (e) => {
      const li = e.target.closest('.file');
      if (!li) return;
      await handleIndexSelection(li);
    });

    fileList.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const li = e.target.closest('.file');
      if (!li) return;
      e.preventDefault();
      await handleIndexSelection(li);
    });
  }

  async function handleIndexSelection(li) {
    const id = li.dataset.id;
    const restricted = li.dataset.restricted === 'true';

    if (restricted) {
      await flashMessage('Restricted — file will not open.');
      return;
    }

    // Show blackout with an opening line, then navigate to character page
    await showBlackout(pick(openLines), 700);
    // Navigate preserving relative path
    const target = `character.html?id=${encodeURIComponent(id)}`;
    window.location.href = target;
  }

  /* --- Character page logic --- */
  async function initCharacter() {
    const nameEl = document.getElementById('characterName');
    const subtitleEl = document.getElementById('characterSubtitle');
    const contentEl = document.getElementById('characterContent');
    const backBtn = document.getElementById('backButton');

    if (!nameEl || !contentEl) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      nameEl.textContent = 'No file specified';
      subtitleEl && (subtitleEl.textContent = '');
      contentEl.innerHTML = '<p class="lead">No file id provided in the URL.</p>';
      return;
    }

    const characters = await fetchCharacters();
    if (!characters) {
      nameEl.textContent = 'Archive unavailable';
      subtitleEl && (subtitleEl.textContent = '');
      contentEl.innerHTML = '<p class="lead">Unable to load archive data.</p>';
      return;
    }

    const entry = characters.find((c) => String(c.id) === String(id));
    if (!entry) {
      nameEl.textContent = 'File not found';
      subtitleEl && (subtitleEl.textContent = '');
      contentEl.innerHTML = '<p class="lead">The requested file could not be located.</p>';
      return;
    }

    // If restricted, block opening and show flash then show minimal UI
    if (entry.restricted) {
      await flashMessage('Restricted — file will not open.');
      nameEl.textContent = entry.name || 'Restricted';
      subtitleEl && (subtitleEl.textContent = entry.subtitle || '');
      contentEl.innerHTML = '<p class="lead">Access to this file is permanently denied.</p>';
      // Keep Back button available
      if (backBtn) {
        backBtn.addEventListener('click', async () => {
          await showBlackout(pick(closeLines), 600);
          window.location.href = 'index.html';
        });
      }
      return;
    }

    // Normal file: show opening blackout then render content
    await showBlackout(pick(openLines), 700);

    nameEl.textContent = entry.name || entry.id;
    subtitleEl && (subtitleEl.textContent = entry.subtitle || '');

    // Render content array as paragraphs
    contentEl.innerHTML = '';
    if (Array.isArray(entry.content) && entry.content.length) {
      entry.content.forEach((p) => {
        const para = document.createElement('p');
        para.textContent = p;
        contentEl.appendChild(para);
      });
    } else if (entry.raw) {
      // support raw text field if present
      const pre = document.createElement('pre');
      pre.textContent = entry.raw;
      contentEl.appendChild(pre);
    } else {
      contentEl.innerHTML = '<p class="lead">(No readable content.)</p>';
    }

    // Back button behavior: blackout with a closing line then go back
    if (backBtn) {
      backBtn.addEventListener('click', async () => {
        await showBlackout(pick(closeLines), 600);
        window.location.href = 'index.html';
      });

      backBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          backBtn.click();
        }
      });
    }

    // Allow Escape to go back
    document.addEventListener('keydown', async (e) => {
      if (e.key === 'Escape') {
        if (backBtn) {
          await showBlackout(pick(closeLines), 600);
          window.location.href = 'index.html';
        }
      }
    });
  }

  /* --- Auto-detect page and initialize --- */
  document.addEventListener('DOMContentLoaded', () => {
    // If fileList exists -> index page
    if (document.getElementById('fileList')) {
      initIndex();
      return;
    }

    // If characterName exists -> character page
    if (document.getElementById('characterName')) {
      initCharacter();
      return;
    }

    // Otherwise, nothing to do
  });
})();
