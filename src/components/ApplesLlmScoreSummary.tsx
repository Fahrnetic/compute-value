import { BadgeCheck, CircleDollarSign, Scale, Trophy } from 'lucide-react';
import type { Product } from '../types';
import { APPLES_LLM_SCORE_WEIGHTS, scoreApplesComparableGpus } from '../data/apples-llm-score';
import {
  BUYER_SCORE_WEIGHTS,
  formatRepresentativePrice,
  meetsBuyerVramGate,
  MIN_BUYER_VRAM_GB,
  scorePriceAdjustedGpus,
} from '../data/price-adjusted-gpu-score';

function performanceVendorLeader(scores: ReturnType<typeof scoreApplesComparableGpus>, vendor: string) {
  return scores.find(({ product }) => product.manufacturer === vendor);
}

function buyerVendorLeader(scores: ReturnType<typeof scorePriceAdjustedGpus>, vendor: string) {
  return scores.find(({ product }) => product.manufacturer === vendor);
}

export function ApplesLlmScoreSummary({ products }: { products: Product[] }) {
  const performanceScores = scoreApplesComparableGpus(products);
  const buyerScores = scorePriceAdjustedGpus(products);
  const buyerEligibleScores = performanceScores.filter(({ product }) => meetsBuyerVramGate(product));
  const nvidiaScores = performanceScores.filter(({ product }) => product.manufacturer === 'NVIDIA');
  const amdScores = performanceScores.filter(({ product }) => product.manufacturer === 'AMD');
  const performanceLeader = performanceScores[0];
  const buyerLeader = buyerScores[0];
  const nvidiaBuyerLeader = buyerVendorLeader(buyerScores, 'NVIDIA');
  const amdBuyerLeader = buyerVendorLeader(buyerScores, 'AMD');
  const nvidiaPerformanceLeader = performanceVendorLeader(performanceScores, 'NVIDIA');
  const amdPerformanceLeader = performanceVendorLeader(performanceScores, 'AMD');

  if (!performanceLeader) return null;

  return (
    <section className="apples-score" aria-labelledby="apples-score-title">
      <header className="apples-score__heading">
        <span><Scale /><small>EXACT ONLY</small></span>
        <div>
          <span className="section-kicker">FIXED PERFORMANCE + REAL ACQUISITION VALUE</span>
          <h2 id="apples-score-title">AI card scores: speed and price.</h2>
          <p>The performance base still requires the exact Llama 2 7B Q4_0 control. Buyer scores require at least {MIN_BUYER_VRAM_GB} GB of addressable VRAM and a screened market price, including used data-center cards such as the 32 GB V100. Complete systems and clusters remain separate.</p>
        </div>
        <div className="apples-score__formula">
          <CircleDollarSign />
          <span><strong>42.5% performance + 42.5% value/$ + 15% VRAM</strong><small>Speed and price stay evenly weighted · {MIN_BUYER_VRAM_GB} GB minimum</small></span>
          <b>0–100</b>
        </div>
      </header>

      <div className="apples-score__audit">
        <span><BadgeCheck /><strong>{performanceScores.length}</strong><small>exact performance scores</small></span>
        <span><strong>{buyerScores.length}/{buyerEligibleScores.length}</strong><small>{MIN_BUYER_VRAM_GB} GB+ exact cards with buyer scores</small></span>
        <span><strong>{nvidiaScores.length}/{amdScores.length}</strong><small>NVIDIA / AMD performance rows</small></span>
        <span><Trophy /><strong>{buyerLeader?.score.toFixed(1) ?? '—'}</strong><small>{buyerLeader?.product.name ?? 'Price coverage required'}</small></span>
      </div>

      <div className="apples-score__vendors">
        <article>
          <span>NVIDIA BUYER LEADER</span>
          <strong>{nvidiaBuyerLeader?.product.name ?? nvidiaPerformanceLeader?.product.name ?? 'No accepted result'}</strong>
          <small>{nvidiaBuyerLeader ? `${nvidiaBuyerLeader.score.toFixed(1)} buyer · ${nvidiaBuyerLeader.performance.score.toFixed(1)} performance · ${formatRepresentativePrice(nvidiaBuyerLeader)} midpoint` : 'No screened normal-card price'}</small>
        </article>
        <article className="is-amd">
          <span>AMD BUYER LEADER</span>
          <strong>{amdBuyerLeader?.product.name ?? amdPerformanceLeader?.product.name ?? 'No accepted result'}</strong>
          <small>{amdBuyerLeader ? `${amdBuyerLeader.score.toFixed(1)} buyer · ${amdBuyerLeader.performance.score.toFixed(1)} performance · ${formatRepresentativePrice(amdBuyerLeader)} midpoint` : 'No screened normal-card price'}</small>
        </article>
        <p><strong>Capacity rule:</strong> VRAM uses the addressable pool—not combined split-board memory—and contributes 15%. The {MIN_BUYER_VRAM_GB} GB gate prevents smaller cards from becoming purchase recommendations. Price uses the screened-range midpoint; system costs remain excluded.</p>
      </div>

      <footer>Performance = decode index × {APPLES_LLM_SCORE_WEIGHTS.decode} + prompt index × {APPLES_LLM_SCORE_WEIGHTS.prompt}. Buyer = performance × {BUYER_SCORE_WEIGHTS.performance} + normalized performance-per-dollar × {BUYER_SCORE_WEIGHTS.value} + normalized addressable VRAM × {BUYER_SCORE_WEIGHTS.vram}. Native backend, runtime, host, drivers, cooling, and power limit can still vary.</footer>
    </section>
  );
}
