export interface DgxSparkCapacityBenchmark {
  model: string;
  parameters: string;
  quantization: string;
  generatedTokensPerSecond: number;
  promptTokensPerSecond?: number;
  test: string;
  sourceUrl: string;
  interpretation: string;
}

export const dgxSparkCapacityBenchmarks: DgxSparkCapacityBenchmark[] = [
  {
    model: 'Qwen3.6 27B', parameters: '27B dense', quantization: 'NVFP4',
    generatedTokensPerSecond: 24.7, test: 'vLLM 0.24 · steady state · 29.1 peak · 128K input verified',
    sourceUrl: 'https://github.com/smfworks/NemoKnowledgebase/blob/main/benchmarks/qwen3-6-27b-nvfp4/reports/qwen3-6-performance-benchmark-report.md',
    interpretation: 'The common current-model reference: useful quality and huge context capacity, but dense decode remains memory-bandwidth-bound.',
  },
  {
    model: 'Qwen3 8B', parameters: '8.19B dense', quantization: 'Q4_K_M',
    generatedTokensPerSecond: 43.7, promptTokensPerSecond: 3167, test: 'pp512 / decode at 512 context',
    sourceUrl: 'https://github.com/DandinPower/llama.cpp_bench/blob/main/dgx_spark/report.md',
    interpretation: 'Small dense model: interactive, but decode is bounded by the 273 GB/s memory bus.',
  },
  {
    model: 'Qwen3 30B A3B', parameters: '30.53B MoE', quantization: 'Q4_K_M',
    generatedTokensPerSecond: 89.3, promptTokensPerSecond: 2541, test: 'pp512 / decode at 512 context',
    sourceUrl: 'https://github.com/DandinPower/llama.cpp_bench/blob/main/dgx_spark/report.md',
    interpretation: 'The best architectural match here: 30B total capacity with only a small expert set active per token.',
  },
  {
    model: 'Qwen3 32B', parameters: '32.76B dense', quantization: 'Q4_K_M',
    generatedTokensPerSecond: 10.7, promptTokensPerSecond: 762, test: 'pp512 / decode at 512 context',
    sourceUrl: 'https://github.com/DandinPower/llama.cpp_bench/blob/main/dgx_spark/report.md',
    interpretation: 'The bandwidth wall: similar parameter count to the MoE row, but every dense weight must be streamed each token.',
  },
  {
    model: 'gpt-oss 120B', parameters: '116.83B MoE', quantization: 'Q4_K_M',
    generatedTokensPerSecond: 62.36, promptTokensPerSecond: 2443.59, test: 'pp2048 / tg32 · FA on · no mmap',
    sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/16578',
    interpretation: 'Capacity proof, not a universal-rank row: a roughly 59 GiB model runs wholly on the 128 GB system.',
  },
];

export const dgxSparkUniversalSource = {
  sourceUrl: 'https://github.com/ggml-org/llama.cpp/discussions/15013',
  profile: 'Llama 2 7B · Q4_0 · one integrated GPU · pp512 / tg128 · Flash Attention off',
  command: 'llama-bench -m llama-2-7b.Q4_0.gguf -ngl 99 -fa 0',
  conclusion: 'Yes—DGX Spark has an accepted result on the same fixed control as the discrete-GPU scoreboard.',
} as const;
