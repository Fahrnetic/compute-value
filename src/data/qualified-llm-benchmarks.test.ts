import { describe, expect, it } from 'vitest';
import { allProducts } from '../../server/catalog';
import { qualifiedLlmBenchmarkFor, qualifiedLlmBenchmarks } from './qualified-llm-benchmarks';

describe('qualified fixed-workload LLM evidence', () => {
  it('stores the exact RTX 4060 Ti 16GB decode and prompt result', () => {
    expect(qualifiedLlmBenchmarkFor('nvidia-rtx-4060-ti-16')).toMatchObject({
      hardware: 'NVIDIA GeForce RTX 4060 Ti 16GB',
      quantization: 'Q4_0',
      gpuCount: 1,
      gpuLayers: 99,
      flashAttention: false,
      promptTokens: 512,
      generatedTokens: 128,
      promptTokensPerSecond: 2219.31,
      generatedTokensPerSecond: 61.8,
    });
  });

  it('maps every qualified result to one exact catalog card', () => {
    const ids = new Set(allProducts.map((product) => product.id));
    expect(qualifiedLlmBenchmarks.every((result) => ids.has(result.productId))).toBe(true);
  });
});
