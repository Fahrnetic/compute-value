export type EnterpriseGeneration = 'DGX Spark' | 'RTX 30' | 'RTX 40' | 'RTX 50' | 'RTX PRO' | 'V100' | 'A100' | 'A800' | 'H100' | 'H200';
export type EnterpriseScale = 'baseboard' | 'node' | 'desktop-cluster' | 'superpod';

export interface TensorParallelResult {
  nodes: number;
  degree: number;
  model: string;
  quantization: string;
  runtime: string;
  inputTokens: number;
  outputTokens: number;
  batchSize: number;
  ttftMs: number;
  tpotMs: number;
  outputTokensPerSecond: number;
  speedup: number;
  scalingEfficiencyPercent: number;
  publishedDate: string;
  sourceUrl: string;
  note: string;
}

export interface ClusterBenchmark {
  model: string;
  suite: string;
  scenario: string;
  tokensPerSecond: number;
  sourceUrl: string;
  sourceId: string;
  comparable: boolean;
  note: string;
}

export interface LegacyClusterObservation {
  model: string;
  tokensPerSecond: number;
  metric: string;
  sourceUrl: string;
  note: string;
}

export interface FourGpuBenchmarkEvidence {
  model: string;
  precision: string;
  runtime: string;
  workload: string;
  tokensPerSecond: number;
  metric: string;
  sourceUrl: string;
  sourceLabel: string;
  note: string;
  secondaryTokensPerSecond?: number;
  secondaryMetric?: string;
}

export interface PcieClusterAudit {
  generation: 4 | 5;
  lanesPerGpu: 16;
  theoreticalOneWayGbSPerGpu: number;
  theoreticalBidirectionalGbSPerGpu: number;
  slotRequirement: string;
  nvlink: string;
  p2pStatus: string;
  verification: string;
  boardPowerWPerGpu: number;
  wholeSystemPowerEvidence: string;
  benchmark?: FourGpuBenchmarkEvidence;
}

export type RawComputeProfileKey =
  | 'gb10' | 'rtx3090' | 'rtx4090' | 'rtx5090' | 'rtx-pro-5000' | 'rtx-pro-6000-maxq'
  | 'v100-sxm' | 'a100-sxm' | 'a800-sxm' | 'h100-nvl' | 'h100-sxm' | 'h200-nvl' | 'h200-sxm';

export interface RawComputeProfile {
  hardware: string;
  denseFp16TensorTflopsPerGpu: number;
  fp32TflopsPerGpu?: number;
  basis: 'published' | 'derived from published sparse FP4 peak';
  sourceUrl: string;
  note: string;
}

export interface EnterpriseCluster {
  id: string;
  name: string;
  generation: EnterpriseGeneration;
  architecture: string;
  computeProfileKey: RawComputeProfileKey;
  scale: EnterpriseScale;
  formFactor: string;
  status: 'current' | 'regional / withdrawn' | 'used / legacy';
  description: string;
  nodeCount: number;
  gpuCount: number;
  gpuMemoryGb: number;
  totalGpuMemoryGb: number;
  memoryBandwidthTbSPerGpu: number;
  fabric: string;
  fabricBandwidthGbSPerGpu: number;
  systemPowerKw: number;
  powerScope: 'system maximum' | 'compute-node maximum' | 'GPU TDP only' | 'power-supply capacity';
  networking: string;
  procurement: string;
  bestFor: string;
  caveat: string;
  unlimitedRank: number;
  sourceLabel: string;
  sourceUrl: string;
  benchmark?: ClusterBenchmark;
  nodeControlTokensPerSecond?: number;
  legacyObservation?: LegacyClusterObservation;
  tensorParallel?: TensorParallelResult;
  pcieAudit?: PcieClusterAudit;
}

export interface ClusterRawComputeRow {
  cluster: EnterpriseCluster;
  profile: RawComputeProfile;
  aggregateDenseFp16TensorTflops: number;
  aggregateFp32Tflops?: number;
  aggregateLocalMemoryBandwidthGbS: number;
  idealQ4DecodeTokensPerSecond: number;
  idealFp16MathTokensPerSecond: number;
  fabricToLocalBandwidthPercent: number;
}

export interface HouseOutletAssessment {
  verdict: 'yes' | 'conditional' | 'no';
  label: string;
  service: string;
  detail: string;
}

export interface DgxSparkCapacityProof {
  nodes: number;
  model: string;
  parameters: string;
  quantization: string;
  runtime: string;
  inputTokens: number;
  outputTokens: number;
  batchSize: number;
  promptTokensPerSecond: number;
  generatedTokensPerSecond: number;
  parallelismDisclosure: string;
  publishedDate: string;
  sourceUrl: string;
}

export interface ClusterSystemCostEstimate {
  lowUsd: number;
  highUsd: number;
  confidence: 'market anchored' | 'planning range' | 'budgetary quote required';
  basis: string;
  sourceUrl: string;
}

const H100_MLPERF = 31_306.8;
const H200_MLPERF = 34_988.2;

// One raw, reproducible contract for every cluster. The Q4_0 file size is the published
// llama-2-70b.Q4_0.gguf weight payload. Dense transformer math is approximated as 2P FLOPs/token.
export const LLAMA2_70B_Q4_0_MODEL_SIZE_GB = 38.87;
export const LLAMA2_70B_DENSE_MATH_TFLOPS_PER_TOKEN = 0.14;

export const rawComputeProfiles: Record<RawComputeProfileKey, RawComputeProfile> = {
  gb10: {
    hardware: 'GB10 Grace Blackwell', denseFp16TensorTflopsPerGpu: 125,
    basis: 'derived from published sparse FP4 peak',
    sourceUrl: 'https://docs.nvidia.com/dgx/dgx-spark/hardware.html',
    note: 'NVIDIA publishes 1,000 sparse FP4 TOPS, not dense FP16. The 125-TFLOPS common-denominator value removes 2× structural sparsity and the 4× FP4-to-FP16 operation-rate advantage.',
  },
  rtx3090: {
    hardware: 'GeForce RTX 3090', denseFp16TensorTflopsPerGpu: 71.2, fp32TflopsPerGpu: 35.6, basis: 'published',
    sourceUrl: 'https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf',
    note: 'Peak FP16 Tensor TFLOPS with FP32 accumulation, without structural sparsity.',
  },
  rtx4090: {
    hardware: 'GeForce RTX 4090', denseFp16TensorTflopsPerGpu: 165.2, fp32TflopsPerGpu: 82.6, basis: 'published',
    sourceUrl: 'https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf',
    note: 'Peak FP16 Tensor TFLOPS with FP32 accumulation, without structural sparsity.',
  },
  rtx5090: {
    hardware: 'GeForce RTX 5090', denseFp16TensorTflopsPerGpu: 209.5, fp32TflopsPerGpu: 104.8, basis: 'published',
    sourceUrl: 'https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf',
    note: 'Peak FP16 Tensor TFLOPS with FP32 accumulation, without structural sparsity.',
  },
  'rtx-pro-5000': {
    hardware: 'RTX PRO 5000 Blackwell 48GB', denseFp16TensorTflopsPerGpu: 258, fp32TflopsPerGpu: 65, basis: 'derived from published sparse FP4 peak',
    sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-5000-blackwell/workstation-datasheet-blackwell-rtx-pro-5000-gtc25-spring-nvidia-3658700.pdf',
    note: 'The datasheet publishes 2,064 sparse FP4 AI TOPS. Dividing by eight removes 2× structural sparsity and the 4× FP4-to-FP16 operation-rate advantage.',
  },
  'rtx-pro-6000-maxq': {
    hardware: 'RTX PRO 6000 Blackwell Max-Q', denseFp16TensorTflopsPerGpu: 438.9, fp32TflopsPerGpu: 109.7, basis: 'published',
    sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf',
    note: 'Peak FP16 Tensor TFLOPS with FP32 accumulation, without structural sparsity, for the 300W Max-Q edition.',
  },
  'v100-sxm': {
    hardware: 'Tesla V100 32GB SXM2/SXM3', denseFp16TensorTflopsPerGpu: 125, fp32TflopsPerGpu: 15.7, basis: 'published',
    sourceUrl: 'https://images.nvidia.com/content/technologies/volta/pdf/volta-v100-datasheet-update-us-1165301-r5.pdf',
    note: 'Published SXM2 Tensor and FP32 peaks. DGX-2 uses the same V100 32GB compute profile on SXM3 modules.',
  },
  'a100-sxm': {
    hardware: 'A100 80GB SXM', denseFp16TensorTflopsPerGpu: 312, fp32TflopsPerGpu: 19.5, basis: 'published',
    sourceUrl: 'https://www.nvidia.com/en-us/data-center/a100/',
    note: 'Dense values; NVIDIA separately lists 624 TFLOPS with structural sparsity.',
  },
  'a800-sxm': {
    hardware: 'A800 80GB SXM', denseFp16TensorTflopsPerGpu: 312, fp32TflopsPerGpu: 19.5, basis: 'published',
    sourceUrl: 'https://lenovopress.lenovo.com/lp1813-thinksystem-nvidia-a800-pcie-gpu',
    note: 'A800 retains A100-class compute and HBM throughput; its reduced scale-up interconnect is modeled separately.',
  },
  'h100-nvl': {
    hardware: 'H100 NVL 94GB', denseFp16TensorTflopsPerGpu: 835.5, fp32TflopsPerGpu: 60, basis: 'published',
    sourceUrl: 'https://www.nvidia.com/en-us/data-center/h100/',
    note: 'Dense value is half of NVIDIA’s 1,671-TFLOPS sparse FP16 listing.',
  },
  'h100-sxm': {
    hardware: 'H100 80GB SXM', denseFp16TensorTflopsPerGpu: 989.5, fp32TflopsPerGpu: 67, basis: 'published',
    sourceUrl: 'https://www.nvidia.com/en-us/data-center/h100/',
    note: 'Dense value is half of NVIDIA’s 1,979-TFLOPS sparse FP16 listing.',
  },
  'h200-nvl': {
    hardware: 'H200 NVL 141GB', denseFp16TensorTflopsPerGpu: 835.5, fp32TflopsPerGpu: 60, basis: 'published',
    sourceUrl: 'https://www.nvidia.com/en-us/data-center/h200/',
    note: 'Dense value is half of NVIDIA’s 1,671-TFLOPS sparse FP16 listing.',
  },
  'h200-sxm': {
    hardware: 'H200 141GB SXM', denseFp16TensorTflopsPerGpu: 989.5, fp32TflopsPerGpu: 67, basis: 'published',
    sourceUrl: 'https://www.nvidia.com/en-us/data-center/h200/',
    note: 'Dense value is half of NVIDIA’s 1,979-TFLOPS sparse FP16 listing.',
  },
};

