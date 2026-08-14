import type { Gpu } from '../types';
import {
  hashcatMetricValue,
  type HashcatMetric,
  type HashcatPotential,
} from './hashcat-potential';

export type HashcatPriceSource = 'best-verified' | 'B&H' | 'Best Buy' | 'eBay';
export type RetailAvailability = 'in-stock' | 'special-order' | 'sold-out';

export interface HashcatRetailListing {
  productId: string;
  retailer: 'B&H' | 'Best Buy';
  sellerName: 'B&H Photo Video' | 'Best Buy';
  title: string;
  amountCents: number;
  condition: 'new';
  availability: RetailAvailability;
  observedAt: string;
  sourceUrl: string;
  verification: string;
  notes?: string;
}

export interface HashcatAcquisitionPrice {
  source: Exclude<HashcatPriceSource, 'best-verified'>;
  sellerName: string;
  condition: 'new' | 'used';
  amountCents: number;
  lowCents: number;
  highCents: number;
  listingCount: number;
  availability: Exclude<RetailAvailability, 'sold-out'>;
  observedAt: string;
  sourceUrl: string;
  sourceLabel: string;
  verification: string;
  notes: string;
}

export interface HashcatValueResult extends HashcatPotential {
  acquisitionPrice?: HashcatAcquisitionPrice;
  perThousandDollars?: number;
  addressableVramGb: number;
  vramGbPerThousandDollars?: number;
}

export const hashcatPriceResearchDate = '2026-08-13';

/**
 * Direct-retailer observations are deliberately narrow. B&H rows must be sold
 * by B&H as an authorized dealer. Best Buy Marketplace offers are excluded;
 * only rows explicitly sold by Best Buy qualify. Sold-out references remain in
 * the evidence set, but cannot enter a power-per-dollar score.
 */
