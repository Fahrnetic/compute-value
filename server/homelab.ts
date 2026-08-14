import type {
  AuditCheck,
  BuildSpec,
  Chassis,
  Cooler,
  Cpu,
  ElectricalProfile,
  Gpu,
  HomelabAudit,
  ModelFitReport,
  ModelProfile,
  Motherboard,
  Nic,
  PowerPlan,
  Product,
  Psu,
  Ram,
  StorageDevice,
} from '../src/types.js';

export const electricalProfiles: ElectricalProfile[] = [
  { id: 'us-120-15', label: 'US 120 V / 15 A', voltage: 120, breakerAmps: 15, continuousLoadFactor: 0.8, region: 'US / Canada' },
  { id: 'us-120-20', label: 'US 120 V / 20 A', voltage: 120, breakerAmps: 20, continuousLoadFactor: 0.8, region: 'US / Canada' },
  { id: 'us-240-20', label: 'US 240 V / 20 A', voltage: 240, breakerAmps: 20, continuousLoadFactor: 0.8, region: 'US / Canada' },
  { id: 'global-230-10', label: '230 V / 10 A', voltage: 230, breakerAmps: 10, continuousLoadFactor: 0.8, region: 'International planning profile' },
  { id: 'global-230-13', label: '230 V / 13 A', voltage: 230, breakerAmps: 13, continuousLoadFactor: 0.8, region: 'International planning profile' },
  { id: 'global-230-16', label: '230 V / 16 A', voltage: 230, breakerAmps: 16, continuousLoadFactor: 0.8, region: 'International planning profile' },
];

export const modelProfiles: ModelProfile[] = [
  {
    id: 'llama-3.1-8b-q4km', label: 'Llama 3.1 8B · Q4_K_M', parametersB: 8, quantization: 'Q4_K_M',
    weightGb: 4.9, baseOverheadGb: 1.2, kvGbPer8kContext: 1.1,
    sourceUrl: 'https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct',
  },
  {
    id: 'qwen-3.5-27b-q4km', label: 'Qwen3.5 27B · Q4_K_M', parametersB: 27, quantization: 'Q4_K_M',
    weightGb: 17.2, baseOverheadGb: 1.8, kvGbPer8kContext: 1.7,
    sourceUrl: 'https://huggingface.co/Qwen/Qwen3.5-27B',
  },
  {
    id: 'llama-3.3-70b-q4km', label: 'Llama 3.3 70B · Q4_K_M', parametersB: 70, quantization: 'Q4_K_M',
    weightGb: 42.8, baseOverheadGb: 2.5, kvGbPer8kContext: 2.5,
    sourceUrl: 'https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct',
  },
  {
    id: 'deepseek-r1-671b-q4', label: 'DeepSeek-R1 671B · Q4 planning case', parametersB: 671, quantization: 'Q4',
    weightGb: 404, baseOverheadGb: 12, kvGbPer8kContext: 7.5,
    sourceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1',
  },
];

function product<T extends Product['category']>(products: Product[], id: string | undefined, category: T) {
  return products.find((candidate) => candidate.id === id && candidate.category === category) as Extract<Product, { category: T }> | undefined;
}

function roundUp(value: number, unit: number) {
  return Math.ceil(value / unit) * unit;
}

function psuEfficiency(psu?: Psu) {
  if (psu?.efficiencyRating === '80 Plus Titanium') return 0.94;
  if (psu?.efficiencyRating === '80 Plus Platinum') return 0.92;
  return 0.9;
}

