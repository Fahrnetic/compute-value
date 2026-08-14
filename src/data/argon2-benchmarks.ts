import type { Gpu, Product } from '../types';

export type Argon2Evidence =
  | 'measured-public'
  | 'measured-public-cluster'
  | 'measured-local'
  | 'hardware-qualified-cluster'
  | 'bandwidth-model';

export type Argon2BenchmarkSeed = {
  productId: string;
  hashesPerSecond: number;
  evidence: Argon2Evidence;
  uncertaintyPercent: number;
  benchmarkHardware: string;
  hashcatVersion: string;
  sourceName: string;
  sourceUrl: string;
  methodSourceUrl?: string;
  rationale: string;
};

export type Argon2Benchmark = Argon2BenchmarkSeed & {
  product: Gpu;
  hashesPerDay: number;
};

export const argon2ResearchDate = '2026-08-13';

export const argon2Profile = {
  mode: 34_000,
  name: 'Argon2id · RFC 9106 recommended profile',
  memoryKib: 65_536,
  timeCost: 3,
  parallelism: 1,
  sourceUrl: 'https://github.com/hashcat/hashcat/blob/v7.0.0/docs/releases_notes_v7.0.0.md#22-argon2',
} as const;

const pro6000Benchmark = 'https://gist.github.com/blurbdust/5f7c8e07f8b0015c187e69f438e2e664';
const rtx5060TiBenchmark = 'https://hashcat.net/forum/thread-13380.html';
const v100ProductBrief = 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-product-literature/Tesla-V100-PCIe-Product-Brief.pdf';
const fourV100Benchmark = 'https://www.onlinehashcrack.com/tools-benchmark-hashcat-nvidia-tesla-v100.php';
const cloudClusterBenchmark = 'https://www.reddit.com/r/Passwords/comments/1r9hzu9/i_built_a_cloud_gpu_lab_because_i_was_tired_of/';
const a100PcieBenchmark = 'https://gist.github.com/Chick3nman/d65bcd5c137626c0fcb05078bba9ca89';
const v100BcryptContest = 'https://www.openwall.com/lists/john-users/2019/05/12/1';
const v100ComputeBenchmark = 'https://pc2.github.io/PC2GPUBenchmarks.jl/dev/devices/v100_sxm2/';
const v100P2pBenchmark = 'https://www.reddit.com/r/homelab/comments/1vednru/nvidia_cuda_p2p_experiments_dual_tesla_v100/';
const v100LlmBenchmark = 'https://www.reddit.com/r/LocalLLaMA/comments/1ujhtl9/tesla_v100_16gb_local_llms_single_and_dual_nvlink/';
const directV100TailsBenchmark = 'https://openbenchmarking.org/result/2604160-NE-20260416419';
const v100VbiosIdentity = 'https://www.h3c.com/en/Support/Resource_Center/EN/Home/Public/00-Public/Technical_Documents/Developer_Documents/API_References/H3C_HDM_Re-13774/202401/2017521_294551_0.htm';
const redditV100OwnerLab = 'https://www.reddit.com/r/homelab/comments/1uvcyh9/24gb_vram_for_60_usd_i_did_a_ton_of_benchmarking/';
const johnArgon2GpuLaunch = 'https://www.openwall.com/lists/john-users/2024/01/23/4';
const v100Argon2EstimateAudit = 'https://pilcrowonpaper.com/blog/14';

// No direct public mode-34000 V100 result was found in the research pass. This
// planning point scales Hashcat's direct RTX 4090 result by published peak
// bandwidth: 1,703 H/s × 900 / 1,008 = 1,520.54 H/s. The intentionally wide
// band keeps architecture, clocks, driver/runtime, and kernel efficiency visible.
export const v100Argon2BandwidthEstimateHs = Math.round(1_703 * 900 / 1_008);

