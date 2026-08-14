export type Category =
  | 'cpu'
  | 'motherboard'
  | 'gpu'
  | 'ram'
  | 'mini-pc'
  | 'server-system'
  | 'psu'
  | 'chassis'
  | 'cooler'
  | 'storage'
  | 'nic'
  | 'apple-system';
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
  pcieSlots?: PcieSlotSpec[];
  above4gDecoding?: boolean;
  resizableBar?: boolean;
  iommuSupport?: boolean;
  auxiliaryPciePower?: string[];
}

export interface PcieSlotSpec {
  id: string;
  label: string;
  generation: number;
  physicalLanes: number;
  electricalLanes: number;
  source: 'cpu' | 'chipset' | 'switch';
  position: number;
  spacingSlots: number;
  bifurcation?: string[];
  sharesWith?: string[];
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
  profile: 'EXPO' | 'XMP' | 'EXPO + XMP' | 'JEDEC';
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

export interface Psu extends BaseProduct {
  category: 'psu';
  continuousPowerW: number;
  peakPowerW?: number;
  efficiencyRating: '80 Plus Gold' | '80 Plus Platinum' | '80 Plus Titanium';
  atxVersion: string;
  formFactor: 'ATX' | 'SFX' | 'SFX-L' | 'server';
  inputVoltage: string;
  pcie8PinConnectors: number;
  native12v2x6Connectors: number;
  eps8PinConnectors: number;
  redundant?: boolean;
}

export interface Chassis extends BaseProduct {
  category: 'chassis';
  formFactors: Motherboard['formFactor'][];
  maxGpuLengthMm: number;
  expansionSlots: number;
  maxGpuSlotWidth: number;
  psuFormFactors: Psu['formFactor'][];
  rackUnits?: number;
  passiveGpuReady: boolean;
  radiatorSupportMm?: number[];
}

export interface Cooler extends BaseProduct {
  category: 'cooler';
  coolerType: 'air' | 'liquid' | 'server-air';
  supportedSockets: string[];
  thermalCapacityW: number;
  heightMm?: number;
  radiatorSizeMm?: number;
}

export interface StorageDevice extends BaseProduct {
  category: 'storage';
  capacityGb: number;
  interface: string;
  formFactor: string;
  sequentialReadMbS: number;
  enduranceTbw?: number;
  powerW: number;
}

export interface Nic extends BaseProduct {
  category: 'nic';
  speedGbps: number;
  ports: number;
  interface: string;
  pcieGeneration: number;
  pcieLanes: number;
  powerW: number;
  connector: string;
  rdma: boolean;
}

export interface AppleSystem extends BaseProduct {
  category: 'apple-system';
  systemClass: 'portable' | 'desktop';
  chip: string;
  cpuCores: number;
  gpuCores: number;
  unifiedMemoryGb: number;
  memoryBandwidthGbS: number;
  storageGb: number;
  maxSystemPowerW: number;
  upgradeable: false;
  universalLlama2?: {
    promptTokensPerSecond: number;
    generatedTokensPerSecond: number;
    evidence: 'measured-public' | 'modeled';
    sourceUrl: string;
  };
}

export type Product =
  | Cpu
  | Motherboard
  | Gpu
  | Ram
  | MiniPc
  | ServerSystem
  | Psu
  | Chassis
  | Cooler
  | StorageDevice
  | Nic
  | AppleSystem;

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

export type HomelabWorkload = 'chat' | 'coding' | 'rag' | 'image' | 'fine-tune' | 'multi-user';

export interface BuildSpec {
  cpuId?: string;
  motherboardId?: string;
  ramId?: string;
  gpuId?: string;
  gpuCount: number;
  gpuPowerLimitPercent: number;
  psuId?: string;
  chassisId?: string;
  coolerId?: string;
  storageId?: string;
  nicId?: string;
  electricalProfileId: string;
  workload: HomelabWorkload;
  modelProfileId: string;
  contextTokens: number;
  concurrentUsers: number;
  budgetCents?: number;
  ownedProductIds?: string[];
}

export interface AuditCheck {
  code: string;
  status: 'pass' | 'fail' | 'warning' | 'unknown';
  severity: 'critical' | 'important' | 'advisory';
  title: string;
  detail: string;
  evidenceUrl?: string;
  fix?: string;
}

export interface ElectricalProfile {
  id: string;
  label: string;
  voltage: number;
  breakerAmps: number;
  continuousLoadFactor: number;
  region: string;
}

export interface PowerPlan {
  idleW: number;
  typicalW: number;
  componentPeakW: number;
  wallPeakW: number;
  recommendedPsuW: number;
  selectedPsuW?: number;
  circuitContinuousLimitW: number;
  circuitUtilizationPercent: number;
  estimatedAmps: number;
  heatBtuH: number;
  outletVerdict: 'ordinary-outlet' | 'dedicated-circuit' | '240v-recommended' | 'not-suitable';
  performanceRetentionPercent: number;
  notes: string[];
}

export interface ModelProfile {
  id: string;
  label: string;
  parametersB: number;
  quantization: string;
  weightGb: number;
  baseOverheadGb: number;
  kvGbPer8kContext: number;
  sourceUrl: string;
}

export interface ModelFitReport {
  status: 'fits-accelerator' | 'fits-multi-gpu' | 'fits-cpu-offload' | 'does-not-fit' | 'unknown';
  label: string;
  requiredMemoryGb: number;
  addressableMemoryGb: number;
  aggregateMemoryGb: number;
  estimatedMaxContext: number;
  estimatedConcurrentUsers: number;
  explanation: string;
  confidence: 'measured-boundary' | 'calculated' | 'planning-estimate';
}

export interface HomelabAudit {
  schemaVersion: 2;
  status: 'works' | 'works-with-limitations' | 'needs-changes' | 'incomplete';
  headline: string;
  checks: AuditCheck[];
  totalCents: number;
  uncoveredCostItems: string[];
  power: PowerPlan;
  modelFit: ModelFitReport;
  laneSummary: Array<{ slot: string; device: string; lanes: string; note: string }>;
}
