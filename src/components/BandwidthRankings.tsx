import { ChevronDown, CircuitBoard, Cpu, ExternalLink, Gauge, MonitorUp, Search, ShoppingCart, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Cpu as CpuProduct, Gpu, LlmBenchmarkResult, Motherboard, Product, UsedMarketListing } from '../types';
import {
  formatGpuMarketPriceRange,
  gpuMarketPriceRange,
  ownedGpuBaselines,
  type OwnedGpuBaseline,
} from '../data/gpu-owner-comparison';
import { Gpu32GbResearch } from './Gpu32GbResearch';
import { qualifiedLlmBenchmarkFor, type QualifiedLlmBenchmark } from '../data/qualified-llm-benchmarks';
import { GpuFamilyDirectory, type GpuDirectoryVendor, type GpuRankingVendorScope } from './GpuFamilyDirectory';
import { ModelWorkloadComparison } from './ModelWorkloadComparison';
import { ProBlackwellBenchmarks } from './ProBlackwellBenchmarks';
import { UniversalLlama2Coverage } from './UniversalLlama2Coverage';
import { V100Benchmarks } from './V100Benchmarks';
import { OwnedGpuArrows } from './OwnedGpuArrows';
import { ApplesLlmScoreSummary } from './ApplesLlmScoreSummary';
import { Gpu48GbRanking } from './Gpu48GbRanking';
import { scoreApplesComparableGpus } from '../data/apples-llm-score';
import {
  formatRepresentativePrice,
  meetsBuyerVramGate,
  MIN_BUYER_VRAM_GB,
  scorePriceAdjustedGpus,
} from '../data/price-adjusted-gpu-score';

export type BandwidthMetric = 'gpu-memory' | 'cpu-memory' | 'cpu-pcie' | 'motherboard-pcie';
export type PerformanceMetric = 'llm-tokens' | BandwidthMetric;

type RankedProduct = {
  product: Gpu | CpuProduct | Motherboard;
  bandwidthGbS: number;
  rank: number;
  detail: string;
  topology: string;
  qualifier?: string;
};

export type RankedLlmProduct = {
  product: Gpu;
  benchmark: LlmBenchmarkResult;
  rank: number;
};

export type AiGpuEntry = {
  product: Gpu;
  benchmark?: LlmBenchmarkResult;
  qualifiedBenchmark?: QualifiedLlmBenchmark;
  rank?: number;
};

const nvidiaAmperePlusArchitectures = new Set(['Ampere', 'Ada Lovelace', 'Hopper', 'Blackwell']);

export function isNvidiaAmpereOrNewer(product: Product) {
  return product.category === 'gpu'
    && product.manufacturer === 'NVIDIA'
    && Boolean(product.architecture && nvidiaAmperePlusArchitectures.has(product.architecture));
}

const pciePayloadPerLaneGbS: Record<number, number> = {
  3: 0.985,
  4: 1.969,
  5: 3.938,
};

const metricCopy: Record<PerformanceMetric, {
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Gauge;
}> = {
  'llm-tokens': {
    label: 'LLM generation speed',
    shortLabel: 'Tokens/sec',
    description: 'Measured single-stream tg128 generation on the exact same Llama 2 7B Q4_0 model file, with one GPU, full offload, and flash attention off.',
    icon: Gauge,
  },
  'gpu-memory': {
    label: 'GPU memory bandwidth',
    shortLabel: 'GPU VRAM',
    description: 'Peak VRAM bandwidth available to one addressable GPU. Split multi-GPU boards are normalized per GPU.',
    icon: MonitorUp,
  },
  'cpu-memory': {
    label: 'CPU memory bandwidth',
    shortLabel: 'CPU RAM',
    description: 'Theoretical peak system-memory bandwidth from the CPU memory controller and supported data rate.',
    icon: Cpu,
  },
  'cpu-pcie': {
    label: 'CPU PCIe bandwidth',
    shortLabel: 'CPU PCIe',
    description: 'Aggregate theoretical PCIe payload bandwidth from the CPU, measured in one direction.',
    icon: Gauge,
  },
  'motherboard-pcie': {
    label: 'Motherboard expansion bandwidth',
    shortLabel: 'Board PCIe',
    description: 'Aggregate theoretical payload across documented CPU-direct expansion lanes, measured in one direction.',
    icon: CircuitBoard,
  },
};

function roundBandwidth(value: number) {
  return Number(value.toFixed(1));
}

function gpuBandwidth(gpu: Gpu) {
  if (!gpu.memoryBandwidthGbS) return undefined;
  return gpu.memoryPool === 'split' && gpu.gpuCount
    ? roundBandwidth(gpu.memoryBandwidthGbS / gpu.gpuCount)
    : gpu.memoryBandwidthGbS;
}

function motherboardBandwidth(board: Motherboard) {
  if (!board.pcieGeneration || !board.cpuDirectExpansionLanes) return undefined;
  const perLane = pciePayloadPerLaneGbS[board.pcieGeneration];
  return perLane ? roundBandwidth(perLane * board.cpuDirectExpansionLanes) : undefined;
}