export const argon2BenchmarkSeeds: Argon2BenchmarkSeed[] = [
  {
    productId: 'nvidia-h200-nvl',
    hashesPerSecond: 4_050,
    evidence: 'hardware-qualified-cluster',
    uncertaintyPercent: 15,
    benchmarkHardware: '8 × NVIDIA H200 cluster; uploader did not disclose NVL versus SXM form factor',
    hashcatVersion: 'Hashcat version and backend not disclosed',
    sourceName: 'First-person eight-H200 cloud-cluster benchmark',
    sourceUrl: cloudClusterBenchmark,
    rationale: 'Direct 32,400 H/s aggregate mode-34000 result divided by eight GPUs. The H200 silicon is measured, but the source does not identify the board form factor, power limit, runtime, or whether the catalog’s H200 NVL variant was used; the ±15% qualification band is mandatory.',
  },
  {
    productId: 'nvidia-rtx-pro-6000-blackwell-server',
    hashesPerSecond: 2_716,
    evidence: 'measured-public',
    uncertaintyPercent: 0,
    benchmarkHardware: 'NVIDIA RTX PRO 6000 Blackwell Server Edition 96 GB',
    hashcatVersion: 'Hashcat v7.1.2 · CUDA 13.0',
    sourceName: 'Published RTX PRO 6000 Blackwell Server full benchmark',
    sourceUrl: pro6000Benchmark,
    rationale: 'Direct mode-34000 result. The run also reports that other processes consumed about 23.35 GB of device memory and Hashcat capped usable performance at 77.11%, so 2,716 H/s is the observed run rather than a clean-room ceiling.',
  },
  {
    productId: 'nvidia-rtx-5090',
    hashesPerSecond: 2_175,
    evidence: 'measured-public-cluster',
    uncertaintyPercent: 0,
    benchmarkHardware: '8 × NVIDIA GeForce RTX 5090',
    hashcatVersion: 'Hashcat mode 34000 · version and backend not disclosed',
    sourceName: 'First-person eight-RTX-5090 cloud-cluster benchmark',
    sourceUrl: cloudClusterBenchmark,
    rationale: 'Direct 17,400 H/s aggregate Argon2id m=65536, t=3 result divided by eight exact RTX 5090 cards. This is a per-GPU normalization of an exact multi-card measurement, not a single-card run.',
  },
  {
    productId: 'nvidia-rtx-4090',
    hashesPerSecond: 1_703,
    evidence: 'measured-public',
    uncertaintyPercent: 0,
    benchmarkHardware: 'NVIDIA GeForce RTX 4090',
    hashcatVersion: 'Hashcat v7.0.0 release benchmark',
    sourceName: 'Official Hashcat 7.0.0 Argon2 benchmark',
    sourceUrl: argon2Profile.sourceUrl,
    rationale: 'Direct official Hashcat result for Argon2id at m=65536, t=3, p=1.',
  },
  {
    productId: 'nvidia-tesla-v100-pcie-32',
    hashesPerSecond: v100Argon2BandwidthEstimateHs,
    evidence: 'bandwidth-model',
    uncertaintyPercent: 30,
    benchmarkHardware: 'Tesla V100 PCIe 32 GB planning model · no direct public mode-34000 upload found',
    hashcatVersion: 'Mode-34000 model anchored to Hashcat v7.0.0 RTX 4090 measurement',
    sourceName: 'Hashcat RTX 4090 anchor + NVIDIA V100 product brief',
    sourceUrl: argon2Profile.sourceUrl,
    methodSourceUrl: v100ProductBrief,
    rationale: `Modeled ${v100Argon2BandwidthEstimateHs.toLocaleString('en-US')} H/s as 1,703 × (900 GB/s V100 bandwidth ÷ 1,008 GB/s RTX 4090 bandwidth). The ±30% band is mandatory: this is a bandwidth-derived planning estimate, not a V100 measurement.`,
  },
  {
    productId: 'amd-rx-7900-xtx',
    hashesPerSecond: 1_367,
    evidence: 'measured-public',
    uncertaintyPercent: 0,
    benchmarkHardware: 'AMD Radeon RX 7900 XTX',
    hashcatVersion: 'Hashcat v7.0.0 release benchmark',
    sourceName: 'Official Hashcat 7.0.0 Argon2 benchmark',
    sourceUrl: argon2Profile.sourceUrl,
    rationale: 'Direct official Hashcat result for Argon2id at m=65536, t=3, p=1.',
  },
  {
    productId: 'nvidia-rtx-5060-ti-16',
    hashesPerSecond: 684,
    evidence: 'measured-public',
    uncertaintyPercent: 0,
    benchmarkHardware: 'NVIDIA GeForce RTX 5060 Ti 16 GB',
    hashcatVersion: 'Hashcat v7.1.2 · CUDA 13.0',
    sourceName: 'Hashcat forum RTX 5060 Ti 16 GB full benchmark',
    sourceUrl: rtx5060TiBenchmark,
    rationale: 'Direct mode-34000 result in a complete published Hashcat benchmark.',
  },
  {
    productId: 'nvidia-rtx-4070-super',
    hashesPerSecond: 662,
    evidence: 'measured-local',
    uncertaintyPercent: 0,
    benchmarkHardware: 'NVIDIA GeForce RTX 4070 SUPER 12 GB',
    hashcatVersion: 'Hashcat v7.1.2 · OpenCL 3.0 CUDA 13.3.80',
    sourceName: 'Local exact-profile benchmark · 2026-08-13',
    sourceUrl: argon2Profile.sourceUrl,
    rationale: 'Direct local mode-34000 measurement. Kept as an observed loaded-system point, not a universal board ceiling.',
  },
];

