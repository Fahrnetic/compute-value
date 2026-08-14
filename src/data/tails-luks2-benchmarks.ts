import type { Gpu, Product } from '../types';

export type TailsLuks2Evidence =
  | 'measured-public'
  | 'measured-public-mean'
  | 'measured-local'
  | 'hardware-qualified';

export type TailsLuks2BenchmarkSeed = {
  productId: string;
  guessesPerSecond: number;
  rfcArgon2Hs?: number;
  evidence: TailsLuks2Evidence;
  uncertaintyPercent: number;
  sampleCount?: number;
  reportedSpreadHs?: number;
  benchmarkHardware: string;
  hashcatVersion: string;
  sourceName: string;
  sourceUrl: string;
  rationale: string;
};

export type TailsLuks2Benchmark = TailsLuks2BenchmarkSeed & {
  product: Gpu;
  guessesPerDay: number;
};

export const tailsLuks2ResearchDate = '2026-08-13';

export const tailsLuks2Profile = {
  mode: 34100,
  name: 'LUKS v2 argon2id + SHA-256 + AES-XTS-512',
  memoryKib: 1_048_576,
  timeCost: 4,
  parallelism: 4,
  iterationsShownByHashcat: 16,
  sourceUrl: 'https://github.com/hashcat/hashcat/blob/v7.1.2/src/modules/module_34100.c',
  tailsSourceUrl: 'https://gitlab.tails.boum.org/tails/tails/-/issues/20000',
} as const;

const rtx5060TiBenchmark = 'https://hashcat.net/forum/thread-13380.html';
const pro6000Benchmark = 'https://gist.github.com/blurbdust/5f7c8e07f8b0015c187e69f438e2e664';
const openBenchmarkingProfile = 'https://openbenchmarking.org/performance/test/pts/hashcat/0b5d0c3db0c27a2a6e025024f7e154886882d515';
const openBenchmarkingPro6000 = 'https://openbenchmarking.org/result/2604284-NE-RTXPRO60009';

