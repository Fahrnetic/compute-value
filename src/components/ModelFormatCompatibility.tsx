import { Binary, Bot, Database, ExternalLink, Film, ImageIcon, Layers3, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  modelFormatSemantics,
  modelSupportCatalog,
  type AiModelCompatibilityCatalog,
  type AiModelModality,
  type AiModelPrecision,
} from '../data/model-format-support';
import { fetchAiModelCompatibility } from '../lib/api';

const modalityIcon = {
  llm: Bot,
  image: ImageIcon,
  video: Film,
} satisfies Record<AiModelModality, typeof Bot>;

const modalityLabel: Record<AiModelModality, string> = {
  llm: 'Language', image: 'Image', video: 'Video',
};

function formatGb(value: number | null) {
  return value === null ? 'Runtime quantized' : `${value.toLocaleString(undefined, { maximumFractionDigits: 3 })}GB`;
}

export function ModelFormatCompatibility({ initialCatalog = modelSupportCatalog, loadFromDatabase = true }: {
  initialCatalog?: AiModelCompatibilityCatalog;
  loadFromDatabase?: boolean;
}) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [dataState, setDataState] = useState<'seeded' | 'database' | 'error'>('seeded');
  const [clusterId, setClusterId] = useState('v100-sxm2-quad');
  const [modality, setModality] = useState<'all' | AiModelModality>('all');
  const [precision, setPrecision] = useState<'all' | AiModelPrecision>('all');

  useEffect(() => {
    if (!loadFromDatabase || import.meta.env.MODE === 'test' || typeof fetch === 'undefined') return;
    let active = true;
    fetchAiModelCompatibility()
      .then((result) => { if (active) { setCatalog(result); setDataState('database'); } })
      .catch(() => { if (active) setDataState('error'); });
    return () => { active = false; };
  }, [loadFromDatabase]);

  const selectedCluster = catalog.clusters.find((cluster) => cluster.id === clusterId) ?? catalog.clusters[0];
  const compatibilityByFormat = useMemo(() => new Map(catalog.compatibility
    .filter((result) => result.clusterId === selectedCluster.id)
    .map((result) => [result.formatId, result])), [catalog, selectedCluster.id]);
  const models = catalog.models.filter((model) => modality === 'all' || model.modality === modality);
  const visibleFormats = catalog.formats.filter((format) => (
    (precision === 'all' || format.precision === precision)
    && models.some((model) => model.id === format.modelId)
  ));
  const visibleResults = visibleFormats.map((format) => compatibilityByFormat.get(format.id)).filter(Boolean);
  const fitCount = visibleResults.filter((result) => result?.status === 'fits').length;
  const conditionalCount = visibleResults.filter((result) => result?.status === 'conditional').length;

  return (
    <section className="model-format-lab" aria-labelledby="model-format-title">
      <header>
        <div>
          <span className="section-kicker">SQLITE MODEL LIBRARY / EXACT FOUR-GPU CAPACITY</span>
          <h2 id="model-format-title">Language, image, and video formats—without calling every 4-bit model “Q4.”</h2>
          <p>Choose an exact four-GPU system, then inspect owner-published checkpoints, runtime quantization paths, native precision requirements, memory headroom, and the correct distribution strategy. A fit means the supported execution path clears a conservative capacity check; it is not a speed benchmark.</p>
        </div>
        <div className="model-format-lab__summary">
          <span><strong>{catalog.meta.modelCount}</strong><small>models</small></span>
          <span><strong>{catalog.meta.formatCount}</strong><small>format rows</small></span>
          <span><strong>{catalog.meta.clusterCount}</strong><small>4-GPU systems</small></span>
          <b className={`is-${dataState}`}><Database /> {dataState === 'database' ? 'DATABASE LIVE' : dataState === 'error' ? 'SEEDED FALLBACK' : 'LOADING DATABASE'}</b>
        </div>
      </header>

      <div className="model-format-lab__controls">
        <label>
          <span>Four-GPU cluster</span>
          <select aria-label="Four-GPU model cluster" value={selectedCluster.id} onChange={(event) => setClusterId(event.target.value)}>
            {catalog.clusters.map((cluster) => <option value={cluster.id} key={cluster.id}>{cluster.name}</option>)}
          </select>
        </label>
        <div className="model-format-lab__filter" aria-label="Filter by model modality">
          {(['all', 'llm', 'image', 'video'] as const).map((item) => (
            <button className={modality === item ? 'active' : ''} onClick={() => setModality(item)} key={item}>{item === 'all' ? 'All models' : modalityLabel[item]}</button>
          ))}
        </div>
        <div className="model-format-lab__filter is-precision" aria-label="Filter by model precision">
          {(['all', 'Q4', 'Q8', 'FP16', 'BF16'] as const).map((item) => (
            <button className={precision === item ? 'active' : ''} onClick={() => setPrecision(item)} key={item}>{item === 'all' ? 'All formats' : item}</button>
          ))}
        </div>
      </div>

      <div className="model-format-cluster">
        <Layers3 />
        <span><small>SELECTED FOUR-GPU SYSTEM</small><strong>{selectedCluster.name}</strong><em>{selectedCluster.architecture} · compute capability {selectedCluster.computeCapability} · {selectedCluster.nativeBf16 ? 'native BF16' : 'no native BF16'}</em></span>
        <span><small>Physical VRAM</small><strong>{selectedCluster.vramPerGpuGb}GB × 4 = {selectedCluster.totalVramGb}GB</strong><em>separate pools; runtime-controlled sharding</em></span>
        <span><small>Planning VRAM</small><strong>{visibleResults[0]?.usableVramPerGpuGb ?? '—'}GB/GPU</strong><em>{visibleResults[0]?.usableClusterVramGb ?? '—'}GB after reserve</em></span>
        <span><small>Visible result</small><strong>{fitCount} fit · {conditionalCount} conditional</strong><em>{visibleResults.length - fitCount - conditionalCount} unsupported</em></span>
        <a href={selectedCluster.sourceUrl} target="_blank" rel="noreferrer">Hardware source <ExternalLink /></a>
        <p>{selectedCluster.fabric}</p>
      </div>

      <div className="model-format-semantics">
        <header><Binary /><span><strong>Same bit count does not mean the same file format or kernel</strong><small>The database stores precision and representation separately.</small></span></header>
        <div>{modelFormatSemantics.map((item) => <span key={item.label}><strong>{item.label}</strong><small>{item.detail}</small></span>)}</div>
      </div>

      <div className="model-format-grid">
        {models.map((model) => {
          const ModelIcon = modalityIcon[model.modality];
          const formats = visibleFormats.filter((format) => format.modelId === model.id);
          if (!formats.length) return null;
          return (
            <article className={`model-format-card is-${model.modality}`} key={model.id}>
              <header>
                <ModelIcon />
                <span><small>{modalityLabel[model.modality]} · {model.parameterCountB ? `${model.parameterCountB}B parameters` : 'composite pipeline'}</small><strong>{model.name}</strong><em>{model.tasks.join(' · ')}</em></span>
                <b>{model.nativePrecision} NATIVE</b>
              </header>
              <p>{model.notes}</p>
              <div className="model-format-card__rows">
                {formats.map((format) => {
                  const result = compatibilityByFormat.get(format.id)!;
                  return (
                    <a href={format.sourceUrl} target="_blank" rel="noreferrer" className={`model-format-row is-${result.status}`} key={format.id}>
                      <span className="model-format-row__precision"><strong>{format.precision}</strong><small>{format.availability}</small></span>
                      <span><small>Representation</small><strong>{format.format}</strong><em>{format.runtime}</em></span>
                      <span><small>Published payload</small><strong>{formatGb(format.weightPayloadGb)}</strong><em>{format.planningVramGb ? `${format.planningVramGb}GB planning VRAM` : format.payloadBasis}</em></span>
                      <span><small>Four-GPU mode</small><strong>{result.strategy}</strong><em>{format.supportsCpuOffload ? 'CPU offload available' : 'GPU-resident path'}</em></span>
                      <b>{result.status === 'fits' ? 'FITS' : result.status === 'conditional' ? 'CONDITIONAL' : 'UNSUPPORTED'}</b>
                      <ExternalLink />
                      <p>{result.reason}</p>
                    </a>
                  );
                })}
              </div>
              <footer><a href={model.sourceUrl} target="_blank" rel="noreferrer">Model source <ExternalLink /></a></footer>
            </article>
          );
        })}
      </div>

      <footer><ShieldAlert /><p><strong>No speed is inferred here.</strong> Diffusion and video memory changes with resolution, frame count, batch, attention backend, VAE tiling, and offload. LLM memory changes with context, KV-cache dtype, concurrency, and runtime. “Fits” means the documented format/runtime clears this planning envelope; benchmark the exact workload before buying four cards.</p></footer>
    </section>
  );
}
