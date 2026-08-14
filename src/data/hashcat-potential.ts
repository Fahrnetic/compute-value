import type { Gpu, Product } from '../types';
import { gpuParallelProcessors } from '../../server/llm-benchmarks';

export type HashcatMetric = 'ntlm' | 'bcrypt';
export type HashcatEvidence = 'measured-exact' | 'same-silicon-proxy' | 'architecture-estimate';

type BenchmarkProfile = {
  ntlmGhS: number;
  bcryptKhS: number;
  hardware: string;
  hashcatVersion: string;
  sourceName: string;
  sourceUrl: string;
};

type PotentialPlan = {
  profile: keyof typeof benchmarkProfiles;
  factor: number;
  evidence: HashcatEvidence;
  rationale: string;
};

export type HashcatPotential = {
  product: Gpu;
  ntlmGhS: number;
  bcryptKhS: number;
  evidence: HashcatEvidence;
  uncertaintyPercent: number;
  benchmarkHardware: string;
  hashcatVersion: string;
  sourceName: string;
  sourceUrl: string;
  rationale: string;
};

export const hashcatResearchDate = '2026-08-13';

export const hashcatMetricCopy: Record<HashcatMetric, {
  label: string;
  mode: number;
  unit: 'GH/s' | 'kH/s';
  description: string;
}> = {
  ntlm: {
    label: 'NTLM fast hash',
    mode: 1000,
    unit: 'GH/s',
    description: 'Billions of benchmark candidates per second. This is the broadest fast-hash comparison, not a prediction for modern password storage.',
  },
  bcrypt: {
    label: 'bcrypt cost 5',
    mode: 3200,
    unit: 'kH/s',
    description: 'Thousands of benchmark candidates per second at Hashcat mode 3200 / 32 iterations. It shows how sharply a deliberately slow KDF changes the ordering and scale.',
  },
};

const openBenchmarkingBlackwell = 'https://openbenchmarking.org/result/2605219-PTS-RTXPRO1304';
const dosoos = (file: string) => `https://github.com/dosoos/hashcat_speeds/blob/main/benchmarks/${file}`;

