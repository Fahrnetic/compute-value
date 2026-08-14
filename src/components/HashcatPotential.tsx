import { Activity, BadgeDollarSign, Database, ExternalLink, Gauge, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  argon2EvidenceLabel,
  argon2Profile,
  buildArgon2Benchmarks,
  enterpriseMemoryHardResearch,
  v100Argon2SourceAudit,
  v100SeparateResearch,
  type Argon2Benchmark,
} from '../data/argon2-benchmarks';
import {
  buildHashcatPotentials,
  hashcatEligibleGpus,
  hashcatEvidenceLabel,
  hashcatMetricCopy,
  hashcatMetricValue,
  hashcatResearchDate,
  type HashcatEvidence,
  type HashcatMetric,
  type HashcatPotential as HashcatPotentialResult,
} from '../data/hashcat-potential';
import {
  buildHashcatValueResults,
  hashcatAddressableVramGb,
  hashcatConcurrentJobSlots,
  hashcatPriceCoverage,
  hashcatPriceResearchDate,
  type HashcatPriceSource,
  type HashcatValueResult,
} from '../data/hashcat-value';
import {
  buildTailsLuks2Benchmarks,
  tailsLuks2EvidenceLabel,
  tailsLuks2Profile,
  type TailsLuks2Benchmark,
} from '../data/tails-luks2-benchmarks';
import type { Product } from '../types';
import type { GpuRankingVendorScope } from './GpuFamilyDirectory';

type EvidenceFilter = 'all' | HashcatEvidence;
type RankingMode = 'value' | 'power' | 'capacity-value' | 'job-capacity' | 'job-value';

const evidenceOrder: HashcatEvidence[] = ['measured-exact', 'same-silicon-proxy', 'architecture-estimate'];

function number(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString('en-US', { maximumFractionDigits });
}

function money(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(cents / 100);
}

function priceRange(result: HashcatValueResult) {
  const price = result.acquisitionPrice;
  if (!price) return 'No qualifying current listing';
  const low = money(price.lowCents);
  const high = money(price.highCents);
  return low === high ? low : `${low}–${high}`;
}

function rate(result: HashcatPotentialResult, metric: HashcatMetric) {
  const value = hashcatMetricValue(result, metric);
  return `${number(value)} ${hashcatMetricCopy[metric].unit}`;
}

function potentialRange(result: HashcatPotentialResult, metric: HashcatMetric) {
  if (!result.uncertaintyPercent) return 'published benchmark result';
  const value = hashcatMetricValue(result, metric);
  const spread = result.uncertaintyPercent / 100;
  return `planning band ${number(value * (1 - spread))}–${number(value * (1 + spread))} ${hashcatMetricCopy[metric].unit}`;
}

function tailsRate(result: TailsLuks2Benchmark) {
  if (!result.uncertaintyPercent) return `${number(result.guessesPerSecond)} guesses/s`;
  const spread = result.uncertaintyPercent / 100;
  return `${number(result.guessesPerSecond)} guesses/s (${number(result.guessesPerSecond * (1 - spread))}–${number(result.guessesPerSecond * (1 + spread))})`;
}

function tailsEvidenceClass(result: TailsLuks2Benchmark) {
  return result.evidence === 'hardware-qualified' ? 'same-silicon-proxy' : 'measured-exact';
}

function argon2Rate(result: Argon2Benchmark) {
  if (!result.uncertaintyPercent) return `${number(result.hashesPerSecond)} H/s`;
  const spread = result.uncertaintyPercent / 100;
  return `≈${number(result.hashesPerSecond)} H/s (${number(result.hashesPerSecond * (1 - spread))}–${number(result.hashesPerSecond * (1 + spread))})`;
}

function argon2EvidenceClass(result: Argon2Benchmark) {
  if (result.evidence === 'bandwidth-model') return 'architecture-estimate';
  if (result.evidence === 'hardware-qualified-cluster') return 'same-silicon-proxy';
  return 'measured-exact';
}

