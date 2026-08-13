export type Category = 'cpu' | 'motherboard' | 'gpu' | 'ram' | 'mini-pc' | 'server-system';
export type BuilderCategory = 'cpu' | 'motherboard' | 'gpu' | 'ram';

export interface PriceReference {
  amountCents: number;
  currency: 'USD';
  priceType: 'MSRP' | 'store' | 'reference';
  retailer: string;
  sourceUrl: string;
  observedAt: string;
}

export type BenchmarkWorkload = 'cpu-overall' | 'cpu-single-thread' | 'gpu-3d' | 'gpu-compute';

export interface BenchmarkResult {
  benchmarkKey: 'passmark-cpu' | 'passmark-single-thread' | 'passmark-g3d' | 'geekbench-opencl';
  benchmarkName: string;
  benchmarkVersion: string;
  workload: BenchmarkWorkload;
  score: number;
  unit: 'points';
  higherIsBetter: boolean;
  resultType: 'aggregate' | 'limited-sample';
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  sampleCount?: number;
  sourceDeviceName: string;
  notes: string;
}

export interface UsedMarketListing {
  title: string;
  amountCents: number;
  sellerName: string;
  sellerFeedbackPercent: number;
  sellerFeedbackCount: number;
  sourceUrl: string;
}

export interface UsedMarketSnapshot {
  marketplace: 'eBay';
  condition: 'used';
  observedAt: string;
  searchUrl: string;
  sellerRule: string;
  listings: UsedMarketListing[];
}

export interface GpuParallelProcessors {
  count: number;
  label: 'CUDA cores' | 'stream processors' | 'Xe cores';
  scope: 'per GPU';
  sourceUrl: string;
}

export interface LlmBenchmarkResult {
  profileKey: 'llama2-7b-q4_0-tg128-no-fa';
  modelName: 'Llama 2 7B';
  modelFile: 'llama-2-7b.Q4_0.gguf';
  quantization: 'Q4_0';
  engine: 'llama.cpp';
  engineCommit?: string;
  backend: 'CUDA' | 'ROCm' | 'Vulkan';
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
  sourceDeviceName: string;
  observedAt: string;
  notes: string;
}

export interface BaseProduct {
  id: string;
  category: Category;
  manufacturer: string;
  name: string;
  description: string;
  price: PriceReference;
  tags: string[];
  specSourceUrl?: string;
  compatibilitySourceUrl?: string;
  benchmarks?: BenchmarkResult[];
}

export interface Cpu extends BaseProduct {
  category: 'cpu';
  socket: string;
  cores: number;
  threads: number;
  boostClockGhz: number;
  basePowerW: number;
  memoryTypes: Array<'DDR4' | 'DDR5'>;
  integratedGraphics: boolean;
  architecture?: string;
  series?: string;
  baseClockGhz?: number;
  l3CacheMb?: number;
  memoryChannels?: number;
  memoryChannelWidthBits?: number;
  memoryBusWidthBits?: number;
  maxMemoryGb?: number;
  memorySpeedMt?: number;
  theoreticalMemoryBandwidthGbS?: number;
  memoryModuleTypes?: string[];
  eccSupport?: boolean;
  pcieGeneration?: number;
  pcieLanes?: number;
  pcieTotalLanes?: number;
  pcieUsableLanes?: number;
  pcieLaneRateGtS?: number;
  pciePayloadGbSPerLane?: number;
  theoreticalPcieBandwidthGbS?: number;
  vendorLockRisk?: boolean;
  oemOnly?: boolean;
  serverOnly?: boolean;
  optanePmemSeries?: '100' | '200';
  optaneCompatibilityStatus?: 'Intel-listed';
  nativeBfloat16?: boolean;
  vectorExtensions?: string[];
  aiInferenceTier?: string;
  aiGpuHostTier?: string;
  aiRankWithinOptane?: number;
  aiRankTotal?: number;
  aiAssessment?: string;
  launchDate?: string;
}

export interface Motherboard extends BaseProduct {
  category: 'motherboard';
  socket: string;
  chipset: string;
  formFactor: 'ATX' | 'Micro ATX' | 'Mini ITX' | 'CEB' | 'E-ATX' | 'EEB';
  memoryType: 'DDR4' | 'DDR5';
  memorySlots: number;
  maxMemoryGb: number;
  pcieX16Slots: number;
  m2Slots: number;
  wifi: boolean;
  revision?: string;
  memoryChannels?: number;
  eccSupport?: boolean;
  registeredMemorySupport?: boolean;
  memoryModuleTypes?: string[];
  pcieGeneration?: number;
  platformPcieLanes?: number;
  cpuDirectExpansionLanes?: number;
  cpuDirectM2Lanes?: number;
  chipsetUplinkLanes?: number;
  dimmsPerChannel?: number;
  maxDimmCapacityGb?: number;
  u2Ports?: number;
  networkPorts?: string[];
  slimSas4iPorts?: number;
  sataPorts?: number;
  pcieSlotConfiguration?: string;
  supportedCpuSeries?: string[];
  boardDimensionsMm?: string;
  bmc?: string;
  maxCpuTdpW?: number;
  wifiM2Slots?: number;
  supportedCpuIds?: string[];
  requiredBiosByCpuId?: Record<string, string>;
  registeredMemoryRequired?: boolean;
}

