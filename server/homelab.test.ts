import { describe, expect, it } from 'vitest';
import type { BuildSpec, Product } from '../src/types';
import { allProducts } from './catalog';
import { auditHomelabBuild, calculateModelFit, calculatePowerPlan } from './homelab';
import { homelabProducts } from './homelab-catalog';

const products: Product[] = [...allProducts, ...homelabProducts];

const completeBuild: BuildSpec = {
  cpuId: 'amd-ryzen-9-9950x3d',
  motherboardId: 'asus-tuf-b650-plus-wifi',
  ramId: 'kingston-fury-beast-64-6000',
  gpuId: 'nvidia-rtx-3090',
  gpuCount: 1,
  gpuPowerLimitPercent: 100,
  psuId: 'corsair-rm1000x-atx31',
  chassisId: 'fractal-meshify-2-xl',
  coolerId: 'noctua-nh-d15-g2',
  storageId: 'samsung-990-pro-4tb',
  electricalProfileId: 'us-120-15',
  workload: 'chat',
  modelProfileId: 'qwen-3.5-27b-q4km',
  contextTokens: 8192,
  concurrentUsers: 1,
};

describe('homelab v2 planning engine', () => {
  it('passes a complete single-GPU AM5 build and keeps owned parts out of cost', () => {
    const purchaseAudit = auditHomelabBuild(completeBuild, products);
    const ownedAudit = auditHomelabBuild({ ...completeBuild, ownedProductIds: ['nvidia-rtx-3090'] }, products);

    expect(purchaseAudit.status).toBe('works');
    expect(purchaseAudit.checks.every((check) => check.status !== 'fail')).toBe(true);
    expect(purchaseAudit.checks).toContainEqual(expect.objectContaining({ code: 'pcie-lanes', status: 'pass' }));
    expect(purchaseAudit.modelFit.status).toBe('fits-accelerator');
    expect(purchaseAudit.power.outletVerdict).toBe('ordinary-outlet');
    expect(purchaseAudit.totalCents - ownedAudit.totalCents).toBe(completeGpuPrice());
  });

  it('rejects a CPU and motherboard socket mismatch with an actionable fix', () => {
    const audit = auditHomelabBuild({
      ...completeBuild,
      cpuId: 'amd-threadripper-9980x',
      motherboardId: 'asus-pro-ws-w890-sage',
      ramId: 'kingston-256gb-ddr5-6400-rdimm',
    }, products);

    expect(audit.status).toBe('needs-changes');
    expect(audit.checks).toContainEqual(expect.objectContaining({
      code: 'socket', status: 'fail', title: 'CPU socket mismatch',
    }));
  });

  it('flags a four-RTX-5090 build as unsuitable for an ordinary 120 V circuit', () => {
    const audit = auditHomelabBuild({
      ...completeBuild,
      cpuId: 'intel-xeon-698x',
      motherboardId: 'asus-pro-ws-w890-sage',
      ramId: 'kingston-512gb-ddr5-6400-rdimm',
      gpuId: 'nvidia-rtx-5090',
      gpuCount: 4,
      psuId: 'silverstone-hela-2050r',
      electricalProfileId: 'us-120-15',
    }, products);

    expect(audit.power.wallPeakW).toBeGreaterThan(audit.power.circuitContinuousLimitW);
    expect(audit.checks).toContainEqual(expect.objectContaining({ code: 'circuit', status: 'fail' }));
    expect(audit.laneSummary).toHaveLength(4);
    expect(audit.laneSummary.every((slot) => slot.lanes === 'PCIe 5.0 x16')).toBe(true);
  });

  it('identifies when a 70B Q4 model must be split across two 32 GB cards', () => {
    const fit = calculateModelFit({
      ...completeBuild,
      gpuId: 'nvidia-rtx-5090',
      gpuCount: 2,
      modelProfileId: 'llama-3.3-70b-q4km',
    }, products);

    expect(fit.status).toBe('fits-multi-gpu');
    expect(fit.requiredMemoryGb).toBeGreaterThan(fit.addressableMemoryGb);
    expect(fit.requiredMemoryGb).toBeLessThan(fit.aggregateMemoryGb * 0.9);
  });

  it('reports the power/performance planning effect of an 80% GPU limit', () => {
    const full = calculatePowerPlan({ ...completeBuild, gpuId: 'nvidia-rtx-5090' }, products);
    const limited = calculatePowerPlan({
      ...completeBuild, gpuId: 'nvidia-rtx-5090', gpuPowerLimitPercent: 80,
    }, products);

    expect(limited.wallPeakW).toBeLessThan(full.wallPeakW);
    expect(limited.performanceRetentionPercent).toBe(94);
  });

  it('only includes Apple systems with at least 128 GB of unified memory', () => {
    const appleSystems = products.filter((item) => item.category === 'apple-system');
    expect(appleSystems).toHaveLength(6);
    expect(appleSystems.every((item) => item.unifiedMemoryGb >= 128)).toBe(true);
    expect(appleSystems.map((item) => item.systemClass)).toEqual(expect.arrayContaining(['portable', 'desktop']));
    expect(appleSystems.find((item) => item.id === 'apple-macbook-pro-m5-max-128')).toMatchObject({
      cpuCores: 18, gpuCores: 40, unifiedMemoryGb: 128, memoryBandwidthGbS: 614,
      universalLlama2: { promptTokensPerSecond: 990.53, generatedTokensPerSecond: 104.03, evidence: 'measured-public' },
    });
    expect(appleSystems.filter((item) => item.chip === 'M3 Ultra').every((item) => item.maxSystemPowerW === 480)).toBe(true);
  });
});

function completeGpuPrice() {
  const gpu = products.find((item) => item.id === completeBuild.gpuId);
  if (!gpu || gpu.category !== 'gpu') throw new Error('Test GPU missing');
  return gpu.price.amountCents;
}
