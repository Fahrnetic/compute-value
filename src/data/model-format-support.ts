import { enterpriseClusters } from './enterprise-clusters';

export type AiModelModality = 'llm' | 'image' | 'video';
export type AiModelPrecision = 'Q4' | 'Q8' | 'FP16' | 'BF16';
export type FormatAvailability = 'official checkpoint' | 'official runtime recipe' | 'framework-supported' | 'not verified';
export type FourGpuStrategy = 'tensor parallel' | 'component sharding' | 'FSDP + sequence parallel' | 'four replicas';
export type FourGpuFitStatus = 'fits' | 'conditional' | 'unsupported';

export interface AiModelProfile {
  id: string;
  name: string;
  modality: AiModelModality;
  parameterCountB: number | null;
  tasks: string[];
  nativePrecision: 'FP16' | 'BF16' | 'mixed';
  sourceUrl: string;
  notes: string;
}

export interface AiModelFormat {
  id: string;
  modelId: string;
  precision: AiModelPrecision;
  format: string;
  availability: FormatAvailability;
  available: boolean;
  runtime: string;
  weightPayloadGb: number | null;
  payloadBasis: 'published repository files' | 'runtime quantization; no fixed artifact' | 'not applicable';
  planningVramGb: number | null;
  minimumComputeCapability: number;
  requiresNativeBf16: boolean;
  fourGpuStrategy: FourGpuStrategy;
  supportsCpuOffload: boolean;
  sourceUrl: string;
  notes: string;
}

export interface FourGpuModelCluster {
  id: string;
  name: string;
  architecture: string;
  gpuCount: 4;
  vramPerGpuGb: number;
  totalVramGb: number;
  computeCapability: number;
  nativeBf16: boolean;
  fabric: string;
  sourceUrl: string;
}

export interface FourGpuModelCompatibility {
  modelId: string;
  formatId: string;
  clusterId: string;
  status: FourGpuFitStatus;
  usableVramPerGpuGb: number;
  usableClusterVramGb: number;
  strategy: FourGpuStrategy;
  reason: string;
}

export interface AiModelCompatibilityCatalog {
  models: AiModelProfile[];
  formats: AiModelFormat[];
  clusters: FourGpuModelCluster[];
  compatibility: FourGpuModelCompatibility[];
  meta: {
    modelCount: number;
    formatCount: number;
    clusterCount: number;
    compatibilityCount: number;
    observedAt: string;
    methodology: string;
  };
}

const qwen32 = 'https://huggingface.co/Qwen/Qwen3-32B';
const qwen32Gguf = 'https://huggingface.co/Qwen/Qwen3-32B-GGUF';
const vllmParallelism = 'https://docs.vllm.ai/en/latest/serving/parallelism_scaling/';
const flux = 'https://huggingface.co/black-forest-labs/FLUX.1-dev';
const sdxl = 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0';
const cogVideo = 'https://huggingface.co/THUDM/CogVideoX-5b';
const wan = 'https://github.com/Wan-Video/Wan2.1';
const diffusersQuantization = 'https://huggingface.co/docs/diffusers/main/en/quantization/bitsandbytes';
const diffusersMemory = 'https://huggingface.co/docs/diffusers/main/en/optimization/memory';
const diffusersVideo = 'https://huggingface.co/docs/diffusers/main/en/using-diffusers/text-img2vid';

