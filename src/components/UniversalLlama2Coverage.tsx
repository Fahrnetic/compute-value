import { Boxes, CheckCircle2, ExternalLink, FlaskConical, Gauge, MemoryStick, ShieldAlert, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { dgxSparkCapacityBenchmarks, dgxSparkUniversalSource } from '../data/dgx-spark-benchmarks';
import { legacyLlama2Profile, legacyLlama2Suite } from '../data/universal-llama2-benchmarks';
import { qualifiedLlmBenchmarks } from '../data/qualified-llm-benchmarks';
import type { Gpu, LlmBenchmarkResult, MiniPc, Product } from '../types';
import { money } from '../lib/format';

const fixedProfile: LlmBenchmarkResult['profileKey'] = 'llama2-7b-q4_0-tg128-no-fa';
const ownedIds = new Set(['nvidia-rtx-4070-super', 'nvidia-rtx-3090']);

function number(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function UniversalLlama2Coverage({ products }: { products: Product[] }) {
  const nvidia = useMemo(() => products.filter((product): product is Gpu => (
    product.category === 'gpu' && product.manufacturer === 'NVIDIA'
  )), [products]);
  const fixed = useMemo(() => nvidia.flatMap((gpu) => {
    const benchmark = gpu.llmBenchmarks?.find((item) => item.profileKey === fixedProfile);
    return benchmark ? [{ gpu, benchmark }] : [];
  }).sort((a, b) => b.benchmark.generatedTokensPerSecond - a.benchmark.generatedTokensPerSecond), [nvidia]);
  const dgxSpark = useMemo(() => products.find((product): product is MiniPc => (
    product.category === 'mini-pc' && product.id === 'nvidia-dgx-spark'
  )), [products]);
  const dgxControl = dgxSpark?.llmBenchmarks?.find((item) => item.profileKey === fixedProfile);
  const ownedControl = fixed.filter(({ gpu }) => ownedIds.has(gpu.id));
  const fixedIds = useMemo(() => new Set(fixed.map(({ gpu }) => gpu.id)), [fixed]);
  const catalogLegacy = useMemo(() => legacyLlama2Suite.filter((result) => (
    nvidia.some((gpu) => gpu.id === result.productId)
  )), [nvidia]);
  const legacyAdds = catalogLegacy.filter((result) => !fixedIds.has(result.productId));
  const qualifiedAdds = qualifiedLlmBenchmarks.filter((result) => (
    nvidia.some((gpu) => gpu.id === result.productId) && !fixedIds.has(result.productId)
  ));
  const coverage = new Set([...fixedIds, ...legacyAdds.map((result) => result.productId), ...qualifiedAdds.map((result) => result.productId)]).size;
  const maximumLegacy = Math.max(...catalogLegacy.map((result) => result.generatedTokensPerSecond));

  const architectures = useMemo(() => Array.from(new Set(nvidia.map((gpu) => gpu.architecture ?? 'Unclassified')))
    .map((architecture) => {
      const cards = nvidia.filter((gpu) => (gpu.architecture ?? 'Unclassified') === architecture);
      const strict = cards.filter((gpu) => fixedIds.has(gpu.id));
      const archive = cards.filter((gpu) => !fixedIds.has(gpu.id) && (
        legacyLlama2Suite.some((result) => result.productId === gpu.id)
        || qualifiedLlmBenchmarks.some((result) => result.productId === gpu.id)
      ));
      const missing = cards.filter((gpu) => !fixedIds.has(gpu.id) && !archive.some((item) => item.id === gpu.id));
      return { architecture, cards, strict, archive, missing };
    })
    .sort((a, b) => b.cards.length - a.cards.length || a.architecture.localeCompare(b.architecture)), [nvidia, fixedIds]);

  return (
    <section className="universal-benchmark" aria-labelledby="universal-benchmark-title">
      <header className="universal-benchmark__heading">
        <span><FlaskConical /><small>UNIVERSAL CONTROL / NVIDIA COVERAGE</small></span>
        <div>
          <h2 id="universal-benchmark-title">One Llama 2 7B model. No blended scores.</h2>
          <p>The green lane is the current exact Q4_0 pp512/tg128 control. The archival lane uses that same model and quant across eight more single-GPU notebooks, but stays separate because its output length and software era differ.</p>
        </div>
        <div className="universal-benchmark__summary">
          <span><strong>{fixed.length}</strong><small>fixed-control cards</small></span>
          <span><strong>+{legacyAdds.length + qualifiedAdds.length}</strong><small>compatible-workload coverage</small></span>
          <span><strong>{coverage}/{nvidia.length}</strong><small>NVIDIA cards with Q4_0 evidence</small></span>
        </div>
      </header>

      <div className="universal-contract">
        <CheckCircle2 />
        <span><strong>Primary rank contract</strong><small>Llama 2 7B · Q4_0 · one GPU · full offload · pp512 / tg128 · Flash Attention off</small></span>
        <code>llama-bench -m llama-2-7b.Q4_0.gguf -ngl 99 -fa 0</code>
        <b>RANKABLE</b>
      </div>

      {dgxSpark && dgxControl && (
        <section className="dgx-spark-control" aria-labelledby="dgx-spark-control-title">
          <header>
            <span><Boxes /><small>COMPLETE SYSTEM · GRACE BLACKWELL</small></span>
            <div><h3 id="dgx-spark-control-title">DGX Spark has the universal run.</h3><p>{dgxSparkUniversalSource.conclusion} It stays outside the discrete-GPU rank, where comparing its complete 20-core Arm system to a bare graphics card would be misleading.</p></div>
            <b>STRICT MATCH</b>
          </header>

          <div className="dgx-spark-control__metrics">
            <span><small>FIXED DECODE</small><strong>{number(dgxControl.generatedTokensPerSecond)} tok/s</strong><em>tg128 · ± {number(dgxControl.generatedStdDev)}</em></span>
            <span><small>FIXED PROMPT</small><strong>{number(dgxControl.promptTokensPerSecond)} tok/s</strong><em>pp512 · ± {number(dgxControl.promptStdDev)}</em></span>
            <span><small>UNIFIED MEMORY</small><strong>{dgxSpark.memoryGb} GB</strong><em>{dgxSpark.memoryBandwidthGbS} GB/s</em></span>
            <span><small>GB10 / SUPPLY</small><strong>{dgxSpark.chipTdpW} W / {dgxSpark.powerSupplyW} W</strong><em>chip TDP / included PSU</em></span>
            <span><small>CURRENT MSRP</small><strong>{money(dgxSpark.price.amountCents)}</strong><em>raised from $3,999</em></span>
          </div>

          <div className="dgx-spark-control__comparison">
            <div className="dgx-spark-control__owned">
              <header><Gauge /><span><strong>Against your fixed controls</strong><small>Same exact model, quant, token lengths, and no-FA rule</small></span></header>
              {ownedControl.map(({ gpu, benchmark }) => {
                const speedRatio = benchmark.generatedTokensPerSecond / dgxControl.generatedTokensPerSecond;
                const memoryRatio = dgxSpark.memoryGb / gpu.vramGb;
                return (
                  <div key={gpu.id}>
                    <span><strong>{gpu.name}</strong><small>YOU OWN THIS</small></span>
                    <span><b>↓ {number((1 - dgxControl.generatedTokensPerSecond / benchmark.generatedTokensPerSecond) * 100)}%</b><small>Spark decode</small></span>
                    <span><b>{number(speedRatio)}×</b><small>{gpu.name.replace('GeForce ', '')} faster</small></span>
                    <span className="is-capacity"><b>↑ {number(memoryRatio)}×</b><small>Spark memory</small></span>
                  </div>
                );
              })}
              <p>The Spark loses the small 7B speed test, but its 128 GB coherent pool fits workloads that cannot stay wholly inside your 12 GB 4070 SUPER or 24 GB 3090.</p>
            </div>

            <div className="dgx-spark-control__models">
              <header><MemoryStick /><span><strong>What the 128 GB pool changes</strong><small>Additional llama.cpp runs · informative only, never mixed into the universal rank</small></span></header>
              {dgxSparkCapacityBenchmarks.map((result) => (
                <a href={result.sourceUrl} target="_blank" rel="noreferrer" key={result.model} title={result.interpretation}>
                  <span><strong>{result.model}</strong><small>{result.parameters} · {result.quantization}</small></span>
                  <span><b>{number(result.generatedTokensPerSecond)} tok/s</b><small>{result.test}</small></span>
                  <ExternalLink />
                </a>
              ))}
            </div>
          </div>

          <footer>
            <span><Zap /><strong>{dgxSpark.aiPerformanceLabel}</strong><small>theoretical sparse FP4 peak—not token throughput</small></span>
            <span><strong>Up to {dgxSpark.maxInferenceParametersB}B inference / {dgxSpark.maxFineTuneParametersB}B fine-tuning</strong><small>NVIDIA capacity claims; achievable speed depends heavily on model architecture and runtime</small></span>
            <a href={dgxControl.sourceUrl} target="_blank" rel="noreferrer">Universal source <ExternalLink /></a>
            <a href={dgxSpark.specSourceUrl} target="_blank" rel="noreferrer">Official specs <ExternalLink /></a>
          </footer>
        </section>
      )}

      {qualifiedAdds.map((result) => (
        <div className="universal-requested-result" key={result.productId}>
          <CheckCircle2 />
          <span><small>YOUR REQUEST · EXACT 16 GB DEVICE</small><strong>{result.hardware}</strong><p>Fixed pp512/tg128 workload · {result.model} {result.quantization} · one GPU · CUDA · no Flash Attention</p></span>
          <span><strong>{number(result.generatedTokensPerSecond)} tok/s</strong><small>decode · ± {number(result.generatedStdDev)}</small></span>
          <span><strong>{number(result.promptTokensPerSecond)} tok/s</strong><small>prompt · ± {number(result.promptStdDev)}</small></span>
          <b>UNRANKED*</b>
          <a href={result.sourceUrl} target="_blank" rel="noreferrer">Measured source <ExternalLink /></a>
          <p>*The source uses Llama 2 7B Chat rather than the scoreboard’s exact base-model GGUF. Same tensor geometry, quant, offload, and token lengths; disclosed instead of silently blending it into the strict rank.</p>
        </div>
      ))}

      <div className="universal-benchmark__body">
        <section className="universal-fixed">
          <header><Gauge /><span><strong>Current fixed-control leaders</strong><small>The same exact profile already drives the full ranking below</small></span><b>{fixed.length} measured</b></header>
          <ol>
            {fixed.slice(0, 10).map(({ gpu, benchmark }, index) => (
              <li key={gpu.id} className={ownedIds.has(gpu.id) ? 'is-owned' : ''}>
                <b>#{index + 1}</b>
                <span><strong>{gpu.name}</strong><small>{gpu.architecture}{ownedIds.has(gpu.id) ? ' · YOU OWN THIS' : ''}</small></span>
                <em>{number(benchmark.generatedTokensPerSecond)} tok/s</em>
              </li>
            ))}
          </ol>
          <p>Every remaining fixed-control card stays visible in the complete sortable table below. Cards without a qualifying run remain blank rather than inheriting a related GPU’s score.</p>
        </section>

        <section className="universal-archive">
          <header><FlaskConical /><span><strong>Archival same-model suite</strong><small>Q4_0 · 494-token prompt · 1,023 output evals · mean of 3 runs</small></span><b>{catalogLegacy.length} GPUs</b></header>
          <div className="universal-archive__rows">
            {catalogLegacy.map((result, index) => (
              <a href={result.sourceUrl} target="_blank" rel="noreferrer" key={result.productId}>
                <b>#{index + 1}</b>
                <span><strong>{result.hardware}</strong><i style={{ width: `${result.generatedTokensPerSecond / maximumLegacy * 100}%` }} /></span>
                {!fixedIds.has(result.productId) && <small>ADDS COVERAGE</small>}
                <em>{number(result.generatedTokensPerSecond)} tok/s</em>
                <span className="universal-archive__prompt">pp {number(result.promptTokensPerSecond)}</span>
                <ExternalLink />
              </a>
            ))}
          </div>
          <details><summary>Exact archival command and boundary</summary><code>{legacyLlama2Profile.commandShape}</code><p>{legacyLlama2Profile.caveat}</p><a href={legacyLlama2Profile.sourceUrl} target="_blank" rel="noreferrer">Open all source notebooks <ExternalLink /></a></details>
        </section>
      </div>

      <section className="universal-audit">
        <header><ShieldAlert /><span><strong>Coverage audit by NVIDIA architecture</strong><small>This is the research queue: exact gaps are named, not hidden behind specification estimates.</small></span></header>
        <div>
          {architectures.map((group) => (
            <details key={group.architecture} className={group.missing.length === 0 ? 'is-complete' : ''}>
              <summary>
                <span><strong>{group.architecture}</strong><small>{group.cards.length} catalog cards</small></span>
                <span><b>{group.strict.length}</b> fixed</span>
                <span><b>{group.archive.length}</b> archive-only</span>
                <span><b>{group.missing.length}</b> missing</span>
              </summary>
              <p>{group.missing.length
                ? `Still needs the universal run: ${group.missing.map((gpu) => gpu.name).join(', ')}`
                : 'Every card in this architecture has published Llama 2 evidence in one of the clearly separated lanes.'}</p>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}
