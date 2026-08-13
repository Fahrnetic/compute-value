import { optaneCpuPassMark } from './optane-cpus.js';
import { userExcludedGpuIds } from './llm-benchmarks.js';

export type BenchmarkWorkload = 'cpu-overall' | 'cpu-single-thread' | 'gpu-3d' | 'gpu-compute';
export type BenchmarkResultType = 'aggregate' | 'limited-sample';

export interface BenchmarkSeed {
  productId: string;
  benchmarkKey: 'passmark-cpu' | 'passmark-single-thread' | 'passmark-g3d' | 'geekbench-opencl';
  benchmarkName: string;
  benchmarkVersion: string;
  workload: BenchmarkWorkload;
  score: number;
  unit: 'points';
  higherIsBetter: true;
  resultType: BenchmarkResultType;
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  sampleCount?: number;
  sourceDeviceName: string;
  notes: string;
}

const observedAt = '2026-08-10';

// Single-socket aggregate results captured from PassMark's CPU Mega List.
const cpuPassMark = {
  'amd-ryzen-5-9600x': { cpuMark: 30095, singleThread: 4571, samples: 8687, sourceId: 6199, sourceName: 'AMD Ryzen 5 9600X' },
  'amd-ryzen-7-5700x3d': { cpuMark: 26303, singleThread: 2968, samples: 7914, sourceId: 5884, sourceName: 'AMD Ryzen 7 5700X3D' },
  'amd-ryzen-7-9700x': { cpuMark: 36969, singleThread: 4644, samples: 9311, sourceId: 6205, sourceName: 'AMD Ryzen 7 9700X' },
  'amd-ryzen-7-9800x3d': { cpuMark: 39939, singleThread: 4422, samples: 24984, sourceId: 6344, sourceName: 'AMD Ryzen 7 9800X3D' },
  'amd-ryzen-9-9950x3d': { cpuMark: 70109, singleThread: 4739, samples: 11295, sourceId: 6549, sourceName: 'AMD Ryzen 9 9950X3D' },
  'amd-threadripper-pro-3945wx': { cpuMark: 33411, singleThread: 2695, samples: 244, sourceId: 3845, sourceName: 'AMD Ryzen Threadripper PRO 3945WX' },
  'amd-threadripper-pro-3955wx': { cpuMark: 39829, singleThread: 2680, samples: 293, sourceId: 3846, sourceName: 'AMD Ryzen Threadripper PRO 3955WX' },
  'amd-threadripper-pro-3975wx': { cpuMark: 62404, singleThread: 2651, samples: 231, sourceId: 3851, sourceName: 'AMD Ryzen Threadripper PRO 3975WX' },
  'amd-threadripper-pro-3995wx': { cpuMark: 82363, singleThread: 2584, samples: 193, sourceId: 3837, sourceName: 'AMD Ryzen Threadripper PRO 3995WX' },
  'amd-threadripper-pro-5955wx': { cpuMark: 48809, singleThread: 3321, samples: 230, sourceId: 4767, sourceName: 'AMD Ryzen Threadripper PRO 5955WX' },
  'amd-threadripper-pro-5965wx': { cpuMark: 65886, singleThread: 3317, samples: 150, sourceId: 4768, sourceName: 'AMD Ryzen Threadripper PRO 5965WX' },
  'amd-threadripper-pro-5975wx': { cpuMark: 74889, singleThread: 3321, samples: 256, sourceId: 4776, sourceName: 'AMD Ryzen Threadripper PRO 5975WX' },
  'amd-threadripper-pro-5995wx': { cpuMark: 94831, singleThread: 3212, samples: 182, sourceId: 4764, sourceName: 'AMD Ryzen Threadripper PRO 5995WX' },
  'amd-threadripper-pro-7955wx': { cpuMark: 60042, singleThread: 4085, samples: 132, sourceId: 5730, sourceName: 'AMD Ryzen Threadripper PRO 7955WX' },
  'amd-threadripper-pro-7965wx': { cpuMark: 82209, singleThread: 4009, samples: 180, sourceId: 5731, sourceName: 'AMD Ryzen Threadripper PRO 7965WX' },
  'amd-threadripper-pro-7975wx': { cpuMark: 95578, singleThread: 3987, samples: 186, sourceId: 5729, sourceName: 'AMD Ryzen Threadripper PRO 7975WX' },
  'amd-threadripper-pro-7985wx': { cpuMark: 131843, singleThread: 3962, samples: 84, sourceId: 5732, sourceName: 'AMD Ryzen Threadripper PRO 7985WX' },
  'amd-threadripper-pro-7995wx': { cpuMark: 141091, singleThread: 3831, samples: 119, sourceId: 5726, sourceName: 'AMD Ryzen Threadripper PRO 7995WX' },
  'amd-threadripper-pro-9955wx': { cpuMark: 67035, singleThread: 4530, samples: 107, sourceId: 6803, sourceName: 'AMD Ryzen Threadripper PRO 9955WX' },
  'amd-threadripper-pro-9965wx': { cpuMark: 92584, singleThread: 4551, samples: 81, sourceId: 6804, sourceName: 'AMD Ryzen Threadripper PRO 9965WX' },
  'amd-threadripper-pro-9975wx': { cpuMark: 104902, singleThread: 4408, samples: 95, sourceId: 6799, sourceName: 'AMD Ryzen Threadripper PRO 9975WX' },
  'amd-threadripper-pro-9985wx': { cpuMark: 150071, singleThread: 4482, samples: 68, sourceId: 6807, sourceName: 'AMD Ryzen Threadripper PRO 9985WX' },
  'amd-threadripper-pro-9995wx': { cpuMark: 171200, singleThread: 4542, samples: 69, sourceId: 6693, sourceName: 'AMD Ryzen Threadripper PRO 9995WX' },
  'intel-core-i5-14600k': { cpuMark: 38402, singleThread: 4267, samples: 4179, sourceId: 5720, sourceName: 'Intel Core i5-14600K' },
  'intel-core-i7-14700k': { cpuMark: 51957, singleThread: 4455, samples: 8498, sourceId: 5719, sourceName: 'Intel Core i7-14700K' },
  'intel-core-ultra-7-265k': { cpuMark: 58593, singleThread: 4928, samples: 8122, sourceId: 6326, sourceName: 'Intel Core Ultra 7 265K' },
  'intel-core-ultra-9-285k': { cpuMark: 67264, singleThread: 5087, samples: 8268, sourceId: 6296, sourceName: 'Intel Core Ultra 9 285K' },
  ...optaneCpuPassMark,
} as const;