export const hashcatRetailListings: HashcatRetailListing[] = [
  {
    productId: 'nvidia-rtx-5090', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'PNY GeForce RTX 5090 ARGB EPIC-X RGB OC 32GB', amountCents: 407999,
    condition: 'new', availability: 'in-stock', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1874648-REG/pny_vcg509032tfxxpb1_o_nvidia_geforce_rtx_5090.html',
    verification: 'B&H direct · authorized dealer',
    notes: 'Exact RTX 5090 GPU family; partner-board clocks and 600 W ceiling differ slightly from the Founders Edition benchmark target.',
  },
  {
    productId: 'nvidia-rtx-5090', retailer: 'Best Buy', sellerName: 'Best Buy',
    title: 'ASUS ROG Astral GeForce RTX 5090 OC 32GB', amountCents: 432999,
    condition: 'new', availability: 'in-stock', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bestbuy.com/product/asus-rog-astral-nvidia-geforce-rtx-5090-32gb-gddr7-pci-express-5-0-graphics-card-black/JJGGLHJVSV',
    verification: 'Sold by Best Buy · direct listing',
    notes: 'Exact RTX 5090 GPU family; board-partner cooler and factory clocks differ from the Founders Edition benchmark target.',
  },
  {
    productId: 'nvidia-rtx-5090', retailer: 'Best Buy', sellerName: 'Best Buy',
    title: 'NVIDIA GeForce RTX 5090 Founders Edition 32GB', amountCents: 199999,
    condition: 'new', availability: 'sold-out', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bestbuy.com/product/nvidia-geforce-rtx-5090-founders-edition-32gb-gddr7-pci-express-5-0-graphics-card-dark-gun-metal/J3GWYHGPCP',
    verification: 'Sold by Best Buy · direct listing',
    notes: 'The $1,999.99 page is retained as availability evidence but excluded from every value score because it is sold out.',
  },
  {
    productId: 'nvidia-rtx-pro-4500-blackwell', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'NVIDIA RTX PRO 4500 Blackwell 32GB (OEM)', amountCents: 485900,
    condition: 'new', availability: 'in-stock', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1938760-REG/nvidia_900_5g147_2250_000_01_rtx_pro_4500_blackwell.html',
    verification: 'B&H direct · authorized dealer', notes: 'Exact measured 32 GB workstation board.',
  },
  {
    productId: 'nvidia-rtx-pro-5000-blackwell-48', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'NVIDIA RTX PRO 5000 Blackwell 48GB (OEM)', amountCents: 859900,
    condition: 'new', availability: 'in-stock', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1943539-REG/nvidia_900_5g153_2250_000_01_rtx_pro_5000_blackwell.html',
    verification: 'B&H direct · authorized dealer', notes: 'Exact 48 GB workstation SKU.',
  },
  {
    productId: 'nvidia-rtx-pro-5000-blackwell-72', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'NVIDIA RTX PRO 5000 Blackwell 72GB (OEM)', amountCents: 879900,
    condition: 'new', availability: 'in-stock', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1938762-REG/nvidia_900_5g153_2270_000_01_rtx_pro_5000_72gb.html',
    verification: 'B&H direct · authorized dealer', notes: 'Exact 72 GB workstation SKU; compact hashes do not benefit from its extra VRAM.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-maxq', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'NVIDIA RTX PRO 6000 Blackwell Max-Q 96GB (OEM)', amountCents: 1444900,
    condition: 'new', availability: 'in-stock', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1895189-REG/nvidia_900_5g153_2200_000_rtx_pro_6000_blackwell.html',
    verification: 'B&H direct · authorized dealer', notes: 'Exact 300 W Max-Q product; Hashcat speed remains a same-silicon proxy.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-workstation', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'NVIDIA RTX PRO 6000 Blackwell Workstation 96GB (OEM)', amountCents: 1549900,
    condition: 'new', availability: 'in-stock', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1895402-REG/nvidia_900_5g144_2200_000_rtx_pro_6000_blackwell.html',
    verification: 'B&H direct · authorized dealer', notes: 'Exact measured 600 W workstation board.',
  },
  {
    productId: 'amd-radeon-ai-pro-r9700', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'ASUS Turbo Radeon AI PRO R9700 32GB', amountCents: 135999,
    condition: 'new', availability: 'in-stock', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1928519-REG/asus_turbo_ai_pro_r9700_32g_turbo_radeon_ai_pro.html',
    verification: 'B&H direct · authorized dealer', notes: 'Exact R9700 GPU configuration and 32 GB capacity.',
  },
  {
    productId: 'amd-radeon-pro-w7800-32', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'AMD Radeon PRO W7800 32GB', amountCents: 249900,
    condition: 'new', availability: 'special-order', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1765537-REG/amd_100_300000075_radeon_pro_w7800_graphic.html',
    verification: 'B&H direct · authorized dealer', notes: 'Purchasable special-order listing; delivery timing is not guaranteed.',
  },
  {
    productId: 'amd-radeon-pro-w7900', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'AMD Radeon PRO W7900 48GB', amountCents: 399900,
    condition: 'new', availability: 'in-stock', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1765536-REG/amd_100_300000074_radeon_pro_w7900_graphic.html',
    verification: 'B&H direct · authorized dealer', notes: 'Exact measured W7900 GPU.',
  },
  {
    productId: 'amd-radeon-pro-w7900-dual-slot', retailer: 'B&H', sellerName: 'B&H Photo Video',
    title: 'AMD Radeon PRO W7900 Dual Slot 48GB', amountCents: 399500,
    condition: 'new', availability: 'sold-out', observedAt: hashcatPriceResearchDate,
    sourceUrl: 'https://www.bhphotovideo.com/c/product/1973610-REG/amd_100_300000170_radeon_pro_w7900_dual_slot.html',
    verification: 'B&H direct · authorized dealer',
    notes: 'Temporarily out of stock; retained as evidence and excluded from the current value score.',
  },
];

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

