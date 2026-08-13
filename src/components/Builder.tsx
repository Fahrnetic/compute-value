import { AlertTriangle, CheckCircle2, ChevronRight, CircleDashed, Info, Search, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BuildSelection, BuilderCategory, Product, ValidationResult } from '../types';
import { categorySingular, money } from '../lib/format';
import { ProductCard } from './ProductCard';

const steps: BuilderCategory[] = ['cpu', 'motherboard', 'ram', 'gpu'];
const descriptions: Record<BuilderCategory, string> = {
  cpu: 'The processor determines the socket and available memory generations.',
  motherboard: 'Filtered by CPU socket. The board fixes DDR4 or DDR5 for this build.',
  ram: 'Only kits matching the motherboard and CPU memory generation will pass.',
  gpu: 'PCIe cards are electrically compatible; check VRAM topology, cooling, slot width, case space, and power next.',
};

interface Props {
  products: Product[];
  selection: BuildSelection;
  validation: ValidationResult;
  compatibleIds: Record<string, string[]>;
  onSelection: (selection: BuildSelection) => void;
}

export function Builder({ products, selection, validation, compatibleIds, onSelection }: Props) {
  const firstMissing = steps.find((category) => !selection[category]) ?? 'cpu';
  const [activeCategory, setActiveCategory] = useState<BuilderCategory>(firstMissing);
  const [search, setSearch] = useState('');
  const [compatibleOnly, setCompatibleOnly] = useState(true);
  const [sort, setSort] = useState<'recommended' | 'price-low' | 'price-high'>('recommended');

  const candidates = useMemo(() => {
    let list = products.filter((product) => product.category === activeCategory);
    if (compatibleOnly) {
      const allowed = new Set(compatibleIds[activeCategory] ?? []);
      list = list.filter((product) => allowed.has(product.id) || product.id === selection[activeCategory]);
    }
    const query = search.toLowerCase().trim();
    if (query) list = list.filter((product) => [product.name, product.manufacturer, product.description, ...product.tags,
      'architecture' in product ? product.architecture : '',
      'generation' in product ? product.generation : '',
    ].join(' ').toLowerCase().includes(query));
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price.amountCents - b.price.amountCents);
    if (sort === 'price-high') list = [...list].sort((a, b) => b.price.amountCents - a.price.amountCents);
    return list;
  }, [products, activeCategory, compatibleOnly, compatibleIds, search, sort, selection]);

  const selectedProducts = steps
    .map((category) => products.find((product) => product.id === selection[category]))
    .filter((product): product is Product => Boolean(product));

  function choose(product: Product) {
    const isRemoving = selection[activeCategory] === product.id;
    const next = { ...selection, [activeCategory]: isRemoving ? undefined : product.id };
    onSelection(next);
    if (!isRemoving) {
      const nextStep = steps.slice(steps.indexOf(activeCategory) + 1).find((category) => !next[category]);
      if (nextStep) setActiveCategory(nextStep);
    }
  }

  return (
    <main className="builder-page">
      <section className="builder-intro">
        <div>
          <span className="section-kicker">GUIDED CONFIGURATOR / 01</span>
          <h1>Build with certainty.</h1>
          <p>Choose real parts. Forge checks socket, memory generation, capacity, slots, PCIe, power, and physical follow-ups as you go.</p>
        </div>
        <div className="intro-stat">
          <ShieldCheck />
          <div><strong>{validation.compatible ? 'No conflicts' : 'Conflict found'}</strong><span>Current selection</span></div>
        </div>
      </section>

      <div className="builder-shell">
        <aside className="step-rail">
          <div className="step-rail__header"><span>YOUR BUILD</span><b>{validation.selectedCount}/4</b></div>
          {steps.map((category, index) => {
            const product = products.find((item) => item.id === selection[category]);
            const hasError = validation.issues.some((issue) => issue.severity === 'error' && issue.categories.includes(category));
            return (
              <button key={category} className={`build-step ${activeCategory === category ? 'active' : ''} ${hasError ? 'has-error' : ''}`} onClick={() => { setActiveCategory(category); setSearch(''); }}>
                <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="step-copy">
                  <small>{categorySingular[category]}</small>
                  <strong>{product?.name ?? 'Choose a part'}</strong>
                </span>
                {product ? <CheckCircle2 className="step-status" /> : <CircleDashed className="step-status" />}
              </button>
            );
          })}
          {validation.selectedCount > 0 && (
            <button className="clear-build" onClick={() => onSelection({})}><Trash2 size={14} /> Clear build</button>
          )}
        </aside>

        <section className="part-picker">
          <div className="picker-heading">
            <div><span>STEP {steps.indexOf(activeCategory) + 1} OF 4</span><h2>Choose your {categorySingular[activeCategory].toLowerCase()}</h2><p>{descriptions[activeCategory]}</p></div>
            <div className="result-count"><strong>{candidates.length}</strong><span>matching parts</span></div>
          </div>
          <div className="picker-toolbar">
            <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${categorySingular[activeCategory].toLowerCase()}s`} /></label>
            <label className="compatibility-toggle">
              <input type="checkbox" checked={compatibleOnly} onChange={(event) => setCompatibleOnly(event.target.checked)} />
              <span className="toggle-track"><i /></span>
              Compatible only
            </label>
            <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort products">
              <option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
            </select>
          </div>
          <div className="picker-list">
            {candidates.map((product) => (
              <ProductCard key={product.id} product={product} selected={selection[activeCategory] === product.id} compact onSelect={() => choose(product)} />
            ))}
            {candidates.length === 0 && <div className="empty-state"><Search /><h3>No matching parts</h3><p>Clear the search or turn off “Compatible only” to inspect conflicts.</p></div>}
          </div>
        </section>

        <aside className="build-summary">
          <div className="summary-heading"><span>BUILD SUMMARY</span><b className={validation.compatible ? 'good' : 'bad'}>{validation.compatible ? 'COMPATIBLE' : 'CONFLICT'}</b></div>
          <div className="summary-parts">
            {selectedProducts.length === 0 && <p className="summary-empty">Your selections and compatibility notes will appear here.</p>}
            {selectedProducts.map((product) => (
              <div className="summary-part" key={product.id}>
                <span>{categorySingular[product.category]}</span><strong>{product.name}</strong><b>{money(product.price.amountCents)}</b>
              </div>
            ))}
          </div>

          {validation.issues.length > 0 && (
            <div className="validation-list">
              {validation.issues.map((issue) => (
                <div className={`validation-item ${issue.severity}`} key={issue.code}>
                  {issue.severity === 'error' ? <AlertTriangle /> : issue.severity === 'warning' ? <Info /> : <CheckCircle2 />}
                  <div><strong>{issue.title}</strong><p>{issue.detail}</p></div>
                </div>
              ))}
            </div>
          )}

          {validation.selectedCount > 0 && (
            <div className="power-readout"><Zap /><div><span>Estimated peak load</span><strong>~{validation.power.estimatedLoadW} W</strong></div><div><span>PSU target</span><strong>{validation.power.recommendedPsuW} W</strong></div></div>
          )}
          <div className="summary-total"><span>REFERENCE TOTAL<small>Before tax, shipping, case, PSU & storage</small></span><strong>{money(validation.totalCents)}</strong></div>
          <button className="review-button" disabled={!validation.complete}>Review complete build <ChevronRight /></button>
          <p className="price-disclaimer">Prices are dated references, not live offers. Open the source icon on a part to verify.</p>
        </aside>
      </div>
    </main>
  );
}
