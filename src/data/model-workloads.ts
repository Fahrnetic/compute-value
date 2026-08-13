export type ModelWorkloadMeasurement = {
  label: string;
  rtxPro6000TokensPerSecond: number;
  h200NvlTokensPerSecond: number;
  qualifier: string;
};

export type ModelWorkloadComparison = {
  id: string;
  model: string;
  modelKind: string;
  benchmark: string;
  runtime: string;
  rtxHardware: string;
  h200Hardware: string;
  measurements: ModelWorkloadMeasurement[];
  latency?: {
    label: string;
    rtxPro6000Ms: number;
    h200NvlMs: number;
  };
  evidence: 'Same published test matrix' | 'MLPerf Closed universal proxy';
  caveat: string;
  sources: Array<{ label: string; url: string }>;
};

export const modelWorkloadComparisons: ModelWorkloadComparison[] = [
  {
    id: 'cosmos3-nano',
    model: 'NVIDIA Cosmos3-Nano',
    modelKind: 'Vision-language reasoner',
    benchmark: 'Input 50 / output 100 / video 1 FPS',
    runtime: 'vLLM · AIPerf',
    rtxHardware: 'RTX PRO 6000 Blackwell 96GB',
    h200Hardware: 'H200 NVL 141GB',
    measurements: [
      { label: 'Single request', rtxPro6000TokensPerSecond: 71.22, h200NvlTokensPerSecond: 129.53, qualifier: 'Client concurrency 1' },
      { label: 'Concurrent serving', rtxPro6000TokensPerSecond: 684.76, h200NvlTokensPerSecond: 1206.86, qualifier: 'Client concurrency 64' },
    ],
    latency: { label: 'TTFT · single request', rtxPro6000Ms: 186.46, h200NvlMs: 142.23 },
    evidence: 'Same published test matrix',
    caveat: 'NVIDIA names the 96 GB device “RTX PRO 6000 Blackwell” but does not identify its workstation, Max-Q, or server power profile in this table.',
    sources: [{ label: 'NVIDIA Cosmos benchmark', url: 'https://github.com/NVIDIA/cosmos/blob/main/inference_benchmarks.md#cosmos3-nano-reasoner' }],
  },
  {
    id: 'cosmos3-super',
    model: 'NVIDIA Cosmos3-Super',
    modelKind: 'Vision-language reasoner',
    benchmark: 'Input 50 / output 100 / video 1 FPS',
    runtime: 'vLLM · AIPerf',
    rtxHardware: 'RTX PRO 6000 Blackwell 96GB',
    h200Hardware: 'H200 NVL 141GB',
    measurements: [
      { label: 'Single request', rtxPro6000TokensPerSecond: 19.12, h200NvlTokensPerSecond: 41.87, qualifier: 'Client concurrency 1' },
      { label: 'Concurrent serving', rtxPro6000TokensPerSecond: 151.27, h200NvlTokensPerSecond: 300.56, qualifier: 'Client concurrency 64' },
    ],
    latency: { label: 'TTFT · single request', rtxPro6000Ms: 530.47, h200NvlMs: 348.88 },
    evidence: 'Same published test matrix',
    caveat: 'This is the same NVIDIA checkpoint and client matrix on both GPUs. The published RTX PRO 6000 edition and board-power setting are not disclosed.',
    sources: [{ label: 'NVIDIA Cosmos benchmark', url: 'https://github.com/NVIDIA/cosmos/blob/main/inference_benchmarks.md#cosmos3-super-reasoner' }],
  },
  {
    id: 'mlperf-llama2-70b',
    model: 'Llama 2 70B',
    modelKind: 'Text-generation LLM',
    benchmark: 'MLPerf Inference v6.0 Closed · 99.9% accuracy',
    runtime: 'TensorRT 10.14 · CUDA 13.0',
    rtxHardware: '8× RTX PRO 6000 Server 96GB',
    h200Hardware: '8× H200 NVL 141GB',
    measurements: [
      { label: 'Server throughput / GPU', rtxPro6000TokensPerSecond: 3190.5075, h200NvlTokensPerSecond: 3635.60875, qualifier: 'Published 8-GPU total ÷ 8' },
      { label: 'Offline throughput / GPU', rtxPro6000TokensPerSecond: 3379.35, h200NvlTokensPerSecond: 4000.5, qualifier: 'Published 8-GPU total ÷ 8' },
    ],
    evidence: 'MLPerf Closed universal proxy',
    caveat: 'This is the cleanest standardized LLM comparison, but the Blackwell result uses the passive RTX PRO 6000 Server Edition—not the workstation card. Per-GPU values are normalized system throughput, not single-user decode speed.',
    sources: [
      { label: 'MLCommons RTX result', url: 'https://github.com/mlcommons/inference_results_v6.0/tree/main/closed/Dell/results/XE7740_RTXPro6000_PCIe_96GBx8_TRT/llama2-70b-99.9' },
      { label: 'MLCommons H200 result', url: 'https://github.com/mlcommons/inference_results_v6.0/tree/main/closed/Dell/results/XE7740_H200_NVL_141GBx8_TRT/llama2-70b-99.9' },
    ],
  },
  {
    id: 'mlperf-llama31-8b',
    model: 'Llama 3.1 8B',
    modelKind: 'Text-generation LLM',
    benchmark: 'MLPerf Inference v6.0 Closed',
    runtime: 'TensorRT · 8-GPU submissions',
    rtxHardware: '8× RTX PRO 6000 Server 96GB',
    h200Hardware: '8× H200 NVL 141GB',
    measurements: [
      { label: 'Server throughput / GPU', rtxPro6000TokensPerSecond: 5626.07375, h200NvlTokensPerSecond: 5634.47625, qualifier: 'Published 8-GPU total ÷ 8' },
      { label: 'Offline throughput / GPU', rtxPro6000TokensPerSecond: 6129.5125, h200NvlTokensPerSecond: 6649.2, qualifier: 'Published 8-GPU total ÷ 8' },
    ],
    evidence: 'MLPerf Closed universal proxy',
    caveat: 'The workload rules are universal, but these are different Dell hosts and the RTX result is the Server Edition. Treat the normalized per-GPU figures as deployment throughput, not a desktop single-stream result.',
    sources: [
      { label: 'MLCommons RTX result', url: 'https://github.com/mlcommons/inference_results_v6.0/tree/main/closed/Dell/results/XE7745_RTXPro6000_PCIe_96GBx8_TRT/llama3.1-8b' },
      { label: 'MLCommons H200 result', url: 'https://github.com/mlcommons/inference_results_v6.0/tree/main/closed/Dell/results/XE7740_H200_NVL_141GBx8_TRT/llama3.1-8b' },
    ],
  },
];

