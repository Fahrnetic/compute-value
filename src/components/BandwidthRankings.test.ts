import { describe, expect, it } from 'vitest';
import { allProducts } from '../../server/catalog';
import { llmBenchmarkSeeds } from '../../server/llm-benchmarks';
import type { LlmBenchmarkResult, Product } from '../types';
import { isNvidiaAmpereOrNewer, rankBandwidthProducts, rankLlmProducts } from './BandwidthRankings';

describe('bandwidth rankings', () => {
  it('orders GPU memory bandwidth fastest first and gives equal results the same rank', () => {
    const rankings = rankBandwidthProducts(allProducts, 'gpu-memory');
    expect(rankings[0]).toMatchObject({
      rank: 1,
      bandwidthGbS: 4800,
      product: { id: 'nvidia-h200-nvl' },
    });
    expect(rankings.find((entry) => entry.product.id === 'nvidia-h100-nvl')?.rank).toBe(3);
    expect(rankings.find((entry) => entry.product.id === 'nvidia-h800-nvl')?.rank).toBe(3);
  });

  it('normalizes a split multi-GPU board to the bandwidth available to one GPU', () => {
    const v340 = rankBandwidthProducts(allProducts, 'gpu-memory')
      .find((entry) => entry.product.id === 'amd-radeon-pro-v340');
    expect(v340?.bandwidthGbS).toBe(484);
    expect(v340?.qualifier).toContain('968 GB/s total');
  });

  it('ranks CPU memory and motherboard expansion fabrics independently', () => {
    const cpu = rankBandwidthProducts(allProducts, 'cpu-memory')[0];
    const board = rankBandwidthProducts(allProducts, 'motherboard-pcie')[0];
    expect(cpu).toMatchObject({ rank: 1, bandwidthGbS: 409.6 });
    expect(board).toMatchObject({
      rank: 1,
      bandwidthGbS: 409.6,
      product: { id: 'asus-pro-ws-wrx90e-sage-se' },
    });
  });

  it('leaves products without a published metric out of the ranking', () => {
    const rankings = rankBandwidthProducts(allProducts, 'motherboard-pcie');
    expect(rankings).toHaveLength(3);
    expect(rankings.some((entry) => entry.product.id === 'asus-rog-strix-x870e-e')).toBe(false);
  });
});

describe('LLM throughput rankings', () => {
  const measurements = new Map(llmBenchmarkSeeds.map(({ productId, ...result }) => [productId, result]));
  const measuredProducts = allProducts.map((product): Product => product.category === 'gpu'
    ? { ...product, llmBenchmarks: measurements.has(product.id)
      ? [measurements.get(product.id) as LlmBenchmarkResult]
      : [] }
    : product);

  it('orders measured tg128 tokens per second fastest first', () => {
    const rankings = rankLlmProducts(measuredProducts);
    expect(rankings).toHaveLength(34);
    expect(rankings[0]).toMatchObject({
      rank: 1,
      product: { id: 'nvidia-rtx-5090' },
      benchmark: { generatedTokensPerSecond: 290.02 },
    });
    expect(rankings.at(-1)).toMatchObject({ product: { id: 'amd-radeon-pro-v620' } });
  });

  it('leaves unmeasured GPUs out instead of estimating from bandwidth or core count', () => {
    const rankings = rankLlmProducts(measuredProducts);
    expect(rankings.some((entry) => entry.product.id === 'nvidia-h200-nvl')).toBe(false);
  });
});

describe('NVIDIA Ampere+ research scope', () => {
  it('includes Ampere, Ada, Hopper, and Blackwell while excluding older and non-NVIDIA GPUs', () => {
    const byId = new Map(allProducts.map((product) => [product.id, product]));
    expect(isNvidiaAmpereOrNewer(byId.get('nvidia-rtx-3090')!)).toBe(true);
    expect(isNvidiaAmpereOrNewer(byId.get('nvidia-rtx-4070-super')!)).toBe(true);
    expect(isNvidiaAmpereOrNewer(byId.get('nvidia-h200-nvl')!)).toBe(true);
    expect(isNvidiaAmpereOrNewer(byId.get('nvidia-titan-rtx')!)).toBe(false);
    expect(isNvidiaAmpereOrNewer(byId.get('amd-rx-7900-xtx')!)).toBe(false);
  });
});
