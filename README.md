# PixelDex

A fan-made Pokémon wiki and Pokédex reference with a GBA/NDS pixel-art identity, covering all 9 generations (1025 Pokémon).

![PixelDex Screenshot](assets/screenshot-home.png)

## Live Demo

**[https://yourusername.github.io/pixeldex/](https://yourusername.github.io/pixeldex/)**

*(Replace `yourusername` with your actual GitHub username after deployment)*

## Screenshots

| Home | Pokédex | Pokémon Detail | Type Chart |
|------|---------|----------------|------------|
| ![Home](assets/screenshot-home.png) | ![Pokédex](assets/screenshot-pokedex.png) | ![Detail](assets/screenshot-detail.png) | ![Types](assets/screenshot-types.png) |

| Mobile View | NDS Skin |
|-------------|----------|
| ![Mobile](assets/screenshot-mobile.png) | ![NDS](assets/screenshot-nds.png) |

## Features

- **Complete Pokédex**: Browse all 1,025 Pokémon (Generations 1-9)
- **Search & Filter**: Real-time search by name, filter by type (multi-select) and generation
- **Detail Pages**: Bulbapedia-style pages with sprites, type badges, base stat bars, abilities, height/weight, and prev/next navigation
- **Type Effectiveness Chart**: Interactive 18×18 matrix (modern with Fairy) - click any type to highlight matchups
- **Dual Skins**: Switch between **GBA** (bright, saturated) and **NDS** (soft, pastel) visual themes - preference saved to localStorage
- **Responsive Design**: 4-column grid (desktop) → 2-column (tablet) → 1-column (mobile), hamburger menu on mobile
- **Typewriter Dialogue**: Animated intro text on the home page
- **Pixel-Perfect Rendering**: `image-rendering: pixelated` on all sprites, chunky pixel borders
- **Accessible**: Semantic HTML, keyboard navigation, ARIA labels, focus states
- **Offline-Capable**: All Pokémon data bundled locally (no runtime API calls)
- **Zero Dependencies**: Vanilla HTML, CSS, and JavaScript (no build step)

## Tech Stack

- **HTML5** - Semantic markup (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- **CSS3** - Custom properties for theming, Grid/Flexbox layouts, media queries, animations
- **Vanilla JavaScript (ES6+)** - Modules pattern, debounced search, localStorage persistence
- **PokéAPI** - Pokémon data source (fetched at build time)
- **PokeAPI/sprites** - Sprite images (hotlinked with fallback)
- **Google Fonts** - Press Start 2P (display) + Pixelify Sans (body)

## Project Structure

```
pixeldex/
├── index.html          # Landing page with typewriter intro & featured Pokémon
├── pokedex.html        # Browse all Pokémon with search & filters
├── pokemon.html        # Detail page (reads ?id= from URL)
├── types.html          # 18-type effectiveness chart
├── css/
│   └── style.css       # Complete design system (both skins, responsive)
├── js/
│   ├── data.js         # Generated Pokémon data (1025 entries)
│   ├── main.js         # Shared: skin toggle, hamburger menu, footer, utilities
│   ├── pokedex.js      # Search, type/gen filters, card grid rendering
│   ├── pokemon.js      # Detail page: URL param, stat bars, prev/next nav
│   └── types.js        # Type chart matrix & click highlighting
├── tools/
│   └── build-data.js   # Node script to generate data.js from PokéAPI
├── assets/
│   └── placeholder.png # Fallback sprite
└── README.md
```

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pixeldex.git
   cd pixeldex
   ```

2. Open `index.html` directly in your browser, or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node (npx serve)
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. Visit `http://localhost:8000`

### Regenerating Pokémon Data (Optional)

If you want to update the Pokémon data (e.g., when new games release):

```bash
node tools/build-data.js
```

This fetches fresh data from PokéAPI and overwrites `js/data.js`.

## Data Credits

- **Pokémon Data**: [PokéAPI](https://pokeapi.co/) - The open Pokémon REST API
- **Sprites**: [PokeAPI/sprites](https://github.com/PokeAPI/sprites) - Official sprite repository
- **Fonts**: 
  - [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) by CodeMan38
  - [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) by GGBotNet

## Disclaimer

> Fan-made project. Not affiliated with Nintendo, Creatures Inc., GAME FREAK inc., or The Pokémon Company. Pokémon and all related names are their respective trademarks.

This project is for educational purposes only, created as a final project for the **Study Club Front End Basic** course at **Dignition Veterantech**.

## License

This project is open source and available under the [MIT License](LICENSE).