import type { NNLayer } from './types';
import { gaussRand, sigmoid, TAU } from './utils';

export class NN {
  readonly topo: readonly number[];
  readonly layers: NNLayer[];

  constructor(topo: readonly number[]) {
    this.topo = topo;
    this.layers = [];
    for (let layerIndex = 0; layerIndex < topo.length - 1; layerIndex++) {
      const inputSize = topo[layerIndex]!;
      const outputSize = topo[layerIndex + 1]!;
      const initScale = Math.sqrt(2 / (inputSize + outputSize));
      const weights = new Float64Array(outputSize * inputSize);
      const biases = new Float64Array(outputSize);
      for (let weightIndex = 0; weightIndex < weights.length; weightIndex++) weights[weightIndex] = gaussRand() * initScale;
      for (let biasIndex = 0; biasIndex < biases.length; biasIndex++) biases[biasIndex] = gaussRand() * initScale * 0.01;
      this.layers.push({ w: weights, b: biases });
    }
  }

  forward(input: ArrayLike<number>): Float64Array[] {
    const activations: Float64Array[] = [new Float64Array(input)];
    let currentValues = activations[0]!;
    for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
      const { w: weights, b: biases } = this.layers[layerIndex]!;
      const inputSize = this.topo[layerIndex]!;
      const outputSize = this.topo[layerIndex + 1]!;
      const outputValues = new Float64Array(outputSize);
      const isOutputLayer = layerIndex === this.layers.length - 1;
      for (let outputIndex = 0; outputIndex < outputSize; outputIndex++) {
        let weightedSum = biases[outputIndex]!;
        for (let inputIndex = 0; inputIndex < inputSize; inputIndex++) {
          weightedSum += weights[outputIndex * inputSize + inputIndex]! * currentValues[inputIndex]!;
        }
        outputValues[outputIndex] = isOutputLayer ? sigmoid(weightedSum) : Math.tanh(weightedSum);
      }
      activations.push(outputValues);
      currentValues = outputValues;
    }
    return activations;
  }

  genome(): Float64Array {
    let genomeLength = 0;
    for (const layer of this.layers) genomeLength += layer.w.length + layer.b.length;
    const genome = new Float64Array(genomeLength);
    let writeOffset = 0;
    for (const layer of this.layers) {
      genome.set(layer.w, writeOffset);
      writeOffset += layer.w.length;
      genome.set(layer.b, writeOffset);
      writeOffset += layer.b.length;
    }
    return genome;
  }

  setGenome(genome: Float64Array): void {
    let readOffset = 0;
    for (const layer of this.layers) {
      layer.w.set(genome.subarray(readOffset, readOffset + layer.w.length));
      readOffset += layer.w.length;
      layer.b.set(genome.subarray(readOffset, readOffset + layer.b.length));
      readOffset += layer.b.length;
    }
  }

  clone(): NN {
    const clonedNetwork = new NN(this.topo);
    clonedNetwork.setGenome(new Float64Array(this.genome()));
    return clonedNetwork;
  }

  static crossover(parentA: NN, parentB: NN): Float64Array {
    const genomeA = parentA.genome();
    const genomeB = parentB.genome();
    const childGenome = new Float64Array(genomeA.length);
    for (let geneIndex = 0; geneIndex < childGenome.length; geneIndex++) {
      childGenome[geneIndex] = Math.random() < 0.5 ? genomeA[geneIndex]! : genomeB[geneIndex]!;
    }
    return childGenome;
  }
}

export function mutate(genome: Float64Array, rate: number, str: number): Float64Array {
  const mutatedGenome = new Float64Array(genome);
  for (let geneIndex = 0; geneIndex < mutatedGenome.length; geneIndex++) {
    if (Math.random() < rate) {
      mutatedGenome[geneIndex]! += gaussRand() * (Math.random() < 0.1 ? str * 5 : str);
    }
  }
  return mutatedGenome;
}

/* Re-export TAU so consumers don't need two imports */
export { TAU };
