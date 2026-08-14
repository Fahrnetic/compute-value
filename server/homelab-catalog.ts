import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Product } from '../src/types.js';

const serverDir = dirname(fileURLToPath(import.meta.url));
const catalogPath = resolve(serverDir, '../data/catalog/homelab-products.json');

function loadCatalog(): Product[] {
  const value = JSON.parse(readFileSync(catalogPath, 'utf8')) as unknown;
  if (!Array.isArray(value)) throw new Error('Homelab catalog must contain an array');

  const ids = new Set<string>();
  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') throw new Error('Homelab catalog contains a non-object record');
    const record = candidate as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.category !== 'string' || typeof record.name !== 'string') {
      throw new Error('Homelab catalog record is missing id, category, or name');
    }
    if (ids.has(record.id)) throw new Error(`Duplicate homelab product id: ${record.id}`);
    ids.add(record.id);
  }
  return value as Product[];
}

export const homelabProducts = loadCatalog();
