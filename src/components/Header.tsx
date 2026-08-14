import { Boxes, Cpu, Database, Gauge, Menu, Network, Server, Wrench, X } from 'lucide-react';
import { useState } from 'react';

export type View = 'builder' | 'catalog' | 'bandwidth' | 'clusters' | 'mini-pcs' | 'servers';

const navigation: Array<{ view: View; label: string; note: string; icon: typeof Wrench }> = [
  { view: 'builder', label: 'Build', note: 'Compatibility', icon: Wrench },
  { view: 'catalog', label: 'Hardware', note: 'Specs & prices', icon: Database },
  { view: 'bandwidth', label: 'GPU rankings', note: 'AI performance', icon: Gauge },
  { view: 'clusters', label: 'Clusters', note: 'Scale & power', icon: Network },
  { view: 'mini-pcs', label: 'Mini PCs', note: 'Small systems', icon: Cpu },
  { view: 'servers', label: 'Servers', note: 'Optane systems', icon: Server },
];

export function Header({ view, onView }: { view: View; onView: (view: View) => void }) {
  const [open, setOpen] = useState(false);
  const select = (next: View) => { onView(next); setOpen(false); };
  return (
    <header className="site-header">
      <button className="brand" onClick={() => select('builder')} aria-label="Compute Value home">
        <span className="brand-mark"><Boxes size={20} /></span>
        <span className="brand-copy"><strong>COMPUTE VALUE</strong><small>LOCAL HARDWARE LAB</small></span>
      </button>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? 'nav-open' : ''} aria-label="Primary navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              className={view === item.view ? 'active' : ''}
              onClick={() => select(item.view)}
              aria-current={view === item.view ? 'page' : undefined}
            >
              <Icon className="nav-icon" />
              <span className="nav-copy"><strong>{item.label}</strong><small>{item.note}</small></span>
            </button>
          );
        })}
      </nav>
      <span className="header-status"><i /> Research database online</span>
    </header>
  );
}
