export type V100BenchmarkLane = 'fixed-control' | 'same-model-fa' | 'ollama' | 'modern-llamacpp';

export type V100Benchmark = {
  id: string;
  productId?: string;
  lane: V100BenchmarkLane;
  hardware: string;
  gpuCount: number;
  model: string;
  quantization: string;
  runtime: string;
  workload: string;
  generatedTokensPerSecond: number;
  promptTokensPerSecond?: number;
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  notes: string;
};

export type UniversalOllamaResult = {
  hardware: string;
  generatedTokensPerSecond: number;
  isV100: boolean;
};

export type V100ScaleResult = {
  id: string;
  lane: 'single-stream-llamacpp' | 'multi-user-vllm';
  model: string;
  precision: string;
  workload: string;
  oneGpuTokensPerSecond: number | null;
  twoGpuTokensPerSecond: number | null;
  fourGpuTokensPerSecond: number;
  sourceName: string;
  sourceUrl: string;
  notes: string;
};

export type V100ModulePlatform = {
  id: 'sxm2-quad' | 'sxm3-hgx2';
  module: string;
  baseboard: string;
  baseboardGpuCount: number;
  fourGpuMemoryGb: number;
  baseboardMemoryGb: number;
  memoryBandwidthGbSPerGpu: number;
  fabric: string;
  fabricBandwidthGbSPerGpu: number;
  maxPowerWPerGpu: number;
  fourGpuMaxPowerW: number;
  fourGpuMode: string;
  sourceName: string;
  sourceUrl: string;
  specSourceUrl: string;
  notes: string;
};

export type V100ModuleBenchmark = {
  id: string;
  platform: '4× V100 SXM2 32 GB' | '4× V100 32 GB NVLink board';
  model: string;
  quantization: string;
  runtime: string;
  workload: string;
  resultKind: 'single-stream' | 'aggregate';
  generatedTokensPerSecond: number;
  promptTokensPerSecond?: number;
  peakGeneratedTokensPerSecond?: number;
  measuredLoadPowerW?: number;
  sourceName: string;
  sourceUrl: string;
  notes: string;
};

export type V100PowerCurvePoint = {
  capW: number;
  retainedPercent: number;
  throughput?: number;
  measuredAveragePowerW?: number;
};

export type V100PowerProfile = {
  id: 'v100s-pcie-32' | 'v100-sxm2-32';
  hardware: string;
  formFactor: 'PCIe' | 'SXM2';
  minimumPowerW: number;
  defaultPowerW: number;
  maximumPowerW: number;
  dailyTargetW: number;
  workload: string;
  throughputUnit: 'events/s';
  pointsAreChartReadApproximations: boolean;
  points: V100PowerCurvePoint[];
  sourceName: string;
  sourceUrl: string;
  notes: string;
};

export type V100LlmPowerPoint = {
  capW: number;
  generatedTokensPerSecond: number;
  retainedPercent: number;
};

export type V100LlmPowerSweep = {
  hardware: string;
  model: string;
  runtime: string;
  gpuCount: number;
  points: V100LlmPowerPoint[];
  sourceName: string;
  sourceUrl: string;
  notes: string;
};

export type V100BertPowerPoint = {
  capW: number;
  retainedThroughputPercent: number;
  retainedEnergyPercent: number;
};

export type V100PowerSystem = {
  id: 'dgx-1-v100' | 'dgx-station-v100' | 'dell-c4140-v100';
  system: string;
  gpuConfiguration: string;
  input: string;
  systemMaximum: string;
  householdVerdict: 'no' | 'conditional';
  sourceUrl: string;
  notes: string;
};

export type V100FrequencyEfficiencyPoint = {
  hardware: string;
  efficiencyPeakMhz: number;
  maximumClockMhz: number;
  efficiencyGainPercent: number;
};

export type V100PowerFloorObservation = {
  id: string;
  hardware: string;
  physicalFormFactor: 'PCIe' | 'SXM2' | 'SXM3';
  hostPresentation: 'native PCIe' | 'native SXM baseboard' | 'SXM-to-PCIe carrier';
  memoryGb: number;
  minimumPowerW: number | null;
  acceptedLowPowerW: number | null;
  defaultPowerW: number;
  maximumPowerW: number | null;
  evidence: 'device-reported range' | 'accepted owner setting' | 'documented operating limit';
  sourceName: string;
  sourceUrl: string;
  notes: string;
};

export type V100PowerZone = {
  formFactor: 'PCIe 250W class' | 'SXM2 300W class';
  capW: number;
  stockReductionPercent: number;
  label: 'near stock' | 'daily sweet spot' | 'official example' | 'circuit constrained' | 'capacity only';
  retainedPerformance: string;
  evidenceScope: string;
  fourGpuCapW: number;
};

export type V100QuadWallPlan = {
  id: string;
  configuration: string;
  capWPerGpu: number;
  fourGpuCapW: number;
  estimatedWallLowW: number;
  estimatedWallHighW: number;
  outletVerdict: 'fits planning budget' | 'borderline / can exceed' | 'exceeds planning budget';
};

