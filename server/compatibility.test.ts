import { describe, expect, it } from 'vitest';
import { allProducts, optane100CpuModels, optane200CpuModels } from './catalog';
import { compatibleIdsFor, validateBuild } from './compatibility';
import type { Cpu, Gpu } from '../src/types';

describe('compatibility engine', () => {
  it('retains workstation-specific MC62-G40 topology', () => {
    const board = allProducts.find((product) => product.id === 'gigabyte-mc62-g40-rev-1x');
    expect(board).toMatchObject({
      category: 'motherboard', socket: 'sWRX8', chipset: 'WRX80', formFactor: 'CEB',
      memoryType: 'DDR4', memorySlots: 8, memoryChannels: 8, eccSupport: true,
      pcieX16Slots: 7, pcieGeneration: 4, slimSas4iPorts: 3, maxMemoryGb: 2048,
    });
  });

  it('matches the eight processors on the published MC62-G40 CPU QVL', () => {
    const ids = compatibleIdsFor('cpu', { motherboard: 'gigabyte-mc62-g40-rev-1x' }, allProducts);
    const qualified = ids.filter((id) => id.startsWith('amd-threadripper-pro-'));
    expect(qualified).toHaveLength(8);
    expect(qualified).toEqual(expect.arrayContaining([
      'amd-threadripper-pro-5995wx', 'amd-threadripper-pro-5975wx',
      'amd-threadripper-pro-5965wx', 'amd-threadripper-pro-5955wx',
      'amd-threadripper-pro-3995wx', 'amd-threadripper-pro-3975wx',
      'amd-threadripper-pro-3955wx', 'amd-threadripper-pro-3945wx',
    ]));
    expect(qualified).not.toContain('amd-threadripper-pro-5945wx');
  });

  it('stores full I/O and memory-controller details for every qualified CPU', () => {
    const ids = compatibleIdsFor('cpu', { motherboard: 'gigabyte-mc62-g40-rev-1x' }, allProducts);
    const qualified = allProducts.filter((product) => ids.includes(product.id) && product.category === 'cpu');
    expect(qualified).toHaveLength(8);
    qualified.forEach((cpu) => expect(cpu).toMatchObject({
      pcieGeneration: 4, pcieLanes: 128, pcieLaneRateGtS: 16,
      pciePayloadGbSPerLane: 1.969, theoreticalPcieBandwidthGbS: 252.1,
      memoryChannels: 8, memoryChannelWidthBits: 64, memoryBusWidthBits: 512,
      memorySpeedMt: 3200, theoreticalMemoryBandwidthGbS: 204.8,
      maxMemoryGb: 2048, eccSupport: true,
    }));
  });

  it('records CPU-direct and chipset-shared MC62-G40 lane routing separately', () => {
    const board = allProducts.find((product) => product.id === 'gigabyte-mc62-g40-rev-1x');
    expect(board).toMatchObject({
      platformPcieLanes: 152, cpuDirectExpansionLanes: 104,
      cpuDirectM2Lanes: 8, chipsetUplinkLanes: 8,
      dimmsPerChannel: 1, maxDimmCapacityGb: 256,
    });
  });

  it('uses the exact ASUS SAGE CPU support lists', () => {
    const wrx80Ids = compatibleIdsFor('cpu', { motherboard: 'asus-pro-ws-wrx80e-sage-se-wifi' }, allProducts)
      .filter((id) => id.startsWith('amd-threadripper-pro-'));
    const wrx90Ids = compatibleIdsFor('cpu', { motherboard: 'asus-pro-ws-wrx90e-sage-se' }, allProducts)
      .filter((id) => id.startsWith('amd-threadripper-pro-'));

    expect(wrx80Ids).toHaveLength(8);
    expect(wrx80Ids).toEqual(expect.arrayContaining([
      'amd-threadripper-pro-5995wx', 'amd-threadripper-pro-5955wx',
      'amd-threadripper-pro-3995wx', 'amd-threadripper-pro-3945wx',
    ]));
    expect(wrx90Ids).toHaveLength(10);
    expect(wrx90Ids).toEqual(expect.arrayContaining([
      'amd-threadripper-pro-9995wx', 'amd-threadripper-pro-9955wx',
      'amd-threadripper-pro-7995wx', 'amd-threadripper-pro-7955wx',
    ]));
  });

  it('warns about ASUS BIOS requirements without rejecting qualified CPUs', () => {
    const result = validateBuild({
      cpu: 'amd-threadripper-pro-9995wx', motherboard: 'asus-pro-ws-wrx90e-sage-se',
    }, allProducts);
    expect(result.compatible).toBe(true);
    expect(result.issues).toContainEqual(expect.objectContaining({
      code: 'minimum-bios', severity: 'warning', title: 'BIOS 1106 or newer required',
    }));
  });

  it('rejects desktop DDR5 UDIMMs on the WRX90 SAGE', () => {
    const result = validateBuild({
      motherboard: 'asus-pro-ws-wrx90e-sage-se', ram: 'corsair-vengeance-32-6000',
    }, allProducts);
    expect(result.compatible).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'registered-memory-required' }));
  });

  it('warns buyers about vendor-locked used Threadripper PRO CPUs', () => {
    const result = validateBuild({
      cpu: 'amd-threadripper-pro-3945wx', motherboard: 'gigabyte-mc62-g40-rev-1x',
    }, allProducts);
    expect(result.compatible).toBe(true);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'oem-vendor-lock', severity: 'warning' }));
  });

  it('accepts a complete AM5 + DDR5 build', () => {
    const result = validateBuild({
      cpu: 'amd-ryzen-9-9950x3d',
      motherboard: 'asus-tuf-b650-plus-wifi',
      ram: 'gskill-flare-x5-32-6000',
      gpu: 'nvidia-rtx-5080',
    }, allProducts);

    expect(result.compatible).toBe(true);
    expect(result.complete).toBe(true);
    expect(result.totalCents).toBe(195_798);
    expect(result.power.recommendedPsuW).toBe(850);
  });

  it('rejects socket and memory-generation conflicts', () => {
    const result = validateBuild({
      cpu: 'amd-ryzen-9-9950x3d',
      motherboard: 'msi-b760-tomahawk-wifi-ddr4',
      ram: 'gskill-ripjaws-v-32-3200',
    }, allProducts);

    expect(result.compatible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['socket-mismatch', 'cpu-memory-mismatch']),
    );
  });

  it('allows LGA1700 processors on either DDR4 or DDR5 boards', () => {
    const ddr4 = validateBuild({
      cpu: 'intel-core-i7-14700k', motherboard: 'msi-b760-tomahawk-wifi-ddr4', ram: 'gskill-ripjaws-v-32-3200',
    }, allProducts);
    const ddr5 = validateBuild({
      cpu: 'intel-core-i7-14700k', motherboard: 'gigabyte-z790-aorus-elite-x', ram: 'corsair-vengeance-32-6000',
    }, allProducts);

    expect(ddr4.compatible).toBe(true);
    expect(ddr5.compatible).toBe(true);
  });

  it('filters motherboards down to compatible sockets', () => {
    const ids = compatibleIdsFor('motherboard', { cpu: 'amd-ryzen-7-9800x3d' }, allProducts);
    expect(ids).toContain('asus-tuf-b650-plus-wifi');
    expect(ids).not.toContain('msi-b760-tomahawk-wifi-ddr4');
  });

  it('catalogs the complete researched 24 GB+ AMD and NVIDIA PCIe set', () => {
    const highVram = allProducts.filter((product): product is Gpu => product.category === 'gpu' && product.vramGb >= 24);
    expect(highVram).toHaveLength(71);
    expect(highVram.filter((gpu) => gpu.manufacturer === 'NVIDIA')).toHaveLength(50);
    expect(highVram.filter((gpu) => gpu.manufacturer === 'AMD')).toHaveLength(21);
    expect(highVram.every((gpu) => gpu.interface.startsWith('PCIe') && Boolean(gpu.specSourceUrl))).toBe(true);
    expect(highVram.map((gpu) => gpu.id)).toEqual(expect.arrayContaining([
      'nvidia-titan-rtx', 'nvidia-rtx-5090',
      'nvidia-h200-nvl', 'nvidia-rtx-pro-6000-blackwell-server',
      'amd-firepro-w9100-32', 'amd-radeon-pro-v710', 'amd-instinct-mi350p',
      'amd-radeon-ai-pro-r9600d',
    ]));
  });

  it('catalogs every installable NVIDIA Blackwell reference variant separately', () => {
    const blackwell = allProducts.filter((product): product is Gpu => (
      product.category === 'gpu' && product.manufacturer === 'NVIDIA' && product.architecture === 'Blackwell'
    ));
    expect(blackwell).toHaveLength(15);
    expect(blackwell.map((gpu) => gpu.id)).toEqual(expect.arrayContaining([
      'nvidia-rtx-5090',
      'nvidia-rtx-5080', 'nvidia-rtx-5070-ti', 'nvidia-rtx-5070',
      'nvidia-rtx-pro-2000-blackwell', 'nvidia-rtx-pro-4000-blackwell-sff',
      'nvidia-rtx-pro-6000-blackwell-workstation', 'nvidia-rtx-pro-6000d-blackwell-server',
    ]));
    expect(blackwell.every((gpu) => gpu.interface.startsWith('PCIe') && gpu.tensorCoreGeneration === '5th generation')).toBe(true);
    expect(blackwell.filter((gpu) => gpu.id !== 'nvidia-rtx-pro-6000d-blackwell-server').every((gpu) => Boolean(gpu.fp4AiTops))).toBe(true);
  });

  it('excludes GPUs with 10 GB or less from the AI catalog', () => {
    const catalogGpus = allProducts.filter((product): product is Gpu => product.category === 'gpu');
    expect(catalogGpus).toHaveLength(84);
    expect(catalogGpus.every((gpu) => (gpu.addressableVramGb ?? gpu.vramGb) >= 12)).toBe(true);
    expect(catalogGpus.map((gpu) => gpu.id)).not.toEqual(expect.arrayContaining([
      'nvidia-rtx-3080', 'nvidia-rtx-4060', 'nvidia-rtx-5060', 'nvidia-tesla-m10',
      'nvidia-rtx-4070', 'nvidia-rtx-5060-ti-16', 'nvidia-rtx-3060',
      'intel-arc-b580', 'nvidia-tesla-p40', 'nvidia-tesla-m40-24', 'nvidia-tesla-k80',
      'nvidia-rtx-5090-d', 'nvidia-rtx-5090-d-v2',
    ]));
  });

  it('preserves per-GPU addressable VRAM on split-memory cards', () => {
    expect(allProducts.find((product) => product.id === 'nvidia-a16')).toMatchObject({
      category: 'gpu', vramGb: 64, gpuCount: 4, addressableVramGb: 16, memoryPool: 'split',
    });
  });

  it('warns about split VRAM, passive cooling, and missing display outputs', () => {
    const result = validateBuild({ gpu: 'nvidia-a16' }, allProducts);
    expect(result.compatible).toBe(true);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'split-gpu-memory', 'passive-gpu-airflow', 'gpu-no-display-output', 'quote-price-excluded',
    ]));
    expect(result.totalCents).toBe(0);
  });

  it('treats quote-only pricing as unknown rather than a free card', () => {
    const result = validateBuild({
      cpu: 'amd-threadripper-pro-5995wx', gpu: 'amd-instinct-mi350p',
    }, allProducts);
    expect(result.totalCents).toBe(649_900);
    expect(result.power.recommendedPsuW).toBeGreaterThanOrEqual(1200);
    expect(result.issues).toContainEqual(expect.objectContaining({
      code: 'quote-price-excluded', severity: 'info',
    }));
  });

  it('catalogs researched complete systems for both Optane PMem generations', () => {
    const servers = allProducts.filter((product) => product.category === 'server-system');
    expect(servers).toHaveLength(12);
    expect(servers.filter((server) => server.optaneSeries === '100')).toHaveLength(6);
    expect(servers.filter((server) => server.optaneSeries === '200')).toHaveLength(6);
    expect(servers.every((server) => server.linuxSupport && server.windowsSupport)).toBe(true);
    expect(servers.every((server) => server.sluiceV2Fit === 'not-viable')).toBe(true);
    expect(servers.every((server) => server.powerSupplyOptionsW.length > 0 && Boolean(server.powerSourceUrl))).toBe(true);
    expect(servers.filter((server) => server.optaneSeries === '100').every((server) => server.maxOptanePowerW === 216)).toBe(true);
    expect(servers.filter((server) => server.optaneSeries === '200').every((server) => server.maxOptanePowerW === 240)).toBe(true);
    expect(servers.find((server) => server.id === 'intel-server-r2000wf')).toMatchObject({ maxCpuTdpW: 165, cpuAndOptaneBudgetW: 546 });
    expect(servers.find((server) => server.id === 'dell-poweredge-r750')).toMatchObject({ maxCpuTdpW: 270, cpuAndOptaneBudgetW: 780 });
  });

  it('stores Intel complete PMem-compatible Xeon pools and per-system capacity', () => {
    expect(optane100CpuModels).toHaveLength(61);
    expect(optane200CpuModels).toHaveLength(49);
    const r740 = allProducts.find((product) => product.id === 'dell-poweredge-r740');
    const r750 = allProducts.find((product) => product.id === 'dell-poweredge-r750');
    expect(r740).toMatchObject({ category: 'server-system', optaneSeries: '100', optaneSlots: 12, maxOptaneGb: 6144, pcieSlots: 8 });
    expect(r750).toMatchObject({ category: 'server-system', optaneSeries: '200', optaneSlots: 16, maxOptaneGb: 8192, pcieSlots: 8 });
  });

  it('catalogs every Intel-listed DDR4 Optane CPU as a ranked first-class product', () => {
    const optaneCpus = allProducts.filter((product): product is Cpu => product.category === 'cpu' && Boolean(product.optanePmemSeries));
    expect(optaneCpus).toHaveLength(110);
    expect(optaneCpus.filter((cpu) => cpu.optanePmemSeries === '100')).toHaveLength(61);
    expect(optaneCpus.filter((cpu) => cpu.optanePmemSeries === '200')).toHaveLength(49);
    expect(new Set(optaneCpus.map((cpu) => cpu.aiRankWithinOptane)).size).toBe(110);
    expect(optaneCpus.every((cpu) => cpu.serverOnly && cpu.aiRankTotal === 110 && Boolean(cpu.aiAssessment))).toBe(true);
  });

  it('keeps Cooper Lake and Ice Lake PMem 200 I/O topologies distinct', () => {
    expect(allProducts.find((product) => product.id === 'intel-xeon-platinum-8380hl')).toMatchObject({
      category: 'cpu', architecture: 'Cooper Lake', memoryChannels: 6,
      pcieGeneration: 3, pcieLanes: 48, nativeBfloat16: true, maxMemoryGb: 4608,
    });
    expect(allProducts.find((product) => product.id === 'intel-xeon-platinum-8380')).toMatchObject({
      category: 'cpu', architecture: 'Ice Lake', memoryChannels: 8,
      pcieGeneration: 4, pcieLanes: 64, nativeBfloat16: false, maxMemoryGb: 6144,
    });
  });

  it('keeps server-only Xeons out of the desktop PC builder', () => {
    const ids = compatibleIdsFor('cpu', {}, allProducts);
    expect(ids).not.toContain('intel-xeon-platinum-8380');
    expect(ids).not.toContain('intel-xeon-platinum-8280');
    expect(ids).toContain('amd-threadripper-pro-9995wx');
  });
});
