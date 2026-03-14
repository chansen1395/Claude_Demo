# GENESIS — Neuroevolution Ecosystem Simulator

A real-time neuroevolution ecosystem simulator built with React, TypeScript, Vite, and styled-components. Watch neural-network-driven creatures evolve, hunt, forage, and reproduce in a dynamic 2D environment.

## Features

- **Three species** — Herbivores (green), Carnivores (red), and Omnivores (orange) interact in a complete food chain
- **Neural networks** — Each creature has a `[10, 8, 6, 3]` feed-forward neural network controlling movement and feeding behavior
- **Genetic algorithm** — Crossover + gaussian mutation drive evolution across generations
- **Real-time visualization** — HiDPI-aware simulation canvas, live neural network inspector, and population dynamics graph
- **Interactive** — Click creatures to inspect their brain, double-click to spawn food, keyboard shortcuts for speed control

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- npm (included with Node.js)

### Install & Run

```bash
# Navigate to the ReactApp directory
cd ReactApp

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (Vite default).

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Controls

| Control | Action |
|---------|--------|
| **Click** canvas | Select a creature to inspect its neural network |
| **Double-click** canvas | Spawn food at cursor position |
| **Space** | Toggle pause/play |
| **+** / **-** | Increase/decrease simulation speed |
| Speed slider | 1×–10× simulation speed |
| Mutation slider | 1%–30% mutation rate |
| Trails button | Toggle movement trails |
| Reset button | Reset the entire simulation |

## Project Structure

```
src/
├── main.tsx                   # React entry point
├── App.tsx                    # Main app component & game loop
├── theme.ts                   # Theme constants for styled-components
├── styled.d.ts                # styled-components TypeScript augmentation
├── vite-env.d.ts              # Vite type references
├── engine/                    # Pure TypeScript simulation engine
│   ├── types.ts               # Shared type definitions
│   ├── config.ts              # Simulation configuration constants
│   ├── utils.ts               # Math utilities (TAU, clamp, dist, etc.)
│   ├── nn.ts                  # Neural network & mutation
│   ├── creature.ts            # Creature class (sensing, movement, reproduction)
│   ├── food.ts                # Food entity
│   ├── particle.ts            # Visual effect particles
│   └── simulation.ts          # Main simulation loop & state
├── renderers/                 # Pure canvas drawing functions
│   ├── simRenderer.ts         # Simulation canvas renderer
│   ├── brainRenderer.ts       # Neural network visualizer
│   └── graphRenderer.ts       # Population graph renderer
└── components/                # React functional components (styled-components)
    ├── Header.tsx             # App header bar
    ├── SimCanvas.tsx          # Simulation canvas with click/dblclick handlers
    ├── BrainPanel.tsx         # Brain visualizer panel with stats
    ├── StatsPanel.tsx         # Population & ecosystem statistics
    ├── GraphPanel.tsx         # Population dynamics line graph
    └── Controls.tsx           # Footer controls (pause, speed, mutation, trails, reset)
```

## Tech Stack

- **React 18** — Functional components with hooks
- **TypeScript** — Strict mode, fully typed
- **Vite** — Fast dev server & build tool
- **styled-components** — CSS-in-JS, themed styling (no raw HTML tags)
- **Canvas 2D** — HiDPI-aware rendering for simulation, brain, and graph