const observedAt = '2026-08-12';
const llamaCppScoreboard = 'https://github.com/ggml-org/llama.cpp/discussions/15013';
const ollamaStudy = 'https://projector.cloud-mercato.com/projects/scaleway-nvidia-h100/ollama/graph';
const v100Kit = 'https://github.com/andrewleech/v100-llm-kit/blob/main/docs/benchmarks.md';
const cugHpcPaper = 'https://cug.org/proceedings/cug2024_proceedings/views/includes/files/pap145s2-file1.pdf';
const e2eVllmStudy = 'https://www.e2enetworks.com/blog/NVIDIA-a30-vs-v100-for-llM-inference-vllm-tgi-tensorrt-llm-benchmark-7B-70B-Models.md';
const v100DataSheet = 'https://images.nvidia.com/content/technologies/volta/pdf/volta-v100-datasheet-update-us-1165301-r5.pdf';
const nvidiaFabricManager = 'https://docs.nvidia.com/hgx-platforms/fabric-manager-user-guide/index.html';
const sxm2QuadMiniMax = 'https://www.reddit.com/r/LocalLLaMA/comments/1psnlm0/minimaxm2_q3_k_m_on_quad_v100_32gb_llamacpp/';
const v100NvlinkQwen = 'https://www.reddit.com/r/LocalLLaMA/comments/1t3oc0t/do_cheap_32gb_v100s_still_make_sense_for_homelab/';
const cernV100PowerStudy = 'https://indico.cern.ch/event/1589996/contributions/6700372/attachments/3137474/5567442/Optimizing_the_operation_of_GPUs_to_reduce_power_consumption%20%281%29.pdf';
const aclV100PowerStudy = 'https://aclanthology.org/2022.findings-naacl.151.pdf';
export const nvidiaSmiPowerDocs = 'https://docs.nvidia.com/deploy/nvidia-smi/index.html';
const v100PcieProductBrief = 'https://images.nvidia.com/content/tesla/pdf/Tesla-V100-PCIe-Product-Brief.pdf';
const baseCommandManagerInstallManual = 'https://docs.nvidia.com/base-command-manager/manuals/10/installation-manual.pdf';
const v100BroadPowerStudy = 'https://www.reddit.com/r/LocalLLaMA/comments/1s5o37v/v100_32_gb_6h_of_benchmarks_across_20_models_with/';
const hardwareHavenV100Study = 'https://www.youtube.com/watch?v=7DAPd5MGodY';

/**
 * Exact-device power ranges and neural-network-inference curves from CERN
 * openlab Report 08/2025. The paper publishes the device names, nvidia-smi
 * min/default/max values, 50 runs per cap, and plots rather than a raw table;
 * plotted throughput and average-draw values below are therefore deliberately
 * rounded chart readings. Retention is normalized to each device's maximum-cap
 * plotted throughput and is not an LLM token-speed claim.
 */
export const v100PowerProfiles: V100PowerProfile[] = [
  {
    id: 'v100s-pcie-32',
    hardware: 'Tesla V100S PCIe 32 GB',
    formFactor: 'PCIe',
    minimumPowerW: 100,
    defaultPowerW: 250,
    maximumPowerW: 250,
    dailyTargetW: 200,
    workload: 'CERN FlowSim neural-network inference · 50 runs per power cap',
    throughputUnit: 'events/s',
    pointsAreChartReadApproximations: true,
    points: [
      { capW: 100, throughput: 8_800, retainedPercent: 62.9, measuredAveragePowerW: 97 },
      { capW: 125, throughput: 10_600, retainedPercent: 75.7, measuredAveragePowerW: 109 },
      { capW: 150, throughput: 11_900, retainedPercent: 85.0, measuredAveragePowerW: 125 },
      { capW: 175, throughput: 12_750, retainedPercent: 91.1, measuredAveragePowerW: 139 },
      { capW: 200, throughput: 13_300, retainedPercent: 95.0, measuredAveragePowerW: 151 },
      { capW: 225, throughput: 13_700, retainedPercent: 97.9, measuredAveragePowerW: 164 },
      { capW: 250, throughput: 14_000, retainedPercent: 100, measuredAveragePowerW: 171 },
    ],
    sourceName: 'CERN openlab Report 08/2025',
    sourceUrl: cernV100PowerStudy,
    notes: 'This exact V100S PCIe VBIOS accepted 100W. At the 200W daily target, FlowSim retained about 95% of maximum-cap throughput. The cap is a ceiling: the same workload averaged roughly 151W at a 200W cap.',
  },
  {
    id: 'v100-sxm2-32',
    hardware: 'Tesla V100 SXM2 32 GB',
    formFactor: 'SXM2',
    minimumPowerW: 150,
    defaultPowerW: 300,
    maximumPowerW: 300,
    dailyTargetW: 200,
    workload: 'CERN FlowSim neural-network inference · 4-GPU bare-metal node · 50 runs per power cap',
    throughputUnit: 'events/s',
    pointsAreChartReadApproximations: true,
    points: [
      { capW: 150, throughput: 11_500, retainedPercent: 80.7, measuredAveragePowerW: 139 },
      { capW: 175, throughput: 12_400, retainedPercent: 87.0, measuredAveragePowerW: 155 },
      { capW: 200, throughput: 13_000, retainedPercent: 91.2, measuredAveragePowerW: 170 },
      { capW: 225, throughput: 13_250, retainedPercent: 93.0, measuredAveragePowerW: 180 },
      { capW: 250, throughput: 13_650, retainedPercent: 95.8, measuredAveragePowerW: 200 },
      { capW: 275, throughput: 14_000, retainedPercent: 98.2, measuredAveragePowerW: 215 },
      { capW: 300, throughput: 14_250, retainedPercent: 100, measuredAveragePowerW: 225 },
    ],
    sourceName: 'CERN openlab Report 08/2025',
    sourceUrl: cernV100PowerStudy,
    notes: 'This exact SXM2 VBIOS rejected caps below 150W. At 200W, FlowSim retained about 91% of maximum-cap throughput while the four-GPU cap ceiling fell from 1,200W to 800W.',
  },
];

/** Direct owner-reported LLM sweep on one 32 GB SXM2 module in a PCIe holder. */
export const v100Sxm2QwenPowerSweep: V100LlmPowerSweep = {
  hardware: 'Tesla V100 SXM2 32 GB on PCIe holder',
  model: 'Qwen3.6 27B',
  runtime: 'llama.cpp · single GPU',
  gpuCount: 1,
  points: [
    { capW: 150, generatedTokensPerSecond: 29.0, retainedPercent: 88.7 },
    { capW: 200, generatedTokensPerSecond: 31.5, retainedPercent: 96.3 },
    { capW: 250, generatedTokensPerSecond: 32.4, retainedPercent: 99.1 },
    { capW: 300, generatedTokensPerSecond: 32.7, retainedPercent: 100 },
  ],
  sourceName: 'Direct owner power sweep / LocalLLaMA',
  sourceUrl: v100NvlinkQwen,
  notes: 'Exact text-published token rates, but one owner and no published prompt-processing lane. The same owner reported only 124W actual draw for a 79.44 tok/s Qwen3.6 36B-A3B MoE run at a 150W cap, illustrating that a limit is not a demand target.',
};

