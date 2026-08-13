import type { Gpu, Product } from '../types';
import { qualifiedLlmBenchmarkFor } from './qualified-llm-benchmarks';

export type OwnedGpuKey = 'rtx4070super' | 'rtx3090';
export type GpuComparisonMetric =
  | 'tokens'
  | 'vram'
  | 'bandwidth'
  | 'processors'
  | 'power'
  | 'referencePrice'
  | 'marketPrice';

export type OwnedGpuBaseline = {
  key: OwnedGpuKey;
  shortLabel: string;
  productId: string;
  gpu: Gpu;
};

export type PriceRange = {
  lowCents: number;
  highCents: number;
  source: 'screened-ebay' | 'owner-market-range';
  sourceLabel: string;
  observedAt: string;
};

export const ownedGpuDefinitions = [
  { key: 'rtx4070super', shortLabel: '4070S', productId: 'nvidia-rtx-4070-super' },
  { key: 'rtx3090', shortLabel: '3090', productId: 'nvidia-rtx-3090' },
] as const;

export const ownerMarketPriceRanges: Partial<Record<string, PriceRange>> = {
  'nvidia-rtx-5090': {
    lowCents: 430000,
    highCents: 530000,
    source: 'owner-market-range',
    sourceLabel: 'Owner-provided current-market range',
    observedAt: '2026-08-12',
  },
  'nvidia-tesla-v100-pcie-32': {
    lowCents: 50000,
    highCents: 60000,
    source: 'owner-market-range',
    sourceLabel: 'Owner-provided used-market range',
    observedAt: '2026-08-12',
  },
};

export function ownedGpuBaselines(products: Product[]): OwnedGpuBaseline[] {
  return ownedGpuDefinitions.flatMap((definition) => {
    const product = products.find((candidate): candidate is Gpu => (
      candidate.category === 'gpu' && candidate.id === definition.productId
    ));
    return product ? [{ ...definition, gpu: product }] : [];
  });
}

export function gpuMarketPriceRange(gpu: Gpu): PriceRange | undefined {
  const override = ownerMarketPriceRanges[gpu.id];
  if (override) return override;
  const listings = gpu.usedMarket?.listings ?? [];
  if (listings.length === 0) return undefined;
  const prices = listings.map((listing) => listing.amountCents).sort((a, b) => a - b);
  return {
    lowCents: prices[0],
    highCents: prices.at(-1) ?? prices[0],
    source: 'screened-ebay',
    sourceLabel: `${listings.length} screened eBay ${listings.length === 1 ? 'ask' : 'asks'}`,
    observedAt: gpu.usedMarket?.observedAt ?? '',
  };
}

export function formatGpuMarketPriceRange(range: PriceRange) {
  const money = (cents: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(cents / 100);
  const low = money(range.lowCents);
  const high = money(range.highCents);
  return low === high ? low : `${low}–${high}`;
}

export function addressableGpuVram(gpu: Gpu) {
  return gpu.addressableVramGb ?? (gpu.memoryPool === 'split' && gpu.gpuCount
    ? gpu.vramGb / gpu.gpuCount
    : gpu.vramGb);
}

export function comparableGpuBandwidth(gpu: Gpu) {
  if (gpu.memoryBandwidthGbS === undefined) return undefined;
  return gpu.memoryPool === 'split' && gpu.gpuCount
    ? gpu.memoryBandwidthGbS / gpu.gpuCount
    : gpu.memoryBandwidthGbS;
}

function fixedControlTokens(gpu: Gpu) {
  return gpu.llmBenchmarks?.find((result) => result.profileKey === 'llama2-7b-q4_0-tg128-no-fa')
    ?.generatedTokensPerSecond ?? qualifiedLlmBenchmarkFor(gpu.id)?.generatedTokensPerSecond;
}

export function gpuComparisonValue(gpu: Gpu, metric: GpuComparisonMetric): number | undefined {
  if (metric === 'tokens') return fixedControlTokens(gpu);
  if (metric === 'vram') return addressableGpuVram(gpu);
  if (metric === 'bandwidth') return comparableGpuBandwidth(gpu);
  if (metric === 'processors') return gpu.parallelProcessors?.count;
  if (metric === 'power') return gpu.boardPowerW || undefined;
  if (metric === 'referencePrice') return gpu.price.amountCents || undefined;
  const range = gpuMarketPriceRange(gpu);
  return range ? (range.lowCents + range.highCents) / 2 : undefined;
}

export function processorCountsComparable(gpu: Gpu, baseline: Gpu) {
  return Boolean(gpu.parallelProcessors && baseline.parallelProcessors
    && gpu.parallelProcessors.label === baseline.parallelProcessors.label);
}

export function comparisonDirection(value: number | undefined, baseline: number | undefined) {
  if (value === undefined || baseline === undefined) return 'unknown' as const;
  if (value > baseline) return 'up' as const;
  if (value < baseline) return 'down' as const;
  return 'equal' as const;
}

export function comparisonDirectionForMetric(
  metric: GpuComparisonMetric,
  value: number | undefined,
  baseline: number | undefined,
) {
  const direction = comparisonDirection(value, baseline);
  if (metric !== 'power') return direction;
  if (direction === 'up') return 'down' as const;
  if (direction === 'down') return 'up' as const;
  return direction;
}
