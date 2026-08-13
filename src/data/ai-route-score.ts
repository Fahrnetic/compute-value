export type EstimateConfidence = 'high' | 'medium' | 'low';
export type RouteOutletVerdict = 'yes' | 'conditional' | 'no';
export type FixedControlBasis = 'measured' | 'measured proxy' | 'bandwidth-derived proxy';

export interface AiRouteInput {
  id: string;
  name: string;
  shortName: string;
  architecture: string;
  gpuCount: number;
  vramPerGpuGb: number;
  systemCostLowUsd: number;
  systemCostHighUsd: number;
  completeSystemPowerW: number;
  efficientCapSystemPowerW?: number;
  outletVerdict: RouteOutletVerdict;
  outletNote: string;
  fabric: string;
  fabricScore: number;
  fixedLlama2SevenBTokensPerSecond: number;
  fixedControlBasis: FixedControlBasis;
  fixedControlSourceUrl: string;
  scalingEfficiencyLow: number;
  scalingEfficiencyHigh: number;
  confidence: EstimateConfidence;
  costBasis: string;
  priceSourceUrl: string;
  fitNote: string;
  caveat: string;
  measuredSeventyBAnchor?: {
    tokensPerSecond: number;
    workload: string;
    sourceUrl: string;
  };
}

export interface AiRouteScore extends AiRouteInput {
  totalVramGb: number;
  systemCostMidUsd: number;
  inferredSeventyBTokensLow: number;
  inferredSeventyBTokensHigh: number;
  inferredSeventyBTokensMid: number;
  capacityScore: number;
  speedScore: number;
  valueScore: number;
  powerScore: number;
  overallScore: number;
  vramPerThousandDollars: number;
  inferredTokensPerThousandDollars: number;
  inferredTokensPerKw: number;
}

export interface PowerLimitEvidence {
  hardware: string;
  stockPowerW: number;
  efficientPowerW: number;
  decodeRetainedPercent: number | null;
  prefillRetainedPercent: number | null;
  evidence: 'LLM measured' | 'non-LLM measured' | 'control still needed';
  workload: string;
  practicalLimit: string;
  sourceUrl: string;
  note: string;
}

// The fixed-control 7B file is 3.83GB. The 70B common ruler is the 38.87GB
// Q4_0 file used by the enterprise roofline. Decode is mostly a weight-streaming
// workload, so the byte ratio is a useful first-order bridge. The topology range
// then discounts multi-GPU scaling for PCIe, NVLink islands, NVSwitch, or RoCE.
export const LLAMA2_7B_Q4_0_MODEL_SIZE_GB = 3.83;
export const LLAMA2_70B_Q4_0_MODEL_SIZE_GB = 38.87;
export const LLAMA2_Q4_SIZE_RATIO = LLAMA2_7B_Q4_0_MODEL_SIZE_GB / LLAMA2_70B_Q4_0_MODEL_SIZE_GB;

export const routeScoreWeights = {
  capacity: 25,
  interactiveSpeed: 35,
  systemValue: 20,
  powerAndOutlet: 10,
  fabric: 10,
} as const;