/**
 * A broader owner sweep than the four-point Qwen result above. The author
 * published the cross-model conclusions but not a machine-readable row for
 * every model/cap pair, so the UI keeps the reported ranges as text rather
 * than manufacturing per-model numbers.
 */
export const v100BroadLlmPowerStudy = {
  hardware: 'Air-cooled V100 32 GB · SXM2 module on a PCIe-presented carrier',
  modelCount: 20,
  capsW: [150, 200, 250, 300],
  contextTokens: 32_000,
  generationAt200W: '<2% reported tg128 loss versus 300W',
  moeAt150W: '90–97% generation retained',
  densePromptAt150W: 'Up to 22% prompt-processing loss',
  sourceName: 'Direct owner six-hour / 20-model sweep',
  sourceUrl: v100BroadPowerStudy,
  notes: 'This adds breadth, not a universal control: model architecture, quantization, offload, and context varied. It supports 200W as the daily starting point and shows why 150W must be checked against prefill/TTFT instead of decode alone.',
};

/** A low-floor exception that proves carrier/VBIOS behavior is not universal. */
export const v100Sxm2Adapter100WObservation = {
  hardware: 'Tesla V100 SXM2 16 GB on a single-module PCIe carrier',
  capW: 100,
  stockSpeedTokensPerSecond: 108,
  cappedSpeedTokensPerSecond: 95,
  retainedPercent: 88.0,
  stockWallPowerW: 293,
  cappedWallPowerW: 170,
  sourceName: 'Hardware Haven direct owner video',
  sourceUrl: hardwareHavenV100Study,
  notes: 'This owner setup accepted 100W even though the tested 32GB SXM2 VBIOS in the CERN/LLM sweeps rejected it. It is a 16GB carrier build and cannot be used to claim that a 32GB module, four-module baseboard, or DGX will accept 100W.',
};

/**
 * Controlled BERT inference on two 250W-default V100 GPUs. The paper does not
 * identify PCIe versus an SXM device capped to 250W, so this remains a separate
 * form-factor-undisclosed cross-check rather than being assigned to PCIe.
 */
export const v100BertInferencePowerCurve: V100BertPowerPoint[] = [
  { capW: 100, retainedThroughputPercent: 46.7, retainedEnergyPercent: 89.0 },
  { capW: 150, retainedThroughputPercent: 81.5, retainedEnergyPercent: 75.8 },
  { capW: 200, retainedThroughputPercent: 92.4, retainedEnergyPercent: 88.0 },
  { capW: 250, retainedThroughputPercent: 100, retainedEnergyPercent: 100 },
];

export const v100BertPowerSource = {
  name: 'NAACL 2022 V100 BERT inference study',
  url: aclV100PowerStudy,
  notes: 'Two V100 GPUs, form factor and memory capacity undisclosed. Throughput retention is derived from the paper\'s published runtime increases; energy percentages are directly reported. This compute-heavy lane shows why 100W is too aggressive despite being accepted by some PCIe VBIOS versions.',
};

export const v100Pcie32PowerObservation = {
  hardware: 'Tesla V100 PCIe 32 GB',
  minimumPowerW: 100,
  defaultPowerW: 250,
  maximumPowerW: 250,
  sourceName: 'Exact-device nvidia-smi diagnostic / NVIDIA Developer Forums',
  sourceUrl: 'https://forums.developer.nvidia.com/t/tesla-v100-sw-thermal-slowdown-active/160924',
  notes: 'An exact V100-PCIE-32GB diagnostic reports a 100–250W range. Treat this as a reference-board observation, not a guarantee for every OEM VBIOS; NVIDIA requires the requested value to stay inside the min/max reported by the installed device.',
};

export const v100PcieMaxQ = {
  hardware: 'Tesla V100 PCIe 16/32 GB',
  stockPowerW: 250,
  officialExamplePowerW: 180,
  sourceName: 'NVIDIA Tesla V100 PCIe Product Brief',
  sourceUrl: v100PcieProductBrief,
  commands: ['nvidia-smi -pm 1', 'nvidia-smi -pl 180', 'nvidia-smi -pl 250'],
  notes: 'NVIDIA defines Max-Q as the workload-specific point with the best performance per watt, not as one fixed cap. Its official V100 PCIe example uses 180W and restores the 250W default afterward; the installed card\'s reported minimum still governs what nvidia-smi will accept.',
};

export const v100Sxm3PowerObservation = {
  hardware: 'Tesla V100 SXM3 32 GB',
  observedPowerLimitW: 350,
  minimumPowerW: null,
  sourceName: 'NVIDIA Base Command Manager installation manual',
  sourceUrl: baseCommandManagerInstallManual,
  notes: 'NVIDIA documents an exact V100-SXM3-32GB at a 350W power limit. No source with both its device-reported minimum and a matched inference sweep was found, so the SXM2 150W floor must not be copied onto SXM3. Query the exact DGX-2/HGX-2 node before planning a cap.',
};

