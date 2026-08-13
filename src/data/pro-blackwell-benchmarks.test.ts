import { describe, expect, it } from 'vitest';
import { allProducts } from '../../server/catalog';
import { llmBenchmarkSeeds } from '../../server/llm-benchmarks';
import type { Gpu } from '../types';
import {
  proBlackwellBenchmarksFor,
  proBlackwellNoPublicBenchmarkIds,
  proBlackwellSupplementalBenchmarks,
  unresolvedPro6000FamilyBenchmark,
} from './pro-blackwell-benchmarks';

function proBlackwellGpus() {
  return allProducts
    .filter((product): product is Gpu => product.category === 'gpu'
      && product.architecture === 'Blackwell'
      && Boolean(product.generation?.startsWith('RTX PRO Blackwell')))
    .map((gpu) => ({
      ...gpu,
      llmBenchmarks: llmBenchmarkSeeds.filter((result) => result.productId === gpu.id),
    }));
}

describe('RTX PRO Blackwell benchmark audit', () => {
  it('covers every exact workstation and server edition without inventing the 6000D result', () => {
    const gpus = proBlackwellGpus();
    const covered = gpus.filter((gpu) => proBlackwellBenchmarksFor(gpu).length > 0);

    expect(gpus).toHaveLength(11);
    expect(covered).toHaveLength(10);
    expect(gpus.filter((gpu) => proBlackwellNoPublicBenchmarkIds.has(gpu.id)).map((gpu) => gpu.id))
      .toEqual(['nvidia-rtx-pro-6000d-blackwell-server']);
  });

  it('keeps fixed-control, qualified, other-model, and server-throughput evidence in explicit lanes', () => {
    const results = proBlackwellGpus().flatMap(proBlackwellBenchmarksFor);
    expect(new Set(results.map((result) => result.lane))).toEqual(new Set([
      'fixed-control', 'qualified-control', 'other-model', 'serving-throughput',
    ]));
    expect(results.filter((result) => result.lane === 'fixed-control').map((result) => result.productId).sort())
      .toEqual(['nvidia-rtx-pro-4000-blackwell', 'nvidia-rtx-pro-6000-blackwell-maxq']);
    expect(proBlackwellSupplementalBenchmarks.every((result) => result.generatedTokensPerSecond > 0)).toBe(true);
  });

  it('quarantines the edition-ambiguous RTX PRO 6000 scoreboard row', () => {
    expect(unresolvedPro6000FamilyBenchmark).toMatchObject({
      lane: 'fixed-control',
      generatedTokensPerSecond: 274.20,
      promptTokensPerSecond: 14854.63,
    });
    expect(unresolvedPro6000FamilyBenchmark.notes).toContain('cannot be assigned');
  });
});
