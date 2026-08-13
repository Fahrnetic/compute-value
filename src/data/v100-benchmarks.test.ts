import { describe, expect, it } from 'vitest';
import {
  preferredV100Benchmark,
  universalOllamaLlama2_7b,
  v100Benchmarks,
  v100ModuleBenchmarks,
  v100ModulePlatforms,
  v100ScaleResults,
} from './v100-benchmarks';

describe('Tesla V100 benchmark evidence', () => {
  it('keeps exact V100S results separate from the fixed V100 control', () => {
    const v100s = v100Benchmarks.filter((result) => result.productId === 'nvidia-tesla-v100s-pcie-32');
    expect(v100s).toHaveLength(3);
    expect(v100s.map((result) => result.generatedTokensPerSecond)).toEqual([
      121.96701149425286, 77.16588235294118, 2.4988235294117644,
    ]);
    expect(v100s.every((result) => result.lane === 'ollama')).toBe(true);
    expect(preferredV100Benchmark('nvidia-tesla-v100-pcie-32')).toMatchObject({
      lane: 'fixed-control', generatedTokensPerSecond: 129.08,
    });
  });

  it('orders the independent Ollama Llama 2 lane fastest first', () => {
    const speeds = universalOllamaLlama2_7b.map((result) => result.generatedTokensPerSecond);
    expect(speeds).toEqual([...speeds].sort((a, b) => b - a));
    expect(universalOllamaLlama2_7b.some((result) => result.hardware === 'V100S PCIe 32 GB')).toBe(true);
  });

  it('separates four-card single-response speed from aggregate serving throughput', () => {
    const single = v100ScaleResults.filter((result) => result.lane === 'single-stream-llamacpp');
    const server = v100ScaleResults.filter((result) => result.lane === 'multi-user-vllm');
    expect(single).toHaveLength(3);
    expect(server).toHaveLength(3);
    expect(single.find((result) => result.model === 'Llama 2 7B')).toMatchObject({
      oneGpuTokensPerSecond: 100.95,
      fourGpuTokensPerSecond: 92.21,
    });
    expect(server.find((result) => result.model === 'Llama 2 7B')).toMatchObject({
      oneGpuTokensPerSecond: 153.8,
      fourGpuTokensPerSecond: 400.2,
    });
    expect(single.find((result) => result.model === 'Llama 2 70B')?.oneGpuTokensPerSecond).toBeNull();
  });

  it('models SXM2 and SXM3 as dedicated baseboard platforms', () => {
    expect(v100ModulePlatforms).toHaveLength(2);
    expect(v100ModulePlatforms.find((platform) => platform.id === 'sxm2-quad')).toMatchObject({
      baseboardGpuCount: 4,
      fourGpuMemoryGb: 128,
      fabricBandwidthGbSPerGpu: 300,
      fourGpuMaxPowerW: 1200,
    });
    expect(v100ModulePlatforms.find((platform) => platform.id === 'sxm3-hgx2')).toMatchObject({
      baseboardGpuCount: 8,
      fourGpuMemoryGb: 128,
      baseboardMemoryGb: 256,
      fourGpuMaxPowerW: 1400,
    });
  });

  it('keeps measured module results in separate single-stream and aggregate lanes', () => {
    expect(v100ModuleBenchmarks).toHaveLength(3);
    expect(v100ModuleBenchmarks.find((result) => result.id === 'quad-sxm2-minimax-layer')).toMatchObject({
      generatedTokensPerSecond: 38.6,
      promptTokensPerSecond: 1683.88,
      resultKind: 'single-stream',
    });
    expect(v100ModuleBenchmarks.find((result) => result.id === 'quad-v100-nvlink-qwen35-122b')).toMatchObject({
      generatedTokensPerSecond: 61.61,
      peakGeneratedTokensPerSecond: 75,
      measuredLoadPowerW: 600,
      resultKind: 'aggregate',
    });
  });
});
