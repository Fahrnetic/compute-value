import type { Category, Product } from '../types';

export const categoryLabels: Record<Category, string> = {
  cpu: 'Processors',
  motherboard: 'Motherboards',
  gpu: 'Graphics cards',
  ram: 'Memory',
  'mini-pc': 'Mini AI PCs',
  'server-system': 'Optane servers',
};

export const categorySingular: Record<Category, string> = {
  cpu: 'Processor',
  motherboard: 'Motherboard',
  gpu: 'Graphics card',
  ram: 'Memory kit',
  'mini-pc': 'Mini AI PC',
  'server-system': 'Optane server',
};

export function money(cents: number) {
  if (cents === 0) return 'Quote / used market';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function productSpecs(product: Product): Array<[string, string]> {
  switch (product.category) {
    case 'cpu':
      return product.memoryChannels && product.memoryChannels > 2
        ? [
            ['Socket', product.socket], ['Cores / threads', `${product.cores} / ${product.threads}`],
            ['Architecture', product.architecture ?? 'Workstation'],
            ['Memory I/O', `${product.memoryChannels}×${product.memoryChannelWidthBits ?? 64}-bit @ ${product.memorySpeedMt ?? 0} MT/s`],
            ['PCIe I/O', `${product.pcieLanes ?? 0} lanes · Gen${product.pcieGeneration ?? 4}`],
            ['Power', `${product.basePowerW} W`],
          ]
        : [
            ['Socket', product.socket], ['Cores / threads', `${product.cores} / ${product.threads}`],
            ['Boost', `${product.boostClockGhz} GHz`], ['Memory', product.memoryTypes.join(' / ')],
          ];
    case 'motherboard':
      return product.memoryChannels && product.memoryChannels > 2
        ? [
            ['Socket', product.socket], ['Memory', `${product.memoryChannels}-channel ${product.memoryType}`],
            ['Expansion', product.pcieSlotConfiguration ?? `${product.pcieX16Slots}× PCIe Gen${product.pcieGeneration ?? 4}`],
            ['Networking', product.networkPorts?.join(' + ') ?? 'Integrated LAN'],
            ['Size', product.formFactor], ['DIMMs', String(product.memorySlots)],
          ]
        : [
            ['Socket', product.socket], ['Chipset', product.chipset], ['Memory', product.memoryType],
            ['Size', product.formFactor], ['M.2 slots', String(product.m2Slots)], ['Max RAM', `${product.maxMemoryGb} GB`],
          ];
    case 'gpu':
      return [
        ['VRAM', product.memoryPool === 'split'
          ? `${product.vramGb} GB physical · ${product.addressableVramGb} GB/GPU`
          : `${product.vramGb} GB${product.vramType ? ` ${product.vramType}` : ''}`],
        ['Architecture', product.architecture ?? 'Not researched'],
        ['Interface', product.interface],
        ['Board power', product.boardPowerW ? `${product.boardPowerW} W` : 'OEM-specific'],
        ['Length', product.lengthMm ? `${product.lengthMm} mm` : 'Varies / unpublished'],
        ['Cooling', product.cooling ?? 'Board-specific'],
      ];
    case 'ram':
      return [
        ['Generation', product.memoryType], ['Capacity', `${product.capacityGb} GB (${product.modules} modules)`],
        ['Speed', `${product.speedMt} MT/s`], ['Timing', `CL${product.casLatency}`],
      ];
    case 'mini-pc':
      return [
        ['Processor', product.processor], ['Graphics', product.graphics],
        ['Memory', product.memoryGb ? `${product.memoryGb} GB` : 'Barebone'],
        ['Storage', product.storageGb ? `${product.storageGb / 1024} TB` : 'Barebone'],
        ['NPU', `${product.npuTops} TOPS`], ['RAM access', product.memoryUpgradeable ? 'Upgradeable' : 'Soldered'],
      ];
    case 'server-system':
      return [
        ['Optane', `${product.maxOptaneGb / 1024} TB PMem ${product.optaneSeries}`],
        ['Processors', `${product.cpuSockets}× ${product.cpuSocket}`],
        ['PCIe', `${product.pcieSlots}× Gen${product.pcieGeneration}`],
        ['Board', product.boardFormFactor],
      ];
  }
}
