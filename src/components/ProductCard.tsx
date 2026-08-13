import { BarChart3, BookOpen, Check, ChevronDown, ExternalLink, ListChecks, Plus } from 'lucide-react';
import type { BenchmarkResult, Cpu, Gpu, Motherboard, Product } from '../types';
import { money, productSpecs } from '../lib/format';
import { ProductVisual } from './ProductVisual';

interface Props {
  product: Product;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onSelect?: () => void;
}

const benchmarkLabels: Record<BenchmarkResult['benchmarkKey'], string> = {
  'passmark-cpu': 'CPU Mark',
  'passmark-single-thread': 'Single thread',
  'passmark-g3d': 'G3D graphics',
  'geekbench-opencl': 'OpenCL compute',
};

function BenchmarkDetails({ product }: { product: Cpu | Gpu }) {
  const benchmarks = product.benchmarks ?? [];
  const llm = product.category === 'gpu' ? product.llmBenchmarks?.[0] : undefined;
  const hasResults = benchmarks.length > 0 || Boolean(llm);
  return (
    <>
      <div className={`benchmark-strip ${!hasResults ? 'benchmark-strip--empty' : ''}`} aria-label="Published benchmark scores">
        <BarChart3 size={16} />
        {!hasResults
          ? <span><strong>No comparable published score</strong><small>Untested is not zero</small></span>
          : <>
            {llm && <span><small>LLM tg128</small><strong>{llm.generatedTokensPerSecond.toLocaleString('en-US')} tok/s</strong></span>}
            {benchmarks.map((benchmark) => (
            <span key={`${benchmark.benchmarkKey}-${benchmark.benchmarkVersion}`}>
              <small>{benchmarkLabels[benchmark.benchmarkKey]}</small>
              <strong>{benchmark.score.toLocaleString('en-US')}</strong>
              {benchmark.resultType === 'limited-sample' && <i>LOW N</i>}
            </span>
            ))}
          </>}
      </div>
      <details className="technical-details benchmark-details">
        <summary>Benchmark context &amp; sources <ChevronDown size={14} /></summary>
        {!hasResults ? (
          <div className="benchmark-empty">
            No result from the selected PassMark or Geekbench methodology. This is common for passive and preview accelerators; the database leaves the score absent rather than substituting theoretical FLOPS.
          </div>
        ) : (
          <div className="technical-grid">
            {llm && (
              <div>
                <span>Measured LLM generation</span>
                <strong>{llm.generatedTokensPerSecond.toLocaleString('en-US')} tok/s tg128 · {llm.promptTokensPerSecond.toLocaleString('en-US')} tok/s pp512</strong>
                <small>{llm.modelFile} · {llm.backend} · llama.cpp {llm.engineCommit ?? 'commit not reported'} · one GPU · no flash attention</small>
                <a href={llm.sourceUrl} target="_blank" rel="noreferrer">Open {llm.sourceName} <ExternalLink size={10} /></a>
              </div>
            )}
            {benchmarks.map((benchmark) => (
              <div key={`${benchmark.benchmarkKey}-${benchmark.benchmarkVersion}`}>
                <span>{benchmark.benchmarkName}</span>
                <strong>{benchmark.score.toLocaleString('en-US')} {benchmark.unit}</strong>
                <small>
                  {benchmark.resultType === 'limited-sample' ? 'Limited sample' : 'Published aggregate'}
                  {benchmark.sampleCount !== undefined ? ` · ${benchmark.sampleCount.toLocaleString('en-US')} submissions` : ' · 5+ unique results'}
                  {' · '}observed {benchmark.observedAt}
                </small>
                <small>Source device: {benchmark.sourceDeviceName}</small>
                <a href={benchmark.sourceUrl} target="_blank" rel="noreferrer">Open {benchmark.sourceName} <ExternalLink size={10} /></a>
              </div>
            ))}
            <div className="technical-grid__wide benchmark-caveat">
              <span>Comparison rule</span>
              <strong>Compare scores only within the same benchmark, model profile, and version.</strong>
              <small>{[llm?.notes, ...benchmarks.map((benchmark) => benchmark.notes)].filter((note, index, all) => note && all.indexOf(note) === index).join(' ')}</small>
            </div>
          </div>
        )}
      </details>
    </>
  );
}