export const v100PowerFloorObservations: V100PowerFloorObservation[] = [
  {
    id: 'v100-pcie-32-diagnostic', hardware: 'Tesla V100 PCIe 32 GB', physicalFormFactor: 'PCIe', hostPresentation: 'native PCIe', memoryGb: 32,
    minimumPowerW: 100, acceptedLowPowerW: 100, defaultPowerW: 250, maximumPowerW: 250, evidence: 'device-reported range',
    sourceName: v100Pcie32PowerObservation.sourceName, sourceUrl: v100Pcie32PowerObservation.sourceUrl,
    notes: 'Exact nvidia-smi output for one reference-style 32GB PCIe board. OEM VBIOS constraints can still differ.',
  },
  {
    id: 'v100s-pcie-32-cern', hardware: 'Tesla V100S PCIe 32 GB', physicalFormFactor: 'PCIe', hostPresentation: 'native PCIe', memoryGb: 32,
    minimumPowerW: 100, acceptedLowPowerW: 100, defaultPowerW: 250, maximumPowerW: 250, evidence: 'device-reported range',
    sourceName: 'CERN openlab Report 08/2025', sourceUrl: cernV100PowerStudy,
    notes: 'CERN both reported the range and swept every 25W step from 100W to 250W.',
  },
  {
    id: 'v100-sxm2-32-cern', hardware: 'Tesla V100 SXM2 32 GB', physicalFormFactor: 'SXM2', hostPresentation: 'native SXM baseboard', memoryGb: 32,
    minimumPowerW: 150, acceptedLowPowerW: 150, defaultPowerW: 300, maximumPowerW: 300, evidence: 'device-reported range',
    sourceName: 'CERN openlab Report 08/2025', sourceUrl: cernV100PowerStudy,
    notes: 'The tested four-GPU node rejected requests below 150W.',
  },
  {
    id: 'v100-sxm2-32-owner-carrier', hardware: 'Tesla V100 SXM2 32 GB', physicalFormFactor: 'SXM2', hostPresentation: 'SXM-to-PCIe carrier', memoryGb: 32,
    minimumPowerW: 150, acceptedLowPowerW: 150, defaultPowerW: 300, maximumPowerW: 300, evidence: 'accepted owner setting',
    sourceName: v100BroadLlmPowerStudy.sourceName, sourceUrl: v100BroadLlmPowerStudy.sourceUrl,
    notes: 'The owner reports 100W was rejected and swept 150/200/250/300W on the air-cooled carrier setup.',
  },
  {
    id: 'v100-sxm2-16-owner-carrier', hardware: 'Tesla V100 SXM2 16 GB', physicalFormFactor: 'SXM2', hostPresentation: 'SXM-to-PCIe carrier', memoryGb: 16,
    minimumPowerW: null, acceptedLowPowerW: 100, defaultPowerW: 300, maximumPowerW: null, evidence: 'accepted owner setting',
    sourceName: v100Sxm2Adapter100WObservation.sourceName, sourceUrl: v100Sxm2Adapter100WObservation.sourceUrl,
    notes: '100W demonstrably worked, but the video does not publish nvidia-smi minimum/maximum constraints. This is an exception—not a portable floor.',
  },
  {
    id: 'v100-sxm3-32-bcm', hardware: 'Tesla V100 SXM3 32 GB', physicalFormFactor: 'SXM3', hostPresentation: 'native SXM baseboard', memoryGb: 32,
    minimumPowerW: null, acceptedLowPowerW: null, defaultPowerW: 350, maximumPowerW: null, evidence: 'documented operating limit',
    sourceName: v100Sxm3PowerObservation.sourceName, sourceUrl: v100Sxm3PowerObservation.sourceUrl,
    notes: 'Only the 350W operating limit is verified. The SXM2 floor must not be copied to HGX-2/DGX-2.',
  },
];

export const v100PowerZones: V100PowerZone[] = [
  { formFactor: 'PCIe 250W class', capW: 200, stockReductionPercent: 20, label: 'daily sweet spot', retainedPerformance: '92–95%', evidenceScope: 'FlowSim PCIe + form-factor-undisclosed BERT; exact PCIe LLM sweep still missing', fourGpuCapW: 800 },
  { formFactor: 'PCIe 250W class', capW: 180, stockReductionPercent: 28, label: 'official example', retainedPerformance: 'Not published', evidenceScope: 'NVIDIA Max-Q command example—not a performance promise', fourGpuCapW: 720 },
  { formFactor: 'PCIe 250W class', capW: 150, stockReductionPercent: 40, label: 'circuit constrained', retainedPerformance: '82–85%', evidenceScope: 'FlowSim PCIe + form-factor-undisclosed BERT', fourGpuCapW: 600 },
  { formFactor: 'PCIe 250W class', capW: 100, stockReductionPercent: 60, label: 'capacity only', retainedPerformance: '47–63%', evidenceScope: 'V100S FlowSim + form-factor-undisclosed BERT; not an LLM decode result', fourGpuCapW: 400 },
  { formFactor: 'SXM2 300W class', capW: 250, stockReductionPercent: 16.7, label: 'near stock', retainedPerformance: '96–99%', evidenceScope: 'FlowSim + direct Qwen3.6 27B decode', fourGpuCapW: 1000 },
  { formFactor: 'SXM2 300W class', capW: 200, stockReductionPercent: 33.3, label: 'daily sweet spot', retainedPerformance: '91–96%', evidenceScope: 'FlowSim + direct Qwen3.6 27B decode', fourGpuCapW: 800 },
  { formFactor: 'SXM2 300W class', capW: 175, stockReductionPercent: 41.7, label: 'circuit constrained', retainedPerformance: '87% FlowSim', evidenceScope: 'Controlled FlowSim only; no matching LLM point', fourGpuCapW: 700 },
  { formFactor: 'SXM2 300W class', capW: 150, stockReductionPercent: 50, label: 'capacity only', retainedPerformance: '81–89%', evidenceScope: 'FlowSim + direct Qwen3.6 27B decode', fourGpuCapW: 600 },
];

/**
 * Deliberately conservative planning ceilings, not measurements: four GPUs at
 * the selected cap + 200–350W of DC host/fans, divided by 90% PSU efficiency.
 * A workload that does not hit its cap will draw less.
 */