export const dgxSparkTensorParallelResults: TensorParallelResult[] = [
  {
    nodes: 1, degree: 1, model: 'Llama 3.3 70B Instruct', quantization: 'NVFP4', runtime: 'TensorRT-LLM',
    inputTokens: 32_000, outputTokens: 1_000, batchSize: 1, ttftMs: 33_415, tpotMs: 269,
    outputTokensPerSecond: 1000 / 269, speedup: 1, scalingEfficiencyPercent: 100, publishedDate: '2026-03-16',
    sourceUrl: 'https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/',
    note: 'Single-node baseline. Output tok/s is derived as 1,000 ÷ published TPOT in milliseconds.',
  },
  {
    nodes: 2, degree: 2, model: 'Llama 3.3 70B Instruct', quantization: 'NVFP4', runtime: 'TensorRT-LLM',
    inputTokens: 32_000, outputTokens: 1_000, batchSize: 1, ttftMs: 21_384, tpotMs: 133,
    outputTokensPerSecond: 1000 / 133, speedup: 269 / 133, scalingEfficiencyPercent: (269 / 133) / 2 * 100, publishedDate: '2026-03-16',
    sourceUrl: 'https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/',
    note: 'TP2 shards each transformer tensor across two nodes and synchronizes partial results through ConnectX-7 RoCE during every layer.',
  },
  {
    nodes: 4, degree: 4, model: 'Llama 3.3 70B Instruct', quantization: 'NVFP4', runtime: 'TensorRT-LLM',
    inputTokens: 32_000, outputTokens: 1_000, batchSize: 1, ttftMs: 15_552, tpotMs: 72,
    outputTokensPerSecond: 1000 / 72, speedup: 269 / 72, scalingEfficiencyPercent: (269 / 72) / 4 * 100, publishedDate: '2026-03-16',
    sourceUrl: 'https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/',
    note: 'TP4 uses a 200GbE RoCE switch. Decode scaling remains strong, but fine-grained layer synchronization prevents assuming perfect linear scaling for every model.',
  },
];

export const dgxSparkCapacityProof: DgxSparkCapacityProof = {
  nodes: 2,
  model: 'Qwen3 235B',
  parameters: '235B',
  quantization: 'NVFP4',
  runtime: 'TensorRT-LLM',
  inputTokens: 2_048,
  outputTokens: 128,
  batchSize: 1,
  promptTokensPerSecond: 23_477.03,
  generatedTokensPerSecond: 11.73,
  parallelismDisclosure: 'NVIDIA identifies a dual-Spark ConnectX-7 run but does not publish the TP/PP setting in this table.',
  publishedDate: '2025-10-24',
  sourceUrl: 'https://developer.nvidia.com/blog/how-nvidia-dgx-sparks-performance-enables-intensive-ai-tasks/',
};

export const dgxSparkCurrentAudit = {
  verifiedOn: '2026-08-12',
  documentationUpdatedOn: '2026-08-03',
  dgxOs: '7.5.0',
  driver: '580.159.03',
  cuda: '13.0.2',
  clusterAssistantMinNodes: 2,
  clusterAssistantMaxNodes: 4,
  clusterAssistantScope: 'network and SSH setup only; workloads are configured separately',
  supportedTopologySummary: '2 direct/switched · 3 ring/switched · 4 switched',
  ratedLinkGbps: 200,
  measuredRdmaLanesGbps: [92.57, 97.28],
  measuredDualNodeRdmaGbps: 189.85,
  measuredLinkEfficiencyPercent: 189.85 / 200 * 100,
  measuredRdmaGbS: 189.85 / 8,
  latestOfficialTpTableDate: '2026-03-16',
  latestOfficialTpTableRetestedOnCurrentStack: false,
  sourceUrl: 'https://docs.nvidia.com/dgx/dgx-spark/release-notes.html',
  fabricSourceUrl: 'https://github.com/NVIDIA/dgx-spark-playbooks/blob/main/nvidia/connect-two-sparks/assets/performance_benchmarking_guide.md',
} as const;

const h100Benchmark: ClusterBenchmark = {
  model: 'Llama 2 70B (99% accuracy)',
  suite: 'MLPerf Inference v5.0 Closed · TensorRT',
  scenario: 'Offline throughput',
  tokensPerSecond: H100_MLPERF,
  sourceId: '5.0-0057',
  sourceUrl: 'https://github.com/mlcommons/inference_results_v5.0/tree/main/closed/NVIDIA/results/DGX-H100_H100-SXM-80GBx8_TRT',
  comparable: true,
  note: 'NVIDIA submission; one 8-GPU DGX H100 node. This is the exact control used against the 8-GPU H200 result.',
};

const h200Benchmark: ClusterBenchmark = {
  model: 'Llama 2 70B (99% accuracy)',
  suite: 'MLPerf Inference v5.0 Closed · TensorRT',
  scenario: 'Offline throughput',
  tokensPerSecond: H200_MLPERF,
  sourceId: '5.0-0060',
  sourceUrl: 'https://github.com/mlcommons/inference_results_v5.0/tree/main/closed/NVIDIA/results/H200-SXM-141GBx8_TRT',
  comparable: true,
  note: 'NVIDIA submission; one 8-GPU H200 SXM node. Same model, suite, scenario, accuracy target, submitter, and runtime family as the H100 control.',
};

const h100NvlBenchmark: ClusterBenchmark = {
  model: 'Llama 2 70B (99% accuracy)',
  suite: 'MLPerf Inference v5.0 Closed · TensorRT',
  scenario: 'Offline throughput',
  tokensPerSecond: 3_879.95,
  sourceId: '5.0-0014',
  sourceUrl: 'https://github.com/mlcommons/inference_results_v5.0/tree/main/closed/Cisco/results/X215M8_H100NVLx2_TRT',
  comparable: true,
  note: 'Cisco submission for a two-GPU H100 NVL system. Universal workload, but not an equal-GPU-count comparison with DGX.',
};

