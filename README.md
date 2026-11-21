# PixelDex

PixelDex is a fan-made, browser-based Pokémon encyclopedia inspired by classic GBA/NDS pixel interfaces.

Browse all 1,025 Pokémon, view their stats and abilities, filter the Pokédex, compare types, and save favorites.

## Features

- Random featured Pokémon and randomized starter picks on the home page
- Searchable Pokédex with type, generation, and favorites filters
- Detailed Pokémon pages with stats, abilities, height, and weight
- 18×18 type effectiveness chart
- Light and dark mode with persistent preferences
- Pokémon sprite fallbacks and placeholder artwork
- Responsive layout for desktop and mobile

## Pages

- `index.html` - Home page, featured Pokémon, starter picks, and main menu
- `pokedex.html` - Searchable and filterable Pokémon grid
- `pokemon.html` - Individual Pokémon details
- `types.html` - Type effectiveness matrix

## Project Structure

```text
.
├── assets/          # Sprite backgrounds and fallback artwork
├── css/
│   └── style.css    # Shared layouts, themes, components, and responsive styles
├── js/
│   ├── data.js      # Pokémon dataset
│   ├── utils.js     # Shared theme, navigation, sprite, and formatting helpers
│   ├── pokedex.js   # Pokédex search and filtering
│   ├── pokemon.js   # Pokémon detail rendering
│   └── types.js     # Type chart rendering
├── tools/
│   └── build-data.js # Optional PokéAPI data generator
├── index.html
├── pokedex.html
├── pokemon.html
└── types.html
```

## Getting Started

PixelDex uses plain HTML, CSS, and JavaScript with no build step or package installation.

1. Clone or download the repository.
2. Open `index.html` directly in a browser, or serve the project with a local static server.

For example, using Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

Using a local server is recommended because it provides consistent browser behavior for linked pages and assets.

## Updating Pokémon Data

The Pokémon dataset is stored in `js/data.js`.

To regenerate it from PokéAPI:

```bash
node tools/build-data.js
```

Node.js and internet access are required. The generator is configured for 1,025 Pokémon from all nine generations.

## Data and Assets

- Pokémon data and descriptions: [PokéAPI](https://pokeapi.co/)
- Pokémon sprites: [PokeAPI/sprites](https://github.com/PokeAPI/sprites)
- Pokémon artwork and names are the property of their respective owners.

## Disclaimer

This is a fan-made educational project. It is not affiliated with Nintendo, Creatures Inc., GAME FREAK inc., or The Pokémon Company. Pokémon and all related names are trademarks of their respective owners.
