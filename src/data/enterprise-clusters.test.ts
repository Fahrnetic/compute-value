import { describe, expect, it } from 'vitest';
import {
  assessHouseOutlet, clusterRawComputeById, clusterRawComputeRows, dgxSparkCapacityProof, dgxSparkCurrentAudit, dgxSparkTensorParallelResults,
  clusterSystemCostById, enterpriseClusters, exactEightGpuControls, fourGpuPcieClusters, h200SuperpodLadder,
  LLAMA2_70B_DENSE_MATH_TFLOPS_PER_TOKEN, LLAMA2_70B_Q4_0_MODEL_SIZE_GB, rawComputeProfiles,
  US_HOUSE_OUTLET_CONTINUOUS_W,
} from './enterprise-clusters';

describe('enterprise cluster catalog', () => {
  it('covers every requested generation and keeps the unlimited ranks deterministic', () => {
    expect(enterpriseClusters).toHaveLength(26);
    expect(new Set(enterpriseClusters.map((cluster) => cluster.generation))).toEqual(
      new Set(['DGX Spark', 'RTX 30', 'RTX 40', 'RTX 50', 'RTX PRO', 'V100', 'A100', 'A800', 'H100', 'H200']),
    );
    expect(enterpriseClusters.map((cluster) => cluster.unlimitedRank).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 26 }, (_, index) => index + 1),
    );
  });

  it('uses only the exact NVIDIA eight-GPU MLPerf controls in the headline comparison', () => {
    expect(exactEightGpuControls.map((cluster) => ({
      id: cluster.id,
      result: cluster.benchmark?.tokensPerSecond,
      model: cluster.benchmark?.model,
      scenario: cluster.benchmark?.scenario,
    }))).toEqual([
      { id: 'dgx-h100', result: 31_306.8, model: 'Llama 2 70B (99% accuracy)', scenario: 'Offline throughput' },
      { id: 'dgx-h200', result: 34_988.2, model: 'Llama 2 70B (99% accuracy)', scenario: 'Offline throughput' },
    ]);
  });

  it('contains all four published H200 SuperPOD scale points with correct derived totals', () => {
    expect(h200SuperpodLadder.map((cluster) => [
      cluster.nodeCount, cluster.gpuCount, cluster.totalGpuMemoryGb, cluster.systemPowerKw,
    ])).toEqual([
      [31, 248, 34_968, 316.2],
      [63, 504, 71_064, 642.6],
      [95, 760, 107_160, 969],
      [127, 1_016, 143_256, 1_295.4],
    ]);
    h200SuperpodLadder.forEach((cluster) => {
      expect(cluster.gpuCount).toBe(cluster.nodeCount * 8);
      expect(cluster.totalGpuMemoryGb).toBe(cluster.gpuCount * 141);
      expect(cluster.systemPowerKw).toBeCloseTo(cluster.nodeCount * 10.2);
    });
  });

  it('never promotes a single-node control into a fabricated pod benchmark', () => {
    const pods = enterpriseClusters.filter((cluster) => cluster.scale === 'superpod');
    expect(pods.every((cluster) => cluster.benchmark === undefined)).toBe(true);
    expect(pods.every((cluster) => cluster.nodeControlTokensPerSecond !== undefined)).toBe(true);
  });

  it('keeps all capacity and bandwidth arithmetic internally consistent', () => {
    enterpriseClusters.forEach((cluster) => {
      expect(cluster.totalGpuMemoryGb).toBe(cluster.gpuCount * cluster.gpuMemoryGb);
      expect(cluster.memoryBandwidthTbSPerGpu).toBeGreaterThan(0);
      expect(cluster.systemPowerKw).toBeGreaterThan(0);
    });
  });

  it('gives every configuration a complete-system acquisition range', () => {
    expect(clusterSystemCostById.size).toBe(enterpriseClusters.length);
    enterpriseClusters.forEach((cluster) => {
      const cost = clusterSystemCostById.get(cluster.id)!;
      expect(cost.lowUsd).toBeGreaterThan(0);
      expect(cost.highUsd).toBeGreaterThanOrEqual(cost.lowUsd);
      expect(cost.basis.length).toBeGreaterThan(20);
    });
    expect(clusterSystemCostById.get('dgx-spark-2')).toMatchObject({ lowUsd: 9_600, highUsd: 10_500 });
    expect(clusterSystemCostById.get('dgx-h200')).toMatchObject({ lowUsd: 400_000, highUsd: 500_000 });
    expect(clusterSystemCostById.get('superpod-h200-4su')!.lowUsd).toBeGreaterThan(50_000_000);
  });

  it('qualifies household power from complete-system input data, not GPU TDP alone', () => {
    expect(US_HOUSE_OUTLET_CONTINUOUS_W).toBe(1_440);
    expect(assessHouseOutlet(enterpriseClusters.find((cluster) => cluster.id === 'dgx-station-a100')!)).toMatchObject({
      verdict: 'yes', service: '115–120V / 12A input',
    });
    expect(assessHouseOutlet(enterpriseClusters.find((cluster) => cluster.id === 'h100-nvl-2')!)).toMatchObject({
      verdict: 'conditional',
    });
    expect(assessHouseOutlet(enterpriseClusters.find((cluster) => cluster.id === 'v100-sxm2-quad')!)).toMatchObject({
      verdict: 'no',
    });
    expect(assessHouseOutlet(enterpriseClusters.find((cluster) => cluster.id === 'dgx-h200')!)).toMatchObject({
      verdict: 'no', service: 'Dedicated 200–240V rack circuits / qualified PDU',
    });
    expect(enterpriseClusters.filter((cluster) => assessHouseOutlet(cluster).verdict === 'yes').map((cluster) => cluster.id)).toEqual([
      'dgx-spark-2', 'dgx-spark-3', 'dgx-spark-4', 'dgx-station-a100',
    ]);
  });

  it('models measured cross-node tensor parallelism without inventing TP3', () => {
    expect(dgxSparkTensorParallelResults.map((result) => [result.degree, result.tpotMs, Number(result.outputTokensPerSecond.toFixed(2))])).toEqual([
      [1, 269, 3.72], [2, 133, 7.52], [4, 72, 13.89],
    ]);
    expect(dgxSparkTensorParallelResults[1].speedup).toBeCloseTo(2.02, 2);
    expect(dgxSparkTensorParallelResults[2].scalingEfficiencyPercent).toBeCloseTo(93.4, 1);
    expect(dgxSparkTensorParallelResults.every((result) => result.publishedDate === '2026-03-16')).toBe(true);
    expect(enterpriseClusters.find((cluster) => cluster.id === 'dgx-spark-2')?.tensorParallel?.degree).toBe(2);
    expect(enterpriseClusters.find((cluster) => cluster.id === 'dgx-spark-3')?.tensorParallel).toBeUndefined();
    expect(enterpriseClusters.find((cluster) => cluster.id === 'dgx-spark-4')?.tensorParallel?.degree).toBe(4);
  });

  it('separates the current Spark stack and measured fabric from the older TP snapshot', () => {
    expect(dgxSparkCurrentAudit).toMatchObject({
      documentationUpdatedOn: '2026-08-03',
      dgxOs: '7.5.0',
      driver: '580.159.03',
      cuda: '13.0.2',
      clusterAssistantMinNodes: 2,
      clusterAssistantMaxNodes: 4,
      measuredRdmaLanesGbps: [92.57, 97.28],
      ratedLinkGbps: 200,
      measuredDualNodeRdmaGbps: 189.85,
      latestOfficialTpTableDate: '2026-03-16',
      latestOfficialTpTableRetestedOnCurrentStack: false,
    });
    expect(dgxSparkCurrentAudit.measuredRdmaGbS).toBeCloseTo(23.73, 2);
    expect(dgxSparkCurrentAudit.measuredLinkEfficiencyPercent).toBeCloseTo(94.9, 1);
  });

  it('keeps the separate dual-Spark large-model proof exact and disclosure-limited', () => {
    expect(dgxSparkCapacityProof).toMatchObject({
      nodes: 2,
      model: 'Qwen3 235B',
      promptTokensPerSecond: 23_477.03,
      generatedTokensPerSecond: 11.73,
    });
    expect(dgxSparkCapacityProof.parallelismDisclosure).toContain('does not publish the TP/PP setting');
  });

  it('models all five requested four-GPU PCIe clusters without treating VRAM as shared', () => {
    expect(fourGpuPcieClusters.map((cluster) => [
      cluster.id, cluster.totalGpuMemoryGb, cluster.systemPowerKw,
      cluster.pcieAudit?.generation, cluster.pcieAudit?.theoreticalOneWayGbSPerGpu,
    ])).toEqual([
      ['rtx3090-quad', 96, 1.4, 4, 31.5],
      ['rtx4090-quad', 96, 1.8, 4, 31.5],
      ['rtx5090-quad', 128, 2.3, 5, 63],
      ['rtx-pro-5000-blackwell-quad', 192, 1.2, 5, 63],
      ['rtx-pro-6000-blackwell-maxq-quad', 384, 1.2, 5, 63],
    ]);
    expect(fourGpuPcieClusters.every((cluster) => cluster.gpuCount === 4 && cluster.nodeCount === 1)).toBe(true);
    expect(fourGpuPcieClusters.every((cluster) => cluster.benchmark === undefined)).toBe(true);
    fourGpuPcieClusters.forEach((cluster) => {
      expect(cluster.systemPowerKw * 1_000).toBe(cluster.pcieAudit!.boardPowerWPerGpu * cluster.gpuCount);
    });
  });

  it('keeps heterogeneous four-card LLM observations out of the universal benchmark lane', () => {
    expect(fourGpuPcieClusters.map((cluster) => [
      cluster.id, cluster.pcieAudit?.benchmark?.tokensPerSecond ?? null,
    ])).toEqual([
      ['rtx3090-quad', 39],
      ['rtx4090-quad', 20.3],
      ['rtx5090-quad', 97.5],
      ['rtx-pro-5000-blackwell-quad', null],
      ['rtx-pro-6000-blackwell-maxq-quad', 39.2],
    ]);
  });

  it('gives every enterprise configuration the same raw Llama 2 70B compute contract', () => {
    expect(LLAMA2_70B_Q4_0_MODEL_SIZE_GB).toBe(38.87);
    expect(LLAMA2_70B_DENSE_MATH_TFLOPS_PER_TOKEN).toBe(0.14);
    expect(clusterRawComputeRows).toHaveLength(enterpriseClusters.length);
    expect(clusterRawComputeRows.every((row) => (
      row.aggregateDenseFp16TensorTflops > 0
      && row.aggregateLocalMemoryBandwidthGbS > 0
      && row.idealQ4DecodeTokensPerSecond > 0
      && row.idealFp16MathTokensPerSecond > 0
    ))).toBe(true);
    expect(Object.keys(rawComputeProfiles)).toHaveLength(13);
  });

  it('calculates representative workstation, DGX, and SuperPOD rooflines without efficiency guesses', () => {
    expect(clusterRawComputeById.get('dgx-spark-2')).toMatchObject({
      aggregateDenseFp16TensorTflops: 250,
      aggregateLocalMemoryBandwidthGbS: 546,
    });
    expect(clusterRawComputeById.get('rtx5090-quad')).toMatchObject({
      aggregateDenseFp16TensorTflops: 838,
      aggregateLocalMemoryBandwidthGbS: 7_168,
    });
    expect(clusterRawComputeById.get('dgx-h100')).toMatchObject({
      aggregateDenseFp16TensorTflops: 7_916,
      aggregateLocalMemoryBandwidthGbS: 26_800,
    });
    expect(clusterRawComputeById.get('dgx-h100')!.idealQ4DecodeTokensPerSecond).toBeCloseTo(689.48, 2);
    expect(clusterRawComputeById.get('dgx-h200')!.idealQ4DecodeTokensPerSecond).toBeCloseTo(987.91, 2);
    expect(clusterRawComputeById.get('superpod-h200-4su')).toMatchObject({
      aggregateDenseFp16TensorTflops: 1_005_332,
      aggregateLocalMemoryBandwidthGbS: 4_876_800,
    });
    expect(clusterRawComputeById.get('superpod-h200-4su')!.idealQ4DecodeTokensPerSecond).toBeCloseTo(125_464.37, 2);
  });

  it('marks only the two normalized Blackwell profiles as derived rather than directly published', () => {
    expect(Object.entries(rawComputeProfiles)
      .filter(([, profile]) => profile.basis === 'derived from published sparse FP4 peak')
      .map(([key]) => key)).toEqual(['gb10', 'rtx-pro-5000']);
  });
});