export function calculatePowerPlan(spec: BuildSpec, products: Product[]): PowerPlan {
  const cpu = product(products, spec.cpuId, 'cpu') as Cpu | undefined;
  const gpu = product(products, spec.gpuId, 'gpu') as Gpu | undefined;
  const psu = product(products, spec.psuId, 'psu') as Psu | undefined;
  const storage = product(products, spec.storageId, 'storage') as StorageDevice | undefined;
  const nic = product(products, spec.nicId, 'nic') as Nic | undefined;
  const profile = electricalProfiles.find((candidate) => candidate.id === spec.electricalProfileId) ?? electricalProfiles[0];
  const gpuCount = Math.max(0, Math.min(8, spec.gpuCount || 0));
  const limit = Math.max(40, Math.min(100, spec.gpuPowerLimitPercent || 100));
  const cpuPeakW = (cpu?.basePowerW ?? 0) * 1.35;
  const gpuPeakW = (gpu?.boardPowerW ?? 0) * gpuCount * (limit / 100);
  const supportingW = 70 + (storage?.powerW ?? 0) + (nic?.powerW ?? 0) + (spec.ramId ? 24 : 0);
  const componentPeakW = Math.round(cpuPeakW + gpuPeakW + supportingW);
  const recommendedPsuW = componentPeakW ? Math.max(gpu?.recommendedPsuW ?? 0, roundUp(componentPeakW * 1.2, 100)) : 0;
  const wallPeakW = Math.round(componentPeakW / psuEfficiency(psu));
  const typicalW = Math.round(wallPeakW * 0.72);
  const idleW = Math.round(45 + (cpu?.basePowerW ?? 0) * 0.1 + gpuCount * 18 + (nic?.powerW ?? 0) * 0.35);
  const circuitContinuousLimitW = Math.round(profile.voltage * profile.breakerAmps * profile.continuousLoadFactor);
  const circuitUtilizationPercent = circuitContinuousLimitW ? Math.round((wallPeakW / circuitContinuousLimitW) * 100) : 0;
  const estimatedAmps = profile.voltage ? Number((wallPeakW / profile.voltage).toFixed(1)) : 0;
  const performanceRetentionPercent = Math.round(70 + limit * 0.3);

  let outletVerdict: PowerPlan['outletVerdict'] = 'ordinary-outlet';
  if (circuitUtilizationPercent > 100) outletVerdict = profile.voltage < 200 && wallPeakW <= 3840 ? '240v-recommended' : 'not-suitable';
  else if (circuitUtilizationPercent > 75) outletVerdict = 'dedicated-circuit';

  const notes = [
    'Planning estimate: verify actual wall power with a meter and follow local electrical code.',
    `${limit}% GPU power limit is modeled at roughly ${performanceRetentionPercent}% retained performance; exact behavior varies by workload and card.`,
  ];
  if (gpuCount > 1) notes.push('Multi-GPU startup excursions and simultaneous load spikes require an ATX 3.x or qualified server power design.');
  if (psu && psu.continuousPowerW < recommendedPsuW) notes.push(`The selected ${psu.continuousPowerW} W PSU is below the ${recommendedPsuW} W planning target.`);

  return {
    idleW, typicalW, componentPeakW, wallPeakW, recommendedPsuW,
    selectedPsuW: psu?.continuousPowerW,
    circuitContinuousLimitW, circuitUtilizationPercent, estimatedAmps,
    heatBtuH: Math.round(wallPeakW * 3.412), outletVerdict, performanceRetentionPercent, notes,
  };
}

