import { describe, expect, it } from 'vitest';
import { allProducts } from '../../server/catalog';
import { legacyLlama2Profile, legacyLlama2ResultFor, legacyLlama2Suite } from './universal-llama2-benchmarks';

describe('archival universal Llama 2 suite', () => {
  it('keeps one model, quant, topology, and three-run profile', () => {
    expect(legacyLlama2Profile).toMatchObject({
      model: 'Llama 2 7B', quantization: 'Q4_0', gpuCount: 1, repetitions: 3,
    });
    expect(legacyLlama2Suite).toHaveLength(8);
    legacyLlama2Suite.forEach((result) => {
      expect(result.promptTrials).toHaveLength(3);
      expect(result.generationTrials).toHaveLength(3);
      expect(result.generatedTokensPerSecond).toBeGreaterThan(0);
    });
  });

  it('maps every result to an exact catalog GPU', () => {
    const catalogIds = new Set(allProducts.map((product) => product.id));
    expect(legacyLlama2Suite.every((result) => catalogIds.has(result.productId))).toBe(true);
  });

  it('preserves the newly extracted A100 and H100 means', () => {
    expect(legacyLlama2ResultFor('nvidia-a100-pcie-80')).toMatchObject({
      generatedTokensPerSecond: 136.24, promptTokensPerSecond: 3443.98,
    });
    expect(legacyLlama2ResultFor('nvidia-h100-pcie-80')).toMatchObject({
      generatedTokensPerSecond: 133.77, promptTokensPerSecond: 4868.59,
    });
  });
});
