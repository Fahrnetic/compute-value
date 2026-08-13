import type { Gpu, LlmBenchmarkResult, Product } from '../types';

export const APPLES_LLM_PROFILE_KEY: LlmBenchmarkResult['profileKey'] = 'llama2-7b-q4_0-tg128-no-fa';

export const APPLES_LLM_SCORE_WEIGHTS = {
  decode: 0.7,
  prompt: 0.3,
} as const;

export interface ApplesLlmScore {
  product: Gpu;
  benchmark: LlmBenchmarkResult;
  score: number;
  rank: number;
  decodeIndex: number;
  promptIndex: number;
}

function roundIndex(value: number) {
  return Number(value.toFixed(1));
}

/**
 * Scores discrete GPUs only when they contain the accepted exact fixed-control
 * result. The fastest measured card is the 100-point reference for both phases;
 * price, specifications, power ratings, and proxy measurements never enter the
 * score.
 */
export function scoreApplesComparableGpus(
  products: Product[],
  profileKey: LlmBenchmarkResult['profileKey'] = APPLES_LLM_PROFILE_KEY,
): ApplesLlmScore[] {
  const exactResults = products.flatMap((product) => {
    if (product.category !== 'gpu') return [];
    const benchmark = product.llmBenchmarks?.find((result) => result.profileKey === profileKey);
    return benchmark ? [{ product, benchmark }] : [];
  });

  if (exactResults.length === 0) return [];

  const fastestDecode = Math.max(...exactResults.map(({ benchmark }) => benchmark.generatedTokensPerSecond));
  const fastestPrompt = Math.max(...exactResults.map(({ benchmark }) => benchmark.promptTokensPerSecond));

  const sorted = exactResults.map(({ product, benchmark }) => {
    const decodeIndex = roundIndex(benchmark.generatedTokensPerSecond / fastestDecode * 100);
    const promptIndex = roundIndex(benchmark.promptTokensPerSecond / fastestPrompt * 100);
    const score = roundIndex(
      decodeIndex * APPLES_LLM_SCORE_WEIGHTS.decode
      + promptIndex * APPLES_LLM_SCORE_WEIGHTS.prompt,
    );
    return { product, benchmark, decodeIndex, promptIndex, score };
  }).sort((a, b) => b.score - a.score
    || b.benchmark.generatedTokensPerSecond - a.benchmark.generatedTokensPerSecond
    || b.benchmark.promptTokensPerSecond - a.benchmark.promptTokensPerSecond
    || a.product.name.localeCompare(b.product.name));

  let previousScore: number | undefined;
  let previousRank = 0;
  return sorted.map((entry, index) => {
    const rank = entry.score === previousScore ? previousRank : index + 1;
    previousScore = entry.score;
    previousRank = rank;
    return { ...entry, rank };
  });
}
