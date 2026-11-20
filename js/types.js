/**
 * SpindaDex - Type Chart Logic
 * 18-type effectiveness matrix (modern with Fairy)
 * Click a type to highlight strengths/weaknesses/immunities
 */

(function() {
  'use strict';

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
  // State
  // ==========================================================================

  let highlightedType = null;

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const chartTable = document.getElementById('type-chart');
  const hintEl = document.getElementById('chart-hint');

  // ==========================================================================
  // Initialization
  // ==========================================================================

  function init() {
    buildChart();
    attachEventListeners();
  }

  // ==========================================================================
  // Build Chart
  // ==========================================================================

  function buildChart() {
    if (!chartTable) return;

    const thead = chartTable.querySelector('thead tr');
    const tbody = chartTable.querySelector('tbody');

    // Build column headers (defending types)
    TYPE_ORDER.forEach(type => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.className = 'type-chart-header';
      th.innerHTML = `<span class="type-badge ${type}" style="font-size: 9px; padding: 2px 6px;">${window.SpindaDex.capitalize(type)}</span>`;
      thead.appendChild(th);
    });

    // Build rows (attacking types)
    TYPE_ORDER.forEach(atkType => {
      const tr = document.createElement('tr');

      // Row header (attacking type)
      const th = document.createElement('th');
      th.scope = 'row';
      th.dataset.type = atkType;
      th.style.cursor = 'pointer';
      th.innerHTML = `<span class="type-badge ${atkType}">${window.SpindaDex.capitalize(atkType)}</span>`;
      th.addEventListener('click', () => toggleHighlight(atkType));
      th.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleHighlight(atkType);
        }
      });
      th.setAttribute('tabindex', '0');
      th.setAttribute('role', 'button');
      th.setAttribute('aria-pressed', 'false');
      th.setAttribute('aria-label', `Highlight ${window.SpindaDex.capitalize(atkType)} matchups`);
      tr.appendChild(th);

      // Cells for each defending type
      TYPE_ORDER.forEach(defType => {
        const td = document.createElement('td');
        const multiplier = getEffectiveness(atkType, defType);
        td.dataset.effectiveness = multiplier;
        td.dataset.attacking = atkType;
        td.dataset.defending = defType;
        td.textContent = formatMultiplier(multiplier);
        td.setAttribute('role', 'gridcell');
        td.setAttribute('aria-label', `${window.SpindaDex.capitalize(atkType)} vs ${window.SpindaDex.capitalize(defType)}: ${window.SpindaDex.getEffectivenessLabel(multiplier)}`);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

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
  // Highlight Logic
  // ==========================================================================

  function toggleHighlight(type) {
    if (highlightedType === type) {
      clearHighlight();
      return;
    }

    highlightedType = type;
    applyHighlight();
    updateHint();
  }

  function clearHighlight() {
    highlightedType = null;
    removeHighlightClasses();
    updateHint();
  }

  function applyHighlight() {
    if (!chartTable) return;

    removeHighlightClasses();

    // Highlight row header
    const rowHeader = chartTable.querySelector(`th[data-type="${highlightedType}"]`);
    if (rowHeader) {
      rowHeader.classList.add('highlighted');
      rowHeader.setAttribute('aria-pressed', 'true');
    }

    // Highlight cells in the row (attacking perspective)
    const rowCells = chartTable.querySelectorAll(`td[data-attacking="${highlightedType}"]`);
    rowCells.forEach(cell => {
      cell.classList.add('highlighted');
    });

    // Highlight cells in the column (defending perspective)
    const colCells = chartTable.querySelectorAll(`td[data-defending="${highlightedType}"]`);
    colCells.forEach(cell => {
      cell.classList.add('highlighted');
    });

    // Also highlight the defending type's row header
    const colHeader = chartTable.querySelector(`th[data-type="${highlightedType}"]`);
    if (colHeader && colHeader !== rowHeader) {
      colHeader.classList.add('highlighted');
    }
  }

  function removeHighlightClasses() {
    if (!chartTable) return;

    chartTable.querySelectorAll('.highlighted').forEach(el => {
      el.classList.remove('highlighted');
    });

    chartTable.querySelectorAll('th[aria-pressed="true"]').forEach(el => {
      el.setAttribute('aria-pressed', 'false');
    });
  }

  function updateHint() {
    if (!hintEl) return;

    if (highlightedType) {
      // Attacking perspective: what the highlighted type is effective against
      const superEffectiveAtk = [];
      const notVeryEffectiveAtk = [];
      const noEffectAtk = [];

      // Defending perspective: what the highlighted type is weak/resistant/immune to
      const weakTo = [];
      const resistantTo = [];
      const immuneTo = [];

      TYPE_ORDER.forEach(otherType => {
        // Attacking: highlightedType -> otherType
        const atkMult = getEffectiveness(highlightedType, otherType);
        if (atkMult === 2) superEffectiveAtk.push(window.SpindaDex.capitalize(otherType));
        else if (atkMult === 0.5) notVeryEffectiveAtk.push(window.SpindaDex.capitalize(otherType));
        else if (atkMult === 0) noEffectAtk.push(window.SpindaDex.capitalize(otherType));

        // Defending: otherType -> highlightedType
        const defMult = getEffectiveness(otherType, highlightedType);
        if (defMult === 2) weakTo.push(window.SpindaDex.capitalize(otherType));
        else if (defMult === 0.5) resistantTo.push(window.SpindaDex.capitalize(otherType));
        else if (defMult === 0) immuneTo.push(window.SpindaDex.capitalize(otherType));
      });

      hintEl.innerHTML = `
        <strong>${window.SpindaDex.capitalize(highlightedType)}</strong><br>
        <em>Attacking:</em> Super Effective vs ${superEffectiveAtk.join(', ') || '—'} | Not Very Effective vs ${notVeryEffectiveAtk.join(', ') || '—'} | No Effect vs ${noEffectAtk.join(', ') || '—'}<br>
        <em>Defending:</em> Weak to ${weakTo.join(', ') || '—'} | Resistant to ${resistantTo.join(', ') || '—'} | Immune to ${immuneTo.join(', ') || '—'}
      `;
    } else {
      hintEl.textContent = 'Click a type name to highlight its matchups. Click again or click elsewhere to clear.';
    }
  }

  function attachEventListeners() {
    // Click outside to clear
    document.addEventListener('click', (e) => {
      if (highlightedType && !chartTable.contains(e.target)) {
        clearHighlight();
      }
    });

    // Escape key to clear
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && highlightedType) {
        clearHighlight();
      }
    });
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