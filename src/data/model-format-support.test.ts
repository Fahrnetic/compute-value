import { describe, expect, it } from 'vitest';
import {
  aiModelFormats,
  aiModelProfiles,
  fourGpuModelClusters,
  fourGpuModelCompatibility,
  modelSupportCatalog,
} from './model-format-support';

describe('four-GPU model format support', () => {
  it('covers language, image, and video models plus every requested precision lane', () => {
    expect(new Set(aiModelProfiles.map((model) => model.modality))).toEqual(new Set(['llm', 'image', 'video']));
    expect(new Set(aiModelFormats.map((format) => format.precision))).toEqual(new Set(['Q4', 'Q8', 'FP16', 'BF16']));
    expect(aiModelProfiles.filter((model) => model.modality === 'image').length).toBeGreaterThanOrEqual(2);
    expect(aiModelProfiles.filter((model) => model.modality === 'video').length).toBeGreaterThanOrEqual(2);
    aiModelProfiles.forEach((model) => {
      expect(aiModelFormats.filter((format) => format.modelId === model.id).map((format) => format.precision)).toEqual(['Q4', 'Q8', 'FP16', 'BF16']);
    });
  });

  it('uses ten exact four-GPU records and materializes every model-format/cluster result', () => {
    expect(fourGpuModelClusters).toHaveLength(10);
    expect(fourGpuModelClusters.every((cluster) => cluster.gpuCount === 4)).toBe(true);
    expect(fourGpuModelClusters.every((cluster) => cluster.totalVramGb === cluster.vramPerGpuGb * 4)).toBe(true);
    expect(fourGpuModelCompatibility).toHaveLength(aiModelFormats.length * fourGpuModelClusters.length);
    expect(modelSupportCatalog.meta).toMatchObject({
      modelCount: 5, formatCount: 20, clusterCount: 10, compatibilityCount: 200,
    });
  });

  it('stores exact published Qwen payloads without conflating GGUF with diffusion quantization', () => {
    expect(aiModelFormats.find((format) => format.id === 'qwen3-32b-q4')).toMatchObject({
      precision: 'Q4', format: 'GGUF Q4_K_M', weightPayloadGb: 19.762, availability: 'official checkpoint',
    });
    expect(aiModelFormats.find((format) => format.id === 'qwen3-32b-q8')).toMatchObject({
      precision: 'Q8', format: 'GGUF Q8_0', weightPayloadGb: 34.818, availability: 'official checkpoint',
    });
    expect(aiModelFormats.find((format) => format.id === 'flux-1-dev-q4')).toMatchObject({
      precision: 'Q4', format: 'bitsandbytes NF4 (eligible linear layers)', weightPayloadGb: null,
      payloadBasis: 'runtime quantization; no fixed artifact',
    });
  });

  it('preserves explicit negative support instead of filling every cell with a guessed fit', () => {
    expect(aiModelFormats.find((format) => format.id === 'cogvideox-5b-q4')).toMatchObject({
      available: false, availability: 'not verified', format: 'INT4 explicitly unsupported',
    });
    expect(aiModelFormats.find((format) => format.id === 'wan21-t2v-14b-fp16')).toMatchObject({
      available: false, availability: 'not verified',
    });
  });

  it('rejects native-BF16 and LLM.int8 paths on V100 while retaining valid FP16/GGUF lanes', () => {
    const status = (formatId: string) => fourGpuModelCompatibility.find((result) => (
      result.clusterId === 'v100-sxm2-quad' && result.formatId === formatId
    ))?.status;
    expect(status('qwen3-32b-q4')).toBe('fits');
    expect(status('qwen3-32b-q8')).toBe('fits');
    expect(status('qwen3-32b-bf16')).toBe('unsupported');
    expect(status('flux-1-dev-q8')).toBe('unsupported');
    expect(status('cogvideox-5b-fp16')).toBe('fits');
    expect(status('cogvideox-5b-bf16')).toBe('unsupported');
  });

  it('treats tight 4x24GB full-precision deployments as conditional, not impossible', () => {
    const status = (formatId: string) => fourGpuModelCompatibility.find((result) => (
      result.clusterId === 'rtx3090-quad' && result.formatId === formatId
    ))?.status;
    expect(status('qwen3-32b-fp16')).toBe('conditional');
    expect(status('qwen3-32b-bf16')).toBe('conditional');
    expect(status('wan21-t2v-14b-bf16')).toBe('conditional');
    expect(status('wan21-t2v-14b-q4')).toBe('fits');
  });
});