export const enterpriseClusters: EnterpriseCluster[] = [
  {
    id: 'dgx-spark-2', name: 'DGX Spark cluster · 2 nodes / TP2', generation: 'DGX Spark', architecture: 'Grace Blackwell', computeProfileKey: 'gb10', scale: 'desktop-cluster', formFactor: '2 desktop nodes · direct QSFP connection', status: 'current',
    description: 'The smallest official Spark cluster and the balanced option: two GB10 systems use cross-node tensor parallelism for larger models and nearly double measured batch-one decode speed on the same 70B control.',
    nodeCount: 2, gpuCount: 2, gpuMemoryGb: 128, totalGpuMemoryGb: 256, memoryBandwidthTbSPerGpu: 0.273, fabric: 'ConnectX-7 RoCE · one direct 200GbE link', fabricBandwidthGbSPerGpu: 25,
    systemPowerKw: 0.48, powerScope: 'power-supply capacity', networking: 'One approved QSFP cable between nodes; 10GbE or Wi-Fi remains available for LAN access', procurement: 'Two complete DGX Spark systems plus one approved 200Gb/s-class QSFP cable', bestFor: 'Up to 400B inference, TP2 experiments, and large-model development on household power', caveat: '256GB is aggregate distributed unified memory, not a single coherent pool. Tensor shards and KV cache remain node-local; every transformer layer exchanges partial results over a 25GB/s raw link.', unlimitedRank: 26,
    sourceLabel: 'NVIDIA multi-node Spark scaling', sourceUrl: 'https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/', tensorParallel: dgxSparkTensorParallelResults[1],
  },
  {
    id: 'dgx-spark-3', name: 'DGX Spark cluster · 3-node ring', generation: 'DGX Spark', architecture: 'Grace Blackwell', computeProfileKey: 'gb10', scale: 'desktop-cluster', formFactor: '3 desktop nodes · direct ring topology', status: 'current',
    description: 'Three Sparks form a closed ring using both ConnectX-7 ports on every node. NVIDIA positions this topology for larger-model fine-tuning and small training jobs.',
    nodeCount: 3, gpuCount: 3, gpuMemoryGb: 128, totalGpuMemoryGb: 384, memoryBandwidthTbSPerGpu: 0.273, fabric: 'ConnectX-7 RoCE · 2× 200GbE links per node', fabricBandwidthGbSPerGpu: 50,
    systemPowerKw: 0.72, powerScope: 'power-supply capacity', networking: 'Three approved QSFP cables; each node connects directly to the other two', procurement: 'Three complete DGX Spark systems plus three approved QSFP cables', bestFor: 'Three-way distributed fine-tuning and training without purchasing a managed switch', caveat: 'The ring is officially validated, but NVIDIA did not publish a TP3 result in the matched Llama 3.3 70B table. It is therefore not interpolated between TP2 and TP4.', unlimitedRank: 25,
    sourceLabel: 'NVIDIA Sync supported Spark topologies', sourceUrl: 'https://docs.nvidia.com/sync/latest/cluster-assistant.html',
  },
  {
    id: 'dgx-spark-4', name: 'DGX Spark cluster · 4 nodes / TP4', generation: 'DGX Spark', architecture: 'Grace Blackwell', computeProfileKey: 'gb10', scale: 'desktop-cluster', formFactor: '4 desktop nodes · switched RoCE topology', status: 'current',
    description: 'The largest configuration supported by NVIDIA Sync: four GB10 nodes, 512GB aggregate unified memory, a 200GbE RoCE switch, and measured TP4 scaling.',
    nodeCount: 4, gpuCount: 4, gpuMemoryGb: 128, totalGpuMemoryGb: 512, memoryBandwidthTbSPerGpu: 0.273, fabric: 'ConnectX-7 RoCE · switched 200GbE per node', fabricBandwidthGbSPerGpu: 25,
    systemPowerKw: 0.96, powerScope: 'power-supply capacity', networking: 'Managed 200GbE-class QSFP switch plus one approved cable per node', procurement: 'Four complete DGX Spark systems, supported managed QSFP switch, and four approved cables', bestFor: 'TP4 inference, communication-intensive desktop AI, and officially described models up to 700B', caveat: '512GB is distributed capacity. At every transformer layer, TP4 collectives traverse a network link dramatically slower than H100/H200 NVLink, so model and runtime communication behavior remain decisive.', unlimitedRank: 24,
    sourceLabel: 'NVIDIA multi-node Spark scaling', sourceUrl: 'https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/', tensorParallel: dgxSparkTensorParallelResults[2],
  },
  {
    id: 'rtx3090-quad', name: '4× GeForce RTX 3090 · paired NVLink', generation: 'RTX 30', architecture: 'Ampere', computeProfileKey: 'rtx3090', scale: 'node', formFactor: 'Custom 4-GPU workstation/server · four full-length cards', status: 'used / legacy',
    description: 'A 96GB used-market cluster whose special advantage is two possible 3090 NVLink pairs. It is still not a four-way NVLink fabric: traffic between the two pairs crosses the host PCIe topology.',
    nodeCount: 1, gpuCount: 4, gpuMemoryGb: 24, totalGpuMemoryGb: 96, memoryBandwidthTbSPerGpu: 0.936, fabric: 'Two 2-GPU NVLink islands; PCIe 4.0 x16 cross-pair', fabricBandwidthGbSPerGpu: 31.5,
    systemPowerKw: 1.4, powerScope: 'GPU TDP only', networking: 'Single host; require four CPU-wired x16 physical slots and verify the negotiated width of every card', procurement: 'Four used 24GB RTX 3090 cards, matched 4-slot NVLink bridges where spacing permits, server chassis, and workstation/server platform', bestFor: 'Maximum low-cost GeForce VRAM, 70B-class inference, and workloads tolerant of uneven two-pair topology', caveat: 'Four cards provide 96GB aggregate VRAM, not one coherent allocation. NVIDIA specifies 56.25GB/s per direction for a two-card 3090 NVLink connection; a bridge cannot join all four cards, so the four-way bottleneck remains PCIe.', unlimitedRank: 20,
    sourceLabel: 'NVIDIA GA102 / 3090 architecture', sourceUrl: 'https://www.nvidia.com/content/PDF/nvidia-ampere-ga-102-gpu-architecture-whitepaper-v2.pdf',
    pcieAudit: {
      generation: 4, lanesPerGpu: 16, theoreticalOneWayGbSPerGpu: 31.5, theoreticalBidirectionalGbSPerGpu: 63,
      slotRequirement: '4× electrical x16 preferred; x8 halves the ceiling', nvlink: 'Optional only as two separate pairs · 56.25GB/s each direction inside a pair',
      p2pStatus: 'NVLink peer access is pair-local; PCIe peer paths across pairs are platform/driver dependent', verification: 'Run nvidia-smi topo -m, nvidia-smi topo -p2p p, and nvbandwidth before trusting TP4',
      boardPowerWPerGpu: 350, wholeSystemPowerEvidence: '1.40kW reference GPU total; no matched whole-system wall measurement published',
      benchmark: {
        model: 'Qwen QwQ-32B', precision: 'published quantization not stated', runtime: 'vLLM · TP4', workload: '4×3090 power-limited to 220W/card',
        tokensPerSecond: 39, metric: 'single-request output decode', sourceUrl: 'https://craftrigs.com/articles/multi-gpu-scaling-local-llm-rtx-3090/', sourceLabel: 'secondary report of owner benchmark',
        note: 'The same report records about 17.07 tok/s for Llama 3 70B Q4_K_M in llama.cpp layer-split mode. Framework and split strategy change the result dramatically.', secondaryTokensPerSecond: 353, secondaryMetric: 'batched QwQ throughput',
      },
    },
  },
  {
    id: 'rtx4090-quad', name: '4× GeForce RTX 4090 · PCIe cluster', generation: 'RTX 40', architecture: 'Ada Lovelace', computeProfileKey: 'rtx4090', scale: 'node', formFactor: 'Custom 4-GPU 4U workstation/server', status: 'current',
    description: 'A 96GB four-card Ada node with excellent local bandwidth and compute, but no NVLink. Large-model tensor parallelism is bounded by the host’s PCIe 4.0 topology and GeForce peer-access behavior.',
    nodeCount: 1, gpuCount: 4, gpuMemoryGb: 24, totalGpuMemoryGb: 96, memoryBandwidthTbSPerGpu: 1.008, fabric: 'PCIe 4.0 x16 per GPU · no NVLink', fabricBandwidthGbSPerGpu: 31.5,
    systemPowerKw: 1.8, powerScope: 'GPU TDP only', networking: 'Single host; EPYC or Threadripper Pro platform with four CPU-attached full-width slots strongly preferred', procurement: 'Four 24GB RTX 4090 cards, 4U chassis or custom liquid cooling, high-lane-count host, and engineered 200–240V power', bestFor: 'High-throughput inference when 96GB aggregate VRAM is enough and consumer-GPU operational tradeoffs are acceptable', caveat: 'NVIDIA lists no NVLink support. A published four-card system negotiated Gen4 x16 on every GPU, but its PCIe collectives still raised TTFT; do not assume x16 signaling alone guarantees direct CUDA P2P.', unlimitedRank: 19,
    sourceLabel: 'NVIDIA RTX 4090 specifications', sourceUrl: 'https://www.nvidia.com/en-gb/geforce/graphics-cards/40-series/rtx-4090/',
    pcieAudit: {
      generation: 4, lanesPerGpu: 16, theoreticalOneWayGbSPerGpu: 31.5, theoreticalBidirectionalGbSPerGpu: 63,
      slotRequirement: '4× electrical x16 preferred; avoid chipset-attached slots', nvlink: 'None',
      p2pStatus: 'Do not assume CUDA P2P on GeForce Ada; published NVIDIA forum probes report peer access “No” on dual 4090', verification: 'Check every GPU pair with nvidia-smi topo -p2p p and the CUDA simpleP2P/nvbandwidth tests',
      boardPowerWPerGpu: 450, wholeSystemPowerEvidence: '1.80kW reference GPU total; ≈2.1–2.2kW measured combined stress on an over-reference 4×4090 system',
      benchmark: {
        model: 'Llama 3.3 70B Instruct', precision: 'Q4_K_M GGUF', runtime: 'llama.cpp CUDA/cuBLAS', workload: 'single request · 512 max tokens · 110 generated',
        tokensPerSecond: 20.3, metric: 'single-stream generated output', sourceUrl: 'https://kentino.com/blogs/ai-corner/case-study-4x-rtx-4090-ai-workstation', sourceLabel: 'measured system case study',
        note: 'The same run measured 1,568 tok/s prompt processing. This is not comparable to batched serving or a different model/quantization.', secondaryTokensPerSecond: 1_568, secondaryMetric: 'prompt processing',
      },
    },
  },
  {
    id: 'rtx5090-quad', name: '4× GeForce RTX 5090 · PCIe 5 cluster', generation: 'RTX 50', architecture: 'Blackwell', computeProfileKey: 'rtx5090', scale: 'node', formFactor: 'Custom 4-GPU 4U server · dense active cooling', status: 'current',
    description: 'Four consumer Blackwell flagships provide 128GB aggregate GDDR7 and 7.168TB/s of summed local bandwidth. PCIe 5 doubles the host-link ceiling over 3090/4090, but the cards still have no NVLink.',
    nodeCount: 1, gpuCount: 4, gpuMemoryGb: 32, totalGpuMemoryGb: 128, memoryBandwidthTbSPerGpu: 1.792, fabric: 'PCIe 5.0 x16 per GPU · no NVLink', fabricBandwidthGbSPerGpu: 63,
    systemPowerKw: 2.3, powerScope: 'GPU TDP only', networking: 'Single host; four CPU-attached Gen5 x16 links require 64 lanes before storage and NIC allocation', procurement: 'Four 32GB RTX 5090 cards, high-lane-count dual-socket/Threadripper Pro platform, server airflow, and engineered rack power', bestFor: 'Maximum GeForce compute, FP4-capable inference, and parallel serving with models that fit within 32GB replicas or 128GB sharded', caveat: 'The official 575W figure produces 2.30kW of GPU board power before the host. NVIDIA lists no NVLink, and GeForce PCIe P2P support must be verified on the exact driver and motherboard rather than inferred from Gen5.', unlimitedRank: 17,
    sourceLabel: 'NVIDIA RTX 5090 specifications', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/',
    pcieAudit: {
      generation: 5, lanesPerGpu: 16, theoreticalOneWayGbSPerGpu: 63, theoreticalBidirectionalGbSPerGpu: 126,
      slotRequirement: '4× electrical Gen5 x16 preferred · 64 CPU lanes minimum for GPUs alone', nvlink: 'None',
      p2pStatus: 'Not guaranteed by the GeForce specification; results vary with driver, root complex, ACS/IOMMU, and switch topology', verification: 'Require nvidia-smi topo -m/-p2p plus nvbandwidth; “Gen5 x16” is not a P2P certification',
      boardPowerWPerGpu: 575, wholeSystemPowerEvidence: '2.30kW reference GPU total; no matched whole-system wall measurement found',
      benchmark: {
        model: 'Qwen3.5 35B-A3B', precision: 'FP8', runtime: 'KTransformers', workload: '4×5090 · dual EPYC 9355 · submitted leaderboard run',
        tokensPerSecond: 97.5, metric: 'decode throughput', sourceUrl: 'https://ktransformers.net/zh/benchmarks', sourceLabel: 'KTransformers benchmark leaderboard',
        note: 'This is a community-submitted model-specific result, not the Llama control. It should not be multiplied or compared directly with the other four-GPU observations.',
      },
    },
  },
  {
    id: 'rtx-pro-5000-blackwell-quad', name: '4× RTX PRO 5000 Blackwell · 48GB', generation: 'RTX PRO', architecture: 'Blackwell', computeProfileKey: 'rtx-pro-5000', scale: 'node', formFactor: '4-GPU professional workstation · dual-slot active cards', status: 'current',
    description: 'A 192GB ECC workstation cluster with the same 300W-per-card envelope as the 6000 Max-Q cluster, but less capacity and local bandwidth per GPU. NVIDIA specifies PCIe 5.0 x16 and no shared memory pool.',
    nodeCount: 1, gpuCount: 4, gpuMemoryGb: 48, totalGpuMemoryGb: 192, memoryBandwidthTbSPerGpu: 1.344, fabric: 'PCIe 5.0 x16 per GPU · PCIe-only scale-up', fabricBandwidthGbSPerGpu: 63,
    systemPowerKw: 1.2, powerScope: 'GPU TDP only', networking: 'Single professional workstation; four CPU-attached Gen5 x16 slots and validated peer topology', procurement: 'Four RTX PRO 5000 Blackwell 48GB cards in an OEM-qualified multi-GPU workstation or custom WRX90/server platform', bestFor: '192GB ECC capacity, FP4 inference, and professional multi-GPU workflows below RTX PRO 6000 pricing', caveat: 'No reproducible four-card LLM decode benchmark was found. Exxact published a two-card Llama 3.1 8B LoRA training result, but it is not extrapolated to four cards or relabeled as inference.', unlimitedRank: 14,
    sourceLabel: 'NVIDIA RTX PRO 5000 datasheet', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-5000-blackwell/workstation-datasheet-blackwell-rtx-pro-5000-gtc25-spring-nvidia-3658700.pdf',
    pcieAudit: {
      generation: 5, lanesPerGpu: 16, theoreticalOneWayGbSPerGpu: 63, theoreticalBidirectionalGbSPerGpu: 126,
      slotRequirement: '4× CPU-attached Gen5 x16; validate OEM slot and cooling qualification', nvlink: 'No four-GPU NVLink fabric specified; model as PCIe-only',
      p2pStatus: 'Professional driver/platform support is still topology dependent; validate every pair', verification: 'Use nvidia-smi topo -p2p p and nvbandwidth on the delivered workstation',
      boardPowerWPerGpu: 300, wholeSystemPowerEvidence: '1.20kW rated GPU total; no four-card whole-system measurement found',
    },
  },
  {
    id: 'rtx-pro-6000-blackwell-maxq-quad', name: '4× RTX PRO 6000 Blackwell Max-Q · 96GB', generation: 'RTX PRO', architecture: 'Blackwell', computeProfileKey: 'rtx-pro-6000-maxq', scale: 'node', formFactor: 'NVIDIA-supported dense 4-GPU workstation configuration', status: 'current',
    description: 'The purpose-built four-card Blackwell workstation option: 384GB aggregate ECC GDDR7, 7.168TB/s summed local bandwidth, and a 300W Max-Q board designed by NVIDIA to scale from one to four GPUs.',
    nodeCount: 1, gpuCount: 4, gpuMemoryGb: 96, totalGpuMemoryGb: 384, memoryBandwidthTbSPerGpu: 1.792, fabric: 'PCIe 5.0 x16 per GPU · PCIe-only TP4', fabricBandwidthGbSPerGpu: 63,
    systemPowerKw: 1.2, powerScope: 'GPU TDP only', networking: 'Single WRX90-class workstation; four Gen5 x16 GPU links plus lane budget for high-speed storage/NIC', procurement: 'OEM four-GPU RTX PRO workstation or four Max-Q cards in a validated high-lane-count platform', bestFor: '384GB ECC desktop inference, very large MoE models, long context, FP4, and professional supportability', caveat: 'Choose the 300W Max-Q edition for four-card density. Four 600W Workstation Edition cards would instead total 2.4kW of GPU power and are not the variant NVIDIA describes as optimized for up to four GPUs.', unlimitedRank: 11,
    sourceLabel: 'NVIDIA RTX PRO 6000 Max-Q', sourceUrl: 'https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000-max-q/',
    pcieAudit: {
      generation: 5, lanesPerGpu: 16, theoreticalOneWayGbSPerGpu: 63, theoreticalBidirectionalGbSPerGpu: 126,
      slotRequirement: '4× CPU-attached Gen5 x16 on a validated workstation platform', nvlink: 'No NVLink fabric; TP4 communicates over PCIe 5',
      p2pStatus: 'Demonstrated in a public WRX90 TP4 system, but measured topology still belongs to that platform', verification: 'Confirm all links at Gen5 x16 and run NCCL/nvbandwidth before production',
      boardPowerWPerGpu: 300, wholeSystemPowerEvidence: '1.20kW rated GPU total; 1.083kW mean / 1.196kW peak measured system on the cited 1M-context MiniMax run',
      benchmark: {
        model: 'MiniMax-M3 · 428B / 23B active', precision: 'MXFP4 experts + MXFP8 linears', runtime: 'SGLang · TP4', workload: '1,047,552 input · 1,024 output · concurrency 1',
        tokensPerSecond: 39.2, metric: 'single-stream decode at ~1.04M context', sourceUrl: 'https://github.com/ambientlight/rtx-pro-6000-bench', sourceLabel: 'reproducible owner benchmark repository',
        note: 'The same system reaches 1,045 tok/s at 2K input and concurrency 64. That aggregate serving result is a different workload from the 39.2 tok/s long-context lane.', secondaryTokensPerSecond: 1_045, secondaryMetric: '2K input · c64 aggregate',
      },
    },
  },
  {
    id: 'v100-sxm2-quad', name: '4× V100 32GB SXM2 NVLink baseboard', generation: 'V100', architecture: 'Volta', computeProfileKey: 'v100-sxm', scale: 'baseboard', formFactor: '4-module SXM2 carrier / custom server', status: 'used / legacy',
    description: 'The lowest-cost route to 128GB of physically distributed HBM2. Direct NVLink helps tensor-parallel inference, but the host, cooling, firmware, and power integration are a project.',
    nodeCount: 1, gpuCount: 4, gpuMemoryGb: 32, totalGpuMemoryGb: 128, memoryBandwidthTbSPerGpu: 0.9, fabric: 'NVLink 2.0 direct topology', fabricBandwidthGbSPerGpu: 300,
    systemPowerKw: 1.2, powerScope: 'GPU TDP only', networking: 'Host-dependent; add 100Gb/s-class InfiniBand for scale-out', procurement: 'Used SXM2 modules plus a matched carrier, host, heatsinks, and Fabric Manager support', bestFor: 'Cheap high-capacity experimentation and the exact four-V100 layout already researched', caveat: 'No universal Llama 2 70B control was found. Published local results use different models and software, so they cannot rank against H100/H200 MLPerf.', unlimitedRank: 23,
    sourceLabel: 'NVIDIA Tesla V100 datasheet', sourceUrl: 'https://images.nvidia.com/content/technologies/volta/pdf/volta-v100-datasheet-update-us-1165301-r5.pdf',
    legacyObservation: { model: 'Qwen3.5 122B AWQ · 4 concurrent requests', tokensPerSecond: 61.61, metric: 'aggregate output throughput', sourceUrl: 'https://www.reddit.com/r/LocalLLaMA/comments/1t3oc0t/do_cheap_32gb_v100s_still_make_sense_for_homelab/', note: 'Useful proof that the 4×32GB board works, but not a universal cross-generation control.' },
  },
  {
    id: 'dgx1-v100', name: 'NVIDIA DGX-1 · 8× V100 32GB', generation: 'V100', architecture: 'Volta', computeProfileKey: 'v100-sxm', scale: 'node', formFactor: '3U integrated system', status: 'used / legacy',
    description: 'A turnkey eight-GPU Volta node with the original hybrid-cube-mesh NVLink topology. It is operationally cleaner than assembling loose SXM modules, but now firmly a secondary-market system.',
    nodeCount: 1, gpuCount: 8, gpuMemoryGb: 32, totalGpuMemoryGb: 256, memoryBandwidthTbSPerGpu: 0.9, fabric: 'NVLink 2.0 hybrid cube mesh', fabricBandwidthGbSPerGpu: 300,
    systemPowerKw: 3.2, powerScope: 'system maximum', networking: '4× EDR InfiniBand / 100GbE options', procurement: 'Complete used DGX-1 V100 32GB system; verify the 32GB revision and enterprise entitlement', bestFor: 'A serviceable, complete V100 node with 256GB total HBM', caveat: 'Older CUDA support, low tensor-core capability, and no matched MLPerf Llama 2 70B result in the selected universal control.', unlimitedRank: 22,
    sourceLabel: 'NVIDIA DGX-1 V100 architecture', sourceUrl: 'https://images.nvidia.com/content/pdf/dgx1-v100-system-architecture-whitepaper.pdf',
  },
  {
    id: 'dgx2-v100', name: 'NVIDIA DGX-2 · 16× V100 32GB', generation: 'V100', architecture: 'Volta', computeProfileKey: 'v100-sxm', scale: 'node', formFactor: '10U integrated system', status: 'used / legacy',
    description: 'Two eight-GPU SXM3 baseboards joined by first-generation NVSwitch. All 16 V100s form one 512GB memory-capacity domain for model parallelism.',
    nodeCount: 1, gpuCount: 16, gpuMemoryGb: 32, totalGpuMemoryGb: 512, memoryBandwidthTbSPerGpu: 0.9, fabric: '12× NVSwitch · 2.4TB/s bisection', fabricBandwidthGbSPerGpu: 300,
    systemPowerKw: 10, powerScope: 'system maximum', networking: '8× 100Gb/s InfiniBand / 100GbE', procurement: 'Complete used DGX-2; demand service history, Fabric Manager validation, and power/cooling documentation', bestFor: 'Maximum V100 memory in one coherent NVSwitch node', caveat: 'Ten kilowatts for 512GB of old HBM is hard to justify when money is not the constraint.', unlimitedRank: 21,
    sourceLabel: 'NVIDIA DGX-2 datasheet', sourceUrl: 'https://images.nvidia.com/content/pdf/dgx-2-print-datasheet-738070-nvidia-a4-web.pdf',
  },
  {
    id: 'dgx-station-a100', name: 'NVIDIA DGX Station A100 · 4× 80GB', generation: 'A100', architecture: 'Ampere', computeProfileKey: 'a100-sxm', scale: 'node', formFactor: 'Desk-side liquid-cooled workstation', status: 'current',
    description: 'A quiet four-GPU NVSwitch appliance with 320GB HBM2e that can live outside a data hall. This is the smallest complete A100 system in the category.',
    nodeCount: 1, gpuCount: 4, gpuMemoryGb: 80, totalGpuMemoryGb: 320, memoryBandwidthTbSPerGpu: 2.039, fabric: 'NVSwitch · fully connected', fabricBandwidthGbSPerGpu: 600,
    systemPowerKw: 1.5, powerScope: 'system maximum', networking: 'Dual 10/25GbE; scale-out networking is not its strength', procurement: 'NVIDIA/OEM channel or used complete system; never treat it as a bare GPU purchase', bestFor: 'A large-memory office or lab appliance without rack infrastructure', caveat: 'The desk-side format and networking make it a workstation node, not the preferred building block for a giant cluster.', unlimitedRank: 16,
    sourceLabel: 'NVIDIA DGX Station A100 specifications', sourceUrl: 'https://docs.nvidia.com/dgx/dgx-station-a100-user-guide/hardware-specifications-station-a100.html',
  },
  {
    id: 'dgx-a100', name: 'NVIDIA DGX A100 · 8× 80GB', generation: 'A100', architecture: 'Ampere', computeProfileKey: 'a100-sxm', scale: 'node', formFactor: '6U integrated system', status: 'current',
    description: 'The canonical eight-GPU Ampere node: 640GB HBM2e, six NVSwitches, and a mature DGX software and support stack.',
    nodeCount: 1, gpuCount: 8, gpuMemoryGb: 80, totalGpuMemoryGb: 640, memoryBandwidthTbSPerGpu: 2.039, fabric: '6× NVSwitch · fully connected', fabricBandwidthGbSPerGpu: 600,
    systemPowerKw: 6.5, powerScope: 'system maximum', networking: 'Up to 10× ConnectX-6/7 200Gb/s links', procurement: 'NVIDIA DGX enterprise channel or qualified used system with support status verified', bestFor: 'Mature Ampere training and inference with a clean eight-GPU topology', caveat: 'No Llama 2 70B MLPerf v5.0 result matching the selected H100/H200 control was submitted for this node.', unlimitedRank: 13,
    sourceLabel: 'NVIDIA DGX A100 user guide', sourceUrl: 'https://docs.nvidia.com/dgx/dgxa100-user-guide/introduction-to-dgxa100.html',
  },
  {
    id: 'hgx-a100-16', name: 'HGX A100 · 16× 80GB reference node', generation: 'A100', architecture: 'Ampere', computeProfileKey: 'a100-sxm', scale: 'node', formFactor: 'Dual 8-GPU HGX baseboards / OEM system', status: 'current',
    description: 'The largest published HGX A100 node topology, combining two eight-GPU baseboards for 1.28TB of HBM2e.',
    nodeCount: 1, gpuCount: 16, gpuMemoryGb: 80, totalGpuMemoryGb: 1280, memoryBandwidthTbSPerGpu: 2.039, fabric: 'Two 8-GPU NVSwitch fabrics', fabricBandwidthGbSPerGpu: 600,
    systemPowerKw: 6.4, powerScope: 'GPU TDP only', networking: 'OEM-dependent; deploy multiple high-speed InfiniBand HCAs', procurement: 'Custom NVIDIA-Certified OEM platform; system power and CPU topology vary by vendor', bestFor: 'The most Ampere HBM capacity inside one server boundary', caveat: 'The two baseboards are not one flat 16-GPU NVSwitch island; cross-baseboard communication depends on the OEM topology.', unlimitedRank: 12,
    sourceLabel: 'NVIDIA HGX A100 datasheet', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/HGX/pdf/nvidia-hgx-a100-datasheet.pdf',
  },
  {
    id: 'hgx-a800-4', name: 'HGX A800 · 4× 80GB baseboard', generation: 'A800', architecture: 'Ampere', computeProfileKey: 'a800-sxm', scale: 'baseboard', formFactor: '4-GPU SXM OEM baseboard', status: 'regional / withdrawn',
    description: 'The China-market A100 derivative in its documented four-GPU HGX form. Compute and HBM are A100-class; NVLink is capped lower.',
    nodeCount: 1, gpuCount: 4, gpuMemoryGb: 80, totalGpuMemoryGb: 320, memoryBandwidthTbSPerGpu: 2.039, fabric: 'NVLink 3.0 / OEM HGX topology', fabricBandwidthGbSPerGpu: 400,
    systemPowerKw: 2, powerScope: 'GPU TDP only', networking: 'OEM-dependent', procurement: 'Withdrawn regional product; buy only as a complete documented OEM system with legal/export review', bestFor: 'Existing regional fleets that specifically require A800 compatibility', caveat: 'If unrestricted A100/H100/H200 procurement is available, A800 has no unlimited-budget advantage and a slower NVLink ceiling.', unlimitedRank: 18,
    sourceLabel: 'Lenovo HGX A800 product guide', sourceUrl: 'https://lenovopress.lenovo.com/lp1813-thinksystem-nvidia-a800-pcie-gpu',
  },
  {
    id: 'hgx-a800-8', name: 'HGX A800 · 8× 80GB NVSwitch node', generation: 'A800', architecture: 'Ampere', computeProfileKey: 'a800-sxm', scale: 'node', formFactor: '8-GPU SXM OEM system', status: 'regional / withdrawn',
    description: 'An eight-GPU A800 NVSwitch topology with 640GB HBM2e. It exists as an OEM/server platform rather than a standardized DGX A800 product.',
    nodeCount: 1, gpuCount: 8, gpuMemoryGb: 80, totalGpuMemoryGb: 640, memoryBandwidthTbSPerGpu: 2.039, fabric: '2nd-gen NVSwitch', fabricBandwidthGbSPerGpu: 400,
    systemPowerKw: 4, powerScope: 'GPU TDP only', networking: 'OEM-dependent; typically InfiniBand scale-out', procurement: 'Complete qualified OEM system only; there is no standard NVIDIA DGX A800', bestFor: 'Maintaining or expanding an existing A800 software/hardware estate', caveat: 'Withdrawn/regional availability, reduced NVLink bandwidth, and no matching universal Llama 2 control make it a poor greenfield choice.', unlimitedRank: 15,
    sourceLabel: 'NVIDIA NVSwitch platform support', sourceUrl: 'https://docs.nvidia.com/ai-enterprise/release-8/latest/infra-software/vgpu/features/nvswitch.html',
  },
  {
    id: 'h100-nvl-2', name: 'H100 NVL · 2× 94GB partner node', generation: 'H100', architecture: 'Hopper', computeProfileKey: 'h100-nvl', scale: 'node', formFactor: '2-GPU PCIe NVLink server', status: 'current',
    description: 'A compact 188GB Hopper inference node built around a paired H100 NVL set. It is the smallest system here with a published result under the universal control.',
    nodeCount: 1, gpuCount: 2, gpuMemoryGb: 94, totalGpuMemoryGb: 188, memoryBandwidthTbSPerGpu: 3.9, fabric: 'Two-GPU NVLink bridge', fabricBandwidthGbSPerGpu: 600,
    systemPowerKw: 0.8, powerScope: 'GPU TDP only', networking: 'Partner-system dependent', procurement: 'NVIDIA-Certified partner server; complete system quote', bestFor: 'Dense LLM inference where 188GB is enough and SXM infrastructure is unnecessary', caveat: 'Its MLPerf result is universal but the two-GPU topology is not apples-to-apples with the eight-GPU DGX controls.', unlimitedRank: 10,
    sourceLabel: 'NVIDIA H100 specifications', sourceUrl: 'https://www.nvidia.com/en-us/data-center/h100/', benchmark: h100NvlBenchmark,
  },
  {
    id: 'dgx-h100', name: 'NVIDIA DGX H100 · 8× 80GB', generation: 'H100', architecture: 'Hopper', computeProfileKey: 'h100-sxm', scale: 'node', formFactor: '8U integrated system', status: 'current',
    description: 'The canonical Hopper node and one half of the clean universal benchmark comparison. Four NVSwitches make all eight GPUs one fast scale-up domain.',
    nodeCount: 1, gpuCount: 8, gpuMemoryGb: 80, totalGpuMemoryGb: 640, memoryBandwidthTbSPerGpu: 3.35, fabric: '4× 4th-gen NVSwitch', fabricBandwidthGbSPerGpu: 900,
    systemPowerKw: 10.2, powerScope: 'system maximum', networking: '8× ConnectX-7 400Gb/s InfiniBand compute links', procurement: 'Direct NVIDIA DGX engagement or certified partner', bestFor: 'A proven, supportable eight-GPU Hopper building block', caveat: 'H200 offers substantially more memory and higher memory bandwidth in the same DGX envelope.', unlimitedRank: 8,
    sourceLabel: 'NVIDIA DGX H100/H200 guide', sourceUrl: 'https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html', benchmark: h100Benchmark,
  },
  {
    id: 'superpod-h100-1su', name: 'DGX H100 SuperPOD · 1 scalable unit', generation: 'H100', architecture: 'Hopper', computeProfileKey: 'h100-sxm', scale: 'superpod', formFactor: 'Up to 32 compute nodes plus fabric/management', status: 'current',
    description: 'The first complete SuperPOD building block: up to 32 DGX H100 systems with the associated rail-optimized InfiniBand leaf connectivity.',
    nodeCount: 32, gpuCount: 256, gpuMemoryGb: 80, totalGpuMemoryGb: 20480, memoryBandwidthTbSPerGpu: 3.35, fabric: 'Rail-optimized NDR400 InfiniBand', fabricBandwidthGbSPerGpu: 400,
    systemPowerKw: 326.4, powerScope: 'compute-node maximum', networking: 'Eight 400Gb/s compute-fabric links per DGX; leaf-spine fabric', procurement: 'NVIDIA DGX SuperPOD design and deployment engagement', bestFor: 'A serious production AI factory with a supported path to four scalable units', caveat: '326.4kW covers 32 compute nodes only. Network, storage, management, cooling, and facility headroom are additional. A full multi-SU design reserves capacity for fabric management.', unlimitedRank: 6,
    sourceLabel: 'NVIDIA H100 SuperPOD planning guide', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/planning.html', nodeControlTokensPerSecond: H100_MLPERF,
  },
  {
    id: 'superpod-h100-4su', name: 'DGX H100 SuperPOD · 4 scalable units', generation: 'H100', architecture: 'Hopper', computeProfileKey: 'h100-sxm', scale: 'superpod', formFactor: '127 compute nodes plus fabric/management', status: 'current',
    description: 'The full published H100 SuperPOD design: 1,016 Hopper GPUs across 127 DGX systems and four rail-aligned scalable units.',
    nodeCount: 127, gpuCount: 1016, gpuMemoryGb: 80, totalGpuMemoryGb: 81280, memoryBandwidthTbSPerGpu: 3.35, fabric: 'Four-SU NDR400 InfiniBand leaf-spine', fabricBandwidthGbSPerGpu: 400,
    systemPowerKw: 1295.4, powerScope: 'compute-node maximum', networking: 'Full rail-optimized compute, storage, in-band, and out-of-band fabrics', procurement: 'NVIDIA DGX SuperPOD architecture, facility design, deployment, and support engagement', bestFor: 'Maximum published H100 scale when the facility already exists', caveat: '1.295MW is compute-node power alone. NVIDIA documents additional switches, storage, management racks, cooling, and detailed facility planning.', unlimitedRank: 5,
    sourceLabel: 'NVIDIA H100 SuperPOD planning guide', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/planning.html', nodeControlTokensPerSecond: H100_MLPERF,
  },
  {
    id: 'h200-nvl-4', name: 'H200 NVL · 4× 141GB partner node', generation: 'H200', architecture: 'Hopper', computeProfileKey: 'h200-nvl', scale: 'node', formFactor: '4-GPU PCIe NVLink server', status: 'current',
    description: 'A 564GB HBM3e inference node using the four-way H200 NVL topology. It sits between a two-card appliance and the eight-SXM DGX design.',
    nodeCount: 1, gpuCount: 4, gpuMemoryGb: 141, totalGpuMemoryGb: 564, memoryBandwidthTbSPerGpu: 4.8, fabric: 'Four-GPU NVLink', fabricBandwidthGbSPerGpu: 900,
    systemPowerKw: 2.4, powerScope: 'GPU TDP only', networking: 'Partner-system dependent', procurement: 'NVIDIA-Certified partner system; quote-only', bestFor: 'High-capacity inference without committing to an eight-GPU DGX node', caveat: 'The four-GPU MLPerf result in this research uses H200 SXM, not H200 NVL, so it is intentionally not attached to this card.', unlimitedRank: 9,
    sourceLabel: 'NVIDIA H200 specifications', sourceUrl: 'https://www.nvidia.com/en-us/data-center/h200/',
  },
  {
    id: 'dgx-h200', name: 'NVIDIA DGX H200 · 8× 141GB', generation: 'H200', architecture: 'Hopper', computeProfileKey: 'h200-sxm', scale: 'node', formFactor: '8U integrated system', status: 'current',
    description: 'The best single-node choice in this set: 1.128TB HBM3e, 38.4TB/s of aggregate local HBM bandwidth, and the fastest exact universal benchmark result.',
    nodeCount: 1, gpuCount: 8, gpuMemoryGb: 141, totalGpuMemoryGb: 1128, memoryBandwidthTbSPerGpu: 4.8, fabric: '4× 4th-gen NVSwitch', fabricBandwidthGbSPerGpu: 900,
    systemPowerKw: 10.2, powerScope: 'system maximum', networking: '8× ConnectX-7 400Gb/s InfiniBand compute links', procurement: 'Direct NVIDIA DGX engagement or certified partner', bestFor: 'The strongest measured eight-GPU LLM inference node in the requested generations', caveat: 'The 34,988.2 tok/s result is MLPerf Offline aggregate throughput, not an interactive batch-one decode rate.', unlimitedRank: 7,
    sourceLabel: 'NVIDIA DGX H100/H200 guide', sourceUrl: 'https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html', benchmark: h200Benchmark,
  },
  {
    id: 'superpod-h200-1su', name: 'DGX H200 SuperPOD · 1 scalable unit', generation: 'H200', architecture: 'Hopper', computeProfileKey: 'h200-sxm', scale: 'superpod', formFactor: '31 compute nodes / 248 GPUs', status: 'current',
    description: 'The entry H200 SuperPOD topology with almost 35TB of HBM3e and the complete four-fabric reference architecture.',
    nodeCount: 31, gpuCount: 248, gpuMemoryGb: 141, totalGpuMemoryGb: 34968, memoryBandwidthTbSPerGpu: 4.8, fabric: 'Rail-optimized NDR400 InfiniBand', fabricBandwidthGbSPerGpu: 400,
    systemPowerKw: 316.2, powerScope: 'compute-node maximum', networking: '8 leaf + 4 spine InfiniBand switches in the published compute fabric', procurement: 'NVIDIA DGX SuperPOD design and deployment engagement', bestFor: 'The best starting point for a no-compromise H200 AI factory', caveat: 'Node MLPerf is shown only as a control. Full-cluster application throughput depends on parallelism, networking, storage, batching, and model implementation.', unlimitedRank: 4,
    sourceLabel: 'NVIDIA H200 SuperPOD fabric architecture', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-h200/latest/network-fabrics.html', nodeControlTokensPerSecond: H200_MLPERF,
  },
  {
    id: 'superpod-h200-2su', name: 'DGX H200 SuperPOD · 2 scalable units', generation: 'H200', architecture: 'Hopper', computeProfileKey: 'h200-sxm', scale: 'superpod', formFactor: '63 compute nodes / 504 GPUs', status: 'current',
    description: 'The published two-SU fabric point: 63 DGX H200 nodes, 504 GPUs, and more than 71TB of HBM3e.',
    nodeCount: 63, gpuCount: 504, gpuMemoryGb: 141, totalGpuMemoryGb: 71064, memoryBandwidthTbSPerGpu: 4.8, fabric: 'Two-SU NDR400 InfiniBand leaf-spine', fabricBandwidthGbSPerGpu: 400,
    systemPowerKw: 642.6, powerScope: 'compute-node maximum', networking: '16 leaf + 8 spine InfiniBand switches in the published compute fabric', procurement: 'NVIDIA DGX SuperPOD design and deployment engagement', bestFor: 'Mid-scale H200 training and inference with a clean path to 1,016 GPUs', caveat: 'Power excludes networking, storage, management, and cooling. Aggregate HBM bandwidth is a sum of local devices, not a shared-memory bus.', unlimitedRank: 3,
    sourceLabel: 'NVIDIA H200 SuperPOD fabric architecture', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-h200/latest/network-fabrics.html', nodeControlTokensPerSecond: H200_MLPERF,
  },
  {
    id: 'superpod-h200-3su', name: 'DGX H200 SuperPOD · 3 scalable units', generation: 'H200', architecture: 'Hopper', computeProfileKey: 'h200-sxm', scale: 'superpod', formFactor: '95 compute nodes / 760 GPUs', status: 'current',
    description: 'The published three-SU step: 95 DGX H200 systems and 107.16TB of HBM3e before committing to the full four-SU topology.',
    nodeCount: 95, gpuCount: 760, gpuMemoryGb: 141, totalGpuMemoryGb: 107160, memoryBandwidthTbSPerGpu: 4.8, fabric: 'Three-SU NDR400 InfiniBand leaf-spine', fabricBandwidthGbSPerGpu: 400,
    systemPowerKw: 969, powerScope: 'compute-node maximum', networking: '24 leaf + 16 spine InfiniBand switches in the published compute fabric', procurement: 'NVIDIA DGX SuperPOD design and deployment engagement', bestFor: 'Near-maximum H200 capacity with the exact published rail architecture', caveat: 'Facility delivery, rack layout, cooling, storage bandwidth, and software operations are now first-class parts of the purchase.', unlimitedRank: 2,
    sourceLabel: 'NVIDIA H200 SuperPOD fabric architecture', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-h200/latest/network-fabrics.html', nodeControlTokensPerSecond: H200_MLPERF,
  },
  {
    id: 'superpod-h200-4su', name: 'DGX H200 SuperPOD · 4 scalable units', generation: 'H200', architecture: 'Hopper', computeProfileKey: 'h200-sxm', scale: 'superpod', formFactor: '127 compute nodes / 1,016 GPUs', status: 'current',
    description: 'Budget disabled. The full published H200 reference design combines 1,016 GPUs, 143.256TB HBM3e, and 4.8768PB/s of summed local HBM bandwidth.',
    nodeCount: 127, gpuCount: 1016, gpuMemoryGb: 141, totalGpuMemoryGb: 143256, memoryBandwidthTbSPerGpu: 4.8, fabric: 'Four-SU NDR400 InfiniBand leaf-spine', fabricBandwidthGbSPerGpu: 400,
    systemPowerKw: 1295.4, powerScope: 'compute-node maximum', networking: '32 leaf + 16 spine switches; 1,020 compute/UFM and 1,024 spine-leaf cables', procurement: 'Direct NVIDIA DGX SuperPOD architecture, deployment, and enterprise-support engagement', bestFor: 'The maximum documented H200 cluster in this comparison', caveat: 'This is data-center infrastructure, not a server order. Compute-node power alone is 1.295MW; complete facility load is higher. No full-pod Llama 2 token result is claimed.', unlimitedRank: 1,
    sourceLabel: 'NVIDIA H200 SuperPOD fabric architecture', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-h200/latest/network-fabrics.html', nodeControlTokensPerSecond: H200_MLPERF,
  },
];