export const v100QuadWallPlans: V100QuadWallPlan[] = [
  { id: 'pcie-stock', configuration: '4× PCIe · stock ceiling', capWPerGpu: 250, fourGpuCapW: 1000, estimatedWallLowW: 1333, estimatedWallHighW: 1500, outletVerdict: 'borderline / can exceed' },
  { id: 'sxm2-stock', configuration: '4× SXM2 · stock ceiling', capWPerGpu: 300, fourGpuCapW: 1200, estimatedWallLowW: 1556, estimatedWallHighW: 1722, outletVerdict: 'exceeds planning budget' },
  { id: 'quad-200', configuration: '4× either form · daily target', capWPerGpu: 200, fourGpuCapW: 800, estimatedWallLowW: 1111, estimatedWallHighW: 1278, outletVerdict: 'fits planning budget' },
  { id: 'quad-175', configuration: '4× either form · reduced', capWPerGpu: 175, fourGpuCapW: 700, estimatedWallLowW: 1000, estimatedWallHighW: 1167, outletVerdict: 'fits planning budget' },
  { id: 'quad-150', configuration: '4× either form · hard cap', capWPerGpu: 150, fourGpuCapW: 600, estimatedWallLowW: 889, estimatedWallHighW: 1056, outletVerdict: 'fits planning budget' },
];

export const v100PcieThermalGuardrail = {
  hardware: 'Tesla V100 PCIe 16/32 GB',
  thermalQualificationC: 80,
  maximumOperatingC: 83,
  hbmMaximumOperatingC: 85,
  fiftyPercentSlowdownC: 87,
  shutdownC: 90,
  cooling: 'Passive, bidirectional heatsink; chassis airflow is mandatory',
  sourceName: 'NVIDIA Tesla V100 PCIe Product Brief',
  sourceUrl: v100PcieProductBrief,
  notes: 'A software cap does not make the board self-cooling. Thermal slowdown can look like successful power throttling while destroying performance, so log clocks, temperature, and clock-event reasons together.',
};

export const v100PowerMeasurementMethod = {
  sourceName: 'NVIDIA nvidia-smi documentation',
  sourceUrl: nvidiaSmiPowerDocs,
  notes: 'On Volta, power.draw is an instantaneous whole-board sample; the one-second averaged field is documented only for Ampere (except GA100) and newer. Sample repeatedly, average the run, and use a wall meter for the complete system.',
};

export const v100FrequencyEfficiency: V100FrequencyEfficiencyPoint[] = [
  {
    hardware: 'Tesla V100S PCIe 32 GB',
    efficiencyPeakMhz: 975,
    maximumClockMhz: 1597,
    efficiencyGainPercent: 30.52,
  },
  {
    hardware: 'Tesla V100 SXM2 32 GB',
    efficiencyPeakMhz: 975,
    maximumClockMhz: 1530,
    efficiencyGainPercent: 21.07,
  },
];

export const v100FrequencyEfficiencySource = {
  name: 'CERN openlab Report 08/2025',
  url: cernV100PowerStudy,
  notes: 'CERN found peak throughput per watt near 975MHz on both tested V100 variants. A locked core clock is a second tuning lever, but it should be benchmarked independently from the power-cap sweep before combining the two controls.',
};

export const v100PowerSystems: V100PowerSystem[] = [
  {
    id: 'dgx-1-v100',
    system: 'NVIDIA DGX-1 with V100',
    gpuConfiguration: '8× V100 SXM2',
    input: '200–240 VAC only · four 1,600W PSUs',
    systemMaximum: '3,500W system requirement',
    householdVerdict: 'no',
    sourceUrl: 'https://docs.nvidia.com/dgx/archives/dgx1-user-guide/installation-and-setup.html',
    notes: 'GPU caps do not change the manufacturer-required input voltage. This remains a PDU / high-line installation even when the GPUs are limited.',
  },
  {
    id: 'dgx-station-v100',
    system: 'NVIDIA DGX Station V100',
    gpuConfiguration: '4× V100 SXM2 · 128 GB total',
    input: '115–240 VAC · 12–8A',
    systemMaximum: 'Up to 1,500W under heavy load',
    householdVerdict: 'conditional',
    sourceUrl: 'https://docs.nvidia.com/dgx/archives/dgx-station-user-guide/index.html',
    notes: 'It accepts low-line input, but its published 1,500W maximum is above a conservative 1,440W continuous budget for one 120V/15A branch. Cap, measure at the wall, and use a verified dedicated circuit.',
  },
  {
    id: 'dell-c4140-v100',
    system: 'Dell EMC PowerEdge C4140',
    gpuConfiguration: 'Up to 4× PCIe or SXM2 V100',
    input: '100–240 VAC · 2,000W or 2,400W PSU options',
    systemMaximum: 'Low-line PSU output is derated',
    householdVerdict: 'conditional',
    sourceUrl: 'https://dl.dell.com/manuals/all-products/esuprt_ser_stor_net/esuprt_cloud_products/poweredge-c4140_Setup_Guide_en-us.pdf',
    notes: 'At 100–120V, Dell documents derating the 2,400W PSU to 1,400W and the 2,000W PSU to 1,000W. Exact PSU population, redundancy mode, plug, and branch current must be verified before treating it as a household build.',
  },
];