const benchmarkProfiles = {
  rtx5090: {
    ntlmGhS: 340.1,
    bcryptKhS: 304.8,
    hardware: 'GeForce RTX 5090',
    hashcatVersion: 'Hashcat version not disclosed by source',
    sourceName: 'Specops Software GPU comparison',
    sourceUrl: 'https://specopssoft.com/blog/gpu-password-cracking-nvidia-amd/',
  },
  rtx5080: {
    ntlmGhS: 156.6,
    bcryptKhS: 122,
    hardware: 'GeForce RTX 5080 16 GB',
    hashcatVersion: 'Hashcat v6.2.6-851-g6716447df',
    sourceName: 'PenguinKeeper7 RTX 5080 benchmark',
    sourceUrl: 'https://gist.github.com/PenguinKeeper7/c99c43780f2298d8c1a4d755416acf23',
  },
  rtx5070Ti: {
    ntlmGhS: 137.8,
    bcryptKhS: 107.4,
    hardware: 'GeForce RTX 5070 Ti 16 GB',
    hashcatVersion: 'Hashcat v6.2.6-851-g6716447df',
    sourceName: 'minanagehsalalma RTX 5070 Ti benchmark',
    sourceUrl: 'https://gist.github.com/minanagehsalalma/68ba330bf5fd771bad537df27d7d25eb',
  },
  rtx5070: {
    ntlmGhS: 92.3175,
    bcryptKhS: 85.674,
    hardware: 'GeForce RTX 5070 12 GB',
    hashcatVersion: 'Hashcat v7.0.0',
    sourceName: 'felipemarinho97 RTX 5070 benchmark',
    sourceUrl: 'https://gist.github.com/felipemarinho97/d256b55d586fa2fb5d7753b62878fd54',
  },
  rtx4080Super: {
    ntlmGhS: 165.1,
    bcryptKhS: 121.2,
    hardware: 'GeForce RTX 4080 SUPER 16 GB',
    hashcatVersion: 'Hashcat v6.2.6',
    sourceName: 'jgoosey RTX 4080 SUPER benchmark',
    sourceUrl: 'https://gist.github.com/jgoosey/d9a79d90f88a23537282e3409f84dae4',
  },
  v100Sxm2: {
    ntlmGhS: 99.7688,
    bcryptKhS: 78.651,
    hardware: 'Tesla V100 SXM2 16 GB (per GPU from 4-GPU run)',
    hashcatVersion: 'Hashcat v6.2.6',
    sourceName: 'dosoos/hashcat_speeds V100 run',
    sourceUrl: dosoos('TESLA_V100_16GB_x4.txt'),
  },
  rtx2080Ti: {
    ntlmGhS: 94.5631,
    bcryptKhS: 50.212,
    hardware: 'GeForce RTX 2080 Ti',
    hashcatVersion: 'Hashcat benchmark output; source file preserves harness',
    sourceName: 'dosoos/hashcat_speeds RTX 2080 Ti run',
    sourceUrl: dosoos('RTX2080Ti.txt'),
  },
  quadroRtx6000: {
    ntlmGhS: 93.6377,
    bcryptKhS: 28.659,
    hardware: 'Quadro RTX 6000 24 GB',
    hashcatVersion: 'Hashcat v6.1.1',
    sourceName: 'clem9669 Quadro RTX 6000 benchmark',
    sourceUrl: 'https://gist.github.com/clem9669/458ed171d9a41a494348bbf2478b39ce',
  },
  rtx3090: {
    ntlmGhS: 121.2,
    bcryptKhS: 97.176,
    hardware: 'GeForce RTX 3090',
    hashcatVersion: 'Hashcat benchmark output; source file preserves harness',
    sourceName: 'dosoos/hashcat_speeds RTX 3090 run',
    sourceUrl: dosoos('RTX3090.txt'),
  },
  rtx4090: {
    ntlmGhS: 288.5,
    bcryptKhS: 184.3,
    hardware: 'GeForce RTX 4090 24 GB',
    hashcatVersion: 'Hashcat v6.2.6-class benchmark output',
    sourceName: 'dosoos/hashcat_speeds RTX 4090 run',
    sourceUrl: dosoos('RTX4090.txt'),
  },
  rtx4060: {
    ntlmGhS: 48.8309,
    bcryptKhS: 38.937,
    hardware: 'GeForce RTX 4060',
    hashcatVersion: 'Hashcat v6.2.6-class benchmark output',
    sourceName: 'dosoos/hashcat_speeds RTX 4060 run',
    sourceUrl: dosoos('RTX4060.txt'),
  },
  a100Pcie40: {
    ntlmGhS: 120.2,
    bcryptKhS: 138.4,
    hardware: 'Tesla A100 PCIe 40 GB (per GPU from 4-GPU run)',
    hashcatVersion: 'Hashcat v6.1.1',
    sourceName: 'dosoos/hashcat_speeds A100 run',
    sourceUrl: dosoos('TESLA_A100.txt'),
  },
  a800Pcie80: {
    ntlmGhS: 115.9,
    bcryptKhS: 137.9,
    hardware: 'A800 PCIe 80 GB',
    hashcatVersion: 'Hashcat v6.2.6',
    sourceName: 'dosoos/hashcat_speeds A800 run',
    sourceUrl: dosoos('A800-80G-PCIE.txt'),
  },
  rtx6000Ada: {
    ntlmGhS: 219.1667,
    bcryptKhS: 262.683,
    hardware: 'RTX 6000 Ada 48 GB',
    hashcatVersion: 'Hashcat v7.1.2 / pts/hashcat 1.3.1',
    sourceName: 'OpenBenchmarking RTX PRO Blackwell comparison',
    sourceUrl: openBenchmarkingBlackwell,
  },
  l40s: {
    ntlmGhS: 258.8,
    bcryptKhS: 177,
    hardware: 'NVIDIA L40S 48 GB',
    hashcatVersion: 'Hashcat v6.2.6-851',
    sourceName: 'Published L40S full benchmark',
    sourceUrl: 'https://gist.github.com/bigpick/5d2478209ba820a450148256ae708de0',
  },
  pro4500Blackwell: {
    ntlmGhS: 162.8,
    bcryptKhS: 134.933,
    hardware: 'RTX PRO 4500 Blackwell 32 GB',
    hashcatVersion: 'Hashcat v7.1.2 / pts/hashcat 1.3.1',
    sourceName: 'OpenBenchmarking RTX PRO Blackwell comparison',
    sourceUrl: openBenchmarkingBlackwell,
  },
  pro5000Blackwell48: {
    ntlmGhS: 219.7833,
    bcryptKhS: 166.567,
    hardware: 'RTX PRO 5000 Blackwell 48 GB',
    hashcatVersion: 'Hashcat v7.1.2 / pts/hashcat 1.3.1',
    sourceName: 'OpenBenchmarking RTX PRO Blackwell comparison',
    sourceUrl: openBenchmarkingBlackwell,
  },
  pro6000BlackwellWs: {
    ntlmGhS: 414.15,
    bcryptKhS: 317.617,
    hardware: 'RTX PRO 6000 Blackwell Workstation Edition 96 GB / 600 W',
    hashcatVersion: 'Hashcat v7.1.2 / pts/hashcat 1.3.1',
    sourceName: 'OpenBenchmarking RTX PRO Blackwell comparison',
    sourceUrl: openBenchmarkingBlackwell,
  },
  pro6000BlackwellServer: {
    ntlmGhS: 308,
    bcryptKhS: 265.8,
    hardware: 'RTX PRO 6000 Blackwell Server Edition 96 GB',
    hashcatVersion: 'Hashcat v7.1.2',
    sourceName: 'Published RTX PRO 6000 Server full benchmark',
    sourceUrl: 'https://gist.github.com/blurbdust/5f7c8e07f8b0015c187e69f438e2e664',
  },
  h100Pcie: {
    ntlmGhS: 158.6,
    bcryptKhS: 251.5,
    hardware: 'H100 PCIe 80 GB',
    hashcatVersion: 'Hashcat v6.2.6',
    sourceName: 'dosoos/hashcat_speeds H100 run',
    sourceUrl: dosoos('H100PCIE.txt'),
  },
  h200: {
    ntlmGhS: 218.2,
    bcryptKhS: 275,
    hardware: 'NVIDIA H200 (source does not disclose PCIe/SXM/NVL harness)',
    hashcatVersion: 'Hashcat version not disclosed by source',
    sourceName: 'Specops Software GPU comparison',
    sourceUrl: 'https://specopssoft.com/blog/gpu-password-cracking-nvidia-amd/',
  },
  hawaii290x: {
    ntlmGhS: 21.3423,
    bcryptKhS: 7.193,
    hardware: 'Radeon R9 290X / Hawaii',
    hashcatVersion: 'oclHashcat v1.36',
    sourceName: 'Hashcat forum R9 290X benchmark',
    sourceUrl: 'https://hashcat.net/forum/thread-4418-post-25199.html',
  },
  polarisRx480: {
    ntlmGhS: 20.9911,
    bcryptKhS: 8.78,
    hardware: 'Radeon RX 480 / Polaris',
    hashcatVersion: 'Hashcat v3.00-era benchmark',
    sourceName: 'Hashcat forum RX 480 benchmark',
    sourceUrl: 'https://hashcat.net/forum/thread-5557-page-2.html',
  },
  radeonVii: {
    ntlmGhS: 55.1553,
    bcryptKhS: 25.53,
    hardware: 'Radeon VII / Vega 20',
    hashcatVersion: 'Hashcat v5.1.0',
    sourceName: 'RootUsers Radeon VII benchmark',
    sourceUrl: 'https://www.rootusers.com/amd-radeon-vii-hashcat-benchmark/',
  },
  rx6800xt: {
    ntlmGhS: 85.3561,
    bcryptKhS: 58.177,
    hardware: 'Radeon RX 6800 XT / Navi 21',
    hashcatVersion: 'Hashcat v6.1.1-era benchmark',
    sourceName: 'Published RX 6800 XT full benchmark',
    sourceUrl: 'https://gist.github.com/epixoip/99085955a1145ff61ec83512a50421a7',
  },
  w7900: {
    ntlmGhS: 86.66072,
    bcryptKhS: 96.802,
    hardware: 'Radeon PRO W7900 48 GB',
    hashcatVersion: 'Hashcat v7.1.2 / pts/hashcat 1.3.1',
    sourceName: 'OpenBenchmarking RTX PRO Blackwell comparison',
    sourceUrl: openBenchmarkingBlackwell,
  },
  r9700: {
    ntlmGhS: 86.62532,
    bcryptKhS: 69.472,
    hardware: 'Radeon AI PRO R9700 32 GB',
    hashcatVersion: 'Hashcat v7.1.2 / pts/hashcat 1.3.1',
    sourceName: 'OpenBenchmarking RTX PRO Blackwell comparison',
    sourceUrl: openBenchmarkingBlackwell,
  },
  mi300x: {
    ntlmGhS: 268.5,
    bcryptKhS: 142.3,
    hardware: 'AMD Instinct MI300X 192 GB',
    hashcatVersion: 'Hashcat version not disclosed by source',
    sourceName: 'Specops Software GPU comparison',
    sourceUrl: 'https://specopssoft.com/blog/gpu-password-cracking-nvidia-amd/',
  },
} as const satisfies Record<string, BenchmarkProfile>;

