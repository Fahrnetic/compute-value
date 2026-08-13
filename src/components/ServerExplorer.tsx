import {
  BookOpen, Boxes, CheckCircle2, Cpu, ExternalLink, Gauge, HardDrive, MemoryStick,
  PlugZap, Search, Server, ShieldCheck, TriangleAlert, X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Product, ServerSystem } from '../types';

const fitLabel = {
  'drop-in': 'Stock-tray fit',
  'custom-fabrication': 'Custom fabrication only',
  'not-viable': 'No practical breakout',
} as const;

function capacity(gb: number) {
  return `${gb / 1024} TB`;
}

export function ServerExplorer({ products }: { products: Product[] }) {
  const servers = products.filter((product): product is ServerSystem => product.category === 'server-system');
  const [search, setSearch] = useState('');
  const [series, setSeries] = useState<'all' | '100' | '200'>('all');
  const [manufacturer, setManufacturer] = useState('all');
  const [minimumOptaneTb, setMinimumOptaneTb] = useState(0);
  const [minimumPcie, setMinimumPcie] = useState(0);

  const filtered = useMemo(() => servers.filter((server) => {
    if (series !== 'all' && server.optaneSeries !== series) return false;
    if (manufacturer !== 'all' && server.manufacturer !== manufacturer) return false;
    if (server.maxOptaneGb < minimumOptaneTb * 1024) return false;
    if (server.pcieSlots < minimumPcie) return false;
    if (search && ![
      server.name, server.manufacturer, server.family, server.cpuGeneration,
      server.cpuSocket, server.description, ...server.supportedCpuModels,
    ].join(' ').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [servers, search, series, manufacturer, minimumOptaneTb, minimumPcie]);

  return (
    <main className="server-page">
      <section className="server-hero">
        <div className="server-hero__copy">
          <span className="section-kicker">PERSISTENT MEMORY SYSTEMS / 04</span>
          <h1>Optane servers,<br /><em>properly qualified.</em></h1>
          <p>Complete DDR4 server systems for Intel Optane Persistent Memory—not consumer Optane caching. Compare CPUs, PMem capacity, PCIe expansion, physical size, operating systems, and Sluice V2 breakout viability.</p>
          <div className="hero-pills">
            <span><MemoryStick /> PMem 100 + 200</span>
            <span><ShieldCheck /> Linux + Windows</span>
            <span><Server /> {servers.length} researched systems</span>
          </div>
        </div>
        <div className="server-memory-map" aria-label="Intel Optane generation map">
          <div><small>PMEM 100</small><strong>DDR4 / LGA3647</strong><span>2nd Gen Xeon Scalable</span><b>6 TB typical max</b></div>
          <i />
          <div><small>PMEM 200</small><strong>DDR4 / LGA4189</strong><span>3rd Gen Xeon Scalable</span><b>8 TB typical max</b></div>
        </div>
      </section>

      <section className="sluice-verdict">
        <div className="sluice-verdict__icon"><TriangleAlert /></div>
        <div><span>SLUICE V2 FIT VERDICT</span><h2>None of these full server boards is a stock drop-in.</h2><p>The frame specifies an ATX-only 305 × 245 mm tray. These systems use much larger or unpublished proprietary planars plus chassis-specific risers, PSUs, fan control, and backplanes. Keep the server chassis and cable GPUs externally, or choose a standard workstation motherboard for an open frame.</p></div>
        <a href="https://www.newegg.com/p/2AM-007H-000G6?item=9SIA2W0K446317" target="_blank" rel="noreferrer"><ExternalLink /> Frame source</a>
      </section>

      <section className="server-database">
        <div className="server-toolbar-copy"><span>FILTERABLE SYSTEM DATABASE</span><h2>{filtered.length} compatible server families</h2><p>Capacities show installed PMem only, not the larger combined DRAM + PMem headline sometimes used by vendors.</p></div>
        <div className="server-filters">
          <label className="search-field large"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search server, Xeon model, socket…" />{search && <button onClick={() => setSearch('')}><X /></button>}</label>
          <select aria-label="Optane generation" value={series} onChange={(event) => setSeries(event.target.value as typeof series)}><option value="all">Both PMem generations</option><option value="100">PMem 100 / Cascade Lake</option><option value="200">PMem 200 / Ice Lake</option></select>
          <select aria-label="Manufacturer" value={manufacturer} onChange={(event) => setManufacturer(event.target.value)}><option value="all">All manufacturers</option>{Array.from(new Set(servers.map((server) => server.manufacturer))).sort().map((maker) => <option key={maker}>{maker}</option>)}</select>
          <select aria-label="Minimum Optane capacity" value={minimumOptaneTb} onChange={(event) => setMinimumOptaneTb(Number(event.target.value))}><option value={0}>Any Optane capacity</option><option value={6}>6 TB+</option><option value={8}>8 TB+</option></select>
          <select aria-label="Minimum PCIe slots" value={minimumPcie} onChange={(event) => setMinimumPcie(Number(event.target.value))}><option value={0}>Any PCIe count</option><option value={6}>6+ slots</option><option value={8}>8+ slots</option></select>
        </div>

        <div className="server-grid">
          {filtered.map((server) => (
            <article className="server-card" key={server.id}>
              <header>
                <div><span>{server.manufacturer} / {server.family}</span><h3>{server.name}</h3></div>
                <b>PMEM {server.optaneSeries}</b>
              </header>
              <p>{server.description}</p>
              <div className="server-primary-specs">
                <div><MemoryStick /><span>MAX OPTANE</span><strong>{capacity(server.maxOptaneGb)}</strong><small>{server.optaneSlots} × 512 GB max</small></div>
                <div><Cpu /><span>PROCESSOR PLATFORM</span><strong>{server.cpuSockets}× {server.cpuSocket}</strong><small>{server.cpuGeneration}</small></div>
                <div><Boxes /><span>EXPANSION</span><strong>{server.pcieSlots} slots</strong><small>PCIe Gen{server.pcieGeneration} · riser-dependent</small></div>
                <div><HardDrive /><span>MEMORY TOPOLOGY</span><strong>{server.dramSlots} DIMM slots</strong><small>{server.memoryChannelsPerCpu} channels / CPU</small></div>
              </div>

              <div className="server-power">
                <div className="server-power__heading"><PlugZap /><span><small>POWER CAPACITY &amp; DRAW</small><strong>{server.powerSupplyOptionsW.join(' / ')} W PSU options</strong></span><b>Actual draw varies</b></div>
                <div className="server-power__numbers">
                  <div><MemoryStick /><span>Optane-only maximum</span><strong>{server.maxOptanePowerW} W</strong><small>{server.optaneSlots} modules × {server.maxOptaneModulePowerW} W budget</small></div>
                  <div><Gauge /><span>CPU + Optane budget</span><strong>{server.cpuAndOptaneBudgetW} W</strong><small>2 × {server.maxCpuTdpW} W CPU TDP + max PMem; not wall draw</small></div>
                </div>
                <p>{server.powerPlanningNote}</p>
                <small>{server.powerRedundancy}</small>
                <a href={server.powerSourceUrl} target="_blank" rel="noreferrer">Official power specification <ExternalLink /></a>
              </div>

              <details className="server-details">
                <summary>CPU models qualified for PMem {server.optaneSeries}<b>{server.supportedCpuModels.length} models</b></summary>
                <p>{server.cpuQualificationNote}</p>
                <div className="cpu-chip-list">{server.supportedCpuModels.map((cpu) => <span key={cpu}>Xeon {cpu}</span>)}</div>
                <a href={server.compatibilitySourceUrl} target="_blank" rel="noreferrer"><BookOpen /> Intel CPU compatibility list</a>
              </details>

              <div className="server-facts">
                <div><span>PCIe layout</span><strong>{server.pcieSlotDetails}</strong></div>
                <div><span>Board</span><strong>{server.boardFormFactor} · {server.boardDimensionsMm}</strong></div>
                <div><span>Complete system size</span><strong>{server.systemDimensionsMm}</strong></div>
                <div className="server-facts__fit"><span>Sluice V2 breakout</span><strong>{fitLabel[server.sluiceV2Fit]}</strong><small>{server.sluiceV2Reason}</small></div>
              </div>

              <div className="server-os">
                <div><CheckCircle2 /><span><strong>Linux supported</strong><small>{server.supportedOs.filter((os) => /RHEL|Ubuntu|SLES|Oracle/.test(os)).join(' · ')}</small></span></div>
                <div><CheckCircle2 /><span><strong>Windows + hypervisors</strong><small>{server.supportedOs.filter((os) => /Windows|VMware/.test(os)).join(' · ')}</small></span></div>
                <p>{server.osQualificationNote}</p>
                <a href={server.sourceUrls.find((url) => /000032860|000094512/.test(url))} target="_blank" rel="noreferrer"><BookOpen /> Intel PMem {server.optaneSeries} operating-system matrix</a>
              </div>

              <div className="server-card__footer">
                <span>DISCONTINUED · CONFIGURATION-DEPENDENT USED PRICE</span>
                <a href={server.specSourceUrl} target="_blank" rel="noreferrer">Official specifications <ExternalLink /></a>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && <div className="empty-state"><Search /><h3>No systems match</h3><p>Reduce the PMem or PCIe threshold.</p></div>}
      </section>
    </main>
  );
}