export const v100SeparateResearch = {
  directTailsLuks2Hs: 11,
  directTailsRawRunsHs: [11, 11, 11],
  directTailsHardware: 'Tesla V100 PCIe 16 GB',
  directTailsVramMib: 16_384,
  directTailsVbios: '88.00.1A.00.03',
  directTailsHashcatVersion: 'Hashcat v7.1.2 · CUDA 12.4.89',
  directTailsUploader: 'OpenBenchmarking user root',
  directTailsSourceUrl: directV100TailsBenchmark,
  directTailsHardwareIdentitySourceUrl: v100VbiosIdentity,
  directTailsConcurrencySourceUrl: 'https://github.com/hashcat/hashcat/blob/v7.1.2/src/modules/argon2_common.c#L45-L112',
  pcie32TailsStatus: 'No direct public Hashcat mode-34100 V100 32 GB result found',
  pcie32TailsCapacityModelHs: 22.7,
  pcie32TailsCapacityModelGuessesPerDay: 1_961_280,
  pcie32TailsCapacityModelUncertaintyPercent: 25,
  pcie32TailsCapacityModelLanes16Gb: 15,
  pcie32TailsCapacityModelLanes32Gb: 31,
  genericArgon2Status: 'No direct public Hashcat mode-34000 V100 result found',
  modeledGenericArgon2Hs: v100Argon2BandwidthEstimateHs,
  modeledUncertaintyPercent: 30,
  fourGpuHardware: '4 × Tesla V100-SXM2-16GB',
  fourGpuHashcatVersion: 'Hashcat v6.2.3',
  fourGpuBcryptCost5Hs: 318_900,
  fourGpuLuks1Hs: 89_446,
  fourGpuSourceUrl: fourV100Benchmark,
  eightGpuBcryptCost10Hs: 17_762,
  eightGpuBcryptCost10SourceUrl: v100BcryptContest,
  sxm2_32EmpiricalFp32Tflops: 15.5,
  sxm2_32EmpiricalFp64Tflops: 7.7,
  sxm2_32EmpiricalTensorFp16Tflops: 116.4,
  sxm2_32SustainedBandwidthGbS: 775.57,
  sxm2_32ComputeSourceUrl: v100ComputeBenchmark,
  dualPcie32P2pBidirectionalGbS: 25.49,
  dualPcie32HostStagedBidirectionalGbS: 9.23,
  dualPcie32P2pLatencyUs: 2.23,
  dualPcie32HostStagedLatencyUs: 16.29,
  dualPcie32P2pSourceUrl: v100P2pBenchmark,
  singleSxm2_16Gemma4_26bQ4TccTokensPerSecond: 99.8,
  dualSxm2_16Qwen36_35bShortPromptAggregateTokensPerSecond: 338.1,
  dualSxm2_16Qwen36_35bLongPromptAggregateTokensPerSecond: 174,
  dualSxm2_16LlmSourceUrl: v100LlmBenchmark,
  caveat: 'The four-GPU report predates Hashcat Argon2 support. Its bcrypt and LUKS1 results are direct measurements, but neither can substitute for mode 34000 or Tails LUKS2 mode 34100.',
} as const;

