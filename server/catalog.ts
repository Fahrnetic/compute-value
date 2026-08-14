import type { Cpu, Gpu, MiniPc, Motherboard, Product, Ram, ServerSystem } from '../src/types.js';
import { userExcludedGpuIds } from './llm-benchmarks.js';
import {
  cascadeLakeSpecUrl,
  optane100CompatibilityUrl,
  optane100CpuModels,
  optane200CompatibilityUrl,
  optane200CpuModels,
  optaneCpuSpecs,
  thirdGenXeonSpecUrl,
} from './optane-cpus.js';

export { optane100CpuModels, optane200CpuModels };

const observedAt = '2026-08-10';
const mc62CpuQvl = 'https://download.gigabyte.com/FileList/QVL/mb_qvl_MC62-G40_G41_v1.2.pdf';
const asusWrx80CpuSupport = 'https://www.asus.com/motherboards-components/motherboards/workstation/pro-ws-wrx80e-sage-se-wifi/helpdesk_cpu?model2Name=Pro-WS-WRX80E-SAGE-SE-WIFI';
const asusWrx90CpuSupport = 'https://www.asus.com/motherboards-components/motherboards/workstation/pro-ws-wrx90e-sage-se/helpdesk_qvl_cpu?model2Name=Pro-WS-WRX90E-SAGE-SE';
const threadripper5000Pricing = 'https://www.tomshardware.com/reviews/amd-threadripper-pro-5995wx-5975wx-cpu-review';
const threadripper3000Pricing = 'https://www.tomshardware.com/news/amd-threadripper-pro-retail-pricing-6000-64-cores-3000-32-cores';
const threadripper7000Pricing = 'https://www.tomshardware.com/news/amd-announces-threadripper-hedt-and-pro-7000-wx-series-processors-96-cores-and-192-threads-for-desktops-and-workstations';
const threadripper9000Pricing = 'https://www.amd.com/en/blogs/2025/amd-introduces-new-zen-5-based-ryzen-threadripper-pro.html';
const mc62Manual = 'https://download.gigabyte.com/FileList/Manual/server_manual__MC62-G40_e_1001.pdf';
const optane100CpuSource = optane100CompatibilityUrl;
const optane200CpuSource = optane200CompatibilityUrl;
const optane100OsSource = 'https://www.intel.com/content/www/us/en/support/articles/000032860/technologies/memory-and-storage/intel-optane-persistent-memory.html';
const optane200OsSource = 'https://www.intel.com/content/www/us/en/support/articles/000094512/technologies/memory-and-storage/intel-optane-persistent-memory.html';
const sluiceV2Source = 'https://www.newegg.com/p/2AM-007H-000G6?item=9SIA2W0K446317';

// AMD specifies the same full workstation I/O die across every MC62-G40-qualified
// Threadripper PRO 3000 WX and 5000 WX model. Bandwidth values are theoretical,
// one-direction payload rates before protocol and workload overhead.
const threadripperProIo = {
  memoryChannels: 8,
  memoryChannelWidthBits: 64,
  memoryBusWidthBits: 512,
  maxMemoryGb: 2048,
  memorySpeedMt: 3200,
  theoreticalMemoryBandwidthGbS: 204.8,
  memoryModuleTypes: ['ECC UDIMM', 'RDIMM', 'LRDIMM'],
  eccSupport: true,
  pcieGeneration: 4,
  pcieLanes: 128,
  pcieLaneRateGtS: 16,
  pciePayloadGbSPerLane: 1.969,
  theoreticalPcieBandwidthGbS: 252.1,
} satisfies Partial<Cpu>;

const threadripperPro7000Io = {
  memoryChannels: 8,
  memoryChannelWidthBits: 64,
  memoryBusWidthBits: 512,
  maxMemoryGb: 2048,
  memorySpeedMt: 5200,
  theoreticalMemoryBandwidthGbS: 332.8,
  memoryModuleTypes: ['ECC RDIMM'],
  eccSupport: true,
  pcieGeneration: 5,
  pcieLanes: 128,
  pcieTotalLanes: 148,
  pcieUsableLanes: 144,
  pcieLaneRateGtS: 32,
  pciePayloadGbSPerLane: 3.938,
  theoreticalPcieBandwidthGbS: 504.1,
} satisfies Partial<Cpu>;

const threadripperPro9000Io = {
  ...threadripperPro7000Io,
  memorySpeedMt: 6400,
  theoreticalMemoryBandwidthGbS: 409.6,
} satisfies Partial<Cpu>;

// Desktop-platform I/O shared by the lightly documented mainstream CPUs below.
// The lane counts are the vendor-published usable expansion/storage lanes; total
// package lanes are retained separately where the vendor exposes both figures.
const amdAm5DesktopIo = {
  architecture: 'Zen 5',
  memoryChannels: 2,
  memoryChannelWidthBits: 64,
  memoryBusWidthBits: 128,
  maxMemoryGb: 256,
  memorySpeedMt: 5600,
  theoreticalMemoryBandwidthGbS: 89.6,
  memoryModuleTypes: ['UDIMM'],
  eccSupport: true,
  pcieGeneration: 5,
  pcieLanes: 24,
  pcieTotalLanes: 28,
  pcieUsableLanes: 24,
} satisfies Partial<Cpu>;

const amdAm4DesktopIo = {
  architecture: 'Zen 3',
  memoryChannels: 2,
  memoryChannelWidthBits: 64,
  memoryBusWidthBits: 128,
  maxMemoryGb: 128,
  memorySpeedMt: 3200,
  theoreticalMemoryBandwidthGbS: 51.2,
  memoryModuleTypes: ['UDIMM'],
  eccSupport: true,
  pcieGeneration: 4,
  pcieLanes: 20,
  pcieTotalLanes: 24,
  pcieUsableLanes: 20,
} satisfies Partial<Cpu>;

const intelArrowLakeDesktopIo = {
  architecture: 'Arrow Lake',
  memoryChannels: 2,
  memoryChannelWidthBits: 64,
  memoryBusWidthBits: 128,
  maxMemoryGb: 256,
  memorySpeedMt: 6400,
  theoreticalMemoryBandwidthGbS: 102.4,
  memoryModuleTypes: ['UDIMM', 'CUDIMM'],
  eccSupport: true,
  pcieGeneration: 5,
  pcieLanes: 24,
  pcieTotalLanes: 24,
  pcieUsableLanes: 24,
} satisfies Partial<Cpu>;

const intelRaptorLakeRefreshIo = {
  architecture: 'Raptor Lake Refresh',
  memoryChannels: 2,
  memoryChannelWidthBits: 64,
  memoryBusWidthBits: 128,
  maxMemoryGb: 192,
  memorySpeedMt: 5600,
  theoreticalMemoryBandwidthGbS: 89.6,
  memoryModuleTypes: ['UDIMM'],
  eccSupport: true,
  pcieGeneration: 5,
  pcieLanes: 20,
  pcieTotalLanes: 20,
  pcieUsableLanes: 20,
} satisfies Partial<Cpu>;

const price = (
  amount: number,
  priceType: 'MSRP' | 'store' | 'reference',
  retailer: string,
  sourceUrl: string,
) => ({ amountCents: Math.round(amount * 100), currency: 'USD' as const, priceType, retailer, sourceUrl, observedAt });

const optaneCpus: Cpu[] = optaneCpuSpecs.map((spec) => {
  const id = `intel-xeon-${spec.model.toLowerCase().replace(/ /g, '-')}`;
  const compatibilitySourceUrl = spec.optaneSeries === '100' ? optane100CpuSource : optane200CpuSource;
  const specSourceUrl = spec.optaneSeries === '100' ? cascadeLakeSpecUrl : thirdGenXeonSpecUrl;
  const memoryBandwidth = Number((spec.memoryChannels * 8 * spec.memorySpeedMt / 1000).toFixed(1));
  const pciePayloadPerLane = spec.pcieGeneration === 4 ? 1.969 : 0.985;
  return {
    id,
    category: 'cpu',
    manufacturer: 'Intel',
    name: `Xeon ${spec.model}`,
    description: `${spec.cores}-core ${spec.architecture} server CPU explicitly listed by Intel for Optane PMem ${spec.optaneSeries}; ranked #${spec.aiRankWithinOptane} of ${spec.aiRankTotal} Optane CPUs for local CPU/MoE inference suitability.`,
    socket: spec.optaneSeries === '100' ? 'LGA3647' : 'LGA4189',
    cores: spec.cores,
    threads: spec.threads,
    boostClockGhz: spec.boostClockGhz,
    basePowerW: spec.tdpW,
    memoryTypes: ['DDR4'],
    integratedGraphics: false,
    architecture: spec.architecture,
    series: `${spec.optaneSeries === '100' ? '2nd' : '3rd'} Gen Xeon Scalable`,
    baseClockGhz: spec.baseClockGhz,
    l3CacheMb: spec.l3CacheMb,
    memoryChannels: spec.memoryChannels,
    memoryChannelWidthBits: 64,
    memoryBusWidthBits: spec.memoryChannels * 64,
    maxMemoryGb: spec.maxMemoryGb,
    memorySpeedMt: spec.memorySpeedMt,
    theoreticalMemoryBandwidthGbS: memoryBandwidth,
    memoryModuleTypes: spec.architecture === 'Cascade Lake' ? ['ECC RDIMM', 'LRDIMM', 'Optane PMem'] : ['ECC RDIMM', 'Optane PMem'],
    eccSupport: true,
    pcieGeneration: spec.pcieGeneration,
    pcieLanes: spec.pcieLanes,
    pcieLaneRateGtS: spec.pcieGeneration === 4 ? 16 : 8,
    pciePayloadGbSPerLane: pciePayloadPerLane,
    theoreticalPcieBandwidthGbS: Number((spec.pcieLanes * pciePayloadPerLane).toFixed(1)),
    launchDate: spec.architecture === 'Cascade Lake' ? '2019-04-02' : spec.architecture === 'Cooper Lake' ? '2020-06-18' : '2021-04-06',
    serverOnly: true,
    optanePmemSeries: spec.optaneSeries,
    optaneCompatibilityStatus: 'Intel-listed',
    nativeBfloat16: spec.nativeBfloat16,
    vectorExtensions: spec.nativeBfloat16 ? ['AVX-512', 'VNNI', 'AVX-512 BF16'] : ['AVX-512', 'VNNI'],
    aiInferenceTier: spec.aiInferenceTier,
    aiGpuHostTier: spec.aiGpuHostTier,
    aiRankWithinOptane: spec.aiRankWithinOptane,
    aiRankTotal: spec.aiRankTotal,
    aiAssessment: spec.aiAssessment,
    price: price(0, 'reference', 'Discontinued / used market', compatibilitySourceUrl),
    tags: [`Optane PMem ${spec.optaneSeries}`, `AI tier ${spec.aiInferenceTier}`, `${spec.memoryChannels}-channel DDR4`, 'Server-only'],
    specSourceUrl,
    compatibilitySourceUrl,
  };
});

type Str5ThreadripperSpec = {
  model: string;
  architecture: 'Zen 4' | 'Zen 5';
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number;
  l3CacheMb: number;
  launchPrice: number;
};

function str5Threadripper(spec: Str5ThreadripperSpec): Cpu {
  const is9000 = spec.architecture === 'Zen 5';
  const generation = is9000 ? '9000' : '7000';
  const modelSlug = spec.model.toLowerCase();
  const specSourceUrl = is9000
    ? `https://www.amd.com/en/products/processors/workstations/ryzen-threadripper/9000-wx-series/amd-ryzen-threadripper-pro-${modelSlug}.html`
    : `https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/amd-ryzen-threadripper-pro-7000-wx-series/amd-ryzen-threadripper-pro-${modelSlug}.html`;
  return {
    id: `amd-threadripper-pro-${modelSlug}`,
    category: 'cpu',
    manufacturer: 'AMD',
    name: `Ryzen Threadripper PRO ${spec.model}`,
    description: `${spec.cores}-core ${spec.architecture} workstation CPU with eight-channel DDR5 and 128 PCIe Gen5 lanes for WRX90 multi-GPU systems.`,
    socket: 'sTR5',
    cores: spec.cores,
    threads: spec.threads,
    boostClockGhz: spec.boostClockGhz,
    basePowerW: 350,
    memoryTypes: ['DDR5'],
    integratedGraphics: false,
    architecture: spec.architecture,
    series: `Threadripper PRO ${generation} WX`,
    baseClockGhz: spec.baseClockGhz,
    l3CacheMb: spec.l3CacheMb,
    ...(is9000 ? threadripperPro9000Io : threadripperPro7000Io),
    vendorLockRisk: true,
    launchDate: is9000 ? '2025-07-23' : '2023-10-19',
    price: price(spec.launchPrice, 'MSRP', 'Launch SEP', is9000 ? threadripper9000Pricing : threadripper7000Pricing),
    tags: ['ASUS WRX90 QVL', `${spec.cores} cores`, 'Local AI'],
    specSourceUrl,
    compatibilitySourceUrl: asusWrx90CpuSupport,
  };
}

