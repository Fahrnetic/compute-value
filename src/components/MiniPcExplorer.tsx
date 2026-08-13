import { ArrowUpRight, BrainCircuit, Check, Cpu, HardDrive, MemoryStick, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { MiniPc, Product } from '../types';
import { money } from '../lib/format';
import { ProductVisual } from './ProductVisual';

export function MiniPcExplorer({ products }: { products: Product[] }) {
  const miniPcs = products.filter((product): product is MiniPc => product.category === 'mini-pc');
  const [upgradeableOnly, setUpgradeableOnly] = useState(false);
  const [minMemory, setMinMemory] = useState(0);
  const visible = miniPcs.filter((pc) => (!upgradeableOnly || pc.memoryUpgradeable) && pc.memoryGb >= minMemory);

  return (
    <main className="mini-page">
      <section className="mini-hero">
        <div className="mini-hero__copy">
          <span className="section-kicker">COMPACT AI SYSTEMS / 03</span>
          <h1>Big models.<br /><em>Small footprint.</em></h1>
          <p>Compare complete mini PCs by unified memory, graphics, NPU throughput, storage, and upgrade path.</p>
          <div className="hero-pills"><span><BrainCircuit /> Local inference</span><span><Sparkles /> Copilot+ ready</span></div>
        </div>
        <div className="mini-hero__object"><div className="pc-orbit orbit-one" /><div className="pc-orbit orbit-two" /><div className="mini-chassis"><span className="power-dot" /><b>AI</b><i /></div><span className="tops-float">UNIFIED<br /><strong>128</strong><small>GB</small></span></div>
      </section>

      <section className="mini-section">
        <div className="mini-toolbar">
          <div><span>CURATED DATABASE</span><h2>Find your AI desktop</h2></div>
          <div className="mini-controls">
            <label className="compatibility-toggle"><input type="checkbox" checked={upgradeableOnly} onChange={(event) => setUpgradeableOnly(event.target.checked)} /><span className="toggle-track"><i /></span>Upgradeable RAM</label>
            <select value={minMemory} onChange={(event) => setMinMemory(Number(event.target.value))}><option value="0">Any memory</option><option value="32">32 GB+</option><option value="64">64 GB+</option><option value="128">128 GB+</option></select>
          </div>
        </div>
        <div className="mini-grid">
          {visible.map((pc) => (
            <article className="mini-card" key={pc.id}>
              <ProductVisual category="mini-pc" manufacturer={pc.manufacturer} large />
              <div className="mini-card__copy">
                <div className="eyebrow-row"><span>{pc.manufacturer}</span>{pc.aiPerformanceLabel ? <span className="ai-badge">{pc.aiPerformanceLabel}</span> : pc.totalAiTops ? <span className="ai-badge">{pc.totalAiTops} TOTAL TOPS</span> : null}</div>
                <h3>{pc.name}</h3><p>{pc.description}</p>
                <div className="mini-specs">
                  <div><Cpu /><span>Processor</span><strong>{pc.processor}</strong></div>
                  <div><MemoryStick /><span>Memory</span><strong>{pc.memoryGb ? `${pc.memoryGb} GB ${pc.memoryType}` : 'Barebone'}</strong></div>
                  <div><HardDrive /><span>Storage</span><strong>{pc.storageGb ? `${pc.storageGb / 1024} TB SSD` : 'Not included'}</strong></div>
                  <div><BrainCircuit /><span>{pc.npuTops ? 'NPU' : 'AI engine'}</span><strong>{pc.npuTops ? `${pc.npuTops} TOPS` : 'Blackwell GPU'}</strong></div>
                </div>
                {pc.memoryBandwidthGbS && <div className="mini-ai-line"><span>{pc.memoryBandwidthGbS} GB/s memory</span><span>{pc.chipTdpW} W chip TDP</span>{pc.llmBenchmarks?.[0] && <strong>{pc.llmBenchmarks[0].generatedTokensPerSecond} tok/s · universal Llama 2</strong>}</div>}
                <div className="upgrade-line"><Check /> {pc.memoryUpgradeable ? 'User-upgradeable memory' : 'High-bandwidth soldered memory'}</div>
                <div className="mini-card__footer"><div><span>{pc.price.priceType} from</span><strong>{money(pc.price.amountCents)}</strong></div><a href={pc.price.sourceUrl} target="_blank" rel="noreferrer">View source <ArrowUpRight /></a></div>
              </div>
            </article>
          ))}
        </div>
        {visible.length === 0 && <div className="empty-state"><BrainCircuit /><h3>No systems match</h3><p>Try a lower memory threshold or include fixed-memory systems.</p></div>}
      </section>
    </main>
  );
}