export type V100Argon2SourceAudit = {
  source: string;
  scope: string;
  finding: string;
  verdict: 'accepted-direct' | 'near-miss' | 'rejected-model';
  sourceUrl: string;
  notes: string;
};

export const v100Argon2SourceAudit: V100Argon2SourceAudit[] = [
  {
    source: 'OpenBenchmarking uploader “root”',
    scope: 'V100 + Argon2 · exact public run',
    finding: '11 H/s · Hashcat 7.1.2 mode 34100 · runs 11:11:11',
    verdict: 'accepted-direct',
    sourceUrl: directV100TailsBenchmark,
    notes: 'Raw metadata reports 16,384 MiB BAR1 and VBIOS 88.00.1A.00.03. OEM documentation maps that VBIOS to Tesla V100-PCIE-16GB. This is the direct V100 Argon2 result.',
  },
  {
    source: 'Reddit · eso_logic V100 owner lab',
    scope: 'V100 + Hashcat · wrong mode',
    finding: 'Owner tested a V100 16 GB; published Hashcat runner defaults to mode 1400 SHA-256',
    verdict: 'near-miss',
    sourceUrl: redditV100OwnerLab,
    notes: 'Useful first-person V100 evidence, but the Reddit post and linked runner do not publish mode 34000 or 34100. It is not counted as Argon2.',
  },
  {
    source: 'Openwall · John the Ripper GPU Argon2id launch',
    scope: 'Argon2id + GPU · wrong GPU/profile',
    finding: 'GTX 1080 · 302.9 p/s · m=65,536, t=4, p=2',
    verdict: 'near-miss',
    sourceUrl: johnArgon2GpuLaunch,
    notes: 'This proves the OpenCL Argon2id implementation was running on NVIDIA in January 2024, but the tested GPU was not a V100 and its parameters differ from both project controls.',
  },
  {
    source: 'Hashcat 7.0.0 release benchmark',
    scope: 'Mode 34000 · no V100 run',
    finding: 'RTX 4090 1,703 H/s · RX 7900 XTX 1,367 H/s',
    verdict: 'near-miss',
    sourceUrl: argon2Profile.sourceUrl,
    notes: 'Hashcat added the bridged Argon2 reference implementation in 2025. Its official comparison did not include V100, so older V100 full-benchmark posts cannot supply mode 34000.',
  },
  {
    source: 'Pilcrow V100 Argon2 comparison',
    scope: 'V100 number · explicitly estimated',
    finding: 'Derived from RTX 5090 results and memory bandwidth',
    verdict: 'rejected-model',
    sourceUrl: v100Argon2EstimateAudit,
    notes: 'The author clearly labels the V100 figure as an estimate. It is useful as a sanity check but is not promoted to measured evidence.',
  },
];

export type EnterpriseMemoryHardResearch = {
  hardware: string;
  vram: string;
  argon2Status: string;
  exactProfileResult?: string;
  olderDirectContext?: string;
  evidence: 'integrated-exact' | 'integrated-qualified' | 'older-direct' | 'unresolved-label' | 'profile-gap';
  sourceUrl?: string;
  notes: string;
};

