import type { GpuParallelProcessors, LlmBenchmarkResult } from '../src/types.js';

export type LlmBenchmarkSeed = LlmBenchmarkResult & { productId: string };

export const llmBenchmarkProfile = {
  profileKey: 'llama2-7b-q4_0-tg128-no-fa',
  modelName: 'Llama 2 7B',
  modelFile: 'llama-2-7b.Q4_0.gguf',
  quantization: 'Q4_0',
  generatedTokens: 128,
  promptTokens: 512,
  gpuLayers: 99,
  flashAttention: false,
  command: 'llama-bench -m llama-2-7b.Q4_0.gguf -ngl 99 -fa 0',
  modelUrl: 'https://huggingface.co/TheBloke/Llama-2-7B-GGUF/resolve/main/llama-2-7b.Q4_0.gguf',
} as const;

const sourceAccessedAt = '2026-08-12';
const sources = {
  CUDA: {
    name: 'llama.cpp CUDA scoreboard',
    url: 'https://github.com/ggml-org/llama.cpp/discussions/15013',
  },
  ROCm: {
    name: 'llama.cpp ROCm scoreboard',
    url: 'https://github.com/ggml-org/llama.cpp/discussions/15021',
  },
  Vulkan: {
    name: 'llama.cpp Vulkan scoreboard',
    url: 'https://github.com/ggml-org/llama.cpp/discussions/10879',
  },
} as const;

type SeedInput = {
  productId: string;
  sourceDeviceName: string;
  backend: keyof typeof sources;
  engineCommit?: string;
  prompt: number;
  promptStdDev: number;
  generation: number;
  generationStdDev: number;
  notes?: string;
};

function seed(input: SeedInput): LlmBenchmarkSeed {
  const source = sources[input.backend];
  return {
    productId: input.productId,
    profileKey: llmBenchmarkProfile.profileKey,
    modelName: llmBenchmarkProfile.modelName,
    modelFile: llmBenchmarkProfile.modelFile,
    quantization: llmBenchmarkProfile.quantization,
    engine: 'llama.cpp',
    engineCommit: input.engineCommit,
    backend: input.backend,
    gpuCount: 1,
    gpuLayers: llmBenchmarkProfile.gpuLayers,
    flashAttention: llmBenchmarkProfile.flashAttention,
    promptTokens: llmBenchmarkProfile.promptTokens,
    generatedTokens: llmBenchmarkProfile.generatedTokens,
    promptTokensPerSecond: input.prompt,
    promptStdDev: input.promptStdDev,
    generatedTokensPerSecond: input.generation,
    generatedStdDev: input.generationStdDev,
    sourceName: source.name,
    sourceUrl: source.url,
    sourceDeviceName: input.sourceDeviceName,
    observedAt: sourceAccessedAt,
    notes: input.notes ?? 'Community-submitted single-GPU result accepted onto the llama.cpp scoreboard.',
  };
}

