/**
 * PixelDex - Pokémon Detail Page Logic (Simplified)
 * Handles: URL param parsing, detail rendering, prev/next navigation
 * Uses window.PixelDexUtils for shared functionality
 */

const U = window.PixelDexUtils;

// ==========================================================================
// State
// ==========================================================================

let currentPokemon = null;
let currentIndex = -1;
const container = document.getElementById('pokemon-detail');

// ==========================================================================
// Event Handlers
// ==========================================================================

function handleFavoriteClick(e) {
  const favBtn = e.target.closest('[data-favorite-btn]');
  if (!favBtn || !currentPokemon) return;

  e.preventDefault();
  e.stopPropagation();

  U.toggleFavorite(currentPokemon.id);
}

// ==========================================================================
// Rendering
// ==========================================================================

function renderDetail() {
  if (!currentPokemon || !container) return;

  const p = currentPokemon;

  // Stat bars
  const statsHtml = `
    ${U.createStatBar('HP', p.stats.hp)}
    ${U.createStatBar('Attack', p.stats.attack)}
    ${U.createStatBar('Defense', p.stats.defense)}
    ${U.createStatBar('Sp. Atk', p.stats.spatk)}
    ${U.createStatBar('Sp. Def', p.stats.spdef)}
    ${U.createStatBar('Speed', p.stats.speed)}
  `;

  // Abilities
  const abilitiesHtml = p.abilities.map(a => `
    <span class="type-badge ${a.hidden ? 'fairy' : 'normal'}" style="background: ${a.hidden ? 'var(--type-fairy)' : 'var(--type-normal)'};">
      ${U.capitalize(a.name.replace('-', ' '))}${a.hidden ? ' (Hidden)' : ''}
    </span>
  `).join('');

  // Types
  const typesHtml = p.types.map(t => `
    <span class="type-badge ${t}">${U.capitalize(t)}</span>
  `).join('');

  // Favorite button (create without click handler - we use event delegation)
  const favBtn = U.createFavoriteButton(p.id);
  // Remove the click handler since we use event delegation
  const newFavBtn = favBtn.cloneNode(true);
  // We need to remove the old event listener - but since we use outerHTML, it's already lost
  // Just use the HTML without the handler

  // Prev/Next buttons
  const prevId = currentIndex > 0 ? window.POKEMON[currentIndex - 1].id : null;
  const nextId = currentIndex < window.POKEMON.length - 1 ? window.POKEMON[currentIndex + 1].id : null;

  container.innerHTML = `
    <article class="pokemon-detail">
      <header class="detail-header">
        <div class="detail-sprite-wrapper">
          ${U.createSpriteHtml(p.id, p.name)}
        </div>
        <div class="detail-info">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-2); width: 100%;">
            <div>
              <h1 class="detail-name">${U.capitalize(p.name)}</h1>
              <p class="detail-id">#${String(p.id).padStart(3, '0')} • ${p.genName} (Gen ${p.gen})</p>
              <div class="detail-types">${typesHtml}</div>
            </div>
            <div>${favBtn.outerHTML}</div>
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
          <div><strong>Height:</strong> ${U.formatHeight(p.height)}</div>
          <div><strong>Weight:</strong> ${U.formatWeight(p.weight)}</div>
        </div>
      </section>

      <nav class="detail-nav" aria-label="Pokémon navigation">
        ${prevId
          ? `<a href="pokemon.html?id=${prevId}" class="btn btn-secondary">← Previous</a>`
          : `<button class="btn btn-secondary" disabled aria-label="Previous (first Pokémon)">← Previous</button>`
        }
        <a href="pokedex.html" class="btn">Back to Pokédex</a>
        ${nextId
          ? `<a href="pokemon.html?id=${nextId}" class="btn btn-secondary">Next →</a>`
          : `<button class="btn btn-secondary" disabled aria-label="Next (last Pokémon)">Next →</button>`
        }
      </nav>
    </article>
  `;

  // Update page title
  document.title = `PixelDex - ${U.capitalize(p.name)} (#${String(p.id).padStart(3, '0')})`;
}

// ==========================================================================
// Initialization
// ==========================================================================

function init() {
  if (!window.POKEMON) {
    showError('Pokémon data not loaded');
    return;
  }

  const id = parseInt(U.getUrlParam('id'), 10);

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

  // Event delegation for favorite button (works with innerHTML rendering)
  container.addEventListener('click', handleFavoriteClick);
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

// Run init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  U.initTheme();
  U.initHamburger();
  U.highlightCurrentPage();
  init();
});