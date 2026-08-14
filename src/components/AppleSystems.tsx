import { BatteryCharging, CheckCircle2, Cpu, Gauge, HardDrive, Laptop, MemoryStick, Monitor, PlugZap, Scale, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AppleSystem, Product } from '../types';
import { money } from '../lib/format';

type Sort = 'memory' | 'bandwidth' | 'price' | 'llm';

function systemFit(memoryGb: number) {
  const usable = memoryGb * 0.75;
  if (usable >= 410) return 'DeepSeek-R1 671B Q4 planning range';
  if (usable >= 48) return '70B Q4 with long-context headroom';
  return '27B Q4 with substantial headroom';
}

export function AppleSystems({ products }: { products: Product[] }) {
  const [systemClass, setSystemClass] = useState<'all' | AppleSystem['systemClass']>('all');
  const [sort, setSort] = useState<Sort>('memory');
  const systems = useMemo(() => {
    const list = products.filter((product): product is AppleSystem => product.category === 'apple-system' && product.unifiedMemoryGb >= 128)
      .filter((product) => systemClass === 'all' || product.systemClass === systemClass);
    return [...list].sort((a, b) => {
      if (sort === 'price') return a.price.amountCents - b.price.amountCents;
      if (sort === 'bandwidth') return b.memoryBandwidthGbS - a.memoryBandwidthGbS;
      if (sort === 'llm') return (b.universalLlama2?.generatedTokensPerSecond ?? -1) - (a.universalLlama2?.generatedTokensPerSecond ?? -1);
      return b.unifiedMemoryGb - a.unifiedMemoryGb;
    });
  }, [products, systemClass, sort]);

  return <main className="apple-page">
    <section className="apple-hero">
      <div><span className="section-kicker">UNIFIED MEMORY SYSTEMS / 128 GB+</span><h1>Large models.<br /><em>No PCIe assembly required.</em></h1><p>Apple systems trade upgradeability and CUDA compatibility for quiet operation, a single large memory pool, and excellent bandwidth. Universal llama.cpp measurements stay separate from MLX-native results.</p></div>
      <div className="apple-hero__stats"><article><MemoryStick /><strong>128–512 GB</strong><span>Unified memory</span></article><article><Gauge /><strong>546–819 GB/s</strong><span>Published bandwidth</span></article><article><ShieldCheck /><strong>Metal + MLX</strong><span>Runtime lanes separated</span></article></div>
    </section>

    <section className="apple-principles">
      <article><span><CheckCircle2 /></span><div><strong>One addressable pool</strong><p>Weights, KV cache and application memory share unified memory; macOS still needs a meaningful reserve.</p></div></article>
      <article><span><BatteryCharging /></span><div><strong>Excellent home behavior</strong><p>Quiet idle, compact size and ordinary-outlet operation make these unusually easy to live with.</p></div></article>
      <article><span><Scale /></span><div><strong>Capacity is not CUDA</strong><p>Software support and tokens per second can matter more than headline memory. Compare exact runtime and model profiles.</p></div></article>
    </section>

    <section className="apple-catalog">
      <div className="apple-toolbar"><div role="group" aria-label="Filter by Apple system class"><button aria-pressed={systemClass === 'all'} className={systemClass === 'all' ? 'active' : ''} onClick={() => setSystemClass('all')}>All systems</button><button aria-pressed={systemClass === 'portable'} className={systemClass === 'portable' ? 'active' : ''} onClick={() => setSystemClass('portable')}><Laptop /> Portable</button><button aria-pressed={systemClass === 'desktop'} className={systemClass === 'desktop' ? 'active' : ''} onClick={() => setSystemClass('desktop')}><Monitor /> Desktop</button></div><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="memory">Most memory</option><option value="bandwidth">Memory bandwidth</option><option value="price">Lowest price</option><option value="llm">Measured Llama 2 decode</option></select></label></div>
      <div className="apple-grid">{systems.map((system, index) => <article className="apple-card" key={system.id}>
        <header><span>{system.systemClass === 'portable' ? <Laptop /> : <Monitor />}</span><div><small>{system.systemClass.toUpperCase()} · #{index + 1}</small><h2>{system.name}</h2></div><a href={system.specSourceUrl} target="_blank" rel="noreferrer">SPEC ↗</a></header>
        <div className="apple-card__capacity"><strong>{system.unifiedMemoryGb}<small>GB</small></strong><span><b>{system.memoryBandwidthGbS} GB/s</b> unified-memory bandwidth</span></div>
        <div className="apple-card__specs"><span><Cpu /><b>{system.cpuCores} CPU</b><small>{system.gpuCores} GPU cores</small></span><span><HardDrive /><b>{system.storageGb / 1000} TB</b><small>Not upgradeable</small></span><span><PlugZap /><b>≤ {system.maxSystemPowerW} W</b><small>Published adapter/enclosure ceiling</small></span></div>
        <div className="apple-card__fit"><small>CAPACITY ROUTE</small><strong>{systemFit(system.unifiedMemoryGb)}</strong><p>Planning label uses a 25% system and runtime reserve; verify the exact model artifact and context.</p></div>
        <div className="apple-card__benchmark"><div><small>UNIVERSAL LLAMA.CPP CONTROL</small>{system.universalLlama2 ? <strong>{system.universalLlama2.generatedTokensPerSecond.toFixed(1)} tok/s <em>decode</em></strong> : <strong>Benchmark needed</strong>}</div>{system.universalLlama2 && <span><b>{system.universalLlama2.promptTokensPerSecond.toFixed(0)}</b> prompt tok/s<a href={system.universalLlama2.sourceUrl} target="_blank" rel="noreferrer">Measured public ↗</a></span>}</div>
        <footer><div><span>REFERENCE COST</span><strong>{money(system.price.amountCents)}</strong></div><small>{system.price.retailer} · observed {system.price.observedAt}</small></footer>
      </article>)}</div>
    </section>
  </main>;
}
