# Compute Value — Forge PC Lab

Compute Value is the source repository for Forge, a compatibility-aware PC hardware catalog, AI-compute comparison lab, and guided builder. It uses a locally generated SQLite database, a typed Express API, and a React/TypeScript interface.

## Included now

- 259 seeded records across CPUs, motherboards, GPUs, RAM kits, mini AI PCs, and complete server systems
- 84 researched NVIDIA/AMD GPUs, including 68 cards with at least 24 GB of addressable memory
- Consumer, workstation, virtualization, and data-center GPUs spanning Kepler/GCN through Blackwell/CDNA 4
- GPU memory topology, bus width/bandwidth, PCIe link, cooling, power, dimensions, display capability, CUDA/ROCm metadata, and NVIDIA sparse-FP4 AI TOPS
- 15 NVIDIA Blackwell variants across GeForce, RTX PRO workstation, and RTX PRO server cards
- 15 additional mainstream NVIDIA Ampere/Ada cards from the RTX 3060 12 GB through RTX 4080 SUPER, including separate 4060 Ti 8/16 GB variants and the RTX 4070 SUPER
- Normalized category-specific spec tables and time-stamped price references
- Guided four-part builder with compatible-only filtering
- Rules for CPU sockets, DDR4/DDR5, DIMM count/capacity, PCIe slots, display output, split VRAM, passive GPU airflow, GPU clearance, and PSU guidance
- Searchable/filterable parts database
- Fastest-to-slowest performance rankings led by measured LLM tokens/second, with separate GPU VRAM, CPU memory, CPU PCIe, and motherboard-lane views
- 34 single-GPU llama.cpp measurements using the exact same `llama-2-7b.Q4_0.gguf` file and `tg128`/`pp512` test profile, plus vendor-native CUDA-core, stream-processor, or Xe-core counts
- A dedicated audit of all 21 physical 32 GB GPU boards, with fixed-control and qualified same-model measurements, full memory/power/bandwidth/core context, and split-pool warnings for M10, Pro Duo, and V340
- A default NVIDIA Ampere+ research scope that reranks Ampere, Ada Lovelace, Hopper, and Blackwell cards without older NVIDIA or non-NVIDIA results occupying rank positions
- Independent UL Procyon cross-checks across Phi-3.5, Mistral 7B, Llama 3.1 8B, and Llama 2 13B, plus a three-model LocalScore scaling view for the RTX 4070 SUPER
- Model-level RTX PRO 6000 Blackwell 96 GB vs H200 NVL comparisons using shared NVIDIA Cosmos3 and MLPerf Closed workloads, with server-proxy and multi-GPU normalization warnings kept visible
- A second every-card `Meta-Llama-3.1-8B-Instruct-Q4_K_M` llama.cpp protocol (4.92 GB) plus a published, exact-file Q8_0 RTX 5090-vs-H200 NVL control and a six-GPU Qwen2.5-7B vLLM serving matrix
- An eight-model RTX PRO 6000 Blackwell Workstation Edition LM Studio library and a dedicated Qwen3.6-27B evidence/protocol view
- A 50/50 performance-versus-value buyer ranking: 42.5% fixed-control performance, 42.5% performance per dollar, and a capped 15% addressable-VRAM contribution for cards with at least 24 GB
- A dedicated exact-48-GB ranking with 13 audited cards, including 10 qualifying used prices, two labeled open-box/refurbished signals, and one rejected low-trust signal that cannot enter the buyer score
- Dated used eBay asking-price research for all 80 bandwidth-ranked GPUs: 88 retained asks across 44 exact models after seller-history and listing-condition screening
- Dedicated mini AI PC comparison view for memory, storage, NPU TOPS, and upgradeability
- Dedicated Optane server explorer covering 12 Intel, Dell, HPE, Lenovo, and Cisco systems
- Full Intel PMem 100/200 CPU qualification pools (61 Cascade Lake and 49 Ice Lake Xeon models)
- Per-server PMem capacity/module count, PCIe riser topology, board/system size, Linux/Windows qualification, and Sluice V2 breakout verdicts
- Official PSU options plus PMem-only and CPU+PMem power budgets, with redundancy and input-voltage warnings instead of misleading fixed wall-draw claims
- Persistent builds using browser local storage
- Responsive desktop and mobile interface

Reference prices are not live offers. Each record stores a price type, retailer/source label, source URL, and observation date. A GPU shown as “Quote / used market” has no trustworthy public dollar reference; its zero database amount is deliberately excluded from build totals and never means free hardware.

Used eBay prices are a separate market snapshot, not a replacement for MSRP/reference pricing and not a completed-sales appraisal. Retained listings must match the exact GPU, be marked used, and come from a seller with at least 98% positive feedback and 100 feedback records. Asking prices exclude shipping and tax, may accept lower offers, and can disappear at any time. Defective cards, qualification samples, accessories, multi-card lots, and whole-server listings are excluded. A researched GPU with no qualifying listing is shown as “No trusted match” rather than $0.

The LLM leaderboard uses measured llama.cpp community-scoreboard results, not values inferred from bandwidth or core count. Every ranked row uses the same Llama 2 7B `Q4_0` model file, one GPU, full GPU offload, flash attention disabled, 128 generated tokens (`tg128`), and a separate 512-token prompt-ingest result (`pp512`). CUDA, ROCm, and Vulkan are shown explicitly. The llama.cpp commit, driver, host CPU, cooling, and card power limit can still vary between community submissions, so this is a much stronger comparison than a spec estimate but not a single-lab controlled experiment. Unmeasured GPUs remain unranked.

