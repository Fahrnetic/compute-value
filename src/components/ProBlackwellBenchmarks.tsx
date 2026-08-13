import { AlertTriangle, ExternalLink, FlaskConical, Gauge, MemoryStick, Zap } from 'lucide-react';
import {
  formatProBlackwellSpeed,
  proBlackwellBenchmarksFor,
  proBlackwellNoPublicBenchmarkIds,
  unresolvedPro6000FamilyBenchmark,
  type ProBlackwellBenchmark,
  type ProBlackwellBenchmarkLane,
} from '../data/pro-blackwell-benchmarks';
import type { Gpu, Product } from '../types';

const laneCopy: Record<ProBlackwellBenchmarkLane, { label: string; explanation: string }> = {
  'fixed-control': {
    label: 'Fixed control',
    explanation: 'Llama 2 7B Q4_0 · one GPU · pp512/tg128 · Flash Attention off. These rows can be ranked together.',
  },
  'qualified-control': {
    label: 'Same model / FA on',
    explanation: 'Same Llama model and token counts, but a changed kernel setting keeps it outside the fixed-control rank.',
  },
  'other-model': {
    label: 'Exact device / other model',
    explanation: 'Real single-GPU generation on the named edition. Compare only when model, quantization, and runtime also match.',
  },
  'serving-throughput': {
    label: 'Serving throughput',
    explanation: 'Optimized output throughput for a serving workload; this is not interactive single-stream decode latency.',
  },
};

