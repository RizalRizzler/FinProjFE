/**
 * SpindaDex - Pokémon Detail Page Logic
 * Handles: URL param parsing, detail rendering, prev/next navigation
 */

(function() {
  'use strict';

  // ==========================================================================
  // State
  // ==========================================================================

  let currentPokemon = null;
  let currentIndex = -1;

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const container = document.getElementById('pokemon-detail');

  // ==========================================================================
  // Initialization
  // ==========================================================================

  function init() {
    if (!window.POKEMON) {
      showError('Pokémon data not loaded');
      return;
    }

    const id = parseInt(window.SpindaDex.getUrlParam('id'), 10);

    if (!id || id < 1 || id > window.POKEMON.length) {
      showError('Invalid Pokémon ID. Please return to the <a href="pokedex.html">Pokédex</a>.');
      return;
    }

    currentIndex = window.POKEMON.findIndex(p => p.id === id);
    if (currentIndex === -1) {
      showError('Pokémon not found. Please return to the <a href="pokedex.html">Pokédex</a>.');
      return;
    }

    currentPokemon = window.POKEMON[currentIndex];
    renderDetail();
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function renderDetail() {
    if (!currentPokemon || !container) return;

    const p = currentPokemon;
    const spriteUrls = window.SpindaDex.getSpriteUrl(p.id);

    // Build sprite fallback chain
    let spriteHtml = '';
    spriteUrls.forEach((url, i) => {
      const isLast = i === spriteUrls.length - 1;
      spriteHtml += `<img src="${url}" alt="${p.name}" class="detail-sprite" loading="lazy" ${i > 0 ? 'style="display:none"' : ''} onerror="this.style.display='none'; ${isLast ? '' : `this.parentElement.querySelectorAll('img')[${i+1}].style.display='block'`}">`;
    });

    // Stat bars
    const statsHtml = `
      ${window.SpindaDex.createStatBar('HP', p.stats.hp)}
      ${window.SpindaDex.createStatBar('Attack', p.stats.attack)}
      ${window.SpindaDex.createStatBar('Defense', p.stats.defense)}
      ${window.SpindaDex.createStatBar('Sp. Atk', p.stats.spatk)}
      ${window.SpindaDex.createStatBar('Sp. Def', p.stats.spdef)}
      ${window.SpindaDex.createStatBar('Speed', p.stats.speed)}
    `;

    // Abilities
    const abilitiesHtml = p.abilities.map(a => `
      <span class="type-badge ${a.hidden ? 'fairy' : 'normal'}" style="background: ${a.hidden ? 'var(--type-fairy)' : 'var(--type-normal)'};">
        ${window.SpindaDex.capitalize(a.name.replace('-', ' '))}${a.hidden ? ' (Hidden)' : ''}
      </span>
    `).join('');

    // Types
    const typesHtml = p.types.map(t => `
      <span class="type-badge ${t}">${window.SpindaDex.capitalize(t)}</span>
    `).join('');

    // Favorite button for detail page
    const favBtnHtml = `<button class="favorite-btn detail-fav-btn" data-favorite-btn data-pokemon-id="${p.id}" aria-label="${window.SpindaDex.isFavorite(p.id) ? 'Remove from favorites' : 'Add to favorites'}" aria-pressed="${window.SpindaDex.isFavorite(p.id)}"><span class="favorite-icon" aria-hidden="true">${window.SpindaDex.isFavorite(p.id) ? '♥' : '♡'}</span></button>`;

    // Prev/Next buttons
    const prevId = currentIndex > 0 ? window.POKEMON[currentIndex - 1].id : null;
    const nextId = currentIndex < window.POKEMON.length - 1 ? window.POKEMON[currentIndex + 1].id : null;

    container.innerHTML = `
      <article class="pokemon-detail">
        <header class="detail-header">
          <div style="position: relative; width: 120px; height: 120px; flex-shrink: 0;">
            ${spriteHtml}
          </div>
          <div class="detail-info">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-2); width: 100%;">
              <div>
                <h1 class="detail-name">${window.SpindaDex.capitalize(p.name)}</h1>
                <p class="detail-id">#${String(p.id).padStart(3, '0')} • ${p.genName} (Gen ${p.gen})</p>
                <div class="detail-types">${typesHtml}</div>
              </div>
              ${favBtnHtml}
            </div>
          </div>
        </header>

        <section class="detail-section" aria-labelledby="stats-heading">
          <h2 id="stats-heading" class="detail-section-title">Base Stats</h2>
          <div class="stats-container">${statsHtml}</div>
          <p style="margin-top: var(--space-2); font-size: 12px; color: var(--color-text-muted);">
            Total: <strong>${Object.values(p.stats).reduce((a, b) => a + b, 0)}</strong>
          </p>
        </section>

        <section class="detail-section" aria-labelledby="abilities-heading">
          <h2 id="abilities-heading" class="detail-section-title">Abilities</h2>
          <div class="card-types" style="justify-content: flex-start;">${abilitiesHtml}</div>
        </section>

        <section class="detail-section" aria-labelledby="physical-heading">
          <h2 id="physical-heading" class="detail-section-title">Physical Data</h2>
          <div class="flex gap-3 flex-wrap" style="font-size: 14px;">
            <div><strong>Height:</strong> ${window.SpindaDex.formatHeight(p.height)}</div>
            <div><strong>Weight:</strong> ${window.SpindaDex.formatWeight(p.weight)}</div>
          </div>
        </section>

        <nav class="detail-nav" aria-label="Pokémon navigation">
          ${prevId
            ? `<a href="pokemon.html?id=${prevId}" class="btn btn-secondary">← Previous</a>`
            : `<button class="btn btn-secondary disabled" disabled aria-label="Previous (first Pokémon)">← Previous</button>`
          }
          <a href="pokedex.html" class="btn">Back to Pokédex</a>
          ${nextId
            ? `<a href="pokemon.html?id=${nextId}" class="btn btn-secondary">Next →</a>`
            : `<button class="btn btn-secondary disabled" disabled aria-label="Next (last Pokémon)">Next →</button>`
          }
        </nav>
      </article>
    `;

    // Initialize favorite button after rendering
    window.SpindaDex.initFavoriteButtons();

    // Update page title
    document.title = `SpindaDex - ${window.SpindaDex.capitalize(p.name)} (#${String(p.id).padStart(3, '0')})`;
  }

  function showError(message) {
    if (!container) return;
    container.innerHTML = `
      <div class="error-message" role="alert">
        ${message}
      </div>
      <p class="text-center mt-3">
        <a href="pokedex.html" class="btn">Back to Pokédex</a>
      </p>
    `;
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