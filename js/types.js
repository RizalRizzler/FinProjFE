/**
 * PixelDex - Type Chart Logic (Simplified - Static Only)
 * 18-type effectiveness matrix (modern with Fairy)
 * Static table generation only - no click highlighting
 * Uses window.PixelDexUtils for shared functionality
 */

const U = window.PixelDexUtils;

// ==========================================================================
// Type Effectiveness Data (Modern 18-type chart with Fairy)
// Values: 2 = super effective, 1 = normal, 0.5 = not very effective, 0 = no effect
// Rows = Attacking type, Columns = Defending type
// ==========================================================================

const TYPE_ORDER = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Pre-computed effectiveness matrix
// [attacking][defending] = multiplier
const EFFECTIVENESS = {
  normal:     { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:       { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2, fairy: 2 },
  water:      { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric:   { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:      { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:        { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting:   { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:     { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:     { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:     { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:    { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:        { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:       { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:      { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:     { dragon: 2, steel: 0.5, fairy: 0 },
  dark:       { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:      { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, fairy: 2, steel: 0.5 },
  fairy:      { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// ==========================================================================
// Helper Functions
// ==========================================================================

function getEffectiveness(atk, def) {
  if (EFFECTIVENESS[atk] && EFFECTIVENESS[atk][def] !== undefined) {
    return EFFECTIVENESS[atk][def];
  }
  return 1;
}

function formatMultiplier(mult) {
  switch (mult) {
    case 2: return '2';
    case 0.5: return '½';
    case 0: return '0';
    default: return '1';
  }
}

// ==========================================================================
// Build Chart
// ==========================================================================

function buildChart() {
  const chartTable = document.getElementById('type-chart');
  if (!chartTable) return;

  const thead = chartTable.querySelector('thead tr');
  const tbody = chartTable.querySelector('tbody');

  // Build column headers (defending types)
  TYPE_ORDER.forEach(type => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.className = 'type-chart-header';
    th.innerHTML = `<span class="type-badge ${type}" style="font-size: 9px; padding: 2px 6px;">${U.capitalize(type)}</span>`;
    thead.appendChild(th);
  });

  // Build rows (attacking types)
  TYPE_ORDER.forEach(atkType => {
    const tr = document.createElement('tr');

    // Row header (attacking type)
    const th = document.createElement('th');
    th.scope = 'row';
    th.innerHTML = `<span class="type-badge ${atkType}">${U.capitalize(atkType)}</span>`;
    tr.appendChild(th);

    // Cells for each defending type
    TYPE_ORDER.forEach(defType => {
      const td = document.createElement('td');
      const multiplier = getEffectiveness(atkType, defType);
      td.dataset.effectiveness = multiplier;
      td.textContent = formatMultiplier(multiplier);
      td.setAttribute('role', 'gridcell');
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

// ==========================================================================
// Initialize
// ==========================================================================

function init() {
  buildChart();
}

// Run init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  U.initTheme();
  U.initHamburger();
  U.highlightCurrentPage();
  init();
});