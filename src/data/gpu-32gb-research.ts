import type { Gpu, Product } from '../types';

export type Qualified32GbResult = {
  productId: string;
  model: 'Llama 2 7B';
  quantization: 'Q4_0';
  workload: string;
  backend: string;
  promptTokensPerSecond: number;
  generatedTokensPerSecond: number;
  comparisonClass: 'flash-attention-on' | 'legacy-same-model' | 'patched-metal';
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  notes: string;
};

// Useful measured evidence that is deliberately excluded from the fixed
// no-Flash-Attention leaderboard. Keeping it separate prevents an almost-match
// from silently becoming an apples-to-apples result.
export const qualified32GbResults: Qualified32GbResult[] = [
  {
    productId: 'nvidia-rtx-pro-4500-blackwell',
    model: 'Llama 2 7B',
    quantization: 'Q4_0',
    workload: 'pp512 / tg128 · one GPU · full offload · Flash Attention on',
    backend: 'CUDA',
    promptTokensPerSecond: 7251.66,
    generatedTokensPerSecond: 168.90,
    comparisonClass: 'flash-attention-on',
    sourceName: 'llama.cpp CUDA scoreboard',
    sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/15013',
    observedAt: '2026-08-12',
    notes: 'Same model and token counts as the control, but the published RTX PRO 4500 run enables Flash Attention. It stays outside the no-FA rank.',
  },
  {
    productId: 'amd-radeon-pro-w6800',
    model: 'Llama 2 7B',
    quantization: 'Q4_0',
    workload: 'pp512 / tg128 · one GPU · full offload · patched Metal build',
    backend: 'Metal',
    promptTokensPerSecond: 246.19,
    generatedTokensPerSecond: 85.82,
    comparisonClass: 'patched-metal',
    sourceName: 'llama.cpp Metal benchmark discussion',
    sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/4167',
    observedAt: '2026-08-12',
    notes: 'Exact model and pp512/tg128 workload on an Intel Mac, but the run used a community Metal 3 patch. It remains measured evidence outside the portable CUDA/ROCm/Vulkan control lane.',
  },
  {
    productId: 'nvidia-rtx-5000-ada',
    model: 'Llama 2 7B',
    quantization: 'Q4_0',
    workload: 'Legacy average eval / prompt eval · one GPU · full offload',
    backend: 'CUDA',
    promptTokensPerSecond: 3525.70,
    generatedTokensPerSecond: 99.19,
    comparisonClass: 'legacy-same-model',
    sourceName: 'GPU Benchmarks on LLM Inference',
    sourceUrl: 'https://github.com/XiongjieDai/GPU-Benchmarks-on-LLM-Inference/blob/main/LLaMA%202/Professional%20GPUs/5000_Ada_v2.ipynb',
    observedAt: '2026-08-12',
    notes: 'Measured on the same Llama 2 7B Q4_0 model, but the older project reports average eval rather than the current fixed tg128 harness. It is evidence, not a control-lane rank.',
  },
];

export function physical32GbGpus(products: Product[]): Gpu[] {
  return products
    .filter((product): product is Gpu => product.category === 'gpu' && product.vramGb === 32)
    .sort((a, b) => a.manufacturer.localeCompare(b.manufacturer) || a.name.localeCompare(b.name));
}

export function addressableGpuMemory(gpu: Gpu) {
  return gpu.addressableVramGb ?? (gpu.memoryPool === 'split' && gpu.gpuCount
    ? gpu.vramGb / gpu.gpuCount
    : gpu.vramGb);
}
