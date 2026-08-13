import type {
  BuildSelection,
  BuilderCategory,
  Cpu,
  Gpu,
  Motherboard,
  Product,
  Ram,
  ValidationIssue,
  ValidationResult,
} from '../src/types.js';

const builderCategories: BuilderCategory[] = ['cpu', 'motherboard', 'gpu', 'ram'];

export function validateBuild(selection: BuildSelection, products: Product[]): ValidationResult {
  const byId = new Map(products.map((product) => [product.id, product]));
  const cpu = selection.cpu ? byId.get(selection.cpu) as Cpu | undefined : undefined;
  const motherboard = selection.motherboard ? byId.get(selection.motherboard) as Motherboard | undefined : undefined;
  const gpu = selection.gpu ? byId.get(selection.gpu) as Gpu | undefined : undefined;
  const ram = selection.ram ? byId.get(selection.ram) as Ram | undefined : undefined;
  const issues: ValidationIssue[] = [];

  const selectedEntries = builderCategories
    .map((category) => [category, selection[category], selection[category] ? byId.get(selection[category]!) : undefined] as const)
    .filter(([, id]) => Boolean(id));

  for (const [category, id, product] of selectedEntries) {
    if (!product || product.category !== category) {
      issues.push({
        code: `invalid-${category}`,
        severity: 'error',
        title: `Invalid ${category} selection`,
        detail: `The selected item “${id}” is missing or belongs to another category.`,
        categories: [category],
      });
    }
  }

  if (cpu && motherboard && cpu.socket !== motherboard.socket) {
    issues.push({
      code: 'socket-mismatch', severity: 'error', title: 'CPU socket mismatch',
      detail: `${cpu.name} uses ${cpu.socket}, while ${motherboard.name} uses ${motherboard.socket}.`,
      categories: ['cpu', 'motherboard'],
    });
  }

  if (cpu && motherboard && cpu.socket === motherboard.socket && motherboard.supportedCpuIds?.length && !motherboard.supportedCpuIds.includes(cpu.id)) {
    issues.push({
      code: 'cpu-not-on-board-qvl', severity: 'error', title: 'CPU is not on the motherboard QVL',
      detail: `${cpu.name} shares the ${cpu.socket} socket but is not listed in ${motherboard.name}’s published CPU qualification list.`,
      categories: ['cpu', 'motherboard'],
    });
  }

  const requiredBios = cpu && motherboard ? motherboard.requiredBiosByCpuId?.[cpu.id] : undefined;
  if (cpu && motherboard && requiredBios) {
    issues.push({
      code: 'minimum-bios', severity: 'warning', title: `BIOS ${requiredBios} or newer required`,
      detail: `${motherboard.name} validates ${cpu.name} starting with BIOS ${requiredBios}. Update with BIOS FlashBack before installing the CPU if the board has an older firmware version.`,
      categories: ['cpu', 'motherboard'],
    });
  }

  if (cpu?.vendorLockRisk) {
    issues.push({
      code: 'oem-vendor-lock', severity: 'warning', title: 'Verify the CPU is vendor-unlocked',
      detail: `Used ${cpu.name} processors may be AMD PSB-fused to an OEM such as Lenovo or Dell. Confirm the exact CPU is explicitly sold as unlocked before pairing it with a replacement motherboard.`,
      categories: ['cpu'],
    });
  }

  if (motherboard && ram && motherboard.memoryType !== ram.memoryType) {
    issues.push({
      code: 'board-memory-mismatch', severity: 'error', title: 'Memory generation mismatch',
      detail: `${motherboard.name} requires ${motherboard.memoryType}, but ${ram.name} is ${ram.memoryType}. DDR4 and DDR5 are not physically interchangeable.`,
      categories: ['motherboard', 'ram'],
    });
  }


  if (motherboard?.registeredMemoryRequired && ram && !ram.registered) {
    issues.push({
      code: 'registered-memory-required', severity: 'error', title: 'Registered ECC memory required',
      detail: `${motherboard.name} requires DDR5 ECC RDIMMs. ${ram.name} is an unregistered desktop memory kit and is not electrically compatible.`,
      categories: ['motherboard', 'ram'],
    });
  }

  if (cpu && ram && !cpu.memoryTypes.includes(ram.memoryType)) {
    issues.push({
      code: 'cpu-memory-mismatch', severity: 'error', title: 'CPU memory support mismatch',
      detail: `${cpu.name} supports ${cpu.memoryTypes.join(' or ')}, not ${ram.memoryType}.`,
      categories: ['cpu', 'ram'],
    });
  }

  if (motherboard && ram && motherboard.maxMemoryGb > 0 && ram.capacityGb > motherboard.maxMemoryGb) {
    issues.push({
      code: 'memory-capacity', severity: 'error', title: 'Memory capacity exceeds board limit',
      detail: `${ram.capacityGb} GB exceeds the ${motherboard.maxMemoryGb} GB maximum on ${motherboard.name}.`,
      categories: ['motherboard', 'ram'],
    });
  }

  if (motherboard && ram && ram.modules > motherboard.memorySlots) {
    issues.push({
      code: 'memory-slots', severity: 'error', title: 'Not enough DIMM slots',
      detail: `${ram.name} needs ${ram.modules} slots; ${motherboard.name} has ${motherboard.memorySlots}.`,
      categories: ['motherboard', 'ram'],
    });
  }

  if (motherboard && gpu && motherboard.pcieX16Slots < 1) {
    issues.push({
      code: 'no-gpu-slot', severity: 'error', title: 'No compatible expansion slot',
      detail: `${gpu.name} needs a PCIe expansion slot, but none is listed for ${motherboard.name}.`,
      categories: ['motherboard', 'gpu'],
    });
  }

  if (gpu) {
    const fitFacts = [
      gpu.lengthMm ? `${gpu.lengthMm} mm long` : 'length varies by vendor/OEM',
      gpu.slotWidth ? `${gpu.slotWidth}-slot` : undefined,
      gpu.recommendedPsuW ? `${gpu.recommendedPsuW} W system PSU reference` : 'no published system-PSU figure',
    ].filter(Boolean).join(', ');
    issues.push({
      code: 'case-psu-check', severity: 'warning', title: 'Case and PSU still need verification',
      detail: `${gpu.name}: ${fitFacts}. Verify chassis clearance and the exact ${gpu.powerConnectors ?? 'power connector'} implementation.`,
      categories: ['gpu'],
    });
  }

  if (gpu?.memoryPool === 'split') {
    issues.push({
      code: 'split-gpu-memory', severity: 'warning', title: 'VRAM is split across multiple GPUs',
      detail: `${gpu.name} has ${gpu.vramGb} GB physically on the card, but it is ${gpu.gpuCount} independent GPUs with ${gpu.addressableVramGb} GB each. A single model or process cannot use it as one ${gpu.vramGb} GB allocation.`,
      categories: ['gpu'],
    });
  }

  if (gpu?.cooling === 'passive') {
    issues.push({
      code: 'passive-gpu-airflow', severity: 'warning', title: 'Directed server airflow required',
      detail: `${gpu.name} has no onboard fan. Use a qualified server chassis or a deliberately engineered fan duct; normal tower airflow is not sufficient by assumption.`,
      categories: ['gpu'],
    });
  }

  if (gpu?.displayOutputs === false) {
    issues.push({
      code: 'gpu-no-display-output', severity: 'warning', title: 'No direct display output',
      detail: `${gpu.name} is a compute/virtualization card without usable display connectors. Plan headless management, motherboard/BMC video, or a second display adapter.`,
      categories: ['gpu'],
    });
  }

  if (gpu && gpu.price.amountCents === 0) {
    issues.push({
      code: 'quote-price-excluded', severity: 'info', title: 'GPU price is excluded from the total',
      detail: `${gpu.name} is OEM/quote-only or primarily available used. The $0 database value means “no trustworthy public reference price,” not free hardware.`,
      categories: ['gpu'],
    });
  }

  if (cpu && !cpu.integratedGraphics && !gpu) {
    issues.push({
      code: 'display-output', severity: 'warning', title: 'A graphics card is required for display output',
      detail: `${cpu.name} has no integrated graphics. Add a GPU to use the system.`,
      categories: ['cpu', 'gpu'],
    });
  }

  const validProducts = selectedEntries
    .map(([, , product]) => product)
    .filter((product): product is Product => Boolean(product));
  const totalCents = validProducts.reduce((sum, product) => sum + product.price.amountCents, 0);
  const estimatedLoadW = Math.round((cpu?.basePowerW ?? 0) * 1.35 + (gpu?.boardPowerW ?? 0) + 80);
  const recommendedPsuW = gpu?.recommendedPsuW
    ? gpu.recommendedPsuW
    : (cpu || gpu ? Math.max(450, Math.ceil((estimatedLoadW * 1.2) / 100) * 100) : 0);
  const missing = builderCategories.filter((category) => !selection[category]);
  const hasErrors = issues.some((issue) => issue.severity === 'error');

  if (validProducts.length > 1 && !hasErrors) {
    issues.unshift({
      code: 'compatible', severity: 'info', title: 'Selected parts are compatible',
      detail: 'Socket, memory generation, DIMM capacity, and PCIe requirements all pass the current rule set.',
      categories: builderCategories.filter((category) => Boolean(selection[category])),
    });
  }

  return {
    compatible: !hasErrors,
    complete: missing.length === 0 && !hasErrors,
    issues,
    totalCents,
    selectedCount: validProducts.length,
    missing,
    power: { estimatedLoadW, recommendedPsuW },
  };
}

export function compatibleIdsFor(
  target: BuilderCategory,
  selection: BuildSelection,
  products: Product[],
): string[] {
  return products
    .filter((product) => product.category === target)
    .filter((product) => !(product.category === 'cpu' && product.serverOnly))
    .filter((product) => {
      const candidateSelection = { ...selection, [target]: product.id };
      return validateBuild(candidateSelection, products).compatible;
    })
    .map((product) => product.id);
}
