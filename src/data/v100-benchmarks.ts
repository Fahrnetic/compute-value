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