// These are measured runs, not estimates. Every entry uses the exact model file and
// test profile above. Native backends, llama.cpp commits, drivers, hosts, and board
// power limits can still differ, so those details remain visible in the interface.
export const llmBenchmarkResearchSeeds: LlmBenchmarkSeed[] = [
  seed({ productId: 'nvidia-rtx-5090', sourceDeviceName: 'NVIDIA GeForce RTX 5090', backend: 'CUDA', engineCommit: '8cf6b42', prompt: 14073.41, promptStdDev: 115.16, generation: 290.02, generationStdDev: 1.10 }),
  seed({ productId: 'nvidia-rtx-pro-6000-blackwell-maxq', sourceDeviceName: 'NVIDIA RTX PRO 6000 Blackwell Max-Q Workstation Edition', backend: 'CUDA', engineCommit: 'd2462f8', prompt: 12742.48, promptStdDev: 285.22, generation: 260.42, generationStdDev: 0.04, notes: 'Exact Max-Q device-name submission at the default 300 W power limit; retained instead of the scoreboard’s unspecified RTX PRO 6000 variant.' }),
  seed({ productId: 'nvidia-rtx-4090-d', sourceDeviceName: 'NVIDIA GeForce RTX 4090 D', backend: 'CUDA', engineCommit: '79c1160', prompt: 10293.86, promptStdDev: 134.72, generation: 189.33, generationStdDev: 0.19 }),
  seed({ productId: 'nvidia-rtx-4090', sourceDeviceName: 'NVIDIA GeForce RTX 4090', backend: 'CUDA', engineCommit: '2241453', prompt: 11992.70, promptStdDev: 107.99, generation: 186.21, generationStdDev: 0.13 }),
  seed({ productId: 'nvidia-rtx-5080', sourceDeviceName: 'NVIDIA GeForce RTX 5080', backend: 'CUDA', engineCommit: '8a4280c', prompt: 8297.36, promptStdDev: 9.50, generation: 181.99, generationStdDev: 0.42 }),
  seed({ productId: 'nvidia-rtx-5070-ti', sourceDeviceName: 'NVIDIA GeForce RTX 5070 Ti', backend: 'CUDA', engineCommit: '933414c', prompt: 6952.38, promptStdDev: 13.73, generation: 176.85, generationStdDev: 0.07 }),
  seed({ productId: 'nvidia-rtx-6000-ada', sourceDeviceName: 'NVIDIA RTX 6000 Ada Generation', backend: 'CUDA', engineCommit: 'b8e09f0', prompt: 9229.23, promptStdDev: 101.78, generation: 176.07, generationStdDev: 0.26 }),
  seed({ productId: 'nvidia-rtx-3090-ti', sourceDeviceName: 'NVIDIA GeForce RTX 3090 Ti', backend: 'CUDA', engineCommit: '9c35706', prompt: 6567.49, promptStdDev: 20.30, generation: 171.19, generationStdDev: 3.98 }),
  seed({ productId: 'amd-rx-7900-xtx', sourceDeviceName: 'AMD Radeon RX 7900 XTX', backend: 'ROCm', engineCommit: '2f0c2db', prompt: 3552.27, promptStdDev: 101.96, generation: 167.11, generationStdDev: 0.50 }),
  seed({ productId: 'nvidia-rtx-3090', sourceDeviceName: 'NVIDIA GeForce RTX 3090', backend: 'CUDA', engineCommit: 'c76b420', prompt: 5174.69, promptStdDev: 21.83, generation: 158.16, generationStdDev: 0.21 }),
  seed({ productId: 'nvidia-l40', sourceDeviceName: 'NVIDIA L40', backend: 'CUDA', engineCommit: 'ee09828', prompt: 8870.49, promptStdDev: 378.76, generation: 152.01, generationStdDev: 0.28 }),
  seed({ productId: 'nvidia-rtx-4080-super', sourceDeviceName: 'NVIDIA GeForce RTX 4080 SUPER', backend: 'CUDA', engineCommit: '81086cd', prompt: 8125.15, promptStdDev: 41.05, generation: 148.33, generationStdDev: 0.20 }),
  seed({ productId: 'nvidia-rtx-4080', sourceDeviceName: 'NVIDIA GeForce RTX 4080', backend: 'CUDA', engineCommit: '20638e4', prompt: 8031.64, promptStdDev: 26.49, generation: 142.49, generationStdDev: 0.16 }),
  seed({ productId: 'nvidia-rtx-a6000', sourceDeviceName: 'NVIDIA RTX A6000', backend: 'CUDA', engineCommit: '4795c91', prompt: 4913.93, promptStdDev: 6.79, generation: 138.73, generationStdDev: 2.75 }),
  seed({ productId: 'nvidia-rtx-4070-ti-super', sourceDeviceName: 'NVIDIA GeForce RTX 4070 Ti SUPER', backend: 'CUDA', engineCommit: '9c35706', prompt: 6924.53, promptStdDev: 13.87, generation: 132.26, generationStdDev: 0.16 }),
  seed({ productId: 'nvidia-rtx-pro-4000-blackwell', sourceDeviceName: 'NVIDIA RTX PRO 4000 Blackwell', backend: 'CUDA', engineCommit: '7d77f07', prompt: 4992.83, promptStdDev: 113.52, generation: 131.66, generationStdDev: 0.20 }),
  seed({ productId: 'nvidia-rtx-a5000', sourceDeviceName: 'NVIDIA RTX A5000', backend: 'CUDA', engineCommit: 'e5155e6', prompt: 4028.16, promptStdDev: 19.14, generation: 130.07, generationStdDev: 2.74 }),
  seed({ productId: 'nvidia-tesla-v100-pcie-32', sourceDeviceName: 'NVIDIA Tesla V100 32 GB', backend: 'CUDA', engineCommit: '51f5a45', prompt: 3042.64, promptStdDev: 40.71, generation: 129.08, generationStdDev: 0.05, notes: 'The accepted scoreboard result identifies the original Tesla V100 32 GB, not V100S, but does not publish its PCIe-versus-SXM form factor. It is mapped to the base V100 PCIe row and is not inherited by V100S or Quadro GV100.' }),
  seed({ productId: 'nvidia-rtx-5070', sourceDeviceName: 'NVIDIA GeForce RTX 5070', backend: 'CUDA', prompt: 5184.75, promptStdDev: 18.70, generation: 127.54, generationStdDev: 0.46, notes: 'Accepted scoreboard result; the scoreboard does not expose a commit hash for this entry.' }),
  seed({ productId: 'nvidia-a30', sourceDeviceName: 'NVIDIA A30', backend: 'CUDA', engineCommit: '583cb83', prompt: 2767.10, promptStdDev: 1.88, generation: 124.81, generationStdDev: 0.16 }),
  seed({ productId: 'amd-instinct-mi210', sourceDeviceName: 'AMD Instinct MI210', backend: 'ROCm', engineCommit: '8160b38', prompt: 2486.22, promptStdDev: 9.58, generation: 124.51, generationStdDev: 0.04 }),
  seed({ productId: 'nvidia-a40', sourceDeviceName: 'NVIDIA A40', backend: 'CUDA', engineCommit: '3470a5c', prompt: 4609.01, promptStdDev: 10.67, generation: 124.11, generationStdDev: 0.17 }),
  seed({ productId: 'amd-radeon-pro-w7900', sourceDeviceName: 'AMD Radeon PRO W7900 48GB', backend: 'ROCm', engineCommit: '8160b38', prompt: 3213.17, promptStdDev: 80.47, generation: 121.18, generationStdDev: 0.06 }),
  seed({ productId: 'amd-rx-9070', sourceDeviceName: 'AMD Radeon RX 9070', backend: 'ROCm', engineCommit: 'd0660f2', prompt: 2381.77, promptStdDev: 3.68, generation: 114.48, generationStdDev: 0.60 }),
  seed({ productId: 'amd-instinct-mi100', sourceDeviceName: 'AMD Instinct MI100', backend: 'ROCm', engineCommit: '9c35706', prompt: 2732.83, promptStdDev: 1.98, generation: 110.48, generationStdDev: 0.14 }),
  seed({ productId: 'nvidia-rtx-4070-ti', sourceDeviceName: 'NVIDIA GeForce RTX 4070 Ti', backend: 'Vulkan', engineCommit: '516a4ca', prompt: 4981.44, promptStdDev: 102.35, generation: 110.53, generationStdDev: 0.00, notes: 'Accepted no-Flash-Attention Vulkan scoreboard run. Backend remains explicit and is not presented as CUDA-equivalent prompt throughput.' }),
  seed({ productId: 'nvidia-rtx-4070-super', sourceDeviceName: 'NVIDIA GeForce RTX 4070 SUPER', backend: 'Vulkan', engineCommit: 'c945aaa', prompt: 4608.20, promptStdDev: 31.66, generation: 108.74, generationStdDev: 0.18, notes: 'Accepted no-Flash-Attention Vulkan coopmat2 run. This is the fixed-profile 4070 SUPER measurement; the faster Flash-Attention row is deliberately excluded.' }),
  seed({ productId: 'nvidia-quadro-rtx-6000', sourceDeviceName: 'NVIDIA Quadro RTX 6000', backend: 'CUDA', engineCommit: 'b8e09f0', prompt: 2751.18, promptStdDev: 19.43, generation: 102.77, generationStdDev: 0.04 }),
  seed({ productId: 'nvidia-quadro-rtx-8000', sourceDeviceName: 'NVIDIA Quadro RTX 8000', backend: 'CUDA', engineCommit: 'b8e09f0', prompt: 2709.95, promptStdDev: 3.35, generation: 102.68, generationStdDev: 0.03 }),
  seed({ productId: 'amd-rx-9070-xt', sourceDeviceName: 'AMD Radeon RX 9070 XT', backend: 'ROCm', engineCommit: '583cb83', prompt: 5055.19, promptStdDev: 109.58, generation: 101.27, generationStdDev: 0.27 }),
  seed({ productId: 'amd-instinct-mi50-32', sourceDeviceName: 'AMD Instinct MI50 32GB', backend: 'ROCm', engineCommit: '97d5117', prompt: 1057.24, promptStdDev: 0.53, generation: 98.95, generationStdDev: 0.25 }),
  seed({ productId: 'amd-radeon-ai-pro-r9700', sourceDeviceName: 'AMD Radeon AI PRO R9700', backend: 'ROCm', engineCommit: 'bd4ef13', prompt: 4443.54, promptStdDev: 339.25, generation: 93.84, generationStdDev: 0.26 }),
  seed({ productId: 'nvidia-rtx-4070', sourceDeviceName: 'NVIDIA GeForce RTX 4070', backend: 'Vulkan', engineCommit: '9a48399', prompt: 3179.37, promptStdDev: 46.16, generation: 92.29, generationStdDev: 0.28, notes: 'Accepted no-Flash-Attention Vulkan scoreboard run; backend and commit remain visible.' }),
  seed({ productId: 'amd-instinct-mi60', sourceDeviceName: 'AMD Instinct MI60', backend: 'ROCm', engineCommit: '504af20', prompt: 1289.11, promptStdDev: 0.62, generation: 91.46, generationStdDev: 0.13 }),
  seed({ productId: 'nvidia-rtx-5060-ti-16', sourceDeviceName: 'NVIDIA GeForce RTX 5060 Ti 16GB', backend: 'CUDA', engineCommit: '89d10295', prompt: 3737.25, promptStdDev: 6.79, generation: 90.94, generationStdDev: 0.02 }),
  seed({ productId: 'nvidia-rtx-3060', sourceDeviceName: 'NVIDIA GeForce RTX 3060 12GB', backend: 'CUDA', engineCommit: 'baa9255', prompt: 2137.50, promptStdDev: 10.12, generation: 75.57, generationStdDev: 0.07 }),
  seed({ productId: 'amd-radeon-pro-v620', sourceDeviceName: 'AMD Radeon PRO V620', backend: 'ROCm', engineCommit: '5c0eb5e', prompt: 1803.65, promptStdDev: 2.54, generation: 74.66, generationStdDev: 0.01 }),
  seed({ productId: 'intel-arc-b580', sourceDeviceName: 'Intel Arc B580', backend: 'Vulkan', engineCommit: '7f76692', prompt: 620.94, promptStdDev: 15.33, generation: 70.14, generationStdDev: 0.28 }),
  seed({ productId: 'nvidia-dgx-spark', sourceDeviceName: 'NVIDIA DGX Spark', backend: 'CUDA', engineCommit: '5acd455', prompt: 3062.31, promptStdDev: 11.02, generation: 57.21, generationStdDev: 0.06, notes: 'Exact fixed-control result for the complete DGX Spark system and its integrated GB10 GPU. It is retained under the 32 GB-or-greater capacity exception, but is not presented as a discrete graphics card.' }),
  seed({ productId: 'nvidia-tesla-p40', sourceDeviceName: 'NVIDIA Tesla P40', backend: 'CUDA', engineCommit: 'c76b420', prompt: 1007.42, promptStdDev: 1.23, generation: 54.74, generationStdDev: 0.07 }),
  seed({ productId: 'nvidia-tesla-m40-24', sourceDeviceName: 'NVIDIA Tesla M40 24GB', backend: 'CUDA', engineCommit: '97d5117', prompt: 282.65, promptStdDev: 0.15, generation: 38.04, generationStdDev: 0.02 }),
  seed({ productId: 'nvidia-tesla-k80', sourceDeviceName: 'NVIDIA Tesla K80 (one GPU)', backend: 'CUDA', engineCommit: '32732f2', prompt: 133.14, promptStdDev: 0.55, generation: 13.80, generationStdDev: 0.02, notes: 'One of the K80 board’s two GPUs was tested; its two 12 GB memory pools cannot be combined for one model process.' }),
];

