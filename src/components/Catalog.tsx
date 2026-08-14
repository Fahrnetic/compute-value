import { Database, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { type CSSProperties, useMemo, useState } from 'react';
import type { Category, Product } from '../types';
import { categoryLabels } from '../lib/format';
import { ProductCard } from './ProductCard';

const categories: Category[] = ['cpu', 'motherboard', 'gpu', 'ram'];

export function Catalog({ products, lastUpdated, benchmarkMeta }: {
  products: Product[];
  lastUpdated: string;
  benchmarkMeta: { results: number; products: number; lastUpdated: string };
}) {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [memory, setMemory] = useState<'all' | 'DDR4' | 'DDR5'>('all');
  const [socket, setSocket] = useState('all');
  const [maxPrice, setMaxPrice] = useState(12000);
  const [manufacturer, setManufacturer] = useState('all');
  const [gpuSegment, setGpuSegment] = useState<'all' | 'consumer' | 'workstation' | 'data-center'>('all');
  const [minimumVram, setMinimumVram] = useState(0);
  const [benchmarkCoverage, setBenchmarkCoverage] = useState<'all' | 'published' | 'missing'>('all');
  const [optaneCpu, setOptaneCpu] = useState<'all' | '100' | '200' | 'none'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const desktopProducts = products.filter((product) => product.category !== 'mini-pc' && product.category !== 'server-system');
  const sockets = Array.from(new Set(desktopProducts.flatMap((product) => 'socket' in product ? [product.socket] : []))).sort();
  const filtered = useMemo(() => desktopProducts.filter((product) => {
    if (category !== 'all' && product.category !== category) return false;
    if (product.price.amountCents > maxPrice * 100) return false;
    if (manufacturer !== 'all' && product.manufacturer !== manufacturer) return false;
    if (gpuSegment !== 'all' && (product.category !== 'gpu' || product.segment !== gpuSegment)) return false;
    if (minimumVram > 0 && (product.category !== 'gpu' || product.vramGb < minimumVram)) return false;
    if (benchmarkCoverage !== 'all') {
      if (product.category !== 'cpu' && product.category !== 'gpu') return false;
      const hasScore = (product.benchmarks?.length ?? 0) > 0;
      if (benchmarkCoverage === 'published' && !hasScore) return false;
      if (benchmarkCoverage === 'missing' && hasScore) return false;
    }
    if (optaneCpu !== 'all') {
      if (product.category !== 'cpu') return false;
      if (optaneCpu === 'none' && product.optanePmemSeries) return false;
      if (optaneCpu !== 'none' && product.optanePmemSeries !== optaneCpu) return false;
    }
    if (search && ![product.name, product.manufacturer, product.description, ...product.tags,
      'architecture' in product ? product.architecture : '',
      'generation' in product ? product.generation : '',
    ].join(' ').toLowerCase().includes(search.toLowerCase())) return false;
    if (socket !== 'all' && (!('socket' in product) || product.socket !== socket)) return false;
    if (memory !== 'all') {
      if (product.category === 'cpu' && !product.memoryTypes.includes(memory)) return false;
      if (product.category === 'motherboard' && product.memoryType !== memory) return false;
      if (product.category === 'ram' && product.memoryType !== memory) return false;
      if (product.category === 'gpu') return false;
    }
    return true;
  }), [desktopProducts, category, maxPrice, search, socket, memory, manufacturer, gpuSegment, minimumVram, benchmarkCoverage, optaneCpu]);

  const activeFilterCount = Number(category !== 'all') + Number(memory !== 'all') + Number(socket !== 'all')
    + Number(maxPrice < 12000) + Number(manufacturer !== 'all') + Number(gpuSegment !== 'all')
    + Number(minimumVram > 0) + Number(benchmarkCoverage !== 'all') + Number(optaneCpu !== 'all');
  const reset = () => { setCategory('all'); setMemory('all'); setSocket('all'); setMaxPrice(12000); setManufacturer('all'); setGpuSegment('all'); setMinimumVram(0); setBenchmarkCoverage('all'); setOptaneCpu('all'); setSearch(''); };
  const categoryCount = (item: Category) => desktopProducts.filter((product) => product.category === item).length;
  const benchmarkCoveragePercent = Math.round((benchmarkMeta.products / Math.max(desktopProducts.length, 1)) * 100);

  return (
    <main className="catalog-page">
      <section className="page-hero catalog-hero">
        <div><span className="section-kicker">STRUCTURED HARDWARE DATA / 02</span><h1>Find the hardware that fits the work.</h1><p>Browse normalized specifications, dated reference prices, and sourced performance evidence. Every card keeps capacity, speed, cost, power, and confidence in view.</p></div>
        <div className="database-stamp"><Database /><strong>{desktopProducts.length}</strong><span>catalog parts<br />updated {lastUpdated}</span></div>
      </section>
      <section className="catalog-overview" aria-label="Catalog coverage">
        {categories.map((item) => (
          <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(category === item ? 'all' : item)}>
            <span>{categoryLabels[item]}</span><strong>{categoryCount(item)}</strong><small>records</small>
          </button>
        ))}
        <div className="catalog-overview__coverage">
          <span>Benchmark coverage</span><strong>{benchmarkMeta.results}</strong><small>{benchmarkCoveragePercent}% of catalog products represented</small>
          <i style={{ '--coverage': `${Math.min(benchmarkCoveragePercent, 100)}%` } as CSSProperties} />
        </div>
      </section>
      <div className="catalog-toolbar">
        <label className="search-field large"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search model, maker, chipset, feature…" />{search && <button onClick={() => setSearch('')}><X /></button>}</label>
        <button className="filter-mobile" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal /> Filters {activeFilterCount > 0 && <b>{activeFilterCount}</b>}</button>
      </div>
      <div className="catalog-shell">
        <aside className={`catalog-filters ${filtersOpen ? 'is-open' : ''}`}>
          <div className="filter-title"><span><Filter /> FILTERS</span>{activeFilterCount > 0 && <button onClick={reset}>Reset all</button>}</div>
          <fieldset><legend>Category</legend>
            <label><input type="radio" checked={category === 'all'} onChange={() => setCategory('all')} /> All parts <b>{desktopProducts.length}</b></label>
            {categories.map((item) => <label key={item}><input type="radio" checked={category === item} onChange={() => setCategory(item)} /> {categoryLabels[item]} <b>{categoryCount(item)}</b></label>)}
          </fieldset>
          <fieldset><legend>Memory generation</legend>
            {(['all', 'DDR4', 'DDR5'] as const).map((item) => <label key={item}><input type="radio" checked={memory === item} onChange={() => setMemory(item)} /> {item === 'all' ? 'Any memory' : item}</label>)}
          </fieldset>
          <fieldset><legend>CPU socket</legend><select value={socket} onChange={(event) => setSocket(event.target.value)}><option value="all">Any socket</option>{sockets.map((item) => <option key={item}>{item}</option>)}</select></fieldset>
          <fieldset><legend>Manufacturer</legend><select value={manufacturer} onChange={(event) => setManufacturer(event.target.value)}><option value="all">Any manufacturer</option>{Array.from(new Set(desktopProducts.map((product) => product.manufacturer))).sort().map((item) => <option key={item}>{item}</option>)}</select></fieldset>
          <fieldset><legend>GPU market</legend><select value={gpuSegment} onChange={(event) => setGpuSegment(event.target.value as typeof gpuSegment)}><option value="all">Any GPU market</option><option value="consumer">Consumer</option><option value="workstation">Workstation</option><option value="data-center">Data center</option></select></fieldset>
          <fieldset><legend>Minimum GPU VRAM</legend><select value={minimumVram} onChange={(event) => setMinimumVram(Number(event.target.value))}><option value={0}>Any capacity</option><option value={24}>24 GB+</option><option value={32}>32 GB+</option><option value={48}>48 GB+</option><option value={80}>80 GB+</option></select></fieldset>
          <fieldset><legend>CPU / GPU benchmarks</legend><select value={benchmarkCoverage} onChange={(event) => setBenchmarkCoverage(event.target.value as typeof benchmarkCoverage)}><option value="all">Any coverage</option><option value="published">Published score</option><option value="missing">Not yet tested</option></select></fieldset>
          <fieldset><legend>Intel Optane CPU</legend><select value={optaneCpu} onChange={(event) => setOptaneCpu(event.target.value as typeof optaneCpu)}><option value="all">Any processor</option><option value="100">PMem 100 compatible</option><option value="200">PMem 200 compatible</option><option value="none">Non-Optane CPUs</option></select></fieldset>
          <fieldset><legend>Maximum reference price</legend><div className="range-value">Up to <strong>${maxPrice.toLocaleString()}</strong></div><input className="price-range" type="range" min="100" max="12000" step="100" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></fieldset>
        </aside>
        <section className="catalog-results">
          <div className="results-heading"><div><strong>{filtered.length}</strong><span>matching records</span></div><span>{activeFilterCount > 0 ? `${activeFilterCount} active filters` : 'Complete catalog'} · {benchmarkMeta.results} sourced scores · snapshot {benchmarkMeta.lastUpdated} · USD references</span></div>
          <div className="catalog-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          {filtered.length === 0 && <div className="empty-state"><Search /><h3>No hardware matches</h3><p>Try widening the price or compatibility filters.</p><button onClick={reset}>Reset filters</button></div>}
        </section>
      </div>
    </main>
  );
}