export type WorkstationModelResult = {
  model: string;
  quantization: string;
  modelSizeGb: number;
  tokensPerSecond: number;
};

export const workstationModelResults: WorkstationModelResult[] = [
  { model: 'DeepSeek R1 Distill Llama 8B', quantization: 'Q8_0', modelSizeGb: 8.54, tokensPerSecond: 80.5 },
  { model: 'Phi-4', quantization: 'Q8_0', modelSizeGb: 15.58, tokensPerSecond: 61.8 },
  { model: 'InternLM 2.5 20B', quantization: 'Q8_0', modelSizeGb: 21.11, tokensPerSecond: 50.0 },
  { model: 'Qwen2.5-32B-Instruct GGUF', quantization: 'Q4_K_S', modelSizeGb: 18.78, tokensPerSecond: 43.9 },
  { model: 'Mistral Small 3.1 24B Instruct 2503 GGUF', quantization: 'Q8_0', modelSizeGb: 25.93, tokensPerSecond: 42.4 },
  { model: 'QwQ 32B', quantization: 'Q8_0', modelSizeGb: 34.82, tokensPerSecond: 30.9 },
  { model: 'Gemma 3 27B', quantization: 'Q8_0', modelSizeGb: 29.57, tokensPerSecond: 29.0 },
  { model: 'Llama 3.3 70B Instruct GGUF', quantization: 'Q4_K_S', modelSizeGb: 40.35, tokensPerSecond: 28.9 },
];

