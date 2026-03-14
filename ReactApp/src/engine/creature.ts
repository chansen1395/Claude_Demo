import type { Species, TrailPoint } from './types';
import { CFG } from './config';
import { NN, mutate } from './nn';
import { TAU, clamp, dist, normAngle } from './utils';
import type { Simulation } from './simulation';

let _cid = 0;
export function resetCreatureId(): void {
  _cid = 0;
}

export class Creature {
  readonly id: number;
  x: number;
  y: number;
  readonly species: Species;
  readonly brain: NN;
  readonly gen: number;
  heading: number;
  speed: number;
  readonly herb: boolean;
  readonly carn: boolean;
  readonly omni: boolean;
  readonly maxE: number;
  readonly maxSpd: number;
  readonly maxTrn: number;
  readonly eatR: number;
  readonly meta: number;
  readonly sz: number;
  energy: number;
  fitness: number;
  foodEaten: number;
  age: number;
  dead: boolean;
  wantsEat: boolean;
  trail: TrailPoint[];
  acts: Float64Array[] | null;
  lastRepro: number;
  readonly hue: number;

  constructor(x: number, y: number, species: Species, brain?: NN, gen?: number) {
    this.id = _cid++;
    this.x = clamp(x, 5, CFG.W - 5);
    this.y = clamp(y, 5, CFG.H - 5);
    this.species = species;
    this.brain = brain ?? new NN(CFG.TOPOLOGY);
    this.gen = gen ?? 0;
    this.heading = Math.random() * TAU;
    this.speed = 0;
    this.herb = species === 'herb';
    this.carn = species === 'carn';
    this.omni = species === 'omni';

    if (this.herb) {
      this.maxE = CFG.HERB_MAX_E;
      this.maxSpd = CFG.HERB_SPEED;
      this.maxTrn = CFG.HERB_TURN;
      this.eatR = CFG.HERB_EAT_R;
      this.meta = CFG.HERB_META;
      this.sz = CFG.HERB_SZ;
    } else if (this.carn) {
      this.maxE = CFG.CARN_MAX_E;
      this.maxSpd = CFG.CARN_SPEED;
      this.maxTrn = CFG.CARN_TURN;
      this.eatR = CFG.CARN_EAT_R;
      this.meta = CFG.CARN_META;
      this.sz = CFG.CARN_SZ;
    } else {
      this.maxE = CFG.OMNI_MAX_E;
      this.maxSpd = CFG.OMNI_SPEED;
      this.maxTrn = CFG.OMNI_TURN;
      this.eatR = CFG.OMNI_EAT_R;
      this.meta = CFG.OMNI_META;
      this.sz = CFG.OMNI_SZ;
    }

    this.energy = this.maxE * 0.6;
    this.fitness = 0;
    this.foodEaten = 0;
    this.age = 0;
    this.dead = false;
    this.wantsEat = false;
    this.trail = [];
    this.acts = null;
    this.lastRepro = -5;
    this.hue = this._hue();
  }

  private _hue(): number {
    const genome = this.brain.genome();
    let hueSeed = 0;
    for (let geneIndex = 0; geneIndex < Math.min(10, genome.length); geneIndex++) {
      hueSeed += Math.abs(genome[geneIndex]!) * (geneIndex + 1);
    }
    hueSeed = (hueSeed * 137.508) % 1;
    if (this.herb) return Math.floor(100 + hueSeed * 120);
    if (this.carn) return Math.floor((345 + hueSeed * 55) % 360);
    return Math.floor(25 + hueSeed * 40);
  }

  private _wallDist(relAngle: number): number {
    const rayAngle = this.heading + relAngle;
    const directionX = Math.cos(rayAngle);
    const directionY = Math.sin(rayAngle);
    let minDistance = CFG.SENSE;
    if (Math.abs(directionX) > 0.001) {
      minDistance = Math.min(minDistance, directionX > 0 ? (CFG.W - this.x) / directionX : -this.x / directionX);
    }
    if (Math.abs(directionY) > 0.001) {
      minDistance = Math.min(minDistance, directionY > 0 ? (CFG.H - this.y) / directionY : -this.y / directionY);
    }
    return Math.max(0, minDistance);
  }