function CpuIoDetails({ cpu }: { cpu: Cpu }) {
  if (!cpu.pcieLanes || !cpu.memoryChannels) return null;
  return (
    <details className="technical-details">
      <summary>I/O &amp; memory research <ChevronDown size={14} /></summary>
      <div className="technical-grid">
        <div><span>CPU PCIe fabric</span><strong>{cpu.pcieLanes} Gen{cpu.pcieGeneration} lanes</strong><small>{cpu.pcieTotalLanes ? `${cpu.pcieTotalLanes} total / ${cpu.pcieUsableLanes} usable · ` : ''}{cpu.pcieLaneRateGtS} GT/s per lane</small></div>
        <div><span>PCIe payload</span><strong>~{cpu.theoreticalPcieBandwidthGbS} GB/s</strong><small>aggregate, each direction</small></div>
        <div><span>Memory controller</span><strong>{cpu.memoryChannels} × {cpu.memoryChannelWidthBits}-bit</strong><small>{cpu.memoryBusWidthBits}-bit aggregate data bus</small></div>
        <div><span>Memory bandwidth</span><strong>{cpu.theoreticalMemoryBandwidthGbS} GB/s</strong><small>{cpu.memoryTypes.join(' / ')}-{cpu.memorySpeedMt}, theoretical</small></div>
        <div className="technical-grid__wide"><span>Capacity &amp; modules</span><strong>Up to {Number(((cpu.maxMemoryGb ?? 0) / 1024).toFixed(3))} TB · {cpu.memoryModuleTypes?.join(' / ')}</strong><small>ECC supported; installed motherboard determines slots and population limits</small></div>
        {cpu.optanePmemSeries && <>
          <div><span>Optane validation</span><strong>PMem {cpu.optanePmemSeries} · Intel-listed</strong><small>{cpu.architecture} and PMem generations cannot be mixed</small></div>
          <div><span>Vector path</span><strong>{cpu.vectorExtensions?.join(' · ')}</strong><small>{cpu.nativeBfloat16 ? 'Native BF16 instructions' : 'No native AVX-512 BF16'}</small></div>
          <div className="technical-grid__wide"><span>AI assessment</span><strong>{cpu.aiAssessment}</strong><small>Engineering suitability tier, not a measured tokens-per-second claim</small></div>
        </>}
      </div>
    </details>
  );
}

function CpuAiRanking({ cpu }: { cpu: Cpu }) {
  if (!cpu.optanePmemSeries || !cpu.aiRankWithinOptane) return null;
  return (
    <div className="cpu-ai-ranking" aria-label="Local AI suitability ranking among Optane-compatible CPUs">
      <span><small>OPTANE CPU RANK</small><strong>#{cpu.aiRankWithinOptane} / {cpu.aiRankTotal}</strong></span>
      <span><small>CPU / MOE</small><strong>{cpu.aiInferenceTier}</strong></span>
      <span><small>GPU HOST</small><strong>{cpu.aiGpuHostTier}</strong></span>
    </div>
  );
}

function BoardIoDetails({ board }: { board: Motherboard }) {
  if (!board.cpuDirectExpansionLanes) return null;
  return (
    <details className="technical-details">
      <summary>Board lane routing <ChevronDown size={14} /></summary>
      <div className="technical-grid">
        <div><span>CPU-direct slots</span><strong>{board.cpuDirectExpansionLanes} Gen{board.pcieGeneration} lanes</strong><small>{board.pcieSlotConfiguration}</small></div>
        <div><span>CPU-direct M.2</span><strong>{board.cpuDirectM2Lanes} lanes</strong><small>2 × PCIe Gen4 x4</small></div>
        <div><span>WRX80 uplink</span><strong>PCIe Gen4 x{board.chipsetUplinkLanes}</strong><small>SlimSAS and chipset I/O share it</small></div>
        <div><span>Memory population</span><strong>{board.memorySlots} slots · {board.dimmsPerChannel} DPC</strong><small>Up to {board.maxDimmCapacityGb} GB per DIMM</small></div>
      </div>
    </details>
  );
}

