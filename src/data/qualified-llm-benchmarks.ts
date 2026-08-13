export type QualifiedLlmBenchmark = {
  productId: string;
  hardware: string;
  profileClass: 'same-workload-checkpoint-variant';
  model: string;
  modelFile: string;
  quantization: 'Q4_0';
  engine: 'llama.cpp';
  engineCommit: string;
  backend: 'CUDA';
  gpuCount: 1;
  gpuLayers: 99;
  flashAttention: false;
  promptTokens: 512;
  generatedTokens: 128;
  promptTokensPerSecond: number;
  promptStdDev: number;
  generatedTokensPerSecond: number;
  generatedStdDev: number;
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  notes: string;
};

// Exact-device results that match the fixed control's tensor geometry, quant,
// backend shape, offload, and pp/tg lengths, but differ in checkpoint bytes or
// another disclosed detail. They remain visible and unranked.
export const qualifiedLlmBenchmarks: QualifiedLlmBenchmark[] = [
  {
    productId: 'nvidia-rtx-4060-ti-16',
    hardware: 'NVIDIA GeForce RTX 4060 Ti 16GB',
    profileClass: 'same-workload-checkpoint-variant',
    model: 'Llama 2 7B Chat',
    modelFile: 'meta-llama/Llama-2-7b-chat-hf → Q4_0 GGUF',
    quantization: 'Q4_0',
    engine: 'llama.cpp',
    engineCommit: 'd5ab2975 / b2296',
    backend: 'CUDA',
    gpuCount: 1,
    gpuLayers: 99,
    flashAttention: false,
    promptTokens: 512,
    generatedTokens: 128,
    promptTokensPerSecond: 2219.31,
    promptStdDev: 1.77,
    generatedTokensPerSecond: 61.80,
    generatedStdDev: 0.03,
    sourceName: "Beebopkim's llama.cpp quantization benchmarks",
    sourceUrl: 'https://beebopkim.github.io/2024/03/09/Benchmarks-for-lots-of-quantization-types-in-llama-cpp/',
    observedAt: '2026-08-12',
    notes: 'Exact RTX 4060 Ti 16GB, CUDA 12.3, Ubuntu 22.04 measurement. It matches Q4_0, one-GPU full offload, pp512, tg128, and no Flash Attention. The source used the Llama 2 7B Chat checkpoint rather than the scoreboard’s exact TheBloke base-model GGUF, so it is displayed as requested control-compatible evidence and is not inserted into the strict rank.',
  },
];

export function qualifiedLlmBenchmarkFor(productId: string) {
  return qualifiedLlmBenchmarks.find((result) => result.productId === productId);
}