// SXM modules belong to a dedicated baseboard and must not be represented as
// motherboard-installable PCIe add-in cards in the general GPU catalog.
export const v100ModulePlatforms: V100ModulePlatform[] = [
  {
    id: 'sxm2-quad',
    module: 'Tesla V100 SXM2 32 GB',
    baseboard: '4-module NVLink baseboard',
    baseboardGpuCount: 4,
    fourGpuMemoryGb: 128,
    baseboardMemoryGb: 128,
    memoryBandwidthGbSPerGpu: 900,
    fabric: 'NVLink 2.0 · direct GPU mesh',
    fabricBandwidthGbSPerGpu: 300,
    maxPowerWPerGpu: 300,
    fourGpuMaxPowerW: 1200,
    fourGpuMode: 'All four physical modules; verify the board wiring with nvidia-smi topo -m',
    sourceName: 'NVIDIA V100 datasheet',
    sourceUrl: v100DataSheet,
    specSourceUrl: v100DataSheet,
    notes: 'This is the practical four-module homelab configuration. NVLink gives each GPU a faster path to peer memory, but the four 32 GB HBM2 pools remain separate allocations managed by the runtime.',
  },
  {
    id: 'sxm3-hgx2',
    module: 'Tesla V100 SXM3 32 GB',
    baseboard: 'HGX-2 NVSwitch baseboard',
    baseboardGpuCount: 8,
    fourGpuMemoryGb: 128,
    baseboardMemoryGb: 256,
    memoryBandwidthGbSPerGpu: 900,
    fabric: '6× first-generation NVSwitch',
    fabricBandwidthGbSPerGpu: 300,
    maxPowerWPerGpu: 350,
    fourGpuMaxPowerW: 1400,
    fourGpuMode: 'A 4-GPU partition of an 8-module board; full-passthrough mode exposes 3 of 6 NVLinks per GPU',
    sourceName: 'NVIDIA Fabric Manager guide',
    sourceUrl: nvidiaFabricManager,
    specSourceUrl: nvidiaFabricManager,
    notes: 'SXM3 is not a commodity four-socket counterpart to the SXM2 board. HGX-2 starts with eight modules and six NVSwitches; a complete DGX-2 joins two such boards for 16 GPUs.',
  },
];

// Community measurements are retained because they expose the exact module
// count and interconnect. They are not merged with the controlled Llama 2 lane.
export const v100ModuleBenchmarks: V100ModuleBenchmark[] = [
  {
    id: 'quad-sxm2-minimax-layer',
    platform: '4× V100 SXM2 32 GB',
    model: 'MiniMax M2',
    quantization: 'Q3_K_M',
    runtime: 'llama.cpp · CUDA · split-mode layer',
    workload: 'one response · 52-token prompt · 6,476 generated tokens',
    resultKind: 'single-stream',
    generatedTokensPerSecond: 38.6,
    promptTokensPerSecond: 1683.88,
    sourceName: 'Direct owner benchmark / LocalLLaMA',
    sourceUrl: sxm2QuadMiniMax,
    notes: 'Exact four-module 32 GB SXM2 NVLink build. Layer split was the faster of the two modes published on this same machine.',
  },
  {
    id: 'quad-sxm2-minimax-row',
    platform: '4× V100 SXM2 32 GB',
    model: 'MiniMax M2',
    quantization: 'Q3_K_M',
    runtime: 'llama.cpp · CUDA · split-mode row',
    workload: 'one response · 52-token prompt · 6,236 generated tokens',
    resultKind: 'single-stream',
    generatedTokensPerSecond: 20.05,
    promptTokensPerSecond: 70.9,
    sourceName: 'Direct owner benchmark / LocalLLaMA',
    sourceUrl: sxm2QuadMiniMax,
    notes: 'Same exact host and model as the layer-split row. It demonstrates that software partitioning can matter more than the raw NVLink headline.',
  },
  {
    id: 'quad-v100-nvlink-qwen35-122b',
    platform: '4× V100 32 GB NVLink board',
    model: 'Qwen 3.5 122B',
    quantization: 'AWQ',
    runtime: '1Cat vLLM fork · four concurrent requests',
    workload: '32,000 total input · 2,000 total output tokens · full context',
    resultKind: 'aggregate',
    generatedTokensPerSecond: 61.61,
    peakGeneratedTokensPerSecond: 75,
    measuredLoadPowerW: 600,
    sourceName: 'Direct owner benchmark / LocalLLaMA',
    sourceUrl: v100NvlinkQwen,
    notes: 'The owner identifies a four-V100 32 GB NVLink board but does not publish the module revision. The 61.61 tok/s figure is aggregate output across four requests, not one chat stream.',
  },
];

