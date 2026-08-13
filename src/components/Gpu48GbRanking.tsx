import { BadgeDollarSign, ExternalLink, Gauge, MemoryStick } from 'lucide-react';
import type { Product } from '../types';
import { formatGpuMarketPriceRange } from '../data/gpu-owner-comparison';
import { buildGpu48GbRanking } from '../data/gpu-48gb-ranking';
import { formatRepresentativePrice } from '../data/price-adjusted-gpu-score';
import { formatGpu48GbPriceSignal } from '../data/gpu-48gb-price-research';

function formatNumber(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

export function Gpu48GbRanking({ products }: { products: Product[] }) {
  const entries = buildGpu48GbRanking(products);
  const buyerEntries = entries.filter((entry) => entry.buyer);
  const measuredEntries = entries.filter((entry) => entry.performance);
  const researchedPriceEntries = entries.filter((entry) => entry.marketPrice || entry.priceSignal);
  const screenedPriceEntries = entries.filter((entry) => entry.marketPrice
    || entry.priceSignal?.evidenceStatus === 'screened-non-used');
  const leader = buyerEntries[0];

  return (
    <section className="gpu48-ranking" aria-labelledby="gpu48-ranking-title">
      <header className="gpu48-ranking__heading">
        <MemoryStick />
        <div>
          <span className="section-kicker">EXACTLY 48 GB / ADDRESSABLE MEMORY</span>
          <h2 id="gpu48-ranking-title">The 48 GB card ranking</h2>
          <p>Exactly 48 GB cards only—64, 72, 80, and 96 GB products are excluded. Every card has a dated price audit; used, open-box, refurbished, and rejected seller evidence remain visibly separate.</p>
        </div>
        <div className="gpu48-ranking__summary">
          <span><strong>{entries.length}</strong><small>48 GB cards</small></span>
          <span><strong>{measuredEntries.length}</strong><small>exact controls</small></span>
          <span><strong>{buyerEntries.length}</strong><small>buyer scores</small></span>
          <span><strong>{researchedPriceEntries.length}/{entries.length}</strong><small>price audits</small></span>
        </div>
      </header>

      {leader?.buyer && (
        <div className="gpu48-ranking__leader">
          <BadgeDollarSign />
          <span><small>48 GB BUYER LEADER</small><strong>{leader.product.name}</strong><i>{leader.product.manufacturer} · {leader.product.architecture}</i></span>
          <b>{leader.buyer.score.toFixed(1)}</b>
          <em>{formatRepresentativePrice(leader.buyer)} midpoint · {formatNumber(leader.buyer.performance.benchmark.generatedTokensPerSecond)} decode tok/s</em>
        </div>
      )}

      <div className="gpu48-ranking__table">
        <div className="gpu48-row gpu48-row--heading" aria-hidden="true">
          <span>48 GB rank</span><span>Card</span><span>Buyer score</span><span>Performance</span><span>Decode</span><span>Market price</span><span>Fabric / power</span><span>Source</span>
        </div>
        <ol>
          {entries.map((entry) => {
            const benchmark = entry.performance?.benchmark;
            const sourceUrl = benchmark?.sourceUrl ?? entry.product.specSourceUrl ?? entry.product.price.sourceUrl;
            const priceEvidenceUrls = entry.marketPrice
              ? entry.product.usedMarket?.listings.map((listing) => listing.sourceUrl) ?? []
              : entry.priceSignal?.sourceUrls ?? [];
            const priceObservedAt = entry.marketPrice
              ? entry.product.usedMarket?.observedAt
              : entry.priceSignal?.observedAt;
            const displayedPrice = entry.marketPrice
              ? formatGpuMarketPriceRange(entry.marketPrice)
              : entry.priceSignal
                ? formatGpu48GbPriceSignal(entry.priceSignal)
                : 'Missing';
            return (
              <li className={`gpu48-row is-${entry.status}`} key={entry.product.id}>
                <b className={`bandwidth-rank ${entry.rank && entry.rank <= 3 ? `bandwidth-rank--${entry.rank}` : ''}`}>{entry.rank ? `#${entry.rank}` : '—'}</b>
                <span className="gpu48-product"><small>{entry.product.manufacturer} · {entry.product.architecture}</small><strong>{entry.product.name}</strong><i>{entry.product.segment?.replace('-', ' ')} · 48 GB {entry.product.vramType ?? 'VRAM'}</i></span>
                <span className="gpu48-stat gpu48-stat--buyer"><small>{entry.buyer ? `#${entry.buyer.rank} global buyer` : 'Buyer score'}</small><strong>{entry.buyer ? entry.buyer.score.toFixed(1) : 'Unscored'}</strong><i>{entry.buyer ? `V${entry.buyer.vramIndex.toFixed(1)} · $${entry.buyer.valueIndex.toFixed(1)}` : entry.performance ? 'Market price missing' : 'Exact control missing'}</i></span>
                <span className="gpu48-stat"><small>Performance score</small><strong>{entry.performance ? entry.performance.score.toFixed(1) : '—'}</strong><i>{entry.performance ? `#${entry.performance.rank} overall` : 'No proxy used'}</i></span>
                <span className="gpu48-stat"><small>tg128 fixed control</small><strong>{benchmark ? `${formatNumber(benchmark.generatedTokensPerSecond)} tok/s` : 'Not measured'}</strong><i>{benchmark ? `${benchmark.backend} · pp512 ${formatNumber(benchmark.promptTokensPerSecond)}` : 'Remains unranked'}</i></span>
                <span className={`gpu48-stat gpu48-price ${entry.priceSignal?.evidenceStatus === 'seller-screen-failed' ? 'is-rejected' : ''}`}><small>{entry.marketPrice ? 'Screened used' : entry.priceSignal?.condition.replace('-', ' ') ?? 'Price evidence'}{priceObservedAt ? ` · ${priceObservedAt}` : ''}</small><strong>{displayedPrice}</strong><i>{entry.marketPrice?.sourceLabel ?? entry.priceSignal?.sourceLabel ?? 'No MSRP fallback'}</i>{priceEvidenceUrls.length > 0 && <span className="gpu48-price__sources">{priceEvidenceUrls.map((url, index) => <a href={url} target="_blank" rel="noreferrer" key={url}>Source {index + 1}<ExternalLink /></a>)}</span>}</span>
                <span className="gpu48-stat"><small>Memory / board</small><strong>{entry.product.memoryBandwidthGbS ? `${formatNumber(entry.product.memoryBandwidthGbS)} GB/s` : 'Bandwidth missing'}</strong><i>{entry.product.boardPowerW ? `${entry.product.boardPowerW} W rated` : 'Power missing'}</i></span>
                <a href={sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open evidence for ${entry.product.name}`}><ExternalLink /></a>
              </li>
            );
          })}
        </ol>
      </div>

      <footer><Gauge /> <span><strong>{screenedPriceEntries.length} of {entries.length} cards have screened acquisition prices; all {researchedPriceEntries.length} were audited.</strong> The W7800 48 GB signal is shown but rejected for zero seller feedback. Separately, {entries.length - measuredEntries.length} exact benchmark gaps remain.</span></footer>
    </section>
  );
}
