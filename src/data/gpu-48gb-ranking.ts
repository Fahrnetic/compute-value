import type { Gpu, Product } from '../types';
import { addressableGpuVram, gpuMarketPriceRange, type PriceRange } from './gpu-owner-comparison';
import { scoreApplesComparableGpus, type ApplesLlmScore } from './apples-llm-score';
import { scorePriceAdjustedGpus, type PriceAdjustedGpuScore } from './price-adjusted-gpu-score';
import { gpu48GbPriceSignalFor, type Gpu48GbPriceSignal } from './gpu-48gb-price-research';

export type Gpu48GbRankingEntry = {
  product: Gpu;
  status: 'buyer-scored' | 'performance-only' | 'missing-control';
  rank?: number;
  performance?: ApplesLlmScore;
  buyer?: PriceAdjustedGpuScore;
  marketPrice?: PriceRange;
  priceSignal?: Gpu48GbPriceSignal;
};

export function buildGpu48GbRanking(products: Product[]): Gpu48GbRankingEntry[] {
  const performanceById = new Map(scoreApplesComparableGpus(products).map((score) => [score.product.id, score]));
  const buyerById = new Map(scorePriceAdjustedGpus(products).map((score) => [score.product.id, score]));

  const sorted = products.filter((product): product is Gpu => (
    product.category === 'gpu' && addressableGpuVram(product) === 48
  )).map((product) => {
    const performance = performanceById.get(product.id);
    const buyer = buyerById.get(product.id);
    return {
      product,
      performance,
      buyer,
      marketPrice: gpuMarketPriceRange(product),
      priceSignal: gpu48GbPriceSignalFor(product.id),
      status: buyer ? 'buyer-scored' : performance ? 'performance-only' : 'missing-control',
    } satisfies Omit<Gpu48GbRankingEntry, 'rank'>;
  }).sort((a, b) => {
    if (a.buyer && b.buyer) return b.buyer.score - a.buyer.score
      || b.performance!.score - a.performance!.score
      || a.product.name.localeCompare(b.product.name);
    if (a.buyer) return -1;
    if (b.buyer) return 1;
    if (a.performance && b.performance) return b.performance.score - a.performance.score
      || a.product.name.localeCompare(b.product.name);
    if (a.performance) return -1;
    if (b.performance) return 1;
    return a.product.manufacturer.localeCompare(b.product.manufacturer)
      || a.product.name.localeCompare(b.product.name);
  });

  let scoredIndex = 0;
  let previousScore: number | undefined;
  let previousRank = 0;
  return sorted.map((entry) => {
    if (!entry.buyer) return entry;
    scoredIndex += 1;
    const rank = entry.buyer.score === previousScore ? previousRank : scoredIndex;
    previousScore = entry.buyer.score;
    previousRank = rank;
    return { ...entry, rank };
  });
}