function rankedProduct(product: Product, metric: BandwidthMetric): Omit<RankedProduct, 'rank'> | undefined {
  if (metric === 'gpu-memory' && product.category === 'gpu') {
    const bandwidthGbS = gpuBandwidth(product);
    if (bandwidthGbS === undefined) return undefined;
    const split = product.memoryPool === 'split' && Boolean(product.gpuCount);
    return {
      product,
      bandwidthGbS,
      detail: `${product.vramType ?? 'VRAM type unpublished'}${product.memoryBusBits ? ` · ${product.memoryBusBits.toLocaleString()}-bit` : ''}`,
      topology: split
        ? `${product.addressableVramGb ?? product.vramGb / (product.gpuCount ?? 1)} GB per GPU · ${product.gpuCount} separate pools`
        : `${product.vramGb} GB unified pool`,
      qualifier: split ? `${product.memoryBandwidthGbS?.toLocaleString()} GB/s total across the board` : undefined,
    };
  }

  if (metric === 'cpu-memory' && product.category === 'cpu' && product.theoreticalMemoryBandwidthGbS) {
    return {
      product,
      bandwidthGbS: product.theoreticalMemoryBandwidthGbS,
      detail: `${product.memoryTypes.join(' / ')}-${product.memorySpeedMt?.toLocaleString() ?? '?'}`,
      topology: `${product.memoryChannels ?? '?'} channels · ${product.memoryBusWidthBits?.toLocaleString() ?? '?'}-bit aggregate bus`,
    };
  }

  if (metric === 'cpu-pcie' && product.category === 'cpu' && product.theoreticalPcieBandwidthGbS) {
    return {
      product,
      bandwidthGbS: product.theoreticalPcieBandwidthGbS,
      detail: `PCIe Gen${product.pcieGeneration ?? '?'} · ${product.pcieLaneRateGtS ?? '?'} GT/s per lane`,
      topology: `${product.pcieLanes ?? '?'} lanes${product.pcieUsableLanes ? ` · ${product.pcieUsableLanes} usable` : ''}`,
    };
  }

  if (metric === 'motherboard-pcie' && product.category === 'motherboard') {
    const bandwidthGbS = motherboardBandwidth(product);
    if (bandwidthGbS === undefined) return undefined;
    return {
      product,
      bandwidthGbS,
      detail: `PCIe Gen${product.pcieGeneration} · ${product.cpuDirectExpansionLanes} CPU-direct lanes`,
      topology: product.pcieSlotConfiguration ?? `${product.pcieX16Slots} physical x16 slots`,
      qualifier: 'Installed CPU and slot population can reduce available bandwidth',
    };
  }

  return undefined;
}

export function rankBandwidthProducts(products: Product[], metric: BandwidthMetric): RankedProduct[] {
  const sorted = products
    .map((product) => rankedProduct(product, metric))
    .filter((entry): entry is Omit<RankedProduct, 'rank'> => Boolean(entry))
    .sort((a, b) => b.bandwidthGbS - a.bandwidthGbS || a.product.name.localeCompare(b.product.name));

  let previousBandwidth: number | undefined;
  let previousRank = 0;
  return sorted.map((entry, index) => {
    const rank = entry.bandwidthGbS === previousBandwidth ? previousRank : index + 1;
    previousBandwidth = entry.bandwidthGbS;
    previousRank = rank;
    return { ...entry, rank };
  });
}

export function rankLlmProducts(
  products: Product[],
  profileKey: LlmBenchmarkResult['profileKey'] = 'llama2-7b-q4_0-tg128-no-fa',
): RankedLlmProduct[] {
  const sorted = products.flatMap((product) => {
    if (product.category !== 'gpu') return [];
    const benchmark = product.llmBenchmarks?.find((result) => result.profileKey === profileKey);
    return benchmark ? [{ product, benchmark }] : [];
  }).sort((a, b) => b.benchmark.generatedTokensPerSecond - a.benchmark.generatedTokensPerSecond
    || a.product.name.localeCompare(b.product.name));

  let previousScore: number | undefined;
  let previousRank = 0;
  return sorted.map((entry, index) => {
    const score = entry.benchmark.generatedTokensPerSecond;
    const rank = score === previousScore ? previousRank : index + 1;
    previousScore = score;
    previousRank = rank;
    return { ...entry, rank };
  });
}

export function buildAiGpuEntries(products: Product[]): AiGpuEntry[] {
  const ranked = rankLlmProducts(products);
  const measured = new Map(ranked.map((entry) => [entry.product.id, entry]));
  const unmeasured = products
    .filter((product): product is Gpu => product.category === 'gpu' && !measured.has(product.id))
    .sort((a, b) => a.manufacturer.localeCompare(b.manufacturer) || a.name.localeCompare(b.name))
    .map((product) => ({ product, qualifiedBenchmark: qualifiedLlmBenchmarkFor(product.id) }));
  return [...ranked, ...unmeasured];
}

function formatBandwidth(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function formatUsedPrice(amountCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100);
}

function compactFeedback(value: number) {
  if (value < 1000) return value.toLocaleString('en-US');
  return `${Number((value / 1000).toFixed(1))}K`;
}

function priceRange(listings: UsedMarketListing[]) {
  const amounts = listings.map((listing) => listing.amountCents).sort((a, b) => a - b);
  const lowest = formatUsedPrice(amounts[0]);
  const highest = formatUsedPrice(amounts.at(-1) ?? amounts[0]);
  return lowest === highest ? lowest : `${lowest}–${highest}`;
}

