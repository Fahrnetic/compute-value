import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allProducts } from './catalog.js';
import { benchmarkSeeds, type BenchmarkSeed } from './benchmarks.js';
import { ebaySellerRule, ebayUsedMarketSeeds, type EbayUsedMarketSeed } from './ebay-market.js';
import { gpuParallelProcessors, llmBenchmarkSeeds, userExcludedGpuIds, type LlmBenchmarkSeed } from './llm-benchmarks.js';
import type { BenchmarkResult, Category, Cpu, Gpu, LlmBenchmarkResult, MiniPc, Motherboard, Product, Ram, ServerSystem, UsedMarketSnapshot } from '../src/types.js';

const serverDir = dirname(fileURLToPath(import.meta.url));
const defaultDbPath = resolve(serverDir, '../data/pc-builder.sqlite');
const databasePath = process.env.PC_BUILDER_DB_PATH ?? defaultDbPath;
mkdirSync(dirname(databasePath), { recursive: true });

export const db = new DatabaseSync(databasePath);
db.exec('PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK(category IN ('cpu','motherboard','gpu','ram','mini-pc')),
    manufacturer TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    tags_json TEXT NOT NULL DEFAULT '[]',
    spec_source_url TEXT,
    compatibility_source_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS price_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    price_type TEXT NOT NULL CHECK(price_type IN ('MSRP','store','reference')),
    retailer TEXT NOT NULL,
    source_url TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    UNIQUE(product_id, retailer, observed_at)
  );

  CREATE TABLE IF NOT EXISTS benchmark_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    benchmark_key TEXT NOT NULL,
    benchmark_name TEXT NOT NULL,
    benchmark_version TEXT NOT NULL,
    workload TEXT NOT NULL CHECK(workload IN ('cpu-overall','cpu-single-thread','gpu-3d','gpu-compute')),
    score REAL NOT NULL CHECK(score >= 0),
    unit TEXT NOT NULL DEFAULT 'points',
    higher_is_better INTEGER NOT NULL DEFAULT 1,
    result_type TEXT NOT NULL CHECK(result_type IN ('aggregate','limited-sample')),
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    sample_count INTEGER,
    source_device_name TEXT NOT NULL,
    notes TEXT NOT NULL,
    UNIQUE(product_id, benchmark_key, benchmark_version)
  );

  CREATE TABLE IF NOT EXISTS marketplace_snapshots (
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    marketplace TEXT NOT NULL CHECK(marketplace IN ('eBay')),
    item_condition TEXT NOT NULL CHECK(item_condition IN ('used')),
    observed_at TEXT NOT NULL,
    search_url TEXT NOT NULL,
    seller_rule TEXT NOT NULL,
    PRIMARY KEY(product_id, marketplace, item_condition, observed_at)
  );

  CREATE TABLE IF NOT EXISTS marketplace_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    marketplace TEXT NOT NULL CHECK(marketplace IN ('eBay')),
    item_condition TEXT NOT NULL CHECK(item_condition IN ('used')),
    observed_at TEXT NOT NULL,
    title TEXT NOT NULL,
    amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0),
    seller_name TEXT NOT NULL,
    seller_feedback_percent REAL NOT NULL,
    seller_feedback_count INTEGER NOT NULL,
    source_url TEXT NOT NULL,
    UNIQUE(product_id, source_url, observed_at)
  );

  CREATE TABLE IF NOT EXISTS llm_benchmark_results (
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    profile_key TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_file TEXT NOT NULL,
    quantization TEXT NOT NULL,
    engine TEXT NOT NULL,
    engine_commit TEXT,
    backend TEXT NOT NULL CHECK(backend IN ('CUDA','ROCm','Vulkan')),
    gpu_count INTEGER NOT NULL CHECK(gpu_count = 1),
    gpu_layers INTEGER NOT NULL,
    flash_attention INTEGER NOT NULL CHECK(flash_attention IN (0,1)),
    prompt_tokens INTEGER NOT NULL,
    generated_tokens INTEGER NOT NULL,
    prompt_tokens_per_second REAL NOT NULL CHECK(prompt_tokens_per_second > 0),
    prompt_stddev REAL NOT NULL CHECK(prompt_stddev >= 0),
    generated_tokens_per_second REAL NOT NULL CHECK(generated_tokens_per_second > 0),
    generated_stddev REAL NOT NULL CHECK(generated_stddev >= 0),
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_device_name TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    notes TEXT NOT NULL,
    PRIMARY KEY(product_id, profile_key)
  );

  CREATE TABLE IF NOT EXISTS cpu_specs (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    socket TEXT NOT NULL, cores INTEGER NOT NULL, threads INTEGER NOT NULL,
    boost_clock_ghz REAL NOT NULL, base_power_w INTEGER NOT NULL,
    memory_types_json TEXT NOT NULL, integrated_graphics INTEGER NOT NULL,
    extra_json TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS motherboard_specs (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    socket TEXT NOT NULL, chipset TEXT NOT NULL, form_factor TEXT NOT NULL,
    memory_type TEXT NOT NULL, memory_slots INTEGER NOT NULL, max_memory_gb INTEGER NOT NULL,
    pcie_x16_slots INTEGER NOT NULL, m2_slots INTEGER NOT NULL, wifi INTEGER NOT NULL,
    extra_json TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS gpu_specs (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    vram_gb INTEGER NOT NULL, interface TEXT NOT NULL, length_mm INTEGER NOT NULL,
    board_power_w INTEGER NOT NULL, recommended_psu_w INTEGER NOT NULL,
    extra_json TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS ram_specs (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL, capacity_gb INTEGER NOT NULL, modules INTEGER NOT NULL,
    speed_mt INTEGER NOT NULL, cas_latency INTEGER NOT NULL, profile TEXT NOT NULL,
    registered INTEGER NOT NULL DEFAULT 0, ecc INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS mini_pc_specs (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    processor TEXT NOT NULL, graphics TEXT NOT NULL, memory_gb INTEGER NOT NULL,
    storage_gb INTEGER NOT NULL, memory_type TEXT NOT NULL, npu_tops INTEGER NOT NULL,
    total_ai_tops INTEGER, memory_upgradeable INTEGER NOT NULL,
    extra_json TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS server_systems (
    id TEXT PRIMARY KEY,
    manufacturer TEXT NOT NULL,
    name TEXT NOT NULL,
    family TEXT NOT NULL,
    description TEXT NOT NULL,
    rack_units INTEGER NOT NULL,
    cpu_sockets INTEGER NOT NULL,
    cpu_socket TEXT NOT NULL,
    cpu_generation TEXT NOT NULL,
    supported_cpu_models_json TEXT NOT NULL,
    dram_slots INTEGER NOT NULL,
    optane_series TEXT NOT NULL CHECK(optane_series IN ('100','200')),
    optane_slots INTEGER NOT NULL,
    max_optane_gb INTEGER NOT NULL,
    pcie_generation INTEGER NOT NULL,
    pcie_slots INTEGER NOT NULL,
    power_supply_options_json TEXT NOT NULL,
    max_optane_power_w INTEGER NOT NULL,
    cpu_and_optane_budget_w INTEGER NOT NULL,
    power_source_url TEXT NOT NULL,
    board_form_factor TEXT NOT NULL,
    board_dimensions_mm TEXT NOT NULL,
    system_dimensions_mm TEXT NOT NULL,
    sluice_v2_fit TEXT NOT NULL,
    linux_support INTEGER NOT NULL,
    windows_support INTEGER NOT NULL,
    tags_json TEXT NOT NULL,
    price_json TEXT NOT NULL,
    spec_source_url TEXT,
    compatibility_source_url TEXT,
    extra_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_cpu_socket ON cpu_specs(socket);
  CREATE INDEX IF NOT EXISTS idx_board_socket_memory ON motherboard_specs(socket, memory_type);
  CREATE INDEX IF NOT EXISTS idx_ram_memory_type ON ram_specs(memory_type);
  CREATE INDEX IF NOT EXISTS idx_prices_product_date ON price_references(product_id, observed_at DESC);
  CREATE INDEX IF NOT EXISTS idx_benchmarks_product ON benchmark_results(product_id, workload);
  CREATE INDEX IF NOT EXISTS idx_benchmarks_key_score ON benchmark_results(benchmark_key, score DESC);
  CREATE INDEX IF NOT EXISTS idx_marketplace_product_date ON marketplace_snapshots(product_id, observed_at DESC);
  CREATE INDEX IF NOT EXISTS idx_marketplace_listing_product ON marketplace_listings(product_id, observed_at DESC, amount_cents);
  CREATE INDEX IF NOT EXISTS idx_llm_profile_generation ON llm_benchmark_results(profile_key, generated_tokens_per_second DESC);
  CREATE INDEX IF NOT EXISTS idx_server_optane_capacity ON server_systems(optane_series, max_optane_gb);
`);

const motherboardColumns = db.prepare("PRAGMA table_info('motherboard_specs')").all() as Array<{ name: string }>;
if (!motherboardColumns.some((column) => column.name === 'extra_json')) {
  db.exec("ALTER TABLE motherboard_specs ADD COLUMN extra_json TEXT NOT NULL DEFAULT '{}'");
}

const productColumns = db.prepare("PRAGMA table_info('products')").all() as Array<{ name: string }>;
if (!productColumns.some((column) => column.name === 'spec_source_url')) {
  db.exec('ALTER TABLE products ADD COLUMN spec_source_url TEXT');
}
if (!productColumns.some((column) => column.name === 'compatibility_source_url')) {
  db.exec('ALTER TABLE products ADD COLUMN compatibility_source_url TEXT');
}

const cpuColumns = db.prepare("PRAGMA table_info('cpu_specs')").all() as Array<{ name: string }>;
if (!cpuColumns.some((column) => column.name === 'extra_json')) {
  db.exec("ALTER TABLE cpu_specs ADD COLUMN extra_json TEXT NOT NULL DEFAULT '{}'");
}

const gpuColumns = db.prepare("PRAGMA table_info('gpu_specs')").all() as Array<{ name: string }>;
if (!gpuColumns.some((column) => column.name === 'extra_json')) {
  db.exec("ALTER TABLE gpu_specs ADD COLUMN extra_json TEXT NOT NULL DEFAULT '{}'");
}

const ramColumns = db.prepare("PRAGMA table_info('ram_specs')").all() as Array<{ name: string }>;
if (!ramColumns.some((column) => column.name === 'registered')) {
  db.exec('ALTER TABLE ram_specs ADD COLUMN registered INTEGER NOT NULL DEFAULT 0');
}
if (!ramColumns.some((column) => column.name === 'ecc')) {
  db.exec('ALTER TABLE ram_specs ADD COLUMN ecc INTEGER NOT NULL DEFAULT 0');
}

const miniPcColumns = db.prepare("PRAGMA table_info('mini_pc_specs')").all() as Array<{ name: string }>;
if (!miniPcColumns.some((column) => column.name === 'extra_json')) {
  db.exec("ALTER TABLE mini_pc_specs ADD COLUMN extra_json TEXT NOT NULL DEFAULT '{}'");
}

const serverColumns = db.prepare("PRAGMA table_info('server_systems')").all() as Array<{ name: string }>;
if (!serverColumns.some((column) => column.name === 'power_supply_options_json')) {
  db.exec("ALTER TABLE server_systems ADD COLUMN power_supply_options_json TEXT NOT NULL DEFAULT '[]'");
}
if (!serverColumns.some((column) => column.name === 'max_optane_power_w')) {
  db.exec('ALTER TABLE server_systems ADD COLUMN max_optane_power_w INTEGER NOT NULL DEFAULT 0');
}
if (!serverColumns.some((column) => column.name === 'cpu_and_optane_budget_w')) {
  db.exec('ALTER TABLE server_systems ADD COLUMN cpu_and_optane_budget_w INTEGER NOT NULL DEFAULT 0');
}
if (!serverColumns.some((column) => column.name === 'power_source_url')) {
  db.exec("ALTER TABLE server_systems ADD COLUMN power_source_url TEXT NOT NULL DEFAULT ''");
}

function seedProduct(product: Product) {
  if (product.category === 'server-system') {
    db.prepare(`INSERT INTO server_systems
      (id, manufacturer, name, family, description, rack_units, cpu_sockets, cpu_socket,
       cpu_generation, supported_cpu_models_json, dram_slots, optane_series, optane_slots,
       max_optane_gb, pcie_generation, pcie_slots, power_supply_options_json,
       max_optane_power_w, cpu_and_optane_budget_w, power_source_url, board_form_factor, board_dimensions_mm,
       system_dimensions_mm, sluice_v2_fit, linux_support, windows_support, tags_json,
       price_json, spec_source_url, compatibility_source_url, extra_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET manufacturer = excluded.manufacturer, name = excluded.name,
        family = excluded.family, description = excluded.description, rack_units = excluded.rack_units,
        cpu_sockets = excluded.cpu_sockets, cpu_socket = excluded.cpu_socket,
        cpu_generation = excluded.cpu_generation, supported_cpu_models_json = excluded.supported_cpu_models_json,
        dram_slots = excluded.dram_slots, optane_series = excluded.optane_series,
        optane_slots = excluded.optane_slots, max_optane_gb = excluded.max_optane_gb,
        pcie_generation = excluded.pcie_generation, pcie_slots = excluded.pcie_slots,
        power_supply_options_json = excluded.power_supply_options_json,
        max_optane_power_w = excluded.max_optane_power_w,
        cpu_and_optane_budget_w = excluded.cpu_and_optane_budget_w,
        power_source_url = excluded.power_source_url,
        board_form_factor = excluded.board_form_factor, board_dimensions_mm = excluded.board_dimensions_mm,
        system_dimensions_mm = excluded.system_dimensions_mm, sluice_v2_fit = excluded.sluice_v2_fit,
        linux_support = excluded.linux_support, windows_support = excluded.windows_support,
        tags_json = excluded.tags_json, price_json = excluded.price_json,
        spec_source_url = excluded.spec_source_url, compatibility_source_url = excluded.compatibility_source_url,
        extra_json = excluded.extra_json, updated_at = CURRENT_TIMESTAMP`)
      .run(product.id, product.manufacturer, product.name, product.family, product.description,
        product.rackUnits, product.cpuSockets, product.cpuSocket, product.cpuGeneration,
        JSON.stringify(product.supportedCpuModels), product.dramSlots, product.optaneSeries,
        product.optaneSlots, product.maxOptaneGb, product.pcieGeneration, product.pcieSlots,
        JSON.stringify(product.powerSupplyOptionsW), product.maxOptanePowerW,
        product.cpuAndOptaneBudgetW, product.powerSourceUrl,
        product.boardFormFactor, product.boardDimensionsMm, product.systemDimensionsMm,
        product.sluiceV2Fit, Number(product.linuxSupport), Number(product.windowsSupport),
        JSON.stringify(product.tags), JSON.stringify(product.price), product.specSourceUrl ?? null,
        product.compatibilitySourceUrl ?? null, JSON.stringify({
          cpuQualificationNote: product.cpuQualificationNote,
          memoryChannelsPerCpu: product.memoryChannelsPerCpu,
          optaneModuleCapacitiesGb: product.optaneModuleCapacitiesGb,
          optaneModes: product.optaneModes,
          pcieSlotDetails: product.pcieSlotDetails,
          powerSupplyCount: product.powerSupplyCount,
          powerRedundancy: product.powerRedundancy,
          maxCpuTdpW: product.maxCpuTdpW,
          maxOptaneModulePowerW: product.maxOptaneModulePowerW,
          powerDrawStatus: product.powerDrawStatus,
          powerPlanningNote: product.powerPlanningNote,
          sluiceV2Reason: product.sluiceV2Reason,
          hypervisorSupport: product.hypervisorSupport,
          supportedOs: product.supportedOs,
          osQualificationNote: product.osQualificationNote,
          availability: product.availability,
          sourceUrls: product.sourceUrls,
        }));
    return;
  }

  db.prepare(`INSERT INTO products
    (id, category, manufacturer, name, description, tags_json, spec_source_url, compatibility_source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET category = excluded.category, manufacturer = excluded.manufacturer,
      name = excluded.name, description = excluded.description, tags_json = excluded.tags_json,
      spec_source_url = excluded.spec_source_url, compatibility_source_url = excluded.compatibility_source_url,
      updated_at = CURRENT_TIMESTAMP`)
    .run(product.id, product.category, product.manufacturer, product.name, product.description,
      JSON.stringify(product.tags), product.specSourceUrl ?? null, product.compatibilitySourceUrl ?? null);

  db.prepare(`INSERT INTO price_references
    (product_id, amount_cents, currency, price_type, retailer, source_url, observed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(product_id, retailer, observed_at) DO UPDATE SET
      amount_cents = excluded.amount_cents, currency = excluded.currency,
      price_type = excluded.price_type, source_url = excluded.source_url`)
    .run(product.id, product.price.amountCents, product.price.currency, product.price.priceType,
      product.price.retailer, product.price.sourceUrl, product.price.observedAt);

  switch (product.category) {
    case 'cpu':
      db.prepare(`INSERT INTO cpu_specs
        (product_id, socket, cores, threads, boost_clock_ghz, base_power_w, memory_types_json, integrated_graphics, extra_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET socket = excluded.socket, cores = excluded.cores,
          threads = excluded.threads, boost_clock_ghz = excluded.boost_clock_ghz,
          base_power_w = excluded.base_power_w, memory_types_json = excluded.memory_types_json,
          integrated_graphics = excluded.integrated_graphics, extra_json = excluded.extra_json`)
        .run(product.id, product.socket, product.cores, product.threads, product.boostClockGhz,
          product.basePowerW, JSON.stringify(product.memoryTypes), Number(product.integratedGraphics),
          JSON.stringify({ architecture: product.architecture, series: product.series,
            baseClockGhz: product.baseClockGhz, l3CacheMb: product.l3CacheMb,
            memoryChannels: product.memoryChannels, memoryChannelWidthBits: product.memoryChannelWidthBits,
            memoryBusWidthBits: product.memoryBusWidthBits, maxMemoryGb: product.maxMemoryGb,
            memorySpeedMt: product.memorySpeedMt,
            theoreticalMemoryBandwidthGbS: product.theoreticalMemoryBandwidthGbS,
            memoryModuleTypes: product.memoryModuleTypes, eccSupport: product.eccSupport,
            pcieGeneration: product.pcieGeneration, pcieLanes: product.pcieLanes,
            pcieTotalLanes: product.pcieTotalLanes, pcieUsableLanes: product.pcieUsableLanes,
            pcieLaneRateGtS: product.pcieLaneRateGtS,
            pciePayloadGbSPerLane: product.pciePayloadGbSPerLane,
            theoreticalPcieBandwidthGbS: product.theoreticalPcieBandwidthGbS,
            vendorLockRisk: product.vendorLockRisk, oemOnly: product.oemOnly,
            serverOnly: product.serverOnly, optanePmemSeries: product.optanePmemSeries,
            optaneCompatibilityStatus: product.optaneCompatibilityStatus,
            nativeBfloat16: product.nativeBfloat16, vectorExtensions: product.vectorExtensions,
            aiInferenceTier: product.aiInferenceTier, aiGpuHostTier: product.aiGpuHostTier,
            aiRankWithinOptane: product.aiRankWithinOptane, aiRankTotal: product.aiRankTotal,
            aiAssessment: product.aiAssessment, launchDate: product.launchDate }));
      break;
    case 'motherboard':
      db.prepare(`INSERT INTO motherboard_specs
        (product_id, socket, chipset, form_factor, memory_type, memory_slots, max_memory_gb, pcie_x16_slots, m2_slots, wifi, extra_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET
          socket = excluded.socket, chipset = excluded.chipset, form_factor = excluded.form_factor,
          memory_type = excluded.memory_type, memory_slots = excluded.memory_slots,
          max_memory_gb = excluded.max_memory_gb, pcie_x16_slots = excluded.pcie_x16_slots,
          m2_slots = excluded.m2_slots, wifi = excluded.wifi, extra_json = excluded.extra_json`)
        .run(product.id, product.socket, product.chipset, product.formFactor, product.memoryType,
          product.memorySlots, product.maxMemoryGb, product.pcieX16Slots, product.m2Slots, Number(product.wifi),
          JSON.stringify({ revision: product.revision, memoryChannels: product.memoryChannels,
            eccSupport: product.eccSupport, registeredMemorySupport: product.registeredMemorySupport,
            memoryModuleTypes: product.memoryModuleTypes, pcieGeneration: product.pcieGeneration,
            platformPcieLanes: product.platformPcieLanes,
            cpuDirectExpansionLanes: product.cpuDirectExpansionLanes,
            cpuDirectM2Lanes: product.cpuDirectM2Lanes, chipsetUplinkLanes: product.chipsetUplinkLanes,
            dimmsPerChannel: product.dimmsPerChannel, maxDimmCapacityGb: product.maxDimmCapacityGb,
            u2Ports: product.u2Ports, registeredMemoryRequired: product.registeredMemoryRequired,
            networkPorts: product.networkPorts, slimSas4iPorts: product.slimSas4iPorts, sataPorts: product.sataPorts,
            pcieSlotConfiguration: product.pcieSlotConfiguration, supportedCpuSeries: product.supportedCpuSeries,
            boardDimensionsMm: product.boardDimensionsMm, bmc: product.bmc, maxCpuTdpW: product.maxCpuTdpW,
            wifiM2Slots: product.wifiM2Slots, supportedCpuIds: product.supportedCpuIds,
            requiredBiosByCpuId: product.requiredBiosByCpuId }));
      break;
    case 'gpu':
      db.prepare(`INSERT INTO gpu_specs
        (product_id, vram_gb, interface, length_mm, board_power_w, recommended_psu_w, extra_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET vram_gb = excluded.vram_gb,
          interface = excluded.interface, length_mm = excluded.length_mm,
          board_power_w = excluded.board_power_w, recommended_psu_w = excluded.recommended_psu_w,
          extra_json = excluded.extra_json`)
        .run(product.id, product.vramGb, product.interface, product.lengthMm, product.boardPowerW,
          product.recommendedPsuW, JSON.stringify({ architecture: product.architecture,
            generation: product.generation, segment: product.segment, releaseYear: product.releaseYear,
            vramType: product.vramType, memoryBusBits: product.memoryBusBits,
            memoryBandwidthGbS: product.memoryBandwidthGbS, addressableVramGb: product.addressableVramGb,
            gpuCount: product.gpuCount, memoryPool: product.memoryPool,
            pcieGeneration: product.pcieGeneration, pcieLanes: product.pcieLanes,
            slotWidth: product.slotWidth, height: product.height, cooling: product.cooling,
            displayOutputs: product.displayOutputs, powerConnectors: product.powerConnectors,
            availability: product.availability, softwarePlatform: product.softwarePlatform,
            fp4AiTops: product.fp4AiTops, tensorCoreGeneration: product.tensorCoreGeneration,
            cudaComputeCapability: product.cudaComputeCapability,
            parallelProcessors: gpuParallelProcessors[product.id],
            notes: product.notes }));
      break;
    case 'ram':
      db.prepare(`INSERT INTO ram_specs
        (product_id, memory_type, capacity_gb, modules, speed_mt, cas_latency, profile, registered, ecc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET memory_type = excluded.memory_type,
          capacity_gb = excluded.capacity_gb, modules = excluded.modules, speed_mt = excluded.speed_mt,
          cas_latency = excluded.cas_latency, profile = excluded.profile,
          registered = excluded.registered, ecc = excluded.ecc`)
        .run(product.id, product.memoryType, product.capacityGb, product.modules, product.speedMt,
          product.casLatency, product.profile, Number(product.registered ?? false), Number(product.ecc ?? false));
      break;
    case 'mini-pc':
      db.prepare(`INSERT INTO mini_pc_specs
        (product_id, processor, graphics, memory_gb, storage_gb, memory_type, npu_tops,
         total_ai_tops, memory_upgradeable, extra_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET processor = excluded.processor,
          graphics = excluded.graphics, memory_gb = excluded.memory_gb,
          storage_gb = excluded.storage_gb, memory_type = excluded.memory_type,
          npu_tops = excluded.npu_tops, total_ai_tops = excluded.total_ai_tops,
          memory_upgradeable = excluded.memory_upgradeable, extra_json = excluded.extra_json`)
        .run(product.id, product.processor, product.graphics, product.memoryGb, product.storageGb,
          product.memoryType, product.npuTops, product.totalAiTops, Number(product.memoryUpgradeable),
          JSON.stringify({ architecture: product.architecture, systemType: product.systemType,
            memoryBandwidthGbS: product.memoryBandwidthGbS, chipTdpW: product.chipTdpW,
            powerSupplyW: product.powerSupplyW, aiPerformanceLabel: product.aiPerformanceLabel,
            maxInferenceParametersB: product.maxInferenceParametersB,
            maxFineTuneParametersB: product.maxFineTuneParametersB }));
      break;
  }
}

function seedBenchmark(result: BenchmarkSeed) {
  db.prepare(`INSERT INTO benchmark_results
    (product_id, benchmark_key, benchmark_name, benchmark_version, workload, score, unit,
     higher_is_better, result_type, source_name, source_url, observed_at, sample_count,
     source_device_name, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(product_id, benchmark_key, benchmark_version) DO UPDATE SET
      benchmark_name = excluded.benchmark_name, workload = excluded.workload, score = excluded.score,
      unit = excluded.unit, higher_is_better = excluded.higher_is_better,
      result_type = excluded.result_type, source_name = excluded.source_name,
      source_url = excluded.source_url, observed_at = excluded.observed_at,
      sample_count = excluded.sample_count, source_device_name = excluded.source_device_name,
      notes = excluded.notes`)
    .run(result.productId, result.benchmarkKey, result.benchmarkName, result.benchmarkVersion,
      result.workload, result.score, result.unit, Number(result.higherIsBetter), result.resultType,
      result.sourceName, result.sourceUrl, result.observedAt, result.sampleCount ?? null,
      result.sourceDeviceName, result.notes);
}

function seedEbayMarket(snapshot: EbayUsedMarketSeed) {
  db.prepare(`INSERT INTO marketplace_snapshots
    (product_id, marketplace, item_condition, observed_at, search_url, seller_rule)
    VALUES (?, 'eBay', 'used', ?, ?, ?)
    ON CONFLICT(product_id, marketplace, item_condition, observed_at) DO UPDATE SET
      search_url = excluded.search_url, seller_rule = excluded.seller_rule`)
    .run(snapshot.productId, snapshot.observedAt, snapshot.searchUrl, ebaySellerRule);
  db.prepare(`DELETE FROM marketplace_listings
    WHERE product_id = ? AND marketplace = 'eBay' AND item_condition = 'used' AND observed_at = ?`)
    .run(snapshot.productId, snapshot.observedAt);
  const insertListing = db.prepare(`INSERT INTO marketplace_listings
    (product_id, marketplace, item_condition, observed_at, title, amount_cents, seller_name,
     seller_feedback_percent, seller_feedback_count, source_url)
    VALUES (?, 'eBay', 'used', ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(product_id, source_url, observed_at) DO UPDATE SET
      title = excluded.title, amount_cents = excluded.amount_cents,
      seller_name = excluded.seller_name, seller_feedback_percent = excluded.seller_feedback_percent,
      seller_feedback_count = excluded.seller_feedback_count`);
  snapshot.listings.forEach((item) => insertListing.run(
    snapshot.productId, snapshot.observedAt, item.title, item.amountCents, item.sellerName,
    item.sellerFeedbackPercent, item.sellerFeedbackCount, item.sourceUrl,
  ));
}

function seedLlmBenchmark(result: LlmBenchmarkSeed) {
  db.prepare(`INSERT INTO llm_benchmark_results
    (product_id, profile_key, model_name, model_file, quantization, engine, engine_commit,
     backend, gpu_count, gpu_layers, flash_attention, prompt_tokens, generated_tokens,
     prompt_tokens_per_second, prompt_stddev, generated_tokens_per_second, generated_stddev,
     source_name, source_url, source_device_name, observed_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(product_id, profile_key) DO UPDATE SET
      model_name = excluded.model_name, model_file = excluded.model_file,
      quantization = excluded.quantization, engine = excluded.engine,
      engine_commit = excluded.engine_commit, backend = excluded.backend,
      gpu_count = excluded.gpu_count, gpu_layers = excluded.gpu_layers,
      flash_attention = excluded.flash_attention, prompt_tokens = excluded.prompt_tokens,
      generated_tokens = excluded.generated_tokens,
      prompt_tokens_per_second = excluded.prompt_tokens_per_second,
      prompt_stddev = excluded.prompt_stddev,
      generated_tokens_per_second = excluded.generated_tokens_per_second,
      generated_stddev = excluded.generated_stddev, source_name = excluded.source_name,
      source_url = excluded.source_url, source_device_name = excluded.source_device_name,
      observed_at = excluded.observed_at, notes = excluded.notes`)
    .run(result.productId, result.profileKey, result.modelName, result.modelFile,
      result.quantization, result.engine, result.engineCommit ?? null, result.backend,
      result.gpuCount, result.gpuLayers, Number(result.flashAttention), result.promptTokens,
      result.generatedTokens, result.promptTokensPerSecond, result.promptStdDev,
      result.generatedTokensPerSecond, result.generatedStdDev, result.sourceName,
      result.sourceUrl, result.sourceDeviceName, result.observedAt, result.notes);
}

db.exec('BEGIN');
try {
  const catalogProductIds = new Set(allProducts.map((product) => product.id));
  // Remove GPU rows that were present before the AI-focused 12 GB minimum was
  // introduced. Child benchmark and market rows are removed by foreign-key
  // cascades, keeping the API and persistent catalog in sync.
  db.prepare(`DELETE FROM products
    WHERE category = 'gpu'
      AND id IN (SELECT product_id FROM gpu_specs
        WHERE COALESCE(json_extract(extra_json, '$.addressableVramGb'), vram_gb) <= 10)`).run();
  const removeExcludedGpu = db.prepare(`DELETE FROM products WHERE category = 'gpu' AND id = ?`);
  userExcludedGpuIds.forEach((productId) => removeExcludedGpu.run(productId));
  allProducts.forEach(seedProduct);
  benchmarkSeeds.filter((result) => catalogProductIds.has(result.productId)).forEach(seedBenchmark);
  ebayUsedMarketSeeds.filter((snapshot) => catalogProductIds.has(snapshot.productId)).forEach(seedEbayMarket);
  llmBenchmarkSeeds.filter((result) => catalogProductIds.has(result.productId)).forEach(seedLlmBenchmark);
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}

type DbRow = Record<string, string | number | null>;

function baseFromRow(row: DbRow) {
  return {
    id: row.id as string,
    category: row.category as Category,
    manufacturer: row.manufacturer as string,
    name: row.name as string,
    description: row.description as string,
    tags: JSON.parse(row.tags_json as string) as string[],
    specSourceUrl: row.spec_source_url as string | undefined,
    compatibilitySourceUrl: row.compatibility_source_url as string | undefined,
    price: {
      amountCents: row.amount_cents as number,
      currency: row.currency as 'USD',
      priceType: row.price_type as 'MSRP' | 'store' | 'reference',
      retailer: row.retailer as string,
      sourceUrl: row.source_url as string,
      observedAt: row.observed_at as string,
    },
  };
}

function getBenchmarksByProduct() {
  const rows = db.prepare(`SELECT product_id, benchmark_key, benchmark_name, benchmark_version,
    workload, score, unit, higher_is_better, result_type, source_name, source_url, observed_at,
    sample_count, source_device_name, notes
    FROM benchmark_results
    ORDER BY product_id,
      CASE workload WHEN 'cpu-overall' THEN 1 WHEN 'cpu-single-thread' THEN 2
        WHEN 'gpu-compute' THEN 3 ELSE 4 END`).all() as DbRow[];
  const grouped = new Map<string, BenchmarkResult[]>();
  rows.forEach((row) => {
    const result: BenchmarkResult = {
      benchmarkKey: row.benchmark_key as BenchmarkResult['benchmarkKey'],
      benchmarkName: row.benchmark_name as string,
      benchmarkVersion: row.benchmark_version as string,
      workload: row.workload as BenchmarkResult['workload'],
      score: row.score as number,
      unit: row.unit as 'points',
      higherIsBetter: Boolean(row.higher_is_better),
      resultType: row.result_type as BenchmarkResult['resultType'],
      sourceName: row.source_name as string,
      sourceUrl: row.source_url as string,
      observedAt: row.observed_at as string,
      sampleCount: row.sample_count === null ? undefined : row.sample_count as number,
      sourceDeviceName: row.source_device_name as string,
      notes: row.notes as string,
    };
    const productId = row.product_id as string;
    grouped.set(productId, [...(grouped.get(productId) ?? []), result]);
  });
  return grouped;
}

function getUsedMarketByProduct() {
  const snapshots = db.prepare(`SELECT snapshot.*
    FROM marketplace_snapshots snapshot
    WHERE snapshot.marketplace = 'eBay' AND snapshot.item_condition = 'used'
      AND snapshot.observed_at = (
        SELECT MAX(latest.observed_at) FROM marketplace_snapshots latest
        WHERE latest.product_id = snapshot.product_id
          AND latest.marketplace = snapshot.marketplace
          AND latest.item_condition = snapshot.item_condition
      )`).all() as DbRow[];
  return new Map(snapshots.map((snapshot) => {
    const listings = db.prepare(`SELECT title, amount_cents, seller_name, seller_feedback_percent,
      seller_feedback_count, source_url FROM marketplace_listings
      WHERE product_id = ? AND marketplace = 'eBay' AND item_condition = 'used' AND observed_at = ?
      ORDER BY amount_cents`).all(snapshot.product_id, snapshot.observed_at) as DbRow[];
    const market: UsedMarketSnapshot = {
      marketplace: 'eBay', condition: 'used', observedAt: snapshot.observed_at as string,
      searchUrl: snapshot.search_url as string, sellerRule: snapshot.seller_rule as string,
      listings: listings.map((item) => ({
        title: item.title as string, amountCents: item.amount_cents as number,
        sellerName: item.seller_name as string,
        sellerFeedbackPercent: item.seller_feedback_percent as number,
        sellerFeedbackCount: item.seller_feedback_count as number,
        sourceUrl: item.source_url as string,
      })),
    };
    return [snapshot.product_id as string, market];
  }));
}

function getLlmBenchmarksByProduct() {
  const rows = db.prepare(`SELECT * FROM llm_benchmark_results
    ORDER BY product_id, profile_key`).all() as DbRow[];
  const grouped = new Map<string, LlmBenchmarkResult[]>();
  rows.forEach((row) => {
    const result: LlmBenchmarkResult = {
      profileKey: row.profile_key as LlmBenchmarkResult['profileKey'],
      modelName: row.model_name as LlmBenchmarkResult['modelName'],
      modelFile: row.model_file as LlmBenchmarkResult['modelFile'],
      quantization: row.quantization as LlmBenchmarkResult['quantization'],
      engine: row.engine as LlmBenchmarkResult['engine'],
      engineCommit: row.engine_commit === null ? undefined : row.engine_commit as string,
      backend: row.backend as LlmBenchmarkResult['backend'],
      gpuCount: row.gpu_count as 1,
      gpuLayers: row.gpu_layers as 99,
      flashAttention: Boolean(row.flash_attention) as false,
      promptTokens: row.prompt_tokens as 512,
      generatedTokens: row.generated_tokens as 128,
      promptTokensPerSecond: row.prompt_tokens_per_second as number,
      promptStdDev: row.prompt_stddev as number,
      generatedTokensPerSecond: row.generated_tokens_per_second as number,
      generatedStdDev: row.generated_stddev as number,
      sourceName: row.source_name as string,
      sourceUrl: row.source_url as string,
      sourceDeviceName: row.source_device_name as string,
      observedAt: row.observed_at as string,
      notes: row.notes as string,
    };
    const productId = row.product_id as string;
    grouped.set(productId, [...(grouped.get(productId) ?? []), result]);
  });
  return grouped;
}

export function getProducts(): Product[] {
  const baseQuery = `
    SELECT p.*, pr.amount_cents, pr.currency, pr.price_type, pr.retailer, pr.source_url, pr.observed_at
    FROM products p
    JOIN price_references pr ON pr.id = (
      SELECT id FROM price_references WHERE product_id = p.id ORDER BY observed_at DESC, id DESC LIMIT 1
    )`;

  const rows = db.prepare(baseQuery).all() as DbRow[];
  const benchmarksByProduct = getBenchmarksByProduct();
  const usedMarketByProduct = getUsedMarketByProduct();
  const llmBenchmarksByProduct = getLlmBenchmarksByProduct();
  const products = rows.map((row) => {
    const base = { ...baseFromRow(row), benchmarks: benchmarksByProduct.get(row.id as string) ?? [] };
    switch (base.category) {
      case 'cpu': {
        const s = db.prepare('SELECT * FROM cpu_specs WHERE product_id = ?').get(base.id) as DbRow;
        const extra = JSON.parse((s.extra_json as string) || '{}') as Partial<Cpu>;
        return { ...base, category: 'cpu', socket: s.socket, cores: s.cores, threads: s.threads,
          boostClockGhz: s.boost_clock_ghz, basePowerW: s.base_power_w,
          memoryTypes: JSON.parse(s.memory_types_json as string), integratedGraphics: Boolean(s.integrated_graphics),
          ...extra } as Cpu;
      }
      case 'motherboard': {
        const s = db.prepare('SELECT * FROM motherboard_specs WHERE product_id = ?').get(base.id) as DbRow;
        const extra = JSON.parse((s.extra_json as string) || '{}') as Partial<Motherboard>;
        return { ...base, category: 'motherboard', socket: s.socket, chipset: s.chipset,
          formFactor: s.form_factor, memoryType: s.memory_type, memorySlots: s.memory_slots,
          maxMemoryGb: s.max_memory_gb, pcieX16Slots: s.pcie_x16_slots, m2Slots: s.m2_slots,
          wifi: Boolean(s.wifi), ...extra } as Motherboard;
      }
      case 'gpu': {
        const s = db.prepare('SELECT * FROM gpu_specs WHERE product_id = ?').get(base.id) as DbRow;
        const extra = JSON.parse((s.extra_json as string) || '{}') as Partial<Gpu>;
        return { ...base, category: 'gpu', vramGb: s.vram_gb, interface: s.interface,
          lengthMm: s.length_mm, boardPowerW: s.board_power_w, recommendedPsuW: s.recommended_psu_w,
          ...extra, usedMarket: usedMarketByProduct.get(base.id),
          llmBenchmarks: llmBenchmarksByProduct.get(base.id) ?? [] } as Gpu;
      }
      case 'ram': {
        const s = db.prepare('SELECT * FROM ram_specs WHERE product_id = ?').get(base.id) as DbRow;
        return { ...base, category: 'ram', memoryType: s.memory_type, capacityGb: s.capacity_gb,
          modules: s.modules, speedMt: s.speed_mt, casLatency: s.cas_latency, profile: s.profile,
          registered: Boolean(s.registered), ecc: Boolean(s.ecc) } as Ram;
      }
      case 'mini-pc': {
        const s = db.prepare('SELECT * FROM mini_pc_specs WHERE product_id = ?').get(base.id) as DbRow;
        const extra = JSON.parse((s.extra_json as string) || '{}') as Partial<MiniPc>;
        return { ...base, category: 'mini-pc', processor: s.processor, graphics: s.graphics,
          memoryGb: s.memory_gb, storageGb: s.storage_gb, memoryType: s.memory_type,
          npuTops: s.npu_tops, totalAiTops: s.total_ai_tops, memoryUpgradeable: Boolean(s.memory_upgradeable),
          ...extra, llmBenchmarks: llmBenchmarksByProduct.get(base.id) ?? [] } as MiniPc;
      }
      case 'server-system':
        throw new Error('Server systems are stored in the dedicated server_systems table');
    }
  });

  const serverRows = db.prepare('SELECT * FROM server_systems ORDER BY manufacturer, name').all() as DbRow[];
  const servers = serverRows.map((row) => {
    const extra = JSON.parse(row.extra_json as string) as Partial<ServerSystem>;
    return {
      id: row.id, category: 'server-system', manufacturer: row.manufacturer, name: row.name,
      family: row.family, description: row.description, rackUnits: row.rack_units,
      cpuSockets: row.cpu_sockets, cpuSocket: row.cpu_socket, cpuGeneration: row.cpu_generation,
      supportedCpuModels: JSON.parse(row.supported_cpu_models_json as string),
      dramSlots: row.dram_slots, optaneSeries: row.optane_series, optaneSlots: row.optane_slots,
      maxOptaneGb: row.max_optane_gb, pcieGeneration: row.pcie_generation,
      pcieSlots: row.pcie_slots,
      powerSupplyOptionsW: JSON.parse(row.power_supply_options_json as string),
      maxOptanePowerW: row.max_optane_power_w,
      cpuAndOptaneBudgetW: row.cpu_and_optane_budget_w,
      powerSourceUrl: row.power_source_url,
      boardFormFactor: row.board_form_factor,
      boardDimensionsMm: row.board_dimensions_mm, systemDimensionsMm: row.system_dimensions_mm,
      sluiceV2Fit: row.sluice_v2_fit, linuxSupport: Boolean(row.linux_support),
      windowsSupport: Boolean(row.windows_support), tags: JSON.parse(row.tags_json as string),
      price: JSON.parse(row.price_json as string), specSourceUrl: row.spec_source_url ?? undefined,
      compatibilitySourceUrl: row.compatibility_source_url ?? undefined, ...extra,
    } as ServerSystem;
  });

  return [...products, ...servers];
}

export const dbInfo = { path: databasePath };
