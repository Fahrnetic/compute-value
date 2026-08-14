import { allProducts } from '../../server/catalog';
import { describe, expect, it } from 'vitest';
import {
  argon2BenchmarkSeeds,
  argon2Profile,
  buildArgon2Benchmarks,
  v100Argon2SourceAudit,
  v100Argon2BandwidthEstimateHs,
  v100SeparateResearch,
} from './argon2-benchmarks';

describe('generic Argon2 mode-34000 benchmark database', () => {
  it('locks every result to the RFC 9106 recommendation used by Hashcat', () => {
    expect(argon2Profile).toMatchObject({
      mode: 34_000,
      memoryKib: 65_536,
      timeCost: 3,
      parallelism: 1,
    });
  });

  it('keeps direct measurements distinct from the V100 bandwidth model', () => {
    const results = buildArgon2Benchmarks(allProducts);
    expect(results.find(({ product }) => product.id === 'nvidia-h200-nvl')).toMatchObject({ hashesPerSecond: 4_050, evidence: 'hardware-qualified-cluster', uncertaintyPercent: 15 });
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-pro-6000-blackwell-server')).toMatchObject({ hashesPerSecond: 2_716, evidence: 'measured-public' });
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-5090')).toMatchObject({ hashesPerSecond: 2_175, evidence: 'measured-public-cluster' });
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-4090')).toMatchObject({ hashesPerSecond: 1_703, evidence: 'measured-public' });
    expect(results.find(({ product }) => product.id === 'amd-rx-7900-xtx')).toMatchObject({ hashesPerSecond: 1_367, evidence: 'measured-public' });
    expect(results.find(({ product }) => product.id === 'nvidia-tesla-v100-pcie-32')).toMatchObject({ hashesPerSecond: 1_521, evidence: 'bandwidth-model', uncertaintyPercent: 30 });
    expect(argon2BenchmarkSeeds.find(({ productId }) => productId === 'nvidia-rtx-5060-ti-16')).toMatchObject({ hashesPerSecond: 684, evidence: 'measured-public' });
  });

  it('makes the V100 derivation reproducible and preserves separate direct four-card research', () => {
    expect(v100Argon2BandwidthEstimateHs).toBe(Math.round(1_703 * 900 / 1_008));
    expect(v100SeparateResearch).toMatchObject({
      directTailsLuks2Hs: 11,
      directTailsRawRunsHs: [11, 11, 11],
      directTailsHardware: 'Tesla V100 PCIe 16 GB',
      directTailsVramMib: 16_384,
      directTailsVbios: '88.00.1A.00.03',
      pcie32TailsStatus: expect.stringMatching(/No direct public.*mode-34100.*32 GB/i),
      fourGpuHardware: '4 × Tesla V100-SXM2-16GB',
      fourGpuBcryptCost5Hs: 318_900,
      fourGpuLuks1Hs: 89_446,
      eightGpuBcryptCost10Hs: 17_762,
      sxm2_32EmpiricalTensorFp16Tflops: 116.4,
      dualPcie32P2pBidirectionalGbS: 25.49,
      singleSxm2_16Gemma4_26bQ4TccTokensPerSecond: 99.8,
    });
    expect(v100SeparateResearch.caveat).toMatch(/predates Hashcat Argon2 support/i);
    expect(v100Argon2SourceAudit[0]).toMatchObject({
      source: 'OpenBenchmarking uploader “root”',
      finding: '11 H/s · Hashcat 7.1.2 mode 34100 · runs 11:11:11',
      verdict: 'accepted-direct',
    });
    expect(v100Argon2SourceAudit.find(({ source }) => source.startsWith('Reddit'))).toMatchObject({
      verdict: 'near-miss',
    });
    expect(v100Argon2SourceAudit.find(({ verdict }) => verdict === 'rejected-model')?.notes).toMatch(/not promoted to measured evidence/i);
  });

  it('sorts by hashes per second and calculates daily throughput', () => {
    const results = buildArgon2Benchmarks(allProducts);
    expect(results.map(({ product }) => product.id)).toEqual([
      'nvidia-h200-nvl',
      'nvidia-rtx-pro-6000-blackwell-server',
      'nvidia-rtx-5090',
      'nvidia-rtx-4090',
      'nvidia-tesla-v100-pcie-32',
      'amd-rx-7900-xtx',
      'nvidia-rtx-4070-super',
    ]);
    expect(results[0].hashesPerDay).toBe(349_920_000);
  });
});