export const aiModelProfiles: AiModelProfile[] = [
  {
    id: 'qwen3-32b', name: 'Qwen3 32B', modality: 'llm', parameterCountB: 32.8,
    tasks: ['text generation', 'reasoning', 'tool use'], nativePrecision: 'BF16', sourceUrl: qwen32,
    notes: 'The owner publishes both full-precision safetensors and exact Q4_K_M/Q8_0 GGUF checkpoints. The four-GPU path uses one model replica sharded with TP4; aggregate VRAM is not transparent shared memory.',
  },
  {
    id: 'flux-1-dev', name: 'FLUX.1-dev', modality: 'image', parameterCountB: 12,
    tasks: ['text to image', 'image editing with adapters'], nativePrecision: 'BF16', sourceUrl: flux,
    notes: 'A composite Diffusers pipeline with a diffusion transformer, two text encoders, and VAE. Q4/Q8 refer to runtime bitsandbytes quantization of eligible linear layers, not GGUF.',
  },
  {
    id: 'sdxl-base-1', name: 'Stable Diffusion XL Base 1.0', modality: 'image', parameterCountB: null,
    tasks: ['text to image', 'image to image', 'LoRA inference'], nativePrecision: 'FP16', sourceUrl: sdxl,
    notes: 'The official repository publishes an FP16 pipeline payload. Four GPUs are best used as four independent workers for throughput; pipeline device mapping is optional rather than a required tensor-parallel path.',
  },
  {
    id: 'cogvideox-5b', name: 'CogVideoX 5B', modality: 'video', parameterCountB: 5,
    tasks: ['text to video', 'image to video'], nativePrecision: 'BF16', sourceUrl: cogVideo,
    notes: 'The model owner recommends BF16, supports FP16 and INT8, publishes multi-GPU memory guidance, and explicitly reports no INT4 support. Only the Diffusers implementation supports its quantized path.',
  },
  {
    id: 'wan21-t2v-14b', name: 'Wan2.1 T2V 14B', modality: 'video', parameterCountB: 14,
    tasks: ['text to video', '480p generation', '720p generation'], nativePrecision: 'BF16', sourceUrl: wan,
    notes: 'The official implementation supports multi-GPU FSDP plus xDiT USP. Its 40 attention heads divide evenly across four-way Ulysses, but the published command is an eight-GPU example rather than a matched four-GPU performance benchmark.',
  },
];

const unavailable = (
  id: string, modelId: string, precision: AiModelPrecision, format: string, sourceUrl: string, notes: string,
): AiModelFormat => ({
  id, modelId, precision, format, availability: 'not verified', available: false,
  runtime: 'No owner/framework-supported path located', weightPayloadGb: null, payloadBasis: 'not applicable',
  planningVramGb: null, minimumComputeCapability: 0, requiresNativeBf16: false,
  fourGpuStrategy: 'four replicas', supportsCpuOffload: false, sourceUrl, notes,
});

/**
 * Payloads are exact decimal-GB repository file totals when a fixed artifact is
 * published. Runtime-quantized diffusion pipelines deliberately keep payload
 * null: bitsandbytes converts selected linear layers and does not create one
 * universal Q4/Q8 file size for the entire composite pipeline.
 */
