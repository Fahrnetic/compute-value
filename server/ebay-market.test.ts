import { describe, expect, it } from 'vitest';
import { allProducts } from './catalog';
import { ebayUsedMarketSeeds } from './ebay-market';

describe('eBay used-market research', () => {
  it('covers every bandwidth-ranked GPU without inventing prices for missing matches', () => {
    const rankedGpuIds = allProducts
      .filter((product) => product.category === 'gpu' && product.memoryBandwidthGbS)
      .map((product) => product.id).sort();
    expect(ebayUsedMarketSeeds.map((snapshot) => snapshot.productId).sort()).toEqual(rankedGpuIds);
    expect(ebayUsedMarketSeeds).toHaveLength(82);
    expect(ebayUsedMarketSeeds.filter((snapshot) => snapshot.listings.length > 0)).toHaveLength(45);
    expect(ebayUsedMarketSeeds.flatMap((snapshot) => snapshot.listings)).toHaveLength(91);
  });

  it('only references exact catalog GPUs', () => {
    const catalogById = new Map(allProducts.map((product) => [product.id, product]));
    ebayUsedMarketSeeds.forEach((snapshot) => {
      expect(catalogById.get(snapshot.productId)?.category).toBe('gpu');
    });
  });

  it('enforces the documented seller-history floor on every retained listing', () => {
    ebayUsedMarketSeeds.flatMap((snapshot) => snapshot.listings).forEach((listing) => {
      expect(listing.amountCents).toBeGreaterThan(0);
      expect(listing.sellerFeedbackPercent).toBeGreaterThanOrEqual(98);
      expect(listing.sellerFeedbackCount).toBeGreaterThanOrEqual(100);
      expect(listing.sourceUrl).toMatch(/^https:\/\/www\.ebay\.com\/itm\/\d+$/);
    });
  });

  it('does not retain obvious defective, sample, accessory, bundle, or whole-server listings', () => {
    ebayUsedMarketSeeds.flatMap((snapshot) => snapshot.listings).forEach((listing) => {
      expect(listing.title).not.toMatch(/ECC error|qualification sample|\bQS\b|SXM|not for resale|GPU server|for parts|broken|failed|read description|box only|empty box|no GPU|heatsink|waterblock|lot of/i);
    });
  });
});
