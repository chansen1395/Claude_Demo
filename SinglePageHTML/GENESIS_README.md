# GENESIS — Neuroevolution Ecosystem Simulator

A real-time artificial life simulation where neural network-driven creatures evolve, hunt, reproduce, and die in a dynamic predator-prey ecosystem. Built entirely by AI agent orchestration using the AgentSwarm framework.

![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen) ![Single File](https://img.shields.io/badge/file-1%20HTML-blue) ![Lines](https://img.shields.io/badge/lines-~600%20JS-orange)

## Quick Start

Open `genesis.html` in any modern browser. That's it.

## What You're Watching

**50 herbivores** (green/blue hues) forage for food. **12 carnivores** (red/orange hues) hunt them. Every creature has a real neural network for a brain. No behavior is hand-coded — everything you see is *evolved*.

### Controls

| Input | Action |
|-------|--------|
| **Click** a creature | Inspect its neural network in real-time |
| **Double-click** canvas | Spawn food at that location |
| **Space** | Pause / Resume |
| **+** / **-** | Increase / Decrease simulation speed |
| Speed slider | 1×–10× simulation speed |
| Mutation slider | Adjust mutation rate (1%–30%) |
| Trails button | Toggle movement trails |
| Reset button | Restart the ecosystem |

## Architecture

### Neural Networks

Each creature has a feedforward neural network with topology **[10, 8, 6, 3]** — 163 trainable parameters per genome.

**Inputs (10 sensors):**
| # | Sensor | Description |
|---|--------|-------------|
| 0 | Food Direction | Relative angle to nearest food source (normalized) |
| 1 | Food Distance | Distance to nearest food (normalized to sense range) |
| 2 | Threat Direction | Relative angle to nearest predator |
| 3 | Threat Distance | Distance to nearest predator |
| 4 | Ally Direction | Relative angle to nearest same-species creature |
| 5 | Ally Distance | Distance to nearest ally |
| 6 | Energy | Current energy level (0–1) |
| 7 | Wall Front | Distance to wall ahead |
| 8 | Wall Left | Distance to wall on left |
| 9 | Wall Right | Distance to wall on right |

**Outputs (3 actions):**
| # | Output | Description |
|---|--------|-------------|
| 0 | Turn | Steering direction (-1 to +1) |
| 1 | Speed | Movement speed (0 to max) |
| 2 | Action | Eat/attack intention (>0.5 = engage) |

**Activations:** tanh for hidden layers, sigmoid for output layer. Weights initialized with Xavier initialization.

### Genetic Algorithm

- **Reproduction** — Creatures above 70% energy can reproduce. If a same-species mate is nearby, **uniform crossover** combines their genomes (50/50 per gene). Otherwise, the creature **clones** itself.
- **Mutation** — Gaussian noise applied at a configurable rate. 10% of mutations are **large leaps** (5× normal strength) to escape local optima.
- **Natural Selection** — No explicit fitness function drives selection. Creatures that eat more live longer, reproduce more, and pass on their genes. Evolution emerges from the environment.

### Species

| | Herbivore | Carnivore |
|---|-----------|-----------|
| **Food** | Plants (green dots) | Herbivores |
| **Max Speed** | 110 | 140 |
| **Max Energy** | 100 | 120 |
| **Metabolism** | 3/s | 5/s |
| **Color Range** | Greens/Blues (100°–220°) | Reds/Oranges (345°–40°) |

Colors are derived from genome hashing — genetically similar creatures look similar, so you can visually track lineages.

### Simulation Engine

- **Fixed timestep** physics (1/60s)
- **Wall bouncing** with heading reflection
- **Population management** — Minimum floors prevent extinction (15 herbivores, 5 carnivores), maximum cap at 200
- **Food ecology** — Plants respawn at a steady rate up to a carrying capacity

## Emergent Behaviors to Watch For

- **Food-seeking spirals** — Early herbivores evolve circular movements that cover ground efficiently
- **Predator-prey oscillations** — Carnivore population booms cause herbivore crashes, then carnivores starve, herbivores recover (Lotka-Volterra dynamics visible on the population graph)
- **Wall avoidance** — Creatures evolve to turn before hitting walls rather than bouncing
- **Pack formation** — Herbivores sometimes evolve to cluster, diluting predation risk
- **Pursuit strategies** — Carnivores evolve to intercept prey rather than chase directly
- **Speciation** — Isolated groups develop distinct genome signatures (visible as color clusters)

## Brain Visualizer

Click any creature to see its brain firing in real-time:

- **Connections** — Blue lines = negative weights, red lines = positive weights. Thickness = magnitude.
- **Nodes** — Brightness indicates activation level. Bright = high activity, dark = low.
- **Input labels** show what the creature is sensing.
- **Output labels** show the decisions being made.

Watch how a hunting carnivore's "Food Dir" and "Action" neurons fire together, or how a fleeing herbivore's "Threat Dir" drives its "Turn" output.

## How It Was Built

This application was built through **AgentSwarm orchestration** — a file-based multi-agent framework for VS Code Copilot:

1. **Architect Agent** — Designed the system architecture and wrote the decision record
2. **Implementer Agent #1** — Built the Neural Network engine and Genetic Algorithm
3. **Implementer Agent #2** — Built the Entity system and Simulation engine
4. **Implementer Agent #3** — Built the Renderer, Brain Visualizer, Graph, and UI
5. **Orchestrator** — Reviewed all outputs, identified and fixed 6 cross-module integration bugs, assembled the final application

All three implementer agents worked in **parallel** with self-contained context packets, then their outputs were integrated by the orchestrator.

## Technical Details

- **Zero dependencies** — No libraries, no frameworks, no build step
- **Single file** — Everything in one HTML file
- **~600 lines** of integrated JavaScript
- **Browser support** — Any modern browser with Canvas 2D and ES6+
- **Performance** — 60fps with 200+ entities at 1× speed

## License

Do whatever you want with it.
