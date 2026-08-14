import {
  ArrowDown, ArrowUp, Building2, Database, ExternalLink, Gauge, Network,
  PlugZap, Search, Server, ShieldAlert, Trophy, Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ModelFormatCompatibility } from './ModelFormatCompatibility';
import {
  assessHouseOutlet, dgxSparkCapacityProof, dgxSparkCurrentAudit, dgxSparkTensorParallelResults,
  clusterRawComputeById, clusterRawComputeRows, clusterSystemCostById, enterpriseClusters, enterpriseGenerations, fourGpuPcieClusters,
  exactEightGpuControls, h200SuperpodLadder,
  LLAMA2_70B_Q4_0_MODEL_SIZE_GB,
  US_HOUSE_OUTLET_CONTINUOUS_W,
  type EnterpriseGeneration, type EnterpriseScale,
} from '../data/enterprise-clusters';
import {
  aiRouteScores, powerLimitEvidence, routeScoreMethod, routeScoreWeights,
  type AiRouteScore,
} from '../data/ai-route-score';

type SortMode = 'unlimited' | 'memory' | 'gpus' | 'power' | 'cost' | 'tokens' | 'roofline' | 'compute';
type RouteSortMode = 'score' | 'speed' | 'capacity' | 'cost' | 'value' | 'power';

const scaleLabel: Record<EnterpriseScale, string> = {
  baseboard: 'Baseboard',
  node: 'Complete node',
  'desktop-cluster': 'Desktop cluster',
  superpod: 'SuperPOD',
};

function formatMemory(gb: number) {
  if (gb >= 1000) return `${(gb / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} TB`;
  return `${gb.toLocaleString()} GB`;
}

function formatPower(kw: number) {
  if (kw >= 1000) return `${(kw / 1000).toFixed(3)} MW`;
  return `${kw.toLocaleString(undefined, { maximumFractionDigits: 1 })} kW`;
}

function formatBandwidth(tb: number) {
  if (tb >= 1000) return `${(tb / 1000).toLocaleString(undefined, { maximumFractionDigits: 4 })} PB/s`;
  return `${tb.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB/s`;
}

function formatCompute(tflops: number) {
  if (tflops >= 1_000_000) return `${(tflops / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 3 })} EFLOPS`;
  if (tflops >= 1_000) return `${(tflops / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} PFLOPS`;
  return `${tflops.toLocaleString(undefined, { maximumFractionDigits: 1 })} TFLOPS`;
}

