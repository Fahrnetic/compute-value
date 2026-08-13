/**
 * Intel-listed DDR4 Optane PMem processor catalog.
 *
 * Compatibility is intentionally limited to the two released DDR4 PMem
 * generations used by the server catalog: PMem 100 (Cascade Lake) and
 * PMem 200 (Cooper Lake / Ice Lake). CPU rows come from Intel's compatibility
 * lists; SKU specifications come from Intel ARK and the official generation
 * product tables linked below.
 */

export type OptaneSeries = '100' | '200';
export type OptaneArchitecture = 'Cascade Lake' | 'Cooper Lake' | 'Ice Lake';

export interface OptaneCpuSpec {
  model: string;
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number;
  l3CacheMb: number;
  tdpW: number;
  memorySpeedMt: number;
  memoryChannels: number;
  maxMemoryGb: number;
  pcieGeneration: number;
  pcieLanes: number;
  architecture: OptaneArchitecture;
  optaneSeries: OptaneSeries;
  nativeBfloat16: boolean;
  aiInferenceTier: string;
  aiGpuHostTier: string;
  aiRankWithinOptane: number;
  aiRankTotal: number;
  aiAssessment: string;
}

export const optane100CompatibilityUrl = 'https://www.intel.com/content/www/us/en/support/articles/000055996/technologies/memory-and-storage/intel-optane-persistent-memory.html';
export const optane200CompatibilityUrl = 'https://www.intel.com/content/www/us/en/support/articles/000094568/technologies/memory-and-storage/intel-optane-persistent-memory.html';
export const cascadeLakeSpecUrl = 'https://www.intel.com/content/www/us/en/products/docs/processors/xeon/2nd-gen-xeon-scalable-processors-brief.html';
export const thirdGenXeonSpecUrl = 'https://www.intel.com/content/www/us/en/ark/products/series/204098/3rd-gen-intel-xeon-scalable-processors.html';

type RawSpec = Omit<OptaneCpuSpec,
  'threads' | 'memoryChannels' | 'maxMemoryGb' | 'pcieGeneration' | 'pcieLanes' |
  'architecture' | 'optaneSeries' | 'nativeBfloat16' | 'aiInferenceTier' |
  'aiGpuHostTier' | 'aiRankWithinOptane' | 'aiRankTotal' | 'aiAssessment'>;

function parseRows(rows: string): RawSpec[] {
  return rows.trim().split('\n').map((row) => {
    const [model, cores, baseClockGhz, boostClockGhz, l3CacheMb, tdpW, memorySpeedMt] = row.split('|');
    return {
      model,
      cores: Number(cores),
      baseClockGhz: Number(baseClockGhz),
      boostClockGhz: Number(boostClockGhz),
      l3CacheMb: Number(l3CacheMb),
      tdpW: Number(tdpW),
      memorySpeedMt: Number(memorySpeedMt),
    };
  });
}

