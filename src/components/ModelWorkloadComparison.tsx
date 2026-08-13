import { AlertTriangle, CheckCircle2, ExternalLink, FlaskConical, Gauge, Scale } from 'lucide-react';
import { useState } from 'react';
import {
  llama31UniversalResearch,
  modelWorkloadComparisons,
  procyonGpuReportResearch,
  procyonTokenResearch,
  qwen25ServingResearch,
  qwen36Research,
  rtx4070SuperLocalScoreResearch,
  workstationModelResults,
  workstationModelSource,
  type ModelWorkloadComparison as WorkloadComparison,
  type TwoGpuThroughputResult,
} from '../data/model-workloads';

type ResearchView = 'consumer' | 'universal' | 'portable' | 'workstation' | 'qwen36';

function number(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString('en-US', { maximumFractionDigits });
}

function WorkloadCard({ comparison }: { comparison: WorkloadComparison }) {
  return (
    <article className="model-workload-card">
      <header>
        <span><small>{comparison.modelKind}</small><strong>{comparison.model}</strong></span>
        <b className={comparison.evidence === 'Same published test matrix' ? 'is-exact' : 'is-proxy'}>{comparison.evidence}</b>
      </header>
      <p>{comparison.benchmark} · {comparison.runtime}</p>
      <div className="model-workload-hardware" aria-label="Compared hardware">
        <span><small>96 GB BLACKWELL</small><strong>{comparison.rtxHardware}</strong></span>
        <span><small>141 GB HOPPER</small><strong>{comparison.h200Hardware}</strong></span>
      </div>
      <div className="model-workload-results">
        {comparison.measurements.map((measurement) => {
          const fastest = Math.max(measurement.rtxPro6000TokensPerSecond, measurement.h200NvlTokensPerSecond);
          const ratio = measurement.h200NvlTokensPerSecond / measurement.rtxPro6000TokensPerSecond;
          return (
            <div className="model-workload-result" key={measurement.label}>
              <span><strong>{measurement.label}</strong><small>{measurement.qualifier}</small></span>
              <div>
                <span><b>{number(measurement.rtxPro6000TokensPerSecond)} tok/s</b><i style={{ width: `${measurement.rtxPro6000TokensPerSecond / fastest * 100}%` }} /></span>
                <span><b>{number(measurement.h200NvlTokensPerSecond)} tok/s</b><i style={{ width: `${measurement.h200NvlTokensPerSecond / fastest * 100}%` }} /></span>
              </div>
              <em>H200 {ratio.toFixed(2)}× RTX</em>
            </div>
          );
        })}
      </div>
      {comparison.latency && (
        <div className="model-workload-latency">
          <small>{comparison.latency.label}</small>
          <strong>{number(comparison.latency.rtxPro6000Ms, 2)} ms <i>RTX</i></strong>
          <strong>{number(comparison.latency.h200NvlMs, 2)} ms <i>H200</i></strong>
          <span>H200 {number((1 - comparison.latency.h200NvlMs / comparison.latency.rtxPro6000Ms) * 100)}% lower</span>
        </div>
      )}
      <div className="model-workload-caveat"><AlertTriangle /> <span>{comparison.caveat}</span></div>
      <footer>
        {comparison.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label} <ExternalLink /></a>)}
      </footer>
    </article>
  );
}

function UniversalComparisons() {
  return (
    <div className="model-workload-grid">
      {modelWorkloadComparisons.map((comparison) => <WorkloadCard comparison={comparison} key={comparison.id} />)}
    </div>
  );
}

function score(value: number | null) {
  return value === null ? <span className="benchmark-missing">Did not complete</span> : number(value, 0);
}

