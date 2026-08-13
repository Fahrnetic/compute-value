import { describe, expect, it } from 'vitest';
import { getProducts } from '../../server/database';
import { addressableGpuVram } from './gpu-owner-comparison';
import { buildGpu48GbRanking } from './gpu-48gb-ranking';

describe('48 GB GPU ranking', () => {
  const entries = buildGpu48GbRanking(getProducts());

  it('contains every and only exactly-48 GB addressable card', () => {
    expect(entries).toHaveLength(13);
    expect(entries.every(({ product }) => addressableGpuVram(product) === 48)).toBe(true);
  });

  it('ranks the six cards with both the exact control and market price', () => {
    const ranked = entries.filter((entry) => entry.buyer);
    expect(ranked).toHaveLength(6);
    expect(ranked.map(({ product, rank }) => [product.id, rank])).toEqual([
      ['nvidia-rtx-6000-ada', 1],
      ['nvidia-l40', 2],
      ['nvidia-rtx-a6000', 3],
      ['nvidia-a40', 4],
      ['nvidia-quadro-rtx-8000', 5],
      ['amd-radeon-pro-w7900', 6],
    ]);
  });

  it('records a dated price audit for all 13 cards without treating weaker evidence as used pricing', () => {
    expect(entries.filter((entry) => entry.marketPrice || entry.priceSignal)).toHaveLength(13);
    expect(entries.filter((entry) => entry.marketPrice)).toHaveLength(10);
    expect(entries.filter((entry) => entry.priceSignal?.evidenceStatus === 'screened-non-used')).toHaveLength(2);
    expect(entries.filter((entry) => entry.priceSignal?.evidenceStatus === 'seller-screen-failed')).toHaveLength(1);

    const rtx5880 = entries.find(({ product }) => product.id === 'nvidia-rtx-5880-ada');
    expect(rtx5880?.marketPrice).toMatchObject({ lowCents: 429995, highCents: 515000 });

    const pro5000 = entries.find(({ product }) => product.id === 'nvidia-rtx-pro-5000-blackwell-48');
    expect(pro5000?.marketPrice).toMatchObject({ lowCents: 761999, highCents: 761999 });

    const w7800 = entries.find(({ product }) => product.id === 'amd-radeon-pro-w7800-48');
    expect(w7800?.priceSignal).toMatchObject({
      condition: 'used-rejected',
      evidenceStatus: 'seller-screen-failed',
      lowCents: 244900,
    });
    expect(w7800?.marketPrice).toBeUndefined();
  });

  it('keeps unmeasured Blackwell and L40S cards visible but unscored', () => {
    const pro5000 = entries.find(({ product }) => product.id === 'nvidia-rtx-pro-5000-blackwell-48');
    const l40s = entries.find(({ product }) => product.id === 'nvidia-l40s');
    expect(pro5000).toMatchObject({ status: 'missing-control' });
    expect(l40s).toMatchObject({ status: 'missing-control' });
    expect(pro5000?.rank).toBeUndefined();
    expect(l40s?.rank).toBeUndefined();
  });
});