// model | cores | base GHz | max turbo GHz | cache MB | TDP W | max DDR4 MT/s
const cascadeLakeRows = parseRows(`
Platinum 8280|28|2.7|4.0|38.5|205|2933
Platinum 8280L|28|2.7|4.0|38.5|205|2933
Platinum 8276|28|2.2|4.0|38.5|165|2933
Platinum 8276L|28|2.2|4.0|38.5|165|2933
Platinum 8270|26|2.7|4.0|35.75|205|2933
Platinum 8268|24|2.9|3.9|35.75|205|2933
Platinum 8260|24|2.4|3.9|35.75|165|2933
Platinum 8260Y|24|2.4|3.9|35.75|165|2933
Platinum 8260L|24|2.4|3.9|35.75|165|2933
Platinum 8256|4|3.8|3.9|16.5|105|2933
Platinum 8253|16|2.2|3.0|22|125|2933
Gold 6262V|24|1.9|3.6|33|135|2400
Gold 6258R|28|2.7|4.0|38.5|205|2933
Gold 6256|12|3.6|4.5|33|205|2933
Gold 6254|18|3.1|4.0|24.75|200|2933
Gold 6252|24|2.1|3.7|35.75|150|2933
Gold 6252N|24|2.3|3.6|35.75|150|2933
Gold 6250|8|3.9|4.5|35.75|185|2933
Gold 6250L|8|3.9|4.5|35.75|185|2933
Gold 6248|20|2.5|3.9|27.5|150|2933
Gold 6248R|24|3.0|4.0|35.75|205|2933
Gold 6246|12|3.3|4.2|24.75|165|2933
Gold 6246R|16|3.4|4.1|35.75|205|2933
Gold 6244|8|3.6|4.4|24.75|150|2933
Gold 6242|16|2.8|3.9|22|150|2933
Gold 6242R|20|3.1|4.2|35.75|205|2933
Gold 6240|18|2.6|3.9|24.75|150|2933
Gold 6240L|18|2.6|3.9|24.75|150|2933
Gold 6240R|24|2.4|4.0|35.75|165|2933
Gold 6240Y|18|2.6|3.9|24.75|150|2933
Gold 6238|22|2.1|3.7|30.25|140|2933
Gold 6238L|22|2.1|3.7|30.25|140|2933
Gold 6238R|28|2.2|4.0|38.5|165|2933
Gold 6238T|22|1.9|3.7|30.25|125|2933
Gold 6234|8|3.3|4.0|24.75|130|2933
Gold 6230|20|2.1|3.9|27.5|125|2933
Gold 6230N|20|2.3|3.9|27.5|125|2933
Gold 6230R|26|2.1|4.0|35.75|150|2933
Gold 6230T|20|2.1|3.9|27.5|125|2933
Gold 6226|12|2.7|3.7|19.25|125|2933
Gold 6226R|16|2.9|3.9|22|150|2933
Gold 6222V|20|1.8|3.6|27.5|115|2400
Gold 6212U|24|2.4|3.9|35.75|165|2933
Gold 6210U|20|2.5|3.9|27.5|150|2933
Gold 6209U|20|2.1|3.9|27.5|125|2933
Gold 6208U|16|2.9|3.9|22|150|2933
Gold 5222|4|3.8|3.9|16.5|105|2933
Gold 5220|18|2.2|3.9|24.75|125|2667
Gold 5220R|24|2.2|4.0|35.75|150|2667
Gold 5220S|18|2.7|3.9|24.75|125|2667
Gold 5220T|18|1.9|3.9|24.75|105|2667
Gold 5218|16|2.3|3.9|22|125|2667
Gold 5218B|16|2.3|3.9|22|125|2667
Gold 5218N|16|2.3|3.7|22|105|2667
Gold 5218R|20|2.1|4.0|27.5|125|2667
Gold 5218T|16|2.1|3.8|22|105|2667
Gold 5217|8|3.0|3.7|11|115|2667
Gold 5215|10|2.5|3.4|13.75|85|2667
Gold 5215L|10|2.5|3.4|13.75|85|2667
Silver 4215|8|2.5|3.5|11|85|2400
Silver 4215R|8|3.2|4.0|11|130|2400
`);

const thirdGenRows = parseRows(`
Platinum 8380|40|2.3|3.4|60|270|3200
Platinum 8380HL|28|2.9|4.3|38.5|250|3200
Platinum 8380H|28|2.9|4.3|38.5|250|3200
Platinum 8376HL|28|2.6|4.3|38.5|205|3200
Platinum 8376H|28|2.6|4.3|38.5|205|3200
Platinum 8368|38|2.4|3.4|57|270|3200
Platinum 8368Q|38|2.6|3.7|57|270|3200
Platinum 8362|32|2.8|3.6|48|265|3200
Platinum 8360HL|24|3.0|4.2|33|225|3200
Platinum 8360H|24|3.0|4.2|33|225|3200
Platinum 8360Y|36|2.4|3.5|54|250|3200
Platinum 8358|32|2.6|3.4|48|250|3200
Platinum 8358P|32|2.6|3.4|48|240|3200
Platinum 8356H|8|3.9|4.4|35.75|190|3200
Platinum 8354H|18|3.1|4.3|24.75|205|3200
Platinum 8353H|18|2.5|3.8|24.75|150|3200
Platinum 8352M|32|2.3|3.5|48|185|3200
Platinum 8352S|32|2.2|3.4|48|205|3200
Platinum 8352V|36|2.1|3.5|54|195|3200
Platinum 8352Y|32|2.2|3.4|48|205|3200
Platinum 8351N|36|2.4|3.5|54|225|3200
Gold 6354|18|3.0|3.6|39|205|3200
Gold 6348|28|2.6|3.5|42|235|3200
Gold 6348H|24|2.3|4.2|33|165|2933
Gold 6346|16|3.1|3.6|36|205|3200
Gold 6342|24|2.8|3.5|36|230|3200
Gold 6338|32|2.0|3.2|48|205|3200
Gold 6338N|32|2.2|3.5|48|185|3200
Gold 6338T|24|2.1|3.4|36|165|3200
Gold 6336Y|24|2.4|3.6|36|185|3200
Gold 6334|8|3.6|3.7|18|165|3200
Gold 6330|28|2.0|3.1|42|205|3200
Gold 6330H|24|2.0|3.7|33|150|2933
Gold 6330N|28|2.2|3.4|42|165|3200
Gold 6328HL|16|2.8|4.3|22|165|2933
Gold 6328H|16|2.8|4.3|22|165|2933
Gold 6326|16|2.9|3.5|24|185|3200
Gold 6314U|32|2.3|3.4|48|205|3200
Gold 6312U|24|2.4|3.6|36|185|3200
Gold 5320|26|2.2|3.4|39|185|2933
Gold 5320H|20|2.4|4.2|27.5|150|2667
Gold 5320T|20|2.3|3.5|30|150|2933
Gold 5318H|18|2.5|3.8|24.75|150|2667
Gold 5318N|24|2.1|3.4|36|150|2933
Gold 5318S|24|2.1|3.4|36|165|2933
Gold 5318Y|24|2.1|3.4|36|165|2933
Gold 5317|12|3.0|3.6|18|150|2933
Gold 5315Y|8|3.2|3.6|12|140|2933
Silver 4314|16|2.4|3.4|24|135|2667
`);

