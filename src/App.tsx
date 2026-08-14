import { AlertTriangle, Database, GitFork, HeartHandshake, LoaderCircle, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BandwidthRankings } from './components/BandwidthRankings';
import { AppleSystems } from './components/AppleSystems';
import { Catalog } from './components/Catalog';
import { EnterpriseClusters } from './components/EnterpriseClusters';
import { Header, type View } from './components/Header';
import { HomelabGuide } from './components/HomelabGuide';
import { HomelabPlanner } from './components/HomelabPlanner';
import { MiniPcExplorer } from './components/MiniPcExplorer';
import { ServerExplorer } from './components/ServerExplorer';
import { fetchCatalog } from './lib/api';
import type { CatalogResponse } from './types';

const viewFromHash = (): View => {
  const value = window.location.hash.replace('#/', '');
  return value === 'catalog' || value === 'bandwidth' || value === 'clusters' || value === 'apple'
    || value === 'mini-pcs' || value === 'servers' || value === 'guide' ? value : 'builder';
};

export default function App() {
  const [view, setViewState] = useState<View>(viewFromHash);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);

  const setView = (next: View) => {
    window.location.hash = `/${next}`;
    setViewState(next);
  };

  const page = useMemo(() => {
    if (!catalog) return null;
    if (view === 'catalog') return <Catalog products={catalog.products} lastUpdated={catalog.meta.lastUpdated} benchmarkMeta={catalog.meta.benchmarks} />;
    if (view === 'bandwidth') return <BandwidthRankings products={catalog.products} />;
    if (view === 'clusters') return <EnterpriseClusters />;
    if (view === 'apple') return <AppleSystems products={catalog.products} />;
    if (view === 'mini-pcs') return <MiniPcExplorer products={catalog.products} />;
    if (view === 'servers') return <ServerExplorer products={catalog.products} />;
    if (view === 'guide') return <HomelabGuide onBuild={() => setView('builder')} />;
    return <HomelabPlanner products={catalog.products} />;
  }, [catalog, view]);

  if (loading) return <div className="app-state"><LoaderCircle className="spin" /><strong>Loading the hardware database</strong><span>Checking sockets and memory generations…</span></div>;
  if (error || !catalog) return <div className="app-state error"><AlertTriangle /><strong>The catalog could not be loaded</strong><span>{error || 'Unknown error'}</span><button onClick={loadCatalog}><RefreshCw /> Try again</button></div>;

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header view={view} onView={setView} />
      <div id="main-content">{page}</div>
      <footer className="site-footer">
        <div className="site-footer__brand">
          <span className="brand-mark"><Database size={17} /></span>
          <span><strong>COMPUTE VALUE</strong><small>Independent local-compute research</small></span>
        </div>
        <p>Open hardware data for choosing capable, affordable local systems. Prices are dated references and modeled results are always separated from measurements.</p>
        <div className="site-footer__actions">
          <a href="https://github.com/Fahrnetic/compute-value" target="_blank" rel="noreferrer"><GitFork /> Contribute on GitHub</a>
          <span><HeartHandshake /> Built for the community</span>
        </div>
        <div className="site-footer__meta"><span>{catalog.meta.total} products</span><span>SQLite-backed</span><span>Source-linked</span></div>
      </footer>
    </div>
  );
}
