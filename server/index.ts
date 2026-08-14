import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BuildSelection, BuildSpec, BuilderCategory, CatalogResponse, Category } from '../src/types.js';
import { compatibleIdsFor, validateBuild } from './compatibility.js';
import { auditHomelabBuild, calculateModelFit, calculatePowerPlan, electricalProfiles, modelProfiles } from './homelab.js';
import {
  db,
  dbInfo,
  getAiModelCompatibilityCatalog,
  getArgon2DatabaseResults,
  getProducts,
  getTailsLuks2DatabaseResults,
} from './database.js';

const app = express();
const port = Number(process.env.PORT ?? 4174);
const serverDir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(serverDir, '../dist');
const categories: Category[] = [
  'cpu', 'motherboard', 'gpu', 'ram', 'mini-pc', 'server-system',
  'psu', 'chassis', 'cooler', 'storage', 'nic', 'apple-system',
];
const builderCategories: BuilderCategory[] = ['cpu', 'motherboard', 'gpu', 'ram'];

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, products: getProducts().length, schemaVersion: 2, database: dbInfo.path });
});

app.get('/api/catalog', (request, response) => {
  const requestedCategory = typeof request.query.category === 'string' ? request.query.category : undefined;
  const search = typeof request.query.search === 'string' ? request.query.search.trim().toLowerCase() : '';
  let products = getProducts();

  if (requestedCategory && categories.includes(requestedCategory as Category)) {
    products = products.filter((product) => product.category === requestedCategory);
  }
  if (search) {
    products = products.filter((product) =>
      [product.name, product.manufacturer, product.description, ...product.tags]
        .join(' ').toLowerCase().includes(search),
    );
  }

  const all = getProducts();
  const benchmarkMeta = db.prepare(`SELECT COUNT(*) AS results,
    COUNT(DISTINCT product_id) AS products, MAX(observed_at) AS last_updated
    FROM benchmark_results`).get() as { results: number; products: number; last_updated: string | null };
  const payload: CatalogResponse = {
    products,
    meta: {
      total: all.length,
      counts: Object.fromEntries(categories.map((category) => [category, all.filter((p) => p.category === category).length])) as Record<Category, number>,
      lastUpdated: all.map((product) => product.price.observedAt).sort().at(-1) ?? '',
      benchmarks: {
        results: benchmarkMeta.results,
        products: benchmarkMeta.products,
        lastUpdated: benchmarkMeta.last_updated ?? '',
      },
    },
  };
  response.json(payload);
});

app.get('/api/ai-model-compatibility', (request, response) => {
  const modality = typeof request.query.modality === 'string' ? request.query.modality : '';
  const precision = typeof request.query.precision === 'string' ? request.query.precision : '';
  const clusterId = typeof request.query.cluster === 'string' ? request.query.cluster : '';
  const catalog = getAiModelCompatibilityCatalog();
  const models = modality ? catalog.models.filter((model) => model.modality === modality) : catalog.models;
  const modelIds = new Set(models.map((model) => model.id));
  const formats = catalog.formats.filter((format) => (
    modelIds.has(format.modelId) && (!precision || format.precision === precision)
  ));
  const formatIds = new Set(formats.map((format) => format.id));
  const clusters = clusterId ? catalog.clusters.filter((cluster) => cluster.id === clusterId) : catalog.clusters;
  const clusterIds = new Set(clusters.map((cluster) => cluster.id));
  const compatibility = catalog.compatibility.filter((result) => (
    formatIds.has(result.formatId) && clusterIds.has(result.clusterId)
  ));
  response.json({
    models, formats, clusters, compatibility,
    meta: {
      ...catalog.meta,
      modelCount: models.length,
      formatCount: formats.length,
      clusterCount: clusters.length,
      compatibilityCount: compatibility.length,
    },
  });
});

