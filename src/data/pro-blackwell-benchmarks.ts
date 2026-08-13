import type { Gpu } from '../types';

export type ProBlackwellBenchmarkLane =
  | 'fixed-control'
  | 'qualified-control'
  | 'other-model'
  | 'serving-throughput';

export type ProBlackwellBenchmark = {
  productId: string;
  lane: ProBlackwellBenchmarkLane;
  model: string;
  quantization: string;
  runtime: string;
  workload: string;
  generatedTokensPerSecond: number;
  generatedTokensPerSecondLow?: number;
  promptTokensPerSecond?: number;
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  notes: string;
};

const observedAt = '2026-08-12';

// Exact-device evidence that does not belong in the fixed Llama 2 7B Q4_0,
// Flash-Attention-off ranking. These results are valuable, but only rows in the
// same lane, model, quantization, runtime, and workload should be compared.
export const proBlackwellSupplementalBenchmarks: ProBlackwellBenchmark[] = [
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-workstation',
    lane: 'other-model',
    model: 'gpt-oss 20B',
    quantization: 'MXFP4',
    runtime: 'llama.cpp / CUDA / Flash Attention on',
    workload: 'one GPU · full offload · pp2048 / tg128',
    generatedTokensPerSecond: 286.91,
    promptTokensPerSecond: 11521.95,
    sourceName: 'llama.cpp gpt-oss guide',
    sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/15396',
    observedAt,
    notes: 'Exact 600 W Workstation Edition device name. This is the cleanest published single-stream comparison against the 300 W Max-Q edition.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-workstation',
    lane: 'other-model',
    model: 'gpt-oss 120B',
    quantization: 'MXFP4',
    runtime: 'llama.cpp / CUDA / Flash Attention on',
    workload: 'one GPU · full offload · pp2048 / tg128',
    generatedTokensPerSecond: 196.31,
    promptTokensPerSecond: 5518.07,
    sourceName: 'llama.cpp gpt-oss guide',
    sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/15396',
    observedAt,
    notes: 'The 59.02 GiB model fits completely in the 96 GB framebuffer.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-workstation',
    lane: 'other-model',
    model: 'Qwen3 32B',
    quantization: 'Q4_K_M',
    runtime: 'llama.cpp / CUDA / Flash Attention on',
    workload: 'one GPU · full offload · pp512 / tg128',
    generatedTokensPerSecond: 62.44,
    promptTokensPerSecond: 3688.09,
    sourceName: 'llama.cpp issue #14863',
    sourceUrl: 'https://github.com/ggml-org/llama.cpp/issues/14863',
    observedAt,
    notes: 'Exact one-GPU device log. This run was published while isolating a separate multi-GPU regression.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-maxq',
    lane: 'other-model',
    model: 'gpt-oss 20B',
    quantization: 'MXFP4',
    runtime: 'llama.cpp / CUDA / Flash Attention on',
    workload: 'one GPU · full offload · pp2048 / tg128',
    generatedTokensPerSecond: 249.96,
    promptTokensPerSecond: 9480.55,
    sourceName: 'llama.cpp gpt-oss guide',
    sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/15396',
    observedAt,
    notes: 'Exact Max-Q Workstation Edition device name at the card’s lower 300 W class.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-maxq',
    lane: 'other-model',
    model: 'gpt-oss 120B',
    quantization: 'MXFP4',
    runtime: 'llama.cpp / CUDA / Flash Attention on',
    workload: 'one GPU · full offload · pp2048 / tg128',
    generatedTokensPerSecond: 170.62,
    promptTokensPerSecond: 4494.20,
    sourceName: 'llama.cpp gpt-oss guide',
    sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/15396',
    observedAt,
    notes: 'Exact Max-Q edition; directly comparable with the Workstation Edition gpt-oss 120B row.',
  },
  {
    productId: 'nvidia-rtx-pro-5000-blackwell-72',
    lane: 'other-model',
    model: 'Gemma 4 12B IT',
    quantization: 'IQ4_XS',
    runtime: 'llama.cpp / CUDA / Flash Attention on',
    workload: 'one GPU · 32K context · sustained generation',
    generatedTokensPerSecond: 104,
    generatedTokensPerSecondLow: 99,
    sourceName: 'Gemma 4 GGUF model card',
    sourceUrl: 'https://huggingface.co/Krasnopjorovs/gemma-4-12b-it-Imatrix-IQ4_XS-GGUF',
    observedAt,
    notes: 'Author-reported sustained range on the exact 72 GB edition; the card also reports under one-second TTFT on typical prompts.',
  },
  {
    productId: 'nvidia-rtx-pro-5000-blackwell-48',
    lane: 'other-model',
    model: 'Qwen3.6 27B',
    quantization: 'FP8',
    runtime: 'vLLM / CUDA',
    workload: 'one GPU · full-precision KV cache · generation',
    generatedTokensPerSecond: 80,
    generatedTokensPerSecondLow: 50,
    promptTokensPerSecond: 4400,
    sourceName: 'Original LocalLLaMA owner benchmark',
    sourceUrl: 'https://www.reddit.com/r/LocalLLaMA/comments/1td53ii/the_rtx_5000_pro_48gb_arrived_and_it_is_better/',
    observedAt,
    notes: 'Up to 80 tok/s, falling to roughly 50–60 tok/s for very large prompts. Community result; useful evidence, not a controlled cross-card row.',
  },
  {
    productId: 'nvidia-rtx-pro-4500-blackwell',
    lane: 'qualified-control',
    model: 'Llama 2 7B',
    quantization: 'Q4_0',
    runtime: 'llama.cpp / CUDA / Flash Attention on',
    workload: 'one GPU · full offload · pp512 / tg128',
    generatedTokensPerSecond: 168.90,
    promptTokensPerSecond: 7251.66,
    sourceName: 'llama.cpp CUDA scoreboard',
    sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/15013',
    observedAt,
    notes: 'Same model and token counts as the fixed control, but Flash Attention is enabled, so it is not inserted into the no-FA rank.',
  },
  {
    productId: 'nvidia-rtx-pro-4000-blackwell-sff',
    lane: 'other-model',
    model: 'gpt-oss 20B',
    quantization: 'MXFP4',
    runtime: 'llama.cpp / CUDA / Flash Attention on',
    workload: 'one GPU · full offload · pp512 / tg128',
    generatedTokensPerSecond: 117.47,
    promptTokensPerSecond: 4826.07,
    sourceName: 'Original LocalLLaMA owner benchmark',
    sourceUrl: 'https://www.reddit.com/r/LocalLLaMA/comments/1qn02w8/i_put_an_rtx_pro_4000_blackwell_sff_in_my_mss1/',
    observedAt,
    notes: 'CUDA-only result on the exact 70 W SFF edition. Hybrid CUDA + Radeon runs from the same post are intentionally excluded.',
  },
  {
    productId: 'nvidia-rtx-pro-2000-blackwell',
    lane: 'other-model',
    model: 'LFM2.5 8B-A1B',
    quantization: 'NVFP4',
    runtime: 'vLLM 0.22 / ModelOpt / FP8 KV',
    workload: 'one GPU · concurrency 1 · 32K context · 256-token decode',
    generatedTokensPerSecond: 130,
    sourceName: 'LFM2.5 NVFP4 model card',
    sourceUrl: 'https://huggingface.co/sakamakismile/Huihui-LFM2.5-8B-A1B-abliterated-NVFP4',
    observedAt,
    notes: 'Single-run indicative result on one exact 16 GB RTX PRO 2000. Higher-concurrency aggregate figures are not used here.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-server',
    lane: 'serving-throughput',
    model: 'Qwen3 30B-A3B',
    quantization: 'FP4',
    runtime: 'TensorRT-LLM 1.1',
    workload: 'one GPU · TP1 · 1,000 input / 1,000 output · throughput benchmark',
    generatedTokensPerSecond: 9938,
    sourceName: 'NVIDIA inference performance',
    sourceUrl: 'https://developer.nvidia.com/deep-learning-performance-training-inference/ai-inference',
    observedAt,
    notes: 'Vendor serving-throughput result, not single-stream latency. Do not compare the magnitude directly with llama-bench tg128.',
  },
  {
    productId: 'nvidia-rtx-pro-4500-blackwell-server',
    lane: 'serving-throughput',
    model: 'Nemotron Nano 9B v2',
    quantization: 'FP4',
    runtime: 'TensorRT-LLM 1.2',
    workload: 'one GPU · TP1 · 500 input / 500 output · throughput benchmark',
    generatedTokensPerSecond: 945,
    sourceName: 'NVIDIA inference performance',
    sourceUrl: 'https://developer.nvidia.com/deep-learning-performance-training-inference/ai-inference',
    observedAt,
    notes: 'Vendor serving-throughput result, not single-stream latency. Kept in a separate lane from local interactive generation.',
  },
];

