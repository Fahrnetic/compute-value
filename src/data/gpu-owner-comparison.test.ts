import { describe, expect, it } from 'vitest';
import { allProducts } from '../../server/catalog';
import { ebaySellerRule, ebayUsedMarketSeeds } from '../../server/ebay-market';
import { gpuParallelProcessors, llmBenchmarkSeeds } from '../../server/llm-benchmarks';
import type { Gpu } from '../types';
import {
  comparisonDirection,
  comparisonDirectionForMetric,
  gpuComparisonValue,
  gpuMarketPriceRange,
  ownedGpuBaselines,
  processorCountsComparable,
} from './gpu-owner-comparison';

function hydratedGpu(productId: string): Gpu {
  const product = allProducts.find((candidate): candidate is Gpu => candidate.category === 'gpu' && candidate.id === productId);
  if (!product) throw new Error(`Missing test GPU ${productId}`);
  const market = ebayUsedMarketSeeds.find((snapshot) => snapshot.productId === productId);
  return {
    ...product,
    parallelProcessors: gpuParallelProcessors[productId],
    llmBenchmarks: llmBenchmarkSeeds.filter((result) => result.productId === productId),
    usedMarket: market ? {
      marketplace: 'eBay', condition: 'used', sellerRule: ebaySellerRule, ...market,
    } : undefined,
  };
}

describe('owner GPU comparison baseline', () => {
  const owned = [hydratedGpu('nvidia-rtx-4070-super'), hydratedGpu('nvidia-rtx-3090')];
  const baselines = ownedGpuBaselines(owned);

  it('uses the exact owned 4070 SUPER and 3090 as two persistent baselines', () => {
    expect(baselines.map((baseline) => [baseline.shortLabel, baseline.productId])).toEqual([
      ['4070S', 'nvidia-rtx-4070-super'],
      ['3090', 'nvidia-rtx-3090'],
    ]);
  });

  it('shows the RTX 5090 as higher than both owned cards on every raw core stat and current price', () => {
    const rtx5090 = hydratedGpu('nvidia-rtx-5090');
    (['tokens', 'vram', 'bandwidth', 'processors', 'referencePrice', 'marketPrice'] as const).forEach((metric) => {
      expect(baselines.map((baseline) => comparisonDirection(
        gpuComparisonValue(rtx5090, metric), gpuComparisonValue(baseline.gpu, metric),
      ))).toEqual(['up', 'up']);
    });
    expect(gpuMarketPriceRange(rtx5090)).toMatchObject({
      lowCents: 430000, highCents: 530000, source: 'owner-market-range',
    });
  });

  it('keeps the owner-provided V100 range scoped to the measured 32 GB card', () => {
    expect(gpuMarketPriceRange(hydratedGpu('nvidia-tesla-v100-pcie-32'))).toMatchObject({
      lowCents: 50000, highCents: 60000, source: 'owner-market-range',
    });
    expect(gpuMarketPriceRange(hydratedGpu('nvidia-tesla-v100s-pcie-32'))).toMatchObject({
      source: 'screened-ebay',
    });
  });

  it('inverts power arrows so lower draw points up and higher draw points down', () => {
    const rtx5090 = hydratedGpu('nvidia-rtx-5090');
    expect(baselines.map((baseline) => comparisonDirectionForMetric(
      'power', gpuComparisonValue(rtx5090, 'power'), gpuComparisonValue(baseline.gpu, 'power'),
    ))).toEqual(['down', 'down']);

    expect(comparisonDirectionForMetric(
      'power', gpuComparisonValue(baselines[0].gpu, 'power'), gpuComparisonValue(baselines[1].gpu, 'power'),
    )).toBe('up');
  });

  it('does not compare AMD stream-processor counts with NVIDIA CUDA-core counts', () => {
    const amd = hydratedGpu('amd-rx-7900-xtx');
    expect(baselines.every((baseline) => !processorCountsComparable(amd, baseline.gpu))).toBe(true);
  });
});