export function calculateModelFit(spec: BuildSpec, products: Product[]): ModelFitReport {
  const gpu = product(products, spec.gpuId, 'gpu') as Gpu | undefined;
  const ram = product(products, spec.ramId, 'ram') as Ram | undefined;
  const model = modelProfiles.find((candidate) => candidate.id === spec.modelProfileId);
  if (!model) {
    return {
      status: 'unknown', label: 'Select a model profile', requiredMemoryGb: 0, addressableMemoryGb: 0,
      aggregateMemoryGb: 0, estimatedMaxContext: 0, estimatedConcurrentUsers: 0,
      explanation: 'No model profile is selected, so memory fit cannot be calculated.', confidence: 'planning-estimate',
    };
  }

  const contextMultiplier = Math.max(1, spec.contextTokens) / 8192;
  const users = Math.max(1, spec.concurrentUsers || 1);
  const requiredMemoryGb = Number((model.weightGb + model.baseOverheadGb + model.kvGbPer8kContext * contextMultiplier * users).toFixed(1));
  const addressableMemoryGb = gpu ? (gpu.addressableVramGb ?? gpu.vramGb) : 0;
  const aggregateMemoryGb = addressableMemoryGb * Math.max(1, spec.gpuCount || 1);
  const usableAggregate = aggregateMemoryGb * 0.9;
  const freeForKv = Math.max(0, usableAggregate - model.weightGb - model.baseOverheadGb);
  const estimatedMaxContext = model.kvGbPer8kContext
    ? Math.max(0, Math.floor((freeForKv / model.kvGbPer8kContext / users) * 8192 / 1024) * 1024)
    : 0;
  const perUserAtContext = model.kvGbPer8kContext * contextMultiplier;
  const estimatedConcurrentUsers = perUserAtContext
    ? Math.max(0, Math.floor((freeForKv / perUserAtContext)))
    : 0;

  if (gpu && requiredMemoryGb <= addressableMemoryGb * 0.9) {
    return {
      status: 'fits-accelerator', label: 'Fits on one accelerator', requiredMemoryGb, addressableMemoryGb, aggregateMemoryGb,
      estimatedMaxContext, estimatedConcurrentUsers,
      explanation: `${model.label} fits inside one ${addressableMemoryGb} GB addressable memory pool with a 10% planning reserve.`,
      confidence: 'calculated',
    };
  }
  if (gpu && spec.gpuCount > 1 && requiredMemoryGb <= usableAggregate) {
    return {
      status: 'fits-multi-gpu', label: `Fits across ${spec.gpuCount} GPUs`, requiredMemoryGb, addressableMemoryGb, aggregateMemoryGb,
      estimatedMaxContext, estimatedConcurrentUsers,
      explanation: `The model requires tensor splitting across ${spec.gpuCount} independent ${addressableMemoryGb} GB pools. Interconnect and runtime support determine the speed penalty.`,
      confidence: 'planning-estimate',
    };
  }
  if (ram && requiredMemoryGb <= ram.capacityGb * 0.85) {
    return {
      status: 'fits-cpu-offload', label: 'Fits with system-memory offload', requiredMemoryGb, addressableMemoryGb, aggregateMemoryGb,
      estimatedMaxContext, estimatedConcurrentUsers,
      explanation: `The selected RAM can hold the model, but some weights must leave accelerator memory. Expect a substantial speed reduction governed by system memory and PCIe bandwidth.`,
      confidence: 'planning-estimate',
    };
  }
  return {
    status: 'does-not-fit', label: 'Does not fit this memory configuration', requiredMemoryGb, addressableMemoryGb, aggregateMemoryGb,
    estimatedMaxContext, estimatedConcurrentUsers,
    explanation: `The profile needs about ${requiredMemoryGb} GB after context and concurrency reserves. Choose more VRAM, more GPUs, lower context, or a smaller quantization.`,
    confidence: 'calculated',
  };
}

function pushCheck(checks: AuditCheck[], check: AuditCheck) {
  checks.push(check);
}

