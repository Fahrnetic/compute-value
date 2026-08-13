import { Boxes, Menu, X } from 'lucide-react';
import { useState } from 'react';

export type View = 'builder' | 'catalog' | 'bandwidth' | 'clusters' | 'mini-pcs' | 'servers';

export function Header({ view, onView }: { view: View; onView: (view: View) => void }) {
  const [open, setOpen] = useState(false);
  const select = (next: View) => { onView(next); setOpen(false); };
  return (
    <header className="site-header">
      <button className="brand" onClick={() => select('builder')} aria-label="Forge home">
        <span className="brand-mark"><Boxes size={20} /></span>
        <span>FORGE</span>
        <small>PC LAB</small>
      </button>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? 'nav-open' : ''}>
        <button className={view === 'builder' ? 'active' : ''} onClick={() => select('builder')}>Build a PC</button>
        <button className={view === 'catalog' ? 'active' : ''} onClick={() => select('catalog')}>Parts database</button>
        <button className={view === 'bandwidth' ? 'active' : ''} onClick={() => select('bandwidth')}>Performance ranks</button>
        <button className={view === 'clusters' ? 'active' : ''} onClick={() => select('clusters')}>Enterprise clusters</button>
        <button className={view === 'mini-pcs' ? 'active' : ''} onClick={() => select('mini-pcs')}>Mini AI PCs</button>
        <button className={view === 'servers' ? 'active' : ''} onClick={() => select('servers')}>Optane servers</button>
      </nav>
      <span className="header-status"><i /> Compatibility engine online</span>
    </header>
  );
}
