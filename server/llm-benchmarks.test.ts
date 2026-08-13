import { describe, expect, it } from 'vitest';
import { allProducts } from './catalog';
import { gpuParallelProcessors, llmBenchmarkProfile, llmBenchmarkResearchSeeds, llmBenchmarkSeeds, sub100TokensUnder32GbGpuIds } from './llm-benchmarks';

describe('standardized LLM benchmark research', () => {
  it('keeps every ranked result on one exact model and workload profile', () => {
    expect(llmBenchmarkSeeds).toHaveLength(35);
    llmBenchmarkSeeds.forEach((result) => {
      expect(result).toMatchObject({
        profileKey: llmBenchmarkProfile.profileKey,
        modelFile: llmBenchmarkProfile.modelFile,
        quantization: llmBenchmarkProfile.quantization,
        gpuCount: 1,
        gpuLayers: 99,
        flashAttention: false,
        promptTokens: 512,
        generatedTokens: 128,
      });
      expect(result.promptTokensPerSecond).toBeGreaterThan(0);
      expect(result.generatedTokensPerSecond).toBeGreaterThan(0);
    });
  });

  it('maps every measurement to exact catalog hardware and every discrete GPU to a processor specification', () => {
    const catalogById = new Map(allProducts.map((product) => [product.id, product]));
    const measuredIds = llmBenchmarkSeeds.map((result) => result.productId);
    expect(new Set(measuredIds).size).toBe(measuredIds.length);
    measuredIds.forEach((productId) => {
      const product = catalogById.get(productId);
      expect(product).toBeDefined();
      if (product?.category === 'gpu') expect(gpuParallelProcessors[productId]?.count).toBeGreaterThan(0);
    });
    expect(catalogById.get('nvidia-dgx-spark')?.category).toBe('mini-pc');
    expect(llmBenchmarkSeeds.find((result) => result.productId === 'nvidia-dgx-spark')).toMatchObject({
      promptTokensPerSecond: 3062.31,
      generatedTokensPerSecond: 57.21,
      engineCommit: '5acd455',
    });
  });

  it('does not present CUDA, ROCm, and Vulkan runs as one hidden backend', () => {
    expect(new Set(llmBenchmarkSeeds.map((result) => result.backend))).toEqual(new Set(['CUDA', 'ROCm', 'Vulkan']));
    expect(llmBenchmarkResearchSeeds.find((result) => result.productId === 'intel-arc-b580')).toMatchObject({
      backend: 'Vulkan', generatedTokensPerSecond: 70.14,
    });
    expect(sub100TokensUnder32GbGpuIds.has('intel-arc-b580')).toBe(true);
    expect(llmBenchmarkSeeds.some((result) => result.productId === 'intel-arc-b580')).toBe(false);
    expect(llmBenchmarkSeeds.find((result) => result.productId === 'nvidia-rtx-4070-super')).toMatchObject({
      backend: 'Vulkan',
      flashAttention: false,
      generatedTokensPerSecond: 108.74,
    });
    expect(gpuParallelProcessors['intel-arc-b580']).toMatchObject({ count: 20, label: 'Xe cores' });
  });
});
