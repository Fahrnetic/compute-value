import { allProducts } from '../../server/catalog';
import { describe, expect, it } from 'vitest';
import {
  buildTailsLuks2Benchmarks,
  tailsLuks2BenchmarkSeeds,
  tailsLuks2Profile,
} from './tails-luks2-benchmarks';

describe('Tails LUKS2 mode-34100 benchmark database', () => {
  it('locks every row to the modern Tails-equivalent reference profile', () => {
    expect(tailsLuks2Profile).toMatchObject({
      mode: 34100,
      memoryKib: 1_048_576,
      timeCost: 4,
      parallelism: 4,
      iterationsShownByHashcat: 16,
    });
  });

  it('preserves direct public, aggregate, and local measurements', () => {
    const results = buildTailsLuks2Benchmarks(allProducts);
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-pro-6000-blackwell-workstation')).toMatchObject({
      guessesPerSecond: 75, evidence: 'measured-public', sampleCount: 3,
    });
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-pro-6000-blackwell-maxq')).toMatchObject({
      guessesPerSecond: 71, evidence: 'measured-public-mean', sampleCount: 7, reportedSpreadHs: 1,
    });
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-pro-6000-blackwell-server')).toMatchObject({
      guessesPerSecond: 55, rfcArgon2Hs: 2_716, evidence: 'measured-public',
    });
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-pro-4500-blackwell')).toMatchObject({
      guessesPerSecond: 26, evidence: 'measured-public-mean', sampleCount: 3,
    });
    expect(tailsLuks2BenchmarkSeeds.find(({ productId }) => productId === 'nvidia-rtx-5060-ti-16')).toMatchObject({
      guessesPerSecond: 13, rfcArgon2Hs: 684, evidence: 'measured-public',
    });
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-5080')).toMatchObject({
      guessesPerSecond: 13, evidence: 'measured-public-mean', sampleCount: 3,
    });
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-4070-super')).toMatchObject({
      guessesPerSecond: 8, rfcArgon2Hs: 662, evidence: 'measured-local',
    });
  });

  it('does not convert generic Argon2 controls into unmeasured Tails rates', () => {
    const results = buildTailsLuks2Benchmarks(allProducts);
    expect(results.find(({ product }) => product.id === 'nvidia-rtx-4090')).toBeUndefined();
    expect(results.find(({ product }) => product.id === 'amd-rx-7900-xtx')).toBeUndefined();
    expect(results.find(({ product }) => product.id === 'nvidia-tesla-v100-pcie-32')).toBeUndefined();
  });

  it('sorts by total guesses per second and calculates daily throughput', () => {
    const results = buildTailsLuks2Benchmarks(allProducts);
    expect(results.map(({ product }) => product.id)).toEqual([
      'nvidia-rtx-pro-6000-blackwell-workstation',
      'nvidia-rtx-pro-6000-blackwell-maxq',
      'nvidia-rtx-pro-6000-blackwell-server',
      'nvidia-rtx-pro-4500-blackwell',
      'nvidia-rtx-5080',
      'nvidia-rtx-4070-super',
    ]);
    expect(results[0].guessesPerDay).toBe(6_480_000);
  });
});