function cpuTier(spec: Omit<OptaneCpuSpec, 'aiInferenceTier' | 'aiGpuHostTier' | 'aiRankWithinOptane' | 'aiRankTotal' | 'aiAssessment'>) {
  if (spec.architecture === 'Ice Lake') {
    if (spec.cores >= 32) return 'B+';
    if (spec.cores >= 16) return 'B';
    return 'C+';
  }
  if (spec.architecture === 'Cooper Lake') {
    if (spec.cores >= 24) return 'B';
    if (spec.cores >= 16) return 'B−';
    return 'C+';
  }
  if (spec.memorySpeedMt >= 2933 && spec.cores >= 24) return 'B−';
  if (spec.cores >= 12) return 'C+';
  return 'C';
}

function assessment(spec: Omit<OptaneCpuSpec, 'aiInferenceTier' | 'aiGpuHostTier' | 'aiRankWithinOptane' | 'aiRankTotal' | 'aiAssessment'>) {
  const bandwidth = (spec.memoryChannels * 8 * spec.memorySpeedMt / 1000).toFixed(1);
  if (spec.architecture === 'Ice Lake') {
    return `${bandwidth} GB/s peak from eight DDR4 channels and 64 PCIe 4.0 lanes. Strongest PMem option for single-socket CPU offload; dual-socket NUMA still needs explicit placement.`;
  }
  if (spec.architecture === 'Cooper Lake') {
    return `${bandwidth} GB/s peak from six DDR4 channels plus native AVX-512 BF16. Useful for optimized BF16 kernels, but its 48 PCIe 3.0 lanes are weaker for GPU weight streaming.`;
  }
  return `${bandwidth} GB/s peak from six DDR4 channels with AVX-512 VNNI. Capacity is attractive, but PCIe 3.0 and older cores put it behind PMem 200 for hybrid inference.`;
}

const unranked: Array<Omit<OptaneCpuSpec,
  'aiInferenceTier' | 'aiGpuHostTier' | 'aiRankWithinOptane' | 'aiRankTotal' | 'aiAssessment'>> = [
  ...cascadeLakeRows.map((spec) => ({
    ...spec,
    threads: spec.cores * 2,
    memoryChannels: 6,
    maxMemoryGb: spec.model.endsWith('L') ? 4608 : 1024,
    pcieGeneration: 3,
    pcieLanes: 48,
    architecture: 'Cascade Lake' as const,
    optaneSeries: '100' as const,
    nativeBfloat16: false,
  })),
  ...thirdGenRows.map((spec) => {
    const cooperLake = spec.model.endsWith('H') || spec.model.endsWith('HL');
    return {
      ...spec,
      threads: spec.cores * 2,
      memoryChannels: cooperLake ? 6 : 8,
      maxMemoryGb: cooperLake ? (spec.model.endsWith('HL') ? 4608 : 1152) : 6144,
      pcieGeneration: cooperLake ? 3 : 4,
      pcieLanes: cooperLake ? 48 : 64,
      architecture: cooperLake ? 'Cooper Lake' as const : 'Ice Lake' as const,
      optaneSeries: '200' as const,
      nativeBfloat16: cooperLake,
    };
  }),
];

