import { Database, ExternalLink, Gauge, Layers3, Network, Server, ShieldCheck, UserRound, Users, Zap } from 'lucide-react';
import {
  universalOllamaLlama2_7b,
  v100Benchmarks,
  v100ModuleBenchmarks,
  v100ModulePlatforms,
  v100ScaleResults,
  type V100Benchmark,
  type V100ScaleResult,
} from '../data/v100-benchmarks';
import type { Gpu, Product } from '../types';

function number(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function usedRange(products: Product[], productId: string, quantity = 1) {
  const gpu = products.find((product): product is Gpu => product.category === 'gpu' && product.id === productId);
  const prices = gpu?.usedMarket?.listings.map((listing) => listing.amountCents).sort((a, b) => a - b) ?? [];
  if (!prices.length) return 'No screened ask';
  const money = (cents: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
  const low = money(prices[0] * quantity);
  const high = money((prices.at(-1) ?? prices[0]) * quantity);
  return low === high ? low : `${low}–${high}`;
}

function resultSpeed(value: number | null) {
  return value === null ? '—' : number(value);
}

function ScaleLane({ results, icon, title, subtitle }: {
  results: V100ScaleResult[];
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <section className={`v100-scale-lane v100-scale-lane--${results[0].lane}`}>
      <header>{icon}<span><strong>{title}</strong><small>{subtitle}</small></span></header>
      <div className="v100-scale-row v100-scale-row--heading"><span>Model</span><span>1×</span><span>2×</span><span>4×</span><span>4× outcome</span></div>
      {results.map((result) => {
        const baseline = result.oneGpuTokensPerSecond ?? result.twoGpuTokensPerSecond;
        const ratio = baseline ? result.fourGpuTokensPerSecond / baseline : null;
        return (
          <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="v100-scale-row" key={result.id} title={result.notes}>
            <span><strong>{result.model}</strong><small>{result.precision}</small></span>
            <span>{resultSpeed(result.oneGpuTokensPerSecond)}<small>tok/s</small></span>
            <span>{resultSpeed(result.twoGpuTokensPerSecond)}<small>tok/s</small></span>
            <span><b>{number(result.fourGpuTokensPerSecond)}</b><small>tok/s</small></span>
            <span className={result.lane === 'multi-user-vllm' ? 'is-positive' : ratio && ratio < 1 ? 'is-negative' : ''}>
              <strong>{ratio ? result.lane === 'multi-user-vllm' ? `${number(ratio)}×` : `${ratio >= 1 ? '↑' : '↓'} ${number(Math.abs(ratio - 1) * 100)}%` : '4× only'}</strong>
              <small>{result.lane === 'multi-user-vllm' ? 'aggregate' : 'one response'}</small>
            </span>
            <ExternalLink />
          </a>
        );
      })}
      <footer><span>{results[0].workload}</span><a href={results[0].sourceUrl} target="_blank" rel="noreferrer">Measured source <ExternalLink /></a></footer>
    </section>
  );
}

function BenchmarkCard({ result, label }: { result: V100Benchmark; label: string }) {
  return (
    <article className={`v100-result-card v100-result-card--${result.lane}`}>
      <header><small>{label}</small><b>{result.gpuCount} GPU</b></header>
      <h3>{result.hardware}</h3>
      <div className="v100-result-card__speed">
        <strong>{number(result.generatedTokensPerSecond)} tok/s</strong>
        <span>{result.model} · {result.quantization}</span>
      </div>
      <p>{result.runtime}<br />{result.workload}</p>
      {result.promptTokensPerSecond !== undefined && <p className="v100-result-card__prompt">Prompt processing: <b>{number(result.promptTokensPerSecond)} tok/s</b></p>}
      <small className="v100-result-card__note">{result.notes}</small>
      <a href={result.sourceUrl} target="_blank" rel="noreferrer">Open measured source <ExternalLink /></a>
    </article>
  );
}

export function V100Benchmarks({ products }: { products: Product[] }) {
  const fixed = v100Benchmarks.find((result) => result.id === 'v100-32-llama2-7b-no-fa')!;
  const flashAttention = v100Benchmarks.find((result) => result.id === 'v100-32-llama2-7b-fa')!;
  const exactV100s = v100Benchmarks.find((result) => result.id === 'v100s-32-ollama-llama2-7b')!;
  const v100sCurve = v100Benchmarks.filter((result) => result.productId === 'nvidia-tesla-v100s-pcie-32' && result.lane === 'ollama');
  const modern = v100Benchmarks.filter((result) => result.lane === 'modern-llamacpp');
  const singleStreamScale = v100ScaleResults.filter((result) => result.lane === 'single-stream-llamacpp');
  const multiUserScale = v100ScaleResults.filter((result) => result.lane === 'multi-user-vllm');
  const maxUniversal = Math.max(...universalOllamaLlama2_7b.map((result) => result.generatedTokensPerSecond));

  return (
    <section className="v100-lab" aria-labelledby="v100-lab-title">
      <header className="v100-heading">
        <Database />
        <div>
          <span className="section-kicker">VOLTA / MEASURED LLM EVIDENCE</span>
          <h2 id="v100-lab-title">Tesla V100 benchmarks, separated by exact hardware and harness.</h2>
          <p>The V100 now has a fixed llama.cpp control, exact four-module SXM2 measurements, an SXM3/NVSwitch platform audit, a four-card scaling study, a universal Ollama comparison, and modern Gemma/Qwen measurements. Results stay in their own lanes when runtimes, topology, or GPU counts differ.</p>
        </div>
        <div className="v100-summary">
          <span><strong>{number(fixed.generatedTokensPerSecond)}</strong><small>V100 32 GB fixed-control tok/s</small></span>
          <span><strong>{number(exactV100s.generatedTokensPerSecond)}</strong><small>Exact V100S Ollama 7B tok/s</small></span>
          <span><strong>{v100Benchmarks.length + v100ScaleResults.length + v100ModuleBenchmarks.length}</strong><small>Published V100 measurements</small></span>
        </div>
      </header>

      <div className="v100-verdict">
        <ShieldCheck />
        <span>
          <strong>Exact Tesla V100S PCIe 32 GB result found</strong>
          <small>121.97 tok/s on Ollama Llama 2 7B. It is real measured evidence, but the source does not disclose the exact model digest, so the fixed llama.cpp rank remains blank for V100S.</small>
        </span>
        <b>NO ESTIMATE</b>
      </div>

      <section className="v100-modules" aria-labelledby="v100-modules-title">
        <header>
          <Network />
          <div>
            <span className="section-kicker">SXM MODULES / BASEBOARD FABRIC</span>
            <h3 id="v100-modules-title">SXM2 is the viable 4-module build. SXM3 starts as an 8-module NVSwitch platform.</h3>
            <p>Both can expose 128 GB to a four-GPU workload, but they are not interchangeable boards. NVLink improves peer transfers; it does not fuse four HBM stacks into one hardware memory controller.</p>
          </div>
          <b>NO CALCULATED UPLIFT</b>
        </header>

        <div className="v100-module-platforms">
          {v100ModulePlatforms.map((platform) => (
            <article className={`v100-module-platform v100-module-platform--${platform.id}`} key={platform.id}>
              <header>
                <span><small>{platform.id === 'sxm2-quad' ? 'PRACTICAL QUAD BUILD' : 'ENTERPRISE NVSWITCH'}</small><strong>{platform.module}</strong></span>
                <b>{platform.baseboardGpuCount} GPU BOARD</b>
              </header>
              <h4>{platform.baseboard}</h4>
              <div>
                <span><small>4-GPU memory</small><strong>{platform.fourGpuMemoryGb} GB</strong></span>
                <span><small>HBM2 / GPU</small><strong>{number(platform.memoryBandwidthGbSPerGpu)} GB/s</strong></span>
                <span><small>GPU fabric</small><strong>{number(platform.fabricBandwidthGbSPerGpu)} GB/s</strong></span>
                <span><small>4-GPU max</small><strong>{number(platform.fourGpuMaxPowerW)} W</strong></span>
              </div>
              <p><b>{platform.fabric}</b><br />{platform.fourGpuMode}</p>
              <small>{platform.notes}</small>
              <a href={platform.sourceUrl} target="_blank" rel="noreferrer">{platform.sourceName} <ExternalLink /></a>
            </article>
          ))}
        </div>

        <div className="v100-module-results">
          <header>
            <Server />
            <span><strong>Measured 4×32 GB NVLink results</strong><small>Exact topology where disclosed · workload boundaries preserved</small></span>
            <b>SXM3 LLM CONTROL: NOT FOUND</b>
          </header>
          <div>
            {v100ModuleBenchmarks.map((result) => (
              <a href={result.sourceUrl} target="_blank" rel="noreferrer" key={result.id} title={result.notes}>
                <span><small>{result.resultKind === 'aggregate' ? 'AGGREGATE SERVER' : 'SINGLE STREAM'}</small><strong>{result.model}</strong><i>{result.platform}</i></span>
                <span><small>Output</small><strong>{number(result.generatedTokensPerSecond)} tok/s</strong>{result.peakGeneratedTokensPerSecond && <i>{number(result.peakGeneratedTokensPerSecond)} peak</i>}</span>
                <span><small>Prompt</small><strong>{result.promptTokensPerSecond ? `${number(result.promptTokensPerSecond)} tok/s` : 'Not published'}</strong>{result.measuredLoadPowerW && <i>{number(result.measuredLoadPowerW)} W measured load</i>}</span>
                <span><small>{result.quantization}</small><strong>{result.runtime}</strong><i>{result.workload}</i></span>
                <ExternalLink />
              </a>
            ))}
          </div>
          <footer><Zap /><p><b>The exact MiniMax test shows the software trap:</b> layer split delivered 38.60 tok/s versus 20.05 tok/s with row split on the same four SXM2 modules. Buying NVLink does not guarantee that a runtime uses it efficiently.</p></footer>
        </div>
      </section>

      <section className="v100-quad" aria-labelledby="v100-quad-title">
        <header>
          <Layers3 />
          <div><span className="section-kicker">PCIe / FORM-FACTOR-UNDISCLOSED BASELINES</span><h3 id="v100-quad-title">What the published 1× / 2× / 4× controls show</h3><p>The llama.cpp study does not identify PCIe versus SXM or publish its interconnect topology; the vLLM study uses PCIe cards. These remain baselines, not claimed SXM2 results.</p></div>
          <div className="v100-quad__stats">
            <span><strong>128 GB</strong><small>4× 32 GB · sharded</small></span>
            <span><strong>1,000 W</strong><small>4× PCIe GPU TDP</small></span>
            <span><strong>{usedRange(products, 'nvidia-tesla-v100-pcie-32', 4)}</strong><small>4× PCIe used asks</small></span>
          </div>
        </header>

        <div className="v100-quad__answer">
          <span><UserRound /><small>ONE CHAT / LLAMA.CPP Q4_K_M</small><strong>92.21 tok/s</strong><p>Llama 2 7B on four GPUs—<b>8.66% slower</b> than its measured one-GPU run. Form factor and fabric were not published.</p></span>
          <span><Users /><small>FOUR CLIENTS / VLLM FP16</small><strong>400.2 tok/s</strong><p>Llama 2 7B aggregate server throughput—<b>2.60× the one-card total</b>, but not 400 tok/s for each response.</p></span>
          <span><Database /><small>THE CAPACITY WIN</small><strong>70B Q4 at 15.26 tok/s</strong><p>The 41.42 GiB Llama 2 70B quant fits across the pool. Two V100s measured 15.57 tok/s, so cards three and four add headroom, not speed.</p></span>
        </div>

        <div className="v100-quad__lanes">
          <ScaleLane results={singleStreamScale} icon={<UserRound />} title="Single-response generation" subtitle="llama.cpp Q4_K_M · mean and standard deviation from ten runs" />
          <ScaleLane results={multiUserScale} icon={<Users />} title="Multi-user server throughput" subtitle="vLLM FP16 · four concurrent async clients · aggregate output" />
        </div>

        <footer className="v100-quad__bottom-line">
          <Zap />
          <span><strong>Bottom line</strong><p>Use four V100s to fit larger models or serve concurrent users. For the fastest single 7B response, use one card and leave the other three independent—or choose a newer, faster GPU. The 128 GB is four address spaces joined by software; NVLink changes the peer path, not that memory model.</p></span>
          <b>4× 900 GB/s LOCAL HBM</b>
        </footer>
      </section>

      <div className="v100-primary-grid">
        <BenchmarkCard result={fixed} label="FIXED CONTROL · FA OFF" />
        <BenchmarkCard result={flashAttention} label="SAME MODEL · FA ON" />
        <BenchmarkCard result={exactV100s} label="EXACT V100S · OLLAMA" />
      </div>

      <div className="v100-market-strip">
        <span><small>V100 PCIe 32 GB screened used asks</small><strong>{usedRange(products, 'nvidia-tesla-v100-pcie-32')}</strong></span>
        <span><small>V100S PCIe 32 GB screened used asks</small><strong>{usedRange(products, 'nvidia-tesla-v100s-pcie-32')}</strong></span>
        <p>The 129.08 and 121.97 figures use different harnesses. Price-per-token is deliberately not calculated across them.</p>
      </div>

      <div className="v100-evidence-grid">
        <section className="v100-panel">
          <header><Gauge /><span><strong>Universal Ollama Llama 2 7B lane</strong><small>Same study, model tag, prompt, and runtime across every row</small></span></header>
          <ol className="v100-universal-list">
            {universalOllamaLlama2_7b.map((result, index) => (
              <li className={result.isV100 ? 'is-v100' : ''} key={result.hardware}>
                <b>#{index + 1}</b>
                <span><strong>{result.hardware}</strong><i style={{ width: `${(result.generatedTokensPerSecond / maxUniversal) * 100}%` }} /></span>
                <em>{number(result.generatedTokensPerSecond)} tok/s</em>
              </li>
            ))}
          </ol>
          <a href={exactV100s.sourceUrl} target="_blank" rel="noreferrer">Cloud Mercato Projector source <ExternalLink /></a>
        </section>

        <section className="v100-panel">
          <header><Database /><span><strong>Exact V100S model-size curve</strong><small>One Tesla V100S PCIe 32 GB under the Projector/Ollama harness</small></span></header>
          <div className="v100-curve">
            {v100sCurve.map((result) => (
              <article key={result.id}>
                <small>{result.model}</small>
                <strong>{number(result.generatedTokensPerSecond)} tok/s</strong>
                <span>{result.model.endsWith('70B') ? 'Source does not disclose placement' : 'Exact-device measured generation'}</span>
              </article>
            ))}
          </div>
          <p>The 70B result drops to 2.50 tok/s. That row remains useful because it shows the practical cliff when model size outruns this single-card setup, even though the source does not expose the placement details.</p>
        </section>
      </div>

      <section className="v100-modern">
        <header><strong>Modern llama.cpp workloads on V100 SXM2</strong><small>Current practical models, kept separate by model, quantization, and one- versus two-GPU topology</small></header>
        <div>
          {modern.map((result) => (
            <article key={result.id}>
              <span><small>{result.gpuCount === 1 ? 'SINGLE GPU' : 'DUAL GPU'} · {result.hardware}</small><strong>{result.model}</strong><i>{result.quantization}</i></span>
              <span><strong>{number(result.generatedTokensPerSecond)} tok/s</strong><small>{result.workload}</small></span>
              <a href={result.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open ${result.model} V100 benchmark source`}><ExternalLink /></a>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