export const aiModelFormats: AiModelFormat[] = [
  {
    id: 'qwen3-32b-q4', modelId: 'qwen3-32b', precision: 'Q4', format: 'GGUF Q4_K_M',
    availability: 'official checkpoint', available: true, runtime: 'llama.cpp row split',
    weightPayloadGb: 19.762, payloadBasis: 'published repository files', planningVramGb: 28,
    minimumComputeCapability: 7, requiresNativeBf16: false, fourGpuStrategy: 'tensor parallel', supportsCpuOffload: true,
    sourceUrl: qwen32Gguf, notes: 'Exact owner-published GGUF. Planning VRAM adds KV cache and runtime headroom above the 19.762GB file.',
  },
  {
    id: 'qwen3-32b-q8', modelId: 'qwen3-32b', precision: 'Q8', format: 'GGUF Q8_0',
    availability: 'official checkpoint', available: true, runtime: 'llama.cpp row split',
    weightPayloadGb: 34.818, payloadBasis: 'published repository files', planningVramGb: 46,
    minimumComputeCapability: 7, requiresNativeBf16: false, fourGpuStrategy: 'tensor parallel', supportsCpuOffload: true,
    sourceUrl: qwen32Gguf, notes: 'Exact owner-published GGUF. Q8_0 is not the same representation or kernel path as diffusion INT8/bitsandbytes.',
  },
  {
    id: 'qwen3-32b-fp16', modelId: 'qwen3-32b', precision: 'FP16', format: 'safetensors cast to FP16',
    availability: 'framework-supported', available: true, runtime: 'vLLM TP4',
    weightPayloadGb: 65.524, payloadBasis: 'published repository files', planningVramGb: 84,
    minimumComputeCapability: 7, requiresNativeBf16: false, fourGpuStrategy: 'tensor parallel', supportsCpuOffload: false,
    sourceUrl: vllmParallelism, notes: 'The repository payload is BF16-sized; vLLM can load/cast half precision. Prefer BF16 on Ampere and newer unless a fixed FP16 control is required.',
  },
  {
    id: 'qwen3-32b-bf16', modelId: 'qwen3-32b', precision: 'BF16', format: 'safetensors BF16',
    availability: 'official checkpoint', available: true, runtime: 'vLLM TP4',
    weightPayloadGb: 65.524, payloadBasis: 'published repository files', planningVramGb: 84,
    minimumComputeCapability: 8, requiresNativeBf16: true, fourGpuStrategy: 'tensor parallel', supportsCpuOffload: false,
    sourceUrl: qwen32, notes: 'Native checkpoint path. vLLM documents tensor_parallel_size=4 for one model sharded across a four-GPU node.',
  },

  {
    id: 'flux-1-dev-q4', modelId: 'flux-1-dev', precision: 'Q4', format: 'bitsandbytes NF4 (eligible linear layers)',
    availability: 'official runtime recipe', available: true, runtime: 'Diffusers + Accelerate',
    weightPayloadGb: null, payloadBasis: 'runtime quantization; no fixed artifact', planningVramGb: 20,
    minimumComputeCapability: 6, requiresNativeBf16: false, fourGpuStrategy: 'four replicas', supportsCpuOffload: true,
    sourceUrl: diffusersQuantization, notes: 'Diffusers demonstrates FLUX.1-dev below 16GB using 4-bit bitsandbytes. CLIP and VAE remain at a higher dtype; this is not whole-pipeline 4-bit.',
  },
  {
    id: 'flux-1-dev-q8', modelId: 'flux-1-dev', precision: 'Q8', format: 'bitsandbytes LLM.int8 (eligible linear layers)',
    availability: 'official runtime recipe', available: true, runtime: 'Diffusers + Accelerate',
    weightPayloadGb: null, payloadBasis: 'runtime quantization; no fixed artifact', planningVramGb: 30,
    minimumComputeCapability: 7.5, requiresNativeBf16: false, fourGpuStrategy: 'component sharding', supportsCpuOffload: true,
    sourceUrl: diffusersQuantization, notes: 'Diffusers demonstrates quantizing both the FLUX transformer and T5 encoder in 8-bit. bitsandbytes LLM.int8 requires Turing-class compute capability 7.5 or newer.',
  },
  {
    id: 'flux-1-dev-fp16', modelId: 'flux-1-dev', precision: 'FP16', format: 'Diffusers safetensors / FP16 compute',
    availability: 'framework-supported', available: true, runtime: 'Diffusers balanced device map',
    weightPayloadGb: 33.742, payloadBasis: 'published repository files', planningVramGb: 44,
    minimumComputeCapability: 7, requiresNativeBf16: false, fourGpuStrategy: 'component sharding', supportsCpuOffload: true,
    sourceUrl: diffusersMemory, notes: 'FP16 execution is framework-supported, but BF16 is the preferred native path. The exact payload totals the Diffusers transformer, text encoders, and VAE once, excluding duplicate single-file exports.',
  },
  {
    id: 'flux-1-dev-bf16', modelId: 'flux-1-dev', precision: 'BF16', format: 'Diffusers safetensors / BF16 compute',
    availability: 'official checkpoint', available: true, runtime: 'Diffusers balanced device map',
    weightPayloadGb: 33.742, payloadBasis: 'published repository files', planningVramGb: 44,
    minimumComputeCapability: 8, requiresNativeBf16: true, fourGpuStrategy: 'component sharding', supportsCpuOffload: true,
    sourceUrl: diffusersMemory, notes: 'Preferred execution dtype. Diffusers can distribute pipeline components with device_map="balanced"; that is component placement, not tensor parallelism.',
  },

  unavailable('sdxl-base-1-q4', 'sdxl-base-1', 'Q4', 'No verified whole-pipeline Q4 representation', sdxl, 'Generic linear-layer quantization does not establish a complete SDXL Q4 pipeline because much of the UNet is convolutional.'),
  unavailable('sdxl-base-1-q8', 'sdxl-base-1', 'Q8', 'No verified whole-pipeline Q8 representation', sdxl, 'No model-owner Q8 pipeline was located. Do not equate an INT8 text encoder with an INT8 SDXL pipeline.'),
  {
    id: 'sdxl-base-1-fp16', modelId: 'sdxl-base-1', precision: 'FP16', format: 'official variant fp16 safetensors',
    availability: 'official checkpoint', available: true, runtime: 'Diffusers',
    weightPayloadGb: 6.938, payloadBasis: 'published repository files', planningVramGb: 12,
    minimumComputeCapability: 7, requiresNativeBf16: false, fourGpuStrategy: 'four replicas', supportsCpuOffload: true,
    sourceUrl: sdxl, notes: 'The official repository publishes FP16 UNet, text encoders, and VAE files totaling about 6.938GB. Four independent workers are normally more useful than sharding one image.',
  },
  {
    id: 'sdxl-base-1-bf16', modelId: 'sdxl-base-1', precision: 'BF16', format: 'safetensors cast to BF16',
    availability: 'framework-supported', available: true, runtime: 'Diffusers',
    weightPayloadGb: 6.938, payloadBasis: 'published repository files', planningVramGb: 12,
    minimumComputeCapability: 8, requiresNativeBf16: true, fourGpuStrategy: 'four replicas', supportsCpuOffload: true,
    sourceUrl: diffusersMemory, notes: 'A runtime dtype path rather than a separately published BF16 variant. The native FP16 checkpoint remains the cleaner reproducibility choice.',
  },

  unavailable('cogvideox-5b-q4', 'cogvideox-5b', 'Q4', 'INT4 explicitly unsupported', cogVideo, 'The model owner explicitly lists no INT4 support. This stays unsupported even though generic quantizers can transform Linear layers.'),
  {
    id: 'cogvideox-5b-q8', modelId: 'cogvideox-5b', precision: 'Q8', format: 'TorchAO/Quanto INT8 weight-only',
    availability: 'official runtime recipe', available: true, runtime: 'Diffusers only',
    weightPayloadGb: null, payloadBasis: 'runtime quantization; no fixed artifact', planningVramGb: 18,
    minimumComputeCapability: 8, requiresNativeBf16: true, fourGpuStrategy: 'four replicas', supportsCpuOffload: true,
    sourceUrl: cogVideo, notes: 'The owner documents INT8 starting around 4.4GB with all memory optimizations on A100/H100-class hardware and warns that INT8 reduces inference speed.',
  },
  {
    id: 'cogvideox-5b-fp16', modelId: 'cogvideox-5b', precision: 'FP16', format: 'Diffusers safetensors / FP16 compute',
    availability: 'official runtime recipe', available: true, runtime: 'Diffusers multi-GPU',
    weightPayloadGb: 21.528, payloadBasis: 'published repository files', planningVramGb: 24,
    minimumComputeCapability: 7, requiresNativeBf16: false, fourGpuStrategy: 'four replicas', supportsCpuOffload: true,
    sourceUrl: cogVideo, notes: 'FP16 is supported, although the 5B model was trained in BF16. Published optimized multi-GPU guidance reports a 15GB memory point.',
  },
  {
    id: 'cogvideox-5b-bf16', modelId: 'cogvideox-5b', precision: 'BF16', format: 'Diffusers safetensors / BF16 compute',
    availability: 'official checkpoint', available: true, runtime: 'Diffusers multi-GPU',
    weightPayloadGb: 21.528, payloadBasis: 'published repository files', planningVramGb: 24,
    minimumComputeCapability: 8, requiresNativeBf16: true, fourGpuStrategy: 'four replicas', supportsCpuOffload: true,
    sourceUrl: cogVideo, notes: 'The model-owner recommended precision. The published multi-GPU memory figure depends on Diffusers optimizations and was tested on A100/H100, not every listed GPU.',
  },

  {
    id: 'wan21-t2v-14b-q4', modelId: 'wan21-t2v-14b', precision: 'Q4', format: 'bitsandbytes NF4 (transformer + text encoder)',
    availability: 'official runtime recipe', available: true, runtime: 'Diffusers',
    weightPayloadGb: null, payloadBasis: 'runtime quantization; no fixed artifact', planningVramGb: 28,
    minimumComputeCapability: 8, requiresNativeBf16: true, fourGpuStrategy: 'FSDP + sequence parallel', supportsCpuOffload: true,
    sourceUrl: diffusersVideo, notes: 'Current Diffusers documentation includes a model-specific Wan2.1 14B 4-bit recipe. It still computes in BF16 and therefore excludes V100 despite NF4 kernels themselves supporting older GPUs.',
  },
  {
    id: 'wan21-t2v-14b-q8', modelId: 'wan21-t2v-14b', precision: 'Q8', format: 'bitsandbytes LLM.int8 (eligible linear layers)',
    availability: 'framework-supported', available: true, runtime: 'Diffusers',
    weightPayloadGb: null, payloadBasis: 'runtime quantization; no fixed artifact', planningVramGb: 48,
    minimumComputeCapability: 8, requiresNativeBf16: true, fourGpuStrategy: 'FSDP + sequence parallel', supportsCpuOffload: true,
    sourceUrl: diffusersQuantization, notes: 'The same Diffusers components meet the framework’s generic 8-bit requirements, but no model-specific Wan Q8 recipe or exact four-GPU benchmark was located. Treat this lane as conditional.',
  },
  unavailable('wan21-t2v-14b-fp16', 'wan21-t2v-14b', 'FP16', 'No owner-verified FP16 path', wan, 'Wan2.1 14B is published and documented as BF16. An FP16 cast is not recorded as supported merely because the byte width is the same.'),
  {
    id: 'wan21-t2v-14b-bf16', modelId: 'wan21-t2v-14b', precision: 'BF16', format: 'Diffusers sharded safetensors / BF16',
    availability: 'official checkpoint', available: true, runtime: 'Official Wan FSDP + xDiT USP',
    weightPayloadGb: 80.385, payloadBasis: 'published repository files', planningVramGb: 92,
    minimumComputeCapability: 8, requiresNativeBf16: true, fourGpuStrategy: 'FSDP + sequence parallel', supportsCpuOffload: true,
    sourceUrl: wan, notes: 'Payload includes the transformer, UMT5 encoder, and VAE once. Four-way Ulysses is structurally valid because the model has 40 attention heads, but the owner publishes an eight-GPU command rather than a measured TP4 result.',
  },
];

