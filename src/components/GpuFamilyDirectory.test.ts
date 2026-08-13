import { describe, expect, it } from 'vitest';
import { allProducts } from '../../server/catalog';
import { buildGpuFamilies } from './GpuFamilyDirectory';

describe('GPU family directory', () => {
  it('keeps every NVIDIA card in one explicit generation or requested product family', () => {
    const families = buildGpuFamilies(allProducts, 'NVIDIA');
    const counts = Object.fromEntries(families.map((family) => [family.id, family.products.length]));

    expect(counts).toEqual({
      'nvidia-geforce-50': 4,
      'nvidia-geforce-40': 8,
      'nvidia-rtx-pro-blackwell': 8,
      'nvidia-rtx-pro-blackwell-server': 3,
      'nvidia-ada-other': 9,
      'nvidia-hopper': 5,
      'nvidia-ampere': 14,
      'nvidia-turing': 5,
      'nvidia-volta': 3,
      'nvidia-pascal': 1,
      'nvidia-maxwell': 1,
    });
    expect(families.flatMap((family) => family.products)).toHaveLength(61);
    expect(new Set(families.flatMap((family) => family.products.map((gpu) => gpu.id))).size).toBe(61);
    expect(families.find((family) => family.id === 'nvidia-volta')?.products.map((gpu) => gpu.id))
      .toEqual(expect.arrayContaining(['nvidia-tesla-v100-pcie-32', 'nvidia-tesla-v100s-pcie-32', 'nvidia-quadro-gv100']));
  });

  it('organizes AMD independently by product role without losing a card', () => {
    const families = buildGpuFamilies(allProducts, 'AMD');
    const counts = Object.fromEntries(families.map((family) => [family.id, family.products.length]));

    expect(counts).toEqual({
      'amd-radeon-ai-pro': 4,
      'amd-radeon-rx': 3,
      'amd-radeon-pro': 7,
      'amd-instinct': 5,
      'amd-virtual-server': 4,
    });
    expect(families.flatMap((family) => family.products)).toHaveLength(23);
    expect(new Set(families.flatMap((family) => family.products.map((gpu) => gpu.id))).size).toBe(23);
  });
});
