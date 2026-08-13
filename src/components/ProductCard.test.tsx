// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { benchmarkSeeds } from '../../server/benchmarks';
import { allProducts } from '../../server/catalog';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

afterEach(cleanup);

function productWithBenchmarks(productId: string): Product {
  const product = allProducts.find((item) => item.id === productId);
  if (!product) throw new Error(`Missing fixture ${productId}`);
  return {
    ...product,
    benchmarks: benchmarkSeeds.filter((result) => result.productId === productId),
  } as Product;
}

describe('ProductCard benchmarks', () => {
  it('shows both CPU aggregate scores and their source context', () => {
    render(<ProductCard product={productWithBenchmarks('amd-threadripper-pro-9995wx')} />);
    expect(screen.getByText('171,200')).toBeTruthy();
    expect(screen.getByText('4,542')).toBeTruthy();
    expect(screen.getByText('Benchmark context & sources')).toBeTruthy();
  });

  it('shows compute coverage for a data-center GPU without inventing a G3D result', () => {
    render(<ProductCard product={productWithBenchmarks('nvidia-h100-pcie-80')} />);
    expect(screen.getByText('277,842')).toBeTruthy();
    expect(screen.getByText('OpenCL compute')).toBeTruthy();
    expect(screen.queryByText('G3D graphics')).toBeNull();
  });

  it('distinguishes an untested accelerator from a zero score', () => {
    render(<ProductCard product={productWithBenchmarks('amd-instinct-mi210')} />);
    expect(screen.getByText('No comparable published score')).toBeTruthy();
    expect(screen.getByText('Untested is not zero')).toBeTruthy();
  });

  it('flags sparse submitted results', () => {
    render(<ProductCard product={productWithBenchmarks('nvidia-tesla-v100-pcie-32')} />);
    expect(screen.getByText('LOW N')).toBeTruthy();
  });

  it('shows Optane compatibility and local-inference rank on Xeon cards', () => {
    render(<ProductCard product={productWithBenchmarks('intel-xeon-platinum-8380')} />);
    expect(screen.getByText('#2 / 110')).toBeTruthy();
    expect(screen.getByText('PMem 200 · Intel-listed')).toBeTruthy();
    expect(screen.getByText('No native AVX-512 BF16')).toBeTruthy();
  });
});
