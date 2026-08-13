export type Gpu48GbPriceSignal = {
  productId: string;
  condition: 'open-box' | 'refurbished' | 'used-rejected';
  lowCents: number;
  highCents: number;
  observedAt: string;
  evidenceStatus: 'screened-non-used' | 'seller-screen-failed';
  sourceLabel: string;
  sourceUrls: string[];
  notes: string;
};

/**
 * Secondary price evidence that is useful for market visibility but is not
 * eligible for the used-card buyer score. Screened open-box/refurbished asks
 * are kept distinct from used listings; rejected evidence is shown only to
 * explain why a trusted price is still unavailable.
 */
export const gpu48GbPriceSignals: Gpu48GbPriceSignal[] = [
  {
    productId: 'nvidia-l20',
    condition: 'open-box',
    lowCents: 484313,
    highCents: 525000,
    observedAt: '2026-08-12',
    evidenceStatus: 'screened-non-used',
    sourceLabel: '2 screened open-box eBay asks',
    sourceUrls: [
      'https://www.ebay.com/itm/186430591409',
      'https://www.ebay.com/itm/397048639565',
    ],
    notes: 'Sellers clear the 98% positive and 100-feedback screen, but the cards are open-box rather than used, so this range does not enter the used-card buyer score.',
  },
  {
    productId: 'amd-radeon-pro-w7900-dual-slot',
    condition: 'refurbished',
    lowCents: 357999,
    highCents: 357999,
    observedAt: '2026-08-12',
    evidenceStatus: 'screened-non-used',
    sourceLabel: '1 screened refurbished eBay ask',
    sourceUrls: ['https://www.ebay.com/itm/298120076035'],
    notes: 'The exact dual-slot 48 GB model is seller-refurbished, not listed as used; seller feedback clears the screen.',
  },
  {
    productId: 'amd-radeon-pro-w7800-48',
    condition: 'used-rejected',
    lowCents: 244900,
    highCents: 244900,
    observedAt: '2026-08-12',
    evidenceStatus: 'seller-screen-failed',
    sourceLabel: 'Rejected ended used ask',
    sourceUrls: ['https://www.ebay.com/itm/336506610932'],
    notes: 'The exact 48 GB card was advertised at $2,449, but the seller had zero feedback and the listing ended. It is a market signal only—not a trusted acquisition price.',
  },
];

export function gpu48GbPriceSignalFor(productId: string) {
  return gpu48GbPriceSignals.find((signal) => signal.productId === productId);
}

export function formatGpu48GbPriceSignal(signal: Gpu48GbPriceSignal) {
  const money = (amountCents: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(amountCents / 100);
  const low = money(signal.lowCents);
  const high = money(signal.highCents);
  return low === high ? low : `${low}–${high}`;
}
