import {
  AlertTriangle, Box, Check, CheckCircle2, ChevronRight, CircuitBoard, Clipboard,
  Cpu, Database, Gauge, HardDrive, Info, MemoryStick, Network, PlugZap, Server,
  Share2, ShieldCheck, Sparkles, Thermometer, Users, WandSparkles, Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchHomelabAudit } from '../lib/api';
import type { BuildSpec, Category, HomelabAudit, HomelabWorkload, Product } from '../types';
import { money } from '../lib/format';

const defaultSpec: BuildSpec = {
  cpuId: 'amd-ryzen-9-9950x3d', motherboardId: 'asus-tuf-b650-plus-wifi',
  ramId: 'kingston-fury-beast-64-6000', gpuId: 'nvidia-rtx-3090', gpuCount: 1,
  gpuPowerLimitPercent: 100, psuId: 'corsair-rm1000x-atx31', chassisId: 'fractal-meshify-2-xl',
  coolerId: 'noctua-nh-d15-g2', storageId: 'samsung-990-pro-4tb',
  electricalProfileId: 'us-120-15', workload: 'chat', modelProfileId: 'qwen-3.5-27b-q4km',
  contextTokens: 8192, concurrentUsers: 1, ownedProductIds: ['nvidia-rtx-3090'],
};

const workloads: Array<{ id: HomelabWorkload; title: string; note: string; icon: typeof Sparkles }> = [
  { id: 'chat', title: 'Private assistant', note: 'Responsive single-user chat', icon: Sparkles },
  { id: 'coding', title: 'Coding lab', note: 'Long context and fast prompts', icon: WandSparkles },
  { id: 'rag', title: 'RAG & documents', note: 'Storage, context and embeddings', icon: Database },
  { id: 'image', title: 'Image generation', note: 'VRAM and GPU compute first', icon: Gauge },
  { id: 'fine-tune', title: 'Fine-tuning', note: 'Capacity and sustained cooling', icon: CircuitBoard },
  { id: 'multi-user', title: 'Inference server', note: 'Concurrency and networking', icon: Users },
];

const electricalProfiles = [
  ['us-120-15', 'US 120 V / 15 A'], ['us-120-20', 'US 120 V / 20 A'], ['us-240-20', 'US 240 V / 20 A'],
  ['global-230-10', '230 V / 10 A'], ['global-230-13', '230 V / 13 A'], ['global-230-16', '230 V / 16 A'],
];

const models = [
  ['llama-3.1-8b-q4km', 'Llama 3.1 8B · Q4_K_M'],
  ['qwen-3.5-27b-q4km', 'Qwen3.5 27B · Q4_K_M'],
  ['llama-3.3-70b-q4km', 'Llama 3.3 70B · Q4_K_M'],
  ['deepseek-r1-671b-q4', 'DeepSeek-R1 671B · Q4 planning case'],
];

const storageKey = 'compute-value-homelab-build';
const storageVersion = 2;

const selectors: Array<{ key: keyof BuildSpec; category: Category; label: string; note: string; icon: typeof Cpu }> = [
  { key: 'cpuId', category: 'cpu', label: 'CPU', note: 'Host lanes and memory channels', icon: Cpu },
  { key: 'motherboardId', category: 'motherboard', label: 'Motherboard', note: 'Slot topology and firmware', icon: CircuitBoard },
  { key: 'ramId', category: 'ram', label: 'System memory', note: 'Offload and data capacity', icon: MemoryStick },
  { key: 'gpuId', category: 'gpu', label: 'Accelerator', note: 'Speed and addressable VRAM', icon: Gauge },
  { key: 'psuId', category: 'psu', label: 'Power supply', note: 'Capacity, excursions and cables', icon: Zap },
  { key: 'chassisId', category: 'chassis', label: 'Chassis', note: 'Clearance, slots and airflow', icon: Box },
  { key: 'coolerId', category: 'cooler', label: 'CPU cooling', note: 'Socket and sustained load', icon: Thermometer },
  { key: 'storageId', category: 'storage', label: 'Model storage', note: 'Capacity and load time', icon: HardDrive },
  { key: 'nicId', category: 'nic', label: 'Network adapter', note: 'Optional multi-node fabric', icon: Network },
];

