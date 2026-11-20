/**
 * PixelDex - Pokédex Page Logic
 * Handles: Search, type filters, generation filters, favorites filter, card rendering
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants & Data
  // ==========================================================================

  const ALL_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const GENERATIONS = [
    { value: 1, label: 'Gen 1: Kanto (1-151)' },
    { value: 2, label: 'Gen 2: Johto (152-251)' },
    { value: 3, label: 'Gen 3: Hoenn (252-386)' },
    { value: 4, label: 'Gen 4: Sinnoh (387-493)' },
    { value: 5, label: 'Gen 5: Unova (494-649)' },
    { value: 6, label: 'Gen 6: Kalos (650-721)' },
    { value: 7, label: 'Gen 7: Alola (722-809)' },
    { value: 8, label: 'Gen 8: Galar (810-905)' },
    { value: 9, label: 'Gen 9: Paldea (906-1025)' }
  ];

  // ==========================================================================
  // State
  // ==========================================================================

  let state = {
    search: '',
    types: new Set(),
    generation: '',
    favoritesOnly: false
  };

  let filteredPokemon = [];

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const elements = {
    searchInput: document.getElementById('search-input'),
    typeFilter: document.getElementById('type-filter'),
    genFilter: document.getElementById('gen-filter'),
    favoritesFilter: document.getElementById('favorites-filter'),
    clearBtn: document.getElementById('clear-filters'),
    grid: document.getElementById('pokedex-grid'),
    emptyState: document.getElementById('empty-state'),
    resultsCount: document.getElementById('results-count')
  };

  // ==========================================================================
  // Initialization
  // ==========================================================================

  function init() {
    if (!window.POKEMON) {
      console.error('POKEMON data not loaded');
      return;
    }

    buildTypeCheckboxes();
    buildGenerationOptions();
    attachEventListeners();
    applyFilters(); // Initial render
  }

  // ==========================================================================
  // Build UI
  // ==========================================================================

  function buildTypeCheckboxes() {
    const container = elements.typeFilter;
    if (!container) return;

    ALL_TYPES.forEach(type => {
      const label = document.createElement('label');
      label.className = 'checkbox-item';
      label.style.display = 'inline-flex';
      label.style.marginBottom = '4px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = type;
      checkbox.id = `type-${type}`;
      checkbox.addEventListener('change', handleTypeChange);

      const span = document.createElement('span');
      span.className = `type-badge ${type}`;
      span.style.fontSize = '10px';
      span.style.padding = '2px 8px';
      span.textContent = window.PixelDex.capitalize(type);

      label.appendChild(checkbox);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  function buildGenerationOptions() {
    const select = elements.genFilter;
    if (!select) return;

    GENERATIONS.forEach(gen => {
      const option = document.createElement('option');
      option.value = gen.value;
      option.textContent = gen.label;
      select.appendChild(option);
    });
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  function handleTypeChange(e) {
    const type = e.target.value;
    if (e.target.checked) {
      state.types.add(type);
    } else {
      state.types.delete(type);
    }
    applyFilters();
  }

  function handleSearch(e) {
    state.search = e.target.value.trim().toLowerCase();
    applyFilters();
  }

  function handleGenChange(e) {
    state.generation = e.target.value ? parseInt(e.target.value, 10) : '';
    applyFilters();
  }

  function handleFavoritesChange(e) {
    state.favoritesOnly = e.target.checked;
    applyFilters();
  }

  function handleClear() {
    state.search = '';
    state.types.clear();
    state.generation = '';
    state.favoritesOnly = false;

    elements.searchInput.value = '';
    elements.genFilter.value = '';
    elements.favoritesFilter.checked = false;
    elements.typeFilter.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });

    applyFilters();
  }

  function attachEventListeners() {
    // Debounced search
    const debouncedSearch = window.PixelDex.debounce(handleSearch, 150);
    elements.searchInput.addEventListener('input', debouncedSearch);

    elements.genFilter.addEventListener('change', handleGenChange);
    elements.favoritesFilter.addEventListener('change', handleFavoritesChange);
    elements.clearBtn.addEventListener('click', handleClear);
  }

  // ==========================================================================
  // Filtering Logic
  // ==========================================================================

  function applyFilters() {
    const favorites = window.PixelDex.getFavorites();

    filteredPokemon = window.POKEMON.filter(pokemon => {
      // Search filter
      if (state.search && !pokemon.name.toLowerCase().includes(state.search)) {
        return false;
      }

      // Type filter (OR logic - must have AT LEAST ONE selected type)
      if (state.types.size > 0) {
        const pokemonTypes = new Set(pokemon.types);
        let hasSelectedType = false;
        for (const type of state.types) {
          if (pokemonTypes.has(type)) {
            hasSelectedType = true;
            break;
          }
        }
        if (!hasSelectedType) return false;
      }

      // Generation filter
      if (state.generation && pokemon.gen !== state.generation) {
        return false;
      }

      // Favorites filter
      if (state.favoritesOnly && !favorites.has(pokemon.id)) {
        return false;
      }

      return true;
    });

    renderGrid();
    updateResultsCount();
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function renderGrid() {
    const grid = elements.grid;
    const emptyState = elements.emptyState;

    if (!grid) return;

    // Clear grid
    grid.innerHTML = '';

    if (filteredPokemon.length === 0) {
      grid.classList.add('hidden');
      emptyState?.classList.remove('hidden');
      return;
    }

    grid.classList.remove('hidden');
    emptyState?.classList.add('hidden');

    // Create document fragment for performance
    const fragment = document.createDocumentFragment();

    filteredPokemon.forEach(pokemon => {
      const card = createPokemonCard(pokemon);
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    // Initialize favorite buttons after rendering
    window.PixelDex.initFavoriteButtons();
  }

  function createPokemonCard(pokemon) {
    const article = document.createElement('article');
    article.className = 'card';
    article.setAttribute('role', 'listitem');
    article.style.textDecoration = 'none';
    article.style.color = 'inherit';
    article.style.position = 'relative'; // For absolute positioning of favorite button

    // Link to detail page (on card click, but not on favorite button)
    article.addEventListener('click', (e) => {
      // Don't navigate if clicking the favorite button
      if (e.target.closest('[data-favorite-btn]')) return;
      window.location.href = `pokemon.html?id=${pokemon.id}`;
    });
    article.setAttribute('tabindex', '0');
    article.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = `pokemon.html?id=${pokemon.id}`;
      }
    });

    // Sprite URLs with fallback chain
    const spriteUrls = window.PixelDex.getSpriteUrl(pokemon.id);

    // Build sprite fallback chain
    let spriteHtml = '';
    spriteUrls.forEach((url, i) => {
      const isLast = i === spriteUrls.length - 1;
      spriteHtml += `<img src="${url}" alt="${pokemon.name}" class="card-image" loading="lazy" ${i > 0 ? 'style="display:none"' : ''} onerror="this.style.display='none'; ${isLast ? '' : `this.parentElement.querySelectorAll('img')[${i+1}].style.display='block'`}">`;
    });

    // Create favorite button
    const favBtn = window.PixelDex.createFavoriteButton(pokemon.id);
    favBtn.style.position = 'absolute';
    favBtn.style.top = 'var(--space-1)';
    favBtn.style.right = 'var(--space-1)';
    favBtn.style.zIndex = '10';

    article.innerHTML = `
      <div class="card-inner">
        <div style="position: relative; width: 100%; aspect-ratio: 1;">
          ${spriteHtml}
        </div>
        <h3 class="card-title">${window.PixelDex.capitalize(pokemon.name)}</h3>
        <p class="card-id">#${String(pokemon.id).padStart(3, '0')}</p>
        <div class="card-types">
          ${pokemon.types.map(t => `<span class="type-badge ${t}">${window.PixelDex.capitalize(t)}</span>`).join('')}
        </div>
      </div>
    `;

    // Append favorite button to card-inner
    const cardInner = article.querySelector('.card-inner');
    if (cardInner) {
      cardInner.appendChild(favBtn);
    }

    return article;
  }

  function updateResultsCount() {
    const count = elements.resultsCount;
    if (!count) return;

    const total = window.POKEMON?.length || 0;
    const showing = filteredPokemon.length;

    let baseText = '';
    if (showing === total && !state.search && state.types.size === 0 && !state.generation && !state.favoritesOnly) {
      baseText = `Showing all ${total} Pokémon`;
    } else {
      baseText = `Showing ${showing} of ${total} Pokémon`;
    }

    if (state.favoritesOnly) {
      const favCount = window.PixelDex.getFavorites().size;
      baseText += ` (${favCount} favorited)`;
    }

    count.textContent = baseText;
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();