const llamaCppCudaScoreboard = 'https://github.com/ggml-org/llama.cpp/discussions/15013';
const ebaySearch = (query: string) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_ItemCondition=3000`;

export const aiRouteInputs: AiRouteInput[] = [
  {
    id: 'v100-pcie-quad', name: '4× Tesla V100 PCIe 32GB', shortName: '4× V100 PCIe', architecture: 'Volta',
    gpuCount: 4, vramPerGpuGb: 32, systemCostLowUsd: 6_000, systemCostHighUsd: 10_000,
    completeSystemPowerW: 1_300, efficientCapSystemPowerW: 1_100, outletVerdict: 'conditional',
    outletNote: 'Possible only with four 200W caps, a complete system measured below 1,440W, and a PSU that accepts 120V at the required current.',
    fabric: 'PCIe 3.0 x16 only', fabricScore: 18, fixedLlama2SevenBTokensPerSecond: 129.08, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.30, scalingEfficiencyHigh: 0.50, confidence: 'medium',
    costBasis: 'Four verified-seller V100 cards at $639–$645 plus a used high-lane-count server, cooling, memory, storage, and power conversion.',
    priceSourceUrl: ebaySearch('NVIDIA Tesla V100 PCIe 32GB GPU used'),
    fitNote: '128GB aggregate HBM fits 70B Q4 comfortably and some ~200B low-bit models.',
    caveat: 'The accepted fixed-control device label does not disclose PCIe versus SXM. PCIe Gen3 collectives and passive cooling are the build risks.',
  },
  {
    id: 'v100-sxm-quad', name: '4× Tesla V100 32GB SXM2 baseboard', shortName: '4× V100 SXM2', architecture: 'Volta',
    gpuCount: 4, vramPerGpuGb: 32, systemCostLowUsd: 7_000, systemCostHighUsd: 14_000,
    completeSystemPowerW: 1_600, efficientCapSystemPowerW: 1_200, outletVerdict: 'no',
    outletNote: 'A cap can reduce GPU draw, but SXM carrier servers normally require their specified 200–240V redundant-PSU input.',
    fabric: 'NVLink 2.0 · up to 300GB/s/GPU', fabricScore: 82, fixedLlama2SevenBTokensPerSecond: 129.08, fixedControlBasis: 'measured proxy',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.55, scalingEfficiencyHigh: 0.80, confidence: 'medium',
    costBasis: 'Used SXM2 modules/carrier pricing plus a compatible host, heatsinks, firmware, cabling, and redundant power. Planning range, not a turnkey quote.',
    priceSourceUrl: ebaySearch('NVIDIA Tesla V100 SXM2 32GB baseboard'),
    fitNote: '128GB aggregate HBM with a real four-GPU scale-up fabric; the strongest low-cost V100 topology.',
    caveat: 'Cheap loose modules are not usable PCIe cards. Carrier compatibility, firmware, cooling, and power integration can erase the apparent savings.',
  },
  {
    id: 'a100-40-single', name: '1× A100 PCIe 40GB system', shortName: '1× A100 40GB', architecture: 'Ampere',
    gpuCount: 1, vramPerGpuGb: 40, systemCostLowUsd: 6_000, systemCostHighUsd: 9_000,
    completeSystemPowerW: 550, outletVerdict: 'yes', outletNote: 'A correctly cooled one-GPU server is comfortably inside a dedicated 120V/15A circuit.',
    fabric: 'No fabric needed · one GPU', fabricScore: 100, fixedLlama2SevenBTokensPerSecond: 109.5, fixedControlBasis: 'bandwidth-derived proxy',
    fixedControlSourceUrl: 'https://github.com/XiongjieDai/GPU-Benchmarks-on-LLM-Inference/tree/main/LLaMA%202',
    scalingEfficiencyLow: 0.88, scalingEfficiencyHigh: 1, confidence: 'low',
    costBasis: 'Verified-seller A100 40GB cards at $3,500–$4,099 plus a compatible passive-GPU server and airflow.',
    priceSourceUrl: ebaySearch('NVIDIA A100 PCIe 40GB GPU used'),
    fitNote: 'The 38.87GB weights technically fit, but leave almost no room for runtime overhead or KV cache. Treat 70B Q4 as marginal.',
    caveat: 'The 7B control is estimated from the measured A100 80GB result by its 1,555/1,935GB/s bandwidth ratio. This is the weakest confidence route.',
  },
  {
    id: 'a100-40-quad', name: '4× A100 PCIe 40GB server', shortName: '4× A100 40GB', architecture: 'Ampere',
    gpuCount: 4, vramPerGpuGb: 40, systemCostLowUsd: 19_000, systemCostHighUsd: 27_000,
    completeSystemPowerW: 1_450, outletVerdict: 'no', outletNote: 'The planning load is already at the 120V continuous ceiling; qualified 200–240V server power is the safe route.',
    fabric: 'Two NVLink pairs · PCIe 4 cross-pair', fabricScore: 56, fixedLlama2SevenBTokensPerSecond: 109.5, fixedControlBasis: 'bandwidth-derived proxy',
    fixedControlSourceUrl: 'https://github.com/XiongjieDai/GPU-Benchmarks-on-LLM-Inference/tree/main/LLaMA%202',
    scalingEfficiencyLow: 0.45, scalingEfficiencyHigh: 0.70, confidence: 'low',
    costBasis: 'Four verified-seller 40GB cards plus a four-GPU certified/qualified server. NVLink bridges can join pairs, not one four-card fabric.',
    priceSourceUrl: ebaySearch('NVIDIA A100 PCIe 40GB GPU used'),
    fitNote: '160GB aggregate HBM provides useful 70B context headroom and room for larger low-bit models.',
    caveat: 'Great dense compute and 40GB-per-card HBM, but the inexpensive PCIe model is not the HGX/NVSwitch version and Q4 decode value is less dramatic.',
  },
  {
    id: 'rtx-a6000-single', name: '1× RTX A6000 48GB workstation', shortName: '1× RTX A6000', architecture: 'Ampere',
    gpuCount: 1, vramPerGpuGb: 48, systemCostLowUsd: 6_000, systemCostHighUsd: 8_500,
    completeSystemPowerW: 600, outletVerdict: 'yes', outletNote: 'Straightforward on a dedicated household circuit with a quality workstation PSU.',
    fabric: 'No fabric needed · one GPU', fabricScore: 100, fixedLlama2SevenBTokensPerSecond: 138.73, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.90, scalingEfficiencyHigh: 1, confidence: 'high',
    costBasis: 'One verified-seller RTX A6000 at $3,990 plus a normal professional workstation.',
    priceSourceUrl: ebaySearch('NVIDIA RTX A6000 48GB GPU used'),
    fitNote: 'The simplest 48GB route: 70B Q4 fits on one device with no tensor-parallel tax, but context headroom is limited.',
    caveat: 'Excellent simplicity and ECC capacity; generation speed is limited by 768GB/s GDDR6 bandwidth.',
  },
  {
    id: 'rtx-a6000-dual', name: '2× RTX A6000 48GB NVLink workstation', shortName: '2× RTX A6000', architecture: 'Ampere',
    gpuCount: 2, vramPerGpuGb: 48, systemCostLowUsd: 11_000, systemCostHighUsd: 15_000,
    completeSystemPowerW: 950, outletVerdict: 'yes', outletNote: 'Fits a dedicated 120V circuit with measured wall power, suitable PSU derating, and no unrelated heavy loads.',
    fabric: '2-GPU NVLink · 112.5GB/s bidirectional', fabricScore: 78, fixedLlama2SevenBTokensPerSecond: 138.73, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.65, scalingEfficiencyHigh: 0.85, confidence: 'medium',
    costBasis: 'Two verified-seller RTX A6000 cards at about $3,990 each, an NVLink bridge, and a dual-GPU workstation.',
    priceSourceUrl: ebaySearch('NVIDIA RTX A6000 48GB GPU used'),
    fitNote: '96GB aggregate ECC VRAM with a clean two-GPU topology; enough headroom for 70B Q4 long context.',
    caveat: 'The second card buys capacity more reliably than it buys 2× single-stream decode speed.',
  },
  {
    id: 'a40-single', name: '1× NVIDIA A40 48GB server', shortName: '1× A40', architecture: 'Ampere',
    gpuCount: 1, vramPerGpuGb: 48, systemCostLowUsd: 6_000, systemCostHighUsd: 8_500,
    completeSystemPowerW: 550, outletVerdict: 'yes', outletNote: 'One passive 300W A40 in a qualified-airflow server is comfortably inside a dedicated household circuit.',
    fabric: 'No fabric needed · one GPU', fabricScore: 100, fixedLlama2SevenBTokensPerSecond: 124.11, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.90, scalingEfficiencyHigh: 1, confidence: 'high',
    costBasis: 'Verified-seller A40 cards at $3,950–$4,300 plus a passive-GPU server with the required airflow.',
    priceSourceUrl: ebaySearch('NVIDIA A40 48GB GPU used'),
    fitNote: 'Low-cost Ampere 48GB ECC capacity; 70B Q4 fits without a tensor-parallel tax.',
    caveat: 'Slower than RTX A6000 in the exact control and has no display outputs or onboard fan, but is often an easier server fit.',
  },
  {
    id: 'l40-single', name: '1× NVIDIA L40 48GB server', shortName: '1× L40', architecture: 'Ada Lovelace',
    gpuCount: 1, vramPerGpuGb: 48, systemCostLowUsd: 9_500, systemCostHighUsd: 12_500,
    completeSystemPowerW: 650, outletVerdict: 'yes', outletNote: 'One properly cooled 300W L40 server can stay inside a dedicated 120V circuit if its PSU supports the input.',
    fabric: 'No fabric needed · one GPU', fabricScore: 100, fixedLlama2SevenBTokensPerSecond: 152.01, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.90, scalingEfficiencyHigh: 1, confidence: 'high',
    costBasis: 'Verified-seller L40 cards at $6,699–$7,059 plus a qualified passive-GPU server.',
    priceSourceUrl: ebaySearch('NVIDIA L40 48GB GPU accelerator used'),
    fitNote: 'Exact-control Ada 48GB route with 300W board power and no TP overhead.',
    caveat: 'L40 is slower in compute-heavy prefill than L40S, but its exact decode result and lower board power make it the cleaner evidence-backed comparison.',
  },
  {
    id: 'rtx-6000-ada-single', name: '1× RTX 6000 Ada 48GB workstation', shortName: '1× RTX 6000 Ada', architecture: 'Ada Lovelace',
    gpuCount: 1, vramPerGpuGb: 48, systemCostLowUsd: 12_000, systemCostHighUsd: 15_000,
    completeSystemPowerW: 650, outletVerdict: 'yes', outletNote: 'A one-card 300W professional workstation is straightforward on a dedicated household circuit.',
    fabric: 'No fabric needed · one GPU', fabricScore: 100, fixedLlama2SevenBTokensPerSecond: 176.07, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.90, scalingEfficiencyHigh: 1, confidence: 'high',
    costBasis: 'One verified-seller RTX 6000 Ada listing around $10,153 plus a professional workstation.',
    priceSourceUrl: ebaySearch('NVIDIA RTX 6000 Ada 48GB GPU used'),
    fitNote: 'The fastest measured 48GB single-card option in the fixed Llama control.',
    caveat: 'Clean evidence and 960GB/s bandwidth, but current used pricing makes its value worse than RTX A6000 and speculative PRO 5000 routes.',
  },
  {
    id: 'l40s-single', name: '1× L40S 48GB server', shortName: '1× L40S', architecture: 'Ada Lovelace',
    gpuCount: 1, vramPerGpuGb: 48, systemCostLowUsd: 8_500, systemCostHighUsd: 12_000,
    completeSystemPowerW: 700, outletVerdict: 'yes', outletNote: 'One properly cooled L40S server can stay inside a dedicated 120V circuit if its PSU supports the input.',
    fabric: 'No fabric needed · one GPU', fabricScore: 100, fixedLlama2SevenBTokensPerSecond: 152.01, fixedControlBasis: 'measured proxy',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.90, scalingEfficiencyHigh: 1, confidence: 'medium',
    costBasis: 'Verified-seller L40S cards at $5,820–$6,410 plus a passive-GPU server with qualified airflow.',
    priceSourceUrl: ebaySearch('NVIDIA L40S 48GB GPU accelerator used'),
    fitNote: 'Single-card 48GB ECC route with Ada FP8 support and no TP overhead.',
    caveat: 'The fixed control uses the closely related L40 at the same 864GB/s memory bandwidth; L40S needs its own exact run.',
  },
  {
    id: 'l40s-quad', name: '4× L40S 48GB server', shortName: '4× L40S', architecture: 'Ada Lovelace',
    gpuCount: 4, vramPerGpuGb: 48, systemCostLowUsd: 29_000, systemCostHighUsd: 37_000,
    completeSystemPowerW: 1_800, outletVerdict: 'no', outletNote: 'Use the server manufacturer’s 200–240V redundant-PSU and PDU requirements.',
    fabric: 'PCIe 4.0 · no NVLink', fabricScore: 28, fixedLlama2SevenBTokensPerSecond: 152.01, fixedControlBasis: 'measured proxy',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.30, scalingEfficiencyHigh: 0.50, confidence: 'low',
    costBasis: 'Four verified-seller L40S cards plus a certified four-GPU server.',
    priceSourceUrl: ebaySearch('NVIDIA L40S 48GB GPU accelerator used'),
    fitNote: '192GB aggregate ECC capacity; better for four replicas or batched serving than latency-sensitive TP4.',
    caveat: 'No NVLink and no exact four-card Llama control. PCIe-only TP is the major uncertainty.',
  },
  {
    id: 'rtx-pro-5000-single', name: '1× RTX PRO 5000 Blackwell 48GB', shortName: '1× PRO 5000 48', architecture: 'Blackwell',
    gpuCount: 1, vramPerGpuGb: 48, systemCostLowUsd: 6_000, systemCostHighUsd: 8_500,
    completeSystemPowerW: 600, outletVerdict: 'yes', outletNote: 'A 300W professional card in a one-GPU workstation is an easy household-power configuration.',
    fabric: 'No fabric needed · one GPU', fabricScore: 100, fixedLlama2SevenBTokensPerSecond: 195.32, fixedControlBasis: 'bandwidth-derived proxy',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.88, scalingEfficiencyHigh: 1, confidence: 'low',
    costBasis: 'Current 48GB board/workstation street evidence centers around roughly $4,700–$6,000 before higher-end host options.',
    priceSourceUrl: 'https://marketplace.nvidia.com/en-us/enterprise/laptops-workstations/',
    fitNote: 'The most interesting new 48GB single-card route if its real fixed-control run lands near the bandwidth-derived estimate.',
    caveat: 'No exact fixed Llama 2 control exists yet. The estimate scales the measured 96GB Max-Q result by the 1,344/1,792GB/s memory-bandwidth ratio.',
  },
  {
    id: 'rtx-pro-5000-quad', name: '4× RTX PRO 5000 Blackwell 48GB', shortName: '4× PRO 5000 48', architecture: 'Blackwell',
    gpuCount: 4, vramPerGpuGb: 48, systemCostLowUsd: 25_000, systemCostHighUsd: 34_000,
    completeSystemPowerW: 1_550, outletVerdict: 'no', outletNote: 'GPU TDP alone is 1,200W. Plan a validated 200–240V four-GPU workstation circuit.',
    fabric: 'PCIe 5.0 · no NVLink', fabricScore: 38, fixedLlama2SevenBTokensPerSecond: 195.32, fixedControlBasis: 'bandwidth-derived proxy',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.35, scalingEfficiencyHigh: 0.55, confidence: 'low',
    costBasis: 'Four current RTX PRO 5000 cards plus a WRX90/server-class four-GPU host, memory, storage, and cooling.',
    priceSourceUrl: 'https://marketplace.nvidia.com/en-us/enterprise/laptops-workstations/',
    fitNote: '192GB ECC capacity at 300W/card; a compelling density target that still needs a real TP4 result.',
    caveat: 'The number is doubly inferred: per-card control from bandwidth, then PCIe 5 topology efficiency. Treat the range as a test target.',
  },
  {
    id: 'rtx3090-quad', name: '4× GeForce RTX 3090 24GB', shortName: '4× RTX 3090', architecture: 'Ampere',
    gpuCount: 4, vramPerGpuGb: 24, systemCostLowUsd: 9_000, systemCostHighUsd: 13_000,
    completeSystemPowerW: 1_750, efficientCapSystemPowerW: 1_230, outletVerdict: 'conditional',
    outletNote: 'Four 220W caps can make the arithmetic fit one dedicated circuit, but the complete host must be wall-metered and transient-safe.',
    fabric: 'Two NVLink pairs · PCIe 4 cross-pair', fabricScore: 44, fixedLlama2SevenBTokensPerSecond: 158.16, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.25, scalingEfficiencyHigh: 0.45, confidence: 'high',
    costBasis: 'Four verified-seller cards at $1,243–$1,350 plus a high-lane-count host, bridges where spacing permits, and engineered power.',
    priceSourceUrl: ebaySearch('NVIDIA RTX 3090 Founders Edition 24GB used'),
    fitNote: '96GB aggregate VRAM is enough for 70B Q4, but less future-proof than 128–192GB routes.',
    caveat: 'Only two-card NVLink islands are possible. The range is anchored by a measured 17.07 tok/s Llama 3 70B Q4_K_M four-card run.',
    measuredSeventyBAnchor: { tokensPerSecond: 17.07, workload: 'Llama 3 70B Q4_K_M · llama.cpp layer split', sourceUrl: 'https://craftrigs.com/articles/multi-gpu-scaling-local-llm-rtx-3090/' },
  },
  {
    id: 'rtx5090-quad', name: '4× GeForce RTX 5090 32GB', shortName: '4× RTX 5090', architecture: 'Blackwell',
    gpuCount: 4, vramPerGpuGb: 32, systemCostLowUsd: 23_000, systemCostHighUsd: 30_000,
    completeSystemPowerW: 2_700, efficientCapSystemPowerW: 2_200, outletVerdict: 'no',
    outletNote: 'Even the 400W/card minimum plus the host exceeds one regular 120V/15A circuit.',
    fabric: 'PCIe 5.0 · no NVLink', fabricScore: 34, fixedLlama2SevenBTokensPerSecond: 290.02, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.30, scalingEfficiencyHigh: 0.50, confidence: 'medium',
    costBasis: 'Uses your $4,300–$5,300/card market range plus $5,800–$8,800 for a four-slot Gen5 host, cooling, and power.',
    priceSourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/',
    fitNote: '128GB aggregate VRAM and the highest GeForce fixed-control speed; power, price, and absent NVLink are the costs.',
    caveat: 'PCIe 5 signaling does not guarantee CUDA P2P. The observed four-card Qwen result is a different model and is not used as the universal score.',
  },
  {
    id: 'dgx-spark-2', name: '2× DGX Spark · TP2', shortName: '2× DGX Spark', architecture: 'Grace Blackwell',
    gpuCount: 2, vramPerGpuGb: 128, systemCostLowUsd: 9_600, systemCostHighUsd: 10_500,
    completeSystemPowerW: 480, outletVerdict: 'yes', outletNote: 'Two 240W supplied adapters fit comfortably on one dedicated household circuit.',
    fabric: 'Direct 200GbE RoCE', fabricScore: 42, fixedLlama2SevenBTokensPerSecond: 57.21, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.60, scalingEfficiencyHigh: 0.75, confidence: 'high',
    costBasis: 'Two current $4,699 complete systems plus an approved direct-connect cable.',
    priceSourceUrl: 'https://forums.developer.nvidia.com/t/2-23-2026-price-change-announcement/361713',
    fitNote: '256GB distributed unified memory is exceptional capacity per outlet, but generation is slow.',
    caveat: 'The range is anchored by NVIDIA’s 7.52 tok/s Llama 3.3 70B NVFP4 TP2 result. Spark optimizes capacity and watts, not raw decode.',
    measuredSeventyBAnchor: { tokensPerSecond: 7.52, workload: 'Llama 3.3 70B NVFP4 · TensorRT-LLM · 32K input', sourceUrl: 'https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/' },
  },
  {
    id: 'dgx-spark-4', name: '4× DGX Spark · TP4', shortName: '4× DGX Spark', architecture: 'Grace Blackwell',
    gpuCount: 4, vramPerGpuGb: 128, systemCostLowUsd: 23_000, systemCostHighUsd: 35_000,
    completeSystemPowerW: 960, outletVerdict: 'yes', outletNote: 'Compute adapters fit one dedicated circuit; the 200GbE switch must be included in the same circuit audit.',
    fabric: 'Switched 200GbE RoCE', fabricScore: 38, fixedLlama2SevenBTokensPerSecond: 57.21, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.55, scalingEfficiencyHigh: 0.70, confidence: 'high',
    costBasis: 'Four current $4,699 systems plus four approved cables and a managed 200GbE RoCE switch; switch pricing drives the wide range.',
    priceSourceUrl: 'https://forums.developer.nvidia.com/t/2-23-2026-price-change-announcement/361713',
    fitNote: '512GB distributed capacity can load enormous models on household power, but TP4 decode remains modest.',
    caveat: 'The range is anchored by NVIDIA’s 13.89 tok/s Llama 3.3 70B NVFP4 TP4 result. A 200GbE switch is not optional for the supported topology.',
    measuredSeventyBAnchor: { tokensPerSecond: 13.89, workload: 'Llama 3.3 70B NVFP4 · TensorRT-LLM · 32K input', sourceUrl: 'https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/' },
  },
  {
    id: 'rtx-pro-6000-maxq-quad', name: '4× RTX PRO 6000 Blackwell Max-Q 96GB', shortName: '4× PRO 6000 96', architecture: 'Blackwell',
    gpuCount: 4, vramPerGpuGb: 96, systemCostLowUsd: 50_000, systemCostHighUsd: 62_000,
    completeSystemPowerW: 1_550, outletVerdict: 'no', outletNote: 'The four 300W GPUs leave too little 120V continuous headroom for a WRX90 host. Use engineered 200–240V power.',
    fabric: 'PCIe 5.0 · no NVLink', fabricScore: 40, fixedLlama2SevenBTokensPerSecond: 260.42, fixedControlBasis: 'measured',
    fixedControlSourceUrl: llamaCppCudaScoreboard, scalingEfficiencyLow: 0.40, scalingEfficiencyHigh: 0.60, confidence: 'medium',
    costBasis: 'Four current Max-Q boards around $11,000–$13,250 each plus a validated four-GPU workstation; OEM volume quotes can be lower.',
    priceSourceUrl: 'https://marketplace.nvidia.com/en-us/enterprise/laptops-workstations/',
    fitNote: '384GB ECC capacity and high per-card decode at 300W; the premium dense-workstation route.',
    caveat: 'The exact one-card control is strong, but a fixed TP4 Llama result is still missing. PCIe collective behavior must be measured on the delivered host.',
  },
];

function clamp(value: number, low = 0, high = 100) {
  return Math.min(high, Math.max(low, value));
}

function capacityScore(totalVramGb: number) {
  if (totalVramGb < 48) return clamp((totalVramGb / 48) * 28);
  return clamp(40 + (Math.log2(totalVramGb / 48) / 3) * 60);
}

function outletBase(verdict: RouteOutletVerdict) {
  if (verdict === 'yes') return 100;
  if (verdict === 'conditional') return 58;
  return 10;
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function initialRoute(input: AiRouteInput) {
  const low = input.fixedLlama2SevenBTokensPerSecond * input.gpuCount * LLAMA2_Q4_SIZE_RATIO * input.scalingEfficiencyLow;
  const high = input.fixedLlama2SevenBTokensPerSecond * input.gpuCount * LLAMA2_Q4_SIZE_RATIO * input.scalingEfficiencyHigh;
  const mid = (low + high) / 2;
  const costMid = (input.systemCostLowUsd + input.systemCostHighUsd) / 2;
  const totalVramGb = input.gpuCount * input.vramPerGpuGb;
  const scoredPowerW = input.efficientCapSystemPowerW ?? input.completeSystemPowerW;
  return {
    ...input,
    totalVramGb,
    systemCostMidUsd: costMid,
    inferredSeventyBTokensLow: low,
    inferredSeventyBTokensHigh: high,
    inferredSeventyBTokensMid: mid,
    vramPerThousandDollars: totalVramGb / (costMid / 1_000),
    inferredTokensPerThousandDollars: mid / (costMid / 1_000),
    inferredTokensPerKw: mid / (scoredPowerW / 1_000),
  };
}

const initialRoutes = aiRouteInputs.map(initialRoute);
const maxVramValue = Math.max(...initialRoutes.map((route) => route.vramPerThousandDollars));
const maxSpeedValue = Math.max(...initialRoutes.map((route) => route.inferredTokensPerThousandDollars));
const maxPowerEfficiency = Math.max(...initialRoutes.map((route) => route.inferredTokensPerKw));

export const aiRouteScores: AiRouteScore[] = initialRoutes.map((route) => {
  const capacity = capacityScore(route.totalVramGb);
  const speed = clamp((route.inferredSeventyBTokensMid / 60) * 100);
  const value = (
    (route.vramPerThousandDollars / maxVramValue) * 55
    + (route.inferredTokensPerThousandDollars / maxSpeedValue) * 45
  );
  const power = outletBase(route.outletVerdict) * 0.65 + (route.inferredTokensPerKw / maxPowerEfficiency) * 35;
  const overall = (
    capacity * routeScoreWeights.capacity
    + speed * routeScoreWeights.interactiveSpeed
    + value * routeScoreWeights.systemValue
    + power * routeScoreWeights.powerAndOutlet
    + route.fabricScore * routeScoreWeights.fabric
  ) / 100;

  return {
    ...route,
    inferredSeventyBTokensLow: round(route.inferredSeventyBTokensLow),
    inferredSeventyBTokensHigh: round(route.inferredSeventyBTokensHigh),
    inferredSeventyBTokensMid: round(route.inferredSeventyBTokensMid),
    capacityScore: round(capacity),
    speedScore: round(speed),
    valueScore: round(value),
    powerScore: round(power),
    overallScore: round(overall),
    vramPerThousandDollars: round(route.vramPerThousandDollars, 2),
    inferredTokensPerThousandDollars: round(route.inferredTokensPerThousandDollars, 2),
    inferredTokensPerKw: round(route.inferredTokensPerKw, 1),
  };
}).sort((a, b) => b.overallScore - a.overallScore);

export const aiRouteScoreById = new Map(aiRouteScores.map((route) => [route.id, route]));

export const powerLimitEvidence: PowerLimitEvidence[] = [
  {
    hardware: 'Tesla V100 32GB SXM2', stockPowerW: 300, efficientPowerW: 200,
    decodeRetainedPercent: 98, prefillRetainedPercent: null, evidence: 'LLM measured',
    workload: '20-model llama.cpp sweep · tg128; dense prompt processing is the cited worst case at 150W',
    practicalLimit: '200W daily target · 150W hardware minimum reported',
    sourceUrl: 'https://www.reddit.com/r/LocalLLaMA/comments/1s5o37v/v100_32_gb_6h_of_benchmarks_across_20_models_with/',
    note: 'The author reports under 2% tg128 loss at 200W. Dense prompt processing was 22% slower at 150W, but the 200W prefill retention was not published as one universal figure.',
  },
  {
    hardware: 'GeForce RTX 3090', stockPowerW: 350, efficientPowerW: 250,
    decodeRetainedPercent: 97.4, prefillRetainedPercent: 85.3, evidence: 'LLM measured',
    workload: '6×3090 · MiniMax M2.5 IQ2_M · llama.cpp · 4K decode / 198K prefill',
    practicalLimit: '250W evidence-backed sweet spot; test 220W if the circuit requires it',
    sourceUrl: 'https://llmgarage.ai/power-limit-tokens-per-second-benchmark/',
    note: 'Decode changed from 72.6 to 70.7 tok/s, while long-context prefill changed from 9,893 to 8,436 tok/s. MoE results do not guarantee identical dense-model behavior.',
  },
  {
    hardware: 'GeForce RTX 5090', stockPowerW: 600, efficientPowerW: 480,
    decodeRetainedPercent: 97.9, prefillRetainedPercent: 88.3, evidence: 'LLM measured',
    workload: 'One RTX 5090 owner sweep · llama.cpp pp/tg control · 600W versus 480W',
    practicalLimit: '480–510W for near-stock decode; reference-card minimum is commonly 400W',
    sourceUrl: 'https://www.reddit.com/r/LocalLLaMA/comments/1vfdwox/decrease_the_power_limit_of_your_5090_to_at_least/',
    note: 'At 480W the measured tg rate retained 97.9%, but prompt processing retained 88.3%. Board model, undervolt, clocks, and cooling remain owner-specific.',
  },
  {
    hardware: 'GeForce RTX 4090', stockPowerW: 450, efficientPowerW: 350,
    decodeRetainedPercent: null, prefillRetainedPercent: null, evidence: 'non-LLM measured',
    workload: 'Modern-game aggregate, not LLM inference', practicalLimit: '350W is a defensible starting cap; run the fixed Llama control before scoring retention',
    sourceUrl: 'https://www.computerbase.de/artikel/grafikkarten/nvidia-geforce-rtx-5090-test.91081/seite-13',
    note: 'The source measured only about 2% average raster loss at 350W versus 450W. That supports an efficiency test target, not an LLM-retention claim.',
  },
  {
    hardware: 'A100 40GB / RTX A6000 / L40S / RTX PRO 5000', stockPowerW: 0, efficientPowerW: 0,
    decodeRetainedPercent: null, prefillRetainedPercent: null, evidence: 'control still needed',
    workload: 'No same-model, same-runtime multi-point public power sweep found', practicalLimit: 'Query min/default/max with nvidia-smi, then sweep in 25W steps',
    sourceUrl: 'https://docs.nvidia.com/deploy/nvidia-smi/',
    note: 'Do not inherit GeForce or V100 retention percentages. Capture pp512, tg128, board watts, and wall watts separately on the exact device.',
  },
  {
    hardware: 'RTX PRO 6000 Blackwell', stockPowerW: 600, efficientPowerW: 425,
    decodeRetainedPercent: null, prefillRetainedPercent: null, evidence: 'control still needed',
    workload: 'Owner reports and mixed AI workloads only', practicalLimit: 'Max-Q 300W is the supported dense-build option; 400–475W is a Workstation-edition test band',
    sourceUrl: 'https://www.reddit.com/r/LocalLLaMA/comments/1utvbey/performance_comparison_on_full_compute/',
    note: 'Public evidence suggests LLM decode can remain close to stock at lower power, but no clean fixed-control sweep supports a retained percentage yet.',
  },
];

export const routeScoreMethod = {
  target: 'Owner-operated large-model inference, emphasizing interactive decode rather than batched serving',
  model: 'Llama 2 70B Q4_0 · 38.87GB',
  baseline: 'Llama 2 7B Q4_0 · 3.83GB · llama.cpp · one GPU · full offload · pp512/tg128 · Flash Attention off',
  formula: '7B measured/proxy tok/s × GPU count × (3.83 ÷ 38.87) × topology-efficiency range',
  costDate: '2026-08-12',
  costRule: 'Complete-system planning range: GPUs plus the minimum credible host, memory, storage, cooling, cabling, and power. Tax, shipping, spares, and facility work excluded.',
  scoreRule: '25% usable capacity · 35% inferred interactive speed · 20% complete-system value · 10% power/outlet · 10% fabric',
  warning: 'The score is a decision aid, not a benchmark. Measured anchors outrank inferred ranges; low-confidence routes should be rented or tested before purchase.',
} as const;