const plans: Record<string, PotentialPlan> = {
  'nvidia-rtx-5080': { profile: 'rtx5080', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-rtx-5070-ti': { profile: 'rtx5070Ti', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-rtx-5070': { profile: 'rtx5070', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-rtx-4080-super': { profile: 'rtx4080Super', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-rtx-3090': { profile: 'rtx3090', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement; included as an explicit 24 GB owner/cluster baseline.' },
  'nvidia-rtx-4090': { profile: 'rtx4090', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement; included as an explicit 24 GB high-throughput baseline.' },
  'nvidia-rtx-5090': { profile: 'rtx5090', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-quadro-gv100': { profile: 'v100Sxm2', factor: 0.92, evidence: 'same-silicon-proxy', rationale: 'Full GV100 silicon at a 250 W PCIe/workstation envelope, normalized from the 300 W SXM2 run.' },
  'nvidia-quadro-rtx-6000': { profile: 'quadroRtx6000', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-quadro-rtx-6000-server': { profile: 'quadroRtx6000', factor: 0.9, evidence: 'same-silicon-proxy', rationale: 'Exact workstation silicon adjusted for the passive 250 W server board.' },
  'nvidia-quadro-rtx-8000': { profile: 'rtx2080Ti', factor: 1.05, evidence: 'same-silicon-proxy', rationale: 'TU102 proxy adjusted for the Quadro RTX 8000 core count and board envelope.' },
  'nvidia-rtx-a6000': { profile: 'rtx3090', factor: 0.98, evidence: 'same-silicon-proxy', rationale: 'GA102 proxy; published owner comparisons put the stock A6000 within a few percent of RTX 3090.' },
  'nvidia-a800-40-active': { profile: 'a100Pcie40', factor: 0.95, evidence: 'same-silicon-proxy', rationale: 'GA100-derived active workstation card normalized for its 240 W board limit.' },
  'nvidia-rtx-5000-ada': { profile: 'rtx6000Ada', factor: 0.7, evidence: 'architecture-estimate', rationale: 'AD102-family estimate scaled by active CUDA-core share and lower 250 W envelope.' },
  'nvidia-rtx-5880-ada': { profile: 'rtx6000Ada', factor: 0.78, evidence: 'architecture-estimate', rationale: 'AD102-family estimate scaled for the 14,080-core regional SKU.' },
  'nvidia-rtx-6000-ada': { profile: 'rtx6000Ada', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-rtx-pro-4500-blackwell': { profile: 'pro4500Blackwell', factor: 1, evidence: 'measured-exact', rationale: 'Exact 32 GB workstation board measurement.' },
  'nvidia-rtx-pro-5000-blackwell-48': { profile: 'pro5000Blackwell48', factor: 1, evidence: 'measured-exact', rationale: 'Exact 48 GB workstation board measurement.' },
  'nvidia-rtx-pro-5000-blackwell-72': { profile: 'pro5000Blackwell48', factor: 1, evidence: 'same-silicon-proxy', rationale: 'Same RTX PRO 5000 compute configuration; the larger framebuffer should not accelerate these compact benchmark modes.' },
  'nvidia-rtx-pro-6000-blackwell-maxq': { profile: 'pro6000BlackwellServer', factor: 1, evidence: 'same-silicon-proxy', rationale: 'Same GB202 compute class and a comparable reduced-power envelope; exact Max-Q benchmark was not found.' },
  'nvidia-rtx-pro-6000-blackwell-workstation': { profile: 'pro6000BlackwellWs', factor: 1, evidence: 'measured-exact', rationale: 'Exact 96 GB / 600 W workstation board measurement.' },
  'nvidia-tesla-v100-pcie-32': { profile: 'v100Sxm2', factor: 0.9, evidence: 'same-silicon-proxy', rationale: 'V100 SXM2 silicon proxy reduced for the PCIe 250 W clocks; 32 GB capacity does not improve these compact modes.' },
  'nvidia-tesla-v100s-pcie-32': { profile: 'v100Sxm2', factor: 0.98, evidence: 'same-silicon-proxy', rationale: 'V100 SXM2 silicon proxy; V100S raises PCIe clocks but remains a 250 W card.' },
  'nvidia-quadro-rtx-8000-server': { profile: 'rtx2080Ti', factor: 0.95, evidence: 'same-silicon-proxy', rationale: 'TU102 proxy normalized for the passive 250 W server edition.' },
  'nvidia-a16': { profile: 'rtx4060', factor: 1.05, evidence: 'architecture-estimate', rationale: 'Board aggregate estimate for four small Ampere GPUs; memory remains four separate 16 GB pools.' },
  'nvidia-a40': { profile: 'rtx3090', factor: 0.98, evidence: 'same-silicon-proxy', rationale: 'GA102 data-center board with the same 300 W envelope as RTX A6000.' },
  'nvidia-a100-pcie-40': { profile: 'a100Pcie40', factor: 1, evidence: 'measured-exact', rationale: 'Exact model; value is per GPU from a four-card result.' },
  'nvidia-a100-pcie-80': { profile: 'a100Pcie40', factor: 1, evidence: 'same-silicon-proxy', rationale: 'Same GA100 compute configuration; added HBM capacity does not raise these compact-mode rates.' },
  'nvidia-a800-pcie-80': { profile: 'a800Pcie80', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-l20': { profile: 'rtx6000Ada', factor: 0.65, evidence: 'architecture-estimate', rationale: 'Ada data-center estimate scaled for L20 shader count and 275 W board envelope.' },
  'nvidia-l40': { profile: 'l40s', factor: 0.995, evidence: 'same-silicon-proxy', rationale: 'Hashcat maintainers report L40S gains under 1% over L40 despite its extra 50 W.' },
  'nvidia-l40s': { profile: 'l40s', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-h100-pcie-80': { profile: 'h100Pcie', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'nvidia-h100-nvl': { profile: 'h100Pcie', factor: 1.05, evidence: 'same-silicon-proxy', rationale: 'Same Hopper compute generation, adjusted modestly for the higher per-card power envelope.' },
  'nvidia-h200-nvl': { profile: 'h200', factor: 1, evidence: 'same-silicon-proxy', rationale: 'Measured H200 rate, but the source does not disclose whether its H200 was the NVL form factor.' },
  'nvidia-h800-pcie-80': { profile: 'h100Pcie', factor: 0.98, evidence: 'same-silicon-proxy', rationale: 'H100-class compute proxy; H800 interconnect restrictions do not directly limit one-card Hashcat kernels.' },
  'nvidia-h800-nvl': { profile: 'h100Pcie', factor: 1.03, evidence: 'same-silicon-proxy', rationale: 'H100 NVL-class compute proxy; exact H800 NVL run was not found.' },
  'nvidia-rtx-pro-4500-blackwell-server': { profile: 'pro4500Blackwell', factor: 0.9, evidence: 'same-silicon-proxy', rationale: 'Exact workstation silicon normalized for the server card’s 165 W limit.' },
  'nvidia-rtx-pro-6000-blackwell-server': { profile: 'pro6000BlackwellServer', factor: 1, evidence: 'measured-exact', rationale: 'Exact server-edition measurement.' },
  'nvidia-rtx-pro-6000d-blackwell-server': { profile: 'pro6000BlackwellServer', factor: 0.9, evidence: 'architecture-estimate', rationale: 'Regional GB202 server estimate; detailed enabled-core and benchmark data remain unpublished.' },
  'amd-firepro-w9100-32': { profile: 'hawaii290x', factor: 0.9, evidence: 'same-silicon-proxy', rationale: 'Hawaii workstation board normalized from R9 290X; old driver and Hashcat generations add material uncertainty.' },
  'amd-radeon-pro-duo-polaris': { profile: 'polarisRx480', factor: 1.8, evidence: 'same-silicon-proxy', rationale: 'Aggregate estimate for both Polaris GPUs; each has a separate 16 GB pool.' },
  'amd-radeon-pro-w6800': { profile: 'rx6800xt', factor: 0.83, evidence: 'same-silicon-proxy', rationale: 'Navi 21 proxy scaled from 72 to 60 compute units and a 250 W envelope.' },
  'amd-radeon-pro-w7800-32': { profile: 'w7900', factor: 0.73, evidence: 'same-silicon-proxy', rationale: 'RDNA 3 workstation proxy scaled from W7900’s 96 to W7800’s 70 compute units.' },
  'amd-radeon-pro-w7800-48': { profile: 'w7900', factor: 0.73, evidence: 'same-silicon-proxy', rationale: 'RDNA 3 workstation proxy scaled from W7900; extra capacity does not raise compact-mode speed.' },
  'amd-radeon-pro-w7900': { profile: 'w7900', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'amd-radeon-pro-w7900-dual-slot': { profile: 'w7900', factor: 1, evidence: 'same-silicon-proxy', rationale: 'Same GPU configuration and 295 W board power as the measured W7900.' },
  'amd-radeon-ai-pro-r9700': { profile: 'r9700', factor: 1, evidence: 'measured-exact', rationale: 'Exact board measurement.' },
  'amd-radeon-ai-pro-r9600': { profile: 'r9700', factor: 0.52, evidence: 'architecture-estimate', rationale: 'RDNA 4 family estimate for the lower-core 150 W card.' },
  'amd-firepro-s9170': { profile: 'hawaii290x', factor: 0.9, evidence: 'same-silicon-proxy', rationale: 'Hawaii server board normalized from R9 290X; old software support is a major variable.' },
  'amd-radeon-pro-v340': { profile: 'radeonVii', factor: 1.6, evidence: 'architecture-estimate', rationale: 'Board aggregate for two Vega GPUs; each has a separate 16 GB pool and is slower than Vega 20.' },
  'amd-radeon-pro-v620': { profile: 'rx6800xt', factor: 1, evidence: 'same-silicon-proxy', rationale: 'Navi 21 data-center card with the same nominal 300 W envelope as RX 6800 XT.' },
  'amd-instinct-mi50-32': { profile: 'radeonVii', factor: 0.95, evidence: 'same-silicon-proxy', rationale: 'Vega 20 proxy adjusted for MI50 clocks.' },
  'amd-instinct-mi60': { profile: 'radeonVii', factor: 1.05, evidence: 'same-silicon-proxy', rationale: 'Full Vega 20 proxy adjusted for MI60 compute-unit count.' },
  'amd-instinct-mi100': { profile: 'radeonVii', factor: 1.8, evidence: 'architecture-estimate', rationale: 'CDNA 1 estimate from Vega 20 integer throughput; no reproducible MI100 Hashcat run was found.' },
  'amd-instinct-mi210': { profile: 'radeonVii', factor: 2.2, evidence: 'architecture-estimate', rationale: 'CDNA 2 estimate from the closest published AMD accelerator result; Hashcat kernel support can dominate.' },
  'amd-instinct-mi350p': { profile: 'mi300x', factor: 1.2, evidence: 'architecture-estimate', rationale: 'CDNA 4 planning estimate from measured MI300X; no public MI350P Hashcat run was found.' },
  'amd-radeon-ai-pro-r9700s': { profile: 'r9700', factor: 1, evidence: 'same-silicon-proxy', rationale: 'Passive server form of the measured R9700 compute configuration.' },
  'amd-radeon-ai-pro-r9600d': { profile: 'r9700', factor: 0.52, evidence: 'architecture-estimate', rationale: 'RDNA 4 family estimate for the passive lower-core 150 W card.' },
};

const uncertainty: Record<HashcatEvidence, number> = {
  'measured-exact': 0,
  'same-silicon-proxy': 12,
  'architecture-estimate': 30,
};

function round(value: number, digits: number) {
  return Number(value.toFixed(digits));
}

export function hashcatEligibleGpus(products: Product[]) {
  return products.filter((product): product is Gpu => product.category === 'gpu');
}

type FallbackAnchor = {
  profile: keyof typeof benchmarkProfiles;
  processors: number;
  boardPowerW: number;
  generationFactor?: number;
};

const fallbackAnchors: Record<string, FallbackAnchor> = {
  Blackwell: { profile: 'rtx5080', processors: 10752, boardPowerW: 360 },
  'Ada Lovelace': { profile: 'rtx4090', processors: 16384, boardPowerW: 450 },
  Ampere: { profile: 'rtx3090', processors: 10496, boardPowerW: 350 },
  Turing: { profile: 'rtx2080Ti', processors: 4352, boardPowerW: 250 },
  Pascal: { profile: 'rtx2080Ti', processors: 4352, boardPowerW: 250, generationFactor: 0.55 },
  Maxwell: { profile: 'rtx2080Ti', processors: 4352, boardPowerW: 250, generationFactor: 0.25 },
  'RDNA 4': { profile: 'r9700', processors: 4096, boardPowerW: 300 },
  'RDNA 3': { profile: 'w7900', processors: 6144, boardPowerW: 295 },
};

const fallbackProcessorCounts: Record<string, number> = {
  'nvidia-titan-rtx': 4608,
  'nvidia-quadro-m6000-24': 3072,
  'nvidia-quadro-p6000': 3840,
  'nvidia-rtx-a5500': 10240,
  'nvidia-rtx-4500-ada': 7680,
  'nvidia-a10': 9216,
  'nvidia-l2': 3072,
  'nvidia-l4': 7424,
  'amd-radeon-pro-v710': 3584,
};

function architectureFallback(product: Gpu): HashcatPotential | undefined {
  const anchor = product.architecture ? fallbackAnchors[product.architecture] : undefined;
  const processors = product.parallelProcessors?.count
    ?? gpuParallelProcessors[product.id]?.count
    ?? fallbackProcessorCounts[product.id];
  if (!anchor || !processors) return undefined;
  const profile = benchmarkProfiles[anchor.profile];
  const processorRatio = processors / anchor.processors;
  const powerRatio = product.boardPowerW ? product.boardPowerW / anchor.boardPowerW : processorRatio;
  const powerLimitedRatio = Math.pow(Math.max(powerRatio, 0.01), 0.65);
  const factor = Math.min(processorRatio, powerLimitedRatio) * (anchor.generationFactor ?? 1);
  return {
    product,
    ntlmGhS: round(profile.ntlmGhS * factor, 4),
    bcryptKhS: round(profile.bcryptKhS * factor, 3),
    evidence: 'architecture-estimate',
    uncertaintyPercent: 40,
    benchmarkHardware: profile.hardware,
    hashcatVersion: profile.hashcatVersion,
    sourceName: profile.sourceName,
    sourceUrl: profile.sourceUrl,
    rationale: `Fallback estimate from the nearest ${product.architecture} anchor, bounded by parallel-processor share and board-power envelope.`,
  };
}

export function hashcatPotentialFor(product: Gpu): HashcatPotential | undefined {
  const plan = plans[product.id];
  if (!plan) return architectureFallback(product);
  const profile = benchmarkProfiles[plan.profile];
  return {
    product,
    ntlmGhS: round(profile.ntlmGhS * plan.factor, 4),
    bcryptKhS: round(profile.bcryptKhS * plan.factor, 3),
    evidence: plan.evidence,
    uncertaintyPercent: uncertainty[plan.evidence],
    benchmarkHardware: profile.hardware,
    hashcatVersion: profile.hashcatVersion,
    sourceName: profile.sourceName,
    sourceUrl: profile.sourceUrl,
    rationale: plan.rationale,
  };
}

export function buildHashcatPotentials(products: Product[]) {
  return hashcatEligibleGpus(products)
    .map(hashcatPotentialFor)
    .filter((result): result is HashcatPotential => Boolean(result));
}

export function hashcatMetricValue(result: HashcatPotential, metric: HashcatMetric) {
  return metric === 'ntlm' ? result.ntlmGhS : result.bcryptKhS;
}

export function hashcatEvidenceLabel(evidence: HashcatEvidence) {
  if (evidence === 'measured-exact') return 'Exact measured';
  if (evidence === 'same-silicon-proxy') return 'Family proxy';
  return 'Architecture estimate';
}