// User catalog policy: below 100 tok/s on the fixed Llama 2 7B Q4_0
// single-stream control is excluded unless the card has at least 32 GB of
// addressable VRAM. The research records remain above so each exclusion stays
// auditable, but these rows are not seeded into the working catalog.
export const sub100TokensUnder32GbGpuIds = new Set([
  'nvidia-rtx-4070',
  'nvidia-rtx-5060-ti-16',
  'nvidia-rtx-3060',
  'intel-arc-b580',
  'nvidia-tesla-p40',
  'nvidia-tesla-m40-24',
  'nvidia-tesla-k80',
]);

export const userExcludedGpuIds = new Set([
  ...sub100TokensUnder32GbGpuIds,
  'nvidia-rtx-5090-d',
  'nvidia-rtx-5090-d-v2',
]);

export const llmBenchmarkSeeds = llmBenchmarkResearchSeeds
  .filter((result) => !userExcludedGpuIds.has(result.productId));

type ParallelSpec = GpuParallelProcessors;
const cuda = (count: number, sourceUrl: string): ParallelSpec => ({ count, label: 'CUDA cores', scope: 'per GPU', sourceUrl });
const stream = (count: number, sourceUrl: string): ParallelSpec => ({ count, label: 'stream processors', scope: 'per GPU', sourceUrl });

