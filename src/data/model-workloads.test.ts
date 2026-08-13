import { describe, expect, it } from 'vitest';
import {
  llama31UniversalResearch,
  modelWorkloadComparisons,
  procyonGpuReportResearch,
  procyonTokenResearch,
  qwen25ServingResearch,
  qwen36Research,
  rtx4070SuperLocalScoreResearch,
  workstationModelResults,
} from './model-workloads';

describe('model-level GPU research', () => {
  it('keeps universal RTX PRO 6000 and H200 NVL pairs on one published profile', () => {
    expect(modelWorkloadComparisons).toHaveLength(4);
    expect(modelWorkloadComparisons.every((comparison) => (
      comparison.measurements.length >= 2
      && comparison.measurements.every((measurement) => (
        measurement.rtxPro6000TokensPerSecond > 0 && measurement.h200NvlTokensPerSecond > 0
      ))
      && comparison.sources.length > 0
      && comparison.caveat.length > 0
    ))).toBe(true);
  });

  it('stores the exact eight-model full-power workstation suite', () => {
    expect(workstationModelResults).toHaveLength(8);
    expect(workstationModelResults.find((result) => result.model === 'Qwen2.5-32B-Instruct GGUF')).toMatchObject({
      quantization: 'Q4_K_S', modelSizeGb: 18.78, tokensPerSecond: 43.9,
    });
    expect(workstationModelResults.find((result) => result.model === 'Llama 3.3 70B Instruct GGUF')).toMatchObject({
      quantization: 'Q4_K_S', modelSizeGb: 40.35, tokensPerSecond: 28.9,
    });
  });

  it('does not invent a universal H200 result for Qwen3.6-27B', () => {
    expect(qwen36Research.model).toBe('Qwen3.6-27B');
    expect(qwen36Research.published.find((result) => result.hardware.includes('H200 NVL'))).toMatchObject({
      result: 'No same-profile result found',
    });
    expect(qwen36Research.universalProfile).toHaveLength(5);
  });

  it('keeps the portable Llama lane separate from the published Q8 H200 control', () => {
    expect(llama31UniversalResearch.portableQuantization).toBe('Q4_K_M');
    expect(llama31UniversalResearch.portableFileSizeGb).toBeLessThan(llama31UniversalResearch.catalogMinimumVramGb);
    expect(llama31UniversalResearch.portableCommand).toContain(':Q4_K_M');
    expect(llama31UniversalResearch.q8Control.modelFile).toContain('Q8_0');
    expect(llama31UniversalResearch.q8Control.generation).toHaveLength(5);
    expect(llama31UniversalResearch.q8Control.promptProcessing).toHaveLength(5);
    expect(llama31UniversalResearch.q8Control.generation[0]).toMatchObject({
      setting: 128, rtx5090TokensPerSecond: 295.83, h200NvlTokensPerSecond: 200.46,
    });
  });

  it('stores the controlled Qwen2.5 H200 serving matrix in speed order', () => {
    expect(qwen25ServingResearch.results).toHaveLength(6);
    expect(qwen25ServingResearch.results[0]).toMatchObject({
      hardware: 'H200', singleTokensPerSecond: 182.44, batch8TokensPerSecond: 1370.60,
    });
    expect(qwen25ServingResearch.results.map((result) => result.singleTokensPerSecond)).toEqual(
      [...qwen25ServingResearch.results].map((result) => result.singleTokensPerSecond).sort((a, b) => b - a),
    );
  });

  it('keeps Procyon points, Procyon token rates, and LocalScore results in separate evidence lanes', () => {
    expect(procyonGpuReportResearch.results).toHaveLength(7);
    expect(procyonGpuReportResearch.results.find((result) => result.hardware === 'GeForce RTX 4070 SUPER')).toMatchObject({
      phi35: 3406, mistral7b: 2873, llama31: 2651, llama2: 2748,
    });
    expect(procyonTokenResearch.results).toHaveLength(2);
    expect(rtx4070SuperLocalScoreResearch.results).toHaveLength(3);
    expect(rtx4070SuperLocalScoreResearch.results.find((result) => result.parameters === '8.0B')).toMatchObject({
      promptTokensPerSecond: 3216, generatedTokensPerSecond: 45.3, ttftMs: 414,
    });
  });
});