function genericEbaySearch(gpu: Gpu) {
  const query = encodeURIComponent(`${gpu.manufacturer} ${gpu.name} ${gpu.vramGb}GB GPU used`);
  return `https://www.ebay.com/sch/i.html?_nkw=${query}&_sacat=27386&LH_ItemCondition=3000&LH_BIN=1`;
}

function EbayUsedPrice({ gpu, baselines }: { gpu: Gpu; baselines: OwnedGpuBaseline[] }) {
  const market = gpu.usedMarket;
  const priceOverride = gpuMarketPriceRange(gpu);
  if (priceOverride?.source === 'owner-market-range') {
    return (
      <div className="market-price market-price--guidance">
        <strong>{formatGpuMarketPriceRange(priceOverride)}</strong>
        <small>{priceOverride.sourceLabel}</small>
        <OwnedGpuArrows gpu={gpu} baselines={baselines} metric="marketPrice" />
      </div>
    );
  }
  if (!market) {
    return (
      <a className="market-price market-price--missing" href={genericEbaySearch(gpu)} target="_blank" rel="noreferrer">
        <strong>Search used</strong><small>Not screened yet</small>
        <OwnedGpuArrows gpu={gpu} baselines={baselines} metric="marketPrice" />
      </a>
    );
  }
  if (market.listings.length === 0) {
    return (
      <a className="market-price market-price--missing" href={market.searchUrl} target="_blank" rel="noreferrer">
        <strong>No trusted match</strong><small>Checked {market.observedAt}</small>
        <OwnedGpuArrows gpu={gpu} baselines={baselines} metric="marketPrice" />
      </a>
    );
  }
  return (
    <details className="market-price market-price--found">
      <summary>
        <span><strong>{priceRange(market.listings)}</strong><small>{market.listings.length} screened eBay {market.listings.length === 1 ? 'ask' : 'asks'}</small><OwnedGpuArrows gpu={gpu} baselines={baselines} metric="marketPrice" /></span>
        <ChevronDown />
      </summary>
      <div className="market-price__menu">
        <header><ShoppingCart /><span><strong>Used eBay listings</strong><small>Asking price before shipping and tax · observed {market.observedAt}</small></span></header>
        {market.listings.map((item) => (
          <a href={item.sourceUrl} target="_blank" rel="noreferrer" key={item.sourceUrl}>
            <span><strong>{formatUsedPrice(item.amountCents)}</strong><small>{item.sellerName} · {item.sellerFeedbackPercent}% positive ({compactFeedback(item.sellerFeedbackCount)})</small></span>
            <ExternalLink />
          </a>
        ))}
        <p>{market.sellerRule}. Listing titles were checked for exact models; availability can change at any time.</p>
      </div>
    </details>
  );
}

function GpuReferencePrice({ gpu, baselines }: { gpu: Gpu; baselines: OwnedGpuBaseline[] }) {
  return (
    <a className="ai-reference-price" href={gpu.price.sourceUrl} target="_blank" rel="noreferrer">
      <strong>{gpu.price.amountCents > 0 ? formatUsedPrice(gpu.price.amountCents) : 'Quote / used'}</strong>
      <small>{gpu.price.priceType} · {gpu.price.retailer}</small>
      <i>Observed {gpu.price.observedAt}</i>
      <OwnedGpuArrows gpu={gpu} baselines={baselines} metric="referencePrice" />
    </a>
  );
}

function addressableVram(gpu: Gpu) {
  if (gpu.addressableVramGb) return gpu.addressableVramGb;
  if (gpu.memoryPool === 'split' && gpu.gpuCount) return gpu.vramGb / gpu.gpuCount;
  return gpu.vramGb;
}

function lowestUsedPrice(gpu: Gpu) {
  return gpuMarketPriceRange(gpu)?.lowCents;
}