export function hashcatPriceOptions(gpu: Gpu): HashcatAcquisitionPrice[] {
  const retail = hashcatRetailListings
    .filter((listing): listing is HashcatRetailListing & {
      availability: Exclude<RetailAvailability, 'sold-out'>;
    } => listing.productId === gpu.id && listing.availability !== 'sold-out')
    .map((listing): HashcatAcquisitionPrice => ({
      source: listing.retailer,
      sellerName: listing.sellerName,
      condition: listing.condition,
      amountCents: listing.amountCents,
      lowCents: listing.amountCents,
      highCents: listing.amountCents,
      listingCount: 1,
      availability: listing.availability,
      observedAt: listing.observedAt,
      sourceUrl: listing.sourceUrl,
      sourceLabel: listing.retailer,
      verification: listing.verification,
      notes: listing.notes ?? '',
    }));

  const used = gpu.usedMarket;
  if (!used?.listings.length) return retail;
  const prices = used.listings.map((listing) => listing.amountCents).sort((a, b) => a - b);
  const sellers = used.listings.map((listing) => listing.sellerName);
  return [...retail, {
    source: 'eBay',
    sellerName: sellers.join(', '),
    condition: 'used',
    amountCents: median(prices),
    lowCents: prices[0],
    highCents: prices.at(-1) ?? prices[0],
    listingCount: prices.length,
    availability: 'in-stock',
    observedAt: used.observedAt,
    sourceUrl: used.searchUrl,
    sourceLabel: `eBay median of ${prices.length} screened ${prices.length === 1 ? 'ask' : 'asks'}`,
    verification: used.sellerRule,
    notes: `Seller screen passed by ${sellers.join(', ')}. Shipping and tax are excluded.`,
  }];
}

export function hashcatAcquisitionPrice(gpu: Gpu, source: HashcatPriceSource) {
  const options = hashcatPriceOptions(gpu)
    .filter((option) => source === 'best-verified' || option.source === source)
    .sort((a, b) => a.amountCents - b.amountCents || a.source.localeCompare(b.source));
  return options[0];
}

export function hashcatAddressableVramGb(gpu: Gpu) {
  if (gpu.addressableVramGb) return gpu.addressableVramGb;
  if (gpu.memoryPool === 'split' || (gpu.gpuCount ?? 1) > 1) {
    return gpu.vramGb / (gpu.gpuCount ?? 1);
  }
  return gpu.vramGb;
}

export function hashcatConcurrentJobSlots(
  gpu: Gpu,
  jobFootprintGb: number,
  reserveRatio = 0.1,
) {
  if (jobFootprintGb <= 0) return 0;
  const usableVramGb = hashcatAddressableVramGb(gpu) * (1 - reserveRatio);
  return Math.max(0, Math.floor(usableVramGb / jobFootprintGb));
}

export function buildHashcatValueResults(
  results: HashcatPotential[],
  metric: HashcatMetric,
  source: HashcatPriceSource,
): HashcatValueResult[] {
  return results.map((result): HashcatValueResult => {
    const hashRate = hashcatMetricValue(result, metric);
    const addressableVramGb = hashcatAddressableVramGb(result.product);
    const acquisitionPrice = hashcatAcquisitionPrice(result.product, source);
    if (!acquisitionPrice) return {
      ...result,
      addressableVramGb,
    };
    const acquisitionDollars = acquisitionPrice.amountCents / 100;
    return {
      ...result,
      acquisitionPrice,
      perThousandDollars: hashRate / acquisitionDollars * 1000,
      addressableVramGb,
      vramGbPerThousandDollars: addressableVramGb / acquisitionDollars * 1000,
    };
  });
}

export function hashcatPriceCoverage(results: HashcatValueResult[]) {
  return results.filter((result) => result.acquisitionPrice).length;
}

export function hashcatRetailAvailability(productId: string) {
  return hashcatRetailListings.filter((listing) => listing.productId === productId);
}