export const workstationModelSource = {
  name: 'GamersNexus experimental LM Studio suite',
  url: 'https://gamersnexus.net/gpus/nvidia-rtx-pro-6000-blackwell-benchmarks-tear-down-thermals-gaming-llm-acoustic-tests',
  hardware: '1× RTX PRO 6000 Blackwell Workstation Edition 96GB · Windows 11 · Ryzen 7 9800X3D',
};

export type ProcyonModelScores = {
  hardware: string;
  hostCpu: string;
  phi35: number;
  mistral7b: number;
  llama31: number;
  llama2: number | null;
};

// Independent UL Procyon INT4 runs. GPUreport publishes a composite score for
// each model, while BenchLife publishes tokens/sec. The two units deliberately
// remain separate in the UI.
export const procyonGpuReportResearch = {
  benchmark: 'UL Procyon AI Text Generation · INT4 · Windows',
  scoreUnit: 'Procyon points',
  sourceVersionNote: 'Most Ada results use Procyon 1.20.0; newer cards use 1.0.82 as reported by the source.',
  results: [
    { hardware: 'GeForce RTX 5090', hostCpu: 'Ryzen 7 9800X3D', phi35: 6972, mistral7b: 7526, llama31: 6610, llama2: 7437 },
    { hardware: 'GeForce RTX 4090', hostCpu: 'Ryzen 7 7800X3D', phi35: 5011, mistral7b: 5155, llama31: 4884, llama2: 5118 },
    { hardware: 'GeForce RTX 5080', hostCpu: 'Ryzen 7 9800X3D', phi35: 4772, mistral7b: 4892, llama31: 4685, llama2: 4925 },
    { hardware: 'GeForce RTX 5070 Ti', hostCpu: 'Ryzen 7 9800X3D', phi35: 4465, mistral7b: 4598, llama31: 4387, llama2: 4432 },
    { hardware: 'GeForce RTX 5070', hostCpu: 'Ryzen 7 9800X3D', phi35: 3957, mistral7b: 3974, llama31: 3480, llama2: 2274 },
    { hardware: 'GeForce RTX 4070 SUPER', hostCpu: 'Ryzen 7 9800X3D', phi35: 3406, mistral7b: 2873, llama31: 2651, llama2: 2748 },
    { hardware: 'GeForce RTX 4060 Ti 16GB', hostCpu: 'Ryzen 7 7800X3D', phi35: 2222, mistral7b: 1923, llama31: 1748, llama2: 1688 },
  ] satisfies ProcyonModelScores[],
  sources: [
    { label: 'Phi-3.5 score table', url: 'https://www.gpureport.cz/testy/universal-test.aspx?idscene=17' },
    { label: 'Mistral 7B score table', url: 'https://www.gpureport.cz/testy/universal-test.aspx?idscene=18' },
    { label: 'Llama 3.1 8B score table', url: 'https://www.gpureport.cz/testy/universal-test.aspx?idscene=19' },
    { label: 'Llama 2 13B score table', url: 'https://www.gpureport.cz/testy/universal-test.aspx?idscene=20' },
  ],
  caveat: 'These are comparable benchmark scores, not tokens/sec. Host CPU and Procyon version are disclosed per source and are not identical across every row; a missing Llama 2 score means the test did not complete, not zero performance.',
};

export const procyonTokenResearch = {
  benchmark: 'UL Procyon AI Text Generation · INT4',
  unit: 'tokens/sec',
  results: [
    { hardware: 'GeForce RTX 4090', phi35: 248.75, mistral7b: 182.81, llama31: 151.01, llama2: 93.99 },
    { hardware: 'GeForce RTX 4080', phi35: 193.45, mistral7b: 135.58, llama31: 112.31, llama2: 71.46 },
  ],
  sourceUrl: 'https://benchlife.info/ul-procyon-add-ai-text-generation-benchmark-for-llms/',
  caveat: 'Only cards still eligible under the catalog’s fixed-control policy are shown. These are a second controlled source and are not merged with llama.cpp rates.',
};

