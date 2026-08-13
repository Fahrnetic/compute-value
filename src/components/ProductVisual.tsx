import { CircuitBoard, Cpu, MemoryStick, MonitorUp, Server, Sparkles } from 'lucide-react';
import type { Category } from '../types';

const icons = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  gpu: MonitorUp,
  ram: MemoryStick,
  'mini-pc': Sparkles,
  'server-system': Server,
};

export function ProductVisual({ category, manufacturer, large = false }: { category: Category; manufacturer: string; large?: boolean }) {
  const Icon = icons[category];
  return (
    <div className={`product-visual product-visual--${category} ${large ? 'product-visual--large' : ''}`} aria-hidden="true">
      <span className="visual-grid" />
      <Icon strokeWidth={1.35} />
      <span className="visual-maker">{manufacturer.slice(0, 3).toUpperCase()}</span>
    </div>
  );
}
