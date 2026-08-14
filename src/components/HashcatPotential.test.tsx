// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { getProducts } from '../../server/database';
import { HashcatPotential } from './HashcatPotential';

afterEach(cleanup);

const products = getProducts();

describe('HashcatPotential', () => {
  it('renders independent generic Argon2 and Tails LUKS2 ratings with a V100 evidence boundary', () => {
    render(<HashcatPotential products={products} />);
    expect(screen.getByText('Generic Argon2id performance')).toBeTruthy();
    expect(screen.getByText('Tails LUKS2 guesses per second by GPU')).toBeTruthy();
    expect(screen.getByText(/Tesla V100 PCIe 16 GB: 11 H\/s/i)).toBeTruthy();
    expect(screen.getAllByText(/11:11:11 H\/s/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/V100 32 GB · MODE-34100 CAPACITY MODEL/i)).toBeTruthy();
    expect(screen.getByText(/No direct public Hashcat mode-34100 V100 32 GB result found/i)).toBeTruthy();
    expect(screen.getByText(/22\.7 H\/s · 1,961,280\/day/i)).toBeTruthy();
    expect(screen.getAllByText(/≈1,521 H\/s/).length).toBeGreaterThan(0);
    expect(screen.getByText(/4,050 H\/s\/GPU/)).toBeTruthy();
    expect(screen.getByText(/2,175 H\/s\/GPU/)).toBeTruthy();
    expect(screen.getByText(/318\.9 kH\/s bcrypt cost 5/i)).toBeTruthy();
    expect(screen.getByText(/older Hashcat build predates Argon2 support/i)).toBeTruthy();
    expect(screen.getByText(/Every V100 Argon2 candidate/i)).toBeTruthy();
    expect(screen.getByText(/Reddit · eso_logic V100 owner lab/i)).toBeTruthy();
    expect(screen.getByText(/no first-person Reddit post in this search supplied a V100 mode-34000 or mode-34100 output/i)).toBeTruthy();
    expect(screen.getByText(/What people have actually used V100s for/i)).toBeTruthy();
    expect(screen.getByText(/116\.4 TFLOP\/s/i)).toBeTruthy();
    expect(screen.getAllByText(/Current exact-profile result still missing/i).length).toBe(2);
  });

  it('renders the complete requested scope and separates evidence tiers', () => {
    render(<HashcatPotential products={products} />);
    expect(screen.getByText('Literal hash power per dollar, from top to bottom.')).toBeTruthy();
    expect(screen.getByText('84')).toBeTruthy();
    expect(screen.getByText('complete requested scope')).toBeTruthy();
    expect(screen.getByText(/unpriced boards remain visible/i)).toBeTruthy();
    expect(screen.getAllByText('Exact measured').length).toBeGreaterThan(10);
    expect(screen.getAllByText('Family proxy').length).toBeGreaterThan(10);
    expect(screen.getAllByText('Architecture estimate').length).toBeGreaterThan(5);
  });

  it('includes 3090, 4090, V100, 40, 48, 72, and 96 GB rows', () => {
    render(<HashcatPotential products={products} vendorScope="NVIDIA" />);
    const table = within(screen.getByRole('list'));
    expect(table.getByText('GeForce RTX 3090 Founders Edition')).toBeTruthy();
    expect(table.getByText('GeForce RTX 4090 Founders Edition')).toBeTruthy();
    expect(table.getByText('Tesla V100 PCIe 32GB')).toBeTruthy();
    expect(table.getByText('A100 PCIe 40GB')).toBeTruthy();
    expect(table.getByText('RTX PRO 5000 Blackwell 48GB')).toBeTruthy();
    expect(table.getByText('RTX PRO 5000 Blackwell 72GB')).toBeTruthy();
    expect(table.getByText('RTX PRO 6000 Blackwell Workstation Edition')).toBeTruthy();
  });

  it('uses the literal score and includes smaller mainstream GPUs', () => {
    render(<HashcatPotential products={products} />);
    const table = within(screen.getByRole('list'));
    expect(table.getByText('GeForce RTX 4070 SUPER Founders Edition')).toBeTruthy();
    expect(table.getByText('GeForce RTX 5080 Founders Edition')).toBeTruthy();
    expect(screen.getByText(/140 literally means 140 GH\/s per \$1,000/i)).toBeTruthy();
    expect(screen.queryByText('best available = 100')).toBeNull();
  });

  it('keeps concurrency capacity separate from compact-hash throughput', () => {
    render(<HashcatPotential products={products} />);
    expect(screen.queryByRole('option', { name: 'Hash power per watt' })).toBeNull();
    expect(screen.getByText(/Electricity cost, board wattage, VRAM, and concurrent-job capacity do not enter that score/i)).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Addressable VRAM per dollar' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Concurrent job headroom' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Concurrent job VRAM footprint'), { target: { value: '16' } });
    expect(screen.getAllByText(/16 GB planning jobs/i).length).toBeGreaterThan(0);
  });

  it('switches hash modes and filters exact 96 GB boards', () => {
    render(<HashcatPotential products={products} vendorScope="NVIDIA" />);
    fireEvent.click(screen.getByRole('tab', { name: /bcrypt cost 5/i }));
    expect(screen.getAllByText('317.6 kH/s').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Hashcat evidence quality'), { target: { value: 'measured-exact' } });
    fireEvent.change(screen.getByLabelText('Hashcat VRAM class'), { target: { value: '96' } });
    const table = within(screen.getByRole('list'));
    expect(table.getByText('RTX PRO 6000 Blackwell Workstation Edition')).toBeTruthy();
    expect(table.getByText('RTX PRO 6000 Blackwell Server Edition')).toBeTruthy();
    expect(table.queryByText('RTX PRO 6000 Blackwell Max-Q Workstation Edition')).toBeNull();
  });

  it('switches verified seller pools and excludes the sold-out Best Buy MSRP page', () => {
    render(<HashcatPotential products={products} vendorScope="NVIDIA" />);
    fireEvent.change(screen.getByLabelText('Hashcat price source'), { target: { value: 'Best Buy' } });
    const rtx5090 = screen.getAllByText('GeForce RTX 5090 Founders Edition')
      .map((element) => element.closest('li'))
      .find((element): element is HTMLLIElement => element !== null);
    expect(rtx5090).toBeTruthy();
    expect(within(rtx5090 as HTMLElement).getByText('$4,330')).toBeTruthy();
    expect(within(rtx5090 as HTMLElement).queryByText('$2,000')).toBeNull();
    expect(within(rtx5090 as HTMLElement).getByText(/78\.55/)).toBeTruthy();
  });
});