export const rtx4070SuperLocalScoreResearch = {
  hardware: 'GeForce RTX 4070 SUPER 12GB',
  runtime: 'LocalScore community benchmark · Q4_K Medium',
  results: [
    { model: 'Llama 3.2 1B Instruct', parameters: '1.5B', promptTokensPerSecond: 13280, generatedTokensPerSecond: 183, ttftMs: 106 },
    { model: 'Meta Llama 3.1 8B Instruct', parameters: '8.0B', promptTokensPerSecond: 3216, generatedTokensPerSecond: 45.3, ttftMs: 414 },
    { model: 'Qwen2.5 14B Instruct', parameters: '14.8B', promptTokensPerSecond: 1701, generatedTokensPerSecond: 24.9, ttftMs: 786 },
  ],
  sourceUrl: 'https://www.localscore.ai/accelerator/315',
  caveat: 'LocalScore’s accelerator overview does not expose one shared host and runtime record for all three summary values. Use this to understand model-size scaling on the 4070 SUPER, not as the primary cross-card ranking.',
};

export type TwoGpuThroughputResult = {
  setting: number;
  rtx5090TokensPerSecond: number;
  h200NvlTokensPerSecond: number;
};

export const llama31UniversalResearch = {
  model: 'Meta Llama 3.1 8B Instruct',
  portableQuantization: 'Q4_K_M',
  portableFileSizeGb: 4.92,
  catalogMinimumVramGb: 8,
  portableCommand: 'llama-bench -hf bartowski/Meta-Llama-3.1-8B-Instruct-GGUF:Q4_K_M -p 512 -n 128 -b 512 -ngl 99 -fa 0 -r 5 -o json',
  portableRules: [
    'One physical GPU, stock board-power limit, full model offload, and no speculative decoding',
    'Pin the same llama.cpp commit, driver branch, model file, prompt length, generation length, and Flash Attention setting',
    'Warm the model before five measured repetitions; publish mean and variation for pp512 and tg128',
    'Record peak VRAM, average board power, energy per 1,000 output tokens, CPU, operating system, and backend',
  ],
  q8Control: {
    modelFile: 'Meta-Llama-3.1-8B-Instruct-Q8_0.gguf',
    modelSizeGb: 7.95,
    hardware: ['GeForce RTX 5090 32GB', 'H200 NVL 141GB'],
    generationCommand: 'llama-bench -m Meta-Llama-3.1-8B-Instruct-Q8_0.gguf -n 128,256,512,1024,2048 -p 0 -b 512 -mg 0 -t 8 -o json',
    promptCommand: 'llama-bench -m Meta-Llama-3.1-8B-Instruct-Q8_0.gguf -n 0 -p 2048 -b 128,256,512,1024,2048 -mg 0 -t 8 -o json',
    generation: [
      { setting: 128, rtx5090TokensPerSecond: 295.83, h200NvlTokensPerSecond: 200.46 },
      { setting: 256, rtx5090TokensPerSecond: 290.78, h200NvlTokensPerSecond: 198.25 },
      { setting: 512, rtx5090TokensPerSecond: 280.99, h200NvlTokensPerSecond: 192.90 },
      { setting: 1024, rtx5090TokensPerSecond: 285.62, h200NvlTokensPerSecond: 192.88 },
      { setting: 2048, rtx5090TokensPerSecond: 285.30, h200NvlTokensPerSecond: 190.87 },
    ] satisfies TwoGpuThroughputResult[],
    promptProcessing: [
      { setting: 128, rtx5090TokensPerSecond: 6474.98, h200NvlTokensPerSecond: 5554.90 },
      { setting: 256, rtx5090TokensPerSecond: 8872.49, h200NvlTokensPerSecond: 7232.50 },
      { setting: 512, rtx5090TokensPerSecond: 10515.18, h200NvlTokensPerSecond: 8555.58 },
      { setting: 1024, rtx5090TokensPerSecond: 10560.01, h200NvlTokensPerSecond: 8573.62 },
      { setting: 2048, rtx5090TokensPerSecond: 10574.78, h200NvlTokensPerSecond: 8574.89 },
    ] satisfies TwoGpuThroughputResult[],
    sourceUrl: 'https://www.lttlabs.com/articles/2025/09/25/why-are-these-called-graphics-cards',
    caveat: 'This is an exact single-user H200 control, but it is Q8_0. It validates the checkpoint and harness; its scores must not be mixed into the Q4_K_M every-card lane. Q8_0 also leaves too little headroom on an 8 GB card.',
  },
  modelSourceUrl: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF',
};