app.get('/api/hashcat-argon2', (_request, response) => {
  const results = getArgon2DatabaseResults();
  response.json({
    results,
    meta: {
      profileKey: 'argon2-rfc9106-mode-34000',
      resultCount: results.length,
      measuredCount: results.filter((result) => result.evidence !== 'bandwidth-model').length,
      modeledCount: results.filter((result) => result.evidence === 'bandwidth-model').length,
    },
  });
});

app.get('/api/hashcat-luks2', (_request, response) => {
  const results = getTailsLuks2DatabaseResults();
  response.json({
    results,
    meta: {
      profileKey: 'tails-luks2-mode-34100',
      resultCount: results.length,
      directOrMeanCount: results.filter((result) => result.evidence !== 'hardware-qualified').length,
      hardwareQualifiedCount: results.filter((result) => result.evidence === 'hardware-qualified').length,
    },
  });
});

app.post('/api/validate', (request, response) => {
  const selection = (request.body?.selection ?? {}) as BuildSelection;
  response.json(validateBuild(selection, getProducts()));
});

app.get('/api/compatible', (request, response) => {
  const selection = Object.fromEntries(
    builderCategories
      .filter((category) => typeof request.query[category] === 'string')
      .map((category) => [category, request.query[category]]),
  ) as BuildSelection;
  const products = getProducts();
  response.json({
    compatibleIds: Object.fromEntries(builderCategories.map((category) => [category, compatibleIdsFor(category, selection, products)])),
    validation: validateBuild(selection, products),
  });
});

app.get('/api/v2/products', (request, response) => {
  const category = typeof request.query.category === 'string' ? request.query.category : '';
  const search = typeof request.query.search === 'string' ? request.query.search.trim().toLowerCase() : '';
  const limit = Math.max(1, Math.min(250, Number(request.query.limit ?? 100)));
  const offset = Math.max(0, Number(request.query.offset ?? 0));
  let products = getProducts();
  if (category && categories.includes(category as Category)) products = products.filter((candidate) => candidate.category === category);
  if (search) products = products.filter((candidate) => (
    [candidate.name, candidate.manufacturer, candidate.description, ...candidate.tags].join(' ').toLowerCase().includes(search)
  ));
  response.json({
    schemaVersion: 2,
    products: products.slice(offset, offset + limit),
    meta: { total: products.length, limit, offset, hasMore: offset + limit < products.length },
  });
});

app.get('/api/v2/products/:id', (request, response) => {
  const found = getProducts().find((candidate) => candidate.id === request.params.id);
  if (!found) { response.status(404).json({ error: 'Product not found' }); return; }
  response.json({ schemaVersion: 2, product: found });
});

app.post('/api/v2/builds/validate', (request, response) => {
  const spec = request.body?.spec as BuildSpec | undefined;
  if (!spec) { response.status(400).json({ error: 'A build spec is required' }); return; }
  response.json(auditHomelabBuild(spec, getProducts()));
});

app.post('/api/v2/model-fit', (request, response) => {
  const spec = request.body?.spec as BuildSpec | undefined;
  if (!spec) { response.status(400).json({ error: 'A build spec is required' }); return; }
  response.json(calculateModelFit(spec, getProducts()));
});

app.post('/api/v2/power-plan', (request, response) => {
  const spec = request.body?.spec as BuildSpec | undefined;
  if (!spec) { response.status(400).json({ error: 'A build spec is required' }); return; }
  response.json(calculatePowerPlan(spec, getProducts()));
});

app.get('/api/v2/benchmark-profiles', (_request, response) => {
  response.json({
    schemaVersion: 2,
    models: modelProfiles,
    electricalProfiles,
    benchmarkContract: {
      engine: 'llama.cpp', tool: 'llama-bench', promptTokens: 512, generatedTokens: 128,
      repetitions: 5, requiredOutput: 'json', separateNativeRuntimeResults: true,
    },
  });
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((request, response, next) => {
    if (request.method === 'GET' && !request.path.startsWith('/api/')) {
      response.sendFile(resolve(distDir, 'index.html'));
      return;
    }
    next();
  });
}

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Forge API ready at http://localhost:${port}`);
  console.log(`SQLite catalog: ${dbInfo.path}`);
});
