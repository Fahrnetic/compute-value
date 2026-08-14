// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EnterpriseClusters } from './EnterpriseClusters';

afterEach(cleanup);

describe('EnterpriseClusters', () => {
  it('renders the universal control without presenting node results as pod totals', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('When price stops', { exact: false })).toBeTruthy();
    expect(screen.getAllByText('31,306.8 tok/s').length).toBeGreaterThan(0);
    expect(screen.getAllByText('34,988.2 tok/s').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Full-cluster aggregate intentionally unmeasured').length).toBeGreaterThan(0);
    expect(screen.queryByText('4,443,501.4 tok/s')).toBeNull();
  });

  it('filters the complete catalog by generation and system scale', () => {
    const { container } = render(<EnterpriseClusters />);
    const catalog = within(container.querySelector('.cluster-catalog')!);
    fireEvent.click(screen.getByRole('button', { name: 'A800' }));
    expect(catalog.getByText('2 enterprise options')).toBeTruthy();
    expect(catalog.getByText('HGX A800 · 4× 80GB baseboard')).toBeTruthy();
    expect(catalog.getByText('HGX A800 · 8× 80GB NVSwitch node')).toBeTruthy();

    fireEvent.change(screen.getByDisplayValue('All scales'), { target: { value: 'baseboard' } });
    expect(catalog.getByText('1 enterprise options')).toBeTruthy();
    expect(catalog.queryByText('HGX A800 · 8× 80GB NVSwitch node')).toBeNull();
  });

  it('labels power as an inverse metric', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('Power: lower is better')).toBeTruthy();
    expect(screen.getByText(/down arrow warns that a larger number is worse/i)).toBeTruthy();
  });

  it('renders the owner route score, universal 70B ranges, system cost, and power-limit evidence', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('One score for the decision—not one fake benchmark.')).toBeTruthy();
    const routeTable = within(screen.getByRole('table', { name: 'Large-model AI route scores' }));
    expect(routeTable.getAllByRole('row')).toHaveLength(19);
    expect(routeTable.getByText('4× Tesla V100 32GB SXM2 baseboard')).toBeTruthy();
    expect(routeTable.getAllByText('28–40.7 tok/s').length).toBeGreaterThan(0);
    expect(routeTable.getAllByText('$7k–$14k').length).toBeGreaterThan(0);
    expect(screen.getByText('How far can the cards be capped?')).toBeTruthy();
    expect(screen.getByText('250W evidence-backed sweet spot; test 220W if the circuit requires it')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Lowest cost' }));
    const firstRoute = routeTable.getAllByRole('row')[1];
    expect(within(firstRoute).getByText('1× RTX PRO 5000 Blackwell 48GB')).toBeTruthy();
  });

  it('shows complete-system cost on all enterprise catalog cards', () => {
    render(<EnterpriseClusters />);
    expect(screen.getAllByText('Complete-system acquisition')).toHaveLength(26);
    expect(screen.getAllByText('Complete-system cost').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('$400k–$500k').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$60M–$83M').length).toBeGreaterThan(0);
  });

  it('shows the residential-outlet assumption and a verdict on every configuration', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('Can it run from a normal 120V outlet?')).toBeTruthy();
    expect(screen.getByText('1,440W')).toBeTruthy();
    expect(screen.getByText('YES / DEDICATED CIRCUIT')).toBeTruthy();
    expect(screen.getAllByText('Regular U.S. house outlet?')).toHaveLength(26);
    expect(screen.getAllByText('Yes — dedicated circuit')).toHaveLength(4);
    expect(screen.getAllByText('Not confirmed')).toHaveLength(1);
  });

  it('renders official TP1, TP2, and TP4 scaling while leaving TP3 unmeasured', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('CROSS-NODE TENSOR PARALLELISM / MEASURED')).toBeTruthy();
    expect(screen.getByText('3.72 tok/s')).toBeTruthy();
    expect(screen.getAllByText('7.52 tok/s derived').length).toBeGreaterThan(0);
    expect(screen.getAllByText('13.89 tok/s derived').length).toBeGreaterThan(0);
    expect(screen.getByText('2.02× / 101.1%')).toBeTruthy();
    expect(screen.getByText('3.74× / 93.4%')).toBeTruthy();
    expect(screen.queryByText('TP3 cross-node')).toBeNull();
  });

  it('date-stamps current Spark facts separately from historical benchmark snapshots', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('DGX OS 7.5.0')).toBeTruthy();
    expect(screen.getByText('Driver 580.159.03 · CUDA 13.0.2')).toBeTruthy();
    expect(screen.getByText('2–4 nodes')).toBeTruthy();
    expect(screen.getByText('189.85 / 200 Gb/s')).toBeTruthy();
    expect(screen.getByText('Mar 16, 2026 snapshot')).toBeTruthy();
    expect(screen.getByText('not identified as an OS 7.5 retest')).toBeTruthy();
  });

  it('shows the separate dual-Spark Qwen capacity proof without inventing its parallelism mode', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('Dual Spark · Qwen3 235B NVFP4')).toBeTruthy();
    expect(screen.getByText('23,477.03 tok/s')).toBeTruthy();
    expect(screen.getByText('11.73 tok/s')).toBeTruthy();
    expect(screen.getByText(/does not publish the TP\/PP setting/i)).toBeTruthy();
  });

  it('renders the requested four-GPU PCIe comparison with exact capacity and power scopes', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('PCIe generation is the ceiling—not the guarantee.')).toBeTruthy();
    expect(screen.getAllByText('4× GeForce RTX 3090 · paired NVLink').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('4× GeForce RTX 4090 · PCIe cluster').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('4× GeForce RTX 5090 · PCIe 5 cluster').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('4× RTX PRO 5000 Blackwell · 48GB').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('4× RTX PRO 6000 Blackwell Max-Q · 96GB').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('PCIe 4.0 x16')).toHaveLength(2);
    expect(screen.getAllByText('PCIe 5.0 x16')).toHaveLength(3);
    expect(screen.getAllByText('1.2 kW').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('2.3 kW').length).toBeGreaterThanOrEqual(1);
  });

  it('labels the four-card benchmark observations as non-comparable and leaves the 48GB gap empty', () => {
    render(<EnterpriseClusters />);
    expect(screen.getAllByText(/BEST LOCATED FOUR-CARD LLM EVIDENCE · NOT CROSS-COMPARABLE/i)).toHaveLength(4);
    expect(screen.getByText('No reproducible 4× RTX PRO 5000 inference result found')).toBeTruthy();
    expect(screen.getAllByText('20.3 tok/s').length).toBeGreaterThan(0);
    expect(screen.getAllByText('97.5 tok/s').length).toBeGreaterThan(0);
    expect(screen.getAllByText('39.2 tok/s').length).toBeGreaterThan(0);
  });

  it('renders a complete apples-to-apples raw-compute roofline without filling measured gaps', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('One model contract. Raw compute for every cluster.')).toBeTruthy();
    expect(screen.getByText('26/26')).toBeTruthy();
    expect(screen.getByText('38.87GB GGUF')).toBeTruthy();

    const table = within(screen.getByRole('table', { name: 'Raw compute roofline for every enterprise cluster' }));
    expect(table.getAllByRole('row')).toHaveLength(27);
    expect(table.getByText('838 TFLOPS')).toBeTruthy();
    expect(table.getAllByText('1.005 EFLOPS')).toHaveLength(2);
    expect(table.getAllByText('184.4 tok/s')).toHaveLength(2);
    expect(table.getByText('125,464.4 tok/s')).toBeTruthy();
    expect(table.getAllByText(/dense derived\*/)).toHaveLength(4);
    expect(table.getAllByText('Needs fixed run')).toHaveLength(17);
    expect(table.getAllByText(/\/ node$/)).toHaveLength(6);
  });

  it('exposes raw roofline and dense tensor compute as catalog sort modes', () => {
    render(<EnterpriseClusters />);
    expect(screen.getByText('Raw Q4 decode ceiling')).toBeTruthy();
    expect(screen.getByText('Dense FP16 tensor compute')).toBeTruthy();
  });
});