function ConsumerBenchmarkResearch() {
  const local = rtx4070SuperLocalScoreResearch;
  return (
    <div className="consumer-benchmark-research">
      <section className="consumer-highlight-card">
        <header>
          <span><Gauge /><small>RTX 4070 SUPER / THREE MODEL SIZES</small><h3>{local.hardware}</h3><p>{local.runtime}</p></span>
          <b>MEASURED</b>
        </header>
        <div className="localscore-table">
          <div className="localscore-row localscore-row--heading" aria-hidden="true"><span>Model</span><span>Prompt</span><span>Generation</span><span>TTFT</span></div>
          {local.results.map((result) => (
            <div className="localscore-row" key={result.model}>
              <strong>{result.model}<small>{result.parameters} · Q4_K Medium</small></strong>
              <span>{number(result.promptTokensPerSecond, 0)} tok/s</span>
              <span>{number(result.generatedTokensPerSecond)} tok/s</span>
              <span>{number(result.ttftMs, 0)} ms</span>
            </div>
          ))}
        </div>
        <div className="model-workload-caveat"><AlertTriangle /> <span>{local.caveat}</span></div>
        <a className="control-source" href={local.sourceUrl} target="_blank" rel="noreferrer">LocalScore accelerator page <ExternalLink /></a>
      </section>

      <section className="procyon-research-card">
        <header className="cross-benchmark-heading">
          <span><small>UNIVERSAL FOUR-MODEL SUITE</small><h3>{procyonGpuReportResearch.benchmark}</h3><p>{procyonGpuReportResearch.sourceVersionNote}</p></span>
          <b>{procyonGpuReportResearch.results.length} CARDS</b>
        </header>
        <div className="procyon-table">
          <div className="procyon-row procyon-row--heading" aria-hidden="true"><span>Graphics card / host</span><span>Phi-3.5</span><span>Mistral 7B</span><span>Llama 3.1 8B</span><span>Llama 2 13B</span></div>
          {procyonGpuReportResearch.results.map((result) => (
            <div className={`procyon-row ${result.hardware === 'GeForce RTX 4070 SUPER' ? 'is-focus' : ''}`} key={result.hardware}>
              <strong>{result.hardware}<small>{result.hostCpu}</small></strong>
              <span>{score(result.phi35)}</span>
              <span>{score(result.mistral7b)}</span>
              <span>{score(result.llama31)}</span>
              <span>{score(result.llama2)}</span>
            </div>
          ))}
        </div>
        <div className="model-workload-caveat"><AlertTriangle /> <span>{procyonGpuReportResearch.caveat}</span></div>
        <footer className="cross-benchmark-links">
          {procyonGpuReportResearch.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label} <ExternalLink /></a>)}
        </footer>
      </section>

      <section className="procyon-research-card procyon-research-card--tokens">
        <header className="cross-benchmark-heading">
          <span><small>SECOND SOURCE / ACTUAL TOKENS PER SECOND</small><h3>{procyonTokenResearch.benchmark}</h3><p>Same four INT4 model families; the values below are rates, not composite points.</p></span>
          <b>4 CARDS</b>
        </header>
        <div className="procyon-table">
          <div className="procyon-row procyon-row--heading" aria-hidden="true"><span>Graphics card</span><span>Phi-3.5</span><span>Mistral 7B</span><span>Llama 3.1 8B</span><span>Llama 2 13B</span></div>
          {procyonTokenResearch.results.map((result) => (
            <div className="procyon-row" key={result.hardware}>
              <strong>{result.hardware}<small>tok/s · higher is better</small></strong>
              <span>{number(result.phi35, 2)}</span>
              <span>{number(result.mistral7b, 2)}</span>
              <span>{number(result.llama31, 2)}</span>
              <span>{number(result.llama2, 2)}</span>
            </div>
          ))}
        </div>
        <div className="model-workload-caveat"><AlertTriangle /> <span>{procyonTokenResearch.caveat}</span></div>
        <a className="control-source" href={procyonTokenResearch.sourceUrl} target="_blank" rel="noreferrer">BenchLife result table <ExternalLink /></a>
      </section>
    </div>
  );
}

function TwoGpuControlTable({
  title,
  settingLabel,
  results,
}: {
  title: string;
  settingLabel: string;
  results: TwoGpuThroughputResult[];
}) {
  return (
    <div className="control-result-table">
      <div className="control-result-title"><strong>{title}</strong><small>tok/s · higher is better</small></div>
      <div className="control-result-row control-result-row--heading" aria-hidden="true"><span>{settingLabel}</span><span>RTX 5090</span><span>H200 NVL</span><span>Winner</span></div>
      {results.map((result) => {
        const rtxWins = result.rtx5090TokensPerSecond > result.h200NvlTokensPerSecond;
        const ratio = Math.max(result.rtx5090TokensPerSecond, result.h200NvlTokensPerSecond) / Math.min(result.rtx5090TokensPerSecond, result.h200NvlTokensPerSecond);
        return (
          <div className="control-result-row" key={result.setting}>
            <strong>{number(result.setting, 0)}</strong>
            <span>{number(result.rtx5090TokensPerSecond, 2)}</span>
            <span>{number(result.h200NvlTokensPerSecond, 2)}</span>
            <em>{rtxWins ? '5090' : 'H200'} {ratio.toFixed(2)}×</em>
          </div>
        );
      })}
    </div>
  );
}