export function auditHomelabBuild(spec: BuildSpec, products: Product[]): HomelabAudit {
  const cpu = product(products, spec.cpuId, 'cpu') as Cpu | undefined;
  const motherboard = product(products, spec.motherboardId, 'motherboard') as Motherboard | undefined;
  const ram = product(products, spec.ramId, 'ram') as Ram | undefined;
  const gpu = product(products, spec.gpuId, 'gpu') as Gpu | undefined;
  const psu = product(products, spec.psuId, 'psu') as Psu | undefined;
  const chassis = product(products, spec.chassisId, 'chassis') as Chassis | undefined;
  const cooler = product(products, spec.coolerId, 'cooler') as Cooler | undefined;
  const storage = product(products, spec.storageId, 'storage') as StorageDevice | undefined;
  const nic = product(products, spec.nicId, 'nic') as Nic | undefined;
  const gpuCount = Math.max(1, Math.min(8, spec.gpuCount || 1));
  const checks: AuditCheck[] = [];

  if (cpu && motherboard) {
    pushCheck(checks, cpu.socket === motherboard.socket ? {
      code: 'socket', status: 'pass', severity: 'critical', title: 'CPU socket matches',
      detail: `${cpu.name} and ${motherboard.name} both use ${cpu.socket}.`, evidenceUrl: motherboard.compatibilitySourceUrl ?? motherboard.specSourceUrl,
    } : {
      code: 'socket', status: 'fail', severity: 'critical', title: 'CPU socket mismatch',
      detail: `${cpu.name} uses ${cpu.socket}; ${motherboard.name} uses ${motherboard.socket}.`,
      fix: `Choose a ${cpu.socket} motherboard or a processor supported by ${motherboard.socket}.`, evidenceUrl: motherboard.specSourceUrl,
    });
  }

  if (motherboard && ram) {
    const typeMatches = motherboard.memoryType === ram.memoryType;
    const registrationMatches = !motherboard.registeredMemoryRequired || Boolean(ram.registered);
    const capacityMatches = ram.capacityGb <= motherboard.maxMemoryGb && ram.modules <= motherboard.memorySlots;
    pushCheck(checks, typeMatches && registrationMatches && capacityMatches ? {
      code: 'memory', status: 'pass', severity: 'critical', title: 'Memory population is compatible',
      detail: `${ram.capacityGb} GB across ${ram.modules} modules fits the board's ${motherboard.memorySlots} slots and ${motherboard.maxMemoryGb} GB limit.`, evidenceUrl: motherboard.specSourceUrl,
    } : {
      code: 'memory', status: 'fail', severity: 'critical', title: 'Memory configuration needs changes',
      detail: `Board requires ${motherboard.memoryType}${motherboard.registeredMemoryRequired ? ' ECC RDIMM' : ''}, has ${motherboard.memorySlots} slots, and supports ${motherboard.maxMemoryGb} GB.`,
      fix: 'Select a kit matching memory generation, registration, module count, and board capacity.', evidenceUrl: motherboard.specSourceUrl,
    });
  }

  if (motherboard && gpu) {
    const eligibleSlots = motherboard.pcieSlots?.filter((slot) => slot.electricalLanes >= 8) ?? [];
    const availableGpuSlots = eligibleSlots.length || motherboard.pcieX16Slots;
    const laneDemand = gpuCount * Math.min(16, gpu.pcieLanes ?? 16) + (storage ? 4 : 0) + (nic?.pcieLanes ?? 0);
    const laneBudget = cpu?.pcieUsableLanes ?? cpu?.pcieLanes ?? motherboard.platformPcieLanes ?? 0;
    pushCheck(checks, availableGpuSlots >= gpuCount ? {
      code: 'gpu-slots', status: 'pass', severity: 'critical', title: `${gpuCount} GPU slot${gpuCount === 1 ? '' : 's'} available`,
      detail: `${motherboard.name} exposes ${availableGpuSlots} expansion slots with at least x8 electrical connectivity or documented x16 capacity.`, evidenceUrl: motherboard.specSourceUrl,
    } : {
      code: 'gpu-slots', status: 'fail', severity: 'critical', title: 'Not enough electrically useful GPU slots',
      detail: `${gpuCount} GPUs were selected, but only ${availableGpuSlots} suitable slots are documented.`, fix: 'Reduce GPU quantity or choose a workstation/server board with more CPU-direct slots.', evidenceUrl: motherboard.specSourceUrl,
    });
    pushCheck(checks, laneBudget === 0 ? {
      code: 'pcie-lanes', status: 'unknown', severity: 'important', title: 'PCIe lane budget is not fully documented',
      detail: 'The database lacks enough topology evidence to prove the selected devices can all run at their intended widths.', fix: 'Review the motherboard block diagram and CPU lane specification before purchasing.',
    } : laneDemand <= laneBudget ? {
      code: 'pcie-lanes', status: 'pass', severity: 'important', title: 'CPU lane budget covers selected devices',
      detail: `Estimated demand is ${laneDemand} lanes against ${laneBudget} usable CPU/platform lanes.`, evidenceUrl: cpu?.specSourceUrl,
    } : {
      code: 'pcie-lanes', status: 'warning', severity: 'important', title: 'Devices will share or reduce PCIe width',
      detail: `Estimated demand is ${laneDemand} lanes against ${laneBudget} available lanes.`, fix: 'Choose a higher-lane CPU/platform or accept reduced link widths.', evidenceUrl: cpu?.specSourceUrl,
    });
  }

  if (gpu && chassis) {
    const width = gpu.slotWidth ?? 2;
    const lengthFits = !gpu.lengthMm || gpu.lengthMm <= chassis.maxGpuLengthMm;
    const slotFits = gpuCount * width <= chassis.expansionSlots && width <= chassis.maxGpuSlotWidth;
    const passiveFits = gpu.cooling !== 'passive' || chassis.passiveGpuReady;
    pushCheck(checks, lengthFits && slotFits && passiveFits ? {
      code: 'physical-fit', status: 'pass', severity: 'critical', title: 'Chassis envelope fits the GPU plan',
      detail: `${chassis.name} provides ${chassis.expansionSlots} slots and ${chassis.maxGpuLengthMm} mm GPU clearance.`, evidenceUrl: chassis.specSourceUrl,
    } : {
      code: 'physical-fit', status: 'fail', severity: 'critical', title: 'GPU plan does not fit this chassis',
      detail: `${gpuCount} × ${width}-slot cards require ${gpuCount * width} slots; card length is ${gpu.lengthMm || 'unpublished'} mm.`,
      fix: gpu.cooling === 'passive' && !chassis.passiveGpuReady ? 'Use a qualified rack/server airflow path for this passive card.' : 'Choose fewer/narrower GPUs or a larger chassis.', evidenceUrl: chassis.specSourceUrl,
    });
  }

  if (cpu && cooler) {
    const socketFits = cooler.supportedSockets.includes(cpu.socket);
    const thermalsFit = cooler.thermalCapacityW >= cpu.basePowerW;
    pushCheck(checks, socketFits && thermalsFit ? {
      code: 'cooling', status: 'pass', severity: 'critical', title: 'CPU cooler is suitable',
      detail: `${cooler.name} supports ${cpu.socket} and is planned for up to ${cooler.thermalCapacityW} W.`, evidenceUrl: cooler.specSourceUrl,
    } : {
      code: 'cooling', status: 'fail', severity: 'critical', title: 'CPU cooling is incompatible',
      detail: `${cooler.name} ${socketFits ? 'fits the socket but lacks thermal headroom' : `does not support ${cpu.socket}`}.`,
      fix: `Choose a ${cpu.socket} cooler rated for at least ${cpu.basePowerW} W sustained load.`, evidenceUrl: cooler.specSourceUrl,
    });
  }

  const power = calculatePowerPlan(spec, products);
  if (psu) {
    const nativeHighPowerNeeded = Boolean(gpu?.powerConnectors?.match(/16-pin|12VHPWR|12V-2x6/i));
    const connectorFits = !nativeHighPowerNeeded || psu.native12v2x6Connectors >= gpuCount;
    const wattageFits = psu.continuousPowerW >= power.recommendedPsuW;
    pushCheck(checks, connectorFits && wattageFits ? {
      code: 'psu', status: 'pass', severity: 'critical', title: 'PSU capacity and primary connectors pass',
      detail: `${psu.continuousPowerW} W selected against a ${power.recommendedPsuW} W target, with ${psu.native12v2x6Connectors} native 12V-2x6 connector(s).`, evidenceUrl: psu.specSourceUrl,
    } : {
      code: 'psu', status: 'fail', severity: 'critical', title: 'Power supply needs changes',
      detail: `${psu.continuousPowerW} W selected against a ${power.recommendedPsuW} W target.${nativeHighPowerNeeded ? ` ${gpuCount} native high-power GPU connectors are preferred.` : ''}`,
      fix: `Choose at least ${power.recommendedPsuW} W with enough independent native GPU cables.`, evidenceUrl: psu.specSourceUrl,
    });
  }

  pushCheck(checks, power.outletVerdict === 'ordinary-outlet' || power.outletVerdict === 'dedicated-circuit' ? {
    code: 'circuit', status: power.outletVerdict === 'ordinary-outlet' ? 'pass' : 'warning', severity: 'critical',
    title: power.outletVerdict === 'ordinary-outlet' ? 'Fits the selected circuit profile' : 'Dedicated circuit strongly recommended',
    detail: `${power.wallPeakW} W estimated at the wall uses ${power.circuitUtilizationPercent}% of the conservative continuous circuit limit.`,
    fix: power.outletVerdict === 'dedicated-circuit' ? 'Avoid sharing the circuit with other sustained loads and verify the receptacle/circuit with an electrician.' : undefined,
  } : {
    code: 'circuit', status: 'fail', severity: 'critical', title: power.outletVerdict === '240v-recommended' ? 'Move this build to 208–240 V service' : 'Selected circuit is not suitable',
    detail: `${power.wallPeakW} W exceeds the ${power.circuitContinuousLimitW} W planning limit.`, fix: 'Reduce GPU count/power limits or use a properly installed higher-voltage dedicated circuit.',
  });

  const modelFit = calculateModelFit(spec, products);
  pushCheck(checks, modelFit.status === 'does-not-fit' ? {
    code: 'model-fit', status: 'fail', severity: 'important', title: modelFit.label, detail: modelFit.explanation,
    fix: 'Use a smaller model/quantization, reduce context or users, or add addressable accelerator memory.',
  } : modelFit.status === 'fits-cpu-offload' || modelFit.status === 'fits-multi-gpu' ? {
    code: 'model-fit', status: 'warning', severity: 'important', title: modelFit.label, detail: modelFit.explanation,
  } : {
    code: 'model-fit', status: modelFit.status === 'unknown' ? 'unknown' : 'pass', severity: 'important', title: modelFit.label, detail: modelFit.explanation,
  });

  const required: Array<[string, unknown]> = [
    ['CPU', cpu], ['motherboard', motherboard], ['RAM', ram], ['GPU', gpu], ['PSU', psu],
    ['chassis', chassis], ['CPU cooler', cooler], ['storage', storage],
  ];
  const missing = required.filter(([, value]) => !value).map(([label]) => label);
  for (const label of missing) {
    pushCheck(checks, { code: `missing-${label.toLowerCase().replaceAll(' ', '-')}`, status: 'unknown', severity: 'critical', title: `${label} not selected`, detail: `Select a ${label} to complete the compatibility audit.` });
  }

  const selectedProducts = [cpu, motherboard, ram, gpu, psu, chassis, cooler, storage, nic]
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate));
  const owned = new Set(spec.ownedProductIds ?? []);
  const totalCents = selectedProducts.reduce((sum, selected) => {
    if (owned.has(selected.id)) return sum;
    return sum + selected.price.amountCents * (selected.category === 'gpu' ? gpuCount : 1);
  }, 0);
  const uncoveredCostItems = selectedProducts.filter((selected) => selected.price.amountCents === 0).map((selected) => selected.name);
  const fail = checks.some((check) => check.status === 'fail');
  const warning = checks.some((check) => check.status === 'warning' || check.status === 'unknown');
  const status: HomelabAudit['status'] = missing.length ? 'incomplete' : fail ? 'needs-changes' : warning ? 'works-with-limitations' : 'works';
  const headline = status === 'works' ? 'This build is ready on the documented rules'
    : status === 'works-with-limitations' ? 'This build works with important caveats'
      : status === 'needs-changes' ? 'Resolve the highlighted conflicts before buying'
        : 'Choose the remaining parts to finish the audit';

  const eligibleSlots = motherboard?.pcieSlots?.filter((slot) => slot.electricalLanes >= 8) ?? [];
  const laneSummary = Array.from({ length: gpu ? gpuCount : 0 }, (_, index) => {
    const slot = eligibleSlots[index];
    return {
      slot: slot?.label ?? `GPU slot ${index + 1}`,
      device: gpu?.name ?? 'GPU',
      lanes: slot ? `PCIe ${slot.generation}.0 x${slot.electricalLanes}` : (gpu?.interface ?? 'Unknown'),
      note: slot ? `${slot.source.toUpperCase()}-attached · position ${slot.position}` : 'Exact per-slot topology not recorded; verify the motherboard manual.',
    };
  });

  return { schemaVersion: 2, status, headline, checks, totalCents, uncoveredCostItems, power, modelFit, laneSummary };
}
