import { describe, expect, it } from 'vitest';
import type { Gpu, Motherboard } from '../src/types';
import { getProducts } from './database';

const products = getProducts();

describe('generated SQLite catalog', () => {
  it('preserves the motherboard topology and power fields used by the homelab auditor', () => {
    const motherboard = products.find((product) => product.id === 'msi-pro-z890-s-wifi') as Motherboard;

    expect(motherboard.pcieSlots).toHaveLength(4);
    expect(motherboard.pcieSlots?.map((slot) => slot.electricalLanes)).toEqual([16, 1, 4, 4]);
    expect(motherboard.above4gDecoding).toBe(true);
    expect(motherboard.iommuSupport).toBe(true);
    expect(motherboard.auxiliaryPciePower).toEqual(['1× 8-pin PCIE_PWR']);
  });

  it('preserves per-product compute-unit data when no shared GPU map entry exists', () => {
    const gpu = products.find((product) => product.id === 'amd-rx-9070-xt') as Gpu;

    expect(gpu.parallelProcessors).toEqual(expect.objectContaining({
      count: 4096,
      label: 'stream processors',
      scope: 'per GPU',
    }));
  });
});