const computeCapabilityByClusterId: Record<string, number> = {
  'dgx-spark-4': 12.1,
  'rtx3090-quad': 8.6,
  'rtx4090-quad': 8.9,
  'rtx5090-quad': 12,
  'rtx-pro-5000-blackwell-quad': 12,
  'rtx-pro-6000-blackwell-maxq-quad': 12,
  'v100-sxm2-quad': 7,
  'dgx-station-a100': 8,
  'hgx-a800-4': 8,
  'h200-nvl-4': 9,
};

const fourGpuClusterIds = Object.keys(computeCapabilityByClusterId);

export const fourGpuModelClusters: FourGpuModelCluster[] = fourGpuClusterIds.map((id) => {
  const cluster = enterpriseClusters.find((candidate) => candidate.id === id);
  if (!cluster || cluster.gpuCount !== 4) throw new Error(`Missing exact four-GPU cluster profile: ${id}`);
  const computeCapability = computeCapabilityByClusterId[id];
  return {
    id: cluster.id, name: cluster.name, architecture: cluster.architecture, gpuCount: 4,
    vramPerGpuGb: cluster.gpuMemoryGb, totalVramGb: cluster.totalGpuMemoryGb,
    computeCapability, nativeBf16: computeCapability >= 8, fabric: cluster.fabric, sourceUrl: cluster.sourceUrl,
  };
});

