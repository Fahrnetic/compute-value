import { describe, expect, it } from 'vitest';
import { allProducts } from '../../server/catalog';
import { llmBenchmarkSeeds } from '../../server/llm-benchmarks';
import type { LlmBenchmarkResult, Product } from '../types';
import { scoreApplesComparableGpus } from './apples-llm-score';

const measurements = new Map(llmBenchmarkSeeds.map(({ productId, ...result }) => [productId, result]));
const productsWithMeasurements = allProducts.map((product): Product => {
  const benchmark = measurements.get(product.id);
  return benchmark ? { ...product, llmBenchmarks: [benchmark as LlmBenchmarkResult] } as Product : product;
});

describe('apples-to-apples LLM score', () => {
  const scores = scoreApplesComparableGpus(productsWithMeasurements);

  it('scores every discrete GPU with the exact fixed-control result and no other hardware', () => {
    expect(scores).toHaveLength(34);
    expect(scores.every(({ product, benchmark }) => product.category === 'gpu'
      && benchmark.profileKey === 'llama2-7b-q4_0-tg128-no-fa')).toBe(true);
    expect(scores.some(({ product }) => product.id === 'nvidia-dgx-spark')).toBe(false);
    expect(scores.some(({ product }) => product.id === 'nvidia-h200-nvl')).toBe(false);
  });

  it('uses the exact performance phases only and anchors the fastest card at 100', () => {
    expect(scores[0]).toMatchObject({
      product: { id: 'nvidia-rtx-5090' },
      score: 100,
      rank: 1,
      decodeIndex: 100,
      promptIndex: 100,
    });
    expect(scores.every(({ score }) => score > 0 && score <= 100)).toBe(true);
  });

  it('keeps the user-owned cards in the same global score cohort', () => {
    expect(scores.find(({ product }) => product.id === 'nvidia-rtx-3090')).toMatchObject({ score: 49.2 });
    expect(scores.find(({ product }) => product.id === 'nvidia-rtx-4070-super')).toMatchObject({ score: 36.1 });
  });

  it('scores NVIDIA and AMD together while preserving both vendor cohorts', () => {
    expect(scores.filter(({ product }) => product.manufacturer === 'NVIDIA')).toHaveLength(24);
    expect(scores.filter(({ product }) => product.manufacturer === 'AMD')).toHaveLength(10);
  });
});