function GpuResearchDetails({ gpu }: { gpu: Gpu }) {
  if (!gpu.architecture) return null;
  const topology = gpu.memoryPool === 'split'
    ? `${gpu.gpuCount} GPUs · ${gpu.addressableVramGb} GB each`
    : `One ${gpu.vramGb} GB pool`;
  return (
    <details className="technical-details">
      <summary>AI &amp; installation research <ChevronDown size={14} /></summary>
      <div className="technical-grid">
        <div><span>Memory topology</span><strong>{topology}</strong><small>{gpu.vramType ?? 'Memory type unpublished'}</small></div>
        <div><span>Memory bus</span><strong>{gpu.memoryBandwidthGbS ? `${gpu.memoryBandwidthGbS.toLocaleString()} GB/s` : 'Not published'}</strong><small>{gpu.memoryBusBits ? `${gpu.memoryBusBits.toLocaleString()}-bit interface` : 'Bus width not published'}</small></div>
        <div><span>Parallel processors</span><strong>{gpu.parallelProcessors ? `${gpu.parallelProcessors.count.toLocaleString()} ${gpu.parallelProcessors.label}` : 'Not researched'}</strong><small>Vendor-native count; not one-for-one across architectures</small></div>
        <div><span>Theoretical AI peak</span><strong>{gpu.fp4AiTops ? `${gpu.fp4AiTops.toLocaleString()} sparse FP4 TOPS` : 'Not published'}</strong><small>{gpu.tensorCoreGeneration ?? 'Tensor generation not stored'}{gpu.cudaComputeCapability ? ` · CUDA CC ${gpu.cudaComputeCapability}` : ''}</small></div>
        <div><span>Host link</span><strong>PCIe Gen{gpu.pcieGeneration ?? '?'} x{gpu.pcieLanes ?? '?'}</strong><small>{gpu.segment?.replace('-', ' ')} · {gpu.softwarePlatform ?? 'Vendor stack'}</small></div>
        <div><span>Thermal design</span><strong>{gpu.boardPowerW ? `${gpu.boardPowerW} W · ${gpu.cooling ?? 'board-specific cooling'}` : `${gpu.cooling ?? 'OEM cooling'} · power unpublished`}</strong><small>{gpu.slotWidth ? `${gpu.slotWidth}-slot` : 'Width varies'} · {gpu.lengthMm ? `${gpu.lengthMm} mm` : 'length varies'}</small></div>
        <div><span>Display output</span><strong>{gpu.displayOutputs === false ? 'No direct display' : 'Supported'}</strong><small>{gpu.availability ?? 'availability varies'} · introduced {gpu.releaseYear ?? 'unknown'}</small></div>
        <div><span>Power input</span><strong>{gpu.powerConnectors ?? 'Verify OEM card'}</strong><small>{gpu.recommendedPsuW ? `${gpu.recommendedPsuW} W system PSU reference` : 'No vendor system-PSU figure'}</small></div>
        {gpu.notes && <div className="technical-grid__wide"><span>Important qualifier</span><strong>{gpu.notes}</strong></div>}
      </div>
    </details>
  );
}

export function ProductCard({ product, selected = false, disabled = false, compact = false, onSelect }: Props) {
  const specs = productSpecs(product).slice(0, compact ? 3 : 4);
  return (
    <article className={`product-card ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}>
      <ProductVisual category={product.category} manufacturer={product.manufacturer} />
      <div className="product-card__body">
        <div className="eyebrow-row">
          <span>{product.manufacturer}</span>
          {product.tags[0] && <span className="micro-badge">{product.tags[0]}</span>}
        </div>
        <h3>{product.name}</h3>
        {!compact && <p className="product-description">{product.description}</p>}
        <dl className="spec-row">
          {specs.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        {!compact && product.category === 'cpu' && <CpuAiRanking cpu={product} />}
        {!compact && (product.category === 'cpu' || product.category === 'gpu') && <BenchmarkDetails product={product} />}
        {!compact && product.category === 'cpu' && <CpuIoDetails cpu={product} />}
        {!compact && product.category === 'motherboard' && <BoardIoDetails board={product} />}
        {!compact && product.category === 'gpu' && <GpuResearchDetails gpu={product} />}
        <div className="product-card__footer">
          <div>
            <strong className="price">{money(product.price.amountCents)}</strong>
            <span className="price-type">{product.price.amountCents === 0 ? 'QUOTE / USED' : product.price.priceType}</span>
          </div>
          <div className="card-actions">
            <a className="icon-link" href={product.price.sourceUrl} target="_blank" rel="noreferrer" title={`Price source: ${product.price.retailer}`}>
              <ExternalLink size={15} />
            </a>
            {product.specSourceUrl && (
              <a className="icon-link" href={product.specSourceUrl} target="_blank" rel="noreferrer" title="Official specification source">
                <BookOpen size={15} />
              </a>
            )}
            {product.compatibilitySourceUrl && (
              <a className="icon-link" href={product.compatibilitySourceUrl} target="_blank" rel="noreferrer" title="Official compatibility/QVL source">
                <ListChecks size={15} />
              </a>
            )}
            {onSelect && (
              <button className={selected ? 'select-button selected' : 'select-button'} onClick={onSelect} disabled={disabled}>
                {selected ? <><Check size={16} /> Added</> : <><Plus size={16} /> Add</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
