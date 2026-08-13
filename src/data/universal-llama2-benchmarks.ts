export type LegacyLlama2Result = {
  productId: string;
  hardware: string;
  promptTrials: readonly [number, number, number];
  generationTrials: readonly [number, number, number];
  promptTokensPerSecond: number;
  generatedTokensPerSecond: number;
  sourceUrl: string;
};

const root = 'https://github.com/XiongjieDai/GPU-Benchmarks-on-LLM-Inference/blob/main/LLaMA%202';

function average(values: readonly number[]) {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function result(
  productId: string,
  hardware: string,
  folder: 'Gaming%20GPUs' | 'Professional%20GPUs',
  notebook: string,
  promptTrials: LegacyLlama2Result['promptTrials'],
  generationTrials: LegacyLlama2Result['generationTrials'],
): LegacyLlama2Result {
  return {
    productId,
    hardware,
    promptTrials,
    generationTrials,
    promptTokensPerSecond: average(promptTrials),
    generatedTokensPerSecond: average(generationTrials),
    sourceUrl: `${root}/${folder}/${notebook}_v2.ipynb`,
  };
}

// One public 2023-era llama.cpp suite: Llama 2 7B Q4_0, one GPU, full offload,
// the same 494-token prompt, 1,023 timed output evaluations, and three runs.
// It is deliberately an archival same-harness lane rather than a substitute for
// the current pp512/tg128 scoreboard control.
export const legacyLlama2Suite: LegacyLlama2Result[] = [
  result('nvidia-rtx-4090', 'GeForce RTX 4090 24 GB', 'Gaming%20GPUs', '4090',
    [5560.50, 5528.08, 5504.98], [150.09, 148.67, 149.35]),
  result('nvidia-a100-pcie-80', 'A100 PCIe 80 GB', 'Professional%20GPUs', 'A100',
    [3224.44, 3613.25, 3494.25], [136.09, 136.17, 136.47]),
  result('nvidia-h100-pcie-80', 'H100 PCIe 80 GB', 'Professional%20GPUs', 'H100_PCIe',
    [4773.18, 4975.78, 4856.80], [131.44, 134.81, 135.07]),
  result('nvidia-rtx-6000-ada', 'RTX 6000 Ada 48 GB', 'Professional%20GPUs', '6000_Ada',
    [3689.46, 4021.62, 4022.47], [125.92, 128.18, 128.24]),
  result('nvidia-rtx-3090', 'GeForce RTX 3090 24 GB', 'Gaming%20GPUs', '3090',
    [2605.87, 2612.02, 2587.55], [120.48, 120.70, 120.62]),
  result('nvidia-rtx-4080', 'GeForce RTX 4080 16 GB', 'Gaming%20GPUs', '4080',
    [3763.15, 3777.83, 3783.38], [118.05, 117.98, 118.01]),
  result('nvidia-rtx-a6000', 'RTX A6000 48 GB', 'Professional%20GPUs', 'A6000',
    [2970.46, 2979.12, 2987.78], [111.52, 111.67, 111.52]),
  result('nvidia-rtx-5000-ada', 'RTX 5000 Ada 32 GB', 'Professional%20GPUs', '5000_Ada',
    [3525.95, 3702.68, 3348.47], [99.07, 99.23, 99.27]),
];

export const legacyLlama2Profile = {
  model: 'Llama 2 7B',
  quantization: 'Q4_0',
  gpuCount: 1,
  promptTokens: 494,
  generatedEvaluations: 1023,
  repetitions: 3,
  commandShape: './main --no-mmap -ngl 10000 -n 1024 --ignore-eos -m ./models/7B-v2/ggml-model-q4_0.gguf',
  sourceUrl: 'https://github.com/XiongjieDai/GPU-Benchmarks-on-LLM-Inference/tree/main/LLaMA%202',
  caveat: 'This older suite holds the model, quant, prompt, output length, and command shape constant. Its llama.cpp build, drivers, hosts, and long 1,023-token eval differ from the current pp512/tg128 scoreboard, so the two lanes must not be blended.',
} as const;

export function legacyLlama2ResultFor(productId: string) {
  return legacyLlama2Suite.find((entry) => entry.productId === productId);
}
