import { describe, expect, it } from 'vitest';
import {
  aiRouteScoreById, aiRouteScores, LLAMA2_Q4_SIZE_RATIO, powerLimitEvidence, routeScoreWeights,
} from './ai-route-score';

describe('large-model route scoring', () => {
  it('uses one explicit same-quant model-size bridge', () => {
    expect(LLAMA2_Q4_SIZE_RATIO).toBeCloseTo(3.83 / 38.87, 8);
    expect(Object.values(routeScoreWeights).reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it('prices and scores every route as a complete system', () => {
    expect(aiRouteScores.length).toBeGreaterThanOrEqual(14);
    aiRouteScores.forEach((route) => {
      expect(route.systemCostLowUsd).toBeGreaterThan(0);
      expect(route.systemCostHighUsd).toBeGreaterThanOrEqual(route.systemCostLowUsd);
      expect(route.completeSystemPowerW).toBeGreaterThan(0);
      expect(route.inferredSeventyBTokensHigh).toBeGreaterThanOrEqual(route.inferredSeventyBTokensLow);
      expect(route.overallScore).toBeGreaterThan(0);
      expect(route.overallScore).toBeLessThanOrEqual(100);
    });
  });

  it('keeps the known measured 70B anchors inside the inferred bands', () => {
    ['rtx3090-quad', 'dgx-spark-2', 'dgx-spark-4'].forEach((id) => {
      const route = aiRouteScoreById.get(id)!;
      expect(route.measuredSeventyBAnchor!.tokensPerSecond).toBeGreaterThanOrEqual(route.inferredSeventyBTokensLow);
      expect(route.measuredSeventyBAnchor!.tokensPerSecond).toBeLessThanOrEqual(route.inferredSeventyBTokensHigh);
    });
  });

  it('does not claim LLM retention where only non-LLM or anecdotal evidence exists', () => {
    powerLimitEvidence.filter((row) => row.evidence !== 'LLM measured').forEach((row) => {
      expect(row.decodeRetainedPercent).toBeNull();
      expect(row.prefillRetainedPercent).toBeNull();
    });
  });

  it('models the user-relevant outlet constraints', () => {
    expect(aiRouteScoreById.get('dgx-spark-2')?.outletVerdict).toBe('yes');
    expect(aiRouteScoreById.get('v100-pcie-quad')?.outletVerdict).toBe('conditional');
    expect(aiRouteScoreById.get('rtx5090-quad')?.outletVerdict).toBe('no');
    expect(aiRouteScoreById.get('rtx-a6000-single')?.totalVramGb).toBe(48);
    expect(aiRouteScoreById.get('a100-40-single')?.vramPerGpuGb).toBe(40);
  });
});