function rankingScore(spec: typeof unranked[number]) {
  const bandwidth = spec.memoryChannels * 8 * spec.memorySpeedMt / 1000;
  const computeProxy = spec.cores * spec.baseClockGhz;
  const isaBonus = spec.nativeBfloat16 ? 25 : spec.architecture === 'Ice Lake' ? 18 : 14;
  const capacityBonus = Math.min(15, spec.maxMemoryGb / 410);
  return bandwidth * 0.6 + computeProxy * 0.25 + isaBonus + capacityBonus;
}

const rankByModel = new Map(
  [...unranked]
    .sort((a, b) => rankingScore(b) - rankingScore(a) || b.cores - a.cores || a.model.localeCompare(b.model))
    .map((spec, index) => [spec.model, index + 1]),
);

export const optaneCpuSpecs: OptaneCpuSpec[] = unranked.map((spec) => ({
  ...spec,
  aiInferenceTier: cpuTier(spec),
  aiGpuHostTier: spec.pcieGeneration === 4 ? 'B' : 'C',
  aiRankWithinOptane: rankByModel.get(spec.model) ?? unranked.length,
  aiRankTotal: unranked.length,
  aiAssessment: assessment(spec),
}));

export const optane100CpuModels = optaneCpuSpecs
  .filter((spec) => spec.optaneSeries === '100')
  .map((spec) => spec.model);

export const optane200CpuModels = optaneCpuSpecs
  .filter((spec) => spec.optaneSeries === '200')
  .map((spec) => spec.model);

export const optaneCpuIds = new Set(optaneCpuSpecs.map((spec) => `intel-xeon-${spec.model.toLowerCase().replace(/ /g, '-')}`));

