import { describe, expect, it } from 'vitest';
import {
  preferredV100Benchmark,
  universalOllamaLlama2_7b,
  v100BertInferencePowerCurve,
  v100BroadLlmPowerStudy,
  v100Benchmarks,
  v100FrequencyEfficiency,
  v100ModuleBenchmarks,
  v100ModulePlatforms,
  v100PcieMaxQ,
  v100PcieThermalGuardrail,
  v100PowerFloorObservations,
  v100PowerProfiles,
  v100PowerSystems,
  v100PowerZones,
  v100QuadWallPlans,
  v100ScaleResults,
  v100Sxm3PowerObservation,
  v100Sxm2Adapter100WObservation,
  v100Sxm2QwenPowerSweep,
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

  it('keeps exact PCIe and SXM2 power-limit ranges and curves separate', () => {
    expect(v100PowerProfiles).toHaveLength(2);
    const pcie = v100PowerProfiles.find((profile) => profile.id === 'v100s-pcie-32');
    const sxm2 = v100PowerProfiles.find((profile) => profile.id === 'v100-sxm2-32');
    expect(pcie).toMatchObject({
      formFactor: 'PCIe', minimumPowerW: 100, defaultPowerW: 250, maximumPowerW: 250, dailyTargetW: 200,
    });
    expect(sxm2).toMatchObject({
      formFactor: 'SXM2', minimumPowerW: 150, defaultPowerW: 300, maximumPowerW: 300, dailyTargetW: 200,
    });
    expect(pcie?.points.find((point) => point.capW === 200)?.retainedPercent).toBe(95);
    expect(sxm2?.points.find((point) => point.capW === 200)?.retainedPercent).toBe(91.2);
    v100PowerProfiles.forEach((profile) => {
      expect(profile.points[0].capW).toBe(profile.minimumPowerW);
      expect(profile.points.at(-1)).toMatchObject({ capW: profile.maximumPowerW, retainedPercent: 100 });
      expect(profile.points.every((point) => point.capW >= profile.minimumPowerW && point.capW <= profile.maximumPowerW)).toBe(true);
    });
  });

  it('does not merge the LLM and BERT power sweeps into the CERN device curves', () => {
    expect(v100Sxm2QwenPowerSweep.points).toEqual([
      { capW: 150, generatedTokensPerSecond: 29, retainedPercent: 88.7 },
      { capW: 200, generatedTokensPerSecond: 31.5, retainedPercent: 96.3 },
      { capW: 250, generatedTokensPerSecond: 32.4, retainedPercent: 99.1 },
      { capW: 300, generatedTokensPerSecond: 32.7, retainedPercent: 100 },
    ]);
    expect(v100BertInferencePowerCurve.find((point) => point.capW === 100)).toMatchObject({
      retainedThroughputPercent: 46.7,
      retainedEnergyPercent: 89,
    });
  });

  it('preserves chassis input constraints instead of deriving them from GPU caps', () => {
    expect(v100PowerSystems).toHaveLength(3);
    expect(v100PowerSystems.find((system) => system.id === 'dgx-1-v100')).toMatchObject({
      householdVerdict: 'no',
      systemMaximum: '3,500W system requirement',
    });
    expect(v100PowerSystems.filter((system) => system.householdVerdict === 'conditional')).toHaveLength(2);
  });

  it('documents Max-Q, clock tuning, and the unverified SXM3 floor without inventing one', () => {
    expect(v100PcieMaxQ).toMatchObject({ stockPowerW: 250, officialExamplePowerW: 180 });
    expect(v100PcieMaxQ.commands).toContain('nvidia-smi -pl 180');
    expect(v100FrequencyEfficiency).toEqual([
      { hardware: 'Tesla V100S PCIe 32 GB', efficiencyPeakMhz: 975, maximumClockMhz: 1597, efficiencyGainPercent: 30.52 },
      { hardware: 'Tesla V100 SXM2 32 GB', efficiencyPeakMhz: 975, maximumClockMhz: 1530, efficiencyGainPercent: 21.07 },
    ]);
    expect(v100Sxm3PowerObservation).toMatchObject({ observedPowerLimitW: 350, minimumPowerW: null });
  });

  it('does not turn one SXM2 carrier floor into a form-factor-wide claim', () => {
    expect(v100PowerFloorObservations).toHaveLength(6);
    expect(v100PowerFloorObservations.find((result) => result.id === 'v100-sxm2-32-owner-carrier')).toMatchObject({
      physicalFormFactor: 'SXM2', hostPresentation: 'SXM-to-PCIe carrier', minimumPowerW: 150,
    });
    expect(v100PowerFloorObservations.find((result) => result.id === 'v100-sxm2-16-owner-carrier')).toMatchObject({
      physicalFormFactor: 'SXM2', hostPresentation: 'SXM-to-PCIe carrier', minimumPowerW: null, acceptedLowPowerW: 100,
    });
    expect(v100PowerFloorObservations.find((result) => result.id === 'v100-sxm3-32-bcm')).toMatchObject({
      physicalFormFactor: 'SXM3', minimumPowerW: null, defaultPowerW: 350,
    });
  });

  it('publishes practical cap zones without presenting mixed workloads as one benchmark', () => {
    expect(v100PowerZones).toHaveLength(8);
    expect(v100PowerZones.find((zone) => zone.formFactor === 'PCIe 250W class' && zone.capW === 200)).toMatchObject({
      retainedPerformance: '92–95%', fourGpuCapW: 800, label: 'daily sweet spot',
    });
    expect(v100PowerZones.find((zone) => zone.formFactor === 'SXM2 300W class' && zone.capW === 200)).toMatchObject({
      retainedPerformance: '91–96%', fourGpuCapW: 800, label: 'daily sweet spot',
    });
    expect(v100BroadLlmPowerStudy).toMatchObject({ modelCount: 20, generationAt200W: '<2% reported tg128 loss versus 300W' });
    expect(v100Sxm2Adapter100WObservation).toMatchObject({ capW: 100, retainedPercent: 88, cappedWallPowerW: 170 });
  });

  it('keeps four-GPU wall planning separate from cap-only figures', () => {
    expect(v100QuadWallPlans).toHaveLength(5);
    expect(v100QuadWallPlans.find((plan) => plan.id === 'quad-200')).toMatchObject({
      fourGpuCapW: 800, estimatedWallLowW: 1111, estimatedWallHighW: 1278, outletVerdict: 'fits planning budget',
    });
    expect(v100QuadWallPlans.find((plan) => plan.id === 'sxm2-stock')?.estimatedWallLowW).toBeGreaterThan(1440);
    expect(v100PcieThermalGuardrail).toMatchObject({
      maximumOperatingC: 83, fiftyPercentSlowdownC: 87, shutdownC: 90,
    });
  });
});
