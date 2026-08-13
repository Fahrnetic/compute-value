import { AlertTriangle, LoaderCircle, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Builder } from './components/Builder';
import { BandwidthRankings } from './components/BandwidthRankings';
import { Catalog } from './components/Catalog';
import { EnterpriseClusters } from './components/EnterpriseClusters';
import { Header, type View } from './components/Header';
import { MiniPcExplorer } from './components/MiniPcExplorer';
import { ServerExplorer } from './components/ServerExplorer';
import { fetchCatalog, fetchCompatible } from './lib/api';
import type { BuildSelection, CatalogResponse, ValidationResult } from './types';

const emptyValidation: ValidationResult = {
  compatible: true, complete: false, issues: [], totalCents: 0, selectedCount: 0,
  missing: ['cpu', 'motherboard', 'gpu', 'ram'], power: { estimatedLoadW: 80, recommendedPsuW: 0 },
};

const viewFromHash = (): View => {
  const value = window.location.hash.replace('#/', '');
  return value === 'catalog' || value === 'bandwidth' || value === 'clusters' || value === 'mini-pcs' || value === 'servers' ? value : 'builder';
};

export default function App() {
  const [view, setViewState] = useState<View>(viewFromHash);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selection, setSelectionState] = useState<BuildSelection>(() => {
    try { return JSON.parse(localStorage.getItem('forge-build') ?? '{}') as BuildSelection; }
    catch { return {}; }
  });
  const [validation, setValidation] = useState(emptyValidation);
  const [compatibleIds, setCompatibleIds] = useState<Record<string, string[]>>({});

  const loadCatalog = () => {
    setLoading(true); setError('');
    fetchCatalog().then(setCatalog).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  };

  useEffect(loadCatalog, []);
  useEffect(() => {
    const onHash = () => setViewState(viewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!catalog) return;
    let active = true;
    fetchCompatible(selection).then((result) => {
      if (active) { setCompatibleIds(result.compatibleIds); setValidation(result.validation); }
    }).catch((reason: Error) => active && setError(reason.message));
    return () => { active = false; };
  }, [selection, catalog]);

  const setView = (next: View) => {
    window.location.hash = `/${next}`;
    setViewState(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setSelection = (next: BuildSelection) => {
    const clean = Object.fromEntries(Object.entries(next).filter(([, value]) => Boolean(value))) as BuildSelection;
    setSelectionState(clean);
    localStorage.setItem('forge-build', JSON.stringify(clean));
  };

  const page = useMemo(() => {
    if (!catalog) return null;
    if (view === 'catalog') return <Catalog products={catalog.products} lastUpdated={catalog.meta.lastUpdated} benchmarkMeta={catalog.meta.benchmarks} />;
    if (view === 'bandwidth') return <BandwidthRankings products={catalog.products} />;
    if (view === 'clusters') return <EnterpriseClusters />;
    if (view === 'mini-pcs') return <MiniPcExplorer products={catalog.products} />;
    if (view === 'servers') return <ServerExplorer products={catalog.products} />;
    return <Builder products={catalog.products} selection={selection} validation={validation} compatibleIds={compatibleIds} onSelection={setSelection} />;
  }, [catalog, view, selection, validation, compatibleIds]);

  if (loading) return <div className="app-state"><LoaderCircle className="spin" /><strong>Loading the hardware database</strong><span>Checking sockets and memory generations…</span></div>;
  if (error || !catalog) return <div className="app-state error"><AlertTriangle /><strong>The catalog could not be loaded</strong><span>{error || 'Unknown error'}</span><button onClick={loadCatalog}><RefreshCw /> Try again</button></div>;

  return (
    <div className="app">
      <Header view={view} onView={setView} />
      {page}
      <footer><div className="brand footer-brand"><span className="brand-mark">F</span><span>FORGE</span></div><p>Compatibility-aware hardware research. Prices are dated references—verify before purchasing.</p><span>{catalog.meta.total} products · SQLite-backed</span></footer>
    </div>
  );
}
