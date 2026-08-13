import { Database, ExternalLink, Gauge, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { addressableGpuMemory, physical32GbGpus, qualified32GbResults } from '../data/gpu-32gb-research';
import { preferredV100Benchmark } from '../data/v100-benchmarks';
import type { Gpu, LlmBenchmarkResult, Product } from '../types';
import type { GpuRankingVendorScope } from './GpuFamilyDirectory';

const fixedProfileKey: LlmBenchmarkResult['profileKey'] = 'llama2-7b-q4_0-tg128-no-fa';

function number(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function dollars(amountCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100);
}

function screenedAsk(gpu: Gpu) {
  const prices = gpu.usedMarket?.listings.map((listing) => listing.amountCents).sort((a, b) => a - b) ?? [];
  if (!prices.length) return undefined;
  const low = dollars(prices[0]);
  const high = dollars(prices.at(-1) ?? prices[0]);
  return { low: prices[0], label: low === high ? low : `${low}–${high}` };
}

function topology(gpu: Gpu) {
  const addressable = addressableGpuMemory(gpu);
  return addressable === 32
    ? 'One 32 GB pool'
    : `${gpu.gpuCount ?? '?'} × ${number(addressable)} GB pools`;
}

export function Gpu32GbResearch({ products, vendorScope = 'all' }: { products: Product[]; vendorScope?: GpuRankingVendorScope }) {
  const cards = useMemo(() => physical32GbGpus(products)
    .filter((gpu) => vendorScope === 'all' || gpu.manufacturer === vendorScope), [products, vendorScope]);
  const strict = useMemo(() => cards.flatMap((product) => {
    const benchmark = product.llmBenchmarks?.find((result) => result.profileKey === fixedProfileKey);
    return benchmark ? [{ product, benchmark }] : [];
  }).sort((a, b) => b.benchmark.generatedTokensPerSecond - a.benchmark.generatedTokensPerSecond), [cards]);
  const qualified = useMemo(() => [...qualified32GbResults]
    .filter((result) => cards.some((card) => card.id === result.productId))
    .sort((a, b) => b.generatedTokensPerSecond - a.generatedTokensPerSecond), [cards]);
  const qualifiedById = useMemo(() => new Map(qualified32GbResults.map((result) => [result.productId, result])), []);
  const unifiedCount = cards.filter((gpu) => addressableGpuMemory(gpu) === 32).length;

  return (
    <section className="gpu32-research" aria-labelledby="gpu32-title">
      <header className="gpu32-heading">
        <Database />
        <span>
          <small>32 GB GPU DEEP DIVE</small>
          <h2 id="gpu32-title">Every {vendorScope === 'all' ? '' : `${vendorScope} `}32 GB card, with measured token speeds first.</h2>
          <p>The rank below uses one fixed control: Llama 2 7B Q4_0, one GPU, full offload, pp512/tg128, Flash Attention off. Near-matches stay visible in a separate evidence lane.</p>
        </span>
        <b>RESEARCHED 2026-08-12</b>
      </header>

      <div className="gpu32-summary" aria-label="32 GB research summary">
        <div><span>Physical 32 GB boards</span><strong>{cards.length}</strong><small>Every matching catalog entry</small></div>
        <div><span>True 32 GB pools</span><strong>{unifiedCount}</strong><small>{cards.length - unifiedCount} boards split memory across GPUs</small></div>
        <div><span>Fixed-control results</span><strong>{strict.length}</strong><small>Rankable apples-to-apples runs</small></div>
        <div><span>Qualified same-model runs</span><strong>{qualified.length}</strong><small>Useful evidence, excluded from rank</small></div>
      </div>

      <div className="gpu32-control">
        <div className="gpu32-control__title">
          <span><Gauge /><strong>Apples-to-apples decode ranking</strong><small>tg128 is the interactive generation rate; pp512 is prompt ingestion</small></span>
          <code>llama-bench · llama-2-7b.Q4_0.gguf · -ngl 99 · -fa 0</code>
        </div>
        <div className="gpu32-control-row gpu32-control-row--heading" aria-hidden="true">
          <span>Rank</span><span>32 GB GPU</span><span>Decode / prompt</span><span>Memory</span><span>Rated power</span><span>Screened used / value</span><span>Source</span>
        </div>
        <ol>
          {strict.map(({ product, benchmark }, index) => {
            const ask = screenedAsk(product);
            const perThousand = ask ? benchmark.generatedTokensPerSecond / (ask.low / 100_000) : undefined;
            return (
              <li className="gpu32-control-row" key={product.id}>
                <b className={`bandwidth-rank ${index < 3 ? `bandwidth-rank--${index + 1}` : ''}`}>#{index + 1}</b>
                <span className="gpu32-product"><small>{product.manufacturer} · {product.architecture}</small><strong>{product.name}</strong><i>{product.segment?.replace('-', ' ')} · {product.vramType}</i></span>
                <span className="gpu32-speed"><strong>{number(benchmark.generatedTokensPerSecond)} tok/s</strong><small>pp512 {number(benchmark.promptTokensPerSecond)} · {benchmark.backend}</small></span>
                <span><strong>{number(product.memoryBandwidthGbS ?? 0)} GB/s</strong><small>{product.memoryBusBits?.toLocaleString()}-bit · one pool</small></span>
                <span><strong>{product.boardPowerW ? `${product.boardPowerW} W` : 'Unpublished'}</strong><small>{product.cooling ?? 'cooling varies'}</small></span>
                <span><strong>{ask?.label ?? 'No screened ask'}</strong><small>{perThousand ? `${number(perThousand)} tok/s per $1K` : 'Value unavailable'}</small></span>
                <a href={benchmark.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open benchmark source for ${product.name}`}><ExternalLink /></a>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="gpu32-qualified">
        <header><ShieldCheck /><span><strong>Qualified same-model evidence</strong><small>Real measurements, but not silently mixed into the fixed no-FA rank</small></span></header>
        <div>
          {qualified.map((result) => {
            const product = cards.find((card) => card.id === result.productId);
            if (!product) return null;
            return (
              <article key={result.productId}>
                <span className={`gpu32-badge gpu32-badge--${result.comparisonClass}`}>{result.comparisonClass === 'flash-attention-on' ? 'FA ON' : result.comparisonClass === 'patched-metal' ? 'PATCHED METAL' : 'LEGACY HARNESS'}</span>
                <small>{product.manufacturer} · {product.architecture}</small>
                <h3>{product.name}</h3>
                <div><strong>{number(result.generatedTokensPerSecond)} tok/s</strong><span>decode / eval</span></div>
                <p>Prompt {number(result.promptTokensPerSecond)} tok/s · {result.backend}<br />{result.workload}</p>
                <p>{result.notes}</p>
                <a href={result.sourceUrl} target="_blank" rel="noreferrer">Open measured source <ExternalLink /></a>
              </article>
            );
          })}
        </div>
      </div>

      <div className="gpu32-audit">
        <header><strong>Complete 32 GB catalog audit</strong><span>“No matching run” means no public measurement survived the exact-device and reproducibility screen; it is not a speed estimate.</span></header>
        <div className="gpu32-audit-row gpu32-audit-row--heading" aria-hidden="true">
          <span>Graphics card</span><span>Usable memory</span><span>Published evidence</span><span>Core specifications</span><span>Used market</span>
        </div>
        <ol>
          {cards.map((gpu) => {
            const fixed = gpu.llmBenchmarks?.find((result) => result.profileKey === fixedProfileKey);
            const qualified = qualifiedById.get(gpu.id);
            const v100Evidence = preferredV100Benchmark(gpu.id);
            const ask = screenedAsk(gpu);
            const split = addressableGpuMemory(gpu) < 32;
            return (
              <li className="gpu32-audit-row" key={gpu.id}>
                <span className="gpu32-product"><small>{gpu.manufacturer} · {gpu.architecture}</small><strong>{gpu.name}</strong><i>{gpu.segment?.replace('-', ' ')} · {gpu.releaseYear}</i></span>
                <span><strong>{topology(gpu)}</strong><small>{split ? `${gpu.vramGb} GB board total cannot form one model pool` : `${gpu.vramType} · unified/addressable`}</small></span>
                <span className={`gpu32-evidence ${fixed ? 'is-control' : qualified || v100Evidence ? 'is-qualified' : 'is-missing'}`}>
                  <strong>{fixed ? `${number(fixed.generatedTokensPerSecond)} tok/s` : qualified ? `${number(qualified.generatedTokensPerSecond)} tok/s` : v100Evidence ? `${number(v100Evidence.generatedTokensPerSecond)} tok/s` : 'No matching public run'}</strong>
                  <small>{fixed ? `Fixed control · ${fixed.backend}` : qualified ? (qualified.comparisonClass === 'flash-attention-on' ? 'Same model · FA on' : qualified.comparisonClass === 'patched-metal' ? 'Same workload · patched Metal' : 'Same model · legacy harness') : v100Evidence ? `Exact-device evidence · ${v100Evidence.runtime}` : split ? 'Split memory · unranked' : 'Specs shown; speed left blank'}</small>
                </span>
                <span><strong>{gpu.memoryBandwidthGbS ? `${number(gpu.memoryBandwidthGbS)} GB/s` : 'Bandwidth unpublished'}</strong><small>{gpu.boardPowerW ? `${gpu.boardPowerW} W board` : 'Power unpublished'} · {gpu.parallelProcessors ? `${gpu.parallelProcessors.count.toLocaleString()} ${gpu.parallelProcessors.label}` : 'parallel count unavailable'}</small></span>
                <span><strong>{ask?.label ?? (gpu.usedMarket ? 'No trusted match' : 'Not screened')}</strong><small>{gpu.usedMarket ? `eBay checked ${gpu.usedMarket.observedAt}` : 'Open generic search in main table'}</small></span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