export const enterpriseMemoryHardResearch: EnterpriseMemoryHardResearch[] = [
  {
    hardware: '8 × NVIDIA H200',
    vram: '141 GB each',
    argon2Status: 'Integrated as H200-family evidence',
    exactProfileResult: '32,400 H/s aggregate · 4,050 H/s/GPU',
    evidence: 'integrated-qualified',
    sourceUrl: cloudClusterBenchmark,
    notes: 'Direct mode-34000 cluster result. Board form factor, power, Hashcat version, and backend were not disclosed, so it is not an exact H200 NVL claim.',
  },
  {
    hardware: '8 × GeForce RTX 5090',
    vram: '32 GB each',
    argon2Status: 'Integrated exact cluster normalization',
    exactProfileResult: '17,400 H/s aggregate · 2,175 H/s/GPU',
    evidence: 'integrated-exact',
    sourceUrl: cloudClusterBenchmark,
    notes: 'Exact GPU identity and Argon2 m=65536, t=3 profile are disclosed; runtime and power configuration remain missing.',
  },
  {
    hardware: '4 × A100 PCIe 40 GB',
    vram: '40 GB each',
    argon2Status: 'No mode-34000 result; benchmark predates Argon2 support',
    olderDirectContext: 'bcrypt cost 5: 553.4 kH/s aggregate · LUKS1: 108.1 kH/s aggregate',
    evidence: 'older-direct',
    sourceUrl: a100PcieBenchmark,
    notes: 'Direct Hashcat v6.1.1 run. The author documented the PCIe cards’ 250 W cap; per-GPU LUKS1 ranged from 26,919 to 27,193 H/s.',
  },
  {
    hardware: '8 × “RTX 6000 S”',
    vram: 'Capacity not disclosed',
    argon2Status: 'Measured label unresolved; deliberately not mapped to a catalog SKU',
    exactProfileResult: '18,900 H/s aggregate · 2,362.5 H/s/GPU',
    evidence: 'unresolved-label',
    sourceUrl: cloudClusterBenchmark,
    notes: 'The first-person report is useful, but “RTX 6000 S” is not enough to distinguish RTX 6000 Ada, a server variant, or another provider label.',
  },
  {
    hardware: 'A100 80 GB · A800 40/80 GB · H100 80/94 GB',
    vram: '40–94 GB',
    argon2Status: 'Current exact-profile result still missing',
    evidence: 'profile-gap',
    notes: 'Older compact-hash results and official bandwidth specifications exist, but no direct public mode-34000 or mode-34100 upload survived the exact-profile screen.',
  },
  {
    hardware: 'L40 · L40S · RTX 6000 Ada 48 GB',
    vram: '48 GB',
    argon2Status: 'Current exact-profile result still missing',
    evidence: 'profile-gap',
    notes: 'These remain promising 48 GB targets. The ambiguous RTX 6000 S cluster row is not enough to assign any one of them a score.',
  },
];

export function buildArgon2Benchmarks(products: Product[]) {
  const productsById = new Map(products
    .filter((product): product is Gpu => product.category === 'gpu')
    .map((product) => [product.id, product]));

  return argon2BenchmarkSeeds.flatMap((seed): Argon2Benchmark[] => {
    const product = productsById.get(seed.productId);
    return product ? [{ ...seed, product, hashesPerDay: seed.hashesPerSecond * 86_400 }] : [];
  }).sort((a, b) => b.hashesPerSecond - a.hashesPerSecond || a.product.name.localeCompare(b.product.name));
}

export function argon2EvidenceLabel(evidence: Argon2Evidence) {
  if (evidence === 'measured-public') return 'Public exact';
  if (evidence === 'measured-public-cluster') return 'Exact cluster / GPU';
  if (evidence === 'measured-local') return 'Local exact';
  if (evidence === 'hardware-qualified-cluster') return 'Family cluster / GPU';
  return 'Bandwidth model';
}
