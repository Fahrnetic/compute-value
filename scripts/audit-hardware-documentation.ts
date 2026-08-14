import { allProducts } from '../server/catalog.js';
import { homelabProducts } from '../server/homelab-catalog.js';
import type { Category, Product } from '../src/types.js';

type ProductRecord = Product & Record<string, unknown>;

const baseFields = ['specSourceUrl', 'price.sourceUrl', 'price.observedAt'];

// These are the minimum fields needed to make a safe homelab planning decision.
// Optional marketing features and workload benchmarks deliberately live outside
// this gate because their absence must not be confused with an electrical or fit
// uncertainty.
const requiredFields: Record<Category, string[]> = {
  cpu: [
    'architecture', 'memoryChannels', 'maxMemoryGb', 'memorySpeedMt',
    'memoryModuleTypes', 'eccSupport', 'pcieGeneration', 'pcieLanes',
  ],
  motherboard: [
    'compatibilitySourceUrl', 'memoryChannels', 'eccSupport',
    'registeredMemorySupport', 'pcieGeneration', 'networkPorts',
    'boardDimensionsMm', 'above4gDecoding', 'iommuSupport',
    'auxiliaryPciePower',
  ],
  gpu: [
    'vramType', 'memoryBusBits', 'memoryBandwidthGbS', 'pcieGeneration',
    'pcieLanes', 'boardPowerW', 'recommendedPsuW', 'architecture',
    'generation', 'segment', 'releaseYear',
  ],
  ram: ['registered', 'ecc'],
  'mini-pc': [
    'architecture', 'systemType', 'memoryBandwidthGbS', 'chipTdpW',
    'powerSupplyW',
  ],
  'server-system': [
    'supportedCpuModels', 'memoryChannelsPerCpu', 'maxOptaneGb',
    'pcieGeneration', 'pcieSlotDetails', 'powerSupplyOptionsW',
    'powerPlanningNote', 'boardDimensionsMm', 'systemDimensionsMm',
    'supportedOs', 'sourceUrls',
  ],
  psu: [
    'continuousPowerW', 'efficiencyRating', 'atxVersion', 'formFactor',
    'inputVoltage', 'pcie8PinConnectors', 'native12v2x6Connectors',
    'eps8PinConnectors',
  ],
  chassis: [
    'formFactors', 'maxGpuLengthMm', 'expansionSlots', 'maxGpuSlotWidth',
    'psuFormFactors', 'passiveGpuReady',
  ],
  cooler: ['coolerType', 'supportedSockets', 'thermalCapacityW'],
  storage: ['capacityGb', 'interface', 'formFactor', 'sequentialReadMbS', 'powerW'],
  nic: ['speedGbps', 'ports', 'interface', 'pcieGeneration', 'pcieLanes', 'powerW', 'connector', 'rdma'],
  'apple-system': [
    'systemClass', 'chip', 'cpuCores', 'gpuCores', 'unifiedMemoryGb',
    'memoryBandwidthGbS', 'storageGb', 'maxSystemPowerW', 'upgradeable',
  ],
};

const documentedExceptions = new Map<string, Record<string, string>>([
  ['nvidia-l2', {
    memoryBusBits: 'NVIDIA does not publish a retail board data sheet for this OEM/vGPU product.',
    memoryBandwidthGbS: 'NVIDIA does not publish a retail board data sheet for this OEM/vGPU product.',
  }],
  ['nvidia-rtx-pro-6000d-blackwell-server', {
    memoryBusBits: 'The public vGPU release notes expose framebuffer capacity but the OEM-controlled board specification does not expose the bus.',
    memoryBandwidthGbS: 'The public vGPU release notes expose framebuffer capacity but the OEM-controlled board specification does not expose bandwidth.',
  }],
]);

function readPath(record: ProductRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[key];
  }, record);
}

function present(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return true; // an empty array explicitly documents “none”
  return true; // false and 0 are meaningful documented values
}

function requirements(product: ProductRecord): string[] {
  const fields = [...baseFields, ...requiredFields[product.category]];
  if (product.category === 'motherboard') fields.push('pcieTopology');
  return fields;
}

function hasRequirement(product: ProductRecord, field: string): boolean {
  if (field === 'pcieTopology') {
    return present(product.pcieSlots) || present(product.pcieSlotConfiguration);
  }
  return present(readPath(product, field));
}

const products = [...allProducts, ...homelabProducts] as ProductRecord[];
const duplicateIds = products
  .map((product) => product.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);

if (duplicateIds.length) {
  console.error(`Duplicate catalog IDs: ${[...new Set(duplicateIds)].join(', ')}`);
  process.exit(1);
}

const rows = products.map((product) => {
  const fields = requirements(product);
  const exceptions = documentedExceptions.get(product.id) ?? {};
  const missing = fields.filter((field) => !hasRequirement(product, field) && !exceptions[field]);
  const undisclosed = fields.filter((field) => !hasRequirement(product, field) && exceptions[field]);
  return {
    product,
    fields,
    missing,
    undisclosed,
    percentage: Math.round(((fields.length - missing.length - undisclosed.length) / fields.length) * 100),
  };
});

console.log(`Hardware documentation audit: ${products.length} products`);
for (const category of [...new Set(products.map((product) => product.category))].sort()) {
  const categoryRows = rows.filter((row) => row.product.category === category);
  const complete = categoryRows.filter((row) => row.missing.length === 0).length;
  const average = categoryRows.reduce((sum, row) => sum + row.percentage, 0) / categoryRows.length;
  console.log(`${category.padEnd(15)} ${String(complete).padStart(3)}/${String(categoryRows.length).padEnd(3)} critical-complete · ${average.toFixed(1)}% public-field coverage`);
}

const missingRows = rows.filter((row) => row.missing.length > 0)
  .sort((a, b) => a.percentage - b.percentage || a.product.name.localeCompare(b.product.name));
const undisclosedRows = rows.filter((row) => row.undisclosed.length > 0);

if (undisclosedRows.length) {
  console.log('\nVerified manufacturer-undisclosed fields:');
  for (const row of undisclosedRows) {
    console.log(`- ${row.product.name}: ${row.undisclosed.join(', ')}`);
  }
}

if (missingRows.length) {
  console.error('\nCritical documentation gaps:');
  for (const row of missingRows) {
    console.error(`- ${row.product.name} (${row.product.id}): ${row.missing.join(', ')}`);
  }
  process.exit(1);
}

console.log('\nPASS: every catalog product has the critical public specifications needed for homelab planning, or an explicit manufacturer-undisclosed exception.');
