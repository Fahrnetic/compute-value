import { describe, expect, it } from 'vitest';
import { getProducts } from '../../server/database';
import { scorePriceAdjustedGpus } from './price-adjusted-gpu-score';

describe('price-adjusted individual GPU score', () => {
  const scores = scorePriceAdjustedGpus(getProducts());

  it('scores only exact-control individual cards with a market price', () => {
    expect(scores).toHaveLength(14);
    expect(scores.every(({ product, priceRange }) => product.category === 'gpu' && priceRange.lowCents > 0)).toBe(true);
    expect(scores.every(({ addressableVramGb }) => addressableVramGb >= 24)).toBe(true);
    expect(scores.some(({ product }) => product.id === 'nvidia-h200-nvl')).toBe(false);
    expect(scores.some(({ product }) => product.id === 'nvidia-rtx-4090')).toBe(false);
    expect(scores.some(({ product }) => product.id === 'nvidia-rtx-4070-super')).toBe(false);
  });

  it('uses the owner market range for the RTX 5090 and penalizes its acquisition cost', () => {
    expect(scores.find(({ product }) => product.id === 'nvidia-rtx-5090')).toMatchObject({
      product: { id: 'nvidia-rtx-5090' },
      representativePriceCents: 480000,
      valueIndex: 30.5,
      vramIndex: 50,
      score: 63,
      rank: 2,
    });
  });

  it('applies the owner-provided $500–$600 range only to the measured 32 GB V100', () => {
    expect(scores.find(({ product }) => product.id === 'nvidia-tesla-v100-pcie-32')).toMatchObject({
      representativePriceCents: 55000,
      valueIndex: 100,
      vramIndex: 50,
      score: 66,
      rank: 1,
      product: { vramGb: 32 },
    });
    expect(scores.some(({ product }) => product.id === 'nvidia-tesla-v100s-pcie-32')).toBe(false);
  });

  it('lets verified used price change the order of otherwise comparable cards', () => {
    const v100 = scores.find(({ product }) => product.id === 'nvidia-tesla-v100-pcie-32');
    const rtx5090 = scores.find(({ product }) => product.id === 'nvidia-rtx-5090');
    expect(v100!.performance.score).toBeLessThan(rtx5090!.performance.score);
    expect(v100!.score).toBeGreaterThan(rtx5090!.score);
  });

  it('caps VRAM influence at fifteen percent of the buyer score', () => {
    expect(scores.find(({ product }) => product.id === 'amd-instinct-mi210')).toMatchObject({
      addressableVramGb: 64,
      vramIndex: 100,
    });
  });
});