// G3D is a Windows graphics composite. It is useful for rendering/game context, not AI throughput.
const gpuPassMark = {
  'amd-instinct-mi60': { score: 14923, samples: 3, sourceId: 7375, sourceName: 'Radeon Instinct MI60' },
  'amd-radeon-ai-pro-r9700': { score: 26915, samples: 90, sourceId: 6850, sourceName: 'Radeon AI PRO R9700' },
  'amd-radeon-pro-v620': { score: 26519, samples: 3, sourceId: 8668, sourceName: 'Radeon Pro V620' },
  'amd-radeon-pro-v710': { score: 7298, samples: 4, sourceId: 5342, sourceName: 'Radeon PRO V710 MxGPU' },
  'amd-radeon-pro-w6800': { score: 20173, samples: 137, sourceId: 4411, sourceName: 'Radeon PRO W6800' },
  'amd-radeon-pro-w7800-32': { score: 27373, samples: 40, sourceId: 4836, sourceName: 'Radeon PRO W7800' },
  'amd-radeon-pro-w7900': { score: 27793, samples: 83, sourceId: 4833, sourceName: 'Radeon PRO W7900' },
  'amd-radeon-pro-w7900-dual-slot': { score: 13182, samples: 1, sourceId: 6835, sourceName: 'Radeon PRO W7900 Dual Slot' },
  'amd-radeon-pro-duo-polaris': { score: 8462, samples: 720, sourceId: 3575, sourceName: 'Radeon Pro Duo' },
  'amd-radeon-pro-v340': { score: 2853, samples: 1, sourceId: 4011, sourceName: 'Radeon Pro V340 MxGPU' },
  'amd-rx-7900-xtx': { score: 31445, samples: 11309, sourceId: 4644, sourceName: 'Radeon RX 7900 XTX' },
  'amd-rx-9070': { score: 25372, samples: 2736, sourceId: 5958, sourceName: 'Radeon RX 9070' },
  'amd-rx-9070-xt': { score: 26914, samples: 16120, sourceId: 5956, sourceName: 'Radeon RX 9070 XT' },
  'intel-arc-b580': { score: 16038, samples: 3567, sourceId: 5306, sourceName: 'Intel Arc B580' },
  'nvidia-a10': { score: 21687, samples: 3, sourceId: 4632, sourceName: 'NVIDIA A10' },
  'nvidia-a40': { score: 13900, samples: 8, sourceId: 4551, sourceName: 'NVIDIA A40' },
  'nvidia-rtx-3090': { score: 26506, samples: 17659, sourceId: 4284, sourceName: 'GeForce RTX 3090' },
  'nvidia-rtx-3090-ti': { score: 29256, samples: 3310, sourceId: 4524, sourceName: 'GeForce RTX 3090 Ti' },
  'nvidia-rtx-4090-d': { score: 30429, samples: 33, sourceId: 5012, sourceName: 'GeForce RTX 4090 D' },
  'nvidia-rtx-4090': { score: 38040, samples: 22094, sourceId: 4606, sourceName: 'GeForce RTX 4090' },
  'nvidia-rtx-5070': { score: 28652, samples: 21262, sourceId: 5940, sourceName: 'GeForce RTX 5070' },
  'nvidia-rtx-5070-ti': { score: 32346, samples: 19962, sourceId: 5878, sourceName: 'GeForce RTX 5070 Ti' },
  'nvidia-rtx-5080': { score: 35628, samples: 18986, sourceId: 5721, sourceName: 'GeForce RTX 5080' },
  'nvidia-rtx-5090-d': { score: 42042, samples: 59, sourceId: 5898, sourceName: 'GeForce RTX 5090 D' },
  'nvidia-rtx-5090-d-v2': { score: 32739, samples: 11, sourceId: 7099, sourceName: 'GeForce RTX 5090 D v2' },
  'nvidia-rtx-5090': { score: 38976, samples: 10215, sourceId: 5725, sourceName: 'GeForce RTX 5090' },
  'nvidia-l20': { score: 13430, samples: 1, sourceId: 6257, sourceName: 'nVidia L20' },
  'nvidia-l40': { score: 27355, samples: 2, sourceId: 4885, sourceName: 'nVidia L40' },
  'nvidia-l40s': { score: 21099, samples: 8, sourceId: 5017, sourceName: 'L40S' },
  'nvidia-quadro-gv100': { score: 18546, samples: 42, sourceId: 3919, sourceName: 'Quadro GV100' },
  'nvidia-quadro-m6000-24': { score: 11499, samples: 140, sourceId: 3544, sourceName: 'Quadro M6000 24GB' },
  'nvidia-quadro-p6000': { score: 15386, samples: 195, sourceId: 3597, sourceName: 'Quadro P6000' },
  'nvidia-quadro-rtx-6000': { score: 17694, samples: 284, sourceId: 4015, sourceName: 'Quadro RTX 6000' },
  'nvidia-quadro-rtx-8000': { score: 19589, samples: 90, sourceId: 4061, sourceName: 'Quadro RTX 8000' },
  'nvidia-rtx-4500-ada': { score: 28042, samples: 164, sourceId: 4958, sourceName: 'RTX 4500 Ada Generation' },
  'nvidia-rtx-5000-ada': { score: 30791, samples: 223, sourceId: 4935, sourceName: 'RTX 5000 Ada Generation' },
  'nvidia-rtx-5880-ada': { score: 25096, samples: 8, sourceId: 5146, sourceName: 'RTX 5880 Ada Generation' },
  'nvidia-rtx-6000-ada': { score: 28763, samples: 273, sourceId: 4768, sourceName: 'RTX 6000 Ada Generation' },
  'nvidia-rtx-a5000': { score: 22880, samples: 952, sourceId: 4390, sourceName: 'RTX A5000' },
  'nvidia-rtx-a5500': { score: 21192, samples: 58, sourceId: 4539, sourceName: 'RTX A5500' },
  'nvidia-rtx-a6000': { score: 22652, samples: 492, sourceId: 4337, sourceName: 'RTX A6000' },
  'nvidia-rtx-pro-4000-blackwell': { score: 28422, samples: 191, sourceId: 7095, sourceName: 'RTX PRO 4000 Blackwell' },
  'nvidia-rtx-pro-4000-blackwell-sff': { score: 23919, samples: 46, sourceId: 7025, sourceName: 'RTX PRO 4000 Blackwell SFF Edition' },
  'nvidia-rtx-pro-4500-blackwell': { score: 33360, samples: 121, sourceId: 6820, sourceName: 'RTX PRO 4500 Blackwell' },
  'nvidia-rtx-pro-5000-blackwell-48': { score: 31739, samples: 58, sourceId: 6999, sourceName: 'RTX PRO 5000 Blackwell' },
  'nvidia-rtx-pro-5000-blackwell-72': { score: 24310, samples: 4, sourceId: 7823, sourceName: 'RTX PRO 5000 72GB Blackwell' },
  'nvidia-rtx-pro-6000-blackwell-maxq': { score: 32437, samples: 124, sourceId: 6527, sourceName: 'RTX PRO 6000 Blackwell Max-Q Workstation Edition' },
  'nvidia-rtx-pro-6000-blackwell-server': { score: 27962, samples: 4, sourceId: 6962, sourceName: 'RTX PRO 6000 Blackwell Server Edition' },
  'nvidia-rtx-pro-6000-blackwell-workstation': { score: 37974, samples: 253, sourceId: 6307, sourceName: 'RTX PRO 6000 Blackwell Workstation Edition' },
  'nvidia-titan-rtx': { score: 19850, samples: 282, sourceId: 4029, sourceName: 'TITAN RTX' },
  'nvidia-tesla-k80': { score: 5754, samples: 22, sourceId: 4448, sourceName: 'Tesla K80' },
  'nvidia-tesla-m40-24': { score: 10641, samples: 5, sourceId: 4450, sourceName: 'Tesla M40 24GB' },
  'nvidia-tesla-p40': { score: 11596, samples: 24, sourceId: 4548, sourceName: 'Tesla P40' },
  'nvidia-tesla-v100-pcie-32': { score: 8260, samples: 1, sourceId: 4447, sourceName: 'Tesla V100-PCIE-32GB' },
} as const;

