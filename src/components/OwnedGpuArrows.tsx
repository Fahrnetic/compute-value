import {
  comparisonDirectionForMetric,
  gpuComparisonValue,
  processorCountsComparable,
  type GpuComparisonMetric,
  type OwnedGpuBaseline,
} from '../data/gpu-owner-comparison';
import type { Gpu } from '../types';

const directionCopy = {
  up: { symbol: '↑', word: 'higher' },
  down: { symbol: '↓', word: 'lower' },
  equal: { symbol: '=', word: 'equal' },
  unknown: { symbol: '?', word: 'not measured' },
  incomparable: { symbol: '×', word: 'not comparable' },
} as const;

export function OwnedGpuArrows({
  gpu,
  baselines,
  metric,
}: {
  gpu: Gpu;
  baselines: OwnedGpuBaseline[];
  metric: GpuComparisonMetric;
}) {
  const value = gpuComparisonValue(gpu, metric);
  return (
    <span className="owned-gpu-arrows" aria-label={`${metric} compared with your GPUs`}>
      {baselines.map((baseline) => {
        const direction = metric === 'processors' && !processorCountsComparable(gpu, baseline.gpu)
          ? 'incomparable'
          : comparisonDirectionForMetric(metric, value, gpuComparisonValue(baseline.gpu, metric));
        const copy = directionCopy[direction];
        const title = metric === 'power' && direction !== 'equal' && direction !== 'unknown'
          ? `${direction === 'up' ? 'lower' : 'higher'} power draw than your ${baseline.gpu.name}`
          : `${copy.word} than your ${baseline.gpu.name}`;
        return (
          <i
            className={`owned-gpu-arrow owned-gpu-arrow--${direction}`}
            title={title}
            key={baseline.key}
          >
            <b>{baseline.shortLabel}</b>{copy.symbol}
          </i>
        );
      })}
    </span>
  );
}
