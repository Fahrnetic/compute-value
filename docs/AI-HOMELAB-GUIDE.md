# AI homelab field guide

Compute Value designs from the workload outward. The safest order is model, memory, runtime, accelerator, host platform, power, thermals, and complete price.

## 1. Freeze the workload

Record the exact model artifact, quantization, context length, expected simultaneous users, and runtime. “A 70B model” is not enough: quantization and KV-cache settings can move memory requirements by tens of gigabytes.

The universal comparison lane uses fixed `llama.cpp` profiles. Native MLX, vLLM, SGLang, TensorRT-LLM, and other optimized results remain separate because changing the runtime changes the experiment.

## 2. Calculate memory before speed

Planning memory consists of:

```text
model weights + runtime buffers + KV cache × context × users + safety reserve
```

Discrete multi-GPU systems usually have independent address spaces. Two 24 GB cards are not automatically one ordinary 48 GB allocation; the runtime must shard the model. Split-memory boards are recorded by their per-GPU addressable pool.

Apple and Ryzen AI Max systems use unified memory, but the operating system and applications still need a reserve. Compute Value uses a conservative planning reserve and labels it as a calculation, not a measured maximum.

## 3. Compare exact benchmark profiles

Prompt processing and token generation are different workloads. Report both:

- `pp512`: prompt-processing throughput for a 512-token prompt.
- `tg128`: decode throughput while generating 128 tokens.
- Long-context decode: generation with an explicitly populated context.
- Aggregate serving throughput: multiple simultaneous sequences, kept separate from single-user speed.

A result should include the model hash, engine commit, backend, driver, GPU power limit, GPU count, tensor split, flash-attention setting, batch sizes, repetitions, and raw output.

## 4. Audit the host platform

For every PCIe slot, verify:

- Physical connector width and actual electrical width.
- PCIe generation.
- CPU, chipset, or switch attachment.
- Lane-sharing with M.2, SATA, USB4, or other slots.
- Spacing available after installing wide GPUs.
- Above 4G Decoding, ReBAR, IOMMU, and bifurcation requirements.

CPU core count is rarely the first host criterion for fully offloaded inference. PCIe lanes, memory channels, system-memory capacity, platform idle power, and price are usually more important.

## 5. Engineer power and airflow

PSU wattage alone is insufficient. Count native connectors, independent cables, EPS connectors, motherboard auxiliary GPU power, and transient capability. Passive data-center GPUs require a deliberate high-pressure airflow path.

The household-power planner uses configurable voltage, breaker amperage, and continuous-load factors. It is planning guidance, not electrical approval. Verify local code and consult a qualified electrician before installing or continuously loading a new circuit.

Every watt consumed becomes heat in the room:

```text
BTU per hour ≈ wall watts × 3.412
```

## 6. Price the route

Complete system cost includes the host, RAM, accelerator quantity, PSU, chassis, cooling, storage, networking, and necessary risers or cables. A quote-only component is unknown, not free. Tax, shipping, labor, and electrical work remain excluded unless entered explicitly.

## 7. Read the verdict correctly

- **Pass:** the documented rule is satisfied.
- **Warning:** the build can work, but a material tradeoff or manual step remains.
- **Fail:** the selected parts conflict under the documented rule.
- **Unknown:** the evidence is incomplete; it is not a pass.

Measurements, hardware-qualified evidence, proxies, and models remain visually and numerically separate throughout Compute Value.
