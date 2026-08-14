import { describe, expect, it } from 'vitest';
import { getArgon2DatabaseResults, getTailsLuks2DatabaseResults } from './database';

describe('persisted memory-hard benchmark datasets', () => {
  it('seeds the independent generic Argon2 ranking', () => {
    const results = getArgon2DatabaseResults();
    expect(results).toHaveLength(7);
    expect(results[0]).toMatchObject({
      productId: 'nvidia-h200-nvl',
      profileKey: 'argon2-rfc9106-mode-34000',
      hashcatMode: 34_000,
      hashesPerSecond: 4_050,
      evidence: 'hardware-qualified-cluster',
    });
    expect(results.find((result) => result.productId === 'nvidia-tesla-v100-pcie-32')).toMatchObject({
      hashesPerSecond: 1_521,
      evidence: 'bandwidth-model',
      uncertaintyPercent: 30,
    });
  });

  it('seeds the fixed Tails LUKS2 profile without generic conversions', () => {
    const results = getTailsLuks2DatabaseResults();
    expect(results).toHaveLength(6);
    expect(results[0]).toMatchObject({
      productId: 'nvidia-rtx-pro-6000-blackwell-workstation',
      profileKey: 'tails-luks2-mode-34100',
      hashcatMode: 34_100,
      guessesPerSecond: 75,
    });
    expect(results.some((result) => result.productId === 'nvidia-rtx-4090')).toBe(false);
    expect(results.some((result) => result.productId === 'nvidia-tesla-v100-pcie-32')).toBe(false);
  });
});