export const proBlackwellNoPublicBenchmarkIds = new Set([
  'nvidia-rtx-pro-6000d-blackwell-server',
]);

export const unresolvedPro6000FamilyBenchmark: Omit<ProBlackwellBenchmark, 'productId'> = {
  lane: 'fixed-control',
  model: 'Llama 2 7B',
  quantization: 'Q4_0',
  runtime: 'llama.cpp / CUDA / Flash Attention off',
  workload: 'one GPU · full offload · pp512 / tg128',
  generatedTokensPerSecond: 274.20,
  promptTokensPerSecond: 14854.63,
  sourceName: 'llama.cpp CUDA scoreboard',
  sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/15013',
  observedAt,
  notes: 'The public submission identifies only “RTX PRO 6000 Blackwell,” so it cannot be assigned to Workstation, Max-Q, or Server Edition without guessing.',
};

export function proBlackwellBenchmarksFor(gpu: Gpu): ProBlackwellBenchmark[] {
  const fixed = gpu.llmBenchmarks
    ?.filter((result) => result.profileKey === 'llama2-7b-q4_0-tg128-no-fa')
    .map<ProBlackwellBenchmark>((result) => ({
      productId: gpu.id,
      lane: 'fixed-control',
      model: result.modelName,
      quantization: result.quantization,
      runtime: `${result.engine} / ${result.backend} / Flash Attention off`,
      workload: `one GPU · full offload · pp${result.promptTokens} / tg${result.generatedTokens}`,
      generatedTokensPerSecond: result.generatedTokensPerSecond,
      promptTokensPerSecond: result.promptTokensPerSecond,
      sourceName: result.sourceName,
      sourceUrl: result.sourceUrl,
      observedAt: result.observedAt,
      notes: result.notes ?? 'Exact-device result in the fixed comparison profile.',
    })) ?? [];

  return [
    ...fixed,
    ...proBlackwellSupplementalBenchmarks.filter((result) => result.productId === gpu.id),
  ];
}

export function preferredProBlackwellBenchmark(gpu: Gpu) {
  return proBlackwellBenchmarksFor(gpu)[0];
}

export function formatProBlackwellSpeed(result: ProBlackwellBenchmark) {
  const high = result.generatedTokensPerSecond.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (result.generatedTokensPerSecondLow === undefined) return `${high} tok/s`;
  const low = result.generatedTokensPerSecondLow.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${low}–${high} tok/s`;
}