// Published single-socket PassMark rows available in the 2026-08-10 CPU Mega List.
// Missing SKUs remain deliberately unscored; no synthetic result is substituted.
export const optaneCpuPassMark = {
  'intel-xeon-platinum-8280': { cpuMark: 31287, singleThread: 2196, samples: 5, sourceId: 3662, sourceName: 'Intel Xeon Platinum 8280 @ 2.70GHz' },
  'intel-xeon-platinum-8280l': { cpuMark: 41609, singleThread: 2316, samples: 2, sourceId: 6729, sourceName: 'Intel Xeon Platinum 8280L @ 2.70GHz' },
  'intel-xeon-platinum-8270': { cpuMark: 33602, singleThread: 2323, samples: 3, sourceId: 5802, sourceName: 'Intel Xeon Platinum 8270 @ 2.70GHz' },
  'intel-xeon-platinum-8268': { cpuMark: 33823, singleThread: 2188, samples: 12, sourceId: 3472, sourceName: 'Intel Xeon Platinum 8268 @ 2.90GHz' },
  'intel-xeon-platinum-8260': { cpuMark: 30162, singleThread: 1962, samples: 11, sourceId: 3561, sourceName: 'Intel Xeon Platinum 8260 @ 2.40GHz' },
  'intel-xeon-platinum-8260l': { cpuMark: 28439, singleThread: 2211, samples: 1, sourceId: 6867, sourceName: 'Intel Xeon Platinum 8260L @ 2.40GHz' },
  'intel-xeon-gold-6262v': { cpuMark: 30116, singleThread: 2145, samples: 1, sourceId: 5076, sourceName: 'Intel Xeon Gold 6262V @ 1.90GHz' },
  'intel-xeon-gold-6258r': { cpuMark: 37774, singleThread: 2192, samples: 3, sourceId: 3860, sourceName: 'Intel Xeon Gold 6258R @ 2.70GHz' },
  'intel-xeon-gold-6256': { cpuMark: 25334, singleThread: 2558, samples: 2, sourceId: 3686, sourceName: 'Intel Xeon Gold 6256 @ 3.60GHz' },
  'intel-xeon-gold-6254': { cpuMark: 31738, singleThread: 2327, samples: 25, sourceId: 3482, sourceName: 'Intel Xeon Gold 6254 @ 3.10GHz' },
  'intel-xeon-gold-6252': { cpuMark: 26797, singleThread: 1966, samples: 4, sourceId: 3532, sourceName: 'Intel Xeon Gold 6252 @ 2.10GHz' },
  'intel-xeon-gold-6250': { cpuMark: 20552, singleThread: 2648, samples: 3, sourceId: 4586, sourceName: 'Intel Xeon Gold 6250 @ 3.90GHz' },
  'intel-xeon-gold-6248': { cpuMark: 28897, singleThread: 2224, samples: 26, sourceId: 3517, sourceName: 'Intel Xeon Gold 6248 @ 2.50GHz' },
  'intel-xeon-gold-6248r': { cpuMark: 35888, singleThread: 2284, samples: 9, sourceId: 3732, sourceName: 'Intel Xeon Gold 6248R @ 3.00GHz' },
  'intel-xeon-gold-6246': { cpuMark: 22571, singleThread: 2487, samples: 5, sourceId: 3521, sourceName: 'Intel Xeon Gold 6246 @ 3.30GHz' },
  'intel-xeon-gold-6246r': { cpuMark: 30468, singleThread: 2341, samples: 6, sourceId: 3854, sourceName: 'Intel Xeon Gold 6246R @ 3.40GHz' },
  'intel-xeon-gold-6244': { cpuMark: 18853, singleThread: 2545, samples: 21, sourceId: 3504, sourceName: 'Intel Xeon Gold 6244 @ 3.60GHz' },
  'intel-xeon-gold-6242': { cpuMark: 24099, singleThread: 2118, samples: 6, sourceId: 3516, sourceName: 'Intel Xeon Gold 6242 @ 2.80GHz' },
  'intel-xeon-gold-6242r': { cpuMark: 35076, singleThread: 2355, samples: 21, sourceId: 3861, sourceName: 'Intel Xeon Gold 6242R @ 3.10GHz' },
  'intel-xeon-gold-6240': { cpuMark: 26826, singleThread: 2042, samples: 17, sourceId: 3613, sourceName: 'Intel Xeon Gold 6240 @ 2.60GHz' },
  'intel-xeon-gold-6240r': { cpuMark: 31733, singleThread: 2177, samples: 4, sourceId: 3739, sourceName: 'Intel Xeon Gold 6240R @ 2.40GHz' },
  'intel-xeon-gold-6238': { cpuMark: 29057, singleThread: 1978, samples: 6, sourceId: 3631, sourceName: 'Intel Xeon Gold 6238 @ 2.10GHz' },
  'intel-xeon-gold-6238r': { cpuMark: 34751, singleThread: 2168, samples: 3, sourceId: 4132, sourceName: 'Intel Xeon Gold 6238R @ 2.20GHz' },
  'intel-xeon-gold-6234': { cpuMark: 17926, singleThread: 2307, samples: 8, sourceId: 3518, sourceName: 'Intel Xeon Gold 6234 @ 3.30GHz' },
  'intel-xeon-gold-6230': { cpuMark: 26285, singleThread: 2175, samples: 18, sourceId: 3468, sourceName: 'Intel Xeon Gold 6230 @ 2.10GHz' },
  'intel-xeon-gold-6230r': { cpuMark: 32591, singleThread: 2169, samples: 14, sourceId: 4070, sourceName: 'Intel Xeon Gold 6230R @ 2.10GHz' },
  'intel-xeon-gold-6230t': { cpuMark: 27053, singleThread: 2320, samples: 2, sourceId: 7257, sourceName: 'Intel Xeon Gold 6230T @ 2.10GHz' },
  'intel-xeon-gold-6226': { cpuMark: 19853, singleThread: 1944, samples: 6, sourceId: 3682, sourceName: 'Intel Xeon Gold 6226 @ 2.70GHz' },
  'intel-xeon-gold-6226r': { cpuMark: 26386, singleThread: 2256, samples: 24, sourceId: 3728, sourceName: 'Intel Xeon Gold 6226R @ 2.90GHz' },
  'intel-xeon-gold-6222v': { cpuMark: 24115, singleThread: 1838, samples: 5, sourceId: 6090, sourceName: 'Intel Xeon Gold 6222V @ 1.80GHz' },
  'intel-xeon-gold-6212u': { cpuMark: 27470, singleThread: 2013, samples: 2, sourceId: 3608, sourceName: 'Intel Xeon Gold 6212U @ 2.40GHz' },
  'intel-xeon-gold-6210u': { cpuMark: 28861, singleThread: 1951, samples: 5, sourceId: 3540, sourceName: 'Intel Xeon Gold 6210U @ 2.50GHz' },
  'intel-xeon-gold-6208u': { cpuMark: 24480, singleThread: 2219, samples: 5, sourceId: 3742, sourceName: 'Intel Xeon Gold 6208U @ 2.90GHz' },
  'intel-xeon-gold-5222': { cpuMark: 8846, singleThread: 2139, samples: 18, sourceId: 3475, sourceName: 'Intel Xeon Gold 5222 @ 3.80GHz' },
  'intel-xeon-gold-5220': { cpuMark: 24480, singleThread: 2255, samples: 7, sourceId: 3534, sourceName: 'Intel Xeon Gold 5220 @ 2.20GHz' },
  'intel-xeon-gold-5220r': { cpuMark: 30372, singleThread: 2137, samples: 11, sourceId: 4217, sourceName: 'Intel Xeon Gold 5220R @ 2.20GHz' },
  'intel-xeon-gold-5218': { cpuMark: 21669, singleThread: 2102, samples: 22, sourceId: 3536, sourceName: 'Intel Xeon Gold 5218 @ 2.30GHz' },
  'intel-xeon-gold-5218r': { cpuMark: 25076, singleThread: 2191, samples: 12, sourceId: 4260, sourceName: 'Intel Xeon Gold 5218R @ 2.10GHz' },
  'intel-xeon-gold-5218t': { cpuMark: 21433, singleThread: 2282, samples: 1, sourceId: 3439, sourceName: 'Intel Xeon Gold 5218T @ 2.10GHz' },
  'intel-xeon-gold-5217': { cpuMark: 14945, singleThread: 2104, samples: 3, sourceId: 3585, sourceName: 'Intel Xeon Gold 5217 @ 3.00GHz' },
  'intel-xeon-gold-5215': { cpuMark: 16304, singleThread: 2101, samples: 1, sourceId: 6484, sourceName: 'Intel Xeon Gold 5215 @ 2.20GHz' },
  'intel-xeon-silver-4215': { cpuMark: 13297, singleThread: 1863, samples: 13, sourceId: 3476, sourceName: 'Intel Xeon Silver 4215 @ 2.50GHz' },
  'intel-xeon-silver-4215r': { cpuMark: 14939, singleThread: 2171, samples: 21, sourceId: 3864, sourceName: 'Intel Xeon Silver 4215R @ 3.20GHz' },
  'intel-xeon-platinum-8380': { cpuMark: 62318, singleThread: 2385, samples: 1, sourceId: 4483, sourceName: 'Intel Xeon Platinum 8380 @ 2.30GHz' },
  'intel-xeon-platinum-8368q': { cpuMark: 46681, singleThread: 2568, samples: 1, sourceId: 5982, sourceName: 'Intel Xeon Platinum 8368Q @ 2.60GHz' },
  'intel-xeon-platinum-8362': { cpuMark: 56787, singleThread: 2446, samples: 1, sourceId: 5472, sourceName: 'Intel Xeon Platinum 8362 @ 2.80GHz' },
  'intel-xeon-platinum-8360y': { cpuMark: 54078, singleThread: 2489, samples: 1, sourceId: 5698, sourceName: 'Intel Xeon Platinum 8360Y @ 2.40GHz' },
  'intel-xeon-platinum-8358': { cpuMark: 54416, singleThread: 2382, samples: 2, sourceId: 4493, sourceName: 'Intel Xeon Platinum 8358 @ 2.60GHz' },
  'intel-xeon-platinum-8351n': { cpuMark: 49763, singleThread: 2214, samples: 5, sourceId: 4995, sourceName: 'Intel Xeon Platinum 8351N @ 2.40GHz' },
  'intel-xeon-gold-6354': { cpuMark: 38332, singleThread: 2356, samples: 9, sourceId: 4627, sourceName: 'Intel Xeon Gold 6354 @ 3.00GHz' },
  'intel-xeon-gold-6348': { cpuMark: 51843, singleThread: 2465, samples: 3, sourceId: 4494, sourceName: 'Intel Xeon Gold 6348 @ 2.60GHz' },
  'intel-xeon-gold-6346': { cpuMark: 37212, singleThread: 2506, samples: 62, sourceId: 4657, sourceName: 'Intel Xeon Gold 6346 @ 3.10GHz' },
  'intel-xeon-gold-6342': { cpuMark: 47076, singleThread: 2396, samples: 5, sourceId: 4485, sourceName: 'Intel Xeon Gold 6342 @ 2.80GHz' },
  'intel-xeon-gold-6338': { cpuMark: 41307, singleThread: 2107, samples: 8, sourceId: 4592, sourceName: 'Intel Xeon Gold 6338 @ 2.00GHz' },
  'intel-xeon-gold-6338n': { cpuMark: 42086, singleThread: 2066, samples: 15, sourceId: 4656, sourceName: 'Intel Xeon Gold 6338N @ 2.20GHz' },
  'intel-xeon-gold-6338t': { cpuMark: 35801, singleThread: 2348, samples: 1, sourceId: 6780, sourceName: 'Intel Xeon Gold 6338T @ 2.10GHz' },
  'intel-xeon-gold-6336y': { cpuMark: 45517, singleThread: 2522, samples: 1, sourceId: 4484, sourceName: 'Intel Xeon Gold 6336Y @ 2.40GHz' },
  'intel-xeon-gold-6334': { cpuMark: 20512, singleThread: 2500, samples: 5, sourceId: 4488, sourceName: 'Intel Xeon Gold 6334 @ 3.60GHz' },
  'intel-xeon-gold-6330': { cpuMark: 42072, singleThread: 1926, samples: 2, sourceId: 4513, sourceName: 'Intel Xeon Gold 6330 @ 2.00GHz' },
  'intel-xeon-gold-6330n': { cpuMark: 36360, singleThread: 2322, samples: 1, sourceId: 4865, sourceName: 'Intel Xeon Gold 6330N @ 2.20GHz' },
  'intel-xeon-gold-6326': { cpuMark: 32829, singleThread: 2259, samples: 17, sourceId: 4651, sourceName: 'Intel Xeon Gold 6326 @ 2.90GHz' },
  'intel-xeon-gold-6314u': { cpuMark: 48916, singleThread: 2287, samples: 5, sourceId: 4950, sourceName: 'Intel Xeon Gold 6314U @ 2.30GHz' },
  'intel-xeon-gold-6312u': { cpuMark: 41858, singleThread: 2293, samples: 12, sourceId: 4606, sourceName: 'Intel Xeon Gold 6312U @ 2.40GHz' },
  'intel-xeon-gold-5320': { cpuMark: 37558, singleThread: 1826, samples: 1, sourceId: 4594, sourceName: 'Intel Xeon Gold 5320 @ 2.20GHz' },
  'intel-xeon-gold-5320h': { cpuMark: 31718, singleThread: 2428, samples: 2, sourceId: 6195, sourceName: 'Intel Xeon Gold 5320H @ 2.40GHz' },
  'intel-xeon-gold-5320t': { cpuMark: 33828, singleThread: 1967, samples: 3, sourceId: 6947, sourceName: 'Intel Xeon Gold 5320T @ 2.30GHz' },
  'intel-xeon-gold-5318h': { cpuMark: 29301, singleThread: 2225, samples: 2, sourceId: 6196, sourceName: 'Intel Xeon Gold 5318H @ 2.50GHz' },
  'intel-xeon-gold-5318n': { cpuMark: 34301, singleThread: 2292, samples: 3, sourceId: 6386, sourceName: 'Intel Xeon Gold 5318N @ 2.10GHz' },
  'intel-xeon-gold-5318y': { cpuMark: 33139, singleThread: 2022, samples: 5, sourceId: 4703, sourceName: 'Intel Xeon Gold 5318Y @ 2.10GHz' },
  'intel-xeon-gold-5317': { cpuMark: 27293, singleThread: 2327, samples: 22, sourceId: 4326, sourceName: 'Intel Xeon Gold 5317 @ 3.00GHz' },
  'intel-xeon-gold-5315y': { cpuMark: 20032, singleThread: 2442, samples: 6, sourceId: 4492, sourceName: 'Intel Xeon Gold 5315Y @ 3.20GHz' },
  'intel-xeon-silver-4314': { cpuMark: 28589, singleThread: 2158, samples: 40, sourceId: 4489, sourceName: 'Intel Xeon Silver 4314 @ 2.40GHz' },
} as const;