// Geekbench only publishes devices with at least five unique uploaded results on this chart.
const gpuGeekbenchOpenCl = {
  'amd-instinct-mi100': { score: 139035, sourceName: 'AMD Instinct MI100' },
  'amd-instinct-mi60': { score: 92488, sourceName: 'Radeon Instinct MI60' },
  'amd-radeon-ai-pro-r9700': { score: 119404, sourceName: 'AMD Radeon AI PRO R9700' },
  'amd-radeon-pro-v620': { score: 128580, sourceName: 'AMD Radeon PRO V620' },
  'amd-radeon-pro-v710': { score: 116460, sourceName: 'AMD Radeon PRO V710' },
  'amd-radeon-pro-w6800': { score: 121808, sourceName: 'AMD Radeon Pro W6800' },
  'amd-radeon-pro-w7900': { score: 84379, sourceName: 'AMD Radeon PRO W7900' },
  'amd-radeon-pro-w7900-dual-slot': { score: 219827, sourceName: 'AMD Radeon PRO W7900 Dual Slot' },
  'amd-radeon-pro-v340': { score: 54819, sourceName: 'Radeon Pro V340' },
  'amd-rx-7900-xtx': { score: 212840, sourceName: 'AMD Radeon RX 7900 XTX' },
  'amd-rx-9070': { score: 133000, sourceName: 'AMD Radeon RX 9070' },
  'amd-rx-9070-xt': { score: 172612, sourceName: 'AMD Radeon RX 9070 XT' },
  'intel-arc-b580': { score: 104236, sourceName: 'Intel(R) Arc(TM) B580 Graphics' },
  'nvidia-a10': { score: 159199, sourceName: 'NVIDIA A10' },
  'nvidia-a100-pcie-40': { score: 178627, sourceName: 'NVIDIA A100-PCIE-40GB' },
  'nvidia-a100-pcie-80': { score: 212501, sourceName: 'NVIDIA A100 80GB PCIe' },
  'nvidia-a16': { score: 32595, sourceName: 'NVIDIA A16' },
  'nvidia-a30': { score: 122511, sourceName: 'NVIDIA A30' },
  'nvidia-a40': { score: 149033, sourceName: 'A40' },
  'nvidia-a800-pcie-80': { score: 218302, sourceName: 'NVIDIA A800 80GB PCIe' },
  'nvidia-rtx-3090': { score: 174752, sourceName: 'NVIDIA GeForce RTX 3090' },
  'nvidia-rtx-3090-ti': { score: 171884, sourceName: 'NVIDIA GeForce RTX 3090 Ti' },
  'nvidia-rtx-4090-d': { score: 278621, sourceName: 'NVIDIA GeForce RTX 4090 D' },
  'nvidia-rtx-4090': { score: 254796, sourceName: 'NVIDIA GeForce RTX 4090' },
  'nvidia-rtx-5070': { score: 171907, sourceName: 'NVIDIA GeForce RTX 5070' },
  'nvidia-rtx-5070-ti': { score: 211989, sourceName: 'NVIDIA GeForce RTX 5070 Ti' },
  'nvidia-rtx-5080': { score: 234650, sourceName: 'NVIDIA GeForce RTX 5080' },
  'nvidia-rtx-5090-d': { score: 299096, sourceName: 'NVIDIA GeForce RTX 5090 D' },
  'nvidia-rtx-5090': { score: 334454, sourceName: 'NVIDIA GeForce RTX 5090' },
  'nvidia-h100-nvl': { score: 309790, sourceName: 'NVIDIA H100 NVL' },
  'nvidia-h100-pcie-80': { score: 277842, sourceName: 'NVIDIA H100 PCIe' },
  'nvidia-h200-nvl': { score: 334891, sourceName: 'NVIDIA H200 NVL' },
  'nvidia-l20': { score: 274276, sourceName: 'NVIDIA L20' },
  'nvidia-l40': { score: 330926, sourceName: 'NVIDIA L40' },
  'nvidia-l40s': { score: 330727, sourceName: 'NVIDIA L40S' },
  'nvidia-quadro-gv100': { score: 150004, sourceName: 'Quadro GV100' },
  'nvidia-quadro-m6000-24': { score: 40098, sourceName: 'Quadro M6000 24GB' },
  'nvidia-quadro-p6000': { score: 66382, sourceName: 'Quadro P6000' },
  'nvidia-quadro-rtx-6000': { score: 74179, sourceName: 'NVIDIA Quadro RTX 6000' },
  'nvidia-quadro-rtx-8000': { score: 125554, sourceName: 'NVIDIA Quadro RTX 8000' },
  'nvidia-rtx-4500-ada': { score: 160786, sourceName: 'NVIDIA RTX 4500 Ada Generation' },
  'nvidia-rtx-5880-ada': { score: 326898, sourceName: 'NVIDIA RTX 5880 Ada Generation' },
  'nvidia-rtx-a5000': { score: 157905, sourceName: 'RTX A5000' },
  'nvidia-rtx-a6000': { score: 193937, sourceName: 'RTX A6000' },
  'nvidia-rtx-pro-6000-blackwell-workstation': { score: 306524, sourceName: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition' },
  'nvidia-rtx-pro-6000d-blackwell-server': { score: 388405, sourceName: 'NVIDIA RTX 6000D' },
  'nvidia-titan-rtx': { score: 144858, sourceName: 'NVIDIA TITAN RTX' },
  'nvidia-tesla-m40-24': { score: 37439, sourceName: 'Tesla M40 24GB' },
  'nvidia-tesla-v100-pcie-32': { score: 168763, sourceName: 'Tesla V100-PCIE-32GB' },
  'nvidia-tesla-v100s-pcie-32': { score: 194415, sourceName: 'Tesla V100S-PCIE-32GB' },
} as const;

function passMarkUrl(kind: 'cpu' | 'gpu', sourceName: string, sourceId: number) {
  const host = kind === 'cpu' ? 'www.cpubenchmark.net/cpu.php?cpu=' : 'www.videocardbenchmark.net/gpu.php?gpu=';
  return `https://${host}${encodeURIComponent(sourceName)}&id=${sourceId}`;
}

const cpuBenchmarks = Object.entries(cpuPassMark).flatMap(([productId, result]): BenchmarkSeed[] => {
  const common = {
    productId, benchmarkVersion: 'PerformanceTest 11 chart', unit: 'points' as const,
    higherIsBetter: true as const, resultType: result.samples < 5 ? 'limited-sample' as const : 'aggregate' as const,
    sourceName: 'PassMark CPU Benchmarks', sourceUrl: passMarkUrl('cpu', result.sourceName, result.sourceId),
    observedAt, sampleCount: result.samples, sourceDeviceName: result.sourceName,
  };
  return [
    { ...common, benchmarkKey: 'passmark-cpu', benchmarkName: 'PassMark CPU Mark', workload: 'cpu-overall', score: result.cpuMark,
      notes: 'Eight-test all-thread composite from single-socket submissions; higher is better.' },
    { ...common, benchmarkKey: 'passmark-single-thread', benchmarkName: 'PassMark Single Thread', workload: 'cpu-single-thread', score: result.singleThread,
      notes: 'Single-thread composite of floating point, string sorting, and compression tests; higher is better.' },
  ];
});

const gpu3dBenchmarks = Object.entries(gpuPassMark).map(([productId, result]): BenchmarkSeed => ({
  productId, benchmarkKey: 'passmark-g3d', benchmarkName: 'PassMark G3D Mark',
  benchmarkVersion: 'PerformanceTest chart', workload: 'gpu-3d', score: result.score,
  unit: 'points', higherIsBetter: true,
  resultType: result.samples < 5 ? 'limited-sample' : 'aggregate',
  sourceName: 'PassMark Video Card Benchmarks', sourceUrl: passMarkUrl('gpu', result.sourceName, result.sourceId),
  observedAt, sampleCount: result.samples, sourceDeviceName: result.sourceName,
  notes: result.sourceName.includes('MxGPU')
    ? 'Source device is an MxGPU/virtualized presentation; do not compare it as a bare-metal AI result.'
    : 'Windows DirectX graphics composite; useful for 3D context, not a direct AI inference benchmark.',
}));

const gpuComputeBenchmarks = Object.entries(gpuGeekbenchOpenCl).map(([productId, result]): BenchmarkSeed => ({
  productId, benchmarkKey: 'geekbench-opencl', benchmarkName: 'Geekbench 7 OpenCL',
  benchmarkVersion: 'Geekbench 7', workload: 'gpu-compute', score: result.score,
  unit: 'points', higherIsBetter: true, resultType: 'aggregate',
  sourceName: 'Geekbench Browser OpenCL Chart', sourceUrl: 'https://browser.geekbench.com/opencl-benchmarks',
  observedAt, sourceDeviceName: result.sourceName,
  notes: 'Cross-platform OpenCL compute composite. The chart requires at least five unique uploaded results per reported device name.',
}));

export const benchmarkSeeds: BenchmarkSeed[] = [...cpuBenchmarks, ...gpu3dBenchmarks, ...gpuComputeBenchmarks]
  .filter((result) => !userExcludedGpuIds.has(result.productId));