function loadInitialSpec(): BuildSpec {
  try {
    const shared = new URLSearchParams(window.location.search).get('build');
    if (shared) return { ...defaultSpec, ...JSON.parse(atob(shared)) as BuildSpec };
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as { version?: number; spec?: BuildSpec } | BuildSpec;
    if ('version' in stored && stored.version === storageVersion && stored.spec) return { ...defaultSpec, ...stored.spec };
    return { ...defaultSpec, ...stored as BuildSpec };
  } catch {
    return defaultSpec;
  }
}

function auditIcon(status: HomelabAudit['status']) {
  if (status === 'works') return CheckCircle2;
  if (status === 'needs-changes') return AlertTriangle;
  if (status === 'works-with-limitations') return Info;
  return ShieldCheck;
}

export function HomelabPlanner({ products }: { products: Product[] }) {
  const [spec, setSpec] = useState<BuildSpec>(loadInitialSpec);
  const [audit, setAudit] = useState<HomelabAudit | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const byCategory = useMemo(() => products.reduce<Partial<Record<Category, Product[]>>>((groups, item) => {
    (groups[item.category] ??= []).push(item);
    return groups;
  }, {}), [products]);
  const selectedGpu = products.find((item) => item.id === spec.gpuId);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ version: storageVersion, spec }));
    const controller = new AbortController();
    setLoading(true);
    fetchHomelabAudit(spec, controller.signal)
      .then((result) => { setAudit(result); setError(''); })
      .catch((reason: Error) => { if (reason.name !== 'AbortError') setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [spec]);

  function update<K extends keyof BuildSpec>(key: K, value: BuildSpec[K]) {
    setSpec((current) => ({ ...current, [key]: value }));
  }

  async function share() {
    const url = new URL(window.location.href);
    url.hash = '/builder';
    url.searchParams.set('build', btoa(JSON.stringify(spec)));
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const VerdictIcon = audit ? auditIcon(audit.status) : ShieldCheck;
  const criticalChecks = audit?.checks.filter((check) => check.status !== 'pass') ?? [];

  return (
    <main className="homelab-page">
      <section className="homelab-hero">
        <div className="homelab-hero__copy">
          <span className="section-kicker">AI HOMELAB DESIGN STUDIO / V2</span>
          <h1>Start with the model.<br /><em>Finish with a build that works.</em></h1>
          <p>Design a complete local AI system with real compatibility, model-memory, PCIe, power-supply, outlet, heat, and price checks—without hiding unknowns.</p>
          <div className="hero-actions">
            <button onClick={() => document.querySelector('.planner-workspace')?.scrollIntoView({ behavior: 'smooth' })}><WandSparkles /> Design my system <ChevronRight /></button>
            <button className="secondary" onClick={() => setAdvanced((value) => !value)}><CircuitBoard /> {advanced ? 'Use guided view' : 'Show engineering view'}</button>
          </div>
        </div>
        <div className="homelab-hero__signal">
          <div><ShieldCheck /><span><strong>Compatibility auditor</strong><small>Socket · memory · slots · cooling</small></span></div>
          <div><PlugZap /><span><strong>House-power planner</strong><small>120 V · 240 V · global profiles</small></span></div>
          <div><MemoryStick /><span><strong>Model-fit calculator</strong><small>Weights · KV cache · concurrency</small></span></div>
        </div>
      </section>

      <section className="workload-picker" aria-labelledby="workload-title">
        <div className="section-heading"><span>01 / INTENT</span><div><h2 id="workload-title">What are you building for?</h2><p>This changes the advice—not the underlying evidence.</p></div></div>
        <div className="workload-grid">
          {workloads.map((workload) => {
            const Icon = workload.icon;
            return <button key={workload.id} className={spec.workload === workload.id ? 'active' : ''} onClick={() => update('workload', workload.id)}>
              <span><Icon /></span><strong>{workload.title}</strong><small>{workload.note}</small>{spec.workload === workload.id && <Check />}
            </button>;
          })}
        </div>
      </section>

      <section className="planner-workspace">
        <div className="planner-controls">
          <div className="planner-panel__title"><span>02 / TARGET</span><h2>Workload envelope</h2></div>
          <label>Model profile<select value={spec.modelProfileId} onChange={(event) => update('modelProfileId', event.target.value)}>{models.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
          <div className="control-pair">
            <label>Context<select value={spec.contextTokens} onChange={(event) => update('contextTokens', Number(event.target.value))}>{[4096, 8192, 16384, 32768, 65536, 131072].map((value) => <option value={value} key={value}>{value.toLocaleString()} tokens</option>)}</select></label>
            <label>Users<input type="number" min="1" max="64" value={spec.concurrentUsers} onChange={(event) => update('concurrentUsers', Number(event.target.value))} /></label>
          </div>
          <label>Electrical service<select value={spec.electricalProfileId} onChange={(event) => update('electricalProfileId', event.target.value)}>{electricalProfiles.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
          <label>GPU power limit <strong>{spec.gpuPowerLimitPercent}%</strong><input type="range" min="40" max="100" step="5" value={spec.gpuPowerLimitPercent} onChange={(event) => update('gpuPowerLimitPercent', Number(event.target.value))} /></label>
          <p className="planner-disclaimer"><Info /> Power-limit retention is a planning model. Exact behavior requires a measured result for the card and workload.</p>
        </div>

        <div className="parts-panel">
          <div className="planner-panel__title"><span>03 / HARDWARE</span><h2>Complete node</h2><button onClick={() => setAdvanced((value) => !value)}>{advanced ? 'GUIDED' : 'ADVANCED'}</button></div>
          <div className="parts-grid">
            {selectors.map((selector) => {
              const Icon = selector.icon;
              const options = (byCategory[selector.category] ?? []) as Product[];
              const value = String(spec[selector.key] ?? '');
              return <label className="part-select" key={selector.key}>
                <span className="part-select__icon"><Icon /></span>
                <span className="part-select__copy"><strong>{selector.label}</strong><small>{selector.note}</small></span>
                <select value={value} onChange={(event) => update(selector.key, event.target.value as never)}>
                  <option value="">Not selected</option>
                  {[...options].sort((a, b) => a.manufacturer.localeCompare(b.manufacturer) || a.name.localeCompare(b.name)).map((item) => <option value={item.id} key={item.id}>{item.manufacturer} · {item.name} · {money(item.price.amountCents)}</option>)}
                </select>
              </label>;
            })}
          </div>
          <div className="gpu-quantity-row">
            <div><Gauge /><span><strong>GPU quantity</strong><small>One to eight accelerators in this node</small></span></div>
            <div role="group" aria-label="GPU quantity">{[1, 2, 3, 4, 8].map((count) => <button className={spec.gpuCount === count ? 'active' : ''} key={count} onClick={() => update('gpuCount', count)}>{count}×</button>)}</div>
            {selectedGpu && <label className="owned-toggle"><input type="checkbox" checked={Boolean(spec.ownedProductIds?.includes(selectedGpu.id))} onChange={(event) => update('ownedProductIds', event.target.checked ? [...(spec.ownedProductIds ?? []), selectedGpu.id] : (spec.ownedProductIds ?? []).filter((id) => id !== selectedGpu.id))} /><span>I already own this GPU</span></label>}
          </div>
        </div>

        <aside className={`audit-panel ${audit?.status ?? ''}`} aria-live="polite">
          <div className="audit-panel__head">
            <span className="audit-icon"><VerdictIcon /></span>
            <div><small>{loading ? 'RECALCULATING' : 'LIVE AUDIT'}</small><h2>{audit?.headline ?? 'Checking this configuration…'}</h2></div>
          </div>
          {error && <p className="audit-error"><AlertTriangle /> {error}</p>}
          {audit && <>
            <div className="audit-metrics">
              <article><span>MODEL FIT</span><strong>{audit.modelFit.label}</strong><small>{audit.modelFit.requiredMemoryGb} GB planned</small></article>
              <article><span>AT THE WALL</span><strong>{audit.power.wallPeakW.toLocaleString()} W</strong><small>{audit.power.estimatedAmps} A · {audit.power.heatBtuH.toLocaleString()} BTU/h</small></article>
              <article><span>SYSTEM COST</span><strong>{money(audit.totalCents)}</strong><small>Owned parts excluded</small></article>
              <article><span>OUTLET</span><strong>{audit.power.outletVerdict.replaceAll('-', ' ')}</strong><small>{audit.power.circuitUtilizationPercent}% of planning limit</small></article>
            </div>
            <div className="audit-priority">
              <div><span>WHAT NEEDS ATTENTION</span><b>{criticalChecks.length}</b></div>
              {criticalChecks.slice(0, 5).map((check) => <article className={check.status} key={check.code}>
                {check.status === 'fail' ? <AlertTriangle /> : <Info />}
                <span><strong>{check.title}</strong><small>{check.detail}</small>{check.fix && <em>{check.fix}</em>}</span>
              </article>)}
              {!criticalChecks.length && <article className="pass"><CheckCircle2 /><span><strong>All documented checks pass</strong><small>Open advanced view for the complete evidence trail.</small></span></article>}
            </div>
            <div className="audit-actions"><button onClick={share}>{copied ? <Check /> : <Share2 />}{copied ? 'Link copied' : 'Share this build'}</button><button onClick={() => navigator.clipboard.writeText(JSON.stringify({ spec, audit }, null, 2))}><Clipboard /> Export JSON</button></div>
          </>}
        </aside>
      </section>

      {audit && advanced && <section className="engineering-report">
        <div className="section-heading"><span>04 / ENGINEERING</span><div><h2>Why the verdict says what it says</h2><p>Every pass, warning, unknown and failure stays visible.</p></div></div>
        <div className="engineering-grid">
          <div className="check-matrix">
            {audit.checks.map((check) => <article className={check.status} key={check.code}>
              <span>{check.status === 'pass' ? <CheckCircle2 /> : check.status === 'fail' ? <AlertTriangle /> : <Info />}</span>
              <div><small>{check.severity} · {check.status}</small><strong>{check.title}</strong><p>{check.detail}</p>{check.fix && <em>{check.fix}</em>}{check.evidenceUrl && <a href={check.evidenceUrl} target="_blank" rel="noreferrer">Open evidence ↗</a>}</div>
            </article>)}
          </div>
          <aside>
            <div className="lane-map"><h3><Server /> PCIe allocation</h3>{audit.laneSummary.length ? audit.laneSummary.map((lane) => <article key={lane.slot}><b>{lane.slot}</b><span><strong>{lane.device}</strong><small>{lane.lanes} · {lane.note}</small></span></article>) : <p>Select a GPU and board to generate a lane map.</p>}</div>
            <div className="power-stack"><h3><PlugZap /> Power envelope</h3>
              {[['Idle', audit.power.idleW], ['Typical inference', audit.power.typicalW], ['Component peak', audit.power.componentPeakW], ['Wall peak', audit.power.wallPeakW], ['Circuit limit', audit.power.circuitContinuousLimitW]].map(([label, value]) => <div key={String(label)}><span>{label}</span><i style={{ width: `${Math.min(100, Number(value) / Math.max(audit.power.circuitContinuousLimitW, 1) * 100)}%` }} /><b>{Number(value).toLocaleString()} W</b></div>)}
              <p>{audit.power.notes.join(' ')}</p>
            </div>
          </aside>
        </div>
      </section>}
    </main>
  );
}
