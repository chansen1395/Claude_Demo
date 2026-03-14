import type { HistoryEntry, SimStats } from './types';
import { CFG } from './config';
import { Creature, resetCreatureId } from './creature';
import { Food } from './food';
import { Particle } from './particle';
import { TAU, hsl } from './utils';

export class Simulation {
  creatures: Creature[] = [];
  food: Food[] = [];
  particles: Particle[] = [];
  time = 0;
  ticks = 0;
  foodAcc = 0;
  history: HistoryEntry[] = [];
  histTimer = 0;
  mutRate = CFG.MUT_RATE;
  bestFitness = 0;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.creatures = [];
    this.food = [];
    this.particles = [];
    this.time = 0;
    this.ticks = 0;
    this.foodAcc = 0;
    this.history = [];
    this.histTimer = 0;
    this.mutRate = CFG.MUT_RATE;
    this.bestFitness = 0;
    resetCreatureId();

    for (let herbIndex = 0; herbIndex < CFG.INIT_HERBS; herbIndex++)
      this.creatures.push(new Creature(Math.random() * CFG.W, Math.random() * CFG.H, 'herb'));
    for (let carnivoreIndex = 0; carnivoreIndex < CFG.INIT_CARNS; carnivoreIndex++)
      this.creatures.push(new Creature(Math.random() * CFG.W, Math.random() * CFG.H, 'carn'));
    for (let omnivoreIndex = 0; omnivoreIndex < CFG.INIT_OMNIS; omnivoreIndex++)
      this.creatures.push(new Creature(Math.random() * CFG.W, Math.random() * CFG.H, 'omni'));
    for (let foodIndex = 0; foodIndex < CFG.INIT_FOOD; foodIndex++)
      this.food.push(new Food(Math.random() * CFG.W, Math.random() * CFG.H));
  }

  burst(x: number, y: number, color: string, particleCount: number, speed: number): void {
    for (let particleIndex = 0; particleIndex < particleCount; particleIndex++) {
      const angle = Math.random() * TAU;
      const particleSpeed = speed * (0.5 + Math.random() * 0.5);
      this.particles.push(
        new Particle(x, y, Math.cos(angle) * particleSpeed, Math.sin(angle) * particleSpeed, color, 0.4 + Math.random() * 0.3),
      );
    }
  }

  update(dt: number): void {
    dt = Math.min(dt, 0.025);
    this.time += dt;
    this.ticks++;

    // Update creatures
    for (const creature of this.creatures) creature.update(dt, this);

    // Herbivores & omnivores eat food
    for (const creature of this.creatures) {
      if (creature.dead || creature.carn || !creature.wantsEat) continue;
      for (const foodItem of this.food) {
        if (foodItem.eaten) continue;
        if (dist2d(creature, foodItem) < creature.eatR) {
          const foodEnergy = creature.herb ? CFG.HERB_FOOD_E : CFG.OMNI_FOOD_E;
          creature.energy = Math.min(creature.energy + foodEnergy, creature.maxE);
          creature.foodEaten++;
          creature.fitness += 1;
          foodItem.eaten = true;
          this.burst(foodItem.x, foodItem.y, hsl(140, 100, 60), 6, 70);
          break;
        }
      }
    }

    // Carnivores eat herbivores & omnivores
    for (const creature of this.creatures) {
      if (creature.dead || !creature.carn || !creature.wantsEat) continue;
      for (const prey of this.creatures) {
        if (prey.dead || prey.carn) continue;
        if (dist2d(creature, prey) < creature.eatR) {
          creature.energy = Math.min(creature.energy + CFG.CARN_PREY_E, creature.maxE);
          creature.foodEaten++;
          creature.fitness += 5;
          prey.dead = true;
          this.burst(prey.x, prey.y, hsl(0, 100, 55), 10, 100);
          break;
        }
      }
    }

    // Omnivores eat herbivores
    for (const creature of this.creatures) {
      if (creature.dead || !creature.omni || !creature.wantsEat) continue;
      for (const prey of this.creatures) {
        if (prey.dead || !prey.herb) continue;
        if (dist2d(creature, prey) < creature.eatR) {
          creature.energy = Math.min(creature.energy + CFG.OMNI_PREY_E, creature.maxE);
          creature.foodEaten++;
          creature.fitness += 3;
          prey.dead = true;
          this.burst(prey.x, prey.y, hsl(30, 100, 55), 8, 80);
          break;
        }
      }
    }

    // Reproduce
    const offspring: Creature[] = [];
    for (const creature of this.creatures) {
      if (creature.dead) continue;
      const child = creature.reproduce(this);
      if (child) {
        offspring.push(child);
        creature.fitness += 2;
        this.burst(child.x, child.y, hsl(50, 100, 70), 5, 40);
      }
    }
    for (const child of offspring) this.creatures.push(child);

    // Remove dead creatures + death particles
    for (let creatureIndex = this.creatures.length - 1; creatureIndex >= 0; creatureIndex--) {
      const creature = this.creatures[creatureIndex]!;
      if (creature.dead) {
        this.burst(creature.x, creature.y, hsl(creature.hue, 60, 40), 8, 60);
        if (creature.fitness > this.bestFitness) this.bestFitness = creature.fitness;
        this.creatures.splice(creatureIndex, 1);
      }
    }

    // Update food
    for (const foodItem of this.food) foodItem.update(dt);
    this.food = this.food.filter(foodItem => !foodItem.eaten);

    // Spawn food
    this.foodAcc += dt * CFG.FOOD_RATE;
    while (this.foodAcc >= 1 && this.food.length < CFG.MAX_FOOD) {
      this.food.push(new Food(Math.random() * CFG.W, Math.random() * CFG.H));
      this.foodAcc--;
    }

    // Population management
    let herbs = 0, carns = 0, omnis = 0;
    for (const creature of this.creatures) {
      if (creature.herb) herbs++;
      else if (creature.carn) carns++;
      else omnis++;
    }
    if (this.creatures.length > CFG.MAX_POP) {
      this.creatures.sort((leftCreature, rightCreature) => rightCreature.fitness - leftCreature.fitness);
      this.creatures.length = CFG.MAX_POP;
      herbs = 0; carns = 0; omnis = 0;
      for (const creature of this.creatures) {
        if (creature.herb) herbs++;
        else if (creature.carn) carns++;
        else omnis++;
      }
    }
    while (herbs < CFG.MIN_HERBS) {
      this.creatures.push(new Creature(Math.random() * CFG.W, Math.random() * CFG.H, 'herb'));
      herbs++;
    }
    while (carns < CFG.MIN_CARNS) {
      this.creatures.push(new Creature(Math.random() * CFG.W, Math.random() * CFG.H, 'carn'));
      carns++;
    }
    while (omnis < CFG.MIN_OMNIS) {
      this.creatures.push(new Creature(Math.random() * CFG.W, Math.random() * CFG.H, 'omni'));
      omnis++;
    }

    // Update particles
    for (const particle of this.particles) particle.update(dt);
    this.particles = this.particles.filter(particle => !particle.dead);

    // Record history
    this.histTimer += dt;
    if (this.histTimer >= 0.5) {
      this.histTimer -= 0.5;
      herbs = 0; carns = 0; omnis = 0;
      for (const creature of this.creatures) {
        if (creature.herb) herbs++;
        else if (creature.carn) carns++;
        else omnis++;
      }
      this.history.push({ h: herbs, c: carns, o: omnis });
      if (this.history.length > 360) this.history.shift();
    }
  }

  stats(): SimStats {
    let herbs = 0, carns = 0, omnis = 0, herbEnergyTotal = 0, carnivoreEnergyTotal = 0, omnivoreEnergyTotal = 0, maxGeneration = 0;
    let bestFitness = this.bestFitness;
    for (const creature of this.creatures) {
      if (creature.herb) { herbs++; herbEnergyTotal += creature.energy; }
      else if (creature.carn) { carns++; carnivoreEnergyTotal += creature.energy; }
      else { omnis++; omnivoreEnergyTotal += creature.energy; }
      if (creature.gen > maxGeneration) maxGeneration = creature.gen;
      if (creature.fitness > bestFitness) bestFitness = creature.fitness;
    }
    this.bestFitness = bestFitness;
    return {
      herbs, carns, omnis,
      food: this.food.length,
      hE: herbs ? Math.round(herbEnergyTotal / herbs) : 0,
      cE: carns ? Math.round(carnivoreEnergyTotal / carns) : 0,
      oE: omnis ? Math.round(omnivoreEnergyTotal / omnis) : 0,
      maxGen: maxGeneration,
      bestFit: bestFitness.toFixed(1),
      time: this.time,
    };
  }
}

/** Inline distance — avoids importing from utils to break circular dependency risk */
function dist2d(pointA: { x: number; y: number }, pointB: { x: number; y: number }): number {
  const deltaX = pointA.x - pointB.x;
  const deltaY = pointA.y - pointB.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