export const cpus: Cpu[] = [
  str5Threadripper({ model: '9995WX', architecture: 'Zen 5', cores: 96, threads: 192, baseClockGhz: 2.5, boostClockGhz: 5.4, l3CacheMb: 384, launchPrice: 11699 }),
  str5Threadripper({ model: '9985WX', architecture: 'Zen 5', cores: 64, threads: 128, baseClockGhz: 3.2, boostClockGhz: 5.4, l3CacheMb: 256, launchPrice: 7999 }),
  str5Threadripper({ model: '9975WX', architecture: 'Zen 5', cores: 32, threads: 64, baseClockGhz: 4.0, boostClockGhz: 5.4, l3CacheMb: 128, launchPrice: 4099 }),
  str5Threadripper({ model: '9965WX', architecture: 'Zen 5', cores: 24, threads: 48, baseClockGhz: 4.2, boostClockGhz: 5.4, l3CacheMb: 128, launchPrice: 2899 }),
  str5Threadripper({ model: '9955WX', architecture: 'Zen 5', cores: 16, threads: 32, baseClockGhz: 4.5, boostClockGhz: 5.4, l3CacheMb: 64, launchPrice: 1649 }),
  str5Threadripper({ model: '7995WX', architecture: 'Zen 4', cores: 96, threads: 192, baseClockGhz: 2.5, boostClockGhz: 5.1, l3CacheMb: 384, launchPrice: 9999 }),
  str5Threadripper({ model: '7985WX', architecture: 'Zen 4', cores: 64, threads: 128, baseClockGhz: 3.2, boostClockGhz: 5.1, l3CacheMb: 256, launchPrice: 7349 }),
  str5Threadripper({ model: '7975WX', architecture: 'Zen 4', cores: 32, threads: 64, baseClockGhz: 4.0, boostClockGhz: 5.3, l3CacheMb: 128, launchPrice: 3899 }),
  str5Threadripper({ model: '7965WX', architecture: 'Zen 4', cores: 24, threads: 48, baseClockGhz: 4.2, boostClockGhz: 5.3, l3CacheMb: 128, launchPrice: 2649 }),
  str5Threadripper({ model: '7955WX', architecture: 'Zen 4', cores: 16, threads: 32, baseClockGhz: 4.5, boostClockGhz: 5.3, l3CacheMb: 64, launchPrice: 1899 }),
  {
    id: 'amd-threadripper-pro-5995wx', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen Threadripper PRO 5995WX',
    description: '64-core Zen 3 workstation flagship with 128 PCIe Gen4 lanes and eight DDR4 memory channels for dense multi-GPU AI systems.',
    socket: 'sWRX8', cores: 64, threads: 128, boostClockGhz: 4.5, basePowerW: 280, memoryTypes: ['DDR4'], integratedGraphics: false,
    architecture: 'Zen 3', series: 'Threadripper PRO 5000 WX', baseClockGhz: 2.7, l3CacheMb: 256,
    ...threadripperProIo,
    vendorLockRisk: true, launchDate: '2022-03-08',
    price: price(6499, 'MSRP', 'Launch SEP', threadripper5000Pricing), tags: ['MC62-G40 QVL', '64 cores', 'Local AI'],
    specSourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-5000wx-series/amd-ryzen-threadripper-pro-5995wx.html', compatibilitySourceUrl: mc62CpuQvl,
  },
  {
    id: 'amd-threadripper-pro-5975wx', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen Threadripper PRO 5975WX',
    description: '32-core Zen 3 workstation CPU offering the full eight-channel memory and 128-lane PCIe platform at a lower entry cost.',
    socket: 'sWRX8', cores: 32, threads: 64, boostClockGhz: 4.5, basePowerW: 280, memoryTypes: ['DDR4'], integratedGraphics: false,
    architecture: 'Zen 3', series: 'Threadripper PRO 5000 WX', baseClockGhz: 3.6, l3CacheMb: 128,
    ...threadripperProIo,
    vendorLockRisk: true, launchDate: '2022-03-08',
    price: price(3299, 'MSRP', 'Launch SEP', threadripper5000Pricing), tags: ['MC62-G40 QVL', '32 cores', 'Local AI'],
    specSourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-5000wx-series/amd-ryzen-threadripper-pro-5975wx.html', compatibilitySourceUrl: mc62CpuQvl,
  },
  {
    id: 'amd-threadripper-pro-5965wx', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen Threadripper PRO 5965WX',
    description: '24-core Zen 3 model balancing workstation throughput with the same 128 PCIe lanes needed for multi-accelerator builds.',
    socket: 'sWRX8', cores: 24, threads: 48, boostClockGhz: 4.5, basePowerW: 280, memoryTypes: ['DDR4'], integratedGraphics: false,
    architecture: 'Zen 3', series: 'Threadripper PRO 5000 WX', baseClockGhz: 3.8, l3CacheMb: 128,
    ...threadripperProIo,
    vendorLockRisk: true, launchDate: '2022-03-08',
    price: price(2399, 'MSRP', 'Launch SEP', threadripper5000Pricing), tags: ['MC62-G40 QVL', '24 cores', 'Local AI'],
    specSourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-5000wx-series/amd-ryzen-threadripper-pro-5965wx.html', compatibilitySourceUrl: mc62CpuQvl,
  },
  {
    id: 'amd-threadripper-pro-5955wx', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen Threadripper PRO 5955WX',
    description: 'High-frequency 16-core Zen 3 processor with full workstation I/O, often attractive for GPU-heavy local-AI builds.',
    socket: 'sWRX8', cores: 16, threads: 32, boostClockGhz: 4.5, basePowerW: 280, memoryTypes: ['DDR4'], integratedGraphics: false,
    architecture: 'Zen 3', series: 'Threadripper PRO 5000 WX', baseClockGhz: 4.0, l3CacheMb: 64,
    ...threadripperProIo,
    vendorLockRisk: true, launchDate: '2022-03-08',
    price: price(1321.10, 'store', 'Newegg marketplace reference', 'https://www.newegg.com/amd-ryzen-threadripper-pro-5955wx-chagall-pro-socket-swrx8-desktop-cpu-processor/p/N82E16819113776'), tags: ['MC62-G40 QVL', '16 cores', 'Local AI'],
    specSourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-5000wx-series/amd-ryzen-threadripper-pro-5955wx.html', compatibilitySourceUrl: mc62CpuQvl,
  },
  {
    id: 'amd-threadripper-pro-3995wx', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen Threadripper PRO 3995WX',
    description: '64-core Zen 2 workstation flagship with full eight-channel ECC memory and 128 PCIe Gen4 lanes.',
    socket: 'sWRX8', cores: 64, threads: 128, boostClockGhz: 4.2, basePowerW: 280, memoryTypes: ['DDR4'], integratedGraphics: false,
    architecture: 'Zen 2', series: 'Threadripper PRO 3000 WX', baseClockGhz: 2.7, l3CacheMb: 256,
    ...threadripperProIo,
    vendorLockRisk: true, launchDate: '2020-07-14',
    price: price(5489, 'MSRP', 'Launch recommended price', threadripper3000Pricing), tags: ['MC62-G40 QVL', '64 cores', 'Used value'],
    specSourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-3000wx-series/amd-ryzen-threadripper-pro-3995wx.html', compatibilitySourceUrl: mc62CpuQvl,
  },
  {
    id: 'amd-threadripper-pro-3975wx', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen Threadripper PRO 3975WX',
    description: '32-core Zen 2 workstation CPU frequently available used while retaining all 128 PCIe Gen4 lanes.',
    socket: 'sWRX8', cores: 32, threads: 64, boostClockGhz: 4.2, basePowerW: 280, memoryTypes: ['DDR4'], integratedGraphics: false,
    architecture: 'Zen 2', series: 'Threadripper PRO 3000 WX', baseClockGhz: 3.5, l3CacheMb: 128,
    ...threadripperProIo,
    vendorLockRisk: true, launchDate: '2020-07-14',
    price: price(2749, 'MSRP', 'Launch recommended price', threadripper3000Pricing), tags: ['MC62-G40 QVL', '32 cores', 'Used value'],
    specSourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-3000wx-series/amd-ryzen-threadripper-pro-3975wx.html', compatibilitySourceUrl: mc62CpuQvl,
  },
  {
    id: 'amd-threadripper-pro-3955wx', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen Threadripper PRO 3955WX',
    description: '16-core Zen 2 option whose value is the full WRX80 memory and PCIe platform rather than CPU core count alone.',
    socket: 'sWRX8', cores: 16, threads: 32, boostClockGhz: 4.3, basePowerW: 280, memoryTypes: ['DDR4'], integratedGraphics: false,
    architecture: 'Zen 2', series: 'Threadripper PRO 3000 WX', baseClockGhz: 3.9, l3CacheMb: 64,
    ...threadripperProIo,
    vendorLockRisk: true, launchDate: '2020-07-14',
    price: price(1149, 'MSRP', 'Launch recommended price', threadripper3000Pricing), tags: ['MC62-G40 QVL', '16 cores', 'Used value'],
    specSourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-3000wx-series/amd-ryzen-threadripper-pro-3955wx.html', compatibilitySourceUrl: mc62CpuQvl,
  },
  {
    id: 'amd-threadripper-pro-3945wx', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen Threadripper PRO 3945WX',
    description: 'Low-cost 12-core entry to the 128-lane WRX80 platform; verify an unlocked CPU because many OEM pulls are vendor-fused.',
    socket: 'sWRX8', cores: 12, threads: 24, boostClockGhz: 4.3, basePowerW: 280, memoryTypes: ['DDR4'], integratedGraphics: false,
    architecture: 'Zen 2', series: 'Threadripper PRO 3000 WX', baseClockGhz: 4.0, l3CacheMb: 64,
    ...threadripperProIo,
    vendorLockRisk: true, oemOnly: true, launchDate: '2020-07-14',
    price: price(129, 'store', 'eBay refurbished unlocked reference', 'https://www.ebay.com/itm/335521397445'), tags: ['MC62-G40 QVL', 'Budget lanes', 'OEM lock risk'],
    specSourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-3000wx-series/amd-ryzen-threadripper-pro-3945wx.html', compatibilitySourceUrl: mc62CpuQvl,
  },
  {
    id: 'amd-ryzen-9-9950x3d', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen 9 9950X3D',
    description: 'Flagship 16-core Zen 5 processor with 3D V-Cache for high-end gaming and creation.',
    socket: 'AM5', cores: 16, threads: 32, boostClockGhz: 5.7, basePowerW: 170, memoryTypes: ['DDR5'], integratedGraphics: true,
    ...amdAm5DesktopIo, baseClockGhz: 4.3,
    price: price(699, 'MSRP', 'AMD', 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x3d.html'), tags: ['Enthusiast', 'Gaming', 'Creator'],
    specSourceUrl: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x3d.html',
  },
  {
    id: 'amd-ryzen-7-9800x3d', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen 7 9800X3D',
    description: 'Eight-core gaming-focused Zen 5 chip with second-generation 3D V-Cache.',
    socket: 'AM5', cores: 8, threads: 16, boostClockGhz: 5.2, basePowerW: 120, memoryTypes: ['DDR5'], integratedGraphics: true,
    ...amdAm5DesktopIo, baseClockGhz: 4.7,
    price: price(479, 'MSRP', 'AMD', 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html'), tags: ['Gaming', 'Popular'],
    specSourceUrl: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html',
  },
  {
    id: 'amd-ryzen-7-9700x', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen 7 9700X',
    description: 'Efficient eight-core Zen 5 desktop CPU for balanced gaming and productivity builds.',
    socket: 'AM5', cores: 8, threads: 16, boostClockGhz: 5.5, basePowerW: 65, memoryTypes: ['DDR5'], integratedGraphics: true,
    ...amdAm5DesktopIo, baseClockGhz: 3.8,
    price: price(359, 'MSRP', 'AMD', 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9700x.html'), tags: ['Balanced', 'Efficient'],
    specSourceUrl: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9700x.html',
  },
  {
    id: 'amd-ryzen-5-9600x', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen 5 9600X',
    description: 'Six-core Zen 5 processor aimed at efficient mainstream gaming systems.',
    socket: 'AM5', cores: 6, threads: 12, boostClockGhz: 5.4, basePowerW: 65, memoryTypes: ['DDR5'], integratedGraphics: true,
    ...amdAm5DesktopIo, baseClockGhz: 3.9,
    price: price(279, 'MSRP', 'AMD', 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-5-9600x.html'), tags: ['Value', 'Gaming'],
    specSourceUrl: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-5-9600x.html',
  },
  {
    id: 'amd-ryzen-7-5700x3d', category: 'cpu', manufacturer: 'AMD', name: 'Ryzen 7 5700X3D',
    description: 'AM4 upgrade favorite with eight cores and 3D V-Cache for DDR4 systems.',
    socket: 'AM4', cores: 8, threads: 16, boostClockGhz: 4.1, basePowerW: 105, memoryTypes: ['DDR4'], integratedGraphics: false,
    ...amdAm4DesktopIo, baseClockGhz: 3.0,
    price: price(249, 'reference', 'Launch reference', 'https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-7-5700x3d.html'), tags: ['DDR4', 'Upgrade'],
    specSourceUrl: 'https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-7-5700x3d.html',
  },
  {
    id: 'intel-core-ultra-9-285k', category: 'cpu', manufacturer: 'Intel', name: 'Core Ultra 9 285K',
    description: '24-core Arrow Lake desktop processor with integrated graphics and an NPU.',
    socket: 'LGA1851', cores: 24, threads: 24, boostClockGhz: 5.7, basePowerW: 125, memoryTypes: ['DDR5'], integratedGraphics: true,
    ...intelArrowLakeDesktopIo, baseClockGhz: 3.7,
    price: price(589, 'MSRP', 'Intel recommended price', 'https://www.intel.com/content/www/us/en/products/sku/241060/intel-core-ultra-9-processor-285k-36m-cache-up-to-5-70-ghz/specifications.html'), tags: ['Enthusiast', 'AI PC'],
    specSourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/241060/intel-core-ultra-9-processor-285k-36m-cache-up-to-5-70-ghz/specifications.html',
  },
  {
    id: 'intel-core-ultra-7-265k', category: 'cpu', manufacturer: 'Intel', name: 'Core Ultra 7 265K',
    description: 'Unlocked 20-core Arrow Lake CPU for high-performance DDR5 desktops.',
    socket: 'LGA1851', cores: 20, threads: 20, boostClockGhz: 5.5, basePowerW: 125, memoryTypes: ['DDR5'], integratedGraphics: true,
    ...intelArrowLakeDesktopIo, baseClockGhz: 3.9,
    price: price(394, 'MSRP', 'Intel recommended price', 'https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html'), tags: ['Performance', 'AI PC'],
    specSourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html',
  },
  {
    id: 'intel-core-i7-14700k', category: 'cpu', manufacturer: 'Intel', name: 'Core i7-14700K',
    description: '20-core Raptor Lake Refresh CPU supporting either DDR4 or DDR5 motherboards.',
    socket: 'LGA1700', cores: 20, threads: 28, boostClockGhz: 5.6, basePowerW: 125, memoryTypes: ['DDR4', 'DDR5'], integratedGraphics: true,
    ...intelRaptorLakeRefreshIo, baseClockGhz: 3.4,
    price: price(409, 'MSRP', 'Intel recommended price', 'https://www.intel.com/content/www/us/en/products/sku/236783/intel-core-i7-processor-14700k-33m-cache-up-to-5-60-ghz/specifications.html'), tags: ['Flexible memory', 'Performance'],
    specSourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/236783/intel-core-i7-processor-14700k-33m-cache-up-to-5-60-ghz/specifications.html',
  },
  {
    id: 'intel-core-i5-14600k', category: 'cpu', manufacturer: 'Intel', name: 'Core i5-14600K',
    description: 'Unlocked 14-core processor compatible with DDR4 and DDR5 LGA1700 boards.',
    socket: 'LGA1700', cores: 14, threads: 20, boostClockGhz: 5.3, basePowerW: 125, memoryTypes: ['DDR4', 'DDR5'], integratedGraphics: true,
    ...intelRaptorLakeRefreshIo, baseClockGhz: 3.5,
    price: price(319, 'MSRP', 'Intel recommended price', 'https://www.intel.com/content/www/us/en/products/sku/236799/intel-core-i5-processor-14600k-24m-cache-up-to-5-30-ghz/specifications.html'), tags: ['Value', 'Flexible memory'],
    specSourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/236799/intel-core-i5-processor-14600k-24m-cache-up-to-5-30-ghz/specifications.html',
  },
  ...optaneCpus,
];

const wrx80SageCpuIds = [
  'amd-threadripper-pro-5995wx', 'amd-threadripper-pro-5975wx',
  'amd-threadripper-pro-5965wx', 'amd-threadripper-pro-5955wx',
  'amd-threadripper-pro-3995wx', 'amd-threadripper-pro-3975wx',
  'amd-threadripper-pro-3955wx', 'amd-threadripper-pro-3945wx',
];

const wrx90SageCpuIds = [
  'amd-threadripper-pro-9995wx', 'amd-threadripper-pro-9985wx',
  'amd-threadripper-pro-9975wx', 'amd-threadripper-pro-9965wx', 'amd-threadripper-pro-9955wx',
  'amd-threadripper-pro-7995wx', 'amd-threadripper-pro-7985wx',
  'amd-threadripper-pro-7975wx', 'amd-threadripper-pro-7965wx', 'amd-threadripper-pro-7955wx',
];

export const motherboards: Motherboard[] = [
  {
    id: 'asus-pro-ws-wrx90e-sage-se', category: 'motherboard', manufacturer: 'ASUS', name: 'Pro WS WRX90E-SAGE SE',
    description: 'EEB flagship for Threadripper PRO 9000/7000 WX with eight-channel ECC DDR5, seven PCIe Gen5 slots, four CPU-direct Gen5 M.2 slots, dual 10GbE, and IPMI.',
    socket: 'sTR5', chipset: 'WRX90', formFactor: 'EEB', memoryType: 'DDR5', memorySlots: 8, maxMemoryGb: 2048, pcieX16Slots: 7, m2Slots: 4, wifi: false,
    memoryChannels: 8, eccSupport: true, registeredMemorySupport: true, registeredMemoryRequired: true,
    memoryModuleTypes: ['ECC RDIMM'], pcieGeneration: 5,
    platformPcieLanes: 148, cpuDirectExpansionLanes: 104, cpuDirectM2Lanes: 16, chipsetUplinkLanes: 8,
    dimmsPerChannel: 1, maxDimmCapacityGb: 256,
    networkPorts: ['2× 10 GbE', '1× management'], slimSas4iPorts: 2, sataPorts: 4,
    pcieSlotConfiguration: '6× x16 + 1× x8', supportedCpuSeries: ['Threadripper PRO 9000 WX', 'Threadripper PRO 7000 WX'],
    boardDimensionsMm: '305 × 330', bmc: 'ASPEED AST2600', maxCpuTdpW: 350, wifiM2Slots: 1,
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: ['2× 8-pin PCIe'],
    supportedCpuIds: wrx90SageCpuIds,
    requiredBiosByCpuId: Object.fromEntries(wrx90SageCpuIds.filter((id) => id.includes('-99')).map((id) => [id, '1106'])),
    price: price(1299.99, 'store', 'B&H reference', 'https://www.bhphotovideo.com/c/product/1800235-REG/asus_pro_ws_wrx90e_sage_se.html'),
    tags: ['DDR5 SAGE', '7-GPU', 'ECC RDIMM', 'PCIe 5.0'],
    specSourceUrl: 'https://www.asus.com/us/motherboards-components/motherboards/workstation/pro-ws-wrx90e-sage-se/techspec/',
    compatibilitySourceUrl: asusWrx90CpuSupport,
  },
  {
    id: 'asus-pro-ws-wrx80e-sage-se-wifi', category: 'motherboard', manufacturer: 'ASUS', name: 'Pro WS WRX80E-SAGE SE WIFI',
    description: 'E-ATX Threadripper PRO workstation board with eight-channel DDR4, seven CPU-direct PCIe Gen4 x16 slots, three M.2 slots, dual 10GbE, Wi-Fi 6, and IPMI.',
    socket: 'sWRX8', chipset: 'WRX80', formFactor: 'E-ATX', memoryType: 'DDR4', memorySlots: 8, maxMemoryGb: 2048, pcieX16Slots: 7, m2Slots: 3, wifi: true,
    memoryChannels: 8, eccSupport: true, registeredMemorySupport: true,
    memoryModuleTypes: ['ECC UDIMM', 'Non-ECC UDIMM', 'RDIMM', '3DS RDIMM', 'LRDIMM'], pcieGeneration: 4,
    platformPcieLanes: 152, cpuDirectExpansionLanes: 112, cpuDirectM2Lanes: 8, chipsetUplinkLanes: 8,
    dimmsPerChannel: 1, maxDimmCapacityGb: 256, u2Ports: 2,
    networkPorts: ['2× 10 GbE'], slimSas4iPorts: 0, sataPorts: 8,
    pcieSlotConfiguration: '7× x16', supportedCpuSeries: ['Threadripper PRO 5000 WX', 'Threadripper PRO 3000 WX'],
    boardDimensionsMm: '310 × 330', bmc: 'ASUS ASMB9-iKVM', maxCpuTdpW: 280,
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: ['2× 6-pin PCIe', '1× 8-pin PCIe'],
    supportedCpuIds: wrx80SageCpuIds,
    requiredBiosByCpuId: Object.fromEntries(wrx80SageCpuIds.map((id) => [id, id.includes('-5') ? '1003' : '0211'])),
    price: price(999.99, 'reference', 'US market reference', 'https://e-catalog.com/ASUS-PRO-WS-WRX80E-SAGE-SE-WIFI.htm'),
    tags: ['DDR4 SAGE', '7-GPU', 'ECC', '10 GbE'],
    specSourceUrl: 'https://www.asus.com/us/motherboards-components/motherboards/workstation/pro-ws-wrx80e-sage-se-wifi/techspec/',
    compatibilitySourceUrl: asusWrx80CpuSupport,
  },
  {
    id: 'gigabyte-mc62-g40-rev-1x', category: 'motherboard', manufacturer: 'GIGABYTE', name: 'MC62-G40 Rev. 1.x',
    description: 'CEB workstation platform for Threadripper PRO with eight-channel ECC memory, seven PCIe Gen4 expansion slots, and dual 10 GbE—well suited to dense local-AI GPU systems.',
    socket: 'sWRX8', chipset: 'WRX80', formFactor: 'CEB', memoryType: 'DDR4', memorySlots: 8, maxMemoryGb: 2048, pcieX16Slots: 7, m2Slots: 2, wifi: false,
    revision: '1.x', memoryChannels: 8, eccSupport: true, registeredMemorySupport: true,
    memoryModuleTypes: ['ECC UDIMM', 'Non-ECC UDIMM', 'RDIMM', '3DS RDIMM', 'LRDIMM'], pcieGeneration: 4,
    platformPcieLanes: 152, cpuDirectExpansionLanes: 104, cpuDirectM2Lanes: 8, chipsetUplinkLanes: 8,
    dimmsPerChannel: 1, maxDimmCapacityGb: 256,
    networkPorts: ['2× 10 GbE', '1× 1 GbE', '1× management'], slimSas4iPorts: 3, sataPorts: 4,
    pcieSlotConfiguration: '6× x16 + 1× x8', supportedCpuSeries: ['Threadripper PRO 5000 WX', 'Threadripper PRO 3000 WX'],
    boardDimensionsMm: '305 × 267', bmc: 'ASPEED AST2600', maxCpuTdpW: 280, wifiM2Slots: 1,
    above4gDecoding: true, iommuSupport: true, auxiliaryPciePower: ['1× 8-pin PCIe (P12V_AUX2)'],
    supportedCpuIds: ['amd-threadripper-pro-5995wx', 'amd-threadripper-pro-5975wx', 'amd-threadripper-pro-5965wx', 'amd-threadripper-pro-5955wx', 'amd-threadripper-pro-3995wx', 'amd-threadripper-pro-3975wx', 'amd-threadripper-pro-3955wx', 'amd-threadripper-pro-3945wx'],
    price: price(659.99, 'store', 'Newegg listing', 'https://www.newegg.com/gigabyte-mc62-g40-amd-ryzen/p/N82E16813145382'),
    tags: ['Local AI', '7-GPU', 'ECC', '10 GbE'],
    specSourceUrl: mc62Manual, compatibilitySourceUrl: mc62CpuQvl,
  },
  {
    id: 'asus-rog-strix-x870e-e', category: 'motherboard', manufacturer: 'ASUS', name: 'ROG Strix X870E-E Gaming WiFi',
    description: 'Premium AM5 platform with USB4, Wi-Fi 7, and extensive PCIe 5.0 storage.',
    socket: 'AM5', chipset: 'X870E', formFactor: 'ATX', memoryType: 'DDR5', memorySlots: 4, maxMemoryGb: 256, pcieX16Slots: 2, m2Slots: 5, wifi: true,
    memoryChannels: 2, eccSupport: true, registeredMemorySupport: false, memoryModuleTypes: ['ECC UDIMM', 'Non-ECC UDIMM'],
    pcieGeneration: 5, networkPorts: ['5 GbE'], boardDimensionsMm: '305 × 244', sataPorts: 4,
    pcieSlotConfiguration: '1× PCIe 5.0 x16 CPU (x8 when M.2_2 or M.2_3 is used) + 1× PCIe 4.0 x4 chipset',
    pcieSlots: [
      { id: 'pcie16_1', label: 'PCIEX16(G5)_1', generation: 5, physicalLanes: 16, electricalLanes: 16, source: 'cpu', position: 1, spacingSlots: 4, bifurcation: ['x8/x8'], sharesWith: ['M.2_2', 'M.2_3'] },
      { id: 'pcie16_2', label: 'PCIEX16(G4)', generation: 4, physicalLanes: 16, electricalLanes: 4, source: 'chipset', position: 5, spacingSlots: 1 },
    ],
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: [],
    price: price(499.99, 'reference', 'Market reference', 'https://rog.asus.com/us/motherboards/rog-strix/rog-strix-x870e-e-gaming-wifi/'), tags: ['Premium', 'Wi-Fi 7', 'USB4'],
    specSourceUrl: 'https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/ROG_STRIX_X870E-E_GAMING_WIFI/E25504_ROG_STRIX_X870E-E_GAMING_WIFI_EM_V2_WEB.pdf?model=ROG%20STRIX%20X870E-E%20GAMING%20WIFI',
    compatibilitySourceUrl: 'https://rog.asus.com/us/motherboards/rog-strix/rog-strix-x870e-e-gaming-wifi/helpdesk_qvl_cpu/',
  },
  {
    id: 'asus-tuf-b650-plus-wifi', category: 'motherboard', manufacturer: 'ASUS', name: 'TUF Gaming B650-Plus WiFi',
    description: 'Feature-rich AM5 ATX board with Wi-Fi 6 and three M.2 slots.',
    socket: 'AM5', chipset: 'B650', formFactor: 'ATX', memoryType: 'DDR5', memorySlots: 4, maxMemoryGb: 256, pcieX16Slots: 2, m2Slots: 3, wifi: true,
    memoryChannels: 2, eccSupport: true, registeredMemorySupport: false, memoryModuleTypes: ['ECC UDIMM', 'Non-ECC UDIMM'],
    pcieGeneration: 4, networkPorts: ['2.5 GbE'], boardDimensionsMm: '305 × 244', sataPorts: 4,
    pcieSlotConfiguration: '1× PCIe 4.0 x16 CPU + 1× PCIe 4.0 x4 chipset; M.2_3 disables the chipset x4 slot',
    pcieSlots: [
      { id: 'pcie16_1', label: 'PCIEX16_1', generation: 4, physicalLanes: 16, electricalLanes: 16, source: 'cpu', position: 1, spacingSlots: 3 },
      { id: 'pcie16_2', label: 'PCIEX16_2', generation: 4, physicalLanes: 16, electricalLanes: 4, source: 'chipset', position: 4, spacingSlots: 1, sharesWith: ['M.2_3'] },
      { id: 'pcie1_1', label: 'PCIEX1_1', generation: 4, physicalLanes: 1, electricalLanes: 1, source: 'chipset', position: 5, spacingSlots: 1 },
      { id: 'pcie1_2', label: 'PCIEX1_2', generation: 4, physicalLanes: 1, electricalLanes: 1, source: 'chipset', position: 6, spacingSlots: 1 },
    ],
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: [],
    price: price(149.99, 'store', 'ASUS Store', 'https://www.asus.com/us/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/where-to-buy/'), tags: ['Value', 'Wi-Fi'],
    specSourceUrl: 'https://dlcdnets.asus.com/pub/ASUS/mb/Socket%20AM5/TUF%20GAMING%20B650-PLUS%20WIFI/E21902_TUF_GAMING_B650-PLUS_WIFI_UM_V3_WEB.pdf',
    compatibilitySourceUrl: 'https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/helpdesk_qvl_cpu/',
  },
  {
    id: 'gigabyte-b650m-aorus-elite-ax', category: 'motherboard', manufacturer: 'Gigabyte', name: 'B650M Aorus Elite AX',
    description: 'Compact AM5 Micro ATX board with Wi-Fi and strong mainstream connectivity.',
    socket: 'AM5', chipset: 'B650', formFactor: 'Micro ATX', memoryType: 'DDR5', memorySlots: 4, maxMemoryGb: 256, pcieX16Slots: 2, m2Slots: 2, wifi: true,
    revision: '1.3', memoryChannels: 2, eccSupport: false, registeredMemorySupport: false, memoryModuleTypes: ['Non-ECC UDIMM'],
    pcieGeneration: 4, networkPorts: ['2.5 GbE'], boardDimensionsMm: '244 × 244', sataPorts: 4,
    pcieSlotConfiguration: '1× PCIe 4.0 x16 CPU + 1× PCIe 4.0 x4 chipset; Ryzen 8000 CPU models may reduce the primary slot to x8 or x4',
    pcieSlots: [
      { id: 'pcie16', label: 'PCIEX16', generation: 4, physicalLanes: 16, electricalLanes: 16, source: 'cpu', position: 1, spacingSlots: 3 },
      { id: 'pcie4', label: 'PCIEX4', generation: 4, physicalLanes: 16, electricalLanes: 4, source: 'chipset', position: 4, spacingSlots: 1 },
    ],
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: [],
    price: price(189.99, 'reference', 'Market reference', 'https://www.gigabyte.com/Motherboard/B650M-AORUS-ELITE-AX-rev-13'), tags: ['Compact', 'Wi-Fi'],
    specSourceUrl: 'https://www.gigabyte.com/us/Motherboard/B650M-AORUS-ELITE-AX-rev-13/sp',
    compatibilitySourceUrl: 'https://www.gigabyte.com/Motherboard/B650M-AORUS-ELITE-AX-rev-13/support#support-cpu',
  },
  {
    id: 'asrock-b650i-lightning-wifi', category: 'motherboard', manufacturer: 'ASRock', name: 'B650I Lightning WiFi',
    description: 'Mini ITX AM5 board for small-form-factor DDR5 builds.',
    socket: 'AM5', chipset: 'B650', formFactor: 'Mini ITX', memoryType: 'DDR5', memorySlots: 2, maxMemoryGb: 128, pcieX16Slots: 1, m2Slots: 2, wifi: true,
    memoryChannels: 2, eccSupport: true, registeredMemorySupport: false, memoryModuleTypes: ['ECC UDIMM', 'Non-ECC UDIMM'],
    pcieGeneration: 4, networkPorts: ['2.5 GbE'], boardDimensionsMm: '170 × 170', sataPorts: 2,
    pcieSlotConfiguration: '1× PCIe 4.0 x16 CPU; Ryzen 8000 CPU models may reduce the link to x8 or x4',
    pcieSlots: [
      { id: 'pcie1', label: 'PCIE1', generation: 4, physicalLanes: 16, electricalLanes: 16, source: 'cpu', position: 1, spacingSlots: 2, bifurcation: ['x8/x8'] },
    ],
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: [],
    price: price(199.99, 'reference', 'Market reference', 'https://pg.asrock.com/mb/AMD/B650I%20Lightning%20WiFi/'), tags: ['SFF', 'Wi-Fi'],
    specSourceUrl: 'https://download.asrock.com/Manual/B650I%20Lightning%20WiFi.pdf',
    compatibilitySourceUrl: 'https://pg.asrock.com/Support/QA/AMD_600_PCIe.M.2_Bandwidth_Table.pdf',
  },
  {
    id: 'asus-prime-z890-p-wifi', category: 'motherboard', manufacturer: 'ASUS', name: 'Prime Z890-P WiFi',
    description: 'LGA1851 ATX motherboard for Intel Core Ultra desktop processors.',
    socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', memoryType: 'DDR5', memorySlots: 4, maxMemoryGb: 256, pcieX16Slots: 4, m2Slots: 4, wifi: true,
    memoryChannels: 2, eccSupport: false, registeredMemorySupport: false, memoryModuleTypes: ['Non-ECC UDIMM', 'CUDIMM'],
    pcieGeneration: 5, networkPorts: ['2.5 GbE'], boardDimensionsMm: '305 × 244', sataPorts: 4,
    pcieSlotConfiguration: '1× PCIe 5.0 x16 CPU + 2× PCIe 4.0 x4 chipset + 1× PCIe 4.0 x1 chipset',
    pcieSlots: [
      { id: 'pcie16_1', label: 'PCIEX16(G5)', generation: 5, physicalLanes: 16, electricalLanes: 16, source: 'cpu', position: 1, spacingSlots: 3, bifurcation: ['x8/x8'] },
      { id: 'pcie16_2', label: 'PCIEX16(G4)_1', generation: 4, physicalLanes: 16, electricalLanes: 4, source: 'chipset', position: 4, spacingSlots: 1 },
      { id: 'pcie16_3', label: 'PCIEX16(G4)_2', generation: 4, physicalLanes: 16, electricalLanes: 4, source: 'chipset', position: 5, spacingSlots: 1 },
      { id: 'pcie16_4', label: 'PCIEX16(G4)_3', generation: 4, physicalLanes: 16, electricalLanes: 1, source: 'chipset', position: 6, spacingSlots: 1 },
    ],
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: [],
    price: price(249.99, 'reference', 'Market reference', 'https://www.asus.com/us/motherboards-components/motherboards/prime/prime-z890-p-wifi/'), tags: ['Arrow Lake', 'Wi-Fi'],
    specSourceUrl: 'https://dlcdnets.asus.com/pub/ASUS/mb/LGA1851/PRIME%20Z890-P%20WIFI/E24237_PRIME_Z890-P_WIFI_EM_WEB.pdf?model=PRIME+Z890-P+WIFI-CSM',
    compatibilitySourceUrl: 'https://www.asus.com/us/motherboards-components/motherboards/prime/prime-z890-p-wifi/helpdesk_qvl_cpu/',
  },
  {
    id: 'msi-pro-z890-s-wifi', category: 'motherboard', manufacturer: 'MSI', name: 'PRO Z890-S WiFi',
    description: 'Practical LGA1851 DDR5 board with Wi-Fi 7 and three M.2 slots.',
    socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', memoryType: 'DDR5', memorySlots: 4, maxMemoryGb: 256, pcieX16Slots: 4, m2Slots: 3, wifi: true,
    memoryChannels: 2, eccSupport: false, registeredMemorySupport: false, memoryModuleTypes: ['Non-ECC UDIMM', 'CUDIMM'],
    pcieGeneration: 5, networkPorts: ['2.5 GbE'], boardDimensionsMm: '305 × 244', sataPorts: 4,
    pcieSlotConfiguration: '1× PCIe 5.0 x16 CPU + 1× PCIe 4.0 x4 CPU + 1× PCIe 4.0 x4 chipset + 1× PCIe 3.0 x1 chipset',
    pcieSlots: [
      { id: 'pcie_e1', label: 'PCI_E1', generation: 5, physicalLanes: 16, electricalLanes: 16, source: 'cpu', position: 1, spacingSlots: 2, bifurcation: ['x8/x8'] },
      { id: 'pcie_e2', label: 'PCI_E2', generation: 3, physicalLanes: 16, electricalLanes: 1, source: 'chipset', position: 3, spacingSlots: 1 },
      { id: 'pcie_e3', label: 'PCI_E3', generation: 4, physicalLanes: 16, electricalLanes: 4, source: 'chipset', position: 4, spacingSlots: 1 },
      { id: 'pcie_e4', label: 'PCI_E4', generation: 4, physicalLanes: 16, electricalLanes: 4, source: 'cpu', position: 5, spacingSlots: 1 },
    ],
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: ['1× 8-pin PCIE_PWR'],
    price: price(219.99, 'reference', 'Market reference', 'https://www.msi.com/Motherboard/PRO-Z890-S-WIFI'), tags: ['Productivity', 'Wi-Fi 7'],
    specSourceUrl: 'https://download.msi.com/archive/mnu_exe/mb/PROZ890-SWIFI_PROZ890-SWIFIWHITE_English.pdf',
    compatibilitySourceUrl: 'https://www.msi.com/Motherboard/PRO-Z890-S-WIFI/support#cpu',
  },
  {
    id: 'msi-b760-tomahawk-wifi-ddr4', category: 'motherboard', manufacturer: 'MSI', name: 'MAG B760 Tomahawk WiFi DDR4',
    description: 'LGA1700 ATX board built specifically for affordable DDR4 configurations.',
    socket: 'LGA1700', chipset: 'B760', formFactor: 'ATX', memoryType: 'DDR4', memorySlots: 4, maxMemoryGb: 128, pcieX16Slots: 2, m2Slots: 3, wifi: true,
    memoryChannels: 2, eccSupport: false, registeredMemorySupport: false, memoryModuleTypes: ['Non-ECC UDIMM'],
    pcieGeneration: 5, networkPorts: ['2.5 GbE'], boardDimensionsMm: '305 × 244', sataPorts: 4,
    pcieSlotConfiguration: '1× PCIe 5.0 x16 CPU + 1× PCIe 3.0 x4 chipset + 1× PCIe 4.0 x1 chipset',
    pcieSlots: [
      { id: 'pcie_e1', label: 'PCI_E1', generation: 5, physicalLanes: 16, electricalLanes: 16, source: 'cpu', position: 1, spacingSlots: 3 },
      { id: 'pcie_e2', label: 'PCI_E2', generation: 3, physicalLanes: 16, electricalLanes: 4, source: 'chipset', position: 4, spacingSlots: 1 },
      { id: 'pcie_e3', label: 'PCI_E3', generation: 4, physicalLanes: 1, electricalLanes: 1, source: 'chipset', position: 5, spacingSlots: 1 },
    ],
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: [],
    price: price(179.99, 'reference', 'Market reference', 'https://www.msi.com/Motherboard/MAG-B760-TOMAHAWK-WIFI-DDR4/Specification'), tags: ['DDR4', 'Wi-Fi', 'Value'],
    specSourceUrl: 'https://download-2.msi.com/archive/mnu_exe/mb/MAGB760TOMAHAWKWIFIDDR4.pdf',
    compatibilitySourceUrl: 'https://www.msi.com/Motherboard/MAG-B760-TOMAHAWK-WIFI-DDR4/support#cpu',
  },
  {
    id: 'gigabyte-z790-aorus-elite-x', category: 'motherboard', manufacturer: 'Gigabyte', name: 'Z790 Aorus Elite X WiFi7',
    description: 'LGA1700 ATX platform for high-speed DDR5 and 12th–14th Gen Intel CPUs.',
    socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memoryType: 'DDR5', memorySlots: 4, maxMemoryGb: 256, pcieX16Slots: 3, m2Slots: 4, wifi: true,
    memoryChannels: 2, eccSupport: false, registeredMemorySupport: false, memoryModuleTypes: ['Non-ECC UDIMM'],
    pcieGeneration: 5, networkPorts: ['2.5 GbE'], boardDimensionsMm: '305 × 244', sataPorts: 6,
    pcieSlotConfiguration: '1× PCIe 5.0 x16 CPU + 2× PCIe 4.0 x4 chipset',
    pcieSlots: [
      { id: 'pciex16', label: 'PCIEX16', generation: 5, physicalLanes: 16, electricalLanes: 16, source: 'cpu', position: 1, spacingSlots: 3 },
      { id: 'pciex4_1', label: 'PCIEX4_1', generation: 4, physicalLanes: 16, electricalLanes: 4, source: 'chipset', position: 4, spacingSlots: 1 },
      { id: 'pciex4_2', label: 'PCIEX4_2', generation: 4, physicalLanes: 16, electricalLanes: 4, source: 'chipset', position: 5, spacingSlots: 1 },
    ],
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: [],
    price: price(279.99, 'reference', 'Market reference', 'https://www.gigabyte.com/Motherboard/Z790-AORUS-ELITE-X-WIFI7'), tags: ['DDR5', 'Wi-Fi 7'],
    specSourceUrl: 'https://download.gigabyte.com/FileList/Manual/mb_manual_z790-aorus-elite-x-ax-wifi7_1201_e.pdf',
    compatibilitySourceUrl: 'https://www.gigabyte.com/Motherboard/Z790-AORUS-ELITE-X-WIFI7/support#support-cpu',
  },
  {
    id: 'msi-b550m-pro-vdh-wifi', category: 'motherboard', manufacturer: 'MSI', name: 'B550M PRO-VDH WiFi',
    description: 'Affordable AM4 Micro ATX motherboard for DDR4 upgrade builds.',
    socket: 'AM4', chipset: 'B550', formFactor: 'Micro ATX', memoryType: 'DDR4', memorySlots: 4, maxMemoryGb: 128, pcieX16Slots: 1, m2Slots: 2, wifi: true,
    memoryChannels: 2, eccSupport: true, registeredMemorySupport: false, memoryModuleTypes: ['ECC UDIMM', 'Non-ECC UDIMM'],
    pcieGeneration: 4, networkPorts: ['1 GbE'], boardDimensionsMm: '244 × 244', sataPorts: 4,
    pcieSlotConfiguration: '1× PCIe 4.0/3.0 x16 CPU + 2× PCIe 3.0 x1 chipset',
    pcieSlots: [
      { id: 'pcie1', label: 'PCI_E1', generation: 4, physicalLanes: 16, electricalLanes: 16, source: 'cpu', position: 1, spacingSlots: 3 },
      { id: 'pcie2', label: 'PCI_E2', generation: 3, physicalLanes: 1, electricalLanes: 1, source: 'chipset', position: 4, spacingSlots: 1 },
      { id: 'pcie3', label: 'PCI_E3', generation: 3, physicalLanes: 1, electricalLanes: 1, source: 'chipset', position: 5, spacingSlots: 1 },
    ],
    above4gDecoding: true, resizableBar: true, iommuSupport: true, auxiliaryPciePower: [],
    price: price(109.99, 'reference', 'Market reference', 'https://www.msi.com/Motherboard/B550M-PRO-VDH-WIFI'), tags: ['DDR4', 'Budget', 'Compact'],
    specSourceUrl: 'https://www.msi.com/Motherboard/B550M-PRO-VDH-WIFI/Specification',
    compatibilitySourceUrl: 'https://www.msi.com/Motherboard/B550M-PRO-VDH-WIFI/support#cpu',
  },
];

type ResearchedGpuSpec = {
  id: string;
  manufacturer: 'NVIDIA' | 'AMD';
  name: string;
  architecture: string;
  generation: string;
  segment: 'consumer' | 'workstation' | 'data-center';
  releaseYear: number;
  vramGb: number;
  vramType: string;
  memoryBusBits?: number;
  memoryBandwidthGbS?: number;
  pcieGeneration: number;
  pcieLanes?: number;
  lengthMm?: number;
  boardPowerW: number;
  recommendedPsuW?: number;
  slotWidth?: number;
  height?: 'full-height' | 'low-profile';
  cooling?: 'active' | 'passive' | 'double-flow-through' | 'liquid';
  displayOutputs?: boolean;
  powerConnectors?: string;
  availability?: 'current' | 'discontinued' | 'regional' | 'preview';
  gpuCount?: number;
  addressableVramGb?: number;
  notes?: string;
  sourceUrl: string;
  launchPriceUsd?: number;
  fp4AiTops?: number;
  tags?: string[];
};

function researchedGpu(spec: ResearchedGpuSpec): Gpu {
  const gpuCount = spec.gpuCount ?? 1;
  const addressableVramGb = spec.addressableVramGb ?? spec.vramGb;
  const isQuoted = spec.launchPriceUsd === undefined;
  const tensorCoreGeneration = spec.manufacturer !== 'NVIDIA' ? undefined
    : spec.architecture === 'Blackwell' ? '5th generation'
      : spec.architecture === 'Ada Lovelace' ? '4th generation'
        : spec.architecture === 'Ampere' ? '3rd generation'
          : undefined;
  const cudaComputeCapability = spec.manufacturer !== 'NVIDIA' ? undefined
    : spec.architecture === 'Blackwell' ? '12.0'
      : spec.architecture === 'Ada Lovelace' ? '8.9'
        : spec.architecture === 'Ampere' && spec.segment !== 'data-center' ? '8.6'
          : undefined;
  return {
    id: spec.id,
    category: 'gpu',
    manufacturer: spec.manufacturer,
    name: spec.name,
    description: `${spec.vramGb} GB ${spec.vramType} ${spec.segment.replace('-', ' ')} card based on ${spec.architecture}${gpuCount > 1 ? `; ${gpuCount} GPUs split the physical memory into ${addressableVramGb} GB pools` : ''}.`,
    vramGb: spec.vramGb,
    interface: `PCIe ${spec.pcieGeneration}.0 x${spec.pcieLanes ?? 16}`,
    lengthMm: spec.lengthMm ?? 0,
    boardPowerW: spec.boardPowerW,
    recommendedPsuW: spec.recommendedPsuW ?? 0,
    architecture: spec.architecture,
    generation: spec.generation,
    segment: spec.segment,
    releaseYear: spec.releaseYear,
    vramType: spec.vramType,
    memoryBusBits: spec.memoryBusBits,
    memoryBandwidthGbS: spec.memoryBandwidthGbS,
    addressableVramGb,
    gpuCount,
    memoryPool: gpuCount > 1 ? 'split' : 'unified',
    pcieGeneration: spec.pcieGeneration,
    pcieLanes: spec.pcieLanes ?? 16,
    slotWidth: spec.slotWidth ?? 2,
    height: spec.height ?? 'full-height',
    cooling: spec.cooling ?? 'active',
    displayOutputs: spec.displayOutputs ?? spec.segment !== 'data-center',
    powerConnectors: spec.powerConnectors,
    availability: spec.availability ?? 'current',
    softwarePlatform: spec.manufacturer === 'NVIDIA' ? 'CUDA' : 'ROCm',
    fp4AiTops: spec.fp4AiTops,
    tensorCoreGeneration,
    cudaComputeCapability,
    notes: spec.notes,
    price: price(spec.launchPriceUsd ?? 0, isQuoted ? 'reference' : 'MSRP',
      isQuoted ? 'OEM quote / used market' : 'Launch MSRP', spec.sourceUrl),
    tags: spec.tags ?? [`${spec.vramGb} GB`, spec.segment === 'data-center' ? 'Server airflow' : spec.architecture, spec.manufacturer === 'NVIDIA' ? 'CUDA' : 'ROCm'],
    specSourceUrl: spec.sourceUrl,
  };
}

// Scope: commercially documented, standard PCIe add-in cards carrying at least
// 24 GB of physical onboard memory. Laptop, soldered, SXM, OAM/EAM and Apple MPX
// modules are deliberately excluded because they cannot install in these boards.
const highVramGpus: Gpu[] = [
  // NVIDIA consumer / enthusiast
  researchedGpu({ id: 'nvidia-titan-rtx', manufacturer: 'NVIDIA', name: 'TITAN RTX', architecture: 'Turing', generation: 'TITAN', segment: 'consumer', releaseYear: 2018, vramGb: 24, vramType: 'GDDR6', memoryBusBits: 384, memoryBandwidthGbS: 672, pcieGeneration: 3, lengthMm: 267, boardPowerW: 280, recommendedPsuW: 650, powerConnectors: '2× 8-pin', availability: 'discontinued', launchPriceUsd: 2499, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/titan/documents/titan-rtx-for-creators-us-nvidia-1011126-r6-web.pdf', tags: ['24 GB', 'Turing', 'CUDA'] }),
  researchedGpu({ id: 'nvidia-rtx-3090', manufacturer: 'NVIDIA', name: 'GeForce RTX 3090 Founders Edition', architecture: 'Ampere', generation: 'GeForce RTX 30', segment: 'consumer', releaseYear: 2020, vramGb: 24, vramType: 'GDDR6X', memoryBusBits: 384, memoryBandwidthGbS: 936.2, pcieGeneration: 4, lengthMm: 313, boardPowerW: 350, recommendedPsuW: 750, slotWidth: 3, powerConnectors: '1× 12-pin adapter', availability: 'discontinued', launchPriceUsd: 1499, sourceUrl: 'https://www.nvidia.com/en-gb/geforce/graphics-cards/30-series/rtx-3090-3090ti/' }),
  researchedGpu({ id: 'nvidia-rtx-3090-ti', manufacturer: 'NVIDIA', name: 'GeForce RTX 3090 Ti Founders Edition', architecture: 'Ampere', generation: 'GeForce RTX 30', segment: 'consumer', releaseYear: 2022, vramGb: 24, vramType: 'GDDR6X', memoryBusBits: 384, memoryBandwidthGbS: 1008, pcieGeneration: 4, lengthMm: 313, boardPowerW: 450, recommendedPsuW: 850, slotWidth: 3, powerConnectors: '1× 16-pin adapter', availability: 'discontinued', launchPriceUsd: 1999, sourceUrl: 'https://www.nvidia.com/en-gb/geforce/graphics-cards/30-series/rtx-3090-3090ti/' }),
  researchedGpu({ id: 'nvidia-rtx-4090', manufacturer: 'NVIDIA', name: 'GeForce RTX 4090 Founders Edition', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40', segment: 'consumer', releaseYear: 2022, vramGb: 24, vramType: 'GDDR6X', memoryBusBits: 384, memoryBandwidthGbS: 1008, pcieGeneration: 4, lengthMm: 304, boardPowerW: 450, recommendedPsuW: 850, slotWidth: 3, cooling: 'double-flow-through', powerConnectors: '1× 16-pin', availability: 'discontinued', launchPriceUsd: 1599, sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/' }),
  researchedGpu({ id: 'nvidia-rtx-4090-d', manufacturer: 'NVIDIA', name: 'GeForce RTX 4090 D', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40 D', segment: 'consumer', releaseYear: 2023, vramGb: 24, vramType: 'GDDR6X', memoryBusBits: 384, memoryBandwidthGbS: 1008, pcieGeneration: 4, boardPowerW: 425, recommendedPsuW: 850, slotWidth: 3, powerConnectors: '1× 16-pin', availability: 'regional', notes: 'China-market export-compliant model; dimensions vary by board partner.', sourceUrl: 'https://www.nvidia.cn/geforce/graphics-cards/40-series/rtx-4090-d/' }),
  researchedGpu({ id: 'nvidia-rtx-5090', manufacturer: 'NVIDIA', name: 'GeForce RTX 5090 Founders Edition', architecture: 'Blackwell', generation: 'GeForce RTX 50', segment: 'consumer', releaseYear: 2025, vramGb: 32, vramType: 'GDDR7', memoryBusBits: 512, memoryBandwidthGbS: 1792, pcieGeneration: 5, lengthMm: 304, boardPowerW: 575, recommendedPsuW: 1000, slotWidth: 2, cooling: 'double-flow-through', powerConnectors: '1× 16-pin', launchPriceUsd: 1999, fp4AiTops: 3352, sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/', tags: ['32 GB', 'Blackwell', 'Local AI'] }),
  researchedGpu({ id: 'nvidia-rtx-5090-d', manufacturer: 'NVIDIA', name: 'GeForce RTX 5090 D', architecture: 'Blackwell', generation: 'GeForce RTX 50 D', segment: 'consumer', releaseYear: 2025, vramGb: 32, vramType: 'GDDR7', memoryBusBits: 512, memoryBandwidthGbS: 1792, pcieGeneration: 5, boardPowerW: 575, recommendedPsuW: 1000, slotWidth: 3, powerConnectors: '1× 16-pin', availability: 'regional', fp4AiTops: 2375, notes: 'Original China-market 32 GB model; dimensions vary by board partner.', sourceUrl: 'https://www.nvidia.cn/geforce/news/rtx-50-series-graphics-cards-gpu-laptop-announcements/' }),
  researchedGpu({ id: 'nvidia-rtx-5090-d-v2', manufacturer: 'NVIDIA', name: 'GeForce RTX 5090 D v2', architecture: 'Blackwell', generation: 'GeForce RTX 50 D', segment: 'consumer', releaseYear: 2025, vramGb: 24, vramType: 'GDDR7', memoryBusBits: 384, memoryBandwidthGbS: 1344, pcieGeneration: 5, boardPowerW: 575, recommendedPsuW: 1000, slotWidth: 3, powerConnectors: '1× 16-pin', availability: 'regional', fp4AiTops: 2375, notes: 'Revised China-market 24 GB model; dimensions vary by board partner.', sourceUrl: 'https://www.nvidia.cn/geforce/graphics-cards/50-series/rtx-5090-d-v2/' }),

  // NVIDIA professional visualization / active workstation cards
  researchedGpu({ id: 'nvidia-quadro-m6000-24', manufacturer: 'NVIDIA', name: 'Quadro M6000 24GB', architecture: 'Maxwell', generation: 'Quadro M', segment: 'workstation', releaseYear: 2016, vramGb: 24, vramType: 'GDDR5', memoryBusBits: 384, memoryBandwidthGbS: 317, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, recommendedPsuW: 600, powerConnectors: '1× 8-pin', availability: 'discontinued', launchPriceUsd: 5000, sourceUrl: 'https://www.nvidia.com/en-us/products/workstations/previous-quadro-desktop-gpus/' }),
  researchedGpu({ id: 'nvidia-quadro-p6000', manufacturer: 'NVIDIA', name: 'Quadro P6000', architecture: 'Pascal', generation: 'Quadro P', segment: 'workstation', releaseYear: 2016, vramGb: 24, vramType: 'GDDR5X', memoryBusBits: 384, memoryBandwidthGbS: 432, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, recommendedPsuW: 600, powerConnectors: '1× 8-pin', availability: 'discontinued', launchPriceUsd: 4999, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/productspage/quadro/quadro-desktop/quadro-pascal-p6000-data-sheet-us-nv-704590-r1.pdf' }),
  researchedGpu({ id: 'nvidia-quadro-gv100', manufacturer: 'NVIDIA', name: 'Quadro GV100', architecture: 'Volta', generation: 'Quadro GV', segment: 'workstation', releaseYear: 2018, vramGb: 32, vramType: 'HBM2', memoryBusBits: 4096, memoryBandwidthGbS: 870, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, recommendedPsuW: 600, powerConnectors: '1× 8-pin', availability: 'discontinued', launchPriceUsd: 8999, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/ja/Solutions/design-visualization/documents/quadro-pascal-gv100-a4-nv-623049-r11-hr_JP.pdf' }),
  researchedGpu({ id: 'nvidia-quadro-rtx-6000', manufacturer: 'NVIDIA', name: 'Quadro RTX 6000', architecture: 'Turing', generation: 'Quadro RTX', segment: 'workstation', releaseYear: 2018, vramGb: 24, vramType: 'GDDR6', memoryBusBits: 384, memoryBandwidthGbS: 672, pcieGeneration: 3, lengthMm: 267, boardPowerW: 295, recommendedPsuW: 650, powerConnectors: '1× 8-pin + 1× 6-pin', availability: 'discontinued', launchPriceUsd: 6300, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/quadro-rtx-6000-us-nvidia-704093-r4-web.pdf' }),
  researchedGpu({ id: 'nvidia-quadro-rtx-8000', manufacturer: 'NVIDIA', name: 'Quadro RTX 8000', architecture: 'Turing', generation: 'Quadro RTX', segment: 'workstation', releaseYear: 2018, vramGb: 48, vramType: 'GDDR6', memoryBusBits: 384, memoryBandwidthGbS: 672, pcieGeneration: 3, lengthMm: 267, boardPowerW: 295, recommendedPsuW: 650, powerConnectors: '1× 8-pin + 1× 6-pin', availability: 'discontinued', launchPriceUsd: 10000, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/ja/Solutions/design-visualization/documents/quadro-rtx-8000-datasheet-a4-946977-r1-web_JP.pdf' }),
  researchedGpu({ id: 'nvidia-rtx-a5000', manufacturer: 'NVIDIA', name: 'RTX A5000', architecture: 'Ampere', generation: 'RTX A', segment: 'workstation', releaseYear: 2021, vramGb: 24, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 768, pcieGeneration: 4, lengthMm: 267, boardPowerW: 230, recommendedPsuW: 600, powerConnectors: '1× 8-pin', availability: 'discontinued', launchPriceUsd: 2250, sourceUrl: 'https://www.nvidia.com/en-au/products/workstations/rtx-a5000/' }),
  researchedGpu({ id: 'nvidia-rtx-a5500', manufacturer: 'NVIDIA', name: 'RTX A5500', architecture: 'Ampere', generation: 'RTX A', segment: 'workstation', releaseYear: 2022, vramGb: 24, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 768, pcieGeneration: 4, lengthMm: 267, boardPowerW: 230, recommendedPsuW: 600, powerConnectors: '1× 8-pin', availability: 'discontinued', launchPriceUsd: 3499, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/gtcs22/rtx-a5500/nvidia-rtx-a5500-datasheet.pdf' }),
  researchedGpu({ id: 'nvidia-rtx-a6000', manufacturer: 'NVIDIA', name: 'RTX A6000', architecture: 'Ampere', generation: 'RTX A', segment: 'workstation', releaseYear: 2020, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 768, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, recommendedPsuW: 700, powerConnectors: '1× 8-pin', availability: 'discontinued', launchPriceUsd: 4650, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/proviz-print-nvidia-rtx-a6000-datasheet-us-nvidia-1454980-r9-web%20%281%29.pdf' }),
  researchedGpu({ id: 'nvidia-a800-40-active', manufacturer: 'NVIDIA', name: 'A800 40GB Active', architecture: 'Ampere', generation: 'A800', segment: 'workstation', releaseYear: 2023, vramGb: 40, vramType: 'HBM2', memoryBusBits: 5120, memoryBandwidthGbS: 1555.2, pcieGeneration: 4, lengthMm: 267, boardPowerW: 240, recommendedPsuW: 700, powerConnectors: '1× 8-pin', displayOutputs: false, notes: 'Active workstation accelerator with no display connectors; requires a companion display GPU.', sourceUrl: 'https://www.nvidia.com/en-us/products/workstations/a800/' }),
  researchedGpu({ id: 'nvidia-rtx-4500-ada', manufacturer: 'NVIDIA', name: 'RTX 4500 Ada Generation', architecture: 'Ada Lovelace', generation: 'RTX Ada', segment: 'workstation', releaseYear: 2023, vramGb: 24, vramType: 'GDDR6 ECC', memoryBusBits: 192, memoryBandwidthGbS: 432, pcieGeneration: 4, lengthMm: 267, boardPowerW: 210, recommendedPsuW: 600, powerConnectors: '1× 16-pin', launchPriceUsd: 2250, sourceUrl: 'https://www.nvidia.com/en-us/products/workstations/rtx-4500/' }),
  researchedGpu({ id: 'nvidia-rtx-5000-ada', manufacturer: 'NVIDIA', name: 'RTX 5000 Ada Generation', architecture: 'Ada Lovelace', generation: 'RTX Ada', segment: 'workstation', releaseYear: 2023, vramGb: 32, vramType: 'GDDR6 ECC', memoryBusBits: 256, memoryBandwidthGbS: 576, pcieGeneration: 4, lengthMm: 267, boardPowerW: 250, recommendedPsuW: 650, powerConnectors: '1× 16-pin', launchPriceUsd: 4000, sourceUrl: 'https://www.nvidia.com/en-us/products/workstations/rtx-5000/' }),
  researchedGpu({ id: 'nvidia-rtx-5880-ada', manufacturer: 'NVIDIA', name: 'RTX 5880 Ada Generation', architecture: 'Ada Lovelace', generation: 'RTX Ada', segment: 'workstation', releaseYear: 2024, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 960, pcieGeneration: 4, lengthMm: 267, boardPowerW: 285, recommendedPsuW: 700, powerConnectors: '1× 16-pin', availability: 'regional', sourceUrl: 'https://www.nvidia.com/en-us/products/workstations/rtx-5880/' }),
  researchedGpu({ id: 'nvidia-rtx-6000-ada', manufacturer: 'NVIDIA', name: 'RTX 6000 Ada Generation', architecture: 'Ada Lovelace', generation: 'RTX Ada', segment: 'workstation', releaseYear: 2022, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 960, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, recommendedPsuW: 700, powerConnectors: '1× 16-pin', launchPriceUsd: 6800, sourceUrl: 'https://www.nvidia.com/en-us/products/workstations/rtx-6000/' }),
  researchedGpu({ id: 'nvidia-rtx-pro-4000-blackwell-sff', manufacturer: 'NVIDIA', name: 'RTX PRO 4000 Blackwell SFF Edition', architecture: 'Blackwell', generation: 'RTX PRO Blackwell', segment: 'workstation', releaseYear: 2025, vramGb: 24, vramType: 'GDDR7 ECC', memoryBusBits: 192, memoryBandwidthGbS: 432, pcieGeneration: 5, pcieLanes: 8, lengthMm: 168, boardPowerW: 70, recommendedPsuW: 400, slotWidth: 2, height: 'low-profile', powerConnectors: 'Slot powered', fp4AiTops: 770, sourceUrl: 'https://images.nvidia.com/aem-dam/Solutions/design-visualization/quadro-product-literature/workstation-datasheet-blackwell-rtx-pro-4000-sff-nvidia-us-4016700.pdf', tags: ['24 GB', 'Low profile', 'CUDA'] }),
  researchedGpu({ id: 'nvidia-rtx-pro-4000-blackwell', manufacturer: 'NVIDIA', name: 'RTX PRO 4000 Blackwell', architecture: 'Blackwell', generation: 'RTX PRO Blackwell', segment: 'workstation', releaseYear: 2025, vramGb: 24, vramType: 'GDDR7 ECC', memoryBusBits: 192, memoryBandwidthGbS: 672, pcieGeneration: 5, lengthMm: 241, boardPowerW: 145, recommendedPsuW: 500, slotWidth: 1, powerConnectors: '1× 16-pin', fp4AiTops: 1178, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-4000/workstation-datasheet-rtx-pro-4000-nvidia-us-web.pdf' }),
  researchedGpu({ id: 'nvidia-rtx-pro-4500-blackwell', manufacturer: 'NVIDIA', name: 'RTX PRO 4500 Blackwell', architecture: 'Blackwell', generation: 'RTX PRO Blackwell', segment: 'workstation', releaseYear: 2025, vramGb: 32, vramType: 'GDDR7 ECC', memoryBusBits: 256, memoryBandwidthGbS: 896, pcieGeneration: 5, lengthMm: 267, boardPowerW: 200, recommendedPsuW: 600, powerConnectors: '1× 16-pin', fp4AiTops: 1617, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/data-center/rtx-pro-4500-blackwell/workstation-datasheet-blackwell-rtx-pro-4500-we-nvidia-us-5108623-web.pdf' }),
  researchedGpu({ id: 'nvidia-rtx-pro-5000-blackwell-48', manufacturer: 'NVIDIA', name: 'RTX PRO 5000 Blackwell 48GB', architecture: 'Blackwell', generation: 'RTX PRO Blackwell', segment: 'workstation', releaseYear: 2025, vramGb: 48, vramType: 'GDDR7 ECC', memoryBusBits: 384, memoryBandwidthGbS: 1344, pcieGeneration: 5, lengthMm: 267, boardPowerW: 300, recommendedPsuW: 750, powerConnectors: '1× 16-pin', fp4AiTops: 2064, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-5000-blackwell/workstation-datasheet-blackwell-rtx-pro-5000-gtc25-spring-nvidia-3658700.pdf' }),
  researchedGpu({ id: 'nvidia-rtx-pro-5000-blackwell-72', manufacturer: 'NVIDIA', name: 'RTX PRO 5000 Blackwell 72GB', architecture: 'Blackwell', generation: 'RTX PRO Blackwell', segment: 'workstation', releaseYear: 2025, vramGb: 72, vramType: 'GDDR7 ECC', memoryBusBits: 384, memoryBandwidthGbS: 1344, pcieGeneration: 5, lengthMm: 267, boardPowerW: 300, recommendedPsuW: 750, powerConnectors: '1× 16-pin', fp4AiTops: 2064, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-5000-blackwell/workstation-datasheet-blackwell-rtx-pro-5000-gtc25-spring-nvidia-3658700.pdf' }),
  researchedGpu({ id: 'nvidia-rtx-pro-6000-blackwell-maxq', manufacturer: 'NVIDIA', name: 'RTX PRO 6000 Blackwell Max-Q Workstation Edition', architecture: 'Blackwell', generation: 'RTX PRO Blackwell', segment: 'workstation', releaseYear: 2025, vramGb: 96, vramType: 'GDDR7 ECC', memoryBusBits: 512, memoryBandwidthGbS: 1792, pcieGeneration: 5, lengthMm: 267, boardPowerW: 300, recommendedPsuW: 750, powerConnectors: '1× 16-pin', fp4AiTops: 3511, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/workstation-datasheet-blackwell-rtx-pro-6000-max-q-nvidia-3519233.pdf' }),
  researchedGpu({ id: 'nvidia-rtx-pro-6000-blackwell-workstation', manufacturer: 'NVIDIA', name: 'RTX PRO 6000 Blackwell Workstation Edition', architecture: 'Blackwell', generation: 'RTX PRO Blackwell', segment: 'workstation', releaseYear: 2025, vramGb: 96, vramType: 'GDDR7 ECC', memoryBusBits: 512, memoryBandwidthGbS: 1792, pcieGeneration: 5, lengthMm: 305, boardPowerW: 600, recommendedPsuW: 1200, slotWidth: 2, cooling: 'double-flow-through', powerConnectors: '1× 16-pin', fp4AiTops: 4000, sourceUrl: 'https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000/', tags: ['96 GB', 'Blackwell', 'Local AI'] }),

  // NVIDIA data-center / virtual workstation PCIe cards
  researchedGpu({ id: 'nvidia-tesla-k80', manufacturer: 'NVIDIA', name: 'Tesla K80', architecture: 'Kepler', generation: 'Tesla K', segment: 'data-center', releaseYear: 2014, vramGb: 24, vramType: 'GDDR5', memoryBusBits: 768, memoryBandwidthGbS: 480, pcieGeneration: 3, lengthMm: 267, boardPowerW: 300, cooling: 'passive', gpuCount: 2, addressableVramGb: 12, powerConnectors: '1× CPU 8-pin', availability: 'discontinued', notes: 'Two independent 12 GB GPUs; standard PCIe 8-pin GPU cables are not pin-compatible with its CPU/EPS-style connector.', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-product-literature/TeslaK80-datasheet.pdf', tags: ['24 GB physical', '2× 12 GB split', 'Passive'] }),
  researchedGpu({ id: 'nvidia-tesla-m10', manufacturer: 'NVIDIA', name: 'Tesla M10', architecture: 'Maxwell', generation: 'Tesla M', segment: 'data-center', releaseYear: 2016, vramGb: 32, vramType: 'GDDR5', memoryBusBits: 512, memoryBandwidthGbS: 332, pcieGeneration: 3, lengthMm: 267, boardPowerW: 225, cooling: 'passive', gpuCount: 4, addressableVramGb: 8, powerConnectors: '1× CPU 8-pin', availability: 'discontinued', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/solutions/resources/documents1/nvidia-m10-datasheet.pdf', tags: ['32 GB physical', '4× 8 GB split', 'Passive'] }),
  researchedGpu({ id: 'nvidia-tesla-m40-24', manufacturer: 'NVIDIA', name: 'Tesla M40 24GB', architecture: 'Maxwell', generation: 'Tesla M', segment: 'data-center', releaseYear: 2015, vramGb: 24, vramType: 'GDDR5', memoryBusBits: 384, memoryBandwidthGbS: 288, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, cooling: 'passive', powerConnectors: '1× CPU 8-pin', availability: 'discontinued', sourceUrl: 'https://images.nvidia.com/content/quadro/gpu-accelerated/pdf/208584-ME-ProGraphicsLineCard-US-FNL-HR.pdf' }),
  researchedGpu({ id: 'nvidia-tesla-p40', manufacturer: 'NVIDIA', name: 'Tesla P40', architecture: 'Pascal', generation: 'Tesla P', segment: 'data-center', releaseYear: 2016, vramGb: 24, vramType: 'GDDR5', memoryBusBits: 384, memoryBandwidthGbS: 346, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, cooling: 'passive', powerConnectors: '1× CPU 8-pin', availability: 'discontinued', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-product-literature/184427-Tesla-P40-Datasheet-NV-Final-Letter-Web.pdf' }),
  researchedGpu({ id: 'nvidia-tesla-v100-pcie-32', manufacturer: 'NVIDIA', name: 'Tesla V100 PCIe 32GB', architecture: 'Volta', generation: 'Tesla V', segment: 'data-center', releaseYear: 2018, vramGb: 32, vramType: 'HBM2', memoryBusBits: 4096, memoryBandwidthGbS: 900, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, cooling: 'passive', powerConnectors: '1× CPU 8-pin', availability: 'discontinued', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-product-literature/Tesla-V100-PCIe-Product-Brief.pdf' }),
  researchedGpu({ id: 'nvidia-tesla-v100s-pcie-32', manufacturer: 'NVIDIA', name: 'Tesla V100S PCIe 32GB', architecture: 'Volta', generation: 'Tesla V', segment: 'data-center', releaseYear: 2019, vramGb: 32, vramType: 'HBM2', memoryBusBits: 4096, memoryBandwidthGbS: 1134, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, cooling: 'passive', powerConnectors: '1× CPU 8-pin', availability: 'discontinued', sourceUrl: 'https://docs.nvidia.com/ai-enterprise/release-6/latest/infra-software/vgpu/reference/volta.html' }),
  researchedGpu({ id: 'nvidia-quadro-rtx-6000-server', manufacturer: 'NVIDIA', name: 'Quadro RTX 6000 Server Edition', architecture: 'Turing', generation: 'Quadro RTX Server', segment: 'data-center', releaseYear: 2019, vramGb: 24, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 672, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, cooling: 'passive', powerConnectors: '1× CPU 8-pin', availability: 'discontinued', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/NVIDIA-Quadro-RTX-6000-PCIe-Server-Card-PB-FINAL-1219.pdf' }),
  researchedGpu({ id: 'nvidia-quadro-rtx-8000-server', manufacturer: 'NVIDIA', name: 'Quadro RTX 8000 Server Edition', architecture: 'Turing', generation: 'Quadro RTX Server', segment: 'data-center', releaseYear: 2019, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 672, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, cooling: 'passive', powerConnectors: '1× CPU 8-pin', availability: 'discontinued', sourceUrl: 'https://www.nvidia.com/en-gb/design-visualization/quadro-data-center/' }),
  researchedGpu({ id: 'nvidia-a10', manufacturer: 'NVIDIA', name: 'A10', architecture: 'Ampere', generation: 'NVIDIA A', segment: 'data-center', releaseYear: 2021, vramGb: 24, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 600, pcieGeneration: 4, lengthMm: 267, boardPowerW: 150, slotWidth: 1, cooling: 'passive', powerConnectors: '1× CPU 8-pin', sourceUrl: 'https://www.nvidia.com/en-in/data-center/products/a10-gpu/' }),
  researchedGpu({ id: 'nvidia-a16', manufacturer: 'NVIDIA', name: 'A16', architecture: 'Ampere', generation: 'NVIDIA A', segment: 'data-center', releaseYear: 2021, vramGb: 64, vramType: 'GDDR6 ECC', memoryBusBits: 512, memoryBandwidthGbS: 800, pcieGeneration: 4, lengthMm: 267, boardPowerW: 250, cooling: 'passive', gpuCount: 4, addressableVramGb: 16, powerConnectors: '1× CPU 8-pin', notes: 'Four independent 16 GB GPUs intended for virtual desktops; not a unified 64 GB model-memory pool.', sourceUrl: 'https://docs.nvidia.com/vgpu/sizing/virtual-pc/latest/gpu-vpc.html', tags: ['64 GB physical', '4× 16 GB split', 'Passive'] }),
  researchedGpu({ id: 'nvidia-a30', manufacturer: 'NVIDIA', name: 'A30', architecture: 'Ampere', generation: 'NVIDIA A', segment: 'data-center', releaseYear: 2021, vramGb: 24, vramType: 'HBM2 ECC', memoryBusBits: 3072, memoryBandwidthGbS: 933, pcieGeneration: 4, lengthMm: 267, boardPowerW: 165, cooling: 'passive', powerConnectors: '1× CPU 8-pin', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/data-center/products/a30-gpu/pdf/a30-datasheet.pdf' }),
  researchedGpu({ id: 'nvidia-a40', manufacturer: 'NVIDIA', name: 'A40', architecture: 'Ampere', generation: 'NVIDIA A', segment: 'data-center', releaseYear: 2020, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 696, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, cooling: 'passive', powerConnectors: '1× CPU 8-pin', notes: 'DisplayPort connectors are disabled by default and must be enabled for supported visualization deployments.', sourceUrl: 'https://images.nvidia.com/content/Solutions/data-center/a40/nvidia-a40-datasheet.pdf' }),
  researchedGpu({ id: 'nvidia-a100-pcie-40', manufacturer: 'NVIDIA', name: 'A100 PCIe 40GB', architecture: 'Ampere', generation: 'NVIDIA A100', segment: 'data-center', releaseYear: 2020, vramGb: 40, vramType: 'HBM2 ECC', memoryBusBits: 5120, memoryBandwidthGbS: 1555, pcieGeneration: 4, lengthMm: 267, boardPowerW: 250, cooling: 'passive', powerConnectors: '1× CPU 8-pin', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf' }),
  researchedGpu({ id: 'nvidia-a100-pcie-80', manufacturer: 'NVIDIA', name: 'A100 PCIe 80GB', architecture: 'Ampere', generation: 'NVIDIA A100', segment: 'data-center', releaseYear: 2021, vramGb: 80, vramType: 'HBM2e ECC', memoryBusBits: 5120, memoryBandwidthGbS: 1935, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, cooling: 'passive', powerConnectors: '1× CPU 8-pin', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf' }),
  researchedGpu({ id: 'nvidia-a800-pcie-80', manufacturer: 'NVIDIA', name: 'A800 PCIe 80GB', architecture: 'Ampere', generation: 'NVIDIA A800', segment: 'data-center', releaseYear: 2022, vramGb: 80, vramType: 'HBM2e ECC', memoryBusBits: 5120, memoryBandwidthGbS: 1935, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, cooling: 'passive', powerConnectors: '1× CPU 8-pin', availability: 'regional', notes: 'China-market data-center accelerator with restricted interconnect bandwidth.', sourceUrl: 'https://docs.nvidia.com/datacenter/tesla/tesla-release-notes-525-105-17/index.html' }),
  researchedGpu({ id: 'nvidia-l2', manufacturer: 'NVIDIA', name: 'L2', architecture: 'Ada Lovelace', generation: 'NVIDIA L', segment: 'data-center', releaseYear: 2023, vramGb: 24, vramType: 'GDDR6 ECC', pcieGeneration: 4, boardPowerW: 0, slotWidth: 1, cooling: 'passive', notes: 'NVIDIA documents the 24 GB physical framebuffer in vGPU profiles but does not publish a public retail board specification; verify OEM power and dimensions.', sourceUrl: 'https://docs.nvidia.com/ai-enterprise/release-5/5.2/appendix/appendix-misc.html' }),
  researchedGpu({ id: 'nvidia-l4', manufacturer: 'NVIDIA', name: 'L4', architecture: 'Ada Lovelace', generation: 'NVIDIA L', segment: 'data-center', releaseYear: 2023, vramGb: 24, vramType: 'GDDR6 ECC', memoryBusBits: 192, memoryBandwidthGbS: 300, pcieGeneration: 4, lengthMm: 168, boardPowerW: 72, slotWidth: 1, height: 'low-profile', cooling: 'passive', powerConnectors: 'Slot powered', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/l4/PB-11316-001_v01.pdf', tags: ['24 GB', 'Low profile', 'Passive'] }),
  researchedGpu({ id: 'nvidia-l20', manufacturer: 'NVIDIA', name: 'L20', architecture: 'Ada Lovelace', generation: 'NVIDIA L', segment: 'data-center', releaseYear: 2024, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 864, pcieGeneration: 4, lengthMm: 267, boardPowerW: 275, cooling: 'passive', powerConnectors: '1× CPU 8-pin', availability: 'regional', notes: 'OEM-focused air-cooled card; a separate liquid-cooled L20 configuration also exists.', sourceUrl: 'https://docs.nvidia.com/ai-enterprise/release-6/6.2/appendix/vgpu.html' }),
  researchedGpu({ id: 'nvidia-l40', manufacturer: 'NVIDIA', name: 'L40', architecture: 'Ada Lovelace', generation: 'NVIDIA L', segment: 'data-center', releaseYear: 2022, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 864, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, cooling: 'passive', powerConnectors: '1× CPU 8-pin', sourceUrl: 'https://www.nvidia.com/en-in/data-center/l40/' }),
  researchedGpu({ id: 'nvidia-l40s', manufacturer: 'NVIDIA', name: 'L40S', architecture: 'Ada Lovelace', generation: 'NVIDIA L', segment: 'data-center', releaseYear: 2023, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 864, pcieGeneration: 4, lengthMm: 267, boardPowerW: 350, cooling: 'passive', powerConnectors: '1× CPU 8-pin', sourceUrl: 'https://www.nvidia.com/en-us/data-center/l40s/' }),
  researchedGpu({ id: 'nvidia-h100-pcie-80', manufacturer: 'NVIDIA', name: 'H100 PCIe 80GB', architecture: 'Hopper', generation: 'NVIDIA H100', segment: 'data-center', releaseYear: 2022, vramGb: 80, vramType: 'HBM2e ECC', memoryBusBits: 5120, memoryBandwidthGbS: 2000, pcieGeneration: 5, lengthMm: 267, boardPowerW: 350, cooling: 'passive', powerConnectors: '1× 16-pin', sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/gtcs22/data-center/h100/PB-11133-001_v01.pdf' }),
  researchedGpu({ id: 'nvidia-h100-nvl', manufacturer: 'NVIDIA', name: 'H100 NVL 94GB', architecture: 'Hopper', generation: 'NVIDIA H100', segment: 'data-center', releaseYear: 2023, vramGb: 94, vramType: 'HBM3 ECC', memoryBusBits: 6144, memoryBandwidthGbS: 3900, pcieGeneration: 5, lengthMm: 267, boardPowerW: 400, cooling: 'passive', powerConnectors: '1× 16-pin', notes: 'Usually sold and bridged in pairs for 188 GB total; each PCIe card has one unified 94 GB pool.', sourceUrl: 'https://www.nvidia.com/en-us/data-center/h100/' }),
  researchedGpu({ id: 'nvidia-h200-nvl', manufacturer: 'NVIDIA', name: 'H200 NVL', architecture: 'Hopper', generation: 'NVIDIA H200', segment: 'data-center', releaseYear: 2024, vramGb: 141, vramType: 'HBM3e ECC', memoryBusBits: 6144, memoryBandwidthGbS: 4800, pcieGeneration: 5, lengthMm: 267, boardPowerW: 600, cooling: 'passive', powerConnectors: '1× 16-pin', sourceUrl: 'https://www.nvidia.com/en-au/data-center/h200/', tags: ['141 GB', 'Hopper', 'Server airflow'] }),
  researchedGpu({ id: 'nvidia-h800-pcie-80', manufacturer: 'NVIDIA', name: 'H800 PCIe 80GB', architecture: 'Hopper', generation: 'NVIDIA H800', segment: 'data-center', releaseYear: 2022, vramGb: 80, vramType: 'HBM2e ECC', memoryBusBits: 5120, memoryBandwidthGbS: 2000, pcieGeneration: 5, lengthMm: 267, boardPowerW: 350, cooling: 'passive', powerConnectors: '1× 16-pin', availability: 'regional', notes: 'China-market Hopper accelerator with export-compliant interconnect limits.', sourceUrl: 'https://docs.nvidia.com/ai-enterprise-4.3/ai-enterprise/4.3/user-guide/index.html' }),
  researchedGpu({ id: 'nvidia-h800-nvl', manufacturer: 'NVIDIA', name: 'H800 NVL 94GB', architecture: 'Hopper', generation: 'NVIDIA H800', segment: 'data-center', releaseYear: 2023, vramGb: 94, vramType: 'HBM3 ECC', memoryBusBits: 6144, memoryBandwidthGbS: 3900, pcieGeneration: 5, lengthMm: 267, boardPowerW: 400, cooling: 'passive', powerConnectors: '1× 16-pin', availability: 'regional', sourceUrl: 'https://docs.nvidia.com/ai-enterprise/release-8/latest/infra-software/vgpu/features/multi-vgpu.html' }),
  researchedGpu({ id: 'nvidia-rtx-pro-4500-blackwell-server', manufacturer: 'NVIDIA', name: 'RTX PRO 4500 Blackwell Server Edition', architecture: 'Blackwell', generation: 'RTX PRO Blackwell Server', segment: 'data-center', releaseYear: 2026, vramGb: 32, vramType: 'GDDR7 ECC', memoryBusBits: 256, memoryBandwidthGbS: 800, pcieGeneration: 5, lengthMm: 267, boardPowerW: 165, slotWidth: 1, cooling: 'passive', powerConnectors: '1× 16-pin', fp4AiTops: 1600, sourceUrl: 'https://www.nvidia.com/en-us/data-center/rtx-pro-4500-blackwell-server-edition/' }),
  researchedGpu({ id: 'nvidia-rtx-pro-6000-blackwell-server', manufacturer: 'NVIDIA', name: 'RTX PRO 6000 Blackwell Server Edition', architecture: 'Blackwell', generation: 'RTX PRO Blackwell Server', segment: 'data-center', releaseYear: 2025, vramGb: 96, vramType: 'GDDR7 ECC', memoryBusBits: 512, memoryBandwidthGbS: 1597, pcieGeneration: 5, lengthMm: 267, boardPowerW: 600, cooling: 'passive', powerConnectors: '1× 16-pin', fp4AiTops: 4000, sourceUrl: 'https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/' }),
  researchedGpu({ id: 'nvidia-rtx-pro-6000d-blackwell-server', manufacturer: 'NVIDIA', name: 'RTX PRO 6000D Blackwell Server Edition', architecture: 'Blackwell', generation: 'RTX PRO Blackwell Server', segment: 'data-center', releaseYear: 2026, vramGb: 84, vramType: 'GDDR7 ECC', pcieGeneration: 5, lengthMm: 267, boardPowerW: 600, cooling: 'passive', powerConnectors: '1× 16-pin', availability: 'regional', notes: 'China-market server edition; NVIDIA publicly documents the 84 GB full-framebuffer vGPU profile, while detailed board specifications remain OEM-controlled.', sourceUrl: 'https://docs.nvidia.com/vgpu/latest/pdf/grid-vgpu-release-notes-generic-linux-kvm.pdf' }),

  // AMD consumer and professional workstation cards
  researchedGpu({ id: 'amd-firepro-w9100-32', manufacturer: 'AMD', name: 'FirePro W9100 32GB', architecture: 'GCN 2 (Hawaii)', generation: 'FirePro W', segment: 'workstation', releaseYear: 2016, vramGb: 32, vramType: 'GDDR5', memoryBusBits: 512, memoryBandwidthGbS: 320, pcieGeneration: 3, lengthMm: 279, boardPowerW: 275, recommendedPsuW: 750, powerConnectors: '1× 8-pin + 1× 6-pin', availability: 'discontinued', launchPriceUsd: 3999, sourceUrl: 'https://www.amd.com/en/newsroom/press-releases/2016-4-14-amd-announces-world-s-first-professional-workstati.html' }),
  researchedGpu({ id: 'amd-radeon-pro-duo-polaris', manufacturer: 'AMD', name: 'Radeon Pro Duo (Polaris)', architecture: 'Polaris', generation: 'Radeon Pro Duo', segment: 'workstation', releaseYear: 2017, vramGb: 32, vramType: 'GDDR5', memoryBusBits: 512, memoryBandwidthGbS: 448, pcieGeneration: 3, lengthMm: 267, boardPowerW: 250, recommendedPsuW: 700, gpuCount: 2, addressableVramGb: 16, powerConnectors: '1× 8-pin + 1× 6-pin', availability: 'discontinued', launchPriceUsd: 999, sourceUrl: 'https://www.amd.com/en/newsroom/press-releases/2017-4-24-the-new-radeon-pro-duo-delivers-professional-grade.html', tags: ['32 GB physical', '2× 16 GB split', 'Active'] }),
  researchedGpu({ id: 'amd-radeon-pro-w6800', manufacturer: 'AMD', name: 'Radeon PRO W6800', architecture: 'RDNA 2', generation: 'Radeon PRO W6000', segment: 'workstation', releaseYear: 2021, vramGb: 32, vramType: 'GDDR6 ECC', memoryBusBits: 256, memoryBandwidthGbS: 512, pcieGeneration: 4, lengthMm: 267, boardPowerW: 250, recommendedPsuW: 650, powerConnectors: '1× 8-pin + 1× 6-pin', availability: 'discontinued', launchPriceUsd: 2249, sourceUrl: 'https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w6800-datasheet.pdf' }),
  researchedGpu({ id: 'amd-radeon-pro-w7800-32', manufacturer: 'AMD', name: 'Radeon PRO W7800 32GB', architecture: 'RDNA 3', generation: 'Radeon PRO W7000', segment: 'workstation', releaseYear: 2023, vramGb: 32, vramType: 'GDDR6 ECC', memoryBusBits: 256, memoryBandwidthGbS: 576, pcieGeneration: 4, lengthMm: 280, boardPowerW: 260, recommendedPsuW: 700, powerConnectors: '2× 8-pin', launchPriceUsd: 2499, sourceUrl: 'https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w7800-datasheet.pdf' }),
  researchedGpu({ id: 'amd-radeon-pro-w7800-48', manufacturer: 'AMD', name: 'Radeon PRO W7800 48GB', architecture: 'RDNA 3', generation: 'Radeon PRO W7000', segment: 'workstation', releaseYear: 2024, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 864, pcieGeneration: 4, lengthMm: 280, boardPowerW: 260, recommendedPsuW: 700, powerConnectors: '2× 8-pin', sourceUrl: 'https://www.amd.com/en/products/graphics/workstations/radeon-pro/w7800-48gb.html' }),
  researchedGpu({ id: 'amd-radeon-pro-w7900', manufacturer: 'AMD', name: 'Radeon PRO W7900', architecture: 'RDNA 3', generation: 'Radeon PRO W7000', segment: 'workstation', releaseYear: 2023, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 864, pcieGeneration: 4, lengthMm: 280, boardPowerW: 295, recommendedPsuW: 750, slotWidth: 3, powerConnectors: '2× 8-pin', launchPriceUsd: 3999, sourceUrl: 'https://www.amd.com/en/products/specifications/professional-graphics.html' }),
  researchedGpu({ id: 'amd-radeon-pro-w7900-dual-slot', manufacturer: 'AMD', name: 'Radeon PRO W7900 Dual Slot', architecture: 'RDNA 3', generation: 'Radeon PRO W7000', segment: 'workstation', releaseYear: 2024, vramGb: 48, vramType: 'GDDR6 ECC', memoryBusBits: 384, memoryBandwidthGbS: 864, pcieGeneration: 4, lengthMm: 280, boardPowerW: 295, recommendedPsuW: 750, slotWidth: 2, powerConnectors: '2× 8-pin', launchPriceUsd: 3499, sourceUrl: 'https://www.amd.com/en/products/specifications/professional-graphics.html', tags: ['48 GB', 'Dual slot', 'ROCm'] }),
  researchedGpu({ id: 'amd-rx-7900-xtx', manufacturer: 'AMD', name: 'Radeon RX 7900 XTX', architecture: 'RDNA 3', generation: 'Radeon RX 7000', segment: 'consumer', releaseYear: 2022, vramGb: 24, vramType: 'GDDR6', memoryBusBits: 384, memoryBandwidthGbS: 960, pcieGeneration: 4, lengthMm: 287, boardPowerW: 355, recommendedPsuW: 800, slotWidth: 2.5, powerConnectors: '2× 8-pin', launchPriceUsd: 999, sourceUrl: 'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900xtx.html', tags: ['24 GB', 'RDNA 3', 'ROCm'] }),
  researchedGpu({ id: 'amd-radeon-ai-pro-r9700', manufacturer: 'AMD', name: 'Radeon AI PRO R9700', architecture: 'RDNA 4', generation: 'Radeon AI PRO R9000', segment: 'workstation', releaseYear: 2025, vramGb: 32, vramType: 'GDDR6 ECC', memoryBusBits: 256, memoryBandwidthGbS: 640, pcieGeneration: 5, boardPowerW: 300, recommendedPsuW: 750, powerConnectors: '2× 8-pin', notes: 'Active dual-slot partner card; exact length and display connectors vary by board partner.', launchPriceUsd: 1299, sourceUrl: 'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html', tags: ['32 GB', 'RDNA 4', 'Local AI'] }),
  researchedGpu({ id: 'amd-radeon-ai-pro-r9600', manufacturer: 'AMD', name: 'Radeon AI PRO R9600', architecture: 'RDNA 4', generation: 'Radeon AI PRO R9000', segment: 'workstation', releaseYear: 2026, vramGb: 32, vramType: 'GDDR6 ECC', memoryBusBits: 256, memoryBandwidthGbS: 640, pcieGeneration: 5, boardPowerW: 150, recommendedPsuW: 450, slotWidth: 1, powerConnectors: '1× 16-pin', notes: 'Active single-slot partner card; exact length and display connectors vary by board partner.', sourceUrl: 'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9600.html', tags: ['32 GB', 'Single slot', 'Local AI'] }),

  // AMD data-center / passive PCIe cards
  researchedGpu({ id: 'amd-firepro-s9170', manufacturer: 'AMD', name: 'FirePro S9170', architecture: 'GCN 2 (Hawaii)', generation: 'FirePro S', segment: 'data-center', releaseYear: 2015, vramGb: 32, vramType: 'GDDR5 ECC', memoryBusBits: 512, memoryBandwidthGbS: 320, pcieGeneration: 3, lengthMm: 267, boardPowerW: 275, cooling: 'passive', powerConnectors: '1× 8-pin + 1× 6-pin', availability: 'discontinued', sourceUrl: 'https://ir.amd.com/news-events/press-releases/detail/624/amd-delivers-worlds-first-server-gpu-with-industry-leading-32gb-memory-for-high-performance-compute' }),
  researchedGpu({ id: 'amd-radeon-pro-v340', manufacturer: 'AMD', name: 'Radeon Pro V340', architecture: 'Vega', generation: 'Radeon Pro V', segment: 'data-center', releaseYear: 2018, vramGb: 32, vramType: 'HBM2 ECC', memoryBusBits: 4096, memoryBandwidthGbS: 968, pcieGeneration: 3, lengthMm: 267, boardPowerW: 300, cooling: 'passive', gpuCount: 2, addressableVramGb: 16, powerConnectors: '1× CPU 8-pin', availability: 'discontinued', sourceUrl: 'https://www.amd.com/en/newsroom/press-releases/2018-8-26-new-amd-radeon-pro-v340-graphics-card-delivers-ac.html', tags: ['32 GB physical', '2× 16 GB split', 'Passive'] }),
  researchedGpu({ id: 'amd-radeon-pro-v620', manufacturer: 'AMD', name: 'Radeon PRO V620', architecture: 'RDNA 2', generation: 'Radeon PRO V', segment: 'data-center', releaseYear: 2021, vramGb: 32, vramType: 'GDDR6 ECC', memoryBusBits: 256, memoryBandwidthGbS: 512, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, cooling: 'passive', powerConnectors: '2× 8-pin', sourceUrl: 'https://www.amd.com/en/products/accelerators/radeon-pro/amd-radeon-pro-v620.html' }),
  researchedGpu({ id: 'amd-radeon-pro-v710', manufacturer: 'AMD', name: 'Radeon PRO V710', architecture: 'RDNA 3', generation: 'Radeon PRO V', segment: 'data-center', releaseYear: 2024, vramGb: 28, vramType: 'GDDR6 ECC', memoryBusBits: 224, memoryBandwidthGbS: 448, pcieGeneration: 4, lengthMm: 267, boardPowerW: 158, slotWidth: 1, cooling: 'passive', powerConnectors: '1× 8-pin', sourceUrl: 'https://www.amd.com/en/products/accelerators/radeon-pro/amd-radeon-pro-v710.html' }),
  researchedGpu({ id: 'amd-instinct-mi50-32', manufacturer: 'AMD', name: 'Instinct MI50 32GB', architecture: 'Vega 20', generation: 'Instinct MI50', segment: 'data-center', releaseYear: 2018, vramGb: 32, vramType: 'HBM2 ECC', memoryBusBits: 4096, memoryBandwidthGbS: 1024, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, cooling: 'passive', powerConnectors: '2× 8-pin', availability: 'discontinued', sourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/accelerators/instinct/instinct-mi-series/instinct-mi50.html' }),
  researchedGpu({ id: 'amd-instinct-mi60', manufacturer: 'AMD', name: 'Instinct MI60', architecture: 'Vega 20', generation: 'Instinct MI60', segment: 'data-center', releaseYear: 2018, vramGb: 32, vramType: 'HBM2 ECC', memoryBusBits: 4096, memoryBandwidthGbS: 1024, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, cooling: 'passive', powerConnectors: '2× 8-pin', availability: 'discontinued', sourceUrl: 'https://www.amd.com/en/support/downloads/drivers.html/accelerators/instinct/instinct-mi-series/instinct-mi60.html' }),
  researchedGpu({ id: 'amd-instinct-mi100', manufacturer: 'AMD', name: 'Instinct MI100', architecture: 'CDNA 1', generation: 'Instinct MI100', segment: 'data-center', releaseYear: 2020, vramGb: 32, vramType: 'HBM2 ECC', memoryBusBits: 4096, memoryBandwidthGbS: 1228.8, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, cooling: 'passive', powerConnectors: '2× 8-pin', availability: 'discontinued', sourceUrl: 'https://www.amd.com/en/products/accelerators/instinct/mi100.html' }),
  researchedGpu({ id: 'amd-instinct-mi210', manufacturer: 'AMD', name: 'Instinct MI210', architecture: 'CDNA 2', generation: 'Instinct MI200', segment: 'data-center', releaseYear: 2021, vramGb: 64, vramType: 'HBM2e ECC', memoryBusBits: 4096, memoryBandwidthGbS: 1638.4, pcieGeneration: 4, lengthMm: 267, boardPowerW: 300, cooling: 'passive', powerConnectors: '2× 8-pin', sourceUrl: 'https://www.amd.com/en/products/accelerators/instinct/mi200/mi210.html' }),
  researchedGpu({ id: 'amd-instinct-mi350p', manufacturer: 'AMD', name: 'Instinct MI350P PCIe', architecture: 'CDNA 4', generation: 'Instinct MI350', segment: 'data-center', releaseYear: 2026, vramGb: 144, vramType: 'HBM3e ECC', memoryBusBits: 4096, memoryBandwidthGbS: 4000, pcieGeneration: 5, lengthMm: 267, boardPowerW: 600, cooling: 'passive', powerConnectors: '1× 16-pin', notes: '600 W maximum, configurable to 450 W; requires a qualified server power and airflow envelope.', sourceUrl: 'https://www.amd.com/en/products/accelerators/instinct/mi350/mi350p.html', tags: ['144 GB', 'CDNA 4', 'Server airflow'] }),
  researchedGpu({ id: 'amd-radeon-ai-pro-r9700s', manufacturer: 'AMD', name: 'Radeon AI PRO R9700S', architecture: 'RDNA 4', generation: 'Radeon AI PRO R9000', segment: 'data-center', releaseYear: 2026, vramGb: 32, vramType: 'GDDR6 ECC', memoryBusBits: 256, memoryBandwidthGbS: 640, pcieGeneration: 5, boardPowerW: 300, cooling: 'passive', powerConnectors: '2× 8-pin', notes: 'Passive dual-slot partner card; exact length varies by board partner.', sourceUrl: 'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700s.html' }),
  researchedGpu({ id: 'amd-radeon-ai-pro-r9600d', manufacturer: 'AMD', name: 'Radeon AI PRO R9600D', architecture: 'RDNA 4', generation: 'Radeon AI PRO R9000', segment: 'data-center', releaseYear: 2026, vramGb: 32, vramType: 'GDDR6 ECC', memoryBusBits: 256, memoryBandwidthGbS: 640, pcieGeneration: 5, boardPowerW: 150, recommendedPsuW: 450, slotWidth: 1, cooling: 'passive', powerConnectors: '1× 16-pin', notes: 'Passive single-slot partner card; AMD labels the product render not available for direct purchase.', sourceUrl: 'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9600d.html' }),
];

// Existing representative sub-24 GB cards remain in the general catalog so the
// builder can compare mainstream options alongside the exhaustive high-VRAM set.
const mainstreamGpus: Gpu[] = [
  // NVIDIA Ampere consumer cards. These sub-24 GB models are included because
  // they remain common, inexpensive local-inference options on the used market.
  researchedGpu({ id: 'nvidia-rtx-3060', manufacturer: 'NVIDIA', name: 'GeForce RTX 3060 12GB', architecture: 'Ampere', generation: 'GeForce RTX 30', segment: 'consumer', releaseYear: 2021, vramGb: 12, vramType: 'GDDR6', memoryBusBits: 192, memoryBandwidthGbS: 360, pcieGeneration: 4, boardPowerW: 170, recommendedPsuW: 550, powerConnectors: '1× 8-pin', availability: 'discontinued', launchPriceUsd: 329, notes: 'No NVIDIA Founders Edition; dimensions, cooling, and display layout vary by board partner.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['12 GB', 'Ampere', 'Used AI value'] }),
  researchedGpu({ id: 'nvidia-rtx-3060-ti', manufacturer: 'NVIDIA', name: 'GeForce RTX 3060 Ti Founders Edition', architecture: 'Ampere', generation: 'GeForce RTX 30', segment: 'consumer', releaseYear: 2020, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbS: 448, pcieGeneration: 4, lengthMm: 242, boardPowerW: 200, recommendedPsuW: 600, slotWidth: 2, powerConnectors: '1× 12-pin adapter', availability: 'discontinued', launchPriceUsd: 399, sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['8 GB', 'Ampere', 'Entry AI'] }),
  researchedGpu({ id: 'nvidia-rtx-3070', manufacturer: 'NVIDIA', name: 'GeForce RTX 3070 Founders Edition', architecture: 'Ampere', generation: 'GeForce RTX 30', segment: 'consumer', releaseYear: 2020, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbS: 448, pcieGeneration: 4, lengthMm: 242, boardPowerW: 220, recommendedPsuW: 650, slotWidth: 2, powerConnectors: '1× 12-pin adapter', availability: 'discontinued', launchPriceUsd: 499, sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['8 GB', 'Ampere', 'Entry AI'] }),
  researchedGpu({ id: 'nvidia-rtx-3070-ti', manufacturer: 'NVIDIA', name: 'GeForce RTX 3070 Ti Founders Edition', architecture: 'Ampere', generation: 'GeForce RTX 30', segment: 'consumer', releaseYear: 2021, vramGb: 8, vramType: 'GDDR6X', memoryBusBits: 256, memoryBandwidthGbS: 608.3, pcieGeneration: 4, lengthMm: 267, boardPowerW: 290, recommendedPsuW: 750, slotWidth: 2, powerConnectors: '1× 12-pin adapter', availability: 'discontinued', launchPriceUsd: 599, sourceUrl: 'https://www.nvidia.com/en-us/geforce/news/rtx-3080-ti-3070-ti-graphics-cards/', tags: ['8 GB', 'Ampere', 'Entry AI'] }),
  researchedGpu({ id: 'nvidia-rtx-3080', manufacturer: 'NVIDIA', name: 'GeForce RTX 3080 Founders Edition 10GB', architecture: 'Ampere', generation: 'GeForce RTX 30', segment: 'consumer', releaseYear: 2020, vramGb: 10, vramType: 'GDDR6X', memoryBusBits: 320, memoryBandwidthGbS: 760.3, pcieGeneration: 4, lengthMm: 285, boardPowerW: 320, recommendedPsuW: 750, slotWidth: 2, powerConnectors: '1× 12-pin adapter', availability: 'discontinued', launchPriceUsd: 699, sourceUrl: 'https://www.nvidia.com/en-eu/geforce/graphics-cards/30-series/rtx-3080-3080ti/', tags: ['10 GB', 'Ampere', 'Local AI'] }),
  researchedGpu({ id: 'nvidia-rtx-3080-ti', manufacturer: 'NVIDIA', name: 'GeForce RTX 3080 Ti Founders Edition', architecture: 'Ampere', generation: 'GeForce RTX 30', segment: 'consumer', releaseYear: 2021, vramGb: 12, vramType: 'GDDR6X', memoryBusBits: 384, memoryBandwidthGbS: 912, pcieGeneration: 4, lengthMm: 285, boardPowerW: 350, recommendedPsuW: 750, slotWidth: 2, powerConnectors: '1× 12-pin adapter', availability: 'discontinued', launchPriceUsd: 1199, sourceUrl: 'https://www.nvidia.com/en-us/geforce/news/rtx-3080-ti-3070-ti-graphics-cards/', tags: ['12 GB', 'Ampere', 'Local AI'] }),

  // NVIDIA Ada consumer cards. Keeping the 8 GB and 16 GB 4060 Ti variants
  // separate prevents model-fit and used-price comparisons from being distorted.
  researchedGpu({ id: 'nvidia-rtx-4060', manufacturer: 'NVIDIA', name: 'GeForce RTX 4060 8GB', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40', segment: 'consumer', releaseYear: 2023, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbS: 272, pcieGeneration: 4, pcieLanes: 8, boardPowerW: 115, recommendedPsuW: 550, powerConnectors: '1× 8-pin', launchPriceUsd: 299, notes: 'No NVIDIA Founders Edition; dimensions, cooling, and display layout vary by board partner.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['8 GB', 'Ada Lovelace', 'Entry AI'] }),
  researchedGpu({ id: 'nvidia-rtx-4060-ti-8', manufacturer: 'NVIDIA', name: 'GeForce RTX 4060 Ti 8GB', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40', segment: 'consumer', releaseYear: 2023, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbS: 288, pcieGeneration: 4, pcieLanes: 8, lengthMm: 244, boardPowerW: 160, recommendedPsuW: 550, slotWidth: 2, powerConnectors: '1× 8-pin or 16-pin adapter', launchPriceUsd: 399, notes: 'The benchmark and market records are tied to the 8 GB version, not the physically similar 16 GB card.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['8 GB', 'Ada Lovelace', 'Entry AI'] }),
  researchedGpu({ id: 'nvidia-rtx-4060-ti-16', manufacturer: 'NVIDIA', name: 'GeForce RTX 4060 Ti 16GB', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40', segment: 'consumer', releaseYear: 2023, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbS: 288, pcieGeneration: 4, pcieLanes: 8, boardPowerW: 165, recommendedPsuW: 550, powerConnectors: '1× 8-pin or 16-pin adapter', launchPriceUsd: 499, notes: 'No NVIDIA Founders Edition for the 16 GB model; board design varies by manufacturer.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['16 GB', 'Ada Lovelace', 'Local AI'] }),
  researchedGpu({ id: 'nvidia-rtx-4070', manufacturer: 'NVIDIA', name: 'GeForce RTX 4070 Founders Edition', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40', segment: 'consumer', releaseYear: 2023, vramGb: 12, vramType: 'GDDR6X', memoryBusBits: 192, memoryBandwidthGbS: 504, pcieGeneration: 4, lengthMm: 244, boardPowerW: 200, recommendedPsuW: 650, slotWidth: 2, powerConnectors: '1× 16-pin adapter', launchPriceUsd: 599, sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['12 GB', 'Ada Lovelace', 'Local AI'] }),
  researchedGpu({ id: 'nvidia-rtx-4070-super', manufacturer: 'NVIDIA', name: 'GeForce RTX 4070 SUPER Founders Edition', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40 SUPER', segment: 'consumer', releaseYear: 2024, vramGb: 12, vramType: 'GDDR6X', memoryBusBits: 192, memoryBandwidthGbS: 504, pcieGeneration: 4, lengthMm: 244, boardPowerW: 220, recommendedPsuW: 650, slotWidth: 2, cooling: 'double-flow-through', powerConnectors: '1× 16-pin adapter', launchPriceUsd: 599, notes: 'Its fixed-profile llama.cpp result uses Vulkan; CUDA and Vulkan results are kept backend-labelled because their prompt-processing paths differ.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['12 GB', 'Ada Lovelace', 'Local AI', 'Measured LLM'] }),
  researchedGpu({ id: 'nvidia-rtx-4070-ti', manufacturer: 'NVIDIA', name: 'GeForce RTX 4070 Ti 12GB', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40', segment: 'consumer', releaseYear: 2023, vramGb: 12, vramType: 'GDDR6X', memoryBusBits: 192, memoryBandwidthGbS: 504, pcieGeneration: 4, boardPowerW: 285, recommendedPsuW: 700, powerConnectors: '1× 16-pin', launchPriceUsd: 799, notes: 'No NVIDIA Founders Edition; dimensions, cooling, and display layout vary by board partner.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['12 GB', 'Ada Lovelace', 'Local AI'] }),
  researchedGpu({ id: 'nvidia-rtx-4070-ti-super', manufacturer: 'NVIDIA', name: 'GeForce RTX 4070 Ti SUPER 16GB', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40 SUPER', segment: 'consumer', releaseYear: 2024, vramGb: 16, vramType: 'GDDR6X', memoryBusBits: 256, memoryBandwidthGbS: 672, pcieGeneration: 4, boardPowerW: 285, recommendedPsuW: 700, powerConnectors: '1× 16-pin', launchPriceUsd: 799, notes: 'No NVIDIA Founders Edition; dimensions, cooling, and display layout vary by board partner.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs', tags: ['16 GB', 'Ada Lovelace', 'Local AI', 'Measured LLM'] }),
  researchedGpu({ id: 'nvidia-rtx-4080', manufacturer: 'NVIDIA', name: 'GeForce RTX 4080 Founders Edition', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40', segment: 'consumer', releaseYear: 2022, vramGb: 16, vramType: 'GDDR6X', memoryBusBits: 256, memoryBandwidthGbS: 716.8, pcieGeneration: 4, lengthMm: 304, boardPowerW: 320, recommendedPsuW: 750, slotWidth: 3, cooling: 'double-flow-through', powerConnectors: '1× 16-pin', availability: 'discontinued', launchPriceUsd: 1199, sourceUrl: 'https://www.nvidia.com/en-gb/geforce/graphics-cards/40-series/rtx-4080-family/', tags: ['16 GB', 'Ada Lovelace', 'Local AI', 'Measured LLM'] }),
  researchedGpu({ id: 'nvidia-rtx-4080-super', manufacturer: 'NVIDIA', name: 'GeForce RTX 4080 SUPER Founders Edition', architecture: 'Ada Lovelace', generation: 'GeForce RTX 40 SUPER', segment: 'consumer', releaseYear: 2024, vramGb: 16, vramType: 'GDDR6X', memoryBusBits: 256, memoryBandwidthGbS: 736.3, pcieGeneration: 4, lengthMm: 304, boardPowerW: 320, recommendedPsuW: 750, slotWidth: 3, cooling: 'double-flow-through', powerConnectors: '1× 16-pin', launchPriceUsd: 999, sourceUrl: 'https://www.nvidia.com/en-gb/geforce/graphics-cards/40-series/rtx-4080-family/', tags: ['16 GB', 'Ada Lovelace', 'Local AI', 'Measured LLM'] }),

  researchedGpu({ id: 'nvidia-rtx-5080', manufacturer: 'NVIDIA', name: 'GeForce RTX 5080 Founders Edition', architecture: 'Blackwell', generation: 'GeForce RTX 50', segment: 'consumer', releaseYear: 2025, vramGb: 16, vramType: 'GDDR7', memoryBusBits: 256, memoryBandwidthGbS: 960, pcieGeneration: 5, lengthMm: 304, boardPowerW: 360, recommendedPsuW: 850, slotWidth: 2, cooling: 'double-flow-through', powerConnectors: '1× 16-pin', launchPriceUsd: 999, fp4AiTops: 1801, sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/', tags: ['16 GB', 'Blackwell', 'Local AI'] }),
  researchedGpu({ id: 'nvidia-rtx-5070-ti', manufacturer: 'NVIDIA', name: 'GeForce RTX 5070 Ti', architecture: 'Blackwell', generation: 'GeForce RTX 50', segment: 'consumer', releaseYear: 2025, vramGb: 16, vramType: 'GDDR7', memoryBusBits: 256, memoryBandwidthGbS: 896, pcieGeneration: 5, boardPowerW: 300, recommendedPsuW: 750, powerConnectors: '1× 16-pin', launchPriceUsd: 749, fp4AiTops: 1406, notes: 'No NVIDIA Founders Edition; length, slot width, cooling, and display layout vary by board partner.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/', tags: ['16 GB', 'Blackwell', 'Local AI'] }),
  researchedGpu({ id: 'nvidia-rtx-5070', manufacturer: 'NVIDIA', name: 'GeForce RTX 5070 Founders Edition', architecture: 'Blackwell', generation: 'GeForce RTX 50', segment: 'consumer', releaseYear: 2025, vramGb: 12, vramType: 'GDDR7', memoryBusBits: 192, memoryBandwidthGbS: 672, pcieGeneration: 5, lengthMm: 242, boardPowerW: 250, recommendedPsuW: 650, slotWidth: 2, cooling: 'double-flow-through', powerConnectors: '1× 16-pin', launchPriceUsd: 549, fp4AiTops: 988, sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/', tags: ['12 GB', 'Blackwell', 'Local AI'] }),
  researchedGpu({ id: 'nvidia-rtx-5060-ti-16', manufacturer: 'NVIDIA', name: 'GeForce RTX 5060 Ti 16GB', architecture: 'Blackwell', generation: 'GeForce RTX 50', segment: 'consumer', releaseYear: 2025, vramGb: 16, vramType: 'GDDR7', memoryBusBits: 128, memoryBandwidthGbS: 448, pcieGeneration: 5, pcieLanes: 8, boardPowerW: 180, recommendedPsuW: 600, powerConnectors: '1× 8-pin or PCIe Gen5 cable', launchPriceUsd: 429, fp4AiTops: 759, notes: 'Board dimensions and cooler design vary by add-in-card manufacturer.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/', tags: ['16 GB', 'Blackwell', 'Local AI'] }),
  researchedGpu({ id: 'nvidia-rtx-5060-ti-8', manufacturer: 'NVIDIA', name: 'GeForce RTX 5060 Ti 8GB', architecture: 'Blackwell', generation: 'GeForce RTX 50', segment: 'consumer', releaseYear: 2025, vramGb: 8, vramType: 'GDDR7', memoryBusBits: 128, memoryBandwidthGbS: 448, pcieGeneration: 5, pcieLanes: 8, boardPowerW: 180, recommendedPsuW: 600, powerConnectors: '1× 8-pin or PCIe Gen5 cable', launchPriceUsd: 379, fp4AiTops: 759, notes: 'Same processor specification as the 16 GB model, but the 8 GB capacity can prevent larger AI models from fitting fully in VRAM; board design varies.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/', tags: ['8 GB', 'Blackwell', 'Entry AI'] }),
  researchedGpu({ id: 'nvidia-rtx-5060', manufacturer: 'NVIDIA', name: 'GeForce RTX 5060 8GB', architecture: 'Blackwell', generation: 'GeForce RTX 50', segment: 'consumer', releaseYear: 2025, vramGb: 8, vramType: 'GDDR7', memoryBusBits: 128, memoryBandwidthGbS: 448, pcieGeneration: 5, pcieLanes: 8, boardPowerW: 145, recommendedPsuW: 550, powerConnectors: '1× 8-pin or PCIe Gen5 cable', launchPriceUsd: 299, fp4AiTops: 614, notes: 'Board dimensions and cooler design vary by add-in-card manufacturer.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/', tags: ['8 GB', 'Blackwell', 'Entry AI'] }),
  researchedGpu({ id: 'nvidia-rtx-5050', manufacturer: 'NVIDIA', name: 'GeForce RTX 5050 8GB', architecture: 'Blackwell', generation: 'GeForce RTX 50', segment: 'consumer', releaseYear: 2025, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbS: 320, pcieGeneration: 5, pcieLanes: 8, boardPowerW: 130, recommendedPsuW: 550, powerConnectors: '1× 8-pin or PCIe Gen5 cable', launchPriceUsd: 249, fp4AiTops: 421, notes: 'Board dimensions and cooler design vary by add-in-card manufacturer.', sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5050/', tags: ['8 GB', 'Blackwell', 'Entry AI'] }),
  researchedGpu({ id: 'nvidia-rtx-pro-2000-blackwell', manufacturer: 'NVIDIA', name: 'RTX PRO 2000 Blackwell', architecture: 'Blackwell', generation: 'RTX PRO Blackwell', segment: 'workstation', releaseYear: 2025, vramGb: 16, vramType: 'GDDR7 ECC', memoryBusBits: 128, memoryBandwidthGbS: 288, pcieGeneration: 5, pcieLanes: 8, lengthMm: 168, boardPowerW: 70, recommendedPsuW: 400, slotWidth: 2, height: 'low-profile', powerConnectors: 'Slot powered', fp4AiTops: 545, sourceUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-2000/workstation-datasheet-blackwell-rtx-pro-2000-nvidia-us-4016661.pdf', tags: ['16 GB', 'Blackwell', 'Low profile'] }),
  {
    id: 'amd-rx-9070-xt', category: 'gpu', manufacturer: 'AMD', name: 'Radeon RX 9070 XT',
    description: 'RDNA 4 graphics card with 16 GB memory for high-performance 1440p and 4K.',
    vramGb: 16, interface: 'PCIe 5.0 x16', lengthMm: 0, boardPowerW: 304, recommendedPsuW: 750,
    architecture: 'RDNA 4', generation: 'Radeon RX 9000', segment: 'consumer', releaseYear: 2025,
    vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbS: 640, pcieGeneration: 5, pcieLanes: 16,
    displayOutputs: true, powerConnectors: '2× 8-pin', availability: 'current', softwarePlatform: 'ROCm',
    parallelProcessors: { count: 4096, label: 'stream processors', scope: 'per GPU', sourceUrl: 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070xt.html' },
    notes: 'AMD does not sell a reference card; board length, slot width, cooling, and display layout must be verified against the selected add-in-board SKU.',
    price: price(599, 'MSRP', 'AMD', 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070xt.html'), tags: ['1440p', '4K', 'Value'],
    specSourceUrl: 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070xt.html',
  },
  {
    id: 'amd-rx-9070', category: 'gpu', manufacturer: 'AMD', name: 'Radeon RX 9070',
    description: 'Efficient 16 GB RDNA 4 GPU tuned for high-quality 1440p play.',
    vramGb: 16, interface: 'PCIe 5.0 x16', lengthMm: 0, boardPowerW: 220, recommendedPsuW: 650,
    architecture: 'RDNA 4', generation: 'Radeon RX 9000', segment: 'consumer', releaseYear: 2025,
    vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbS: 640, pcieGeneration: 5, pcieLanes: 16,
    displayOutputs: true, powerConnectors: '2× 8-pin', availability: 'current', softwarePlatform: 'ROCm',
    parallelProcessors: { count: 3584, label: 'stream processors', scope: 'per GPU', sourceUrl: 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070.html' },
    notes: 'AMD does not sell a reference card; board length, slot width, cooling, and display layout must be verified against the selected add-in-board SKU.',
    price: price(549, 'MSRP', 'AMD', 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070.html'), tags: ['1440p', 'Efficient'],
    specSourceUrl: 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070.html',
  },
  { id: 'intel-arc-b580', category: 'gpu', manufacturer: 'Intel', name: 'Arc B580 Limited Edition', description: 'Value-focused Battlemage card with 12 GB memory for 1080p and 1440p.', vramGb: 12, interface: 'PCIe 4.0 x8', lengthMm: 272, boardPowerW: 190, recommendedPsuW: 600, architecture: 'Battlemage', segment: 'consumer', vramType: 'GDDR6', price: price(249, 'MSRP', 'Intel', 'https://www.intel.com/content/www/us/en/products/docs/discrete-gpus/arc/desktop/b-series/overview.html'), tags: ['Value', '1440p'] },
];

// The working catalog is intentionally AI-focused. Addressable GPU memory pools
// at 10 GB or below cannot hold the user's target local models with useful
// context headroom, so they are excluded at the source instead of being hidden
// by individual views. This also catches partitioned multi-GPU boards.
export const minimumGpuVramGb = 12;
export const minimumMeasuredGpuTokensPerSecond = 100;
export const slowGpuMemoryExceptionGb = 32;
export const gpus: Gpu[] = [...highVramGpus, ...mainstreamGpus]
  .filter((gpu) => (gpu.addressableVramGb ?? gpu.vramGb) >= minimumGpuVramGb)
  .filter((gpu) => !userExcludedGpuIds.has(gpu.id));

export const ram: Ram[] = [
  {
    id: 'gskill-flare-x5-32-6000', category: 'ram', manufacturer: 'G.Skill', name: 'Flare X5 32 GB DDR5-6000 CL30',
    description: 'Low-profile 2×16 GB AMD EXPO kit at a popular AM5 speed and latency.',
    memoryType: 'DDR5', capacityGb: 32, modules: 2, speedMt: 6000, casLatency: 30, profile: 'EXPO', registered: false, ecc: false,
    price: price(109.99, 'reference', 'Market reference', 'https://www.gskill.com/product/165/396/1662622664/F5-6000J3038F16GX2-FX5'), tags: ['EXPO', 'Sweet spot'],
    specSourceUrl: 'https://www.gskill.com/product/165/396/1662622664/F5-6000J3038F16GX2-FX5',
  },
  {
    id: 'corsair-vengeance-32-6000', category: 'ram', manufacturer: 'Corsair', name: 'Vengeance 32 GB DDR5-6000 CL36',
    description: 'Versatile 2×16 GB low-profile DDR5 kit with broad platform support.',
    memoryType: 'DDR5', capacityGb: 32, modules: 2, speedMt: 6000, casLatency: 36, profile: 'EXPO + XMP', registered: false, ecc: false,
    price: price(99.99, 'reference', 'Market reference', 'https://www.corsair.com/us/en/p/memory/cmk32gx5m2e6000c36/vengeance-32gb-2x16gb-ddr5-dram-6000mts-cl36-memory-kit-black-cmk32gx5m2e6000c36'), tags: ['Low profile', 'Flexible'],
    specSourceUrl: 'https://www.corsair.com/us/en/p/memory/cmk32gx5m2e6000c36/vengeance-32gb-2x16gb-ddr5-dram-6000mts-cl36-memory-kit-black-cmk32gx5m2e6000c36',
  },
  {
    id: 'kingston-fury-beast-64-6000', category: 'ram', manufacturer: 'Kingston', name: 'Fury Beast 64 GB DDR5-6000 CL36',
    description: 'High-capacity 2×32 GB kit for creation, development, and local AI.',
    memoryType: 'DDR5', capacityGb: 64, modules: 2, speedMt: 6000, casLatency: 36, profile: 'EXPO + XMP', registered: false, ecc: false,
    price: price(189.99, 'reference', 'Market reference', 'https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory'), tags: ['64 GB', 'Creator'],
    specSourceUrl: 'https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory',
  },
  {
    id: 'gskill-trident-z5-96-6400', category: 'ram', manufacturer: 'G.Skill', name: 'Trident Z5 96 GB DDR5-6400 CL32',
    description: 'Dense 2×48 GB XMP kit for demanding workstations and AI applications.',
    memoryType: 'DDR5', capacityGb: 96, modules: 2, speedMt: 6400, casLatency: 32, profile: 'XMP', registered: false, ecc: false,
    price: price(299.99, 'reference', 'Market reference', 'https://www.gskill.com/products/1/165/374/Trident-Z5-RGB-DDR5-Intel-XMP'), tags: ['96 GB', 'XMP'],
    specSourceUrl: 'https://www.gskill.com/products/1/165/374/Trident-Z5-RGB-DDR5-Intel-XMP',
  },
  {
    id: 'crucial-pro-64-5600', category: 'ram', manufacturer: 'Crucial', name: 'Pro 64 GB DDR5-5600 CL46',
    description: 'Reliable 2×32 GB JEDEC-friendly kit for stable productivity systems.',
    memoryType: 'DDR5', capacityGb: 64, modules: 2, speedMt: 5600, casLatency: 46, profile: 'EXPO + XMP', registered: false, ecc: false,
    price: price(149.99, 'reference', 'Market reference', 'https://www.crucial.com/memory/ddr5/cp2k32g56c46u5'), tags: ['Reliable', '64 GB'],
    specSourceUrl: 'https://www.crucial.com/memory/ddr5/cp2k32g56c46u5',
  },
  {
    id: 'corsair-vengeance-lpx-32-3600', category: 'ram', manufacturer: 'Corsair', name: 'Vengeance LPX 32 GB DDR4-3600 CL18',
    description: 'Mature low-profile 2×16 GB DDR4 kit for AM4 and LGA1700 DDR4 boards.',
    memoryType: 'DDR4', capacityGb: 32, modules: 2, speedMt: 3600, casLatency: 18, profile: 'XMP', registered: false, ecc: false,
    price: price(69.99, 'reference', 'Market reference', 'https://www.corsair.com/us/en/p/memory/cmk32gx4m2d3600c18/vengeance-lpx-32gb-2-x-16gb-ddr4-dram-3600mhz-c18-memory-kit-black-cmk32gx4m2d3600c18'), tags: ['DDR4', 'Low profile'],
    specSourceUrl: 'https://www.corsair.com/us/en/p/memory/cmk32gx4m2d3600c18/vengeance-lpx-32gb-2-x-16gb-ddr4-dram-3600mhz-c18-memory-kit-black-cmk32gx4m2d3600c18',
  },
  {
    id: 'gskill-ripjaws-v-32-3200', category: 'ram', manufacturer: 'G.Skill', name: 'Ripjaws V 32 GB DDR4-3200 CL16',
    description: 'Affordable 2×16 GB DDR4 memory for stable mainstream builds.',
    memoryType: 'DDR4', capacityGb: 32, modules: 2, speedMt: 3200, casLatency: 16, profile: 'XMP', registered: false, ecc: false,
    price: price(59.99, 'reference', 'Market reference', 'https://www.gskill.com/product/165/184/1536110676/F4-3200C16D-32GVK'), tags: ['DDR4', 'Value'],
    specSourceUrl: 'https://www.gskill.com/product/165/184/1536110676/F4-3200C16D-32GVK',
  },
  {
    id: 'kingston-fury-beast-64-3200', category: 'ram', manufacturer: 'Kingston', name: 'Fury Beast 64 GB DDR4-3200 CL16',
    description: 'High-capacity 2×32 GB DDR4 kit for economical workstations.',
    memoryType: 'DDR4', capacityGb: 64, modules: 2, speedMt: 3200, casLatency: 16, profile: 'XMP', registered: false, ecc: false,
    price: price(129.99, 'reference', 'Market reference', 'https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr4-memory'), tags: ['DDR4', '64 GB'],
    specSourceUrl: 'https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr4-memory',
  },
];

type OptaneServerSeed = Omit<ServerSystem,
  'category' | 'price' | 'tags' | 'supportedCpuModels' | 'cpuQualificationNote' |
  'memoryChannelsPerCpu' | 'optaneModuleCapacitiesGb' | 'optaneModes' |
  'powerSupplyCount' | 'powerRedundancy' | 'maxOptaneModulePowerW' |
  'maxOptanePowerW' | 'cpuAndOptaneBudgetW' | 'powerDrawStatus' |
  'linuxSupport' | 'windowsSupport' | 'hypervisorSupport' | 'supportedOs' |
  'osQualificationNote' | 'availability' | 'sourceUrls' | 'compatibilitySourceUrl'> & {
    sourceUrls?: string[];
  };

function optaneServer(seed: OptaneServerSeed): ServerSystem {
  const isPmem200 = seed.optaneSeries === '200';
  const maxOptaneModulePowerW = isPmem200 ? 15 : 18;
  const cpuSource = isPmem200 ? optane200CpuSource : optane100CpuSource;
  const osSource = isPmem200 ? optane200OsSource : optane100OsSource;
  return {
    ...seed,
    category: 'server-system',
    supportedCpuModels: isPmem200 ? optane200CpuModels : optane100CpuModels,
    cpuQualificationNote: `This is Intel's complete PMem ${seed.optaneSeries}-compatible Xeon pool. The server OEM CPU matrix, thermal configuration, firmware, and installed processors still control a particular used unit.`,
    memoryChannelsPerCpu: isPmem200 ? 8 : 6,
    optaneModuleCapacitiesGb: [128, 256, 512],
    optaneModes: isPmem200 ? ['Memory Mode', 'App Direct'] : ['Memory Mode', 'App Direct', 'Mixed / Dual Mode'],
    powerSupplyCount: 2,
    powerRedundancy: 'Up to two hot-swap PSUs; normally 1+1 redundancy. Two same-rated PSUs do not normally double the usable redundant power budget.',
    maxOptaneModulePowerW,
    maxOptanePowerW: seed.optaneSlots * maxOptaneModulePowerW,
    cpuAndOptaneBudgetW: (2 * seed.maxCpuTdpW) + (seed.optaneSlots * maxOptaneModulePowerW),
    powerDrawStatus: 'configuration-dependent',
    linuxSupport: true,
    windowsSupport: true,
    hypervisorSupport: true,
    supportedOs: isPmem200
      ? ['RHEL 8.2+', 'Ubuntu 20.04+', 'SLES 15 SP2+', 'Windows Server 2019 / 2022 / 2025', 'VMware ESXi 7.0 U1d+']
      : ['RHEL 7.6+', 'Ubuntu 18.04+', 'SLES 12 SP4+', 'Oracle Linux 7.6+', 'Windows Server 2019 / 2022 / 2025', 'VMware ESXi 6.7 U1+'],
    osQualificationNote: 'Not Windows-locked. Intel verifies PMem modes by OS release; also confirm the OEM support matrix, BIOS, and PMem firmware for the exact configuration.',
    availability: 'used / refurbished',
    price: price(0, 'reference', 'Used / refurbished market — configuration dependent', seed.specSourceUrl ?? cpuSource),
    tags: [`PMem ${seed.optaneSeries}`, `${seed.maxOptaneGb / 1024} TB Optane`, `${seed.pcieSlots} PCIe slots`],
    compatibilitySourceUrl: cpuSource,
    sourceUrls: Array.from(new Set([seed.specSourceUrl ?? '', seed.powerSourceUrl, cpuSource, osSource, sluiceV2Source, ...(seed.sourceUrls ?? [])].filter(Boolean))),
  };
}

export const serverSystems: ServerSystem[] = [
  optaneServer({
    id: 'intel-server-r1000wf', manufacturer: 'Intel', name: 'Intel Server System R1000WF family', family: 'R1000WF',
    description: 'Intel 1U reference server family based on the S2600WF board, qualified for first-generation Optane DC Persistent Memory.',
    rackUnits: 1, cpuSockets: 2, cpuSocket: 'LGA3647', cpuGeneration: '2nd Gen Xeon Scalable (Cascade Lake)',
    dramSlots: 24, optaneSeries: '100', optaneSlots: 12, maxOptaneGb: 6144,
    pcieGeneration: 3, pcieSlots: 3, pcieSlotDetails: 'Up to three riser-hosted add-in slots; exact mix depends on R1208/R1304 configuration and both CPUs.', maxCpuTdpW: 165,
    powerSupplyOptionsW: [750, 1100, 1300], powerSourceUrl: 'https://www.intel.com/content/dam/www/public/us/en/documents/product-briefs/server-board-s2600wf-brief.pdf',
    powerPlanningNote: 'Intel lists 1300 W Titanium and 1100 W Platinum AC plus 750 W DC options. Select for the actual CPUs, PMem/DRAM population, riser cards, drives, and input voltage.',
    boardFormFactor: 'Intel custom', boardDimensionsMm: '424 × 432 mm (16.7 × 17 in)', systemDimensionsMm: '≈430 × 710 × 43.7 mm (1U; SKU-dependent)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'The 432 mm board depth is 187 mm beyond the Sluice V2 ATX tray, and expansion requires Intel risers, chassis airflow, and server power/control wiring.',
    specSourceUrl: 'https://www.intel.com/content/www/us/en/content-details/610790/intel-server-system-r1000wf-product-family-technical-product-specification.html',
    sourceUrls: ['https://www.intel.com/content/www/us/en/support/articles/000032907/technologies/memory-and-storage/intel-optane-persistent-memory.html'],
  }),
  optaneServer({
    id: 'intel-server-r2000wf', manufacturer: 'Intel', name: 'Intel Server System R2000WF family', family: 'R2000WF',
    description: 'Intel 2U S2600WF platform with high I/O capacity and an official PMem 100 system qualification.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA3647', cpuGeneration: '2nd Gen Xeon Scalable (Cascade Lake)',
    dramSlots: 24, optaneSeries: '100', optaneSlots: 12, maxOptaneGb: 6144,
    pcieGeneration: 3, pcieSlots: 8, pcieSlotDetails: 'Up to eight chassis slots through model-specific risers; Intel publishes 96 PCIe Gen3 lanes available for I/O.', maxCpuTdpW: 165,
    powerSupplyOptionsW: [750, 1100, 1300], powerSourceUrl: 'https://www.intel.com/content/www/us/en/products/details/servers/server-systems/server-r2000wf-systems.html',
    powerPlanningNote: 'Intel lists redundant-capable 1300 W Titanium and 1100 W Platinum AC or 750 W DC modules. PSU rating is capacity, not continuous wall draw.',
    boardFormFactor: 'Intel custom', boardDimensionsMm: '424 × 432 mm (16.7 × 17 in)', systemDimensionsMm: '430 × 710 × 87.4 mm (2U)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'The custom 424 × 432 mm board is far larger than the 305 × 245 mm stock tray and depends on chassis risers, fan wall, backplanes, and server PSUs.',
    specSourceUrl: 'https://www.intel.com/content/www/us/en/products/details/servers/server-systems/server-r2000wf-systems.html',
    sourceUrls: ['https://www.intel.com/content/www/us/en/products/sku/99082/intel-server-chassis-r2000wfxxx/specifications.html', 'https://www.intel.com/content/www/us/en/support/articles/000032907/technologies/memory-and-storage/intel-optane-persistent-memory.html'],
  }),
  optaneServer({
    id: 'intel-server-m50cyp1ur212', manufacturer: 'Intel', name: 'Intel Server System M50CYP1UR212', family: 'M50CYP',
    description: 'A 1U Coyote Pass server with 32 DDR4 slots, two Ice Lake Xeons, and official PMem 200 qualification.',
    rackUnits: 1, cpuSockets: 2, cpuSocket: 'LGA4189', cpuGeneration: '3rd Gen Xeon Scalable (Ice Lake)',
    dramSlots: 32, optaneSeries: '200', optaneSlots: 16, maxOptaneGb: 8192,
    pcieGeneration: 4, pcieSlots: 3, pcieSlotDetails: 'Three board riser connectors (16/24/16 lanes); usable add-in slots depend on the installed 1U riser plus one OCP 3.0 slot.', maxCpuTdpW: 205,
    powerSupplyOptionsW: [1300], powerSourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/214842/intel-server-system-m50cyp1ur212/specifications.html',
    powerPlanningNote: 'The system specification lists a 1300 W supply architecture. Intel sold the chassis without PSUs in some configurations, so verify both installed modules and input requirements.',
    boardFormFactor: 'Intel custom', boardDimensionsMm: '477 × 428 mm (18.79 × 16.84 in)', systemDimensionsMm: '781 × 438 × 43 mm (1U)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'Both board dimensions exceed the Sluice tray. It also requires Intel risers, a high-pressure fan wall, backplane/control cables, and server PSU distribution.',
    specSourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/214842/intel-server-system-m50cyp1ur212/specifications.html',
    sourceUrls: ['https://www.intel.com/content/www/us/en/support/articles/000094618/technologies/memory-and-storage/intel-optane-persistent-memory.html'],
  }),
  optaneServer({
    id: 'intel-server-m50cyp2ur208', manufacturer: 'Intel', name: 'Intel Server System M50CYP2UR208 / 2UR312', family: 'M50CYP',
    description: 'The 2U Coyote Pass family trades rack density for more Gen4 expansion while retaining 16 PMem 200 positions.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA4189', cpuGeneration: '3rd Gen Xeon Scalable (Ice Lake)',
    dramSlots: 32, optaneSeries: '200', optaneSlots: 16, maxOptaneGb: 8192,
    pcieGeneration: 4, pcieSlots: 8, pcieSlotDetails: 'Up to eight rear add-in positions using Coyote Pass 2U riser options; population and lane widths vary by riser and CPU count.', maxCpuTdpW: 205,
    powerSupplyOptionsW: [1300, 2100], powerSourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/214837/intel-server-system-m50cyp2ur208/compatible.html',
    powerPlanningNote: 'Intel lists 1300 W Titanium and 2100 W redundant PSU options. The 2100 W unit is intended for high-line data-center power and high-load configurations.',
    boardFormFactor: 'Intel custom', boardDimensionsMm: '477 × 428 mm (18.79 × 16.84 in)', systemDimensionsMm: '≈781 × 438 × 87 mm (2U)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'The 477 × 428 mm board cannot mount to the stock ATX deck and its cooling, power, storage, and expansion topology is chassis-dependent.',
    specSourceUrl: 'https://www.intel.com/content/www/us/en/products/details/servers/server-systems/server-m50cyp-systems.html',
    sourceUrls: ['https://www.intel.com/content/www/us/en/support/articles/000094618/technologies/memory-and-storage/intel-optane-persistent-memory.html'],
  }),
  optaneServer({
    id: 'dell-poweredge-r740', manufacturer: 'Dell', name: 'PowerEdge R740', family: '14G PowerEdge',
    description: 'Widely available 2U dual-socket server with 24 DIMM sockets and validated 6 TB DCPMM configurations.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA3647', cpuGeneration: '2nd Gen Xeon Scalable (Cascade Lake)',
    dramSlots: 24, optaneSeries: '100', optaneSlots: 12, maxOptaneGb: 6144,
    pcieGeneration: 3, pcieSlots: 8, pcieSlotDetails: 'Up to eight riser-based slots; the maximum configuration includes four x16 connectors and requires the correct riser set.', maxCpuTdpW: 205,
    powerSupplyOptionsW: [495, 750, 1100, 1600, 2000, 2400], powerSourceUrl: 'https://www.dell.com/support/manuals/en-us/poweredge-r740/per740_ism_pub/power-supply-unit-details?guid=guid-277a550d-b9ea-45e0-94e2-0387d5d36780&lang=en-us',
    powerPlanningNote: 'Dell supports 1+1 redundant or 2+0 non-redundant operation. Units at 1600 W and above are heavily derated on 100–140 V input; use 200–240 V for their rated output.',
    boardFormFactor: 'Dell proprietary planar', boardDimensionsMm: 'Not published by Dell', systemDimensionsMm: '482 × 715.5 × 86.8 mm (2U, max depth)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'No ATX mounting pattern or standard ATX power/front-panel interface; PCIe slots live on proprietary risers and the planar relies on the R740 fan/backplane layout.',
    specSourceUrl: 'https://www.dell.com/support/manuals/en-us/poweredge-r740/per740_techspecs_pub/memory-specifications?guid=guid-57fb973a-4069-4f40-894f-8a0e277279e8',
    sourceUrls: ['https://www.dell.com/support/manuals/en-uk/poweredge-r740/per740_techspecs_pub/Expansion-bus-specifications?guid=guid-980ac5b8-ef7d-4759-8956-82c2aba9002a&lang=en-us', 'https://www.dell.com/support/manuals/en-ca/poweredge-r740/per740_techspecs_pub/supported-operating-systems?guid=guid-cb96072e-db61-463c-9bba-336d375d235f&lang=en-us'],
  }),
  optaneServer({
    id: 'dell-poweredge-r750', manufacturer: 'Dell', name: 'PowerEdge R750', family: '15G PowerEdge',
    description: 'A mainstream 2U Ice Lake server supporting 16 PMem 200 modules and up to eight Gen4 expansion slots.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA4189', cpuGeneration: '3rd Gen Xeon Scalable (Ice Lake)',
    dramSlots: 32, optaneSeries: '200', optaneSlots: 16, maxOptaneGb: 8192,
    pcieGeneration: 4, pcieSlots: 8, pcieSlotDetails: 'Up to eight PCIe Gen4 slots, with up to six x16; exact result depends on rear-storage and riser choices.', maxCpuTdpW: 270,
    powerSupplyOptionsW: [700, 800, 1100, 1400, 1800, 2400, 2800], powerSourceUrl: 'https://www.dell.com/support/manuals/en-us/poweredge-r750/per750_ts_pub_ism/psu-specifications?guid=guid-cce14704-da29-403e-8e2f-c1aa5e4c4319',
    powerPlanningNote: 'Dell requires its configuration calculator for actual consumption. 1100/1400/2400 W options derate on low-line power; 1800/2800 W options require 200–240 V AC.',
    boardFormFactor: 'Dell proprietary planar', boardDimensionsMm: 'Not published by Dell', systemDimensionsMm: '482 × 736.3 × 86.8 mm (2U, to PSU handles)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'The proprietary planar, power distribution, risers, fan wall, and drive backplanes are a single chassis architecture, not an ATX transplant.',
    specSourceUrl: 'https://i.dell.com/sites/csdocuments/Product_Docs/en/poweredge-r750-spec-sheet.pdf',
    sourceUrls: ['https://www.dell.com/support/manuals/en-us/poweredge-r750/per750_ts_pub_ism/chassis-dimensions?guid=guid-07b9ec5f-35cc-45d2-9a75-645b95aff03d&lang=en-us'],
  }),
  optaneServer({
    id: 'hpe-proliant-dl380-gen10', manufacturer: 'HPE', name: 'ProLiant DL380 Gen10', family: 'ProLiant Gen10',
    description: 'Common used-market 2U platform with HPE-qualified 100-series persistent memory and flexible Gen3 risers.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA3647', cpuGeneration: '2nd Gen Xeon Scalable (Cascade Lake)',
    dramSlots: 24, optaneSeries: '100', optaneSlots: 12, maxOptaneGb: 6144,
    pcieGeneration: 3, pcieSlots: 8, pcieSlotDetails: 'Up to eight PCIe 3.0 slots across primary, secondary, and tertiary risers; options can trade slots for storage.', maxCpuTdpW: 205,
    powerSupplyOptionsW: [500, 800, 1600], powerSourceUrl: 'https://www.hpe.com/psnow/doc/a00008180enw.html',
    powerPlanningNote: 'HPE offers 500, 800, and 1600 W Flex Slot supplies and directs buyers to HPE Power Advisor. The 1600 W option requires high-line input for full output.',
    boardFormFactor: 'HPE proprietary system board', boardDimensionsMm: 'Not published by HPE', systemDimensionsMm: '≈445.5 × 730.3 × 87.3 mm (2U; chassis option dependent)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'Non-ATX hole pattern, riser cages, proprietary power/control connections, and high-pressure chassis airflow make a bare-board Sluice conversion impractical.',
    specSourceUrl: 'https://www.hpe.com/psnow/doc/a00008180enw.html',
    sourceUrls: ['https://www.hpe.com/psnow/doc/a00017079enw.html'],
  }),
  optaneServer({
    id: 'hpe-proliant-dl380-gen10-plus', manufacturer: 'HPE', name: 'ProLiant DL380 Gen10 Plus', family: 'ProLiant Gen10 Plus',
    description: 'Ice Lake refresh with 32 DIMM sockets, up to 8 TB of PMem 200, and configurable PCIe Gen4 risers.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA4189', cpuGeneration: '3rd Gen Xeon Scalable (Ice Lake)',
    dramSlots: 32, optaneSeries: '200', optaneSlots: 16, maxOptaneGb: 8192,
    pcieGeneration: 4, pcieSlots: 8, pcieSlotDetails: 'Three primary slots standard and up to eight total with secondary/tertiary risers and two CPUs.', maxCpuTdpW: 270,
    powerSupplyOptionsW: [800, 1600, 2200], powerSourceUrl: 'https://www.hpe.com/psnow/doc/A50002553ENW',
    powerPlanningNote: 'The 1800–2200 W Titanium module output scales with 200–240 V input; the 1600 W option is also high-line. Use HPE Power Advisor for the configured load.',
    boardFormFactor: 'HPE proprietary system board', boardDimensionsMm: 'Not published by HPE', systemDimensionsMm: '≈445.5 × 740.2 × 87.5 mm (2U; chassis option dependent)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'The system board is not ATX and needs HPE risers, PSU distribution, fan control, and storage/control wiring retained from the rack chassis.',
    specSourceUrl: 'https://www.hpe.com/psnow/doc/A50002553ENW',
  }),
  optaneServer({
    id: 'lenovo-thinksystem-sr650', manufacturer: 'Lenovo', name: 'ThinkSystem SR650', family: 'ThinkSystem SR650',
    description: 'A mature 2U platform with 12 DCPMM positions and strong used-market availability.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA3647', cpuGeneration: '2nd Gen Xeon Scalable (Cascade Lake)',
    dramSlots: 24, optaneSeries: '100', optaneSlots: 12, maxOptaneGb: 6144,
    pcieGeneration: 3, pcieSlots: 7, pcieSlotDetails: 'Up to seven: one internal storage-controller slot, one planar slot, and up to five through two risers.', maxCpuTdpW: 205,
    powerSupplyOptionsW: [550, 750, 1100, 1600], powerSourceUrl: 'https://lenovopress.lenovo.com/lp1050-thinksystem-sr650-server',
    powerPlanningNote: 'Lenovo supports two identical redundant supplies. PMem with certain 200/205 W CPUs requires two PSUs; 1600 W is a 200–240 V option. Validate with Lenovo Capacity Planner.',
    boardFormFactor: 'Lenovo proprietary system planar', boardDimensionsMm: 'Not published by Lenovo', systemDimensionsMm: '445 × 764 × 87 mm (2U)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'Its long proprietary planar and riser/storage/power topology do not match the Sluice ATX tray or standard desktop cabling.',
    specSourceUrl: 'https://lenovopress.lenovo.com/lp1050-thinksystem-sr650-server',
  }),
  optaneServer({
    id: 'lenovo-thinksystem-sr650-v2', manufacturer: 'Lenovo', name: 'ThinkSystem SR650 V2', family: 'ThinkSystem SR650 V2',
    description: 'A 2U Ice Lake system with 16 PMem 200 positions and up to eight full-height Gen4 slots.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA4189', cpuGeneration: '3rd Gen Xeon Scalable (Ice Lake)',
    dramSlots: 32, optaneSeries: '200', optaneSlots: 16, maxOptaneGb: 8192,
    pcieGeneration: 4, pcieSlots: 8, pcieSlotDetails: 'Up to eight full-height PCIe 4.0 slots, plus a dedicated OCP 3.0 slot and cabled RAID/HBA position.', maxCpuTdpW: 270,
    powerSupplyOptionsW: [500, 750, 1100, 1800, 2600], powerSourceUrl: 'https://lenovopress.lenovo.com/lp1392-thinksystem-sr650-v2-server',
    powerPlanningNote: 'Two installed PSUs must be identical. The 1800/2600 W options require 200–240 V AC; Lenovo Capacity Planner calculates the exact configured load.',
    boardFormFactor: 'Lenovo proprietary system planar', boardDimensionsMm: 'Not published by Lenovo', systemDimensionsMm: '445 × 764 × 87 mm (2U)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'The planar is a chassis-specific assembly with cabled risers and power/cooling dependencies; it is not an ATX-form-factor board.',
    specSourceUrl: 'https://lenovopress.lenovo.com/lp1392-thinksystem-sr650-v2-server',
  }),
  optaneServer({
    id: 'cisco-ucs-c240-m5', manufacturer: 'Cisco', name: 'UCS C240 M5', family: 'UCS C-Series M5',
    description: 'Cisco 2U rack server with 24 DDR4 sockets, 100-series Optane support, and six standard Gen3 expansion positions.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA3647', cpuGeneration: '2nd Gen Xeon Scalable (Cascade Lake)',
    dramSlots: 24, optaneSeries: '100', optaneSlots: 12, maxOptaneGb: 6144,
    pcieGeneration: 3, pcieSlots: 6, pcieSlotDetails: 'Six PCIe 3.0 slots, plus dedicated RAID-controller and mLOM positions that are not counted as general-purpose slots.', maxCpuTdpW: 205,
    powerSupplyOptionsW: [770, 1050, 1600], powerSourceUrl: 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/ucs-c240-m5-rack-server.html',
    powerPlanningNote: 'Cisco lists redundant 770 W, 1050 W AC/DC, and 1600 W AC options. Actual input depends on CPU, PMem/DRAM, storage, adapters, fan speed, and PSU efficiency.',
    boardFormFactor: 'Cisco proprietary motherboard', boardDimensionsMm: 'Not published by Cisco', systemDimensionsMm: '≈482 × 787 × 87 mm (2U; standard-depth chassis)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'Cisco uses a chassis-specific motherboard, mLOM, risers, fan wall, backplanes, and power distribution; there is no ATX mounting/power path.',
    specSourceUrl: 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/ucs-c240-m5-rack-server.html',
  }),
  optaneServer({
    id: 'cisco-ucs-c240-m6', manufacturer: 'Cisco', name: 'UCS C240 M6', family: 'UCS C-Series M6',
    description: 'Cisco 2U Ice Lake server supporting 16 PMem 200 modules, up to 12 TB combined memory, and eight Gen4 slots.',
    rackUnits: 2, cpuSockets: 2, cpuSocket: 'LGA4189', cpuGeneration: '3rd Gen Xeon Scalable (Ice Lake)',
    dramSlots: 32, optaneSeries: '200', optaneSlots: 16, maxOptaneGb: 8192,
    pcieGeneration: 4, pcieSlots: 8, pcieSlotDetails: 'Eight PCIe 4.0 slots, plus separate dedicated RAID-controller and mLOM positions.', maxCpuTdpW: 270,
    powerSupplyOptionsW: [1050, 1600, 2300], powerSourceUrl: 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/ucs-c240-m6-rack-server-ds.html',
    powerPlanningNote: 'Cisco lists redundant 1050 W AC/DC, 1600 W AC, and 2300 W AC options. Higher-power configurations require suitable high-line circuits and the Cisco sizing tool.',
    boardFormFactor: 'Cisco proprietary motherboard', boardDimensionsMm: 'Not published by Cisco', systemDimensionsMm: '≈482 × 787 × 87 mm (2U; drive configuration dependent)',
    sluiceV2Fit: 'not-viable', sluiceV2Reason: 'The motherboard and expansion risers are designed as part of the UCS chassis; the Sluice supplies neither their mounting geometry nor required cooling/power infrastructure.',
    specSourceUrl: 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/ucs-c240-m6-rack-server-ds.html',
  }),
];

export const miniPcs: MiniPc[] = [
  {
    id: 'nvidia-dgx-spark', category: 'mini-pc', manufacturer: 'NVIDIA', name: 'DGX Spark — 128 GB / 4 TB',
    description: 'Complete GB10 Grace Blackwell desktop system built for large local models; its unified-memory capacity is the advantage, not small-model decode speed.',
    processor: 'GB10 Grace · 20-core Arm', graphics: 'Integrated Blackwell GPU', memoryGb: 128, storageGb: 4096,
    memoryType: 'LPDDR5x coherent unified', npuTops: 0, totalAiTops: null, memoryUpgradeable: false,
    architecture: 'Grace Blackwell', systemType: 'personal-ai-supercomputer', memoryBandwidthGbS: 273,
    chipTdpW: 140, powerSupplyW: 240, aiPerformanceLabel: 'Up to 1 PFLOP FP4 (sparse)',
    maxInferenceParametersB: 200, maxFineTuneParametersB: 70,
    price: { ...price(4699, 'MSRP', 'NVIDIA MSRP', 'https://forums.developer.nvidia.com/t/2-23-2026-price-change-announcement/361713'), observedAt: '2026-08-12' },
    specSourceUrl: 'https://www.nvidia.com/en-us/products/workstations/dgx-spark/',
    tags: ['Grace Blackwell', '128 GB unified memory', 'CUDA', 'Large-model inference'],
  },
  {
    id: 'gmktec-evo-x2-64', category: 'mini-pc', manufacturer: 'GMKtec', name: 'EVO-X2 AI — 64 GB / 1 TB',
    description: 'High-end Strix Halo mini PC with desktop-class integrated graphics and large unified memory.',
    processor: 'AMD Ryzen AI Max+ 395', graphics: 'Radeon 8060S', memoryGb: 64, storageGb: 1024, memoryType: 'LPDDR5X-8000', npuTops: 50, totalAiTops: 126, memoryUpgradeable: false,
    architecture: 'Strix Halo', systemType: 'mini-pc', memoryBandwidthGbS: 256, chipTdpW: 120, powerSupplyW: 230,
    aiPerformanceLabel: 'Up to 126 platform TOPS; 40 RDNA 3.5 compute units',
    price: price(1999.99, 'store', 'GMKtec', 'https://www.gmktec.com/en/products/amd-ryzen%E2%84%A2-ai-max-395-evo-x2-ai-mini-pc'), tags: ['Local AI', 'Unified memory', '126 TOPS'],
    specSourceUrl: 'https://www.gmktec.com/en/products/amd-ryzen%E2%84%A2-ai-max-395-evo-x2-ai-mini-pc',
  },
  {
    id: 'minisforum-ai-x1-pro-64', category: 'mini-pc', manufacturer: 'Minisforum', name: 'AI X1 Pro — 64 GB / 1 TB',
    description: 'Upgradeable compact AI PC with Ryzen AI 9, Radeon 890M, and triple M.2 storage.',
    processor: 'AMD Ryzen AI 9 HX 370', graphics: 'Radeon 890M', memoryGb: 64, storageGb: 1024, memoryType: 'DDR5-5600 SODIMM', npuTops: 50, totalAiTops: 80, memoryUpgradeable: true,
    architecture: 'Strix Point', systemType: 'mini-pc', memoryBandwidthGbS: 89.6, chipTdpW: 54, powerSupplyW: 135,
    price: price(1151.90, 'store', 'Minisforum', 'https://www.minisforum.com/collections/ai-mini-pcs/products/minisforum-ai-x1-pro'), tags: ['Upgradeable', '80 TOPS', 'USB4'],
    specSourceUrl: 'https://www.minisforum.com/collections/ai-mini-pcs/products/minisforum-ai-x1-pro',
    compatibilitySourceUrl: 'https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-9-hx-370.html',
  },
  {
    id: 'minisforum-ai-x1-pro-470', category: 'mini-pc', manufacturer: 'Minisforum', name: 'AI X1 Pro 470 — Barebone',
    description: 'Upgradeable Ryzen AI 9 HX 470 barebone with a Radeon 890M iGPU.',
    processor: 'AMD Ryzen AI 9 HX 470', graphics: 'Radeon 890M', memoryGb: 0, storageGb: 0, memoryType: 'DDR5-5600 SODIMM', npuTops: 55, totalAiTops: 86, memoryUpgradeable: true,
    architecture: 'Gorgon Point', systemType: 'mini-pc', memoryBandwidthGbS: 89.6, chipTdpW: 54, powerSupplyW: 135,
    price: price(759, 'store', 'Minisforum', 'https://www.minisforum.com/products/ai-x1-pro-470'), tags: ['Barebone', 'Upgradeable', '86 TOPS'],
    specSourceUrl: 'https://www.minisforum.com/products/ai-x1-pro-470',
    compatibilitySourceUrl: 'https://www.amd.com/en/products/processors/laptop/ryzen/ai-400-series/amd-ryzen-ai-9-hx-470.html',
  },
  {
    id: 'asus-rog-nuc-2025', category: 'mini-pc', manufacturer: 'ASUS', name: 'ROG NUC (2025)',
    description: 'Compact gaming and AI system pairing Core Ultra with laptop RTX 50-series graphics.',
    processor: 'Intel Core Ultra 9 275HX', graphics: 'GeForce RTX 5070 Ti Laptop GPU', memoryGb: 32, storageGb: 2048, memoryType: 'DDR5-6400 SODIMM', npuTops: 13, totalAiTops: null, memoryUpgradeable: true,
    architecture: 'Arrow Lake-HX + Blackwell', systemType: 'mini-pc', memoryBandwidthGbS: 102.4, chipTdpW: 55, powerSupplyW: 330,
    price: price(2799, 'store', 'ASUS Store', 'https://rog.asus.com/us/desktops/mini-pc/rog-nuc-2025/'), tags: ['Gaming', 'Discrete GPU', 'Upgradeable'],
    specSourceUrl: 'https://rog.asus.com/us/desktops/mini-pc/rog-nuc-2025/spec/',
  },
  {
    id: 'hp-z2-mini-g1a-395', category: 'mini-pc', manufacturer: 'HP', name: 'Z2 Mini G1a — AI Max+ PRO 395',
    description: 'ISV-oriented mini workstation configured for local AI, graphics, and professional workloads.',
    processor: 'AMD Ryzen AI Max+ PRO 395', graphics: 'Radeon 8060S', memoryGb: 32, storageGb: 1024, memoryType: 'Unified LPDDR5X-8000', npuTops: 50, totalAiTops: 126, memoryUpgradeable: false,
    architecture: 'Strix Halo PRO', systemType: 'mini-pc', memoryBandwidthGbS: 256, chipTdpW: 120, powerSupplyW: 300,
    aiPerformanceLabel: 'Up to 126 platform TOPS; configurable unified-memory capacity',
    price: price(5182, 'MSRP', 'HP configurable MSRP', 'https://www.hp.com/us-en/shop/custom/hp-z2-mini-g1a-workstation-desktop-pc-customizable-amd-ryzen-ai-32gb-ram-512gb-ssd-A74X0AV_165298'), tags: ['Workstation', 'PRO', 'Local AI'],
    specSourceUrl: 'https://h20195.www2.hp.com/v2/getpdf.aspx/c09091191.pdf',
    compatibilitySourceUrl: 'https://support.hp.com/us-en/product/setup-user-guides/hp-z2-mini-g1a-workstation-desktop-pc/model/2102796903',
  },
];

export const allProducts: Product[] = [...cpus, ...motherboards, ...gpus, ...ram, ...miniPcs, ...serverSystems];