function formatTokens(tokensPerSecond: number) {
  if (tokensPerSecond >= 1_000_000) return `${(tokensPerSecond / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
  return tokensPerSecond.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function formatUsd(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
  return `$${(value / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
}

function formatSystemCost(route: AiRouteScore) {
  return `${formatUsd(route.systemCostLowUsd)}–${formatUsd(route.systemCostHighUsd)}`;
}

function formatAuditDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function EnterpriseClusters() {
  const [generation, setGeneration] = useState<'all' | EnterpriseGeneration>('all');
  const [scale, setScale] = useState<'all' | EnterpriseScale>('all');
  const [sort, setSort] = useState<SortMode>('unlimited');
  const [routeSort, setRouteSort] = useState<RouteSortMode>('score');
  const [search, setSearch] = useState('');

  const controls = [...exactEightGpuControls].sort((a, b) => a.benchmark!.tokensPerSecond - b.benchmark!.tokensPerSecond);
  const h100 = controls.find((cluster) => cluster.generation === 'H100')!;
  const h200 = controls.find((cluster) => cluster.generation === 'H200')!;
  const mlperfGain = ((h200.benchmark!.tokensPerSecond / h100.benchmark!.tokensPerSecond) - 1) * 100;
  const maximum = enterpriseClusters.find((cluster) => cluster.unlimitedRank === 1)!;
  const rawRows = [...clusterRawComputeRows].sort((a, b) => b.idealQ4DecodeTokensPerSecond - a.idealQ4DecodeTokensPerSecond);
  const exactMeasuredClusterCount = enterpriseClusters.filter((cluster) => cluster.benchmark?.comparable).length;
  const rankedRoutes = useMemo(() => [...aiRouteScores].sort((a, b) => {
    if (routeSort === 'speed') return b.inferredSeventyBTokensMid - a.inferredSeventyBTokensMid;
    if (routeSort === 'capacity') return b.totalVramGb - a.totalVramGb;
    if (routeSort === 'cost') return a.systemCostMidUsd - b.systemCostMidUsd;
    if (routeSort === 'value') return b.valueScore - a.valueScore;
    if (routeSort === 'power') return b.powerScore - a.powerScore;
    return b.overallScore - a.overallScore;
  }), [routeSort]);
  const bestOverallRoute = aiRouteScores[0];
  const fastestRoute = [...aiRouteScores].sort((a, b) => b.inferredSeventyBTokensMid - a.inferredSeventyBTokensMid)[0];
  const bestValueRoute = [...aiRouteScores].sort((a, b) => b.valueScore - a.valueScore)[0];
  const bestSingle48 = [...aiRouteScores]
    .filter((route) => route.gpuCount === 1 && route.vramPerGpuGb === 48)
    .sort((a, b) => b.overallScore - a.overallScore)[0];
  const outletCounts = enterpriseClusters.reduce((counts, cluster) => {
    counts[assessHouseOutlet(cluster).verdict] += 1;
    return counts;
  }, { yes: 0, conditional: 0, no: 0 });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = enterpriseClusters.filter((cluster) => {
      if (generation !== 'all' && cluster.generation !== generation) return false;
      if (scale !== 'all' && cluster.scale !== scale) return false;
      if (query && ![
        cluster.name, cluster.generation, cluster.architecture, cluster.fabric,
        cluster.formFactor, cluster.bestFor, cluster.networking,
      ].join(' ').toLowerCase().includes(query)) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === 'memory') return b.totalGpuMemoryGb - a.totalGpuMemoryGb;
      if (sort === 'gpus') return b.gpuCount - a.gpuCount;
      if (sort === 'power') return a.systemPowerKw - b.systemPowerKw;
      if (sort === 'cost') return clusterSystemCostById.get(a.id)!.lowUsd - clusterSystemCostById.get(b.id)!.lowUsd;
      if (sort === 'tokens') return (b.benchmark?.tokensPerSecond ?? -1) - (a.benchmark?.tokensPerSecond ?? -1);
      if (sort === 'roofline') return clusterRawComputeById.get(b.id)!.idealQ4DecodeTokensPerSecond - clusterRawComputeById.get(a.id)!.idealQ4DecodeTokensPerSecond;
      if (sort === 'compute') return clusterRawComputeById.get(b.id)!.aggregateDenseFp16TensorTflops - clusterRawComputeById.get(a.id)!.aggregateDenseFp16TensorTflops;
      return a.unlimitedRank - b.unlimitedRank;
    });
  }, [generation, scale, sort, search]);

  return (
    <main className="cluster-page">
      <section className="cluster-hero">
        <div className="cluster-hero__copy">
          <span className="section-kicker">ENTERPRISE CLUSTERS / BUDGET DISABLED</span>
          <h1>When price stops<br />being the constraint.</h1>
          <p>Four-card GeForce and RTX PRO workstations now sit beside V100, A100, A800, H100, and H200 infrastructure—from PCIe desktop clusters to a 1,016-GPU SuperPOD. Every configuration now has the same raw Llama 2 70B roofline; measured token results remain a separate evidence lane.</p>
          <div className="cluster-hero__pills">
            <span><Server /> {enterpriseClusters.length} configurations</span>
            <span><Database /> {formatMemory(maximum.totalGpuMemoryGb)} maximum HBM</span>
            <span><Trophy /> H200 is the measured node leader</span>
          </div>
        </div>
        <div className="cluster-hero__maximum">
          <span>NO-COMPROMISE ENDPOINT</span>
          <strong>{maximum.name}</strong>
          <div>
            <span><b>{maximum.gpuCount.toLocaleString()}</b><small>GPUs</small></span>
            <span><b>{formatBandwidth(maximum.gpuCount * maximum.memoryBandwidthTbSPerGpu)}</b><small>summed local HBM</small></span>
            <span className="is-power"><b>{formatPower(maximum.systemPowerKw)} <ArrowDown /></b><small>compute nodes only</small></span>
          </div>
          <p>Facility power is higher after networking, storage, management, and cooling.</p>
        </div>
      </section>

      <section className="cluster-verdict" aria-label="Unlimited budget recommendation">
        <article><span>01 / ULTIMATE</span><strong>4-SU H200 SuperPOD</strong><p>The largest published H200 reference design in this catalog: 127 DGX nodes and 1,016 GPUs.</p></article>
        <article><span>02 / BEST SINGLE NODE</span><strong>DGX H200</strong><p>1.128TB HBM3e and the best exact eight-GPU Llama 2 control, without pretending a whole pod is one giant GPU.</p></article>
        <article className="is-warning"><span>03 / GREENFIELD WARNING</span><strong>Skip A800 and V100</strong><p>Buy them only for fleet compatibility, regional constraints, or unusually cheap used capacity—not because they beat H200.</p></article>
      </section>

      <section className="cluster-decision" aria-labelledby="cluster-decision-title">
        <header>
          <div><span className="section-kicker">OWNER ROUTE SCORE / COMPLETE-SYSTEM ECONOMICS</span><h2 id="cluster-decision-title">One score for the decision—not one fake benchmark.</h2><p>Every route uses the same Llama 2 Q4 weight-streaming contract. Exact 7B controls are scaled to the same 38.87GB 70B file, then discounted by a published-evidence topology range. The score combines usable capacity, interactive speed, total acquisition cost, household-power practicality, and fabric.</p></div>
          <div className="cluster-decision__headline"><small>BEST OVERALL ROUTE SCORE</small><strong>{bestOverallRoute.overallScore}</strong><span>{bestOverallRoute.shortName}</span><em>out of 100 · estimate confidence {bestOverallRoute.confidence}</em></div>
        </header>

        <div className="cluster-decision__verdicts">
          <article><span>BEST VALUE</span><strong>{bestValueRoute.shortName}</strong><b>{bestValueRoute.overallScore}/100</b><p>{formatMemory(bestValueRoute.totalVramGb)} · {formatSystemCost(bestValueRoute)} complete · {bestValueRoute.inferredSeventyBTokensLow}–{bestValueRoute.inferredSeventyBTokensHigh} inferred tok/s.</p></article>
          <article><span>FASTEST SHORTLIST ROUTE</span><strong>{fastestRoute.shortName}</strong><b>{fastestRoute.inferredSeventyBTokensLow}–{fastestRoute.inferredSeventyBTokensHigh} tok/s</b><p>{formatMemory(fastestRoute.totalVramGb)} · {formatSystemCost(fastestRoute)} · {fastestRoute.outletVerdict === 'no' ? 'requires more than one regular outlet' : fastestRoute.outletNote}</p></article>
          <article><span>48GB SINGLE-CARD LEADER*</span><strong>{bestSingle48.shortName}</strong><b>{bestSingle48.inferredSeventyBTokensLow}–{bestSingle48.inferredSeventyBTokensHigh} tok/s</b><p>{formatSystemCost(bestSingle48)} complete. *Low-confidence bandwidth projection until the fixed Llama control is run; RTX A6000 remains the measured fallback.</p></article>
          <article><span>THE V100 ANSWER</span><strong>SXM2 if the carrier is real</strong><b>NVLink changes the route</b><p>Four PCIe V100s win cheap capacity. A compatible four-module SXM2 baseboard trades build difficulty for a much better 28.0–40.7 tok/s universal range.</p></article>
        </div>

        <div className="cluster-decision__weights" aria-label="Route score weights">
          <span><small>USABLE VRAM</small><strong>{routeScoreWeights.capacity}%</strong><em>large-model fit</em></span>
          <span><small>70B INTERACTIVE SPEED</small><strong>{routeScoreWeights.interactiveSpeed}%</strong><em>inferred range midpoint</em></span>
          <span><small>COMPLETE-SYSTEM VALUE</small><strong>{routeScoreWeights.systemValue}%</strong><em>VRAM/$ + tok/s/$</em></span>
          <span><small>POWER + OUTLET</small><strong>{routeScoreWeights.powerAndOutlet}%</strong><em>lower is better</em></span>
          <span><small>FABRIC</small><strong>{routeScoreWeights.fabric}%</strong><em>TP communication</em></span>
        </div>

        <div className="cluster-decision__method">
          <span><small>UNIVERSAL CONTRACT</small><strong>{routeScoreMethod.model}</strong><em>{routeScoreMethod.formula}</em></span>
          <span><small>EVIDENCE RULE</small><strong>Measured 7B → inferred 70B range</strong><em>Measured 70B anchors must land inside the range</em></span>
          <span><small>COST RULE · {routeScoreMethod.costDate}</small><strong>GPU + usable host + cooling + power</strong><em>No bare-card price passed off as a system</em></span>
        </div>

        <div className="cluster-decision__toolbar">
          <span>ORDER ROUTES BY</span>
          {([
            ['score', 'Overall score'], ['speed', '70B speed'], ['capacity', 'VRAM'],
            ['cost', 'Lowest cost'], ['value', 'System value'], ['power', 'Outlet / watts'],
          ] as Array<[RouteSortMode, string]>).map(([value, label]) => <button key={value} className={routeSort === value ? 'active' : ''} onClick={() => setRouteSort(value)}>{label}</button>)}
        </div>

        <div className="cluster-decision__table" role="table" aria-label="Large-model AI route scores">
          <div className="cluster-decision__row cluster-decision__row--heading" role="row">
            <span>Rank / score</span><span>Complete route</span><span>Usable capacity</span><span>Universal interactive control</span><span>Complete-system cost</span><span>Wall power</span><span>Score anatomy</span>
          </div>
          <ol>
            {rankedRoutes.map((route, index) => (
              <li className={`cluster-decision__row is-confidence-${route.confidence}`} role="row" key={route.id}>
                <span className="cluster-decision__score"><small>#{index + 1}</small><strong>{route.overallScore}</strong><i><span style={{ width: `${route.overallScore}%` }} /></i><em>/ 100</em></span>
                <span className="cluster-decision__route"><small>{route.architecture} · {route.gpuCount} GPU{route.gpuCount === 1 ? '' : 's'}</small><strong>{route.name}</strong><em>{route.fabric}</em><b>{route.confidence} confidence · {route.fixedControlBasis}</b></span>
                <span><strong>{formatMemory(route.totalVramGb)}</strong><small>{route.vramPerGpuGb}GB per GPU</small><em>{route.fitNote}</em></span>
                <span className="cluster-decision__tokens"><strong>{route.inferredSeventyBTokensLow}–{route.inferredSeventyBTokensHigh} tok/s</strong><small>midpoint {route.inferredSeventyBTokensMid} · batch-one projection</small>{route.measuredSeventyBAnchor ? <a href={route.measuredSeventyBAnchor.sourceUrl} target="_blank" rel="noreferrer">Anchor: {route.measuredSeventyBAnchor.tokensPerSecond} tok/s · different 70B profile <ExternalLink /></a> : <em>No same-profile 70B measured anchor</em>}</span>
                <span className="cluster-decision__cost"><strong>{formatSystemCost(route)}</strong><small>midpoint {formatUsd(route.systemCostMidUsd)}</small><em>{route.costBasis}</em><a href={route.priceSourceUrl} target="_blank" rel="noreferrer">Price evidence <ExternalLink /></a></span>
                <span className={`cluster-decision__outlet is-${route.outletVerdict}`}><strong>{(route.completeSystemPowerW / 1_000).toFixed(2)}kW</strong><small>complete-system planning load</small>{route.efficientCapSystemPowerW && <em>{(route.efficientCapSystemPowerW / 1_000).toFixed(2)}kW at efficient cap</em>}<b><PlugZap /> {route.outletVerdict === 'yes' ? 'ONE OUTLET' : route.outletVerdict === 'conditional' ? 'CAP + VERIFY' : 'NOT ONE OUTLET'}</b></span>
                <span className="cluster-decision__anatomy"><small><b>CAP {route.capacityScore}</b><b>SPD {route.speedScore}</b><b>VAL {route.valueScore}</b><b>PWR {route.powerScore}</b><b>FAB {route.fabricScore}</b></small><strong>{route.vramPerThousandDollars}GB / $1k</strong><em>{route.inferredTokensPerThousandDollars} tok/s / $1k · {route.inferredTokensPerKw} tok/s/kW</em><p>{route.caveat}</p></span>
              </li>
            ))}
          </ol>
        </div>

        <footer><ShieldAlert /><p><strong>{routeScoreMethod.warning}</strong> “Usable VRAM” still means distributed device memory on multi-GPU routes. The 70B range is single-request tensor/layer-parallel intent; four independent replicas can deliver more aggregate requests per second but cannot combine their VRAM for one model.</p><a href="https://huggingface.co/TheBloke/Llama-2-7B-GGUF/blob/main/README.md" target="_blank" rel="noreferrer">3.83GB control file <ExternalLink /></a></footer>
      </section>

      <section className="cluster-power-lab" aria-labelledby="cluster-power-lab-title">
        <header><div><span className="section-kicker">POWER-LIMIT LAB / DECODE IS NOT PREFILL</span><h2 id="cluster-power-lab-title">How far can the cards be capped?</h2><p>Power limiting is most forgiving during memory-bound token generation. Prompt processing and time-to-first-token are more compute-bound, so the same cap can retain nearly all decode speed while losing substantially more prefill. Only exact LLM sweeps receive retention percentages.</p></div><b><ArrowDown /> Lower watts are better</b></header>
        <div className="cluster-power-lab__grid">
          {powerLimitEvidence.map((row) => (
            <a href={row.sourceUrl} target="_blank" rel="noreferrer" key={row.hardware} className={`cluster-power-lab__card is-${row.evidence.toLowerCase().replace(/\s+/g, '-')}`}>
              <span><small>{row.evidence}</small><strong>{row.hardware}</strong><em>{row.workload}</em></span>
              {row.stockPowerW > 0 ? <div><b>{row.stockPowerW}W</b><ArrowDown /><strong>{row.efficientPowerW}W</strong><small>{Math.round((1 - row.efficientPowerW / row.stockPowerW) * 100)}% lower cap</small></div> : <div className="is-needed"><strong>RUN THE SWEEP</strong><small>25W increments</small></div>}
              <dl><div><dt>Decode retained</dt><dd>{row.decodeRetainedPercent === null ? 'Not proven' : `${row.decodeRetainedPercent}%`}</dd></div><div><dt>Prefill retained</dt><dd>{row.prefillRetainedPercent === null ? 'Not proven' : `${row.prefillRetainedPercent}%`}</dd></div></dl>
              <p><strong>{row.practicalLimit}</strong>{row.note}</p><ExternalLink />
            </a>
          ))}
        </div>
        <footer><ShieldAlert /><p><strong>Cap for circuit safety; measure for energy claims.</strong> A configured power limit is a ceiling, not actual draw. Record board power and whole-system wall power during pp512 and tg128 separately. The V100 result supports 200W as a strong daily target; the 3090 evidence supports 250W; the 5090 evidence supports 480–510W for near-stock decode.</p></footer>
      </section>

      <section className="cluster-roofline" aria-labelledby="cluster-roofline-title">
        <header>
          <div><span className="section-kicker">APPLES TO APPLES / ALL 26 CONFIGURATIONS</span><h2 id="cluster-roofline-title">One model contract. Raw compute for every cluster.</h2><p>This is the missing common ruler: the same Llama 2 70B Q4_0 weight payload and the same dense transformer operation count on every system. It exposes the hardware ceiling without pretending that a calculated ceiling is a measured llama.cpp, vLLM, or TensorRT result.</p></div>
          <div className="cluster-roofline__summary"><span><strong>{clusterRawComputeRows.length}/{enterpriseClusters.length}</strong><small>raw coverage</small></span><span><strong>{exactMeasuredClusterCount}</strong><small>exact measured systems</small></span></div>
        </header>

        <div className="cluster-roofline__contract">
          <span><small>FIXED WEIGHT PAYLOAD</small><strong>Llama 2 70B · Q4_0</strong><em>{LLAMA2_70B_Q4_0_MODEL_SIZE_GB}GB GGUF</em></span>
          <span><small>DECODE MEMORY CEILING</small><strong>Σ local GB/s ÷ 38.87GB</strong><em>ideal aggregate tok/s</em></span>
          <span><small>DENSE MATH CEILING</small><strong>Σ FP16 Tensor ÷ 0.14TF</strong><em>2 × 70B operations/token</em></span>
          <span><small>REALITY CHECK</small><strong>Fabric + runtime still matter</strong><em>no efficiency multiplier invented</em></span>
        </div>

        <div className="cluster-roofline__table" role="table" aria-label="Raw compute roofline for every enterprise cluster">
          <div className="cluster-roofline__row cluster-roofline__row--heading" role="row">
            <span>Rank / configuration</span><span>Dense FP16 Tensor</span><span>Local memory</span><span>Q4 decode ceiling</span><span>Fabric pressure</span><span>Exact measured control</span>
          </div>
          <ol>
            {rawRows.map((row, index) => {
              const { cluster, profile } = row;
              const measured = cluster.benchmark?.comparable ? cluster.benchmark : undefined;
              return (
                <li className={`cluster-roofline__row ${profile.basis === 'published' ? '' : 'is-derived'}`} role="row" key={cluster.id}>
                  <span className="cluster-roofline__hardware"><b>#{index + 1}</b><span><strong>{cluster.name}</strong><small>{cluster.gpuCount.toLocaleString()}× {profile.hardware} · {cluster.totalGpuMemoryGb.toLocaleString()}GB total</small></span></span>
                  <span><strong>{formatCompute(row.aggregateDenseFp16TensorTflops)}</strong><small>{profile.denseFp16TensorTflopsPerGpu.toLocaleString()} TFLOPS/GPU · {profile.basis === 'published' ? 'dense published' : 'dense derived*'}</small>{row.aggregateFp32Tflops !== undefined && <em>{formatCompute(row.aggregateFp32Tflops)} FP32</em>}</span>
                  <span><strong>{formatBandwidth(row.aggregateLocalMemoryBandwidthGbS / 1_000)}</strong><small>{cluster.memoryBandwidthTbSPerGpu.toLocaleString()}TB/s per GPU</small></span>
                  <span className="cluster-roofline__ceiling"><strong>{formatTokens(row.idealQ4DecodeTokensPerSecond)} tok/s</strong><small>100% memory roofline</small><em>FP16 math cap {formatTokens(row.idealFp16MathTokensPerSecond)} tok/s</em></span>
                  <span><strong>{row.fabricToLocalBandwidthPercent.toFixed(1)}%</strong><small>{cluster.fabricBandwidthGbSPerGpu.toLocaleString()}GB/s fabric ÷ local BW</small><em>{cluster.fabric}</em></span>
                  {measured ? <a href={measured.sourceUrl} target="_blank" rel="noreferrer"><strong>{measured.tokensPerSecond.toLocaleString()} tok/s</strong><small>{measured.model}</small><em>{measured.scenario} <ExternalLink /></em></a>
                    : cluster.nodeControlTokensPerSecond ? <span className="is-node-only"><strong>{cluster.nodeControlTokensPerSecond.toLocaleString()} / node</strong><small>exact eight-GPU control only</small><em>never multiplied into a pod result</em></span>
                      : <span className="is-missing"><strong>Needs fixed run</strong><small>raw ceilings available</small><em>measured tok/s intentionally blank</em></span>}
                </li>
              );
            })}
          </ol>
        </div>

        <footer><ShieldAlert /><p><strong>Do not read the Q4 number as a promised benchmark.</strong> It assumes perfect weight streaming, ideal sharding or replica scheduling, no KV-cache traffic, no kernel overhead, and no fabric stalls. SuperPOD values are aggregate capacity across concurrently scheduled model instances—not single-request decode. *GB10 and RTX PRO 5000 dense FP16 are normalized from NVIDIA’s sparse FP4 peak by removing 2× sparsity and the 4× precision-rate advantage; every other dense FP16 value is directly published.</p><a href="https://huggingface.co/TheBloke/Llama-2-70B-GGUF/blob/main/README.md" target="_blank" rel="noreferrer">38.87GB model source <ExternalLink /></a></footer>
      </section>

      <ModelFormatCompatibility />

      <section className="cluster-pcie-lab">
        <header>
          <div><span className="section-kicker">FOUR-GPU WORKSTATIONS / PCIe REALITY</span><h2>PCIe generation is the ceiling—not the guarantee.</h2><p>Each card keeps its own VRAM and local memory bandwidth. Tensor-parallel collectives use the host fabric, whose speed depends on negotiated generation and width, PCIe switches, CPU root complexes, ACS/IOMMU settings, and whether the driver exposes direct peer access. The bandwidth figures below are theoretical per-GPU x16 ceilings in one direction.</p></div>
          <div><strong>{fourGpuPcieClusters.length}</strong><small>researched 4-GPU nodes</small><span>Gen4 x16 ≈ 31.5GB/s</span><span>Gen5 x16 ≈ 63GB/s</span></div>
        </header>
        <div className="cluster-pcie-lab__grid">
          {fourGpuPcieClusters.map((cluster) => {
            const audit = cluster.pcieAudit!;
            const evidence = audit.benchmark;
            return (
              <article key={cluster.id}>
                <header><span><small>{cluster.generation} / {cluster.architecture}</small><strong>{cluster.name}</strong></span><b>{formatMemory(cluster.totalGpuMemoryGb)}</b></header>
                <div className="cluster-pcie-lab__stats">
                  <span><small>Local VRAM bandwidth</small><strong>{formatBandwidth(cluster.gpuCount * cluster.memoryBandwidthTbSPerGpu)}</strong><em>{cluster.memoryBandwidthTbSPerGpu.toFixed(3)}TB/s per card</em></span>
                  <span><small>Host-link ceiling</small><strong>PCIe {audit.generation}.0 x{audit.lanesPerGpu}</strong><em>{audit.theoreticalOneWayGbSPerGpu}GB/s one-way / GPU</em></span>
                  <span className="is-power"><small>Rated GPU power <ArrowDown /></small><strong>{formatPower(cluster.systemPowerKw)}</strong><em>{audit.boardPowerWPerGpu}W per card · host excluded</em></span>
                  <span><small>Measured whole system</small><strong>{audit.wholeSystemPowerEvidence}</strong></span>
                </div>
                <div className="cluster-pcie-lab__fabric"><Network /><span><small>FOUR-WAY FABRIC</small><strong>{audit.nvlink}</strong><em>{audit.p2pStatus}</em></span></div>
                {evidence ? (
                  <a className="cluster-pcie-lab__benchmark" href={evidence.sourceUrl} target="_blank" rel="noreferrer">
                    <Gauge />
                    <span><small>BEST LOCATED FOUR-CARD LLM EVIDENCE · NOT CROSS-COMPARABLE</small><strong>{evidence.model}</strong><em>{evidence.precision} · {evidence.runtime}</em><p>{evidence.workload}</p></span>
                    <b>{evidence.tokensPerSecond.toLocaleString(undefined, { maximumFractionDigits: 2 })}<small> tok/s</small><em>{evidence.metric}</em></b>
                    {evidence.secondaryTokensPerSecond !== undefined && <b className="is-secondary">{evidence.secondaryTokensPerSecond.toLocaleString(undefined, { maximumFractionDigits: 2 })}<small> tok/s</small><em>{evidence.secondaryMetric}</em></b>}
                    <ExternalLink />
                  </a>
                ) : (
                  <div className="cluster-pcie-lab__benchmark is-missing"><Gauge /><span><small>FOUR-CARD LLM EVIDENCE</small><strong>Not measured</strong><em>No reproducible 4× RTX PRO 5000 inference result found</em></span></div>
                )}
                <footer><ShieldAlert /><span>{audit.verification}</span></footer>
              </article>
            );
          })}
        </div>
        <footer><ShieldAlert /><p><strong>These token results do not form a universal ranking.</strong> They use different models, precisions, runtimes, contexts, and concurrency. The section answers “has this four-card configuration actually run an LLM, and what did that exact run produce?” A clean shared control still requires rerunning the same model and harness on all five systems.</p></footer>
      </section>

      <section className="cluster-house-guide">
        <header>
          <div><span className="section-kicker">REGULAR HOUSE WALL OUTLET / U.S. ASSUMPTION</span><h2>Can it run from a normal 120V outlet?</h2><p>This uses a conservative 120V/15A dedicated, grounded branch circuit and a 12A continuous-load ceiling. The breaker math is 1,800W, but the safe continuous planning limit is <strong>{US_HOUSE_OUTLET_CONTINUOUS_W.toLocaleString()}W</strong>. A receptacle on a shared circuit is not treated as available capacity.</p></div>
          <div className="cluster-house-guide__summary">
            <span className="is-yes"><strong>{outletCounts.yes}</strong><small>qualified yes</small></span>
            <span className="is-conditional"><strong>{outletCounts.conditional}</strong><small>needs nameplate</small></span>
            <span className="is-no"><strong>{outletCounts.no}</strong><small>not one outlet</small></span>
          </div>
        </header>
        <div className="cluster-house-guide__answer">
          <PlugZap />
          <span><small>HOUSE-POWERED CLUSTER OPTION</small><strong>2–4 DGX Sparks</strong><p>The complete Spark clusters total 480–960W of supplied power capacity. They fit within one dedicated 120V/15A circuit’s continuous ceiling, but need one grounded receptacle per supplied adapter. DGX Station A100 remains the other qualified yes.</p></span>
          <b>YES / DEDICATED CIRCUIT</b>
        </div>
        <footer>
          <p><ShieldAlert /><span><strong>Do not improvise enterprise power.</strong> Multiple receptacles can share the same breaker. Never use a household power strip, extension cord, plug adapter, or two circuits as a substitute for the manufacturer-specified PDU and voltage. Have a licensed electrician verify the actual branch circuit and receptacle.</span></p>
          <div><a href="https://docinfofiles.nfpa.org/files/AboutTheCodes/70/70_A2022_NEC_P02_SD_SRStatements.pdf" target="_blank" rel="noreferrer">NFPA continuous-load basis <ExternalLink /></a><a href="https://docs.nvidia.com/dgx/dgx-station-a100-user-guide/hardware-specifications-station-a100.html" target="_blank" rel="noreferrer">DGX Station input specification <ExternalLink /></a></div>
        </footer>
      </section>

      <section className="cluster-tensor">
        <header>
          <div><span className="section-kicker">CROSS-NODE TENSOR PARALLELISM / MEASURED</span><h2>More memory and faster decode—but the network is in the loop every layer.</h2><p>Tensor parallelism shards each transformer weight matrix across Spark nodes. Every node computes a partial result, then TensorRT-LLM synchronizes those results over ConnectX-7 RoCE before proceeding. This differs from data parallelism, where each node keeps a complete model copy and communicates far less often.</p></div>
          <a href="https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/" target="_blank" rel="noreferrer">NVIDIA measured table <ExternalLink /></a>
        </header>
        <div className="cluster-tensor__audit">
          <span><small>RE-VERIFIED</small><strong>{formatAuditDate(dgxSparkCurrentAudit.verifiedOn)}</strong><em>NVIDIA docs updated {formatAuditDate(dgxSparkCurrentAudit.documentationUpdatedOn)}</em></span>
          <span><small>CURRENT FOUNDERS EDITION STACK</small><strong>DGX OS {dgxSparkCurrentAudit.dgxOs}</strong><em>Driver {dgxSparkCurrentAudit.driver} · CUDA {dgxSparkCurrentAudit.cuda}</em></span>
          <span><small>SYNC-GUIDED CLUSTER</small><strong>{dgxSparkCurrentAudit.clusterAssistantMinNodes}–{dgxSparkCurrentAudit.clusterAssistantMaxNodes} nodes</strong><em>{dgxSparkCurrentAudit.supportedTopologySummary}</em></span>
          <span><small>DIRECT-LINK REALITY</small><strong>{dgxSparkCurrentAudit.measuredDualNodeRdmaGbps} / {dgxSparkCurrentAudit.ratedLinkGbps} Gb/s</strong><em>{dgxSparkCurrentAudit.measuredRdmaLanesGbps.join(' + ')} measured · {dgxSparkCurrentAudit.measuredLinkEfficiencyPercent.toFixed(1)}%</em></span>
          <span className="is-dated"><small>LATEST OFFICIAL TP TABLE</small><strong>{formatAuditDate(dgxSparkCurrentAudit.latestOfficialTpTableDate)} snapshot</strong><em>not identified as an OS 7.5 retest</em></span>
        </div>
        <div className="cluster-tensor__results">
          {dgxSparkTensorParallelResults.map((result) => (
            <article key={result.degree} className={`cluster-tensor__result cluster-tensor__result--tp${result.degree}`}>
              <span><small>{result.nodes} {result.nodes === 1 ? 'NODE' : 'NODES'} · PUBLISHED {result.publishedDate}</small><strong>TP{result.degree}</strong></span>
              <div><small>Time / output token</small><strong>{result.tpotMs} ms</strong><em>lower is better</em></div>
              <div><small>Derived decode</small><strong>{result.outputTokensPerSecond.toFixed(2)} tok/s</strong><em>1,000 ÷ TPOT</em></div>
              <div><small>Time to first token</small><strong>{(result.ttftMs / 1000).toFixed(2)} s</strong><em>32K input</em></div>
              <div><small>TP speedup / efficiency</small><strong>{result.speedup.toFixed(2)}× / {result.scalingEfficiencyPercent.toFixed(1)}%</strong><em>versus TP1 decode</em></div>
            </article>
          ))}
        </div>
        <div className="cluster-tensor__contract">
          <span><strong>FIXED WORKLOAD</strong><small>Llama 3.3 70B Instruct · NVFP4 · TensorRT-LLM · 32K input · 1K output · batch 1</small></span>
          <span><strong>MEMORY REALITY</strong><small>128GB per node; 256/384/512GB are aggregate sharded capacity, not transparent shared RAM.</small></span>
          <span><strong>FABRIC REALITY</strong><small>200Gb/s = 25GB/s rated per physical link; NVIDIA’s current dual-node guide contains a {dgxSparkCurrentAudit.measuredRdmaGbS.toFixed(2)}GB/s RDMA sample, versus 273GB/s local memory.</small></span>
        </div>
        <a className="cluster-tensor__capacity" href={dgxSparkCapacityProof.sourceUrl} target="_blank" rel="noreferrer">
          <Database />
          <span><small>ACTUAL LARGE-MODEL CAPACITY PROOF / SEPARATE WORKLOAD</small><strong>Dual Spark · {dgxSparkCapacityProof.model} {dgxSparkCapacityProof.quantization}</strong><em>{dgxSparkCapacityProof.runtime} · {dgxSparkCapacityProof.inputTokens.toLocaleString()} input / {dgxSparkCapacityProof.outputTokens} output · batch {dgxSparkCapacityProof.batchSize} · published {dgxSparkCapacityProof.publishedDate}</em></span>
          <span><small>Prompt processing</small><strong>{dgxSparkCapacityProof.promptTokensPerSecond.toLocaleString()} tok/s</strong></span>
          <span><small>Generated output</small><strong>{dgxSparkCapacityProof.generatedTokensPerSecond} tok/s</strong></span>
          <ExternalLink />
          <p>{dgxSparkCapacityProof.parallelismDisclosure}</p>
        </a>
        <footer><ShieldAlert /><p>NVIDIA’s March result shows TP2 at 2.02× TP1 decode and TP4 at 3.74×, or 93.4% four-way efficiency. That is unusually good for this workload—not permission to multiply every model’s speed by node count. NVIDIA Sync configures the network and SSH, not the inference workload; more than four nodes require manual setup, and NVIDIA has not published a matching TP result beyond TP4.</p></footer>
      </section>

      <section className="cluster-control">
        <header>
          <div><span className="section-kicker">THE CLEAN UNIVERSAL CONTROL</span><h2>Same model. Same suite. Same scenario. Same eight GPUs.</h2><p>MLPerf Inference v5.0 Closed, Llama 2 70B at the 99% accuracy target, Offline aggregate throughput, NVIDIA TensorRT submissions. This is not batch-one interactive decode.</p></div>
          <b><ArrowUp /> H200 +{mlperfGain.toFixed(1)}%</b>
        </header>
        <div className="cluster-control__comparison">
          {controls.map((cluster) => {
            const percent = (cluster.benchmark!.tokensPerSecond / h200.benchmark!.tokensPerSecond) * 100;
            return (
              <a key={cluster.id} href={cluster.benchmark!.sourceUrl} target="_blank" rel="noreferrer" className={`cluster-control__result cluster-control__result--${cluster.generation.toLowerCase()}`}>
                <span><small>{cluster.generation} / 8× SXM</small><strong>{cluster.name}</strong></span>
                <b>{cluster.benchmark!.tokensPerSecond.toLocaleString()} <small>tok/s</small></b>
                <i><span style={{ width: `${percent}%` }} /></i>
                <em>{cluster.benchmark!.sourceId} <ExternalLink /></em>
              </a>
            );
          })}
        </div>
        <footer><ShieldAlert /><p><strong>Honest gap:</strong> no V100, A100, or A800 submission matches this exact v5.0 control. Those cards stay “not measured” instead of receiving a synthetic estimate. SuperPOD cards show the measured eight-GPU node control, never node tok/s multiplied by node count.</p></footer>
      </section>

      <section className="cluster-ladder">
        <header><span className="section-kicker">H200 SUPERPOD SCALE LADDER</span><h2>Every published H200 scalable-unit step</h2><p>The 32-node design reserves a node position for Unified Fabric Manager, yielding 31, 63, 95, and 127 compute nodes.</p></header>
        <div>
          {h200SuperpodLadder.map((cluster, index) => (
            <article key={cluster.id}>
              <span>{index + 1} SU</span>
              <strong>{cluster.gpuCount.toLocaleString()} GPUs</strong>
              <b>{formatMemory(cluster.totalGpuMemoryGb)} HBM3e</b>
              <small>{cluster.nodeCount} DGX nodes · {formatPower(cluster.systemPowerKw)} compute max</small>
            </article>
          ))}
        </div>
      </section>

      <section className="cluster-catalog">
          <div className="cluster-catalog__heading">
          <div><span className="section-kicker">COMPLETE CONFIGURATION CATALOG</span><h2>{filtered.length} enterprise options</h2><p>Every option now includes a complete-system acquisition range. The unlimited rank still prioritizes generation, topology, supportability, HBM capacity, and measured LLM evidence; use the owner route score above when cost and household power should affect the answer.</p></div>
          <div className="cluster-generation-tabs" aria-label="Filter by GPU generation">
            {enterpriseGenerations.map((item) => <button key={item} className={generation === item ? 'active' : ''} onClick={() => setGeneration(item)}>{item === 'all' ? 'All generations' : item}</button>)}
          </div>
        </div>

        <div className="cluster-toolbar">
          <label className="cluster-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topology, fabric, or use case" /></label>
          <label><span>System scale</span><select value={scale} onChange={(event) => setScale(event.target.value as 'all' | EnterpriseScale)}><option value="all">All scales</option><option value="baseboard">Baseboards</option><option value="node">Complete nodes</option><option value="desktop-cluster">Desktop clusters</option><option value="superpod">SuperPODs</option></select></label>
          <label><span>Order by</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="unlimited">Unlimited-budget rank</option><option value="roofline">Raw Q4 decode ceiling</option><option value="compute">Dense FP16 tensor compute</option><option value="memory">Total HBM</option><option value="gpus">GPU count</option><option value="cost">Complete-system cost</option><option value="power">Power: lower is better</option><option value="tokens">Measured MLPerf tok/s</option></select></label>
        </div>

        <div className="cluster-grid">
          {filtered.map((cluster) => {
            const aggregateBandwidth = cluster.gpuCount * cluster.memoryBandwidthTbSPerGpu;
            const houseOutlet = assessHouseOutlet(cluster);
            const rawCompute = clusterRawComputeById.get(cluster.id)!;
            const systemCost = clusterSystemCostById.get(cluster.id)!;
            return (
              <article key={cluster.id} className={`cluster-card cluster-card--${cluster.generation.toLowerCase().replace(/\s+/g, '-')}`}>
                <header>
                  <span className="cluster-rank"><small>UNLIMITED RANK</small><strong>#{cluster.unlimitedRank}</strong></span>
                  <div><span>{cluster.architecture} / {scaleLabel[cluster.scale]}</span><h3>{cluster.name}</h3><p>{cluster.formFactor}</p></div>
                  <b>{cluster.status}</b>
                </header>

                <p className="cluster-card__description">{cluster.description}</p>

                <div className="cluster-card__primary">
                  <span><small>GPUs / nodes</small><strong>{cluster.gpuCount.toLocaleString()} / {cluster.nodeCount}</strong></span>
                  <span><small>Total HBM</small><strong>{formatMemory(cluster.totalGpuMemoryGb)}</strong><em>{cluster.gpuMemoryGb}GB / GPU</em></span>
                  <span><small>Local memory BW</small><strong>{cluster.memoryBandwidthTbSPerGpu} TB/s</strong><em>per GPU</em></span>
                  <span className="is-power"><small>Power <ArrowDown /></small><strong>{formatPower(cluster.systemPowerKw)}</strong><em>{cluster.powerScope}</em></span>
                </div>

                <a className="cluster-card__cost" href={systemCost.sourceUrl} target="_blank" rel="noreferrer">
                  <Building2 />
                  <span><small>Complete-system acquisition</small><strong>{formatUsd(systemCost.lowUsd)}–{formatUsd(systemCost.highUsd)}</strong><em>{systemCost.confidence} · {systemCost.basis}</em></span>
                  <ExternalLink />
                </a>

                <div className="cluster-card__roofline">
                  <Gauge />
                  <span><small>Common raw compute</small><strong>{formatCompute(rawCompute.aggregateDenseFp16TensorTflops)}</strong><em>dense FP16 Tensor · FP32 accumulate</em></span>
                  <span><small>Llama 2 70B Q4_0 ceiling</small><strong>{formatTokens(rawCompute.idealQ4DecodeTokensPerSecond)} tok/s</strong><em>ideal memory roofline · not measured</em></span>
                </div>

                <div className={`cluster-house cluster-house--${houseOutlet.verdict}`}>
                  <PlugZap />
                  <span><small>Regular U.S. house outlet?</small><strong>{houseOutlet.label}</strong><em>{houseOutlet.service}</em></span>
                  <p>{houseOutlet.detail}</p>
                </div>

                <div className="cluster-card__fabric">
                  <Network />
                  <span><small>Scale-up fabric</small><strong>{cluster.fabric}</strong><em>{cluster.fabricBandwidthGbSPerGpu} GB/s per GPU</em></span>
                  <span><small>Summed local HBM</small><strong>{formatBandwidth(aggregateBandwidth)}</strong><em>not a shared bus</em></span>
                </div>

                {cluster.tensorParallel ? (
                  <a className="cluster-benchmark cluster-benchmark--tensor" href={cluster.tensorParallel.sourceUrl} target="_blank" rel="noreferrer">
                    <Network /><span><small>{cluster.tensorParallel.model} · TP{cluster.tensorParallel.degree} cross-node</small><strong>{cluster.tensorParallel.outputTokensPerSecond.toFixed(2)} tok/s derived</strong><em>{cluster.tensorParallel.tpotMs}ms TPOT · {cluster.tensorParallel.speedup.toFixed(2)}× TP1 · batch {cluster.tensorParallel.batchSize}</em></span><ExternalLink />
                  </a>
                ) : cluster.benchmark ? (
                  <a className="cluster-benchmark cluster-benchmark--measured" href={cluster.benchmark.sourceUrl} target="_blank" rel="noreferrer">
                    <Gauge /><span><small>{cluster.benchmark.model} · {cluster.benchmark.scenario}</small><strong>{cluster.benchmark.tokensPerSecond.toLocaleString()} tok/s</strong><em>{cluster.benchmark.suite} · {cluster.benchmark.sourceId}</em></span><ExternalLink />
                  </a>
                ) : cluster.nodeControlTokensPerSecond ? (
                  <div className="cluster-benchmark cluster-benchmark--node-control">
                    <Building2 /><span><small>Measured 8-GPU node control</small><strong>{cluster.nodeControlTokensPerSecond.toLocaleString()} tok/s / node</strong><em>Full-cluster aggregate intentionally unmeasured</em></span>
                  </div>
                ) : cluster.pcieAudit?.benchmark ? (
                  <a className="cluster-benchmark cluster-benchmark--legacy" href={cluster.pcieAudit.benchmark.sourceUrl} target="_blank" rel="noreferrer">
                    <Gauge /><span><small>{cluster.pcieAudit.benchmark.model}</small><strong>{cluster.pcieAudit.benchmark.tokensPerSecond.toLocaleString(undefined, { maximumFractionDigits: 2 })} tok/s</strong><em>{cluster.pcieAudit.benchmark.metric} · different workload</em></span><ExternalLink />
                  </a>
                ) : cluster.legacyObservation ? (
                  <a className="cluster-benchmark cluster-benchmark--legacy" href={cluster.legacyObservation.sourceUrl} target="_blank" rel="noreferrer">
                    <Gauge /><span><small>{cluster.legacyObservation.model}</small><strong>{cluster.legacyObservation.tokensPerSecond.toLocaleString()} tok/s</strong><em>{cluster.legacyObservation.metric} · different workload</em></span><ExternalLink />
                  </a>
                ) : (
                  <div className="cluster-benchmark cluster-benchmark--missing"><Gauge /><span><small>Universal token control</small><strong>Not measured</strong><em>No matching Llama 2 70B MLPerf v5.0 submission found</em></span></div>
                )}

                <div className="cluster-card__detail">
                  <span><small>Best for</small><strong>{cluster.bestFor}</strong></span>
                  <span><small>Scale-out network</small><strong>{cluster.networking}</strong></span>
                  <span><small>Procurement path</small><strong>{cluster.procurement}</strong></span>
                </div>

                <footer>
                  <p><ShieldAlert /> {cluster.caveat}</p>
                  <a href={cluster.sourceUrl} target="_blank" rel="noreferrer">{cluster.sourceLabel} <ExternalLink /></a>
                </footer>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && <div className="cluster-empty"><Search /><strong>No configurations match</strong><span>Clear the search or widen the generation and system-scale filters.</span></div>}
      </section>

      <section className="cluster-method">
        <Zap /><div><strong>Two ranks, two questions</strong><p>The catalog’s unlimited rank intentionally ignores purchase price and rewards newer accelerators, HBM, fabric, supportability, and measured evidence. The owner route score includes full system cost and household power. Power keeps its inverse meaning: the down arrow warns that a larger number is worse.</p></div>
      </section>
    </main>
  );
}
