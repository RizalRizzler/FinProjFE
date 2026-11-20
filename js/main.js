/**
 * SpindaDex - Shared JavaScript
 * Handles: Skin toggle, theme toggle, favorites, mobile nav, footer, utilities
 */

(function() {
  'use strict';

  // ==========================================================================
  // Skin Management (GBA/NDS)
  // ==========================================================================

  const SKIN_KEY = 'spindadex-skin';
  const DEFAULT_SKIN = 'gba';
  const VALID_SKINS = ['gba', 'nds'];

  function getSkin() {
    try {
      const stored = localStorage.getItem(SKIN_KEY);
      if (stored && VALID_SKINS.includes(stored)) {
        return stored;
      }
    } catch (e) {
      // localStorage unavailable (private browsing, etc.)
    }
    return DEFAULT_SKIN;
  }

  function setSkin(skin) {
    if (!VALID_SKINS.includes(skin)) return false;
    try {
      localStorage.setItem(SKIN_KEY, skin);
    } catch (e) {
      // Ignore
    }
    document.documentElement.setAttribute('data-skin', skin);
    updateSkinToggleUI(skin);
    return true;
  }

  function toggleSkin() {
    const current = getSkin();
    const next = current === 'gba' ? 'nds' : 'gba';
    setSkin(next);
  }

  function updateSkinToggleUI(skin) {
    const toggles = document.querySelectorAll('[data-skin-toggle]');
    toggles.forEach(toggle => {
      toggle.setAttribute('aria-pressed', skin === 'nds');
      const nextSkin = skin === 'gba' ? 'NDS' : 'GBA';
      toggle.setAttribute('aria-label', `Switch to ${nextSkin} skin`);
      const label = toggle.querySelector('.skin-toggle-label');
      if (label) {
        label.textContent = skin.toUpperCase();
      }
    });
  }

  function initSkin() {
    const skin = getSkin();
    document.documentElement.setAttribute('data-skin', skin);
    updateSkinToggleUI(skin);

    // Attach click handlers to all skin toggle buttons
    document.querySelectorAll('[data-skin-toggle]').forEach(btn => {
      btn.addEventListener('click', toggleSkin);
    });
  }

  // ==========================================================================
  // Theme Management (Day/Night)
  // ==========================================================================

  const THEME_KEY = 'spindadex-theme';
  const DEFAULT_THEME = 'day';
  const VALID_THEMES = ['day', 'night'];

  function getTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored && VALID_THEMES.includes(stored)) {
        return stored;
      }
    } catch (e) {
      // localStorage unavailable
    }
    return DEFAULT_THEME;
  }

  function setTheme(theme) {
    if (!VALID_THEMES.includes(theme)) return false;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // Ignore
    }
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeToggleUI(theme);
    return true;
  }

  function toggleTheme() {
    const current = getTheme();
    const next = current === 'day' ? 'night' : 'day';
    setTheme(next);
  }

  function updateThemeToggleUI(theme) {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(toggle => {
      toggle.setAttribute('aria-pressed', theme === 'night');
      const nextTheme = theme === 'day' ? 'Night' : 'Day';
      toggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
      const label = toggle.querySelector('.theme-toggle-label');
      if (label) {
        label.textContent = theme === 'day' ? '☀' : '☾';
      }
      const btn = toggle.querySelector('.theme-toggle-btn');
      if (btn) {
        btn.setAttribute('aria-label', theme === 'day' ? 'Switch to night mode' : 'Switch to day mode');
      }
    });
  }

  function initTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeToggleUI(theme);

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  }

  // ==========================================================================
  // Favorites Management
  // ==========================================================================

  const FAVORITES_KEY = 'spindadex-favorites';

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

  function initFavoriteButtons() {
    const favorites = getFavorites();
    document.querySelectorAll('[data-favorite-btn]').forEach(btn => {
      const id = Number(btn.dataset.pokemonId);
      const isFav = favorites.has(id);
      btn.setAttribute('aria-pressed', isFav);
      btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
      const icon = btn.querySelector('.favorite-icon');
      if (icon) {
        icon.textContent = isFav ? '♥' : '♡';
      }
      btn.classList.toggle('favorited', isFav);

      // Attach click handler if not already attached
      if (!btn.dataset.favHandlerAttached) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(id);
        });
        btn.dataset.favHandlerAttached = 'true';
      }
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
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(pokemonId);
    });
    return btn;
  }

  // ==========================================================================
  // Mobile Hamburger Menu
  // ==========================================================================

  function initHamburger() {
    const hamburger = document.querySelector('[data-hamburger]');
    const nav = document.querySelector('[data-nav]');

    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('open');
      document.body.style.overflow = expanded ? '' : 'hidden';
    });

    // Close nav when clicking a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        hamburger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ==========================================================================
  // Shared Navbar (injected into each page)
  // ==========================================================================

  const NAV_HTML = `
    <nav class="main-nav" data-nav role="navigation" aria-label="Main navigation">
      <ul class="nav-list">
        <li><a href="index.html" class="nav-link" data-page="home">Home</a></li>
        <li><a href="pokedex.html" class="nav-link" data-page="pokedex">Pokédex</a></li>
        <li><a href="pokemon.html" class="nav-link" data-page="pokemon">Detail</a></li>
        <li><a href="types.html" class="nav-link" data-page="types">Types</a></li>
      </ul>
      <div class="nav-controls" style="display: flex; align-items: center; gap: var(--space-1);">
        <button class="theme-toggle" data-theme-toggle aria-label="Toggle day/night mode" aria-pressed="false">
          <span class="theme-toggle-label">☀</span>
          <span class="theme-toggle-btn" aria-hidden="true"></span>
        </button>
        <button class="skin-toggle" data-skin-toggle aria-label="Toggle GBA/NDS skin" aria-pressed="false">
          <span class="skin-toggle-label">GBA</span>
          <span class="skin-toggle-btn" aria-hidden="true"></span>
        </button>
      </div>
    </nav>
  `;

  function injectNavbar() {
    const placeholder = document.querySelector('[data-navbar-placeholder]');
    if (placeholder) {
      placeholder.outerHTML = NAV_HTML;
      // Re-initialize toggles for new buttons
      initSkin();
      initTheme();
      initHamburger();
      highlightCurrentPage();
    }
  }

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
  // Shared Footer (injected into each page)
  // ==========================================================================

  const FOOTER_HTML = `
    <footer class="site-footer" role="contentinfo">
      <div class="footer-content">
        <p class="footer-disclaimer">
          Fan-made project. Not affiliated with Nintendo, Creatures Inc., GAME FREAK inc., or The Pokémon Company.
          Pokémon and all related names are their respective trademarks.
        </p>
        <div class="footer-links">
          <a href="https://pokeapi.co/" target="_blank" rel="noopener">PokéAPI</a>
          <a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noopener">Sprites</a>
          <a href="https://fonts.google.com/specimen/Press+Start+2P" target="_blank" rel="noopener">Press Start 2P</a>
          <a href="https://fonts.google.com/specimen/Pixelify+Sans" target="_blank" rel="noopener">Pixelify Sans</a>
        </div>
      </div>
    </footer>
  `;

  function injectFooter() {
    const placeholder = document.querySelector('[data-footer-placeholder]');
    if (placeholder) {
      placeholder.outerHTML = FOOTER_HTML;
    }
  }

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  /**
   * Debounce function
   */
  function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Get sprite URL with fallback chain
   * Priority: Gen 8 Icons → Default → Placeholder
   */
  function getSpriteUrl(id, options = {}) {
    const { preferGen8 = true } = options;
    const paddedId = String(id).padStart(3, '0');
    const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

    const urls = [];

    if (preferGen8) {
      // Gen 8 menu icons - available for all 1025+ Pokémon
      urls.push(`${baseUrl}versions/generation-viii/icons/${paddedId}.png`);
    }

    // Default sprite
    urls.push(`${baseUrl}${id}.png`);

    // Placeholder as final fallback
    urls.push('assets/placeholder.png');

    return urls;
  }

  /**
   * Create type badge element
   */
  function createTypeBadge(type) {
    const span = document.createElement('span');
    span.className = `type-badge ${type.toLowerCase()}`;
    span.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    return span;
  }

  /**
   * Create stat bar HTML
   */
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

  /**
   * Format height from decimetres to m/ft
   */
  function formatHeight(decimetres) {
    const metres = (decimetres / 10).toFixed(1);
    const feet = (decimetres * 0.328084).toFixed(1);
    return `${metres} m (${feet} ft)`;
  }

  /**
   * Format weight from hectograms to kg/lbs
   */
  function formatWeight(hectograms) {
    const kg = (hectograms / 10).toFixed(1);
    const lbs = (hectograms * 0.220462).toFixed(1);
    return `${kg} kg (${lbs} lbs)`;
  }

  /**
   * Capitalize first letter
   */
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get type effectiveness label
   */
  function getEffectivenessLabel(value) {
    switch (value) {
      case 2: return 'Super Effective';
      case 0.5: return 'Not Very Effective';
      case 0: return 'No Effect';
      default: return 'Normal';
    }
  }

  /**
   * Show error message
   */
  function showError(container, message) {
    container.innerHTML = `
      <div class="error-message" role="alert">
        ${message}
      </div>
    `;
  }

  /**
   * Show loading spinner
   */
  function showLoading(container) {
    container.innerHTML = `
      <div class="text-center" style="padding: var(--space-6);">
        <div class="loading" aria-hidden="true"></div>
        <p class="mt-2" style="color: var(--color-text-muted);">Loading...</p>
      </div>
    `;
  }

  /**
   * Get URL search parameter
   */
  function getUrlParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }

  // ==========================================================================
  // Typewriter Effect
  // ==========================================================================

  function initTypewriter(element, text, speed = 30, callback) {
    if (!element) return;

    element.textContent = '';
    element.classList.add('typewriter');

    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        element.classList.remove('typewriter');
        if (callback) callback();
      }
    }

    type();
  }

  // ==========================================================================
  // Initialize on DOM Ready
  // ==========================================================================

  function init() {
    // Inject shared components (navbar contains toggles)
    injectNavbar();
    injectFooter();

    // Initialize skin after navbar is injected
    initSkin();
    initTheme();

    // Initialize hamburger after navbar is injected
    // (initHamburger is called inside injectNavbar)
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  window.SpindaDex = {
    getSkin,
    setSkin,
    toggleSkin,
    getTheme,
    setTheme,
    toggleTheme,
    getFavorites,
    toggleFavorite,
    isFavorite,
    updateFavoriteUI,
    initFavoriteButtons,
    createFavoriteButton,
    debounce,
    getSpriteUrl,
    createTypeBadge,
    createStatBar,
    formatHeight,
    formatWeight,
    capitalize,
    getEffectivenessLabel,
    showError,
    showLoading,
    getUrlParam,
    initTypewriter
  };

})();