export const gpuParallelProcessors: Record<string, ParallelSpec> = {
  'nvidia-rtx-5090': cuda(21760, 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/'),
  'nvidia-rtx-5090-d': cuda(21760, 'https://www.nvidia.cn/geforce/news/rtx-50-series-graphics-cards-gpu-laptop-announcements/'),
  'nvidia-rtx-5090-d-v2': cuda(21760, 'https://www.nvidia.cn/geforce/graphics-cards/50-series/rtx-5090-d-v2/'),
  'nvidia-rtx-pro-6000-blackwell-maxq': cuda(24064, 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf'),
  'nvidia-rtx-pro-6000-blackwell-workstation': cuda(24064, 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf'),
  'nvidia-rtx-pro-6000-blackwell-server': cuda(24064, 'https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/'),
  'nvidia-rtx-pro-5000-blackwell-48': cuda(14080, 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-5000-blackwell/workstation-datasheet-blackwell-rtx-pro-5000-gtc25-spring-nvidia-3658700.pdf'),
  'nvidia-rtx-pro-5000-blackwell-72': cuda(14080, 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-5000-blackwell/workstation-datasheet-blackwell-rtx-pro-5000-gtc25-spring-nvidia-3658700.pdf'),
  'nvidia-rtx-pro-4500-blackwell': cuda(10496, 'https://www.nvidia.com/content/dam/en-zz/Solutions/data-center/rtx-pro-4500-blackwell/workstation-datasheet-blackwell-rtx-pro-4500-we-nvidia-us-5108623-web.pdf'),
  'nvidia-rtx-pro-4500-blackwell-server': cuda(10496, 'https://www.nvidia.com/en-us/data-center/rtx-pro-4500-blackwell-server-edition/'),
  'nvidia-rtx-pro-4000-blackwell-sff': cuda(8960, 'https://images.nvidia.com/aem-dam/Solutions/design-visualization/quadro-product-literature/workstation-datasheet-blackwell-rtx-pro-4000-sff-nvidia-us-4016700.pdf'),
  'nvidia-rtx-4080-super': cuda(10240, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-4080': cuda(9728, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-4070-ti-super': cuda(8448, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-4070-ti': cuda(7680, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-4070-super': cuda(7168, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-4070': cuda(5888, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-4060-ti-16': cuda(4352, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-4060-ti-8': cuda(4352, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-4060': cuda(3072, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-3080-ti': cuda(10240, 'https://www.nvidia.com/en-eu/geforce/graphics-cards/30-series/rtx-3080-3080ti/'),
  'nvidia-rtx-3080': cuda(8704, 'https://www.nvidia.com/en-eu/geforce/graphics-cards/30-series/rtx-3080-3080ti/'),
  'nvidia-rtx-3070-ti': cuda(6144, 'https://www.nvidia.com/en-us/geforce/news/rtx-3080-ti-3070-ti-graphics-cards/'),
  'nvidia-rtx-3070': cuda(5888, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-3060-ti': cuda(4864, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-3060': cuda(3584, 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs'),
  'nvidia-rtx-4090-d': cuda(14592, 'https://www.nvidia.cn/geforce/graphics-cards/40-series/rtx-4090-d/'),
  'nvidia-rtx-4090': cuda(16384, 'https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/'),
  'nvidia-rtx-5080': cuda(10752, 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/'),
  'nvidia-rtx-5070-ti': cuda(8960, 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/'),
  'nvidia-rtx-5060-ti-16': cuda(4608, 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/'),
  'nvidia-rtx-5060-ti-8': cuda(4608, 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/'),
  'nvidia-rtx-5060': cuda(3840, 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/'),
  'nvidia-rtx-5050': cuda(2560, 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5050/'),
  'nvidia-rtx-6000-ada': cuda(18176, 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf'),
  'nvidia-rtx-3090-ti': cuda(10752, 'https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/'),
  'nvidia-rtx-3090': cuda(10496, 'https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/'),
  'nvidia-l40': cuda(18176, 'https://www.nvidia.com/en-us/data-center/l40/'),
  'nvidia-rtx-a6000': cuda(10752, 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf'),
  'nvidia-rtx-pro-4000-blackwell': cuda(8960, 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/workstation-datasheet-blackwell-rtx-pro-4000-nvidia-3662515.pdf'),
  'nvidia-rtx-pro-2000-blackwell': cuda(4352, 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-2000/workstation-datasheet-blackwell-rtx-pro-2000-nvidia-us-4016661.pdf'),
  'nvidia-rtx-a5000': cuda(8192, 'https://www.nvidia.com/en-us/design-visualization/rtx-a5000/'),
  'nvidia-tesla-v100-pcie-32': cuda(5120, 'https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf'),
  'nvidia-tesla-v100s-pcie-32': cuda(5120, 'https://docs.nvidia.com/ai-enterprise/release-6/latest/infra-software/vgpu/reference/volta.html'),
  'nvidia-quadro-gv100': cuda(5120, 'https://www.nvidia.com/content/dam/en-zz/ja/Solutions/design-visualization/documents/quadro-pascal-gv100-a4-nv-623049-r11-hr_JP.pdf'),
  'nvidia-rtx-5000-ada': cuda(12800, 'https://www.nvidia.com/en-us/products/workstations/rtx-5000/'),
  'nvidia-tesla-m10': cuda(640, 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/solutions/resources/documents1/nvidia-m10-datasheet.pdf'),
  'nvidia-rtx-5070': cuda(6144, 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/'),
  'nvidia-a30': cuda(3584, 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a30/PB-10087-001_v02.pdf'),
  'nvidia-a40': cuda(10752, 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a40/nvidia-a40-datasheet.pdf'),
  'nvidia-quadro-rtx-6000': cuda(4608, 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/quadro-rtx-6000-us-nvidia-704093-r4-web.pdf'),
  'nvidia-quadro-rtx-8000': cuda(4608, 'https://www.nvidia.com/content/dam/en-zz/ja/Solutions/design-visualization/documents/quadro-rtx-8000-datasheet-a4-946977-r1-web_JP.pdf'),
  'nvidia-tesla-p40': cuda(3840, 'https://images.nvidia.com/content/tesla/pdf/Tesla-P40-Product-Brief.pdf'),
  'nvidia-tesla-m40-24': cuda(3072, 'https://images.nvidia.com/content/tesla/pdf/NVIDIA-Tesla-M40-Datasheet.pdf'),
  'nvidia-tesla-k80': cuda(2496, 'https://images.nvidia.com/content/pdf/kepler/Tesla-K80-BoardSpec-07317-001-v05.pdf'),
  'amd-rx-7900-xtx': stream(6144, 'https://www.amd.com/content/dam/amd/en/documents/partner-hub/radeon/amd-radeon-rx-7000-series-quick-reference-competitive.pdf'),
  'amd-instinct-mi210': stream(6656, 'https://www.amd.com/en/products/specifications/accelerators.html'),
  'amd-radeon-pro-w7900': stream(6144, 'https://www.amd.com/en/products/specifications/professional-graphics.html'),
  'amd-rx-9070': stream(3584, 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070.html'),
  'amd-instinct-mi100': stream(7680, 'https://www.amd.com/en/products/specifications/accelerators.html'),
  'amd-rx-9070-xt': stream(4096, 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070xt.html'),
  'amd-instinct-mi50-32': stream(3840, 'https://www.amd.com/en/products/specifications/accelerators.html'),
  'amd-radeon-ai-pro-r9700': stream(4096, 'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html'),
  'amd-instinct-mi60': stream(4096, 'https://www.amd.com/en/products/specifications/accelerators.html'),
  'amd-radeon-pro-v620': stream(4608, 'https://www.amd.com/en/products/accelerators/radeon-pro/amd-radeon-pro-v620.html'),
  'amd-firepro-w9100-32': stream(2816, 'https://www.amd.com/en/newsroom/press-releases/2016-4-14-amd-announces-world-s-first-professional-workstati.html'),
  'amd-firepro-s9170': stream(2816, 'https://ir.amd.com/news-events/press-releases/detail/624/amd-delivers-worlds-first-server-gpu-with-industry-leading-32gb-memory-for-high-performance-compute'),
  'amd-radeon-pro-duo-polaris': stream(2304, 'https://www.amd.com/en/newsroom/press-releases/2017-4-24-the-new-radeon-pro-duo-delivers-professional-grade.html'),
  'amd-radeon-pro-v340': stream(3584, 'https://www.amd.com/en/newsroom/press-releases/2018-8-26-new-amd-radeon-pro-v340-graphics-card-delivers-ac.html'),
  'amd-radeon-pro-w6800': stream(3840, 'https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w6800-datasheet.pdf'),
  'amd-radeon-pro-w7800-32': stream(4480, 'https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w7800-datasheet.pdf'),
  'amd-radeon-ai-pro-r9600': stream(3072, 'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9600.html'),
  'amd-radeon-ai-pro-r9600d': stream(3072, 'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9600d.html'),
  'amd-radeon-ai-pro-r9700s': stream(4096, 'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700s.html'),
  'intel-arc-b580': { count: 20, label: 'Xe cores', scope: 'per GPU', sourceUrl: 'https://www.intel.com/content/www/us/en/products/details/discrete-gpus/arc/desktop/b-series.html' },
};