// Every row below is a published measurement. Lanes deliberately preserve
// runtime, model, quantization, GPU count, and form factor boundaries.
export const v100Benchmarks: V100Benchmark[] = [
  {
    id: 'v100-32-llama2-7b-no-fa',
    productId: 'nvidia-tesla-v100-pcie-32',
    lane: 'fixed-control',
    hardware: 'Tesla V100 32 GB · form factor undisclosed',
    gpuCount: 1,
    model: 'Llama 2 7B',
    quantization: 'Q4_0',
    runtime: 'llama.cpp · CUDA · Flash Attention off',
    workload: 'one GPU · full offload · pp512 / tg128',
    generatedTokensPerSecond: 129.08,
    promptTokensPerSecond: 3042.64,
    sourceName: 'llama.cpp CUDA scoreboard',
    sourceUrl: llamaCppScoreboard,
    observedAt,
    notes: 'The accepted submission names Tesla V100 32 GB but does not disclose PCIe versus SXM. It is the fixed cross-card control and is not inherited by V100S.',
  },
  {
    id: 'v100-32-llama2-7b-fa',
    productId: 'nvidia-tesla-v100-pcie-32',
    lane: 'same-model-fa',
    hardware: 'Tesla V100 32 GB · form factor undisclosed',
    gpuCount: 1,
    model: 'Llama 2 7B',
    quantization: 'Q4_0',
    runtime: 'llama.cpp · CUDA · Flash Attention on',
    workload: 'one GPU · full offload · pp512 / tg128',
    generatedTokensPerSecond: 134.76,
    promptTokensPerSecond: 2973.78,
    sourceName: 'llama.cpp CUDA scoreboard',
    sourceUrl: llamaCppScoreboard,
    observedAt,
    notes: 'Same submission, model, and token counts as the fixed control with Flash Attention enabled. Kept outside the no-FA ranking.',
  },
  {
    id: 'v100s-32-ollama-llama2-7b',
    productId: 'nvidia-tesla-v100s-pcie-32',
    lane: 'ollama',
    hardware: 'Tesla V100S PCIe 32 GB',
    gpuCount: 1,
    model: 'Llama 2 7B',
    quantization: 'Ollama package · exact digest undisclosed',
    runtime: 'Ollama',
    workload: 'official Llama 2 model · verbose 100-word weather response',
    generatedTokensPerSecond: 121.96701149425286,
    sourceName: 'Cloud Mercato Projector Ollama study',
    sourceUrl: ollamaStudy,
    observedAt,
    notes: 'Exact V100S-PCIE-32GB device label. This is the strongest exact-device V100S result found, but it is not inserted into the llama.cpp Q4_0 control rank.',
  },
  {
    id: 'v100s-32-ollama-llama2-13b',
    productId: 'nvidia-tesla-v100s-pcie-32',
    lane: 'ollama',
    hardware: 'Tesla V100S PCIe 32 GB',
    gpuCount: 1,
    model: 'Llama 2 13B',
    quantization: 'Ollama package · exact digest undisclosed',
    runtime: 'Ollama',
    workload: 'official Llama 2 model · verbose 100-word weather response',
    generatedTokensPerSecond: 77.16588235294118,
    sourceName: 'Cloud Mercato Projector Ollama study',
    sourceUrl: ollamaStudy,
    observedAt,
    notes: 'Exact V100S-PCIE-32GB device label in the same Ollama study as the 7B result.',
  },
  {
    id: 'v100s-32-ollama-llama2-70b',
    productId: 'nvidia-tesla-v100s-pcie-32',
    lane: 'ollama',
    hardware: 'Tesla V100S PCIe 32 GB',
    gpuCount: 1,
    model: 'Llama 2 70B',
    quantization: 'Ollama package · exact digest undisclosed',
    runtime: 'Ollama',
    workload: 'official Llama 2 model · verbose 100-word weather response',
    generatedTokensPerSecond: 2.4988235294117644,
    sourceName: 'Cloud Mercato Projector Ollama study',
    sourceUrl: ollamaStudy,
    observedAt,
    notes: 'The source does not publish placement details. The sharp drop is consistent with a model that cannot remain wholly inside one 32 GB pool, but that interpretation is not treated as a measured fact.',
  },
  {
    id: 'v100-pcie-16-ollama-llama2-7b',
    lane: 'ollama',
    hardware: 'Tesla V100 PCIe 16 GB',
    gpuCount: 1,
    model: 'Llama 2 7B',
    quantization: 'Ollama package · exact digest undisclosed',
    runtime: 'Ollama',
    workload: 'official Llama 2 model · verbose 100-word weather response',
    generatedTokensPerSecond: 110.15955555555556,
    sourceName: 'Cloud Mercato Projector Ollama study',
    sourceUrl: ollamaStudy,
    observedAt,
    notes: 'Same published harness as the exact V100S result; retained as a form-factor family comparison rather than a catalog control row.',
  },
  {
    id: 'v100-sxm2-16-ollama-llama2-7b',
    lane: 'ollama',
    hardware: 'Tesla V100 SXM2 16 GB',
    gpuCount: 1,
    model: 'Llama 2 7B',
    quantization: 'Ollama package · exact digest undisclosed',
    runtime: 'Ollama',
    workload: 'official Llama 2 model · verbose 100-word weather response',
    generatedTokensPerSecond: 117.11066666666667,
    sourceName: 'Cloud Mercato Projector Ollama study',
    sourceUrl: ollamaStudy,
    observedAt,
    notes: 'Same published harness as the exact V100S result; useful for isolating V100 family form-factor differences.',
  },
  {
    id: 'v100-sxm2-16-gemma4-26b',
    lane: 'modern-llamacpp',
    hardware: 'Tesla V100 SXM2 16 GB',
    gpuCount: 1,
    model: 'Gemma 4 26B-A4B',
    quantization: 'QAT Q4_0',
    runtime: 'llama.cpp 02182fc · CUDA · FA on · Windows TCC',
    workload: 'one GPU · q8_0 KV · pp512 / tg128',
    generatedTokensPerSecond: 99.8,
    promptTokensPerSecond: 2023,
    sourceName: 'V100 LLM Kit measured benchmarks',
    sourceUrl: v100Kit,
    observedAt,
    notes: 'Fully GPU-resident single-card run. The source also publishes slower MCDM and WSL2 results under otherwise matched settings.',
  },
  {
    id: 'v100-sxm2-16-qwen36-35b',
    lane: 'modern-llamacpp',
    hardware: 'Tesla V100 SXM2 16 GB',
    gpuCount: 1,
    model: 'Qwen3.6 35B-A3B',
    quantization: 'IQ4_XS',
    runtime: 'ik_llama.cpp 022bd00a · CUDA · FA on · Windows TCC',
    workload: 'one GPU · expert CPU offload · q8_0 KV · pp512 / tg128',
    generatedTokensPerSecond: 54.5,
    promptTokensPerSecond: 542,
    sourceName: 'V100 LLM Kit measured benchmarks',
    sourceUrl: v100Kit,
    observedAt,
    notes: 'Measured single-card result with some experts offloaded because the weights do not wholly fit in 16 GB.',
  },
  {
    id: 'dual-v100-sxm2-16-qwen36-35b',
    lane: 'modern-llamacpp',
    hardware: '2× Tesla V100 SXM2 16 GB + NVLink',
    gpuCount: 2,
    model: 'Qwen3.6 35B-A3B',
    quantization: 'IQ4_XS',
    runtime: 'llama.cpp · CUDA · FA on · Windows TCC',
    workload: 'two GPUs · layer split · fully resident · tg128',
    generatedTokensPerSecond: 82.8,
    sourceName: 'V100 LLM Kit measured benchmarks',
    sourceUrl: v100Kit,
    observedAt,
    notes: 'The same source measured 60.8 tok/s with tensor split; layer split is retained here as the faster published mode for this MoE.',
  },
  {
    id: 'dual-v100-sxm2-16-qwen36-27b',
    lane: 'modern-llamacpp',
    hardware: '2× Tesla V100 SXM2 16 GB + NVLink',
    gpuCount: 2,
    model: 'Qwen3.6 27B dense',
    quantization: 'source benchmark package',
    runtime: 'llama.cpp · CUDA · FA on · Windows TCC',
    workload: 'two GPUs · tensor split · fully resident · tg128',
    generatedTokensPerSecond: 39.4,
    sourceName: 'V100 LLM Kit measured benchmarks',
    sourceUrl: v100Kit,
    observedAt,
    notes: 'The source measured 32.4 tok/s with layer split and 39.4 tok/s with tensor split; the faster exact run is shown.',
  },
];

