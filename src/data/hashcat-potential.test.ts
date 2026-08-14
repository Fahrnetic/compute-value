import { allProducts } from '../../server/catalog';
import { describe, expect, it } from 'vitest';
import {
  buildHashcatPotentials,
  hashcatEligibleGpus,
  hashcatPotentialFor,
} from './hashcat-potential';

describe('Hashcat whole-catalog research', () => {
  it('covers every catalog GPU from 12 GB through 144 GB', () => {
    const eligible = hashcatEligibleGpus(allProducts);
    const results = buildHashcatPotentials(allProducts);
    expect(eligible).toHaveLength(84);
    expect(results).toHaveLength(eligible.length);
    expect(new Set(results.map((result) => result.product.id)).size).toBe(results.length);
    expect(results.map((result) => result.product.id)).toContain('nvidia-rtx-4070-super');
    expect(results.map((result) => result.product.id)).toContain('nvidia-rtx-5080');
    expect(results.map((result) => result.product.id)).toContain('nvidia-rtx-3090');
    expect(results.map((result) => result.product.id)).toContain('nvidia-rtx-4090');
    expect(Math.min(...eligible.map((gpu) => gpu.vramGb))).toBe(12);
    expect(Math.max(...eligible.map((gpu) => gpu.vramGb))).toBe(144);
  });

  it('preserves newly sourced exact GeForce controls', () => {
    const results = buildHashcatPotentials(allProducts);
    expect(results.find((result) => result.product.id === 'nvidia-rtx-5080')).toMatchObject({
      ntlmGhS: 156.6, bcryptKhS: 122, evidence: 'measured-exact',
    });
    expect(results.find((result) => result.product.id === 'nvidia-rtx-5070-ti')).toMatchObject({
      ntlmGhS: 137.8, bcryptKhS: 107.4, evidence: 'measured-exact',
    });
    expect(results.find((result) => result.product.id === 'nvidia-rtx-4080-super')).toMatchObject({
      ntlmGhS: 165.1, bcryptKhS: 121.2, evidence: 'measured-exact',
    });
  });

  it('preserves exact current RTX PRO Blackwell measurements', () => {
    const results = buildHashcatPotentials(allProducts);
    expect(results.find((result) => result.product.id === 'nvidia-rtx-pro-4500-blackwell')).toMatchObject({
      ntlmGhS: 162.8, bcryptKhS: 134.933, evidence: 'measured-exact', hashcatVersion: 'Hashcat v7.1.2 / pts/hashcat 1.3.1',
    });
    expect(results.find((result) => result.product.id === 'nvidia-rtx-pro-6000-blackwell-workstation')).toMatchObject({
      ntlmGhS: 414.15, bcryptKhS: 317.617, evidence: 'measured-exact',
    });
    expect(results.find((result) => result.product.id === 'nvidia-rtx-pro-6000-blackwell-server')).toMatchObject({
      ntlmGhS: 308, bcryptKhS: 265.8, evidence: 'measured-exact',
    });
  });

  it('keeps direct V100 evidence separate from the requested PCIe 32 GB planning proxies', () => {
    const pcie = allProducts.find((product) => product.id === 'nvidia-tesla-v100-pcie-32');
    const v100s = allProducts.find((product) => product.id === 'nvidia-tesla-v100s-pcie-32');
    expect(pcie?.category).toBe('gpu');
    expect(v100s?.category).toBe('gpu');
    if (pcie?.category !== 'gpu' || v100s?.category !== 'gpu') throw new Error('Missing V100 catalog fixtures');
    expect(hashcatPotentialFor(pcie)).toMatchObject({
      ntlmGhS: 89.7919, bcryptKhS: 70.786, evidence: 'same-silicon-proxy', uncertaintyPercent: 12,
      benchmarkHardware: 'Tesla V100 SXM2 16 GB (per GPU from 4-GPU run)',
    });
    expect(hashcatPotentialFor(v100s)).toMatchObject({
      ntlmGhS: 97.7734, bcryptKhS: 77.078, evidence: 'same-silicon-proxy',
    });
  });

  it('does not treat split board memory as one addressable pool', () => {
    const results = buildHashcatPotentials(allProducts);
    expect(results.find((result) => result.product.id === 'nvidia-a16')?.product).toMatchObject({
      vramGb: 64, gpuCount: 4, addressableVramGb: 16,
    });
    expect(results.find((result) => result.product.id === 'amd-radeon-pro-duo-polaris')?.product).toMatchObject({
      vramGb: 32, gpuCount: 2, addressableVramGb: 16,
    });
  });
});