function UniversalModelLab() {
  const q8 = llama31UniversalResearch.q8Control;
  const maxSingle = Math.max(...qwen25ServingResearch.results.map((result) => result.singleTokensPerSecond));
  const maxBatch = Math.max(...qwen25ServingResearch.results.map((result) => result.batch8TokensPerSecond));
  return (
    <div className="universal-model-lab">
      <section className="portable-profile-card">
        <header>
          <span><Scale /><small>EVERY-CARD PROFILE</small><h3>{llama31UniversalResearch.model}</h3></span>
          <b>{llama31UniversalResearch.portableFileSizeGb} GB · {llama31UniversalResearch.portableQuantization}</b>
        </header>
        <p>The catalog bottoms out at {llama31UniversalResearch.catalogMinimumVramGb} GB. This quant leaves usable KV-cache headroom and keeps one checkpoint, one file, one harness, and one request shape across every listed GPU.</p>
        <code>{llama31UniversalResearch.portableCommand}</code>
        <ol>{llama31UniversalResearch.portableRules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
        <footer>
          <a href={llama31UniversalResearch.modelSourceUrl} target="_blank" rel="noreferrer">Model + quant files <ExternalLink /></a>
          <span>Q4 results remain pending; no Q8 numbers are copied into this lane.</span>
        </footer>
      </section>

      <section className="h200-control-card">
        <header>
          <span><small>PUBLISHED H200 NVL CONTROL</small><h3>{q8.modelFile}</h3><p>{q8.modelSizeGb} GB · exact same file and commands on both GPUs</p></span>
          <b>TRACEABLE</b>
        </header>
        <div className="h200-control-hardware"><span>GeForce RTX 5090 <small>32 GB Blackwell</small></span><i>VS</i><span>H200 NVL <small>141 GB Hopper</small></span></div>
        <div className="h200-control-tables">
          <TwoGpuControlTable title="Text generation" settingLabel="Output tokens" results={q8.generation} />
          <TwoGpuControlTable title="Prompt processing" settingLabel="Batch size" results={q8.promptProcessing} />
        </div>
        <details className="benchmark-command"><summary>Exact published commands</summary><code>{q8.generationCommand}</code><code>{q8.promptCommand}</code></details>
        <div className="model-workload-caveat"><AlertTriangle /> <span>{q8.caveat}</span></div>
        <a className="control-source" href={q8.sourceUrl} target="_blank" rel="noreferrer">LTT Labs source and result tables <ExternalLink /></a>
      </section>

      <section className="qwen-serving-card">
        <header>
          <span><Gauge /><small>INDEPENDENT SERVING CROSS-CHECK</small><h3>{qwen25ServingResearch.model}</h3><p>{qwen25ServingResearch.runtime} · {qwen25ServingResearch.tokenShape}</p></span>
          <b>6 GPUs</b>
        </header>
        <div className="qwen-serving-table">
          <div className="qwen-serving-row qwen-serving-row--heading" aria-hidden="true"><span>Rank / GPU</span><span>Memory</span><span>Batch 1</span><span>Batch 8</span><span>H200 gap</span></div>
          {qwen25ServingResearch.results.map((result, index) => (
            <div className="qwen-serving-row" key={result.hardware}>
              <strong><i>#{index + 1}</i>{result.hardware}<small>{result.architecture}</small></strong>
              <span>{result.vramGb} GB</span>
              <span className="serving-speed"><b>{number(result.singleTokensPerSecond, 2)} tok/s</b><i style={{ width: `${result.singleTokensPerSecond / maxSingle * 100}%` }} /></span>
              <span className="serving-speed"><b>{number(result.batch8TokensPerSecond, 2)} tok/s</b><i style={{ width: `${result.batch8TokensPerSecond / maxBatch * 100}%` }} /></span>
              <em>{index === 0 ? 'baseline' : `${(maxSingle / result.singleTokensPerSecond).toFixed(2)}× behind`}</em>
            </div>
          ))}
        </div>
        <div className="model-workload-caveat"><AlertTriangle /> <span>{qwen25ServingResearch.caveat}</span></div>
        <footer>
          <a href={qwen25ServingResearch.sourceUrl} target="_blank" rel="noreferrer">Koyeb benchmark matrix <ExternalLink /></a>
          <a href={qwen25ServingResearch.hardwareSourceUrl} target="_blank" rel="noreferrer">Hardware identity <ExternalLink /></a>
        </footer>
      </section>
    </div>
  );
}

function WorkstationLibrary() {
  const fastest = Math.max(...workstationModelResults.map((result) => result.tokensPerSecond));
  return (
    <div className="workstation-model-library">
      <div className="workstation-model-note">
        <CheckCircle2 />
        <span><strong>Exact full-power workstation card</strong><small>{workstationModelSource.hardware}</small></span>
        <a href={workstationModelSource.url} target="_blank" rel="noreferrer">Open source <ExternalLink /></a>
      </div>
      <div className="workstation-model-table">
        <div className="workstation-model-row workstation-model-row--heading" aria-hidden="true"><span>Model</span><span>Profile</span><span>File size</span><span>Average response</span></div>
        {workstationModelResults.map((result) => (
          <div className="workstation-model-row" key={result.model}>
            <strong>{result.model}</strong>
            <span>{result.quantization}</span>
            <span>{result.modelSizeGb} GB</span>
            <span className="workstation-model-speed"><b>{result.tokensPerSecond} tok/s</b><i style={{ width: `${result.tokensPerSecond / fastest * 100}%` }} /></span>
          </div>
        ))}
      </div>
      <p className="model-research-footnote">These eight LM Studio results share one workstation test bed, but GamersNexus labels the suite experimental. No identical H200 NVL LM Studio run was published, so the missing H200 column is not estimated.</p>
    </div>
  );
}

function Qwen36Research() {
  return (
    <div className="qwen-research">
      <header>
        <div><small>VERIFIED MODEL</small><h3>{qwen36Research.model}</h3><p>{qwen36Research.parameters} · {qwen36Research.context}</p></div>
        <a href={qwen36Research.officialUrl} target="_blank" rel="noreferrer">Official model card <ExternalLink /></a>
      </header>
      <div className="qwen-result-grid">
        {qwen36Research.published.map((result) => (
          <article className={result.result.startsWith('No ') ? 'is-missing' : ''} key={result.hardware}>
            <small>{result.hardware}</small>
            <strong>{result.result}</strong>
            <span>{result.profile}</span>
            <p>{result.caveat}</p>
            <a href={result.sourceUrl} target="_blank" rel="noreferrer">Evidence <ExternalLink /></a>
          </article>
        ))}
      </div>
      <div className="universal-profile">
        <span><Scale /><strong>Proposed universal Qwen3.6 profile</strong><small>The shortest path to a defensible workstation-vs-H200 result</small></span>
        <ol>{qwen36Research.universalProfile.map((item) => <li key={item}>{item}</li>)}</ol>
      </div>
    </div>
  );
}

export function ModelWorkloadComparison() {
  const [view, setView] = useState<ResearchView>('consumer');
  return (
    <section className="model-workload-comparison" aria-labelledby="model-workload-title">
      <header className="model-workload-heading">
        <div><span>MODEL-LEVEL RESEARCH / CONSUMER TO DATA CENTER</span><h2 id="model-workload-title">Same model. Same workload.</h2><p>Consumer, workstation, and H200 comparisons stay separated by model, quantization, runtime, and concurrency so unlike results never masquerade as one leaderboard.</p></div>
        <FlaskConical />
      </header>
      <div className="model-research-tabs" role="tablist" aria-label="Model benchmark evidence">
        <button role="tab" aria-selected={view === 'consumer'} className={view === 'consumer' ? 'active' : ''} onClick={() => setView('consumer')}><span>NVIDIA consumer cross-checks</span><b>11 CARDS</b></button>
        <button role="tab" aria-selected={view === 'universal'} className={view === 'universal' ? 'active' : ''} onClick={() => setView('universal')}><span>Universal comparisons</span><b>{modelWorkloadComparisons.length}</b></button>
        <button role="tab" aria-selected={view === 'portable'} className={view === 'portable' ? 'active' : ''} onClick={() => setView('portable')}><span>Every-card control</span><b>2 MODELS</b></button>
        <button role="tab" aria-selected={view === 'workstation'} className={view === 'workstation' ? 'active' : ''} onClick={() => setView('workstation')}><span>Workstation model library</span><b>{workstationModelResults.length}</b></button>
        <button role="tab" aria-selected={view === 'qwen36'} className={view === 'qwen36' ? 'active' : ''} onClick={() => setView('qwen36')}><span>Qwen3.6-27B research</span><b>NEW</b></button>
      </div>
      <div className="model-research-panel" role="tabpanel">
        {view === 'consumer' && <ConsumerBenchmarkResearch />}
        {view === 'universal' && <UniversalComparisons />}
        {view === 'portable' && <UniversalModelLab />}
        {view === 'workstation' && <WorkstationLibrary />}
        {view === 'qwen36' && <Qwen36Research />}
      </div>
    </section>
  );
}
