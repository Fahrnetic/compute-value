import { Activity, CircuitBoard, Database, ExternalLink, Gauge, Layers3, Network, Server, ShieldCheck, Terminal, Thermometer, UserRound, Users, Zap } from 'lucide-react';
import {
  nvidiaSmiPowerDocs,
  universalOllamaLlama2_7b,
  v100BertInferencePowerCurve,
  v100BertPowerSource,
  v100Benchmarks,
  v100BroadLlmPowerStudy,
  v100FrequencyEfficiency,
  v100FrequencyEfficiencySource,
  v100Pcie32PowerObservation,
  v100PcieMaxQ,
  v100PcieThermalGuardrail,
  v100PowerFloorObservations,
  v100PowerMeasurementMethod,
  v100PowerProfiles,
  v100PowerSystems,
  v100PowerZones,
  v100QuadWallPlans,
  v100Sxm3PowerObservation,
  v100Sxm2Adapter100WObservation,
  v100Sxm2QwenPowerSweep,
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

      <section className="v100-power" aria-labelledby="v100-power-title">
        <header>
          <Activity />
          <div>
            <span className="section-kicker">V100 POWER-CAP LAB / EXACT FORM FACTORS</span>
            <h3 id="v100-power-title">Start at 200W. Go to 150W only after testing prefill—and trust the installed VBIOS, not the connector.</h3>
            <p>CERN ran 50 FlowSim neural-network-inference trials at every cap on exact V100S PCIe 32 GB and V100 SXM2 32 GB hardware. Direct LLM sweeps show decode can retain more speed than compute-heavy or prompt-processing work, so every evidence lane stays labeled.</p>
          </div>
          <div className="v100-power__headline">
            <span><strong>100W</strong><small>V100S PCIe minimum</small></span>
            <span><strong>150W</strong><small>SXM2 minimum</small></span>
            <span><strong>200W</strong><small>daily target / GPU</small></span>
            <span><strong>800W</strong><small>4× GPU cap at target</small></span>
          </div>
        </header>

        <div className="v100-power__profiles">
          {v100PowerProfiles.map((profile) => (
            <article key={profile.id} className={`v100-power-profile is-${profile.formFactor.toLowerCase()}`}>
              <header>
                <span><small>{profile.formFactor} · EXACT DEVICE</small><strong>{profile.hardware}</strong><i>{profile.workload}</i></span>
                <b>{profile.minimumPowerW}–{profile.maximumPowerW}W</b>
              </header>
              <div className="v100-power-profile__summary">
                <span><small>Default</small><strong>{profile.defaultPowerW}W</strong></span>
                <span><small>Daily target</small><strong>{profile.dailyTargetW}W</strong></span>
                <span><small>4× stock ceiling</small><strong>{profile.defaultPowerW * 4}W</strong></span>
                <span><small>4× target ceiling</small><strong>{profile.dailyTargetW * 4}W</strong></span>
              </div>
              <div className="v100-power-table">
                <div className="v100-power-point v100-power-point--heading"><span>Cap</span><span>Measured speed</span><span>Avg draw</span><span>4× ceiling</span></div>
                {profile.points.map((point) => (
                  <div className={`v100-power-point ${point.capW === profile.dailyTargetW ? 'is-target' : ''}`} key={point.capW}>
                    <span><strong>{point.capW}W</strong>{point.capW === profile.dailyTargetW && <small>DAILY</small>}</span>
                    <span><strong>≈{number(point.throughput ?? 0)} ev/s</strong><small>{number(point.retainedPercent)}% retained</small><i><b style={{ width: `${point.retainedPercent}%` }} /></i></span>
                    <span><strong>≈{point.measuredAveragePowerW}W</strong><small>≈{number((point.throughput ?? 0) / (point.measuredAveragePowerW ?? 1))} ev/s/W</small></span>
                    <span><strong>{point.capW * 4}W</strong><small>GPU cap only</small></span>
                  </div>
                ))}
              </div>
              <p>{profile.notes}</p>
              <a href={profile.sourceUrl} target="_blank" rel="noreferrer">{profile.sourceName} · chart-read approximations <ExternalLink /></a>
            </article>
          ))}
        </div>

        <div className="v100-power__zones">
          <header><Gauge /><span><strong>How far can you actually push the cap?</strong><small>Retained ranges combine only the explicitly named studies; they are not universal LLM scores</small></span></header>
          <div>
            {(['PCIe 250W class', 'SXM2 300W class'] as const).map((formFactor) => (
              <article key={formFactor}>
                <header><strong>{formFactor}</strong><small>{formFactor.startsWith('PCIe') ? 'Native add-in card / V100S evidence' : 'Physical SXM2 module · baseboard or carrier'}</small></header>
                <div className="v100-power__zone-row v100-power__zone-row--heading"><span>Cap</span><span>Stock cut</span><span>Observed retention</span><span>4× cap</span><span>Use</span></div>
                {v100PowerZones.filter((zone) => zone.formFactor === formFactor).map((zone) => (
                  <div className={`v100-power__zone-row is-${zone.label.replaceAll(' ', '-')}`} key={zone.capW} title={zone.evidenceScope}>
                    <span><strong>{zone.capW}W</strong></span>
                    <span><strong>−{number(zone.stockReductionPercent)}%</strong></span>
                    <span><strong>{zone.retainedPerformance}</strong><small>{zone.evidenceScope}</small></span>
                    <span><strong>{number(zone.fourGpuCapW)}W</strong></span>
                    <b>{zone.label}</b>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </div>

        <div className="v100-power__evidence">
          <article className="v100-power-evidence v100-power-evidence--llm">
            <header><Zap /><span><small>DIRECT LLM SWEEP</small><strong>{v100Sxm2QwenPowerSweep.hardware}</strong><i>{v100Sxm2QwenPowerSweep.model} · {v100Sxm2QwenPowerSweep.runtime}</i></span></header>
            <div>
              {v100Sxm2QwenPowerSweep.points.map((point) => (
                <span className={point.capW === 200 ? 'is-target' : ''} key={point.capW}><small>{point.capW}W cap</small><strong>{number(point.generatedTokensPerSecond)} tok/s</strong><i>{number(point.retainedPercent)}% retained</i></span>
              ))}
            </div>
            <p>{v100Sxm2QwenPowerSweep.notes}</p>
            <a href={v100Sxm2QwenPowerSweep.sourceUrl} target="_blank" rel="noreferrer">{v100Sxm2QwenPowerSweep.sourceName} <ExternalLink /></a>
          </article>

          <article className="v100-power-evidence v100-power-evidence--bert">
            <header><Gauge /><span><small>CONTROLLED COMPUTE-HEAVY CROSS-CHECK</small><strong>Two 250W-default V100 GPUs</strong><i>BERT inference · form factor undisclosed</i></span></header>
            <div>
              {v100BertInferencePowerCurve.map((point) => (
                <span className={point.capW === 200 ? 'is-target' : ''} key={point.capW}><small>{point.capW}W cap</small><strong>{number(point.retainedThroughputPercent)}% speed</strong><i>{number(point.retainedEnergyPercent)}% energy used</i></span>
              ))}
            </div>
            <p>{v100BertPowerSource.notes}</p>
            <a href={v100BertPowerSource.url} target="_blank" rel="noreferrer">{v100BertPowerSource.name} <ExternalLink /></a>
          </article>

          <article className="v100-power-evidence v100-power-evidence--broad">
            <header><Layers3 /><span><small>BROADER LLM CROSS-CHECK</small><strong>{v100BroadLlmPowerStudy.modelCount} models · four power caps</strong><i>Up to {number(v100BroadLlmPowerStudy.contextTokens)}-token context</i></span></header>
            <div>
              <span className="is-target"><small>200W generation</small><strong>&lt;2% loss</strong><i>reported tg128 summary</i></span>
              <span><small>150W MoE</small><strong>90–97%</strong><i>generation retained</i></span>
              <span><small>150W dense prefill</small><strong>−22%</strong><i>worst reported loss</i></span>
              <span><small>Sweep</small><strong>150–300W</strong><i>32 GB carrier setup</i></span>
            </div>
            <p>{v100BroadLlmPowerStudy.notes}</p>
            <a href={v100BroadLlmPowerStudy.sourceUrl} target="_blank" rel="noreferrer">{v100BroadLlmPowerStudy.sourceName} <ExternalLink /></a>
          </article>

          <article className="v100-power-evidence v100-power-evidence--exception">
            <header><ShieldCheck /><span><small>100W SXM2 EXCEPTION / 16 GB</small><strong>{v100Sxm2Adapter100WObservation.hardware}</strong><i>One owner carrier build · not transferable to 32 GB</i></span></header>
            <div>
              <span><small>Stock speed</small><strong>{number(v100Sxm2Adapter100WObservation.stockSpeedTokensPerSecond)} tok/s</strong><i>{v100Sxm2Adapter100WObservation.stockWallPowerW}W wall</i></span>
              <span className="is-target"><small>100W-cap speed</small><strong>{number(v100Sxm2Adapter100WObservation.cappedSpeedTokensPerSecond)} tok/s</strong><i>{v100Sxm2Adapter100WObservation.retainedPercent}% retained</i></span>
              <span><small>Capped wall</small><strong>{v100Sxm2Adapter100WObservation.cappedWallPowerW}W</strong><i>complete owner system</i></span>
              <span><small>What it proves</small><strong>VBIOS varies</strong><i>not an SXM2-wide floor</i></span>
            </div>
            <p>{v100Sxm2Adapter100WObservation.notes}</p>
            <a href={v100Sxm2Adapter100WObservation.sourceUrl} target="_blank" rel="noreferrer">{v100Sxm2Adapter100WObservation.sourceName} <ExternalLink /></a>
          </article>
        </div>

        <div className="v100-power__references">
          <article>
            <header><Gauge /><span><small>OFFICIAL PCIE MAX-Q EXAMPLE</small><strong>{v100PcieMaxQ.officialExamplePowerW}W from a {v100PcieMaxQ.stockPowerW}W default</strong></span></header>
            <p>{v100PcieMaxQ.notes}</p>
            <div>{v100PcieMaxQ.commands.map((command) => <code key={command}>{command}</code>)}</div>
            <a href={v100PcieMaxQ.sourceUrl} target="_blank" rel="noreferrer">{v100PcieMaxQ.sourceName} <ExternalLink /></a>
          </article>
          <article className="is-warning">
            <header><ShieldCheck /><span><small>SXM3 / VERIFIED LIMIT OF KNOWLEDGE</small><strong>{v100Sxm3PowerObservation.observedPowerLimitW}W observed · minimum not verified</strong></span></header>
            <p>{v100Sxm3PowerObservation.notes}</p>
            <a href={v100Sxm3PowerObservation.sourceUrl} target="_blank" rel="noreferrer">{v100Sxm3PowerObservation.sourceName} <ExternalLink /></a>
          </article>
          <article className="is-frequency">
            <header><Activity /><span><small>SECOND LEVER / CORE CLOCK</small><strong>Both tested V100 variants peaked near 975MHz</strong></span></header>
            <div className="v100-power__clock-results">
              {v100FrequencyEfficiency.map((result) => (
                <span key={result.hardware}><small>{result.hardware}</small><strong>{number(result.efficiencyGainPercent)}% better perf/W</strong><i>{result.efficiencyPeakMhz}MHz vs {result.maximumClockMhz}MHz max</i></span>
              ))}
            </div>
            <p>{v100FrequencyEfficiencySource.notes}</p>
            <a href={v100FrequencyEfficiencySource.url} target="_blank" rel="noreferrer">{v100FrequencyEfficiencySource.name} <ExternalLink /></a>
          </article>
        </div>

        <div className="v100-power__floors">
          <header><CircuitBoard /><span><strong>Firmware floor matrix</strong><small>Physical module and host connector are separate facts</small></span><b>QUERY EACH DEVICE</b></header>
          <div className="v100-power__floor-row v100-power__floor-row--heading"><span>Hardware</span><span>Physical / host</span><span>Verified low</span><span>Default / max</span><span>Evidence</span></div>
          {v100PowerFloorObservations.map((observation) => (
            <a href={observation.sourceUrl} target="_blank" rel="noreferrer" className="v100-power__floor-row" key={observation.id} title={observation.notes}>
              <span><strong>{observation.hardware}</strong><small>{observation.memoryGb} GB</small></span>
              <span><strong>{observation.physicalFormFactor}</strong><small>{observation.hostPresentation}</small></span>
              <span><strong>{observation.minimumPowerW ? `${observation.minimumPowerW}W floor` : observation.acceptedLowPowerW ? `${observation.acceptedLowPowerW}W accepted` : 'Unknown'}</strong><small>{observation.minimumPowerW ? 'device range' : 'no reported floor'}</small></span>
              <span><strong>{observation.defaultPowerW}W / {observation.maximumPowerW ? `${observation.maximumPowerW}W` : 'unknown'}</strong><small>default / maximum</small></span>
              <span><strong>{observation.evidence}</strong><small>{observation.sourceName}</small></span>
              <ExternalLink />
            </a>
          ))}
          <footer>A carrier changes the host connection; it does not guarantee a different power-limit table. Two physical SXM2 modules can expose different floors because capacity, board revision, VBIOS, carrier firmware, or OEM policy differs.</footer>
        </div>

        <div className="v100-power__systems">
          <header><CircuitBoard /><span><strong>The carrier and chassis decide whether lower GPU caps help your outlet</strong><small>A GPU cap is not complete-system wall draw</small></span></header>
          <div>
            {v100PowerSystems.map((system) => (
              <a href={system.sourceUrl} target="_blank" rel="noreferrer" key={system.id} className={`is-${system.householdVerdict}`}>
                <span><small>{system.gpuConfiguration}</small><strong>{system.system}</strong></span>
                <span><small>Input</small><strong>{system.input}</strong></span>
                <span><small>Nameplate</small><strong>{system.systemMaximum}</strong></span>
                <b>{system.householdVerdict === 'no' ? 'NO 120V' : 'CONDITIONAL'}</b>
                <p>{system.notes}</p>
                <ExternalLink />
              </a>
            ))}
          </div>
        </div>

        <div className="v100-power__wall-plan">
          <header><Zap /><span><strong>Four-GPU 120V planning envelope</strong><small>Ceiling estimate—not measured draw: 4× cap + 200–350W DC host/fans, then 90% PSU efficiency</small></span><b>1,440W CONTINUOUS BUDGET</b></header>
          <div className="v100-power__wall-row v100-power__wall-row--heading"><span>Configuration</span><span>Per GPU</span><span>GPU ceiling</span><span>Estimated wall</span><span>120V / 15A</span></div>
          {v100QuadWallPlans.map((plan) => (
            <div className={`v100-power__wall-row ${plan.outletVerdict === 'fits planning budget' ? 'is-fit' : plan.outletVerdict === 'exceeds planning budget' ? 'is-over' : 'is-borderline'}`} key={plan.id}>
              <span><strong>{plan.configuration}</strong></span>
              <span><strong>{plan.capWPerGpu}W</strong></span>
              <span><strong>{number(plan.fourGpuCapW)}W</strong></span>
              <span><strong>{number(plan.estimatedWallLowW)}–{number(plan.estimatedWallHighW)}W</strong></span>
              <b>{plan.outletVerdict}</b>
            </div>
          ))}
          <footer>This answers electrical headroom, not plug compatibility. DGX-1 still requires 200–240V, and OEM servers can derate their PSUs on low-line input even after GPU caps are reduced.</footer>
        </div>

        <div className="v100-power__safety">
          <article>
            <Thermometer />
            <span><small>PCIE COOLING GUARDRAIL</small><strong>{v100PcieThermalGuardrail.maximumOperatingC}°C max operating · {v100PcieThermalGuardrail.fiftyPercentSlowdownC}°C 50% slowdown</strong><p>{v100PcieThermalGuardrail.notes}</p><a href={v100PcieThermalGuardrail.sourceUrl} target="_blank" rel="noreferrer">{v100PcieThermalGuardrail.sourceName} <ExternalLink /></a></span>
            <div><b>{v100PcieThermalGuardrail.thermalQualificationC}°C</b><small>qualification</small><b>{v100PcieThermalGuardrail.hbmMaximumOperatingC}°C</b><small>HBM max</small><b>{v100PcieThermalGuardrail.shutdownC}°C</b><small>shutdown</small></div>
          </article>
          <article>
            <Activity />
            <span><small>VOLTA MEASUREMENT RULE</small><strong>Sample repeatedly; do not trust one power.draw value</strong><p>{v100PowerMeasurementMethod.notes}</p><a href={v100PowerMeasurementMethod.sourceUrl} target="_blank" rel="noreferrer">{v100PowerMeasurementMethod.sourceName} <ExternalLink /></a></span>
            <code>nvidia-smi dmon -s pcu -d 1</code>
          </article>
        </div>

        <div className="v100-power__procedure">
          <Terminal />
          <span><strong>Verify the VBIOS range before setting anything</strong><small>{v100Pcie32PowerObservation.notes}</small><a href={v100Pcie32PowerObservation.sourceUrl} target="_blank" rel="noreferrer">Exact V100 PCIe 32GB observation <ExternalLink /></a></span>
          <div>
            <code>nvidia-smi -q -d POWER</code>
            <code>sudo nvidia-smi -i 0 -pl 200</code>
            <code>sudo nvidia-smi -i 0 -lgc 975,975</code>
            <code>nvidia-smi -q -d POWER,PERFORMANCE,CLOCK,TEMPERATURE</code>
            <code>nvidia-smi --query-gpu=index,name,power.draw,power.limit,clocks.sm,clocks.mem,temperature.gpu --format=csv -l 1</code>
          </div>
          <a href={nvidiaSmiPowerDocs} target="_blank" rel="noreferrer">NVIDIA command reference <ExternalLink /></a>
        </div>

        <footer><ShieldCheck /><p><b>Recommendation:</b> start both PCIe and 32GB SXM2 at 200W per GPU. PCIe can usually test 180W next; SXM2 should test 175W. Use 150W only if pp512, TTFT, long-context prefill, and cooling all pass—not just tg128. Treat 100W as a device-specific exception or PCIe capacity mode. Test the 975MHz clock lock separately, reset it with <code>nvidia-smi -rgc</code>, and design power cables/cooling for stock because software limits can be lost when the driver is reinitialized.</p></footer>
      </section>

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