function compatibilityFor(format: AiModelFormat, cluster: FourGpuModelCluster): FourGpuModelCompatibility {
  const reserveVramPerGpuGb = Math.max(4, Math.ceil(cluster.vramPerGpuGb * 0.15));
  const usableVramPerGpuGb = cluster.vramPerGpuGb - reserveVramPerGpuGb;
  const usableClusterVramGb = usableVramPerGpuGb * cluster.gpuCount;
  const base = {
    modelId: format.modelId, formatId: format.id, clusterId: cluster.id,
    usableVramPerGpuGb, usableClusterVramGb, strategy: format.fourGpuStrategy,
  };

  if (!format.available) return { ...base, status: 'unsupported' as const, reason: format.notes };
  if (cluster.computeCapability < format.minimumComputeCapability) {
    return { ...base, status: 'unsupported' as const, reason: `${format.format} requires compute capability ${format.minimumComputeCapability}+; this cluster is ${cluster.computeCapability}.` };
  }
  if (format.requiresNativeBf16 && !cluster.nativeBf16) {
    return { ...base, status: 'unsupported' as const, reason: `${format.format} requires native BF16 execution; ${cluster.architecture} does not provide it.` };
  }
  if (format.planningVramGb === null) {
    return { ...base, status: 'conditional' as const, reason: 'The runtime path exists, but no defensible complete-pipeline VRAM planning figure was found.' };
  }
  if (format.fourGpuStrategy === 'four replicas' && format.planningVramGb > cluster.vramPerGpuGb) {
    if (!format.supportsCpuOffload) {
      return { ...base, status: 'unsupported' as const, reason: `${format.planningVramGb}GB planning VRAM exceeds the physical ${cluster.vramPerGpuGb}GB per GPU and this path has no supported offload.` };
    }
    return { ...base, status: 'conditional' as const, reason: `${format.planningVramGb}GB exceeds the physical ${cluster.vramPerGpuGb}GB per GPU; it needs CPU offload or component sharding instead of four full replicas.` };
  }
  if (format.planningVramGb > cluster.totalVramGb) {
    if (!format.supportsCpuOffload) {
      return { ...base, status: 'unsupported' as const, reason: `${format.planningVramGb}GB planning VRAM exceeds the cluster's ${cluster.totalVramGb}GB physical VRAM.` };
    }
    return { ...base, status: 'conditional' as const, reason: `${format.planningVramGb}GB exceeds the cluster's ${cluster.totalVramGb}GB physical VRAM; CPU offload is required and will materially reduce speed.` };
  }

  const tightMargin = format.fourGpuStrategy === 'four replicas'
    ? format.planningVramGb > usableVramPerGpuGb
    : format.planningVramGb > usableClusterVramGb;
  const frameworkOnly = format.availability === 'framework-supported';
  const status: FourGpuFitStatus = tightMargin || frameworkOnly ? 'conditional' : 'fits';
  const evidenceQualifier = frameworkOnly ? 'The format is framework-supported rather than an owner-published checkpoint. ' : '';
  return {
    ...base, status,
    reason: `${evidenceQualifier}${format.planningVramGb}GB planning VRAM fits in the ${format.fourGpuStrategy === 'four replicas' ? `${cluster.vramPerGpuGb}GB physical per-GPU pool` : `${cluster.totalVramGb}GB physical cluster total`}${tightMargin ? ` but crosses the conservative ${format.fourGpuStrategy === 'four replicas' ? `${usableVramPerGpuGb}GB per-GPU` : `${usableClusterVramGb}GB cluster`} reserve line` : ''}. Use ${format.fourGpuStrategy}; this is a capacity/support result, not a measured speed claim.`,
  };
}