export type Qwen25ServingResult = {
  hardware: string;
  architecture: string;
  vramGb: number;
  singleTokensPerSecond: number;
  batch8TokensPerSecond: number;
};

export const qwen25ServingResearch = {
  model: 'Qwen2.5-7B-Instruct',
  runtime: 'vLLM on Koyeb',
  tokenShape: '512 input / 512 output',
  results: [
    { hardware: 'H200', architecture: 'Hopper', vramGb: 141, singleTokensPerSecond: 182.44, batch8TokensPerSecond: 1370.60 },
    { hardware: 'H100', architecture: 'Hopper', vramGb: 80, singleTokensPerSecond: 105.00, batch8TokensPerSecond: 808.00 },
    { hardware: 'A100', architecture: 'Ampere', vramGb: 80, singleTokensPerSecond: 96.00, batch8TokensPerSecond: 695.00 },
    { hardware: 'A100 SXM', architecture: 'Ampere', vramGb: 80, singleTokensPerSecond: 93.00, batch8TokensPerSecond: 699.00 },
    { hardware: 'L40S', architecture: 'Ada', vramGb: 48, singleTokensPerSecond: 49.00, batch8TokensPerSecond: 365.00 },
    { hardware: 'RTX PRO 6000', architecture: 'Blackwell', vramGb: 96, singleTokensPerSecond: 42.59, batch8TokensPerSecond: 313.43 },
  ] satisfies Qwen25ServingResult[],
  sourceUrl: 'https://www.koyeb.com/docs/hardware/gpu-benchmarks',
  hardwareSourceUrl: 'https://www.koyeb.com/blog/koyeb-serverless-gpus-launch-rtx-pro-6000-h200-B200',
  caveat: 'Koyeb holds the checkpoint, vLLM service, token shape, and batch size constant and identifies the RTX PRO 6000 as Blackwell 96 GB. It does not publish the exact vLLM build, dtype, power limit, or board edition, so this is a controlled provider matrix—not a result to merge with llama.cpp.',
};

export const qwen36Research = {
  model: 'Qwen3.6-27B',
  parameters: '27B dense multimodal',
  context: '262,144 native tokens',
  officialUrl: 'https://huggingface.co/Qwen/Qwen3.6-27B',
  published: [
    {
      hardware: '1× RTX PRO 6000 Blackwell 96GB',
      result: '100 tok\u2060/\u2060s',
      profile: 'INT4 · vLLM · FlashInfer · MTP=3 · FP8 KV cache',
      caveat: 'Community guide; the author does not state whether the 96 GB card is full-power or Max-Q.',
      sourceUrl: 'https://github.com/lastloop-ai/vllm-blackwell-guide',
    },
    {
      hardware: '2× RTX PRO 6000 Blackwell 96GB',
      result: '98 tok\u2060/\u2060s single-user · 369 tok\u2060/\u2060s peak',
      profile: 'FP8 · vLLM production profile · MTP=3 · TP=2',
      caveat: 'Dual-GPU deployment throughput; not comparable with a one-GPU result.',
      sourceUrl: 'https://github.com/jcartu/qwen-bench',
    },
    {
      hardware: '1× H200 NVL 141GB',
      result: 'No same-profile result found',
      profile: 'Official vLLM recipe supports single-H200 BF16/FP8 serving',
      caveat: 'No public run matching the RTX checkpoint, precision, MTP, concurrency, and input/output lengths was located.',
      sourceUrl: 'https://recipes.vllm.ai/Qwen/Qwen3.6-27B',
    },
  ],
  universalProfile: [
    'Qwen/Qwen3.6-27B-FP8 on one GPU; language-model-only mode',
    'Same vLLM container, FP8 KV cache, seed, prompt set, and sampling parameters',
    'Primary baseline: MTP off; secondary run: identical MTP configuration on both GPUs',
    'Fixed 1,024 input / 1,024 output tokens at concurrency 1 and 64',
    'Report TTFT, TPOT, end-to-end latency, output tok/s, peak VRAM, and measured board energy',
  ],
};
