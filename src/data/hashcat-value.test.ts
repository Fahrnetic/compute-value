import { describe, expect, it } from 'vitest';
import { getProducts } from '../../server/database';
import { buildHashcatPotentials } from './hashcat-potential';
import {
  buildHashcatValueResults,
  hashcatAcquisitionPrice,
  hashcatConcurrentJobSlots,
  hashcatPriceOptions,
  hashcatRetailListings,
} from './hashcat-value';

describe('Hashcat power-per-dollar scoring', () => {
  const products = getProducts();
  const potentials = buildHashcatPotentials(products);

  it('uses the median screened eBay ask instead of a single cheapest listing', () => {
    const v100 = potentials.find((result) => result.product.id === 'nvidia-tesla-v100-pcie-32');
    expect(v100).toBeTruthy();
    if (!v100) throw new Error('Missing V100 fixture');
    const price = hashcatAcquisitionPrice(v100.product, 'eBay');
    expect(price).toMatchObject({
      source: 'eBay', condition: 'used', amountCents: 64199, lowCents: 63900,
      highCents: 64498, listingCount: 2,
    });
  });

  it('returns a literal hash-rate-per-$1,000 score without normalization', () => {
    const ranked = buildHashcatValueResults(potentials, 'ntlm', 'best-verified')
      .filter((result) => result.perThousandDollars !== undefined)
      .sort((a, b) => (b.perThousandDollars ?? 0) - (a.perThousandDollars ?? 0));
    expect(ranked.length).toBeGreaterThan(25);
    expect(ranked[0].product.id).toBe('nvidia-rtx-3080-ti');
    expect(ranked[0].perThousandDollars).toBeCloseTo(259.88, 1);
    expect(ranked[0]).not.toHaveProperty('valueScore');
  });

  it('keeps compact-hash speed independent from VRAM capacity', () => {
    const ranked = buildHashcatValueResults(potentials, 'ntlm', 'best-verified');
    const pro5000_48 = ranked.find((result) => result.product.id === 'nvidia-rtx-pro-5000-blackwell-48');
    const pro5000_72 = ranked.find((result) => result.product.id === 'nvidia-rtx-pro-5000-blackwell-72');
    const pro6000 = ranked.find((result) => result.product.id === 'nvidia-rtx-pro-6000-blackwell-workstation');

    expect(pro5000_48).toMatchObject({ ntlmGhS: 219.7833, addressableVramGb: 48 });
    expect(pro5000_72).toMatchObject({ ntlmGhS: 219.7833, addressableVramGb: 72 });
    expect(pro5000_72!.vramGbPerThousandDollars).toBeGreaterThan(pro5000_48!.vramGbPerThousandDollars!);
    expect(pro6000).toMatchObject({ ntlmGhS: 414.15, addressableVramGb: 96 });
    expect(pro6000!.perThousandDollars).toBeCloseTo(26.72, 1);
  });

  it('calculates conservative concurrent-job headroom without multiplying throughput', () => {
    const ranked = buildHashcatValueResults(potentials, 'ntlm', 'best-verified');
    const pro6000 = ranked.find((result) => result.product.id === 'nvidia-rtx-pro-6000-blackwell-workstation');
    const rtx5090 = ranked.find((result) => result.product.id === 'nvidia-rtx-5090');
    const splitA16 = ranked.find((result) => result.product.id === 'nvidia-a16');

    expect(hashcatConcurrentJobSlots(pro6000!.product, 8)).toBe(10);
    expect(hashcatConcurrentJobSlots(rtx5090!.product, 8)).toBe(3);
    expect(hashcatConcurrentJobSlots(splitA16!.product, 8)).toBe(1);
    expect(pro6000!.ntlmGhS).toBe(414.15);
    expect(rtx5090).toMatchObject({ addressableVramGb: 32 });
    expect(rtx5090).not.toHaveProperty('hashRatePerWatt');
  });

  it('keeps sold-out direct listings out of the value score', () => {
    const rtx5090 = potentials.find((result) => result.product.id === 'nvidia-rtx-5090');
    expect(rtx5090).toBeTruthy();
    if (!rtx5090) throw new Error('Missing RTX 5090 fixture');
    const bestBuyRows = hashcatRetailListings.filter((listing) => (
      listing.productId === rtx5090.product.id && listing.retailer === 'Best Buy'
    ));
    expect(bestBuyRows.some((listing) => listing.amountCents === 199999 && listing.availability === 'sold-out')).toBe(true);
    expect(hashcatAcquisitionPrice(rtx5090.product, 'Best Buy')).toMatchObject({
      amountCents: 432999, source: 'Best Buy', availability: 'in-stock',
    });
  });

  it('uses the lowest qualifying source only in the cross-retailer view', () => {
    const rtx5090 = potentials.find((result) => result.product.id === 'nvidia-rtx-5090');
    expect(rtx5090).toBeTruthy();
    if (!rtx5090) throw new Error('Missing RTX 5090 fixture');
    expect(hashcatPriceOptions(rtx5090.product).map((price) => price.source).sort()).toEqual(['B&H', 'Best Buy']);
    expect(hashcatAcquisitionPrice(rtx5090.product, 'best-verified')).toMatchObject({
      source: 'B&H', amountCents: 407999,
    });
  });
});