// Same model family, prompt, runtime, and study. This is an independent
// universal comparison lane; it must not be merged with llama-bench tg128.
export const universalOllamaLlama2_7b: UniversalOllamaResult[] = [
  { hardware: 'H100 PCIe', generatedTokensPerSecond: 160.78670454545454, isV100: false },
  { hardware: 'V100S PCIe 32 GB', generatedTokensPerSecond: 121.96701149425286, isV100: true },
  { hardware: 'V100 SXM2 16 GB', generatedTokensPerSecond: 117.11066666666667, isV100: true },
  { hardware: 'V100 PCIe 16 GB', generatedTokensPerSecond: 110.15955555555556, isV100: true },
  { hardware: 'A100 SXM4 40 GB', generatedTokensPerSecond: 108.43722222222222, isV100: false },
  { hardware: 'A40', generatedTokensPerSecond: 94.9889880952381, isV100: false },
];

// Two deliberately separate answers to “how fast are four V100s?”:
// llama.cpp measures one interactive generation and shows sharding overhead,
// while vLLM measures aggregate server throughput from four concurrent clients.
export const v100ScaleResults: V100ScaleResult[] = [
  {
    id: 'v100-scale-llamacpp-llama2-7b', lane: 'single-stream-llamacpp', model: 'Llama 2 7B', precision: 'Q4_K_M',
    workload: 'llama.cpp · one generated response · mean of 10 runs',
    oneGpuTokensPerSecond: 100.95, twoGpuTokensPerSecond: 96.87, fourGpuTokensPerSecond: 92.21,
    sourceName: 'CUG 2024 / Indiana University HPC study', sourceUrl: cugHpcPaper,
    notes: 'The 4.08 GiB model already fits one V100. Splitting it across more GPUs adds communication overhead and makes one response slower.',
  },
  {
    id: 'v100-scale-llamacpp-llama2-13b', lane: 'single-stream-llamacpp', model: 'Llama 2 13B', precision: 'Q4_K_M',
    workload: 'llama.cpp · one generated response · mean of 10 runs',
    oneGpuTokensPerSecond: 61.96, twoGpuTokensPerSecond: 61.21, fourGpuTokensPerSecond: 59.02,
    sourceName: 'CUG 2024 / Indiana University HPC study', sourceUrl: cugHpcPaper,
    notes: 'The 7.87 GiB model also fits one V100; four-way layer distribution is 4.7% slower for a single response.',
  },
  {
    id: 'v100-scale-llamacpp-llama2-70b', lane: 'single-stream-llamacpp', model: 'Llama 2 70B', precision: 'Q4_K_M',
    workload: 'llama.cpp · one generated response · mean of 10 runs',
    oneGpuTokensPerSecond: null, twoGpuTokensPerSecond: 15.57, fourGpuTokensPerSecond: 15.26,
    sourceName: 'CUG 2024 / Indiana University HPC study', sourceUrl: cugHpcPaper,
    notes: 'The 41.42 GiB quant does not fit one 32 GB card. Two cards fit it and are marginally faster than four; extra cards add capacity, not single-stream speed.',
  },
  {
    id: 'v100-scale-vllm-llama2-7b', lane: 'multi-user-vllm', model: 'Llama 2 7B', precision: 'FP16',
    workload: 'vLLM · four async clients · 128 input + 256 output · aggregate throughput',
    oneGpuTokensPerSecond: 153.8, twoGpuTokensPerSecond: 250.0, fourGpuTokensPerSecond: 400.2,
    sourceName: 'E2E Networks V100 inference study', sourceUrl: e2eVllmStudy,
    notes: 'Aggregate server throughput rises 2.60× from one to four PCIe V100s. This is not the speed of one user’s response.',
  },
  {
    id: 'v100-scale-vllm-llama2-13b', lane: 'multi-user-vllm', model: 'Llama 2 13B', precision: 'FP16',
    workload: 'vLLM · four async clients · 128 input + 256 output · aggregate throughput',
    oneGpuTokensPerSecond: 77.4, twoGpuTokensPerSecond: 136.9, fourGpuTokensPerSecond: 228.8,
    sourceName: 'E2E Networks V100 inference study', sourceUrl: e2eVllmStudy,
    notes: 'Aggregate server throughput rises 2.96× from one to four PCIe V100s under the fixed four-client test.',
  },
  {
    id: 'v100-scale-vllm-deepseek-32b', lane: 'multi-user-vllm', model: 'DeepSeek R1 Distill Qwen 32B', precision: 'FP16',
    workload: 'vLLM · four async clients · 128 input + 256 output · aggregate throughput',
    oneGpuTokensPerSecond: null, twoGpuTokensPerSecond: null, fourGpuTokensPerSecond: 110.0,
    sourceName: 'E2E Networks V100 inference study', sourceUrl: e2eVllmStudy,
    notes: 'Only the four-card configuration completed. The study reports 99% VRAM utilization and warns that production headroom is effectively absent.',
  },
];

export function preferredV100Benchmark(productId: string) {
  return v100Benchmarks.find((result) => result.productId === productId
    && (result.lane === 'fixed-control' || result.model === 'Llama 2 7B'));
}
