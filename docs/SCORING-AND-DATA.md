# Scoring and data specification

This document defines which product evidence Compute Value accepts and how the UI converts it into rankings. Source URLs and observation dates live beside the individual records in the TypeScript seed data and generated API response.

## Product records

Common product identity and price-reference fields are defined in `src/types.ts`. The typed source catalog is in `server/catalog.ts`, while conventional benchmark seeds, fixed-control LLM results, used-market observations, Optane CPU qualification, and cluster research are kept in their corresponding files under `server/` and `src/data/`.

The runtime SQLite database is generated locally from those version-controlled sources. Database files, WAL files, and shared-memory files are intentionally not versioned.

## Apples-to-apples LLM performance

The primary single-GPU control accepts only `llama-2-7b.Q4_0.gguf` results with the recorded `llama.cpp` profile: one GPU, 99 GPU layers, flash attention disabled, 128 generated tokens (`tg128`), and a separate 512-token prompt pass (`pp512`). Backend and source metadata remain visible.

The fixed-control performance score is:

```text
performance = 70% normalized decode + 30% normalized prompt processing
```

Each phase is normalized against the fastest accepted result. Specifications, price, estimated throughput, and measurements from other models never enter this performance score. An unmeasured GPU stays unranked.

## Individual-card buyer score

Only discrete cards with at least 24 GB of addressable VRAM, an accepted fixed-control result, and a qualifying used-market price receive a buyer score:

```text
buyer score = 42.5% performance + 42.5% performance per dollar + 15% addressable VRAM
```

The representative acquisition cost is the midpoint of the retained asking-price range. It covers the card only; host, cooling, chassis, power-delivery, tax, and shipping costs are not implied.

## Used-market rules

A retained eBay observation must match the exact card and capacity, be listed as used, and come from a seller with at least 98% positive feedback and 100 feedback records. Defective hardware, samples, accessories, multi-card lots, modules mistaken for PCIe cards, and complete-server listings are excluded.

Open-box and refurbished asks can be displayed as explicitly labeled market signals but do not enter the used-card buyer score. Rejected listings can be shown to document an otherwise empty search; they remain visibly rejected and cannot enter any price-adjusted rank.

## Hashcat power-per-dollar score

The Hashcat view keeps mode 1000 NTLM and mode 3200 bcrypt cost 5 separate. For a selected mode and seller pool:

```text
power per $1,000 = published-or-labeled-proxy hash rate / acquisition dollars × 1,000
```

The displayed value is literal throughput per $1,000, not a normalized 0–100 score. It is intentionally not a VRAM, efficiency, or composite score. Every catalog GPU remains in scope, but only rows with both a Hashcat measurement/proxy and a qualifying current price receive a numeric value rank. A result must retain its exact-measured, same-silicon-proxy, or architecture-estimate badge and uncertainty band. Direct B&H rows must be sold by B&H as an authorized dealer; direct Best Buy rows must explicitly say “Sold by Best Buy,” and Marketplace sellers are excluded. eBay uses the median of the retained exact-model used asks rather than the cheapest ask. Sold-out listings remain visible evidence but cannot supply a price. Shipping, tax, host hardware, passive-card airflow, and electrical infrastructure are excluded.

Electricity cost and board wattage have zero scoring weight. Board power remains a displayed specification and an input to some explicitly labeled missing-benchmark projections because a board's power limit affects the performance it can physically deliver; it is never applied as an operating-cost penalty or efficiency bonus.

Two independent capacity-planning axes are also displayed, but neither is multiplied into the compact-hash value score:

```text
capacity value = single-workload addressable VRAM / acquisition dollars × 1,000
concurrent job headroom = floor(addressable VRAM × 90% / selected per-job footprint)
```