export const fourGpuModelCompatibility: FourGpuModelCompatibility[] = fourGpuModelClusters.flatMap((cluster) => (
  aiModelFormats.map((format) => compatibilityFor(format, cluster))
));

export const modelFormatSemantics = [
  { label: 'LLM Q4 / Q8', detail: 'GGUF Q4_K_M and Q8_0 are stored checkpoint encodings used here by llama.cpp.' },
  { label: 'Diffusion Q4', detail: 'NF4 is runtime quantization of eligible Linear layers; the VAE and some encoders remain higher precision.' },
  { label: 'Diffusion Q8', detail: 'INT8/LLM.int8 or TorchAO weight-only quantization is not byte-identical to GGUF Q8_0.' },
  { label: 'FP16 / BF16', detail: 'Both store two bytes per value, but BF16 needs native hardware/runtime support and usually has better numerical range.' },
];

export const modelSupportCatalog: AiModelCompatibilityCatalog = {
  models: aiModelProfiles,
  formats: aiModelFormats,
  clusters: fourGpuModelClusters,
  compatibility: fourGpuModelCompatibility,
  meta: {
    modelCount: aiModelProfiles.length,
    formatCount: aiModelFormats.length,
    clusterCount: fourGpuModelClusters.length,
    compatibilityCount: fourGpuModelCompatibility.length,
    observedAt: '2026-08-13',
    methodology: 'Exact four-GPU hardware profiles; 15% or 4GB per-GPU runtime reserve; owner/framework format support; no synthetic performance estimates.',
  },
};
