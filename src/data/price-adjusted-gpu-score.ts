import type { Gpu, Product } from '../types';
import { addressableGpuVram, gpuMarketPriceRange, type PriceRange } from './gpu-owner-comparison';
import { scoreApplesComparableGpus, type ApplesLlmScore } from './apples-llm-score';

export const BUYER_SCORE_WEIGHTS = {
  performance: 0.425,
  value: 0.425,
  vram: 0.15,
} as const;

export const MIN_BUYER_VRAM_GB = 24;

export interface PriceAdjustedGpuScore {
  product: Gpu;
  performance: ApplesLlmScore;
  priceRange: PriceRange;
  representativePriceCents: number;
  performancePerDollar: number;
  valueIndex: number;
  addressableVramGb: number;
  vramIndex: number;
  score: number;
  rank: number;
}

export function isIndividualGpu(gpu: Gpu) {
  return gpu.category === 'gpu';
}

export function meetsBuyerVramGate(gpu: Gpu) {
  return addressableGpuVram(gpu) >= MIN_BUYER_VRAM_GB;
}

function roundIndex(value: number) {
  return Number(value.toFixed(1));
}

/**
 * Adds acquisition value to the exact fixed-control performance score for
 * individually purchased cards. Complete systems and clusters live in their
 * own scoring surface; this score covers the card asking price only and does
 * not imply that host, cooling, or chassis cost is included.
 */
export function scorePriceAdjustedGpus(products: Product[]): PriceAdjustedGpuScore[] {
  const priced = scoreApplesComparableGpus(products).flatMap((performance) => {
    if (!isIndividualGpu(performance.product) || !meetsBuyerVramGate(performance.product)) return [];
    const priceRange = gpuMarketPriceRange(performance.product);
    if (!priceRange) return [];
    const representativePriceCents = (priceRange.lowCents + priceRange.highCents) / 2;
    const performancePerDollar = performance.score / (representativePriceCents / 100);
    const addressableVramGb = addressableGpuVram(performance.product);
    return [{
      product: performance.product,
      performance,
      priceRange,
      representativePriceCents,
      performancePerDollar,
      addressableVramGb,
    }];
  });

  if (priced.length === 0) return [];
  const bestPerformancePerDollar = Math.max(...priced.map((entry) => entry.performancePerDollar));
  const largestAddressableVram = Math.max(...priced.map((entry) => entry.addressableVramGb));
  const sorted = priced.map((entry) => {
    const valueIndex = roundIndex(entry.performancePerDollar / bestPerformancePerDollar * 100);
    const vramIndex = roundIndex(entry.addressableVramGb / largestAddressableVram * 100);
    const score = roundIndex(
      entry.performance.score * BUYER_SCORE_WEIGHTS.performance
      + valueIndex * BUYER_SCORE_WEIGHTS.value
      + vramIndex * BUYER_SCORE_WEIGHTS.vram,
    );
    return { ...entry, valueIndex, vramIndex, score };
  }).sort((a, b) => b.score - a.score
    || b.performance.score - a.performance.score
    || a.representativePriceCents - b.representativePriceCents
    || a.product.name.localeCompare(b.product.name));

  let previousScore: number | undefined;
  let previousRank = 0;
  return sorted.map((entry, index) => {
    const rank = entry.score === previousScore ? previousRank : index + 1;
    previousScore = entry.score;
    previousRank = rank;
    return { ...entry, rank };
  });
}

export function formatRepresentativePrice(score: PriceAdjustedGpuScore) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(score.representativePriceCents / 100);
}
