/**
 * SpindaDex - Data Generator
 * Fetches Pokémon data from PokéAPI and generates js/data.js
 * Run with: node tools/build-data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const POKEMON_LIMIT = 1025; // Gen 9 (Paldea) - update as needed
const OUTPUT_PATH = path.join(__dirname, '..', 'js', 'data.js');
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Generation ranges (National Dex)
const GENERATIONS = [
  { gen: 1, name: 'Kanto', start: 1, end: 151 },
  { gen: 2, name: 'Johto', start: 152, end: 251 },
  { gen: 3, name: 'Hoenn', start: 252, end: 386 },
  { gen: 4, name: 'Sinnoh', start: 387, end: 493 },
  { gen: 5, name: 'Unova', start: 494, end: 649 },
  { gen: 6, name: 'Kalos', start: 650, end: 721 },
  { gen: 7, name: 'Alola', start: 722, end: 809 },
  { gen: 8, name: 'Galar', start: 810, end: 905 },
  { gen: 9, name: 'Paldea', start: 906, end: 1025 },
];

function getGeneration(id) {
  for (const gen of GENERATIONS) {
    if (id >= gen.start && id <= gen.end) {
      return gen.gen;
    }
  }
  return 9; // Default to latest
}

function getGenerationName(id) {
  for (const gen of GENERATIONS) {
    if (id >= gen.start && id <= gen.end) {
      return gen.name;
    }
  }
  return 'Paldea';
}

// HTTP request helper
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Rate limiting - delay between requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch single Pokémon details
async function fetchPokemon(id) {
  const url = `${POKEAPI_BASE}/pokemon/${id}`;
  const data = await fetchJson(url);

  // Extract types
  const types = data.types
    .sort((a, b) => a.slot - b.slot)
    .map(t => t.type.name);

  // Extract stats
  const stats = {};
  data.stats.forEach(s => {
    const name = s.stat.name.replace('-', '');
    stats[name] = s.base_stat;
  });

  // Extract abilities (first is regular, check for hidden)
  const abilities = data.abilities
    .sort((a, b) => a.slot - b.slot)
    .map(a => ({
      name: a.ability.name,
      hidden: a.is_hidden
    }));

  // Height (decimetres) and weight (hectograms)
  const height = data.height;
  const weight = data.weight;

  return {
    id: data.id,
    name: data.name,
    types,
    stats: {
      hp: stats.hp || 0,
      attack: stats.attack || 0,
      defense: stats.defense || 0,
      spatk: stats['specialattack'] || 0,
      spdef: stats['specialdefense'] || 0,
      speed: stats.speed || 0
    },
    abilities,
    height,
    weight,
    gen: getGeneration(data.id),
    genName: getGenerationName(data.id)
  };
}

// Main build function
async function buildData() {
  console.log('🔧 SpindaDex Data Generator');
  console.log('============================');
  console.log(`Fetching ${POKEMON_LIMIT} Pokémon from PokéAPI...\n`);

  const pokemonList = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 1; i <= POKEMON_LIMIT; i++) {
    try {
      // Progress indicator
      process.stdout.write(`\r[${i}/${POKEMON_LIMIT}] Fetching #${i}...`);

      const pokemon = await fetchPokemon(i);
      pokemonList.push(pokemon);
      successCount++;

      // Small delay to be nice to the API
      if (i % 20 === 0) {
        await delay(100);
      }
    } catch (error) {
      errorCount++;
      console.error(`\n❌ Error fetching #${i}: ${error.message}`);
    }
  }

  console.log(`\n\n✅ Successfully fetched: ${successCount}`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`);
  }

  // Generate sprite URLs (Gen 8 icons as primary)
  console.log('\n🎨 Generating sprite URLs...');
  pokemonList.forEach(p => {
    const paddedId = String(p.id).padStart(3, '0');
    p.sprite = `${SPRITE_BASE}/versions/generation-viii/icons/${paddedId}.png`;
    p.spriteFallback = `${SPRITE_BASE}/${p.id}.png`;
  });

  // Sort by ID (should already be sorted, but just in case)
  pokemonList.sort((a, b) => a.id - b.id);

  // Generate output file
  console.log('\n📝 Writing js/data.js...');

  const output = `/**
 * SpindaDex - Pokémon Data
 * Generated from PokéAPI (https://pokeapi.co/)
 * Total: ${pokemonList.length} Pokémon
 * Generated: ${new Date().toISOString()}
 */

const POKEMON = ${JSON.stringify(pokemonList, null, 2)};

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { POKEMON };
}
`;

  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`✅ Data written to ${OUTPUT_PATH}`);
  console.log(`📊 File size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1)} KB`);

  // Print generation summary
  console.log('\n📈 Generation Summary:');
  GENERATIONS.forEach(gen => {
    const count = pokemonList.filter(p => p.gen === gen.gen).length;
    console.log(`  Gen ${gen.gen} (${gen.name}): ${count} Pokémon`);
  });

  console.log('\n🎉 Done! You can now use POKEMON array in your pages.');
}

// Run if executed directly
if (require.main === module) {
  buildData().catch(err => {
    console.error('💥 Build failed:', err);
    process.exit(1);
  });
}

module.exports = { buildData, fetchPokemon, GENERATIONS };