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