The 10% concurrency reserve is deliberately conservative and configurable job footprints are planning scenarios, not measured process limits. For split-memory boards, capacity and job headroom use one GPU's addressable pool rather than summing physically separate pools. Hashcat allocates target buffers from the actual digest, salt, and extended-salt counts, while candidate working memory scales from kernel power and per-candidate temporary storage. Extra VRAM can therefore host more independent memory-resident jobs or raise concurrency in a memory-hard mode, but only when memory is the binding constraint; it never justifies multiplying NTLM or bcrypt throughput by a number of header copies. Simultaneous jobs share the GPU's compute and memory bandwidth, so aggregate rate may stay flat or decline. Multiple target salts may also remove single-hash or single-salt optimizations. Implementation references: [target buffer allocation](https://github.com/hashcat/hashcat/blob/master/src/backend.c#L15486-L15496), [kernel power and memory fitting](https://github.com/hashcat/hashcat/blob/master/src/backend.c#L17715-L17874), and [single-hash/single-salt optimization selection](https://github.com/hashcat/hashcat/blob/master/src/hashes.c#L2388-L2393).

For compact modes, CUDA-core/SM count is an important compute input but not a universal cross-generation rate. Clock speed, architecture-specific integer and bitwise execution, register pressure, cache behavior, occupancy, kernel implementation, and power limits also matter. The ranking therefore prefers an exact same-mode measurement. Same-silicon proxies may use compute-unit share and board-power envelope, while cross-architecture estimates retain a visibly wider uncertainty band.

## Memory-hard Argon2 controls

Generic Argon2 and Tails LUKS2 are independent benchmark databases, not alternate units for one score:

```text
generic Argon2 control = mode 34000 · Argon2id · m=65,536 KiB · t=3 · p=1
Tails LUKS2 control    = mode 34100 · Argon2id · m=1,048,576 KiB · t=4 · p=4
```

The generic control follows Hashcat's published RFC 9106-recommended profile. The Tails control follows the mode-34100 self-test parameters and the Tails LUKS2 creation settings. A row enters either ranking only when the source used that exact configuration. A generic mode-34000 result is never divided or otherwise converted into an estimated Tails rate: usable VRAM, temporary-memory fitting, architecture, runtime, and kernel behavior make that conversion unreliable.

The V100 has a direct 11 H/s public result in mode 34100. Inspection of the raw result metadata resolves the formerly ambiguous hardware: the source shows 16,384 MiB BAR1 and VBIOS `88.00.1A.00.03`, which H3C's OEM inventory documentation maps to `Tesla V100-PCIE-16GB`. Hashcat 7.1.2 returned `11:11:11 H/s` across three runs under CUDA 12.4.89. The public uploader is identified only as `root`. This result is retained as source-only V100 evidence and is not transferred to the 32 GB product ranking. Hashcat 7.1.2's Argon2 tuning code derives acceleration-lane capacity from available device memory and allocates one workload-sized Argon2 buffer per lane. At this profile, the conservative default-memory calculation yields about 15 one-GiB candidate workspaces on the 16 GB source board and 31 on the PCIe 32 GB board. Scaling the direct 11 H/s result by 31/15 produces a 22.7 H/s planning midpoint, or 1,961,280 guesses per day, with a mandatory ±25% capacity-model band. This is shown separately and is not ranked as a measurement: a direct PCIe 32 GB run remains an open exact-profile gap.

No direct public V100 mode-34000 result was found in the research pass. The displayed generic V100 planning midpoint is consequently a bandwidth model:

```text
V100 mode-34000 planning midpoint = 1,703 H/s × 900 GB/s ÷ 1,008 GB/s = 1,521 H/s
displayed planning band = midpoint ±30%
```

The 1,703 H/s anchor is Hashcat's direct RTX 4090 mode-34000 result; 900 GB/s is NVIDIA's published V100 PCIe peak bandwidth. The ±30% band accounts for architectural, clock, driver/runtime, and kernel-efficiency differences. The midpoint is stored with `bandwidth-model` evidence and must never be presented as measured.

A separate published Hashcat v6.2.3 report measured four Tesla V100-SXM2-16GB modules at 318.9 kH/s aggregate bcrypt cost 5 and 89,446 H/s aggregate LUKS1. Hashcat 6.2.3 predates Argon2 support, so those direct four-card figures remain historical V100 context and cannot be substituted for either memory-hard control.

Direct multi-GPU mode-34000 results can enter the generic table only as per-GPU normalizations, with cluster provenance kept visible:

```text
8× RTX 5090 = 17,400 H/s aggregate ÷ 8 = 2,175 H/s per GPU
8× H200     = 32,400 H/s aggregate ÷ 8 = 4,050 H/s per GPU
```

The RTX 5090 identity is exact, so it is labeled `measured-public-cluster`. The H200 uploader did not disclose NVL versus SXM form factor, power configuration, backend, or Hashcat version. It is therefore attached to the H200 NVL catalog row only as `hardware-qualified-cluster`, with a ±15% qualification band. An 18,900 H/s eight-GPU row labeled only “RTX 6000 S” remains in the audit but cannot be assigned to RTX 6000 Ada or another catalog SKU.

Additional V100 field measurements—scientific peak FLOPS and sustained HBM bandwidth, CUDA P2P bandwidth/latency, bcrypt cost 10, and LLM inference/concurrency—are corroborating workload evidence only. Each retains its original workload, GPU count, profile, and source. None is converted into Argon2 throughput.

The V100 Argon2 source audit keeps rejected candidates visible. A Reddit V100 owner published a broad Tesla benchmark suite, but the linked Hashcat runner defaults to mode 1400 SHA-256 and does not provide mode 34000 or 34100. Openwall's January 2024 GPU Argon2id demonstration used a GTX 1080 at different parameters, not a V100. Hashcat's official 7.0.0 comparison used RTX 4090 and RX 7900 XTX. A separate V100 article explicitly derives its Argon2 figure from RTX 5090 results and memory bandwidth, so it remains a model. None of these near-misses is promoted to a V100 measurement.

## Exactly-48-GB view

The dedicated 48 GB table includes every catalog GPU with exactly 48 GB of addressable memory. Cards with 64, 72, 80, 84, or 96 GB are excluded. Price research coverage and benchmark coverage are separate: a priced card without the exact control remains visible but unranked.

## Enterprise clusters

Cluster and complete-system results are not mixed into the individual-card score. They have different host cost, topology, tensor-parallel efficiency, power, cooling, and wall-circuit constraints. Published measurements and modeled estimates are labeled separately in the cluster dataset and UI.

## Reproducibility

Run the complete verification suite with:

```bash
npm ci
npm test
npm run build
```

Tests assert catalog integrity, compatibility rules, benchmark contracts, pricing screens, score weights, ranking behavior, and component rendering.
