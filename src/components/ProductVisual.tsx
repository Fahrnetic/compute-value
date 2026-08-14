import {
  Apple, Box, CircuitBoard, Cpu, Fan, HardDrive, MemoryStick, MonitorUp, Network,
  Server, Sparkles, Zap,
} from 'lucide-react';
import type { Category } from '../types';

const icons: Record<Category, typeof Cpu> = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  gpu: MonitorUp,
  ram: MemoryStick,
  'mini-pc': Sparkles,
  'server-system': Server,
  psu: Zap,
  chassis: Box,
  cooler: Fan,
  storage: HardDrive,
  nic: Network,
  'apple-system': Apple,
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
