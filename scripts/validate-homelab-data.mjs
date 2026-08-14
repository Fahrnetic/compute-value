import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const catalogPath = resolve('data/catalog/homelab-products.json');
const records = JSON.parse(readFileSync(catalogPath, 'utf8'));
const categories = new Set(['cpu', 'motherboard', 'gpu', 'ram', 'mini-pc', 'server-system', 'psu', 'chassis', 'cooler', 'storage', 'nic', 'apple-system']);
const ids = new Set();
const errors = [];

if (!Array.isArray(records)) errors.push('Catalog root must be an array');

for (const [index, record] of records.entries()) {
  const location = `record ${index + 1}`;
  if (!record || typeof record !== 'object') { errors.push(`${location}: must be an object`); continue; }
  if (!/^[a-z0-9][a-z0-9-]+$/.test(record.id ?? '')) errors.push(`${location}: invalid id`);
  if (ids.has(record.id)) errors.push(`${location}: duplicate id ${record.id}`);
  ids.add(record.id);
  if (!categories.has(record.category)) errors.push(`${location}: unsupported category ${record.category}`);
  for (const field of ['manufacturer', 'name', 'description', 'specSourceUrl']) {
    if (typeof record[field] !== 'string' || !record[field]) errors.push(`${location}: missing ${field}`);
  }
  if (!String(record.specSourceUrl ?? '').startsWith('https://')) errors.push(`${location}: specSourceUrl must use HTTPS`);
  if (!Array.isArray(record.tags) || !record.tags.length) errors.push(`${location}: tags must be a non-empty array`);
  if (!record.price || !Number.isInteger(record.price.amountCents) || record.price.amountCents < 0) errors.push(`${location}: invalid price`);
  if (record.price?.currency !== 'USD') errors.push(`${location}: currency must be USD`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.price?.observedAt ?? '')) errors.push(`${location}: observedAt must be YYYY-MM-DD`);
  if (!String(record.price?.sourceUrl ?? '').startsWith('https://')) errors.push(`${location}: price sourceUrl must use HTTPS`);
  if (record.category === 'apple-system' && record.unifiedMemoryGb < 128) errors.push(`${location}: Apple systems must have at least 128 GB`);
  if (record.category === 'motherboard' && record.pcieSlots) {
    for (const slot of record.pcieSlots) {
      if (slot.electricalLanes > slot.physicalLanes) errors.push(`${location}: ${slot.id} electrical width exceeds physical width`);
    }
  }
}

if (errors.length) {
  console.error(`Homelab data validation failed (${errors.length} errors)`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const categoryCount = new Set(records.map((record) => record.category)).size;
console.log(`Validated ${records.length} homelab products across ${categoryCount} categories.`);
