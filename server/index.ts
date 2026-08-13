import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BuildSelection, BuilderCategory, CatalogResponse, Category } from '../src/types.js';
import { compatibleIdsFor, validateBuild } from './compatibility.js';
import { db, dbInfo, getProducts } from './database.js';

const app = express();
const port = Number(process.env.PORT ?? 4174);
const serverDir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(serverDir, '../dist');
const categories: Category[] = ['cpu', 'motherboard', 'gpu', 'ram', 'mini-pc', 'server-system'];
const builderCategories: BuilderCategory[] = ['cpu', 'motherboard', 'gpu', 'ram'];

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  const row = db.prepare('SELECT COUNT(*) AS count FROM products').get() as { count: number };
  const serverRow = db.prepare('SELECT COUNT(*) AS count FROM server_systems').get() as { count: number };
  response.json({ ok: true, products: row.count + serverRow.count, database: dbInfo.path });
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