  sense(simulation: Simulation): Float64Array {
    const sensoryInputs = new Float64Array(10);

    // Food: plants for herbs, herbivores for carns, both for omnis
    let nearestFoodEntity: { x: number; y: number } | null = null;
    let nearestFoodDistance = CFG.SENSE;
    if (this.herb || this.omni) {
      for (const foodItem of simulation.food) {
        if (foodItem.eaten) continue;
        const foodDistance = dist(this, foodItem);
        if (foodDistance < nearestFoodDistance) { nearestFoodDistance = foodDistance; nearestFoodEntity = foodItem; }
      }
    }
    if (this.carn || this.omni) {
      for (const candidateCreature of simulation.creatures) {
        if (candidateCreature.dead || !candidateCreature.herb) continue;
        const preyDistance = dist(this, candidateCreature);
        if (preyDistance < nearestFoodDistance) { nearestFoodDistance = preyDistance; nearestFoodEntity = candidateCreature; }
      }
    }
    if (nearestFoodEntity) {
      sensoryInputs[0] = normAngle(Math.atan2(nearestFoodEntity.y - this.y, nearestFoodEntity.x - this.x) - this.heading) / Math.PI;
      sensoryInputs[1] = nearestFoodDistance / CFG.SENSE;
    } else {
      sensoryInputs[1] = 1;
    }

    // Threat: predators
    let nearestThreatEntity: { x: number; y: number } | null = null;
    let nearestThreatDistance = CFG.SENSE;
    if (this.herb || this.omni) {
      for (const candidateCreature of simulation.creatures) {
        if (candidateCreature.dead || candidateCreature === this) continue;
        const isThreat = this.herb ? (candidateCreature.carn || candidateCreature.omni) : candidateCreature.carn;
        if (!isThreat) continue;
        const threatDistance = dist(this, candidateCreature);
        if (threatDistance < nearestThreatDistance) { nearestThreatDistance = threatDistance; nearestThreatEntity = candidateCreature; }
      }
    }
    if (nearestThreatEntity) {
      sensoryInputs[2] = normAngle(Math.atan2(nearestThreatEntity.y - this.y, nearestThreatEntity.x - this.x) - this.heading) / Math.PI;
      sensoryInputs[3] = nearestThreatDistance / CFG.SENSE;
    } else {
      sensoryInputs[3] = 1;
    }

    // Friend: nearest same species
    let nearestAllyEntity: { x: number; y: number } | null = null;
    let nearestAllyDistance = CFG.SENSE;
    for (const candidateCreature of simulation.creatures) {
      if (candidateCreature.dead || candidateCreature === this || candidateCreature.species !== this.species) continue;
      const allyDistance = dist(this, candidateCreature);
      if (allyDistance < nearestAllyDistance) { nearestAllyDistance = allyDistance; nearestAllyEntity = candidateCreature; }
    }
    if (nearestAllyEntity) {
      sensoryInputs[4] = normAngle(Math.atan2(nearestAllyEntity.y - this.y, nearestAllyEntity.x - this.x) - this.heading) / Math.PI;
      sensoryInputs[5] = nearestAllyDistance / CFG.SENSE;
    } else {
      sensoryInputs[5] = 1;
    }

    sensoryInputs[6] = this.energy / this.maxE;
    sensoryInputs[7] = this._wallDist(0) / CFG.SENSE;
    sensoryInputs[8] = this._wallDist(Math.PI * 0.5) / CFG.SENSE;
    sensoryInputs[9] = this._wallDist(-Math.PI * 0.5) / CFG.SENSE;
    return sensoryInputs;
  }

  update(dt: number, sim: Simulation): void {
    if (this.dead) return;
    this.age += dt;

    const sensoryInputs = this.sense(sim);
    const activations = this.brain.forward(sensoryInputs);
    this.acts = activations;
    const outputLayer = activations[activations.length - 1]!;

    const turnAmount = (outputLayer[0]! * 2 - 1) * this.maxTrn;
    this.heading = normAngle(this.heading + turnAmount);
    this.speed = outputLayer[1]! * this.maxSpd;
    this.wantsEat = outputLayer[2]! > 0.5;

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > CFG.TRAIL) this.trail.shift();

    this.x += Math.cos(this.heading) * this.speed * dt;
    this.y += Math.sin(this.heading) * this.speed * dt;

    // Bounce off walls
    if (this.x < 3) { this.x = 3; this.heading = Math.PI - this.heading; }
    if (this.x > CFG.W - 3) { this.x = CFG.W - 3; this.heading = Math.PI - this.heading; }
    if (this.y < 3) { this.y = 3; this.heading = -this.heading; }
    if (this.y > CFG.H - 3) { this.y = CFG.H - 3; this.heading = -this.heading; }
    this.heading = normAngle(this.heading);

    const speedFraction = this.speed / this.maxSpd;
    this.energy -= (this.meta + speedFraction * 2) * dt;
    this.fitness += dt * 0.1;

    if (this.energy <= 0) { this.energy = 0; this.dead = true; }
  }

  reproduce(sim: Simulation): Creature | null {
    const reproductionThreshold = this.herb ? CFG.HERB_REPR_T : this.carn ? CFG.CARN_REPR_T : CFG.OMNI_REPR_T;
    const reproductionCost = this.herb ? CFG.HERB_REPR_C : this.carn ? CFG.CARN_REPR_C : CFG.OMNI_REPR_C;
    if (this.energy < this.maxE * reproductionThreshold) return null;
    if (sim.time - this.lastRepro < 2) return null;

    // Find nearby mate
    let mate: Creature | null = null;
    let nearestMateDistance = 120;
    for (const candidateCreature of sim.creatures) {
      if (candidateCreature.dead || candidateCreature === this || candidateCreature.species !== this.species) continue;
      if (candidateCreature.energy < candidateCreature.maxE * reproductionThreshold) continue;
      const mateDistance = dist(this, candidateCreature);
      if (mateDistance < nearestMateDistance) { nearestMateDistance = mateDistance; mate = candidateCreature; }
    }

    let childBrain: NN;
    if (mate) {
      const crossoverGenome = NN.crossover(this.brain, mate.brain);
      const mutatedGenome = mutate(crossoverGenome, sim.mutRate, CFG.MUT_STR);
      childBrain = new NN(CFG.TOPOLOGY);
      childBrain.setGenome(mutatedGenome);
      mate.energy -= mate.maxE * reproductionCost * 0.5;
      mate.lastRepro = sim.time;
    } else {
      childBrain = this.brain.clone();
      const mutatedGenome = mutate(childBrain.genome(), sim.mutRate, CFG.MUT_STR);
      childBrain.setGenome(mutatedGenome);
    }

    const spawnAngle = Math.random() * TAU;
    const child = new Creature(
      this.x + Math.cos(spawnAngle) * 20,
      this.y + Math.sin(spawnAngle) * 20,
      this.species,
      childBrain,
      Math.max(this.gen, mate ? mate.gen : 0) + 1,
    );
    const energyCost = this.maxE * reproductionCost;
    this.energy -= energyCost;
    child.energy = energyCost * (mate ? 1.3 : 1);
    child.energy = clamp(child.energy, 10, child.maxE * 0.6);
    this.lastRepro = sim.time;
    return child;
  }
}
