// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { allProducts } from '../../server/catalog';
import { llmBenchmarkSeeds } from '../../server/llm-benchmarks';
import type { LlmBenchmarkResult, Product } from '../types';
import { ApplesLlmScoreSummary } from './ApplesLlmScoreSummary';

afterEach(cleanup);

const measurements = new Map(llmBenchmarkSeeds.map(({ productId, ...result }) => [productId, result]));
const productsWithMeasurements = allProducts.map((product): Product => {
  const benchmark = measurements.get(product.id);
  return benchmark ? { ...product, llmBenchmarks: [benchmark as LlmBenchmarkResult] } as Product : product;
});

describe('ApplesLlmScoreSummary', () => {
  it('discloses the exact cohort, formula, and remaining variation', () => {
    render(<ApplesLlmScoreSummary products={productsWithMeasurements} />);
    expect(screen.getByRole('heading', { name: 'AI card scores: speed and price.' })).toBeTruthy();
    expect(screen.getByText('34')).toBeTruthy();
    expect(screen.getByText('2/24')).toBeTruthy();
    expect(screen.getByText('24/10')).toBeTruthy();
    expect(screen.getByText('42.5% performance + 42.5% value/$ + 15% VRAM')).toBeTruthy();
    expect(screen.getByText(/speed and price stay evenly weighted/i)).toBeTruthy();
    expect(screen.getByText(/native backend, runtime, host/i)).toBeTruthy();
  });
});