const sparkPriceSource = 'https://forums.developer.nvidia.com/t/2-23-2026-price-change-announcement/361713';
const usedGpuPriceSource = 'https://www.ebay.com/sch/i.html?_nkw=NVIDIA+GPU+used&LH_ItemCondition=3000';
const usedA100SystemSource = 'https://www.siliconvaluebook.com/blog/gpu-server-buying-guide-a100-h100';
const h200SystemCostSource = 'https://slyd.com/resources/server-comparison';

// Acquisition planning, not checkout prices. These ranges include a usable host and
// required local fabric for node/desktop configurations. SuperPOD ranges are derived
// from complete-node planning prices plus a fabric/deployment allowance, but exclude
// the building, utility upgrades, cooling plant, tax, financing, and ongoing support.
export const clusterSystemCostById = new Map<string, ClusterSystemCostEstimate>([
  ['dgx-spark-2', { lowUsd: 9_600, highUsd: 10_500, confidence: 'market anchored', basis: 'Two current $4,699 complete systems plus one approved direct cable.', sourceUrl: sparkPriceSource }],
  ['dgx-spark-3', { lowUsd: 14_500, highUsd: 16_500, confidence: 'planning range', basis: 'Three current complete systems plus three approved cables.', sourceUrl: sparkPriceSource }],
  ['dgx-spark-4', { lowUsd: 23_000, highUsd: 35_000, confidence: 'planning range', basis: 'Four complete systems, four cables, and a managed 200GbE RoCE switch.', sourceUrl: sparkPriceSource }],
  ['rtx3090-quad', { lowUsd: 9_000, highUsd: 13_000, confidence: 'market anchored', basis: 'Four verified-seller cards plus a high-lane-count host, cooling, bridges, and power.', sourceUrl: usedGpuPriceSource }],
  ['rtx4090-quad', { lowUsd: 20_000, highUsd: 30_000, confidence: 'planning range', basis: 'Four scarce 4090 cards plus a four-slot EPYC/Threadripper Pro host and engineered cooling.', sourceUrl: usedGpuPriceSource }],
  ['rtx5090-quad', { lowUsd: 23_000, highUsd: 30_000, confidence: 'market anchored', basis: 'Uses the owner-supplied $4,300–$5,300/card range plus a Gen5 four-GPU host.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/' }],
  ['rtx-pro-5000-blackwell-quad', { lowUsd: 25_000, highUsd: 34_000, confidence: 'planning range', basis: 'Four current professional cards plus a validated WRX90/server host.', sourceUrl: 'https://marketplace.nvidia.com/en-us/enterprise/laptops-workstations/' }],
  ['rtx-pro-6000-blackwell-maxq-quad', { lowUsd: 50_000, highUsd: 62_000, confidence: 'market anchored', basis: 'Four current Max-Q boards plus a validated dense workstation; OEM volume quotes vary.', sourceUrl: 'https://marketplace.nvidia.com/en-us/enterprise/laptops-workstations/' }],
  ['v100-sxm2-quad', { lowUsd: 7_000, highUsd: 14_000, confidence: 'planning range', basis: 'Used modules/carrier plus a compatible host, heatsinks, firmware integration, and power.', sourceUrl: usedGpuPriceSource }],
  ['dgx1-v100', { lowUsd: 12_000, highUsd: 25_000, confidence: 'planning range', basis: 'Complete used 32GB DGX-1 with service history and working NVLink fabric.', sourceUrl: usedGpuPriceSource }],
  ['dgx2-v100', { lowUsd: 25_000, highUsd: 60_000, confidence: 'planning range', basis: 'Complete used DGX-2; condition, freight, support, and 10kW power readiness dominate.', sourceUrl: usedGpuPriceSource }],
  ['dgx-station-a100', { lowUsd: 80_000, highUsd: 149_000, confidence: 'planning range', basis: 'Used-channel lower bound through the published $149,000 original complete-system price.', sourceUrl: 'https://www.tomshardware.com/news/nvidia-dgx-station-320g' }],
  ['dgx-a100', { lowUsd: 60_000, highUsd: 100_000, confidence: 'market anchored', basis: '2026 used-market complete DGX A100 valuation range.', sourceUrl: usedA100SystemSource }],
  ['hgx-a100-16', { lowUsd: 140_000, highUsd: 250_000, confidence: 'budgetary quote required', basis: 'Two eight-GPU HGX domains plus OEM CPUs, memory, networking, storage, and support.', sourceUrl: usedA100SystemSource }],
  ['hgx-a800-4', { lowUsd: 45_000, highUsd: 90_000, confidence: 'budgetary quote required', basis: 'Withdrawn regional four-GPU OEM platform; legal/export review and condition drive price.', sourceUrl: 'https://lenovopress.lenovo.com/lp1813-thinksystem-nvidia-a800-pcie-gpu' }],
  ['hgx-a800-8', { lowUsd: 90_000, highUsd: 170_000, confidence: 'budgetary quote required', basis: 'Withdrawn regional eight-GPU NVSwitch OEM server.', sourceUrl: 'https://docs.nvidia.com/ai-enterprise/release-8/latest/infra-software/vgpu/features/nvswitch.html' }],
  ['h100-nvl-2', { lowUsd: 65_000, highUsd: 90_000, confidence: 'market anchored', basis: 'Two H100 NVL accelerators plus a certified dual-GPU server and support.', sourceUrl: 'https://www.nvidia.com/en-us/data-center/h100/' }],
  ['dgx-h100', { lowUsd: 300_000, highUsd: 400_000, confidence: 'budgetary quote required', basis: 'Complete eight-GPU DGX H100 planning range with enterprise support.', sourceUrl: 'https://nvidianews.nvidia.com/news/nvidia-announces-dgx-h100-systems-worlds-most-advanced-enterprise-ai-infrastructure' }],
  ['superpod-h100-1su', { lowUsd: 12_000_000, highUsd: 17_000_000, confidence: 'budgetary quote required', basis: '32 DGX H100 nodes plus compute fabric, management, deployment, and spares; facility excluded.', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/planning.html' }],
  ['superpod-h100-4su', { lowUsd: 48_000_000, highUsd: 67_000_000, confidence: 'budgetary quote required', basis: '127 DGX H100 nodes plus four-SU fabric, management, deployment, and spares; facility excluded.', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/planning.html' }],
  ['h200-nvl-4', { lowUsd: 150_000, highUsd: 180_000, confidence: 'market anchored', basis: 'Four verified-market H200 NVL cards around $34,000–$35,000 plus a qualified host.', sourceUrl: usedGpuPriceSource }],
  ['dgx-h200', { lowUsd: 400_000, highUsd: 500_000, confidence: 'market anchored', basis: '2026 complete eight-GPU DGX H200 market planning range.', sourceUrl: h200SystemCostSource }],
  ['superpod-h200-1su', { lowUsd: 15_000_000, highUsd: 20_000_000, confidence: 'budgetary quote required', basis: '31 DGX H200 nodes plus NDR fabric, management, deployment, and spares; facility excluded.', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-h200/latest/network-fabrics.html' }],
  ['superpod-h200-2su', { lowUsd: 30_000_000, highUsd: 41_000_000, confidence: 'budgetary quote required', basis: '63 DGX H200 nodes plus two-SU infrastructure; facility excluded.', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-h200/latest/network-fabrics.html' }],
  ['superpod-h200-3su', { lowUsd: 45_000_000, highUsd: 62_000_000, confidence: 'budgetary quote required', basis: '95 DGX H200 nodes plus three-SU infrastructure; facility excluded.', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-h200/latest/network-fabrics.html' }],
  ['superpod-h200-4su', { lowUsd: 60_000_000, highUsd: 83_000_000, confidence: 'budgetary quote required', basis: '127 DGX H200 nodes plus four-SU infrastructure; building, cooling plant, and utility work excluded.', sourceUrl: 'https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-h200/latest/network-fabrics.html' }],
]);

export const enterpriseGenerations: Array<'all' | EnterpriseGeneration> = [
  'all', 'DGX Spark', 'RTX 30', 'RTX 40', 'RTX 50', 'RTX PRO', 'V100', 'A100', 'A800', 'H100', 'H200',
];

export const clusterRawComputeRows: ClusterRawComputeRow[] = enterpriseClusters.map((cluster) => {
  const profile = rawComputeProfiles[cluster.computeProfileKey];
  const aggregateDenseFp16TensorTflops = profile.denseFp16TensorTflopsPerGpu * cluster.gpuCount;
  const aggregateLocalMemoryBandwidthGbS = cluster.memoryBandwidthTbSPerGpu * 1_000 * cluster.gpuCount;
  return {
    cluster,
    profile,
    aggregateDenseFp16TensorTflops,
    aggregateFp32Tflops: profile.fp32TflopsPerGpu === undefined
      ? undefined
      : profile.fp32TflopsPerGpu * cluster.gpuCount,
    aggregateLocalMemoryBandwidthGbS,
    idealQ4DecodeTokensPerSecond: aggregateLocalMemoryBandwidthGbS / LLAMA2_70B_Q4_0_MODEL_SIZE_GB,
    idealFp16MathTokensPerSecond: aggregateDenseFp16TensorTflops / LLAMA2_70B_DENSE_MATH_TFLOPS_PER_TOKEN,
    fabricToLocalBandwidthPercent: cluster.fabricBandwidthGbSPerGpu / (cluster.memoryBandwidthTbSPerGpu * 1_000) * 100,
  };
});

export const clusterRawComputeById = new Map(clusterRawComputeRows.map((row) => [row.cluster.id, row]));

export const fourGpuPcieClusters = enterpriseClusters.filter((cluster) => cluster.pcieAudit !== undefined);

export const exactEightGpuControls = enterpriseClusters.filter((cluster) =>
  cluster.gpuCount === 8 && cluster.benchmark?.comparable && cluster.benchmark.sourceId !== '5.0-0014',
);

export const h200SuperpodLadder = enterpriseClusters.filter((cluster) =>
  cluster.generation === 'H200' && cluster.scale === 'superpod',
);

export const US_HOUSE_OUTLET_CONTINUOUS_W = 1_440;

export function assessHouseOutlet(cluster: EnterpriseCluster): HouseOutletAssessment {
  if (cluster.generation === 'DGX Spark') {
    const supplyWatts = cluster.systemPowerKw * 1_000;
    return {
      verdict: 'yes',
      label: 'Yes — dedicated circuit',
      service: `${cluster.nodeCount}× 240W supplied adapters · ${supplyWatts.toLocaleString()}W total capacity`,
      detail: `All ${cluster.nodeCount} supplied power adapters fit below the 1,440W continuous planning ceiling together. Provide ${cluster.nodeCount} grounded receptacles on one verified dedicated circuit; do not daisy-chain strips or use household extension cords.`,
    };
  }

  if (cluster.id === 'dgx-station-a100') {
    return {
      verdict: 'yes',
      label: 'Yes — dedicated circuit',
      service: '115–120V / 12A input',
      detail: 'NVIDIA explicitly qualifies this system for 115–120VAC at 12A. Use its supplied grounded cable, no household extension cord, and no other load on the branch circuit.',
    };
  }

  if (cluster.id === 'h100-nvl-2') {
    return {
      verdict: 'conditional',
      label: 'Not confirmed',
      service: 'Partner system must be ≤1.44kW and accept 120V',
      detail: 'The 0.8kW figure is GPU TDP only, not wall power. Require a manufacturer nameplate and input specification for the complete server before treating it as household-outlet capable.',
    };
  }

  if (cluster.powerScope === 'GPU TDP only') {
    const gpuWatts = cluster.systemPowerKw * 1_000;
    const remaining = Math.max(0, US_HOUSE_OUTLET_CONTINUOUS_W - gpuWatts);
    return {
      verdict: 'no',
      label: 'No at rated load',
      service: 'Dedicated 200–240V service / qualified PDU',
      detail: gpuWatts >= US_HOUSE_OUTLET_CONTINUOUS_W
        ? `GPU TDP alone is ${gpuWatts.toLocaleString()}W, already at or above the 1,440W household continuous-load ceiling before CPUs, memory, fans, and conversion losses.`
        : `GPU TDP leaves only ${remaining.toLocaleString()}W below the 1,440W ceiling for the host, fans, and conversion losses. That is not enough evidence for a safe full-load household deployment.`,
    };
  }

  return {
    verdict: 'no',
    label: 'No — facility power',
    service: cluster.scale === 'superpod' ? 'Engineered data-center electrical plant' : 'Dedicated 200–240V rack circuits / qualified PDU',
    detail: `Published ${cluster.powerScope} is ${cluster.systemPowerKw.toLocaleString(undefined, { maximumFractionDigits: 1 })}kW, which exceeds a single U.S. 120V/15A household circuit's 1.44kW continuous-load ceiling.`,
  };
}
