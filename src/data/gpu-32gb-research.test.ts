import { describe, expect, it } from 'vitest';
import { allProducts } from '../../server/catalog';
import { llmBenchmarkSeeds } from '../../server/llm-benchmarks';
import { addressableGpuMemory, physical32GbGpus, qualified32GbResults } from './gpu-32gb-research';

describe('32 GB GPU research coverage', () => {
  const cards = physical32GbGpus(allProducts);

  it('audits every catalog board carrying 32 GB of physical VRAM', () => {
    expect(cards).toHaveLength(21);
    expect(cards.map((card) => card.id)).toEqual(expect.arrayContaining([
      'nvidia-rtx-5090',
      'nvidia-tesla-v100-pcie-32',
      'nvidia-tesla-v100s-pcie-32',
      'amd-radeon-pro-v620',
    ]));
  });

  it('separates unified 32 GB devices from split-memory boards', () => {
    const split = cards.filter((card) => addressableGpuMemory(card) < 32);
    expect(split.map((card) => card.id).sort()).toEqual([
      'amd-radeon-pro-duo-polaris',
      'amd-radeon-pro-v340',
    ]);
  });

  it('keeps seven strict control results and three qualified measurements separate', () => {
    const ids = new Set(cards.map((card) => card.id));
    expect(llmBenchmarkSeeds.filter((result) => ids.has(result.productId))).toHaveLength(7);
    expect(qualified32GbResults).toHaveLength(3);
    expect(qualified32GbResults.every((result) => !llmBenchmarkSeeds.some((seed) => seed.productId === result.productId))).toBe(true);
  });
});