export interface Gpu extends BaseProduct {
  category: 'gpu';
  vramGb: number;
  interface: string;
  lengthMm: number;
  boardPowerW: number;
  recommendedPsuW: number;
  architecture?: string;
  generation?: string;
  segment?: 'consumer' | 'workstation' | 'data-center';
  releaseYear?: number;
  vramType?: string;
  memoryBusBits?: number;
  memoryBandwidthGbS?: number;
  /** Memory available to one GPU/process when a board contains multiple GPUs. */
  addressableVramGb?: number;
  gpuCount?: number;
  memoryPool?: 'unified' | 'split';
  pcieGeneration?: number;
  pcieLanes?: number;
  slotWidth?: number;
  height?: 'full-height' | 'low-profile';
  cooling?: 'active' | 'passive' | 'double-flow-through' | 'liquid';
  displayOutputs?: boolean;
  powerConnectors?: string;
  availability?: 'current' | 'discontinued' | 'regional' | 'preview';
  softwarePlatform?: 'CUDA' | 'ROCm';
  /** Vendor-published sparse FP4 peak; a theoretical capability, not LLM throughput. */
  fp4AiTops?: number;
  tensorCoreGeneration?: string;
  cudaComputeCapability?: string;
  parallelProcessors?: GpuParallelProcessors;
  llmBenchmarks?: LlmBenchmarkResult[];
  notes?: string;
  usedMarket?: UsedMarketSnapshot;
}

export interface Ram extends BaseProduct {
  category: 'ram';
  memoryType: 'DDR4' | 'DDR5';
  capacityGb: number;
  modules: number;
  speedMt: number;
  casLatency: number;
  profile: 'EXPO' | 'XMP' | 'EXPO + XMP';
  registered?: boolean;
  ecc?: boolean;
}

export interface MiniPc extends BaseProduct {
  category: 'mini-pc';
  processor: string;
  graphics: string;
  memoryGb: number;
  storageGb: number;
  memoryType: string;
  npuTops: number;
  totalAiTops: number | null;
  memoryUpgradeable: boolean;
  architecture?: string;
  systemType?: 'mini-pc' | 'personal-ai-supercomputer';
  memoryBandwidthGbS?: number;
  chipTdpW?: number;
  powerSupplyW?: number;
  aiPerformanceLabel?: string;
  maxInferenceParametersB?: number;
  maxFineTuneParametersB?: number;
  llmBenchmarks?: LlmBenchmarkResult[];
}

export type SluiceV2Fit = 'drop-in' | 'custom-fabrication' | 'not-viable';

export interface ServerSystem extends BaseProduct {
  category: 'server-system';
  family: string;
  rackUnits: number;
  cpuSockets: number;
  cpuSocket: 'LGA3647' | 'LGA4189';
  cpuGeneration: string;
  supportedCpuModels: string[];
  cpuQualificationNote: string;
  memoryChannelsPerCpu: number;
  dramSlots: number;
  optaneSeries: '100' | '200';
  optaneModuleCapacitiesGb: number[];
  optaneSlots: number;
  maxOptaneGb: number;
  optaneModes: Array<'Memory Mode' | 'App Direct' | 'Mixed / Dual Mode'>;
  pcieGeneration: number;
  pcieSlots: number;
  pcieSlotDetails: string;
  powerSupplyOptionsW: number[];
  powerSupplyCount: number;
  powerRedundancy: string;
  maxCpuTdpW: number;
  maxOptaneModulePowerW: number;
  maxOptanePowerW: number;
  cpuAndOptaneBudgetW: number;
  powerDrawStatus: 'configuration-dependent';
  powerPlanningNote: string;
  powerSourceUrl: string;
  boardFormFactor: string;
  boardDimensionsMm: string;
  systemDimensionsMm: string;
  sluiceV2Fit: SluiceV2Fit;
  sluiceV2Reason: string;
  linuxSupport: boolean;
  windowsSupport: boolean;
  hypervisorSupport: boolean;
  supportedOs: string[];
  osQualificationNote: string;
  availability: 'discontinued' | 'used / refurbished';
  sourceUrls: string[];
}

export type Product = Cpu | Motherboard | Gpu | Ram | MiniPc | ServerSystem;

export interface CatalogResponse {
  products: Product[];
  meta: {
    total: number;
    counts: Record<Category, number>;
    lastUpdated: string;
    benchmarks: {
      results: number;
      products: number;
      lastUpdated: string;
    };
  };
}

export type BuildSelection = Partial<Record<BuilderCategory, string>>;

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  detail: string;
  categories: BuilderCategory[];
}

export interface ValidationResult {
  compatible: boolean;
  complete: boolean;
  issues: ValidationIssue[];
  totalCents: number;
  selectedCount: number;
  missing: BuilderCategory[];
  power: {
    estimatedLoadW: number;
    recommendedPsuW: number;
  };
}