export const tailsLuks2BenchmarkSeeds: TailsLuks2BenchmarkSeed[] = [
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-workstation',
    guessesPerSecond: 75,
    evidence: 'measured-public',
    uncertaintyPercent: 0,
    sampleCount: 3,
    reportedSpreadHs: 0,
    benchmarkHardware: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition 96 GB',
    hashcatVersion: 'Hashcat v7.1.2 · Phoronix Test Suite 10.8.5',
    sourceName: 'OpenBenchmarking RTX PRO 6000 workstation result',
    sourceUrl: openBenchmarkingPro6000,
    rationale: 'Direct three-run mode-34100 mean on the exact 96 GB workstation board: 75 H/s with reported standard error ±0.00 H/s.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-maxq',
    guessesPerSecond: 71,
    evidence: 'measured-public-mean',
    uncertaintyPercent: 1.41,
    sampleCount: 7,
    reportedSpreadHs: 1,
    benchmarkHardware: 'NVIDIA RTX PRO 6000 Blackwell Max-Q Workstation Edition 96 GB',
    hashcatVersion: 'Hashcat v7.1.2 · OpenBenchmarking public-result aggregate',
    sourceName: 'OpenBenchmarking component aggregate',
    sourceUrl: openBenchmarkingProfile,
    rationale: 'Exact-model public mean across seven compatible mode-34100 results: 71 ±1 H/s. A separately published HP Z6 run measured 72 H/s.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-server',
    guessesPerSecond: 55,
    rfcArgon2Hs: 2_716,
    evidence: 'measured-public',
    uncertaintyPercent: 0,
    benchmarkHardware: 'NVIDIA RTX PRO 6000 Blackwell Server Edition 96 GB',
    hashcatVersion: 'Hashcat v7.1.2 · CUDA 13.0',
    sourceName: 'Published RTX PRO 6000 Blackwell Server full benchmark',
    sourceUrl: pro6000Benchmark,
    rationale: 'Direct mode-34100 result. The run reports 55 H/s against Hashcat’s built-in 1 GiB, t=4, p=4 LUKS2 reference header.',
  },
  {
    productId: 'nvidia-rtx-pro-4500-blackwell',
    guessesPerSecond: 26,
    evidence: 'measured-public-mean',
    uncertaintyPercent: 0,
    sampleCount: 3,
    benchmarkHardware: 'NVIDIA RTX PRO 4500 Blackwell 32 GB',
    hashcatVersion: 'Hashcat v7.1.2 · OpenBenchmarking public-result aggregate',
    sourceName: 'OpenBenchmarking component aggregate',
    sourceUrl: openBenchmarkingProfile,
    rationale: 'Exact-model public mean across three compatible mode-34100 results: 26 H/s.',
  },
  {
    productId: 'nvidia-rtx-5060-ti-16',
    guessesPerSecond: 13,
    rfcArgon2Hs: 684,
    evidence: 'measured-public',
    uncertaintyPercent: 0,
    benchmarkHardware: 'NVIDIA GeForce RTX 5060 Ti 16 GB',
    hashcatVersion: 'Hashcat v7.1.2 · CUDA 13.0',
    sourceName: 'Hashcat forum RTX 5060 Ti 16 GB full benchmark',
    sourceUrl: rtx5060TiBenchmark,
    rationale: 'Direct mode-34100 result. The same run reports 684 H/s in generic Argon2 mode 34000 and 13 H/s on the 1 GiB LUKS2 reference header.',
  },
  {
    productId: 'nvidia-rtx-5080',
    guessesPerSecond: 13,
    evidence: 'measured-public-mean',
    uncertaintyPercent: 0,
    sampleCount: 3,
    benchmarkHardware: 'Gigabyte NVIDIA GeForce RTX 5080 16 GB',
    hashcatVersion: 'Hashcat v7.1.2 · OpenBenchmarking public-result aggregate',
    sourceName: 'OpenBenchmarking component aggregate',
    sourceUrl: openBenchmarkingProfile,
    rationale: 'Board-partner RTX 5080 public mean across three compatible mode-34100 results: 13 H/s. Stored against the RTX 5080 GPU family, not a Founders Edition cooler-specific claim.',
  },
  {
    productId: 'nvidia-rtx-4070-super',
    guessesPerSecond: 8,
    rfcArgon2Hs: 662,
    evidence: 'measured-local',
    uncertaintyPercent: 0,
    benchmarkHardware: 'NVIDIA GeForce RTX 4070 SUPER 12 GB',
    hashcatVersion: 'Hashcat v7.1.2 · OpenCL 3.0 CUDA 13.3.80',
    sourceName: 'Local exact-profile benchmark · 2026-08-13',
    sourceUrl: tailsLuks2Profile.sourceUrl,
    rationale: 'Direct local mode-34100 result against a disposable matching header. Hashcat reported desktop memory pressure and a 53.49% concurrency cap, so this is an observed loaded-system result, not a clean-room ceiling.',
  },
];

export function buildTailsLuks2Benchmarks(products: Product[]) {
  const productsById = new Map(products
    .filter((product): product is Gpu => product.category === 'gpu')
    .map((product) => [product.id, product]));

  return tailsLuks2BenchmarkSeeds.flatMap((seed): TailsLuks2Benchmark[] => {
    const product = productsById.get(seed.productId);
    return product ? [{ ...seed, product, guessesPerDay: seed.guessesPerSecond * 86_400 }] : [];
  }).sort((a, b) => b.guessesPerSecond - a.guessesPerSecond || a.product.name.localeCompare(b.product.name));
}

export function tailsLuks2EvidenceLabel(evidence: TailsLuks2Evidence) {
  if (evidence === 'measured-public') return 'Public exact';
  if (evidence === 'measured-public-mean') return 'Public mean';
  if (evidence === 'measured-local') return 'Local exact';
  return 'Hardware qualified';
}
