import { describe, expect, it } from 'vitest';
import { benchmarkSeeds } from './benchmarks';
import { allProducts } from './catalog';

describe('benchmark catalog', () => {
  it('stores complete desktop CPU coverage and only published Optane-Xeon rows', () => {
    const cpus = allProducts.filter((product) => product.category === 'cpu');
    expect(cpus).toHaveLength(137);
    cpus.filter((cpu) => !cpu.serverOnly).forEach((cpu) => {
      const keys = benchmarkSeeds.filter((result) => result.productId === cpu.id).map((result) => result.benchmarkKey);
      expect(keys).toEqual(expect.arrayContaining(['passmark-cpu', 'passmark-single-thread']));
      expect(keys).toHaveLength(2);
    });
    const optaneResults = benchmarkSeeds.filter((result) => result.productId.startsWith('intel-xeon-'));
    expect(optaneResults).toHaveLength(144);
    cpus.filter((cpu) => cpu.serverOnly).forEach((cpu) => {
      expect([0, 2]).toContain(benchmarkSeeds.filter((result) => result.productId === cpu.id).length);
    });
  });

  it('keeps GPU compute and graphics scores on separate benchmark scales', () => {
    const gpuScores = benchmarkSeeds.filter((result) => result.workload.startsWith('gpu-'));
    expect(gpuScores.filter((result) => result.benchmarkKey === 'passmark-g3d')).toHaveLength(48);
    expect(gpuScores.filter((result) => result.benchmarkKey === 'geekbench-opencl')).toHaveLength(47);
    expect(gpuScores.every((result) => result.score > 0 && result.higherIsBetter)).toBe(true);
  });

  it('only references cataloged CPUs and GPUs and preserves source metadata', () => {
    const products = new Map(allProducts.map((product) => [product.id, product]));
    const uniqueKeys = new Set<string>();
    benchmarkSeeds.forEach((result) => {
      const product = products.get(result.productId);
      expect(product?.category === 'cpu' || product?.category === 'gpu').toBe(true);
      expect(result.sourceUrl).toMatch(/^https:\/\//);
      expect(result.sourceDeviceName.length).toBeGreaterThan(0);
      expect(result.observedAt).toBe('2026-08-10');
      const key = `${result.productId}:${result.benchmarkKey}:${result.benchmarkVersion}`;
      expect(uniqueKeys.has(key)).toBe(false);
      uniqueKeys.add(key);
    });
    expect(benchmarkSeeds).toHaveLength(293);
  });

  it('marks sparse user-submission results as limited-sample', () => {
    const sparse = benchmarkSeeds.filter((result) => result.sampleCount !== undefined && result.sampleCount < 5);
    expect(sparse.length).toBeGreaterThan(0);
    expect(sparse.every((result) => result.resultType === 'limited-sample')).toBe(true);
  });
});