The model-level comparison is a separate evidence layer. NVIDIA Cosmos3 results compare the same checkpoint and AIPerf matrix on RTX PRO 6000 Blackwell and H200 NVL, while MLPerf Closed results provide standardized deployment-throughput proxies. MLPerf RTX figures use the passive Server Edition and published multi-GPU totals normalized by GPU count, so they are never presented as desktop single-stream measurements. Qwen3.6-27B results remain topology-specific; an H200 value is deliberately absent until the same checkpoint, precision, runtime, MTP setting, concurrency, and sequence lengths are published.

The every-card control selects Bartowski's 4.92 GB `Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf`, which fits the catalog's 8 GB floor with KV-cache headroom. Published LTT Labs H200 NVL and RTX 5090 measurements use the exact same Llama 3.1 8B Q8_0 file and `llama-bench` commands, but remain a separate Q8 control rather than being mixed into the pending Q4 ranking. Koyeb's Qwen2.5-7B matrix likewise remains its own vLLM serving view because runtime, dtype, and request batching are not interchangeable with llama.cpp.

The NVIDIA consumer cross-check keeps three more evidence types separate. GPUreport's UL Procyon values are composite points and therefore never labeled tokens/sec. BenchLife's Procyon table publishes tokens/sec for four RTX 40 cards, but does not disclose which 4060 Ti capacity was used. LocalScore's RTX 4070 SUPER page shows prompt speed, generation speed, and TTFT for 1.5B, 8B, and 14.8B Q4_K models; because its accelerator summary does not expose one shared host record for all three values, it is treated as a model-size scaling reference rather than merged into the fixed-profile card ranking.

The long-tail 24 GB+ GPU survey and the mainstream GPU catalog are limited to standard PCIe add-in cards that can physically connect to the cataloged motherboards. Laptop/soldered GPUs, NVIDIA SXM modules, AMD OAM/EAM modules, Apple MPX modules, and every board-partner cooler SKU are excluded. Distinct vendor reference models, capacity variants, cooling variants, and region-only models are retained. Multi-GPU boards are labeled with their smaller per-GPU addressable memory pool.

The server scope uses Intel Optane Persistent Memory (PMem) 100 and 200, which are DDR4-compatible 288-pin server modules—not consumer Optane caching products. Servers are configurable, so CPU lists represent Intel's complete PMem-qualified Xeon pool; a specific OEM system may impose a narrower firmware, thermal, or sales configuration matrix. The Sluice V2 comparison uses its published 305 × 245 mm ATX-only tray. None of the researched proprietary dual-socket server planars is a stock drop-in.

## Repository map

- `server/catalog.ts` — typed product and specification source records
- `server/benchmarks.ts` and `server/llm-benchmarks.ts` — conventional and fixed-control benchmark datasets
- `server/ebay-market.ts` — seller-screened used-market observations
- `src/data/` — scoring, cluster, universal-model, Blackwell, V100, 32 GB, and 48 GB research datasets
- `src/components/` and `src/styles/` — the complete React UI and responsive visual system
- [`docs/SCORING-AND-DATA.md`](docs/SCORING-AND-DATA.md) — accepted evidence, formulas, price rules, and reproducibility contract
- `scripts/research-ebay-used-market.mjs` — repeatable eBay research helper

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite client proxies API calls to port `4174`.

For a production build:

```bash
npm run build
npm start
```

Open `http://localhost:4174`.

## Verification

```bash
npm test
npm run build
curl http://localhost:4174/api/health
```

## API

- `GET /api/catalog` — all products and category counts
- `GET /api/catalog?category=cpu&search=ryzen` — filtered catalog
- `GET /api/catalog?category=server-system` — Optane server-system records
- `GET /api/compatible?cpu=amd-ryzen-7-9800x3d` — valid item IDs for each builder category
- `POST /api/validate` with `{ "selection": { "cpu": "...", "motherboard": "..." } }` — full rule results, total, and power guidance

The SQLite file is created at `data/pc-builder.sqlite`. Set `PC_BUILDER_DB_PATH` to use another location.

## Data model

- `products` stores common identity, descriptions, and tags for builder parts and mini PCs.
- `cpu_specs`, `motherboard_specs`, `gpu_specs`, `ram_specs`, and `mini_pc_specs` hold typed category attributes.
- `server_systems` stores typed Optane, CPU, PCIe, physical-fit, operating-system, and source metadata for complete servers.
- `price_references` supports price history without overwriting prior observations.
- `benchmark_results` stores conventional CPU, graphics, and compute scores with source/version metadata.
- `llm_benchmark_results` stores the fixed-model llama.cpp profile, backend, commit, `tg128`, and `pp512` measurements.
- `marketplace_snapshots` and `marketplace_listings` store dated, seller-screened used-market research.

The CPU, mainstream motherboard, memory, and mini-PC portions remain representative. Cases, coolers, PSUs, storage, retailer ingestion, region/currency support, RAM QVLs, and partner-specific GPU dimensions are natural next expansions. Qualified workstation CPUs already carry board-specific QVL and minimum-BIOS checks.
