# Benchmark and hardware contribution contract

Compute Value accepts community contributions through validated GitHub pull requests. The goal is reproducible evidence, not the largest possible number.

## Product records

Add homelab products to `data/catalog/homelab-products.json`. Records must pass `data/schemas/homelab-product.schema.json` and the repository validator.

Required evidence:

- Exact manufacturer and model/variant.
- Capacity, form factor, cooling, and connector details that distinguish the variant.
- Manufacturer specification or manual URL.
- Dated price source with condition and seller type.
- For motherboards, an explicit per-slot electrical topology whenever a manual provides it.

Run:

```bash
npm run validate:data
npm test
npm run build
```

## Universal LLM benchmark

Use a pinned `llama.cpp` commit and one of the published model profiles. A basic control run is:

```bash
./llama-bench \
  -m /models/exact-model-file.gguf \
  -p 512 \
  -n 128 \
  -r 5 \
  -ngl 99 \
  -o json
```

The submitted evidence must include:

- Model repository revision, exact filename, size, and SHA-256.
- `llama.cpp` commit and build flags.
- Complete raw JSON output.
- CPU, RAM, motherboard, GPU count, and exact accelerator variants.
- Operating system, kernel, driver, CUDA/ROCm/Metal version.
- Power limit, clocks, cooling configuration, and wall-power method if measured.
- Tensor split, batch/micro-batch, flash-attention, KV types, and context settings.

Do not merge results across different model artifacts, quantizations, runtimes, contexts, or concurrency levels. Native-runtime results are welcome but must use a separate profile key.

## Evidence tiers

- `measured`: exact hardware and complete matching protocol.
- `hardware-qualified`: exact device, incomplete environment metadata.
- `proxy`: same silicon or a documented sibling configuration.
- `model`: calculation from another result or specification.

Only exact measured results enter fixed-control rankings. Reviewers may lower an evidence tier when metadata is incomplete.
