import { describe, expect, it } from 'vitest';
import { dgxSparkCapacityBenchmarks, dgxSparkUniversalSource } from './dgx-spark-benchmarks';

describe('DGX Spark research', () => {
  it('keeps modern capacity examples separate from the universal control', () => {
    expect(dgxSparkUniversalSource.profile).toContain('tg128');
    expect(dgxSparkUniversalSource.profile).toContain('Flash Attention off');
    expect(dgxSparkCapacityBenchmarks).toHaveLength(5);
    expect(dgxSparkCapacityBenchmarks.every((result) => result.sourceUrl.startsWith('https://'))).toBe(true);
  });

  it('captures the dense-versus-MoE bandwidth contrast', () => {
    const dense = dgxSparkCapacityBenchmarks.find((result) => result.model === 'Qwen3 32B');
    const moe = dgxSparkCapacityBenchmarks.find((result) => result.model === 'Qwen3 30B A3B');
    expect(dense?.generatedTokensPerSecond).toBe(10.7);
    expect(moe?.generatedTokensPerSecond).toBe(89.3);
    expect((moe?.generatedTokensPerSecond ?? 0) / (dense?.generatedTokensPerSecond ?? 1)).toBeGreaterThan(8);
  });
});