function memoryTopology(result: HashcatPotentialResult) {
  const gpu = result.product;
  if (gpu.memoryPool === 'split' || (gpu.gpuCount ?? 1) > 1) {
    return `${gpu.gpuCount} × ${hashcatAddressableVramGb(gpu)} GB split`;
  }
  return `${hashcatAddressableVramGb(gpu)} GB one pool`;
}

function rankingValue(
  result: HashcatValueResult,
  metric: HashcatMetric,
  mode: RankingMode,
  jobFootprintGb: number,
) {
  if (mode === 'value') return result.perThousandDollars;
  if (mode === 'capacity-value') return result.vramGbPerThousandDollars;
  const jobSlots = hashcatConcurrentJobSlots(result.product, jobFootprintGb);
  if (mode === 'job-capacity') return jobSlots;
  if (mode === 'job-value') {
    if (!result.acquisitionPrice) return undefined;
    return jobSlots / (result.acquisitionPrice.amountCents / 100) * 1000;
  }
  return hashcatMetricValue(result, metric);
}

export function HashcatPotential({ products, vendorScope = 'all' }: {
  products: Product[];
  vendorScope?: GpuRankingVendorScope;
}) {
  const [metric, setMetric] = useState<HashcatMetric>('ntlm');
  const [evidence, setEvidence] = useState<EvidenceFilter>('all');
  const [vram, setVram] = useState('all');
  const [rankingMode, setRankingMode] = useState<RankingMode>('value');
  const [priceSource, setPriceSource] = useState<HashcatPriceSource>('best-verified');
  const [jobFootprintGb, setJobFootprintGb] = useState(8);

  const allEligible = useMemo(() => hashcatEligibleGpus(products), [products]);
  const argon2 = useMemo(() => buildArgon2Benchmarks(products)
    .filter((result) => vendorScope === 'all' || result.product.manufacturer === vendorScope), [products, vendorScope]);
  const tailsLuks2 = useMemo(() => buildTailsLuks2Benchmarks(products)
    .filter((result) => vendorScope === 'all' || result.product.manufacturer === vendorScope), [products, vendorScope]);
  const allResults = useMemo(() => buildHashcatPotentials(products), [products]);
  const valueResults = useMemo(() => buildHashcatValueResults(allResults, metric, priceSource), [allResults, metric, priceSource]);
  const scoped = useMemo(() => valueResults.filter((result) => vendorScope === 'all'
    || result.product.manufacturer === vendorScope), [valueResults, vendorScope]);
  const vramBuckets = useMemo(() => [...new Set(scoped.map((result) => result.addressableVramGb))]
    .sort((a, b) => a - b), [scoped]);
  const ranked = useMemo(() => scoped
    .filter((result) => evidence === 'all' || result.evidence === evidence)
    .filter((result) => vram === 'all' || result.addressableVramGb === Number(vram))
    .sort((a, b) => (rankingValue(b, metric, rankingMode, jobFootprintGb) ?? -1) - (rankingValue(a, metric, rankingMode, jobFootprintGb) ?? -1)
      || hashcatMetricValue(b, metric) - hashcatMetricValue(a, metric)
      || a.product.name.localeCompare(b.product.name)), [scoped, evidence, vram, metric, rankingMode, jobFootprintGb]);
  const exact = scoped.filter((result) => result.evidence === 'measured-exact');
  const family = scoped.filter((result) => result.evidence === 'same-silicon-proxy');
  const estimated = scoped.filter((result) => result.evidence === 'architecture-estimate');
  const missing = allEligible.filter((gpu) => !allResults.some((result) => result.product.id === gpu.id));
  const exactLeader = [...exact].sort((a, b) => hashcatMetricValue(b, metric) - hashcatMetricValue(a, metric))[0];
  const valueLeader = [...scoped].filter((result) => result.perThousandDollars !== undefined)
    .sort((a, b) => (b.perThousandDollars ?? 0) - (a.perThousandDollars ?? 0))[0];
  const pricedCount = hashcatPriceCoverage(scoped);
  const v100Rows = scoped.filter((result) => result.product.id.includes('v100'));

  return (
    <section className="hashcat-potential" aria-labelledby="hashcat-potential-title">
      <header className="hashcat-heading">
        <Gauge />
        <span>
          <small>HASHCAT POWER PER DOLLAR / EVERY GPU IN THE CATALOG</small>
          <h2 id="hashcat-potential-title">Literal hash power per dollar, from top to bottom.</h2>
          <p>The buyer score is only the selected Hashcat rate divided by a current purchasable price and multiplied by $1,000. It is not normalized: 140 literally means 140 GH/s per $1,000 in NTLM mode. Electricity cost, board wattage, VRAM, and concurrent-job capacity do not enter that score. Capacity remains a separate planning view.</p>
        </span>
        <b>BENCHMARKS {hashcatResearchDate} · PRICES {hashcatPriceResearchDate}</b>
      </header>

      <section className="argon2-rating" aria-labelledby="argon2-rating-title">
        <header>
          <Activity />
          <span>
            <small>FIRST-CLASS MEMORY-HARD RATING · HASHCAT MODE {argon2Profile.mode}</small>
            <h3 id="argon2-rating-title">Generic Argon2id performance</h3>
            <p>{number(argon2Profile.memoryKib / 1024)} MiB per candidate · t={argon2Profile.timeCost} · p={argon2Profile.parallelism}. This is the RFC 9106 recommendation used in Hashcat’s official cross-hardware comparison. It is ranked independently from the much heavier 1 GiB Tails LUKS2 profile below.</p>
          </span>
          <a href={argon2Profile.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink /> OFFICIAL PROFILE</a>
        </header>
        <div className="argon2-rating__table">
          <div className="argon2-rating__row argon2-rating__row--heading" aria-hidden="true">
            <span>Rank</span><span>Graphics card</span><span>Argon2 rate</span><span>Hashes per day</span><span>Evidence / method</span><span>Source</span>
          </div>
          {argon2.map((result, index) => (
            <div className={`argon2-rating__row is-${result.evidence}`} key={result.product.id}>
              <b>#{index + 1}</b>
              <span><small>{result.product.manufacturer} · {result.product.architecture}</small><strong>{result.product.name}</strong><i>{result.product.vramGb} GB · {result.product.memoryBandwidthGbS ?? '—'} GB/s memory</i></span>
              <span className="argon2-rating__rate"><strong>{argon2Rate(result)}</strong><small>{result.evidence === 'bandwidth-model' ? 'planning midpoint and mandatory band' : 'observed mode-34000 result'}</small></span>
              <span><strong>{number(result.hashesPerDay, 0)}</strong><small>24-hour theoretical total</small></span>
              <span><b className={`hashcat-evidence is-${argon2EvidenceClass(result)}`}>{argon2EvidenceLabel(result.evidence)}</b><small>{result.rationale}</small><i>{result.hashcatVersion}</i></span>
              <span className="argon2-rating__sources">
                <a href={result.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open Argon2 benchmark source for ${result.product.name}`} title={result.sourceName}><ExternalLink /><small>{result.evidence === 'bandwidth-model' ? 'ANCHOR' : 'BENCH'}</small></a>
                {result.methodSourceUrl ? <a href={result.methodSourceUrl} target="_blank" rel="noreferrer" aria-label={`Open Argon2 method source for ${result.product.name}`}><Database /><small>SPEC</small></a> : null}
              </span>
            </div>
          ))}
        </div>
        {(vendorScope === 'all' || vendorScope === 'NVIDIA') ? <article className="argon2-v100">
          <Database />
          <span>
            <small>FOUND · DIRECT V100 ARGON2 RUN · DO NOT MIX PROFILES</small>
            <strong>{v100SeparateResearch.directTailsHardware}: {v100SeparateResearch.directTailsLuks2Hs} H/s</strong>
            <p><b>{v100SeparateResearch.directTailsRawRunsHs.join(':')} H/s</b> across three public runs in mode 34100. The record reports {number(v100SeparateResearch.directTailsVramMib, 0)} MiB BAR1 and VBIOS {v100SeparateResearch.directTailsVbios}; OEM records identify that firmware as the PCIe 16 GB board. The uploader is shown only as <b>{v100SeparateResearch.directTailsUploader}</b>. A separate older report measured <b>{number(v100SeparateResearch.fourGpuBcryptCost5Hs / 1_000)} kH/s bcrypt cost 5</b> and <b>{number(v100SeparateResearch.fourGpuLuks1Hs, 0)} H/s LUKS1</b> across {v100SeparateResearch.fourGpuHardware}, but that older Hashcat build predates Argon2 support.</p>
          </span>
          <span className="argon2-v100__estimate"><small>V100 32 GB · MODE-34100 CAPACITY MODEL</small><strong>≈{number(v100SeparateResearch.pcie32TailsCapacityModelHs, 1)} H/s · {number(v100SeparateResearch.pcie32TailsCapacityModelGuessesPerDay, 0)}/day</strong><b>{v100SeparateResearch.pcie32TailsStatus}</b><i>{v100SeparateResearch.pcie32TailsCapacityModelLanes32Gb} one-GiB workspaces vs {v100SeparateResearch.pcie32TailsCapacityModelLanes16Gb} on the source board · ±{v100SeparateResearch.pcie32TailsCapacityModelUncertaintyPercent}% capacity-model band · not ranked as measured</i></span>
          <div><a href={v100SeparateResearch.directTailsSourceUrl} target="_blank" rel="noreferrer"><ExternalLink /> 16 GB RUN</a><a href={v100SeparateResearch.directTailsHardwareIdentitySourceUrl} target="_blank" rel="noreferrer"><ExternalLink /> VBIOS ID</a><a href={v100SeparateResearch.directTailsConcurrencySourceUrl} target="_blank" rel="noreferrer"><ExternalLink /> VRAM TUNING</a><a href={v100SeparateResearch.fourGpuSourceUrl} target="_blank" rel="noreferrer"><ExternalLink /> 4× V100 REPORT</a></div>
        </article> : null}
        {(vendorScope === 'all' || vendorScope === 'NVIDIA') ? <section className="v100-argon-audit" aria-label="V100 Argon2 source audit including Reddit">
          <header><ShieldCheck /><span><small>REDDIT + HASHCAT + OPENWALL + RAW UPLOADS</small><strong>Every V100 Argon2 candidate, with rejected near-misses left visible</strong></span></header>
          <div>
            {v100Argon2SourceAudit.map((source) => (
              <a className={`is-${source.verdict}`} href={source.sourceUrl} target="_blank" rel="noreferrer" key={source.source}>
                <span><small>{source.scope}</small><strong>{source.source}</strong></span>
                <b>{source.verdict === 'accepted-direct' ? 'ACCEPTED DIRECT' : source.verdict === 'near-miss' ? 'NEAR MISS' : 'MODEL ONLY'}</b>
                <p>{source.finding}</p>
                <i>{source.notes}</i>
                <ExternalLink />
              </a>
            ))}
          </div>
          <p><b>Reddit result:</b> no first-person Reddit post in this search supplied a V100 mode-34000 or mode-34100 output. The direct V100 Argon2 evidence came from the reproducible OpenBenchmarking upload; Reddit supplied useful V100 owner context but not the missing Argon2 run.</p>
        </section> : null}
        {(vendorScope === 'all' || vendorScope === 'NVIDIA') ? <section className="v100-field-evidence" aria-label="V100 results in other measured workloads">
          <header><Database /><span><small>WHAT PEOPLE HAVE ACTUALLY USED V100S FOR</small><strong>Direct results outside the original four-card source</strong></span></header>
          <div>
            <a href={v100SeparateResearch.eightGpuBcryptCost10SourceUrl} target="_blank" rel="noreferrer"><small>CONTEST HASHCAT · 8× V100</small><strong>{number(v100SeparateResearch.eightGpuBcryptCost10Hs, 0)} H/s</strong><span>bcrypt cost 10 after tuning</span><i>direct Openwall team report</i></a>
            <a href={v100SeparateResearch.sxm2_32ComputeSourceUrl} target="_blank" rel="noreferrer"><small>SCIENTIFIC COMPUTE · SXM2 32 GB</small><strong>{number(v100SeparateResearch.sxm2_32EmpiricalTensorFp16Tflops)} TFLOP/s</strong><span>empirical tensor FP16</span><i>{number(v100SeparateResearch.sxm2_32EmpiricalFp32Tflops)} FP32 · {number(v100SeparateResearch.sxm2_32SustainedBandwidthGbS)} GB/s sustained</i></a>
            <a href={v100SeparateResearch.dualPcie32P2pSourceUrl} target="_blank" rel="noreferrer"><small>MULTI-GPU P2P · 2× PCIE 32 GB</small><strong>{number(v100SeparateResearch.dualPcie32P2pBidirectionalGbS)} GB/s</strong><span>bidirectional CUDA P2P</span><i>{number(v100SeparateResearch.dualPcie32HostStagedBidirectionalGbS)} GB/s host-staged · {number(v100SeparateResearch.dualPcie32P2pLatencyUs)} µs P2P latency</i></a>
            <a href={v100SeparateResearch.dualSxm2_16LlmSourceUrl} target="_blank" rel="noreferrer"><small>LOCAL AI · 1–2× SXM2 16 GB</small><strong>{number(v100SeparateResearch.singleSxm2_16Gemma4_26bQ4TccTokensPerSecond)} tok/s</strong><span>single V100 · Gemma 4 26B Q4 · TCC</span><i>dual Qwen3.6 35B: {number(v100SeparateResearch.dualSxm2_16Qwen36_35bLongPromptAggregateTokensPerSecond)} tok/s at 16 long-prompt agents</i></a>
          </div>
          <p>These corroborate different parts of the hardware—compute, HBM bandwidth, inter-GPU transport, LLM inference, and a harder bcrypt setting. They do not become mode-34000 data and do not alter the Argon2 rank.</p>
        </section> : null}
        <section className="memory-hard-audit" aria-label="Promising enterprise GPU memory-hard research audit">
          <header><Gauge /><span><small>PROMISING 32–141 GB HARDWARE</small><strong>Measured additions, older anchors, and the exact gaps still open</strong></span></header>
          <div>
            {enterpriseMemoryHardResearch.map((result) => (
              <article className={`is-${result.evidence}`} key={result.hardware}>
                <span><small>{result.vram}</small><strong>{result.hardware}</strong></span>
                <span><b>{result.argon2Status}</b><small>{result.exactProfileResult ?? result.olderDirectContext ?? 'No exact-profile result accepted'}</small></span>
                <p>{result.notes}</p>
                {result.sourceUrl ? <a href={result.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open research source for ${result.hardware}`}><ExternalLink /></a> : <i>OPEN GAP</i>}
              </article>
            ))}
          </div>
        </section>
        <p className="argon2-rating__note"><b>Evidence boundary:</b> H200-family 4,050 H/s and RTX 5090 2,175 H/s are per-GPU normalizations from direct eight-card mode-34000 runs; the H200 form factor is unresolved and visibly qualified. RTX PRO 6000 Server, RTX 4090, RX 7900 XTX, RTX 5060 Ti, and the local RTX 4070 SUPER are measurements. The V100 midpoint remains a ±30% bandwidth model—not a direct V100 mode-34000 benchmark.</p>
      </section>

      <section className="tails-luks" aria-labelledby="tails-luks-title">
        <header>
          <Database />
          <span>
            <small>UNIVERSAL HEADER CONTROL · HASHCAT MODE {tailsLuks2Profile.mode}</small>
            <h3 id="tails-luks-title">Tails LUKS2 guesses per second by GPU</h3>
            <p>{number(tailsLuks2Profile.memoryKib / 1024)} MiB Argon2id memory · t={tailsLuks2Profile.timeCost} · p={tailsLuks2Profile.parallelism} · AES-XTS-512 · SHA-256. Ranked rates are observed on the named board. Generic Argon2 and different-VRAM sibling results are never converted into a Tails rate.</p>
          </span>
          <div className="tails-luks__sources">
            <a href={tailsLuks2Profile.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink /> HASHCAT PROFILE</a>
            <a href={tailsLuks2Profile.tailsSourceUrl} target="_blank" rel="noreferrer"><ExternalLink /> TAILS SETTINGS</a>
          </div>
        </header>
        <div className="tails-luks__table">
          <div className="tails-luks__row tails-luks__row--heading" aria-hidden="true">
            <span>Rank</span><span>Graphics card</span><span>Tails header rate</span><span>Guesses per day</span><span>Generic Argon2 control</span><span>Evidence</span><span>Source</span>
          </div>
          {tailsLuks2.map((result, index) => (
            <div className={`tails-luks__row is-${result.evidence}`} key={result.product.id}>
              <b>#{index + 1}</b>
              <span><small>{result.product.manufacturer} · {result.product.architecture}</small><strong>{result.product.name}</strong><i>{result.product.vramGb} GB · {result.product.boardPowerW ?? '—'} W</i></span>
              <span className="tails-luks__rate"><strong>{tailsRate(result)}</strong><small>one mode-34100 header</small></span>
              <span><strong>{number(result.guessesPerDay, 0)}</strong><small>24-hour theoretical total</small></span>
              <span><strong>{result.rfcArgon2Hs === undefined ? '—' : `${number(result.rfcArgon2Hs, 0)} H/s`}</strong><small>{result.rfcArgon2Hs === undefined ? 'not reported beside this run' : 'mode 34000 · 64 MiB, t=3, p=1'}</small></span>
              <span><b className={`hashcat-evidence is-${tailsEvidenceClass(result)}`}>{tailsLuks2EvidenceLabel(result.evidence)}</b><small>{result.rationale}</small><i>{result.hashcatVersion}</i></span>
              <a href={result.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open Tails LUKS2 benchmark source for ${result.product.name}`} title={result.sourceName}><ExternalLink /><small>BENCH</small></a>
            </div>
          ))}
        </div>
        <p className="tails-luks__note"><b>Evidence boundary:</b> RTX PRO 6000 Workstation 75 H/s, Max-Q 71 ±1 H/s, Server 55 H/s, RTX PRO 4500 26 H/s, RTX 5060 Ti 13 H/s, and RTX 5080 13 H/s are direct public mode-34100 results or exact-model public means. A V100 PCIe 16 GB measured 11:11:11 H/s, but that result is excluded from the 32 GB V100 row: Hashcat sizes Argon2 acceleration lanes from available memory, so the VRAM change can alter concurrency. The local 4070 SUPER measured 8 H/s under reported desktop-memory pressure. No generic-Argon2 or different-VRAM conversion enters this table.</p>
      </section>

      <div className="hashcat-summary">
        <span><small>Cards covered</small><strong>{scoped.length}</strong><i>{missing.length ? `${missing.length} catalog gaps` : 'complete requested scope'}</i></span>
        <span><small>Verified price coverage</small><strong>{pricedCount}/{scoped.length}</strong><i>unpriced boards remain visible, never $0</i></span>
        <span><small>Exact boards</small><strong>{exact.length}</strong><i>direct published runs</i></span>
        <span><small>Family proxies</small><strong>{family.length}</strong><i>±12% planning bands</i></span>
        <span><small>Architecture estimates</small><strong>{estimated.length}</strong><i>±30–40% planning bands</i></span>
        <span><small>Fastest exact {hashcatMetricCopy[metric].label}</small><strong>{exactLeader ? rate(exactLeader, metric) : '—'}</strong><i>{exactLeader?.product.name ?? 'No exact match'}</i></span>
        <span><small>Best literal value score</small><strong>{valueLeader?.perThousandDollars !== undefined ? number(valueLeader.perThousandDollars, 2) : '—'}</strong><i>{valueLeader ? `${hashcatMetricCopy[metric].unit} / $1K · ${valueLeader.product.name}` : 'No qualifying price'}</i></span>
      </div>

      <div className="hashcat-method">
        <article>
          <Database />
          <span><strong>Targets are data—not throughput multipliers.</strong><small>Hashcat sizes digest, salt, and extended-salt buffers from the real target count. Candidate concurrency comes from kernel power and temporary memory. More targets increase work; duplicate headers do not multiply aggregate hash rate.</small></span>
        </article>
        <article>
          <ShieldCheck />
          <span><strong>Compute drives rate; VRAM drives fit.</strong><small>CUDA-core/SM count, clocks, architecture, integer and bitwise throughput, occupancy, cache, and power limits determine compact-mode speed. Core count is only a within-generation proxy, so exact measurements outrank same-silicon proxies and cross-SKU estimates.</small></span>
        </article>
        <article>
          <BadgeDollarSign />
          <span><strong>Only purchasable listings enter the score.</strong><small>Direct retail uses the exact asking price. eBay uses the median screened ask to reduce one-listing noise. Sold-out pages, shipping, tax, host hardware, passive-card airflow, and power-system cost are excluded.</small></span>
        </article>
      </div>

      <div className="hashcat-controls">
        <div role="tablist" aria-label="Hashcat benchmark mode">
          {(Object.keys(hashcatMetricCopy) as HashcatMetric[]).map((key) => (
            <button key={key} role="tab" aria-selected={metric === key} className={metric === key ? 'active' : ''} onClick={() => setMetric(key)}>
              <Activity /><span><small>MODE {hashcatMetricCopy[key].mode}</small><strong>{hashcatMetricCopy[key].label}</strong></span>
            </button>
          ))}
        </div>
        <p>{hashcatMetricCopy[metric].description}</p>
        <label>Ranking<select aria-label="Hashcat ranking mode" value={rankingMode} onChange={(event) => setRankingMode(event.target.value as RankingMode)}>
          <option value="value">Power per dollar</option>
          <option value="power">Raw hash power</option>
          <option value="capacity-value">Addressable VRAM per dollar</option>
          <option value="job-capacity">Concurrent job headroom</option>
          <option value="job-value">Concurrent jobs per dollar</option>
        </select></label>
        <label>Price source<select aria-label="Hashcat price source" value={priceSource} onChange={(event) => setPriceSource(event.target.value as HashcatPriceSource)}>
          <option value="best-verified">Lowest verified available</option>
          <option value="B&H">B&amp;H direct only</option>
          <option value="Best Buy">Best Buy direct only</option>
          <option value="eBay">Screened eBay used</option>
        </select></label>
        <label>Evidence<select aria-label="Hashcat evidence quality" value={evidence} onChange={(event) => setEvidence(event.target.value as EvidenceFilter)}>
          <option value="all">All evidence tiers</option>
          {evidenceOrder.map((item) => <option value={item} key={item}>{hashcatEvidenceLabel(item)}</option>)}
        </select></label>
        <label>Addressable VRAM<select aria-label="Hashcat VRAM class" value={vram} onChange={(event) => setVram(event.target.value)}>
          <option value="all">All addressable capacities</option>
          {vramBuckets.map((capacity) => <option value={capacity} key={capacity}>{capacity} GB</option>)}
        </select></label>
        <label>Per-job VRAM<select aria-label="Concurrent job VRAM footprint" value={jobFootprintGb} onChange={(event) => setJobFootprintGb(Number(event.target.value))}>
          {[2, 4, 8, 16, 24, 32].map((capacity) => <option value={capacity} key={capacity}>{capacity} GB + 10% reserve</option>)}
        </select></label>
      </div>

      <div className="hashcat-table">
        <div className="hashcat-row hashcat-row--heading" aria-hidden="true">
          <span>Rank</span><span>Board / generation</span><span>{hashcatMetricCopy[metric].label}</span><span>Verified acquisition price</span><span>Literal value score</span><span>Capacity scenarios</span><span>VRAM / power spec</span><span>Benchmark evidence</span><span>Sources</span>
        </div>
        <ol>
          {ranked.map((result, index) => {
            const hasRankingValue = rankingValue(result, metric, rankingMode, jobFootprintGb) !== undefined;
            const displayRank = hasRankingValue
              ? ranked.slice(0, index + 1).filter((row) => rankingValue(row, metric, rankingMode, jobFootprintGb) !== undefined).length
              : undefined;
            const jobSlots = hashcatConcurrentJobSlots(result.product, jobFootprintGb);
            const jobSlotsPerThousand = result.acquisitionPrice
              ? jobSlots / (result.acquisitionPrice.amountCents / 100) * 1000
              : undefined;
            return (
            <li className={`hashcat-row is-${result.evidence} ${result.acquisitionPrice ? '' : 'is-unpriced'}`} key={result.product.id}>
              <b className={`bandwidth-rank ${displayRank && displayRank <= 3 ? `bandwidth-rank--${displayRank}` : ''}`}>{displayRank ? `#${displayRank}` : '—'}</b>
              <span className="hashcat-product"><small>{result.product.manufacturer} · {result.product.architecture}</small><strong>{result.product.name}</strong><i>{result.product.segment?.replace('-', ' ')} · {result.product.releaseYear}</i></span>
              <span className="hashcat-rate"><strong>{result.evidence === 'measured-exact' ? '' : '≈'}{rate(result, metric)}</strong><small>{potentialRange(result, metric)}</small></span>
              <span className="hashcat-price"><strong>{result.acquisitionPrice ? money(result.acquisitionPrice.amountCents) : 'Not scored'}</strong><small>{result.acquisitionPrice?.sourceLabel ?? 'No qualifying available listing'}</small><i>{result.acquisitionPrice ? `${priceRange(result)} · ${result.acquisitionPrice.condition}` : 'sold-out and missing prices do not become $0'}</i></span>
              <span className="hashcat-value-rate"><strong>{result.perThousandDollars !== undefined ? number(result.perThousandDollars, 2) : '—'}</strong><small>{result.perThousandDollars !== undefined ? `${hashcatMetricCopy[metric].unit} per $1,000` : 'price required'}</small></span>
              <span className="hashcat-value-score"><strong>{jobSlots} × {jobFootprintGb} GB planning jobs</strong><small>{jobSlotsPerThousand !== undefined ? `${number(jobSlotsPerThousand, 2)} slots / $1K` : 'price required for job value'}</small><i>{result.vramGbPerThousandDollars !== undefined ? `${number(result.vramGbPerThousandDollars, 2)} addressable GB / $1K` : 'price required for capacity value'}</i></span>
              <span className="hashcat-capacity"><strong>{memoryTopology(result)}</strong><small>{result.product.boardPowerW ? `${result.product.boardPowerW} W board ceiling` : 'power unpublished'} · {result.product.vramType ?? 'VRAM type unpublished'}</small></span>
              <span className="hashcat-benchmark"><b className={`hashcat-evidence is-${result.evidence}`}>{hashcatEvidenceLabel(result.evidence)}</b><small>{result.rationale}</small><i>{result.benchmarkHardware} · {result.hashcatVersion}</i></span>
              <span className="hashcat-sources">
                {result.acquisitionPrice ? <a href={result.acquisitionPrice.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open price source for ${result.product.name}`} title={`${result.acquisitionPrice.verification}. ${result.acquisitionPrice.notes}`}><ShoppingBag /><small>PRICE</small></a> : <i>NO PRICE</i>}
                <a href={result.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open Hashcat benchmark source for ${result.product.name}`} title={result.sourceName}><ExternalLink /><small>BENCH</small></a>
              </span>
            </li>
          );})}
        </ol>
      </div>

      <footer>
        <ShieldCheck />
        <p><b>Corrected scoring:</b> the main value score is literal {hashcatMetricCopy[metric].unit} per $1,000 of acquisition cost. Electricity and wattage have zero weight. Board power is displayed only as a hardware specification and may explain the measured rate; it does not alter the score after measurement. Addressable VRAM and concurrent-job headroom remain independent capacity rankings and are never multiplied into compact-hash speed. The V100 PCIe 32 GB point remains a ±12% proxy from a measured SXM2 run.</p>
      </footer>
    </section>
  );
}
