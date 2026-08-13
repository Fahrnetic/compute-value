import { CheckCircle2, ExternalLink, Gauge, Layers3, MemoryStick } from 'lucide-react';
import { formatProBlackwellSpeed, preferredProBlackwellBenchmark } from '../data/pro-blackwell-benchmarks';
import {
  formatGpuMarketPriceRange,
  gpuMarketPriceRange,
  ownedGpuBaselines,
  type OwnedGpuBaseline,
} from '../data/gpu-owner-comparison';
import { preferredV100Benchmark } from '../data/v100-benchmarks';
import { qualifiedLlmBenchmarkFor } from '../data/qualified-llm-benchmarks';
import { scoreApplesComparableGpus, type ApplesLlmScore } from '../data/apples-llm-score';
import {
  formatRepresentativePrice,
  meetsBuyerVramGate,
  MIN_BUYER_VRAM_GB,
  scorePriceAdjustedGpus,
  type PriceAdjustedGpuScore,
} from '../data/price-adjusted-gpu-score';
import type { Gpu, Product } from '../types';
import { OwnedGpuArrows } from './OwnedGpuArrows';

export type GpuDirectoryVendor = 'NVIDIA' | 'AMD';
export type GpuRankingVendorScope = GpuDirectoryVendor | 'all';

type GpuFamily = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  sourceUrl?: string;
  products: Gpu[];
  complete?: boolean;
  collapsible?: boolean;
};

const familySources = {
  rtx40: 'https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/',
  rtx50: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/',
  rtxPro: 'https://www.nvidia.com/en-us/products/workstations/product-literature/',
  rtxProServer: 'https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/',
};

function isGpu(product: Product): product is Gpu {
  return product.category === 'gpu';
}

function gpuSort(a: Gpu, b: Gpu) {
  const processorDifference = (b.parallelProcessors?.count ?? 0) - (a.parallelProcessors?.count ?? 0);
  if (processorDifference) return processorDifference;
  const bandwidthDifference = (b.memoryBandwidthGbS ?? 0) - (a.memoryBandwidthGbS ?? 0);
  if (bandwidthDifference) return bandwidthDifference;
  const memoryDifference = b.vramGb - a.vramGb;
  return memoryDifference || b.name.localeCompare(a.name, 'en', { numeric: true });
}

