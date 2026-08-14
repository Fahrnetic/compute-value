import type { Category, Product } from '../types';

export const categoryLabels: Record<Category, string> = {
  cpu: 'Processors',
  motherboard: 'Motherboards',
  gpu: 'Graphics cards',
  ram: 'Memory',
  'mini-pc': 'Mini AI PCs',
  'server-system': 'Optane servers',
  psu: 'Power supplies',
  chassis: 'Cases & chassis',
  cooler: 'CPU coolers',
  storage: 'Storage',
  nic: 'Network adapters',
  'apple-system': 'Apple systems',
};

export const categorySingular: Record<Category, string> = {
  cpu: 'Processor',
  motherboard: 'Motherboard',
  gpu: 'Graphics card',
  ram: 'Memory kit',
  'mini-pc': 'Mini AI PC',
  'server-system': 'Optane server',
  psu: 'Power supply',
  chassis: 'Case or chassis',
  cooler: 'CPU cooler',
  storage: 'Storage device',
  nic: 'Network adapter',
  'apple-system': 'Apple system',
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
    case 'psu':
      return [
        ['Output', `${product.continuousPowerW} W continuous`], ['Efficiency', product.efficiencyRating],
        ['Standard', `ATX ${product.atxVersion}`], ['12V-2x6', String(product.native12v2x6Connectors)],
        ['PCIe 8-pin', String(product.pcie8PinConnectors)], ['Input', product.inputVoltage],
      ];
    case 'chassis':
      return [
        ['Motherboards', product.formFactors.join(' / ')], ['GPU clearance', `${product.maxGpuLengthMm} mm`],
        ['Expansion', `${product.expansionSlots} slots`], ['GPU width', `Up to ${product.maxGpuSlotWidth} slots`],
        ['Power supplies', product.psuFormFactors.join(' / ')], ['Passive GPUs', product.passiveGpuReady ? 'Supported' : 'Active cooling required'],
      ];
    case 'cooler':
      return [
        ['Type', product.coolerType.replace('-', ' ')], ['Sockets', product.supportedSockets.join(' / ')],
        ['Thermal capacity', `${product.thermalCapacityW} W`],
        [product.radiatorSizeMm ? 'Radiator' : 'Height', product.radiatorSizeMm ? `${product.radiatorSizeMm} mm` : `${product.heightMm ?? 0} mm`],
      ];
    case 'storage':
      return [
        ['Capacity', `${product.capacityGb / 1000} TB`], ['Interface', product.interface],
        ['Form factor', product.formFactor], ['Sequential read', `${product.sequentialReadMbS.toLocaleString()} MB/s`],
        ['Endurance', product.enduranceTbw ? `${product.enduranceTbw.toLocaleString()} TBW` : 'Not listed'], ['Power', `${product.powerW} W`],
      ];
    case 'nic':
      return [
        ['Link speed', `${product.speedGbps} Gb/s`], ['Ports', String(product.ports)],
        ['Interface', product.interface], ['Connector', product.connector],
        ['RDMA', product.rdma ? 'Yes' : 'No'], ['Power', `${product.powerW} W`],
      ];
    case 'apple-system':
      return [
        ['Chip', product.chip], ['Unified memory', `${product.unifiedMemoryGb} GB`],
        ['Memory bandwidth', `${product.memoryBandwidthGbS} GB/s`], ['GPU', `${product.gpuCores} cores`],
        ['Storage', `${product.storageGb / 1000} TB`], ['Maximum system power', `${product.maxSystemPowerW} W`],
      ];
  }
}