function isProBlackwell(product: Product): product is Gpu {
  return product.category === 'gpu'
    && product.manufacturer === 'NVIDIA'
    && product.architecture === 'Blackwell'
    && (product.generation === 'RTX PRO Blackwell' || product.generation === 'RTX PRO Blackwell Server');
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function ResultCard({ result }: { result: ProBlackwellBenchmark }) {
  const lane = laneCopy[result.lane];
  return (
    <article className={`pro-blackwell-result pro-blackwell-result--${result.lane}`}>
      <header>
        <span>{lane.label}</span>
        <a href={result.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open ${result.sourceName}`}>
          Source <ExternalLink />
        </a>
      </header>
      <div className="pro-blackwell-result__speed">
        <strong>{formatProBlackwellSpeed(result)}</strong>
        <small>{result.lane === 'serving-throughput' ? 'output throughput' : 'generation'}</small>
      </div>
      <div className="pro-blackwell-result__model">
        <strong>{result.model}</strong>
        <small>{result.quantization} · {result.runtime}</small>
      </div>
      {result.promptTokensPerSecond !== undefined && (
        <div className="pro-blackwell-result__prompt">
          <strong>{formatNumber(result.promptTokensPerSecond)} tok/s</strong>
          <small>prompt processing</small>
        </div>
      )}
      <p>{result.workload}</p>
      <details>
        <summary>Evidence notes</summary>
        <p>{result.notes}</p>
        <small>Observed {result.observedAt} · {result.sourceName}</small>
      </details>
    </article>
  );
}

function ProBlackwellGpuCard({ gpu }: { gpu: Gpu }) {
  const results = proBlackwellBenchmarksFor(gpu);
  const noPublicResult = proBlackwellNoPublicBenchmarkIds.has(gpu.id);
  return (
    <article className={`pro-blackwell-gpu${noPublicResult ? ' pro-blackwell-gpu--missing' : ''}`}>
      <header>
        <div>
          <span>{gpu.segment === 'data-center' ? 'SERVER EDITION' : 'WORKSTATION EDITION'}</span>
          <h3>{gpu.name}</h3>
        </div>
        <b>{results.length ? `${results.length} measured ${results.length === 1 ? 'run' : 'runs'}` : 'No exact-device result'}</b>
      </header>
      <div className="pro-blackwell-gpu__specs">
        <span><MemoryStick /><b>{gpu.vramGb} GB</b><small>{gpu.vramType ?? 'VRAM'}</small></span>
        <span><Gauge /><b>{gpu.memoryBandwidthGbS ? `${formatNumber(gpu.memoryBandwidthGbS)} GB/s` : 'Not published'}</b><small>memory bandwidth</small></span>
        <span><Zap /><b>{gpu.boardPowerW ? `${gpu.boardPowerW} W` : 'Not published'}</b><small>rated power</small></span>
      </div>
      {results.length > 0 ? (
        <div className="pro-blackwell-gpu__results">
          {results.map((result) => (
            <ResultCard result={result} key={`${result.productId}-${result.model}-${result.workload}`} />
          ))}
        </div>
      ) : (
        <div className="pro-blackwell-empty">
          <AlertTriangle />
          <span>
            <strong>{noPublicResult ? 'Public LLM benchmark not found' : 'Awaiting an exact-device result'}</strong>
            <small>No token-speed estimate is derived from bandwidth, FP4 TOPS, or CUDA-core count.</small>
          </span>
        </div>
      )}
    </article>
  );
}

export function ProBlackwellBenchmarks({ products }: { products: Product[] }) {
  const gpus = products.filter(isProBlackwell).sort((a, b) => {
    const segment = (a.segment === 'workstation' ? 0 : 1) - (b.segment === 'workstation' ? 0 : 1);
    return segment || b.vramGb - a.vramGb || a.name.localeCompare(b.name, 'en', { numeric: true });
  });
  const measuredEditions = gpus.filter((gpu) => proBlackwellBenchmarksFor(gpu).length > 0).length;
  const fixedControlEditions = gpus.filter((gpu) => proBlackwellBenchmarksFor(gpu)
    .some((result) => result.lane === 'fixed-control')).length;
  const singleStreamRuns = gpus.flatMap(proBlackwellBenchmarksFor)
    .filter((result) => result.lane !== 'serving-throughput').length;

  return (
    <section className="pro-blackwell-lab" aria-labelledby="pro-blackwell-title">
      <header className="pro-blackwell-heading">
        <FlaskConical />
        <div>
          <span className="section-kicker">RTX PRO BLACKWELL / EXACT-EDITION AUDIT</span>
          <h2 id="pro-blackwell-title">The missing PRO benchmarks, with the test conditions attached.</h2>
          <p>Every published number below names the exact card edition. Fixed-control results remain the only apples-to-apples rank; different models and optimized server throughput are visible without being blended into it.</p>
        </div>
        <div className="pro-blackwell-summary">
          <span><strong>{measuredEditions} / {gpus.length}</strong><small>editions with evidence</small></span>
          <span><strong>{fixedControlEditions}</strong><small>fixed-control editions</small></span>
          <span><strong>{singleStreamRuns}</strong><small>single-stream runs</small></span>
        </div>
      </header>

      <div className="pro-blackwell-lanes" aria-label="Benchmark evidence key">
        {(Object.entries(laneCopy) as [ProBlackwellBenchmarkLane, typeof laneCopy[ProBlackwellBenchmarkLane]][]).map(([lane, copy]) => (
          <div className={`pro-blackwell-lane pro-blackwell-lane--${lane}`} key={lane}>
            <strong>{copy.label}</strong><small>{copy.explanation}</small>
          </div>
        ))}
      </div>

      <aside className="pro-blackwell-unresolved">
        <AlertTriangle />
        <span>
          <strong>One useful RTX PRO 6000 result cannot be assigned to an edition.</strong>
          <small>{formatProBlackwellSpeed({ ...unresolvedPro6000FamilyBenchmark, productId: 'unresolved' })} generation · {formatNumber(unresolvedPro6000FamilyBenchmark.promptTokensPerSecond ?? 0)} tok/s prompt · {unresolvedPro6000FamilyBenchmark.notes}</small>
        </span>
        <a href={unresolvedPro6000FamilyBenchmark.sourceUrl} target="_blank" rel="noreferrer">Inspect submission <ExternalLink /></a>
      </aside>

      <div className="pro-blackwell-grid">
        {gpus.map((gpu) => <ProBlackwellGpuCard gpu={gpu} key={gpu.id} />)}
      </div>
    </section>
  );
}
