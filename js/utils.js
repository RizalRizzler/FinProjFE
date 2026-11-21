/**
 * PixelDex - Shared Utilities
 * Common helper functions used across all pages
 */

// ==========================================================================
// Theme Management
// ==========================================================================

function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.dataset.theme = saved;
  updateThemeButton();
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  localStorage.setItem('theme', html.dataset.theme);
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isDark = document.documentElement.dataset.theme === 'dark';
  const label = btn.querySelector('.theme-toggle-label');
  if (label) label.textContent = isDark ? '☀' : '☾';
  btn.setAttribute('aria-pressed', isDark);
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

// ==========================================================================
// Hamburger Menu
// ==========================================================================

function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');

  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('open');
    document.body.style.overflow = expanded ? '' : 'hidden';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      hamburger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ==========================================================================
// Highlight Current Page
// ==========================================================================

function highlightCurrentPage() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) return;

  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

// ==========================================================================
// Sprite URLs
// ==========================================================================

/**
 * Get sprite URL with fallback chain:
 * 1. Gen 8 menu icon (available for Gen 1-8)
 * 2. Default sprite (available for all)
 * 3. Placeholder (last resort)
 */
function getSpriteUrl(id, options = {}) {
  const { preferGen8 = true } = options;
  const paddedId = String(id).padStart(3, '0');
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  const urls = [];

  if (preferGen8 && id <= 905) {
    // Gen 8 menu icons only exist for Pokémon up to Gen 8 (ID 905)
    urls.push(`${baseUrl}versions/generation-viii/icons/${paddedId}.png`);
  }

  // Default sprite (works for all 1025+ Pokémon)
  urls.push(`${baseUrl}${id}.png`);

  // Placeholder as final fallback
  urls.push('assets/placeholder.png');

  return urls;
}

/**
 * Create sprite HTML with fallback chain
 */
function createSpriteHtml(pokemonId, pokemonName) {
  const urls = getSpriteUrl(pokemonId);
  let html = '';
  urls.forEach((url, i) => {
    const isLast = i === urls.length - 1;
    html += `<img src="${url}" alt="${pokemonName}" class="card-image" loading="lazy" ${i > 0 ? 'style="display:none"' : ''} onerror="this.style.display='none'; ${isLast ? '' : `this.parentElement.querySelectorAll('img')[${i+1}].style.display='block'`}">`;
  });
  return html;
}

// ==========================================================================
// Favorites Management
// ==========================================================================

const FAVORITES_KEY = 'pixeldex-favorites';

function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    // localStorage unavailable or corrupt
  }
  return new Set();
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  } catch (e) {
    // Ignore
  }
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  const numId = Number(id);
  if (favorites.has(numId)) {
    favorites.delete(numId);
  } else {
    favorites.add(numId);
  }
  saveFavorites(favorites);
  updateFavoriteUI(numId, favorites.has(numId));
  return favorites.has(numId);
}

function isFavorite(id) {
  return getFavorites().has(Number(id));
}

function updateFavoriteUI(id, isFav) {
  document.querySelectorAll(`[data-favorite-btn][data-pokemon-id="${id}"]`).forEach(btn => {
    btn.setAttribute('aria-pressed', isFav);
    btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
    const icon = btn.querySelector('.favorite-icon');
    if (icon) {
      icon.textContent = isFav ? '♥' : '♡';
    }
    btn.classList.toggle('favorited', isFav);
  });
}

function createFavoriteButton(pokemonId) {
  const isFav = isFavorite(pokemonId);
  const btn = document.createElement('button');
  btn.className = 'favorite-btn' + (isFav ? ' favorited' : '');
  btn.dataset.favoriteBtn = 'true';
  btn.dataset.pokemonId = pokemonId;
  btn.setAttribute('aria-pressed', isFav);
  btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
  btn.innerHTML = `<span class="favorite-icon" aria-hidden="true">${isFav ? '♥' : '♡'}</span>`;
  // Note: Click handler is attached via event delegation in page-specific JS
  // (pokedex.js, pokemon.js) to work with innerHTML rendering
  return btn;
}

// ==========================================================================
// Utility Functions
// ==========================================================================

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatHeight(decimetres) {
  const metres = (decimetres / 10).toFixed(1);
  const feet = (decimetres * 0.328084).toFixed(1);
  return `${metres} m (${feet} ft)`;
}

function formatWeight(hectograms) {
  const kg = (hectograms / 10).toFixed(1);
  const lbs = (hectograms * 0.220462).toFixed(1);
  return `${kg} kg (${lbs} lbs)`;
}

function createStatBar(statName, value, maxValue = 255) {
  const percentage = Math.min(100, Math.round((value / maxValue) * 100));
  const barClass = statName.toLowerCase().replace(/\s+/g, '-');

  return `
    <div class="stat-row">
      <span class="stat-label">${statName.toUpperCase()}</span>
      <div class="stat-bar-container">
        <div class="stat-bar ${barClass}" style="width: ${percentage}%"></div>
      </div>
      <span class="stat-value">${value}</span>
    </div>
  `;
}

function getUrlParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Make utilities available globally
window.PixelDexUtils = {
  initTheme,
  toggleTheme,
  updateThemeButton,
  initHamburger,
  highlightCurrentPage,
  getSpriteUrl,
  createSpriteHtml,
  getFavorites,
  toggleFavorite,
  isFavorite,
  updateFavoriteUI,
  createFavoriteButton,
  capitalize,
  formatHeight,
  formatWeight,
  createStatBar,
  getUrlParam,
  debounce
};