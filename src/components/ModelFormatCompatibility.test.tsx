// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ModelFormatCompatibility } from './ModelFormatCompatibility';

afterEach(cleanup);

describe('ModelFormatCompatibility', () => {
  it('renders all modalities and distinguishes representations with the same bit count', () => {
    render(<ModelFormatCompatibility loadFromDatabase={false} />);
    expect(screen.getByText('Language, image, and video formats—without calling every 4-bit model “Q4.”')).toBeTruthy();
    expect(screen.getByText('Qwen3 32B')).toBeTruthy();
    expect(screen.getByText('FLUX.1-dev')).toBeTruthy();
    expect(screen.getByText('Stable Diffusion XL Base 1.0')).toBeTruthy();
    expect(screen.getByText('CogVideoX 5B')).toBeTruthy();
    expect(screen.getByText('Wan2.1 T2V 14B')).toBeTruthy();
    expect(screen.getByText('GGUF Q4_K_M')).toBeTruthy();
    expect(screen.getAllByText(/bitsandbytes NF4/).length).toBeGreaterThan(0);
  });

  it('filters by modality and precision and updates the selected four-GPU cluster', () => {
    render(<ModelFormatCompatibility loadFromDatabase={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.click(screen.getByRole('button', { name: 'Q4' }));
    expect(screen.getByText('CogVideoX 5B')).toBeTruthy();
    expect(screen.getByText('Wan2.1 T2V 14B')).toBeTruthy();
    expect(screen.queryByText('Qwen3 32B')).toBeNull();
    expect(screen.getAllByText('Q4')).toHaveLength(3);

    fireEvent.change(screen.getByRole('combobox', { name: 'Four-GPU model cluster' }), { target: { value: 'rtx3090-quad' } });
    expect(screen.getAllByText('4× GeForce RTX 3090 · paired NVLink').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Ampere · compute capability 8.6 · native BF16')).toBeTruthy();
  });

  it('shows V100 format exclusions instead of treating aggregate VRAM as universal support', () => {
    render(<ModelFormatCompatibility loadFromDatabase={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'BF16' }));
    expect(screen.getAllByText('UNSUPPORTED')).toHaveLength(5);
    expect(screen.getAllByText(/requires compute capability 8\+/).length).toBeGreaterThan(0);
  });
});