function nvidiaFamilies(gpus: Gpu[]): GpuFamily[] {
  const geforce50 = gpus.filter((gpu) => gpu.generation?.startsWith('GeForce RTX 50'));
  const geforce40 = gpus.filter((gpu) => gpu.generation?.startsWith('GeForce RTX 40'));
  const proBlackwell = gpus.filter((gpu) => gpu.architecture === 'Blackwell'
    && gpu.generation === 'RTX PRO Blackwell' && gpu.segment === 'workstation');
  const serverBlackwell = gpus.filter((gpu) => gpu.architecture === 'Blackwell'
    && gpu.generation === 'RTX PRO Blackwell Server' && gpu.segment === 'data-center');
  const organized = new Set([...geforce50, ...geforce40, ...proBlackwell, ...serverBlackwell].map((gpu) => gpu.id));

  const generationCopy: Record<string, Pick<GpuFamily, 'id' | 'title' | 'eyebrow' | 'description'>> = {
    'Ada Lovelace': {
      id: 'nvidia-ada-other',
      title: 'Ada Lovelace — professional & data center',
      eyebrow: 'ADA LOVELACE / NON-GEFORCE',
      description: 'RTX professional and L-series Ada cards, kept separate from the GeForce RTX 40 desktop stack above.',
    },
    Hopper: {
      id: 'nvidia-hopper',
      title: 'Hopper',
      eyebrow: 'HOPPER / DATA CENTER',
      description: 'H100, H200, and export-market Hopper PCIe/NVL accelerators for large-model inference and training.',
    },
    Ampere: {
      id: 'nvidia-ampere',
      title: 'Ampere',
      eyebrow: 'AMPERE / GEFORCE + RTX + DATA CENTER',
      description: 'The complete installable Ampere collection in the catalog, spanning RTX 30, RTX A, and A-series accelerators.',
    },
    Turing: {
      id: 'nvidia-turing',
      title: 'Turing',
      eyebrow: 'TURING / RTX + TESLA',
      description: 'First-generation RT/Tensor-era cards, including TITAN RTX, Quadro RTX, and Tesla T-series products.',
    },
    Volta: {
      id: 'nvidia-volta',
      title: 'Volta',
      eyebrow: 'VOLTA / HBM2 COMPUTE',
      description: 'V100 and Quadro GV100 variants, with each physical memory capacity preserved as a separate card.',
    },
    Pascal: {
      id: 'nvidia-pascal',
      title: 'Pascal',
      eyebrow: 'PASCAL / PROFESSIONAL + DATA CENTER',
      description: 'Installable Pascal cards retained for used-market and legacy inference comparisons.',
    },
    Maxwell: {
      id: 'nvidia-maxwell',
      title: 'Maxwell',
      eyebrow: 'MAXWELL / LEGACY CUDA',
      description: 'Older Maxwell workstation and data-center cards, clearly isolated from tensor-core generations.',
    },
    Kepler: {
      id: 'nvidia-kepler',
      title: 'Kepler',
      eyebrow: 'KEPLER / LEGACY CUDA',
      description: 'Kepler products appear only when they clear the active memory and fixed-control throughput gates.',
    },
  };

  const architectureOrder = ['Ada Lovelace', 'Hopper', 'Ampere', 'Turing', 'Volta', 'Pascal', 'Maxwell', 'Kepler'];
  const architectureFamilies = architectureOrder.flatMap((architecture) => {
    const generation = gpus.filter((gpu) => !organized.has(gpu.id) && gpu.architecture === architecture);
    if (generation.length === 0) return [];
    return [{
      ...generationCopy[architecture],
      products: generation.sort(gpuSort),
      collapsible: true,
    }];
  });

  return [
    {
      id: 'nvidia-geforce-50',
      title: 'GeForce RTX 50 Series',
      eyebrow: 'BLACKWELL / DESKTOP',
      description: 'The four relevant global desktop cards that clear the active AI gates. RTX 5090 D/D V2 are excluded by preference; the measured 90.94 tok/s 5060 Ti 16GB is excluded by performance.',
      sourceUrl: familySources.rtx50,
      products: geforce50.sort(gpuSort),
      complete: geforce50.length === 4,
    },
    {
      id: 'nvidia-geforce-40',
      title: 'GeForce RTX 40 Series',
      eyebrow: 'ADA LOVELACE / DESKTOP',
      description: 'Every relevant RTX 40 desktop card. RTX 4070 is excluded at 92.29 tok/s; the RTX 4060 Ti 16GB is retained as your requested 61.80 tok/s control-compatible exception.',
      sourceUrl: familySources.rtx40,
      products: geforce40.sort(gpuSort),
      complete: geforce40.length === 8,
    },
    {
      id: 'nvidia-rtx-pro-blackwell',
      title: 'RTX PRO Blackwell',
      eyebrow: 'PROFESSIONAL / WORKSTATION',
      description: 'All installable workstation editions, with 16–96 GB of ECC GDDR7 and separate 48/72 GB RTX PRO 5000 entries.',
      sourceUrl: familySources.rtxPro,
      products: proBlackwell.sort(gpuSort),
      complete: proBlackwell.length === 8,
    },
    {
      id: 'nvidia-rtx-pro-blackwell-server',
      title: 'RTX PRO Blackwell Server',
      eyebrow: 'PROFESSIONAL / DATA CENTER',
      description: 'Passive, standard-PCIe server accelerators are kept separate from workstation cards and rack-scale HGX/DGX modules.',
      sourceUrl: familySources.rtxProServer,
      products: serverBlackwell.sort(gpuSort),
      complete: serverBlackwell.length === 3,
    },
    ...architectureFamilies,
  ];
}

function amdFamilies(gpus: Gpu[]): GpuFamily[] {
  const aiPro = gpus.filter((gpu) => gpu.name.startsWith('Radeon AI PRO'));
  const rx = gpus.filter((gpu) => gpu.name.startsWith('Radeon RX'));
  const instinct = gpus.filter((gpu) => gpu.name.startsWith('Instinct'));
  const dataCenterGraphics = gpus.filter((gpu) => gpu.segment === 'data-center'
    && !aiPro.includes(gpu) && !instinct.includes(gpu));
  const organized = new Set([...aiPro, ...rx, ...instinct, ...dataCenterGraphics].map((gpu) => gpu.id));

  return [
    {
      id: 'amd-radeon-ai-pro',
      title: 'Radeon AI PRO',
      eyebrow: 'RDNA 4 / AI WORKSTATION + SERVER',
      description: 'High-capacity current-generation Radeon AI products, separated by their exact workstation or server form factor.',
      products: aiPro.sort(gpuSort),
    },
    {
      id: 'amd-radeon-rx',
      title: 'Radeon RX',
      eyebrow: 'CONSUMER / DESKTOP',
      description: 'Consumer Radeon cards for local inference, ordered by stored processor count and then memory bandwidth.',
      products: rx.sort(gpuSort),
    },
    {
      id: 'amd-radeon-pro',
      title: 'Radeon PRO & FirePro workstation',
      eyebrow: 'PROFESSIONAL / WORKSTATION',
      description: 'Display-capable professional cards, including current Radeon PRO and older FirePro generations.',
      products: gpus.filter((gpu) => !organized.has(gpu.id)).sort(gpuSort),
    },
    {
      id: 'amd-instinct',
      title: 'AMD Instinct',
      eyebrow: 'COMPUTE / DATA CENTER',
      description: 'Dedicated ROCm compute accelerators kept apart from display-oriented Radeon products.',
      products: instinct.sort(gpuSort),
    },
    {
      id: 'amd-virtual-server',
      title: 'Radeon virtual & server graphics',
      eyebrow: 'VDI / DATA CENTER',
      description: 'Server graphics and virtual-workstation cards that are not part of the Instinct compute family.',
      products: dataCenterGraphics.sort(gpuSort),
    },
  ];
}

