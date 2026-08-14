import type { AiModelCompatibilityCatalog } from '../data/model-format-support';
import type { BuildSelection, CatalogResponse, ValidationResult } from '../types';

async function json<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export function fetchCatalog() {
  return json<CatalogResponse>('/api/catalog');
}

export function validateSelection(selection: BuildSelection) {
  return json<ValidationResult>('/api/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selection }),
  });
}

export function fetchCompatible(selection: BuildSelection) {
  const params = new URLSearchParams();
  Object.entries(selection).forEach(([key, value]) => value && params.set(key, value));
  return json<{ compatibleIds: Record<string, string[]>; validation: ValidationResult }>(`/api/compatible?${params}`);
}

export function fetchAiModelCompatibility() {
  return json<AiModelCompatibilityCatalog>('/api/ai-model-compatibility');
}