function AiGpuDetails({ entry }: { entry: AiGpuEntry }) {
  const { product: gpu, benchmark, qualifiedBenchmark } = entry;
  const evidence = benchmark ?? qualifiedBenchmark;
  const processors = gpu.parallelProcessors;
  const bandwidth = gpuBandwidth(gpu);
  const usedCents = lowestUsedPrice(gpu);
  const ratedEfficiency = evidence && gpu.boardPowerW
    ? evidence.generatedTokensPerSecond / gpu.boardPowerW
    : undefined;
  const usedCostPerTokenRate = evidence && usedCents
    ? (usedCents / 100) / evidence.generatedTokensPerSecond
    : undefined;
  const topology = gpu.memoryPool === 'split'
    ? `${gpu.vramGb} GB physical · ${addressableVram(gpu)} GB per GPU · ${gpu.gpuCount} separate pools`
    : `${gpu.vramGb} GB unified pool`;

  return (
    <details className="ai-gpu-details">
      <summary>Full AI stats <ChevronDown /></summary>
      <div className="ai-gpu-details__grid">
        <div><small>Prompt ingestion</small><strong>{evidence ? `${formatBandwidth(evidence.promptTokensPerSecond)} tok/s` : 'Not measured'}</strong><span>{evidence ? `pp512 ± ${formatBandwidth(evidence.promptStdDev)}` : 'No matching pp512 run'}</span></div>
        <div><small>Parallel processors</small><strong>{processors ? `${processors.count.toLocaleString()} ${processors.label}` : 'Not researched'}</strong><span>{processors ? `${processors.scope} · vendor-native count` : 'No verified processor count stored'}</span>{processors && <a href={processors.sourceUrl} target="_blank" rel="noreferrer">Vendor source <ExternalLink /></a>}</div>
        <div><small>Theoretical AI peak</small><strong>{gpu.fp4AiTops ? `${formatBandwidth(gpu.fp4AiTops)} sparse FP4 TOPS` : 'Not published'}</strong><span>{gpu.tensorCoreGeneration ? `${gpu.tensorCoreGeneration} Tensor Cores` : 'Vendor AI-core generation not stored'}{gpu.cudaComputeCapability ? ` · CUDA CC ${gpu.cudaComputeCapability}` : ''}</span></div>
        <div><small>Runtime</small><strong>{evidence ? `${evidence.backend} · ${evidence.engine}` : gpu.softwarePlatform ?? 'Vendor stack'}</strong><span>{evidence ? `commit ${evidence.engineCommit ?? 'not reported'} · 1 GPU · no FA` : 'No comparable fixed-model run'}</span></div>
        <div><small>Memory topology</small><strong>{topology}</strong><span>{gpu.vramType ?? 'Memory type unpublished'}</span></div>
        <div><small>Memory fabric</small><strong>{bandwidth ? `${formatBandwidth(bandwidth)} GB/s` : 'Not published'}</strong><span>{gpu.memoryBusBits ? `${gpu.memoryBusBits.toLocaleString()}-bit bus` : 'Bus width unpublished'}{gpu.memoryPool === 'split' ? ' · per GPU' : ''}</span></div>
        <div><small>Host interface</small><strong>{gpu.pcieGeneration ? `PCIe Gen${gpu.pcieGeneration} x${gpu.pcieLanes ?? '?'}` : gpu.interface}</strong><span>{gpu.interface}</span></div>
        <div><small>Power system</small><strong>{gpu.boardPowerW ? `${gpu.boardPowerW} W rated board power` : 'Power unpublished'}</strong><span>{gpu.powerConnectors ?? 'Connector varies'} · {gpu.recommendedPsuW ? `${gpu.recommendedPsuW} W PSU reference` : 'PSU not specified'}</span></div>
        <div><small>Rated-efficiency index</small><strong>{ratedEfficiency ? `${ratedEfficiency.toFixed(2)} tok/s per rated W` : 'Not available'}</strong><span>Generation rate ÷ board-power rating; not measured wall power</span></div>
        <div><small>Physical / cooling</small><strong>{gpu.cooling ?? 'Board-specific cooling'} · {gpu.slotWidth ? `${gpu.slotWidth}-slot` : 'width varies'}</strong><span>{gpu.lengthMm ? `${gpu.lengthMm} mm` : 'Length varies'} · {gpu.height ?? 'full-height / varies'} · {gpu.displayOutputs === false ? 'no display output' : 'display-capable'}</span></div>
        <div><small>Used value</small><strong>{usedCostPerTokenRate ? `${formatUsedPrice(Math.round(usedCostPerTokenRate * 100))} per tok/s` : 'Not available'}</strong><span>Lowest screened asking price ÷ measured generation rate</span></div>
        <div><small>Availability</small><strong>{gpu.availability ?? 'Availability varies'}</strong><span>{gpu.segment?.replace('-', ' ') ?? 'market unknown'} · introduced {gpu.releaseYear ?? 'unknown'}</span></div>
        <div><small>Sources</small><strong>{evidence?.sourceName ?? 'No LLM measurement'}</strong><span>{evidence ? `${evidence.modelFile} · tg128 / pp512${qualifiedBenchmark ? ' · unranked checkpoint variant' : ''}` : 'Specifications only; performance left unranked'}</span><span className="ai-source-links">{evidence && <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">Benchmark <ExternalLink /></a>}<a href={gpu.specSourceUrl ?? gpu.price.sourceUrl} target="_blank" rel="noreferrer">GPU specs <ExternalLink /></a></span></div>
      </div>
      {qualifiedBenchmark && <p className="ai-gpu-qualifier"><strong>Control boundary:</strong> {qualifiedBenchmark.notes}</p>}
      {gpu.notes && <p className="ai-gpu-qualifier"><strong>Important qualifier:</strong> {gpu.notes}</p>}
    </details>
  );
}

function eligibleCount(products: Product[], metric: PerformanceMetric) {
  const category = metric === 'llm-tokens' || metric === 'gpu-memory' ? 'gpu' : metric === 'motherboard-pcie' ? 'motherboard' : 'cpu';
  return products.filter((product) => product.category === category).length;
}

function gpuMetricFor(metric: PerformanceMetric) {
  return metric === 'llm-tokens' || metric === 'gpu-memory';
}

function rerankAiEntries(entries: AiGpuEntry[]) {
  let measuredIndex = 0;
  let previousScore: number | undefined;
  let previousRank = 0;
  return entries.map((entry) => {
    if (!entry.benchmark) return { ...entry, rank: undefined };
    measuredIndex += 1;
    const score = entry.benchmark.generatedTokensPerSecond;
    const rank = score === previousScore ? previousRank : measuredIndex;
    previousScore = score;
    previousRank = rank;
    return { ...entry, rank };
  });
}

function rerankBandwidthEntries(entries: RankedProduct[]) {
  let previousBandwidth: number | undefined;
  let previousRank = 0;
  return entries.map((entry, index) => {
    const rank = entry.bandwidthGbS === previousBandwidth ? previousRank : index + 1;
    previousBandwidth = entry.bandwidthGbS;
    previousRank = rank;
    return { ...entry, rank };
  });
}

export function BandwidthRankings({ products }: { products: Product[] }) {
  const [metric, setMetric] = useState<PerformanceMetric>('llm-tokens');
  const [search, setSearch] = useState('');
  const [manufacturer, setManufacturer] = useState('all');
  const [architecture, setArchitecture] = useState('all');
  const [gpuSegment, setGpuSegment] = useState<'all' | 'consumer' | 'workstation' | 'data-center'>('all');
  const [measurement, setMeasurement] = useState<'all' | 'measured' | 'unmeasured'>('all');
  const [usedPrice, setUsedPrice] = useState<'all' | 'found' | 'checked-missing' | 'not-researched'>('all');
  const [gpuVendorScope, setGpuVendorScope] = useState<GpuRankingVendorScope>('NVIDIA');
  const [directoryVendor, setDirectoryVendor] = useState<GpuDirectoryVendor>('NVIDIA');

  const ownedBaselines = useMemo(() => ownedGpuBaselines(products), [products]);
  const llmRankings = useMemo(() => rankLlmProducts(products), [products]);
  const applesScores = useMemo(() => scoreApplesComparableGpus(products), [products]);
  const applesScoreByProductId = useMemo(
    () => new Map(applesScores.map((score) => [score.product.id, score])),
    [applesScores],
  );
  const buyerScores = useMemo(() => scorePriceAdjustedGpus(products), [products]);
  const buyerScoreByProductId = useMemo(
    () => new Map(buyerScores.map((score) => [score.product.id, score])),
    [buyerScores],
  );
  const aiGpuEntries = useMemo(() => buildAiGpuEntries(products), [products]);
  const bandwidthRankings = useMemo(
    () => metric === 'llm-tokens' ? [] : rankBandwidthProducts(products, metric),
    [products, metric],
  );
  const scopedAiGpuEntries = useMemo(() => gpuVendorScope === 'all'
    ? aiGpuEntries
    : rerankAiEntries(aiGpuEntries.filter(({ product }) => product.manufacturer === gpuVendorScope)),
  [aiGpuEntries, gpuVendorScope]);
  const scopedBandwidthRankings = useMemo(() => gpuVendorScope !== 'all' && metric === 'gpu-memory'
    ? rerankBandwidthEntries(bandwidthRankings.filter(({ product }) => product.manufacturer === gpuVendorScope))
    : bandwidthRankings, [bandwidthRankings, metric, gpuVendorScope]);
  const scopeRankings = metric === 'llm-tokens' ? scopedAiGpuEntries : scopedBandwidthRankings;
  const manufacturers = useMemo(
    () => Array.from(new Set(scopeRankings.map(({ product }) => product.manufacturer))).sort(),
    [scopeRankings],
  );
  const architectures = useMemo(
    () => Array.from(new Set(scopeRankings.map(({ product }) => product.category === 'gpu' ? product.architecture : undefined)
      .filter((item): item is string => Boolean(item)))).sort(),
    [scopeRankings],
  );
  const matchesFilters = (product: Gpu | CpuProduct | Motherboard) => {
    if (gpuVendorScope !== 'all' && gpuMetricFor(metric) && product.manufacturer !== gpuVendorScope) return false;
    if (manufacturer !== 'all' && product.manufacturer !== manufacturer) return false;
    if (architecture !== 'all' && (product.category !== 'gpu' || product.architecture !== architecture)) return false;
    if (gpuSegment !== 'all' && (product.category !== 'gpu' || product.segment !== gpuSegment)) return false;
    if (usedPrice !== 'all') {
      if (product.category !== 'gpu') return false;
      const listingCount = product.usedMarket?.listings.length ?? 0;
      if (usedPrice === 'found' && listingCount === 0) return false;
      if (usedPrice === 'checked-missing' && (!product.usedMarket || listingCount > 0)) return false;
      if (usedPrice === 'not-researched' && product.usedMarket) return false;
    }
    if (search && ![product.name, product.manufacturer, product.description, ...product.tags]
      .join(' ').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  };
  const filteredLlm = scopedAiGpuEntries.filter((entry) => {
    if (measurement === 'measured' && !entry.benchmark) return false;
    if (measurement === 'unmeasured' && entry.benchmark) return false;
    return matchesFilters(entry.product);
  });
  const filteredBandwidth = scopedBandwidthRankings.filter(({ product }) => matchesFilters(product));

  const activeMetric = metricCopy[metric];
  const MetricIcon = activeMetric.icon;
  const maximumBandwidth = scopedBandwidthRankings[0]?.bandwidthGbS ?? 1;
  const llmLeader = filteredLlm.find((entry) => entry.benchmark);
  const bandwidthLeader = filteredBandwidth[0];
  const leader = metric === 'llm-tokens' ? llmLeader : bandwidthLeader;
  const coverage = metric === 'llm-tokens'
    ? `${scopedAiGpuEntries.filter(({ benchmark }) => benchmark).length} / ${scopedAiGpuEntries.length} measured`
    : `${scopeRankings.length} / ${gpuVendorScope !== 'all' && gpuMetricFor(metric)
      ? products.filter((product) => product.category === 'gpu' && product.manufacturer === gpuVendorScope).length
      : eligibleCount(products, metric)}`;
  const researchedMarketCount = scopeRankings.filter(({ product }) => product.category === 'gpu' && product.usedMarket).length;
  const pricedMarketCount = scopeRankings.filter(({ product }) => product.category === 'gpu' && (product.usedMarket?.listings.length ?? 0) > 0).length;
  const gpuMetric = gpuMetricFor(metric);
  const filtersActive = (gpuMetric && gpuVendorScope !== 'all') || search || manufacturer !== 'all' || architecture !== 'all' || gpuSegment !== 'all' || measurement !== 'all' || usedPrice !== 'all';

  const changeMetric = (next: PerformanceMetric) => {
    setMetric(next);
    setManufacturer('all');
    setArchitecture('all');
    setGpuSegment('all');
    setMeasurement('all');
    setUsedPrice('all');
    setSearch('');
  };

  const changeDirectoryVendor = (vendor: GpuDirectoryVendor) => {
    setDirectoryVendor(vendor);
    setGpuVendorScope(vendor);
    setManufacturer('all');
    setArchitecture('all');
    setGpuSegment('all');
    setMeasurement('all');
    setSearch('');
  };

  const changeRankingScope = (scope: GpuRankingVendorScope) => {
    setGpuVendorScope(scope);
    setManufacturer('all');
  };

  const focusGpu = (gpu: Gpu) => {
    setMetric('llm-tokens');
    setDirectoryVendor(gpu.manufacturer === 'AMD' ? 'AMD' : 'NVIDIA');
    setGpuVendorScope(gpu.manufacturer === 'AMD' ? 'AMD' : 'NVIDIA');
    setManufacturer('all');
    setArchitecture('all');
    setGpuSegment('all');
    setMeasurement('all');
    setUsedPrice('all');
    setSearch(gpu.name);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById('gpu-ranking-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  };

  return (
    <main className="bandwidth-page">
      <section className="page-hero bandwidth-hero">
        <div>
          <span className="section-kicker">MEASURED PERFORMANCE / FASTEST FIRST</span>
          <h1>Performance, ranked.</h1>
          <p>Start with measured LLM tokens per second, then use CUDA or stream-processor counts and bandwidth to understand why. Missing measurements stay unranked—never estimated from specifications.</p>
        </div>
        <div className="bandwidth-leader">
          <MetricIcon />
          <span>FASTEST {filtersActive ? 'MATCH' : 'MEASURED'}</span>
          <strong>{metric === 'llm-tokens'
            ? llmLeader?.benchmark ? `${formatBandwidth(llmLeader.benchmark.generatedTokensPerSecond)} tok/s` : 'No match'
            : bandwidthLeader ? `${formatBandwidth(bandwidthLeader.bandwidthGbS)} GB/s` : 'No match'}</strong>
          <small>{leader?.product.name ?? 'Widen the filters'}</small>
        </div>
      </section>

      <section className="bandwidth-shell">
        <div className="metric-switcher" role="tablist" aria-label="Performance measurement">
          {(Object.keys(metricCopy) as PerformanceMetric[]).map((key) => {
            const copy = metricCopy[key];
            const Icon = copy.icon;
            const count = key === 'llm-tokens' ? llmRankings.length : rankBandwidthProducts(products, key).length;
            return (
              <button key={key} role="tab" aria-selected={metric === key} className={metric === key ? 'active' : ''} onClick={() => changeMetric(key)}>
                <Icon />
                <span><small>{copy.shortLabel}</small><strong>{copy.label}</strong></span>
                <b>{count}</b>
              </button>
            );
          })}
        </div>

        <div className="bandwidth-context">
          <div><MetricIcon /><span><strong>{activeMetric.label}</strong><small>{activeMetric.description}</small></span></div>
          <span><b>{coverage}</b> catalog products {metric === 'llm-tokens' ? 'with exact-profile results' : 'ranked'}{gpuMetric && <> · <b>{pricedMarketCount} / {researchedMarketCount}</b> screened models priced</>}</span>
        </div>

        {metric === 'llm-tokens' && <ApplesLlmScoreSummary products={products} />}
        {metric === 'llm-tokens' && <Gpu48GbRanking products={products} />}

        {gpuMetric && (
          <GpuFamilyDirectory
            products={products}
            vendor={directoryVendor}
            rankingScope={gpuVendorScope}
            onVendorChange={changeDirectoryVendor}
            onRankingScopeChange={changeRankingScope}
            onSelectProduct={focusGpu}
          />
        )}

        {metric === 'llm-tokens' && directoryVendor === 'NVIDIA' && <UniversalLlama2Coverage products={products} />}
        {metric === 'llm-tokens' && directoryVendor === 'NVIDIA' && <V100Benchmarks products={products} />}
        {metric === 'llm-tokens' && directoryVendor === 'NVIDIA' && <ProBlackwellBenchmarks products={products} />}
        {metric === 'llm-tokens' && <Gpu32GbResearch products={products} vendorScope={gpuVendorScope} />}
        {metric === 'llm-tokens' && <ModelWorkloadComparison />}

        <div className="bandwidth-toolbar">
          <label className="search-field large"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a model or manufacturer…" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X /></button>}</label>
          <select aria-label="Manufacturer" value={manufacturer} onChange={(event) => setManufacturer(event.target.value)}>
            <option value="all">All manufacturers</option>
            {manufacturers.map((item) => <option key={item}>{item}</option>)}
          </select>
          {gpuMetric && (
            <>
              <select aria-label="GPU architecture" value={architecture} onChange={(event) => setArchitecture(event.target.value)}>
                <option value="all">All GPU architectures</option>
                {architectures.map((item) => <option key={item}>{item}</option>)}
              </select>
              {metric === 'llm-tokens' && (
                <select aria-label="LLM measurement status" value={measurement} onChange={(event) => setMeasurement(event.target.value as typeof measurement)}>
                  <option value="all">All GPUs: measured + unmeasured</option>
                  <option value="measured">Measured tokens/sec only</option>
                  <option value="unmeasured">Missing tokens/sec only</option>
                </select>
              )}
              <select aria-label="GPU market" value={gpuSegment} onChange={(event) => setGpuSegment(event.target.value as typeof gpuSegment)}>
                <option value="all">All GPU markets</option>
                <option value="consumer">Consumer</option>
                <option value="workstation">Workstation</option>
                <option value="data-center">Data center</option>
              </select>
              <select aria-label="Used eBay price" value={usedPrice} onChange={(event) => setUsedPrice(event.target.value as typeof usedPrice)}>
                <option value="all">Any used-price status</option>
                <option value="found">Screened eBay price found</option>
                <option value="checked-missing">Checked, no trusted match</option>
                <option value="not-researched">Used price not researched</option>
              </select>
            </>
          )}
        </div>

        {metric === 'llm-tokens' ? (
          <div className="ai-gpu-list" id="gpu-ranking-table" aria-label="AI graphics card specifications and LLM generation rankings">
            <div className="ai-gpu-row ai-gpu-row--heading" aria-hidden="true">
              <span>Buyer / perf</span><span>Graphics card</span><span>LLM decode</span><span>VRAM &amp; speed</span><span>Power</span><span>Original / reference</span><span>Trusted used</span>
            </div>
            <ol>
              {filteredLlm.map((entry) => {
                const gpu = entry.product;
                const benchmark = entry.benchmark;
                const applesScore = applesScoreByProductId.get(gpu.id);
                const buyerScore = buyerScoreByProductId.get(gpu.id);
                const qualifiedBenchmark = entry.qualifiedBenchmark;
                const evidence = benchmark ?? qualifiedBenchmark;
                const bandwidth = gpuBandwidth(gpu);
                const ratedEfficiency = evidence && gpu.boardPowerW
                  ? evidence.generatedTokensPerSecond / gpu.boardPowerW
                  : undefined;
                return (
                  <li className={`ai-gpu-item ${benchmark ? 'is-measured' : qualifiedBenchmark ? 'is-qualified' : 'is-unmeasured'} ${ownedBaselines.some((baseline) => baseline.productId === gpu.id) ? 'is-owned' : ''}`} key={gpu.id}>
                    <div className="ai-gpu-row">
                      <span className={`bandwidth-rank apples-score-cell ${buyerScore && buyerScore.rank <= 3 ? `bandwidth-rank--${buyerScore.rank}` : ''}`}>
                        {buyerScore
                          ? <><strong>{buyerScore.score.toFixed(1)}</strong><small>#{buyerScore.rank} buyer</small><i>P{buyerScore.performance.score.toFixed(1)} · {buyerScore.addressableVramGb}GB · {formatRepresentativePrice(buyerScore)}</i></>
                          : applesScore
                            ? <><strong>{applesScore.score.toFixed(1)}</strong><small>#{applesScore.rank} performance</small><i>{meetsBuyerVramGate(gpu) ? 'market price missing' : `below ${MIN_BUYER_VRAM_GB}GB buyer gate`}</i></>
                            : <><strong>—</strong><small>unscored</small><i>exact run required</i></>}
                      </span>
                      <span className="ai-gpu-product"><small>{gpu.manufacturer} · {gpu.segment?.replace('-', ' ') ?? 'GPU'}</small><strong>{gpu.name}</strong><i>{gpu.architecture ?? 'Architecture not researched'} · {gpu.availability ?? 'availability varies'}</i></span>
                      <span className={`ai-gpu-stat ai-gpu-stat--speed ${evidence ? '' : 'is-missing'}`}><small>{benchmark ? 'tg128 · exact fixed control' : qualifiedBenchmark ? 'tg128 · fixed workload' : 'tg128 · same model'}</small><strong>{evidence ? `${formatBandwidth(evidence.generatedTokensPerSecond)} tok/s${qualifiedBenchmark ? '*' : ''}` : 'Not measured'}</strong><i>{benchmark ? `#${entry.rank ?? '—'} decode · ± ${formatBandwidth(benchmark.generatedStdDev)} · ${benchmark.backend}` : qualifiedBenchmark ? `± ${formatBandwidth(qualifiedBenchmark.generatedStdDev)} · unranked checkpoint variant` : 'Unranked · never estimated'}</i><OwnedGpuArrows gpu={gpu} baselines={ownedBaselines} metric="tokens" /></span>
                      <span className="ai-gpu-stat"><small>Addressable memory</small><strong>{formatBandwidth(addressableVram(gpu))} GB {gpu.vramType ?? ''}</strong><i>{bandwidth ? `${formatBandwidth(bandwidth)} GB/s` : 'Bandwidth unpublished'}{gpu.memoryPool === 'split' ? ` · ${gpu.vramGb} GB board total` : ''}</i><span className="ai-gpu-comparisons"><em>VRAM</em><OwnedGpuArrows gpu={gpu} baselines={ownedBaselines} metric="vram" /><em>BW</em><OwnedGpuArrows gpu={gpu} baselines={ownedBaselines} metric="bandwidth" /></span></span>
                      <span className="ai-gpu-stat"><small>Rated board power</small><strong>{gpu.boardPowerW ? `${gpu.boardPowerW} W` : 'Unpublished'}</strong><i>{ratedEfficiency ? `${ratedEfficiency.toFixed(2)} tok/s ÷ rated W` : gpu.cooling ?? 'Cooling varies'}</i><OwnedGpuArrows gpu={gpu} baselines={ownedBaselines} metric="power" /></span>
                      <GpuReferencePrice gpu={gpu} baselines={ownedBaselines} />
                      <EbayUsedPrice gpu={gpu} baselines={ownedBaselines} />
                    </div>
                    <AiGpuDetails entry={entry} />
                  </li>
                );
              })}
            </ol>
            {filteredLlm.length === 0 && <div className="empty-state"><Search /><h3>No graphics cards match</h3><p>Try wider filters. Cards without the fixed-model test are available under “Missing tokens/sec.”</p></div>}
          </div>
        ) : (
          <div className={`bandwidth-table ${metric === 'gpu-memory' ? 'bandwidth-table--market' : ''}`} id={metric === 'gpu-memory' ? 'gpu-ranking-table' : undefined} aria-label={`${activeMetric.label} rankings`}>
            <div className="bandwidth-row bandwidth-row--heading" aria-hidden="true">
              <span>Rank</span><span>Hardware</span><span>Configuration</span><span>Relative bandwidth</span><span>Peak</span>{metric === 'gpu-memory' && <span>Trusted used</span>}<span>Source</span>
            </div>
            <ol>
              {filteredBandwidth.map((entry) => {
                const sourceUrl = entry.product.specSourceUrl ?? entry.product.compatibilitySourceUrl ?? entry.product.price.sourceUrl;
                return (
                  <li className="bandwidth-row" key={entry.product.id}>
                    <span className={`bandwidth-rank ${entry.rank <= 3 ? `bandwidth-rank--${entry.rank}` : ''}`}>#{entry.rank}</span>
                    <span className="bandwidth-product"><small>{entry.product.manufacturer}</small><strong>{entry.product.name}</strong></span>
                    <span className="bandwidth-configuration"><strong>{entry.detail}</strong><small>{entry.topology}</small>{entry.qualifier && <i>{entry.qualifier}</i>}</span>
                    <span className="bandwidth-bar" aria-hidden="true"><i style={{ width: `${Math.max(2, entry.bandwidthGbS / maximumBandwidth * 100)}%` }} /></span>
                    <strong className="bandwidth-value">{formatBandwidth(entry.bandwidthGbS)} <small>GB/s</small>{metric === 'gpu-memory' && entry.product.category === 'gpu' && <OwnedGpuArrows gpu={entry.product} baselines={ownedBaselines} metric="bandwidth" />}</strong>
                    {metric === 'gpu-memory' && entry.product.category === 'gpu' && <EbayUsedPrice gpu={entry.product} baselines={ownedBaselines} />}
                    <a className="bandwidth-source" href={sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open source for ${entry.product.name}`}><ExternalLink /></a>
                  </li>
                );
              })}
            </ol>
            {filteredBandwidth.length === 0 && <div className="empty-state"><Search /><h3>No ranked hardware matches</h3><p>Try a different manufacturer or a wider search.</p></div>}
          </div>
        )}

        <aside className="bandwidth-method">
          <strong>How to read this</strong>
          {metric === 'llm-tokens'
            ? <p>Performance score is 70% normalized `tg128` decode plus 30% normalized `pp512` prompt ingest on the exact llama-2-7b.Q4_0.gguf control. Buyer score keeps speed and value equal at 42.5% each, then gives 15% to addressable VRAM. Cards below {MIN_BUYER_VRAM_GB} GB do not receive a buyer score. Price uses the screened-range midpoint with no MSRP fallback and excludes host, chassis, cooling, shipping, and tax. An asterisk marks a disclosed checkpoint variation and remains unranked; missing runs are never estimated.</p>
            : <p>Bandwidth values are theoretical peaks, not measured application throughput. Used prices are exact-model eBay asking prices—not completed-sale values—and exclude shipping and tax. “Screened” means the seller had at least 98% positive feedback and 100 feedback records when checked; it is not an eBay authenticity guarantee. Compare bandwidth only inside the selected leaderboard and inspect the listing before buying.</p>}
        </aside>
      </section>
    </main>
  );
}