export function buildGpuFamilies(products: Product[], vendor: GpuDirectoryVendor) {
  const vendorGpus = products.filter(isGpu).filter((gpu) => gpu.manufacturer === vendor);
  return vendor === 'NVIDIA' ? nvidiaFamilies(vendorGpus) : amdFamilies(vendorGpus);
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function usedPriceSummary(gpu: Gpu) {
  const range = gpuMarketPriceRange(gpu);
  if (!range) return gpu.usedMarket ? 'No trusted used match' : 'Used price not screened';
  return `${formatGpuMarketPriceRange(range)} ${range.source === 'owner-market-range' ? 'market' : 'used'}`;
}

function exactBenchmark(gpu: Gpu) {
  return gpu.llmBenchmarks?.find((result) => result.profileKey === 'llama2-7b-q4_0-tg128-no-fa');
}

function GpuDirectoryCard({
  gpu,
  baselines,
  applesScore,
  buyerScore,
  onSelect,
}: {
  gpu: Gpu;
  baselines: OwnedGpuBaseline[];
  applesScore?: ApplesLlmScore;
  buyerScore?: PriceAdjustedGpuScore;
  onSelect: (gpu: Gpu) => void;
}) {
  const benchmark = exactBenchmark(gpu);
  const proBlackwellEvidence = preferredProBlackwellBenchmark(gpu);
  const v100Evidence = preferredV100Benchmark(gpu.id);
  const qualifiedControl = qualifiedLlmBenchmarkFor(gpu.id);
  const benchmarkLabel = benchmark
    ? 'Fixed-control decode'
    : proBlackwellEvidence?.lane === 'qualified-control'
      ? 'Same model / FA on'
      : proBlackwellEvidence?.lane === 'serving-throughput'
        ? 'Serving throughput'
        : proBlackwellEvidence
          ? `${proBlackwellEvidence.model} decode`
          : v100Evidence
            ? `${v100Evidence.model} · ${v100Evidence.runtime}`
            : qualifiedControl
              ? 'Fixed workload · checkpoint variant'
            : 'Fixed-control decode';
  const benchmarkSpeed = benchmark
    ? `${formatNumber(benchmark.generatedTokensPerSecond)} tok/s`
    : proBlackwellEvidence
      ? formatProBlackwellSpeed(proBlackwellEvidence)
      : v100Evidence
        ? `${formatNumber(v100Evidence.generatedTokensPerSecond)} tok/s`
        : qualifiedControl
          ? `${formatNumber(qualifiedControl.generatedTokensPerSecond)} tok/s`
        : 'No public result';
  const owned = baselines.some((baseline) => baseline.productId === gpu.id);
  const priceRange = gpuMarketPriceRange(gpu);
  return (
    <li className={`gpu-directory-card${owned ? ' gpu-directory-card--owned' : ''}`}>
      <button type="button" onClick={() => onSelect(gpu)} aria-label={`Find ${gpu.name} in the performance ranking`}>
        <span className="gpu-directory-card__top">
          <small>{owned ? 'YOUR GPU · ' : ''}{gpu.segment?.replace('-', ' ') ?? 'graphics card'} · {gpu.availability ?? 'availability varies'}</small>
          <strong>{gpu.name}</strong>
        </span>
        <span className="gpu-directory-card__specs">
          <span><MemoryStick /><b>{gpu.vramGb} GB</b><small>{gpu.vramType ?? 'VRAM'}</small><OwnedGpuArrows gpu={gpu} baselines={baselines} metric="vram" /></span>
          <span><Gauge /><b>{gpu.memoryBandwidthGbS ? `${formatNumber(gpu.memoryBandwidthGbS)} GB/s` : '—'}</b><small>memory</small><OwnedGpuArrows gpu={gpu} baselines={baselines} metric="bandwidth" /></span>
          <span><Layers3 /><b>{gpu.parallelProcessors ? formatNumber(gpu.parallelProcessors.count) : '—'}</b><small>{gpu.parallelProcessors?.label ?? 'processors'}</small><OwnedGpuArrows gpu={gpu} baselines={baselines} metric="processors" /></span>
        </span>
        <span className="gpu-directory-card__result">
          <span className="gpu-directory-card__score">
            <small>{buyerScore ? 'Price-adjusted buyer' : applesScore ? 'Performance score' : 'AI score'}</small>
            <strong>{buyerScore ? buyerScore.score.toFixed(1) : applesScore ? applesScore.score.toFixed(1) : 'Unscored'}</strong>
            <i>{buyerScore
              ? `#${buyerScore.rank} buyer · P${buyerScore.performance.score.toFixed(1)} · ${buyerScore.addressableVramGb}GB · ${formatRepresentativePrice(buyerScore)}`
              : applesScore
                ? `#${applesScore.rank} performance · ${meetsBuyerVramGate(gpu) ? 'market price missing' : `below ${MIN_BUYER_VRAM_GB}GB gate`}`
                : 'Exact fixed-control run required'}</i>
          </span>
          <span><small>{benchmarkLabel}</small><strong>{benchmarkSpeed}</strong><OwnedGpuArrows gpu={gpu} baselines={baselines} metric="tokens" /></span>
          <span><small>Rated power</small><strong>{gpu.boardPowerW ? `${gpu.boardPowerW} W` : '—'}</strong><OwnedGpuArrows gpu={gpu} baselines={baselines} metric="power" /></span>
          <span><small>{priceRange?.source === 'owner-market-range' ? 'Current market' : 'Trusted eBay'}</small><strong>{usedPriceSummary(gpu)}</strong><OwnedGpuArrows gpu={gpu} baselines={baselines} metric="marketPrice" /></span>
        </span>
      </button>
    </li>
  );
}

function FamilyHeading({ family }: { family: GpuFamily }) {
  return (
    <>
      <div><span>{family.eyebrow}</span><h3>{family.title}</h3><p>{family.description}</p></div>
      <div className="gpu-family__count">
        {family.complete && <span><CheckCircle2 /> AI catalog complete</span>}
        <strong>{family.products.length}</strong><small>installable variants</small>
        {family.sourceUrl && <a href={family.sourceUrl} target="_blank" rel="noreferrer">Official family source <ExternalLink /></a>}
      </div>
    </>
  );
}

function GpuFamilySection({
  family,
  baselines,
  scoreByProductId,
  buyerScoreByProductId,
  onSelectProduct,
}: {
  family: GpuFamily;
  baselines: OwnedGpuBaseline[];
  scoreByProductId: Map<string, ApplesLlmScore>;
  buyerScoreByProductId: Map<string, PriceAdjustedGpuScore>;
  onSelectProduct: (gpu: Gpu) => void;
}) {
  if (family.collapsible) {
    return (
      <details className="gpu-family gpu-family--collapsible" data-family={family.id}>
        <summary><FamilyHeading family={family} /></summary>
        <ol>{family.products.map((gpu) => <GpuDirectoryCard gpu={gpu} baselines={baselines} applesScore={scoreByProductId.get(gpu.id)} buyerScore={buyerScoreByProductId.get(gpu.id)} onSelect={onSelectProduct} key={gpu.id} />)}</ol>
      </details>
    );
  }

  return (
    <section className="gpu-family" data-family={family.id}>
      <header><FamilyHeading family={family} /></header>
      <ol>{family.products.map((gpu) => <GpuDirectoryCard gpu={gpu} baselines={baselines} applesScore={scoreByProductId.get(gpu.id)} buyerScore={buyerScoreByProductId.get(gpu.id)} onSelect={onSelectProduct} key={gpu.id} />)}</ol>
    </section>
  );
}

export function GpuFamilyDirectory({
  products,
  vendor,
  rankingScope,
  onVendorChange,
  onRankingScopeChange,
  onSelectProduct,
}: {
  products: Product[];
  vendor: GpuDirectoryVendor;
  rankingScope: GpuRankingVendorScope;
  onVendorChange: (vendor: GpuDirectoryVendor) => void;
  onRankingScopeChange: (scope: GpuRankingVendorScope) => void;
  onSelectProduct: (gpu: Gpu) => void;
}) {
  const gpuCounts = products.filter(isGpu).reduce<Record<string, number>>((counts, gpu) => {
    counts[gpu.manufacturer] = (counts[gpu.manufacturer] ?? 0) + 1;
    return counts;
  }, {});
  const families = buildGpuFamilies(products, vendor);
  const baselines = ownedGpuBaselines(products);
  const scoreByProductId = new Map(scoreApplesComparableGpus(products).map((score) => [score.product.id, score]));
  const buyerScoreByProductId = new Map(scorePriceAdjustedGpus(products).map((score) => [score.product.id, score]));
  const blackwellCount = products.filter((product) => isGpu(product)
    && product.manufacturer === 'NVIDIA' && product.architecture === 'Blackwell').length;

  return (
    <section className={`gpu-directory gpu-directory--${vendor.toLowerCase()}`} aria-labelledby="gpu-directory-title">
      <header className="gpu-directory__header">
        <div>
          <span className="section-kicker">VENDOR + GENERATION DIRECTORY</span>
          <h2 id="gpu-directory-title">Graphics cards, separated at the source.</h2>
          <p>NVIDIA and AMD use different core designs and software stacks. Browse each vendor independently; click any card to isolate it in the apples-to-apples ranking below.</p>
        </div>
        <div className="gpu-directory__summary">
          <span><strong>{gpuCounts.NVIDIA ?? 0}</strong><small>NVIDIA cards</small></span>
          <span><strong>{gpuCounts.AMD ?? 0}</strong><small>AMD cards</small></span>
          <span><strong>{blackwellCount}</strong><small>Blackwell PCIe variants</small></span>
        </div>
      </header>

      <div className="gpu-directory__controls">
        <div className="gpu-directory__vendor-tabs" role="tablist" aria-label="GPU manufacturer">
          {(['NVIDIA', 'AMD'] as GpuDirectoryVendor[]).map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={vendor === item}
              className={vendor === item ? 'active' : ''}
              onClick={() => onVendorChange(item)}
              key={item}
            >
              <span>{item}</span><b>{gpuCounts[item] ?? 0}</b>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`gpu-directory__compare ${rankingScope === 'all' ? 'active' : ''}`}
          onClick={() => onRankingScopeChange(rankingScope === 'all' ? vendor : 'all')}
        >
          {rankingScope === 'all' ? 'Ranking includes all vendors' : `Ranking scoped to ${rankingScope}`}
        </button>
      </div>

      <div className="owned-gpu-key">
        <div className="owned-gpu-key__intro">
          <strong>Compare every stat with your GPUs</strong>
          <small>Each card shows one badge for the 4070 SUPER and one for the 3090.</small>
        </div>
        <div className="owned-gpu-key__baselines">
          {baselines.map((baseline) => {
            const benchmark = exactBenchmark(baseline.gpu);
            return (
              <span key={baseline.key}>
                <b>{baseline.shortLabel}</b>
                <small>{benchmark ? `${formatNumber(benchmark.generatedTokensPerSecond)} tok/s` : 'No control result'} · {baseline.gpu.vramGb} GB</small>
              </span>
            );
          })}
        </div>
        <div className="owned-gpu-key__legend" aria-label="Comparison arrow legend">
          <i className="is-up">↑ <span>Higher · or lower power</span></i>
          <i className="is-down">↓ <span>Lower · or higher power</span></i>
          <i className="is-equal">= <span>Same</span></i>
          <i>? <span>Missing</span></i>
          <i>× <span>Different core type</span></i>
        </div>
        <p>Power is intentionally inverted: ↑ means lower draw and ↓ means higher draw. Price remains a raw higher/lower comparison.</p>
      </div>

      <div className="gpu-directory__families" role="tabpanel">
          {families.map((family) => <GpuFamilySection family={family} baselines={baselines} scoreByProductId={scoreByProductId} buyerScoreByProductId={buyerScoreByProductId} onSelectProduct={onSelectProduct} key={family.id} />)}
      </div>
      <p className="gpu-directory__boundary">Inventory boundary: discrete, standard PCIe add-in products with at least 12 GB in each addressable memory pool. A measured card below 100 tok/s on the fixed Llama 2 7B Q4_0 control is excluded unless it has at least 32 GB; the RTX 4060 Ti 16GB is retained as your explicit requested exception. Unmeasured cards remain labeled—not estimated. Laptop GPUs and rack-scale SXM/OAM systems are excluded.</p>
    </section>
  );
}
