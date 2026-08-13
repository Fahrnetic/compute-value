/**
 * Research helper for dated eBay used-market snapshots.
 *
 * Start Firefox's WebDriver BiDi endpoint before running:
 *   firefox --headless --no-remote --profile /tmp/forge-ebay-profile \
 *     --remote-debugging-port=9222 --remote-allow-hosts localhost,127.0.0.1 about:blank
 *   node scripts/research-ebay-used-market.mjs
 *
 * The output is research evidence, not application data. Review exact model matches before
 * copying a snapshot into server/ebay-market.ts.
 */

const endpoint = process.env.FORGE_BIDI_URL ?? 'ws://127.0.0.1:9222/session';

const targets = [
  ['nvidia-rtx-3060', 'NVIDIA GeForce RTX 3060 12GB GPU used', ['RTX3060', '12GB'], ['3060TI']],
  ['nvidia-rtx-3060-ti', 'NVIDIA GeForce RTX 3060 Ti 8GB GPU used', ['RTX3060TI', '8GB']],
  ['nvidia-rtx-3070', 'NVIDIA GeForce RTX 3070 8GB GPU used', ['RTX3070', '8GB'], ['3070TI']],
  ['nvidia-rtx-3070-ti', 'NVIDIA GeForce RTX 3070 Ti 8GB GPU used', ['RTX3070TI', '8GB']],
  ['nvidia-rtx-3080', 'NVIDIA GeForce RTX 3080 10GB GPU used', ['RTX3080', '10GB'], ['3080TI', '12GB']],
  ['nvidia-rtx-3080-ti', 'NVIDIA GeForce RTX 3080 Ti 12GB GPU used', ['RTX3080TI', '12GB']],
  ['nvidia-rtx-4060', 'NVIDIA GeForce RTX 4060 8GB GPU used', ['RTX4060', '8GB'], ['4060TI']],
  ['nvidia-rtx-4060-ti-8', 'NVIDIA GeForce RTX 4060 Ti 8GB GPU used', ['RTX4060TI', '8GB'], ['16GB']],
  ['nvidia-rtx-4060-ti-16', 'NVIDIA GeForce RTX 4060 Ti 16GB GPU used', ['RTX4060TI', '16GB']],
  ['nvidia-rtx-4070', 'NVIDIA GeForce RTX 4070 12GB GPU used', ['RTX4070', '12GB'], ['4070TI', '4070SUPER']],
  ['nvidia-rtx-4070-super', 'NVIDIA GeForce RTX 4070 SUPER 12GB GPU used', ['RTX4070SUPER', '12GB'], ['4070TISUPER']],
  ['nvidia-rtx-4070-ti', 'NVIDIA GeForce RTX 4070 Ti 12GB GPU used', ['RTX4070TI', '12GB'], ['SUPER']],
  ['nvidia-rtx-4070-ti-super', 'NVIDIA GeForce RTX 4070 Ti SUPER 16GB GPU used', ['RTX4070TISUPER', '16GB']],
  ['nvidia-rtx-4080', 'NVIDIA GeForce RTX 4080 16GB GPU used', ['RTX4080', '16GB'], ['SUPER']],
  ['nvidia-rtx-4080-super', 'NVIDIA GeForce RTX 4080 SUPER 16GB GPU used', ['RTX4080SUPER', '16GB']],
  ['nvidia-rtx-5080', 'NVIDIA GeForce RTX 5080 16GB GPU used', ['RTX5080', '16GB']],
  ['nvidia-rtx-5070-ti', 'NVIDIA GeForce RTX 5070 Ti 16GB GPU used', ['RTX5070TI', '16GB']],
  ['nvidia-rtx-5070', 'NVIDIA GeForce RTX 5070 12GB GPU used', ['RTX5070', '12GB'], ['5070TI']],
  ['nvidia-rtx-5060-ti-16', 'NVIDIA GeForce RTX 5060 Ti 16GB GPU used', ['RTX5060TI', '16GB']],
  ['nvidia-rtx-5060-ti-8', 'NVIDIA GeForce RTX 5060 Ti 8GB GPU used', ['RTX5060TI', '8GB'], ['16GB']],
  ['nvidia-rtx-5060', 'NVIDIA GeForce RTX 5060 8GB GPU used', ['RTX5060', '8GB'], ['5060TI']],
  ['nvidia-rtx-5050', 'NVIDIA GeForce RTX 5050 8GB GPU used', ['RTX5050', '8GB']],
  ['nvidia-rtx-pro-2000-blackwell', 'NVIDIA RTX PRO 2000 Blackwell 16GB GPU used', ['RTXPRO2000', 'BLACKWELL', '16GB']],
  ['nvidia-h200-nvl', 'NVIDIA H200 NVL 141GB GPU', ['H200', '141GB']],
  ['amd-instinct-mi350p', 'AMD Instinct MI350P PCIe 144GB GPU', ['MI350P', '144GB']],
  ['nvidia-h100-nvl', 'NVIDIA H100 NVL 94GB GPU', ['H100', 'NVL', '94GB']],
  ['nvidia-h800-nvl', 'NVIDIA H800 NVL 94GB GPU', ['H800', 'NVL', '94GB']],
  ['nvidia-h100-pcie-80', 'NVIDIA H100 PCIe 80GB GPU', ['H100', 'PCIE', '80GB']],
  ['nvidia-h800-pcie-80', 'NVIDIA H800 PCIe 80GB GPU', ['H800', 'PCIE', '80GB']],
  ['nvidia-a100-pcie-80', 'NVIDIA A100 PCIe 80GB GPU', ['A100', 'PCIE', '80GB']],
  ['nvidia-a800-pcie-80', 'NVIDIA A800 PCIe 80GB GPU', ['A800', 'PCIE', '80GB']],
  ['nvidia-rtx-5090-d', 'NVIDIA GeForce RTX 5090 D 32GB GPU', ['5090D', '32GB']],
  ['nvidia-rtx-5090', 'NVIDIA GeForce RTX 5090 Founders Edition 32GB used', ['5090', 'FOUNDERS', '32GB']],
  ['nvidia-rtx-pro-6000-blackwell-maxq', 'NVIDIA RTX PRO 6000 Blackwell Max-Q 96GB GPU', ['RTXPRO6000', 'BLACKWELL', 'MAXQ', '96GB']],
  ['nvidia-rtx-pro-6000-blackwell-server', 'NVIDIA RTX PRO 6000 Blackwell Server Edition 96GB GPU', ['RTXPRO6000', 'BLACKWELL', 'SERVER', '96GB']],
  ['nvidia-rtx-pro-6000-blackwell-workstation', 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition 96GB GPU', ['RTXPRO6000', 'BLACKWELL', '96GB']],
  ['amd-instinct-mi210', 'AMD Instinct MI210 64GB GPU', ['MI210', '64GB']],
  ['nvidia-a800-40-active', 'NVIDIA A800 40GB Active GPU', ['A800', '40GB']],
  ['nvidia-a100-pcie-40', 'NVIDIA A100 PCIe 40GB GPU', ['A100', 'PCIE', '40GB']],
  ['nvidia-rtx-5090-d-v2', 'NVIDIA GeForce RTX 5090 D V2 24GB GPU', ['5090D', 'V2', '24GB']],
  ['nvidia-rtx-pro-5000-blackwell-48', 'NVIDIA RTX PRO 5000 Blackwell 48GB GPU', ['RTXPRO5000', 'BLACKWELL', '48GB']],
  ['nvidia-rtx-pro-5000-blackwell-72', 'NVIDIA RTX PRO 5000 Blackwell 72GB GPU', ['RTXPRO5000', 'BLACKWELL', '72GB']],
  ['amd-instinct-mi100', 'AMD Instinct MI100 32GB GPU', ['MI100', '32GB']],
  ['nvidia-tesla-v100s-pcie-32', 'NVIDIA Tesla V100S PCIe 32GB GPU', ['V100S', 'PCIE', '32GB']],
  ['amd-instinct-mi50-32', 'AMD Instinct MI50 32GB GPU', ['MI50', '32GB']],
  ['amd-instinct-mi60', 'AMD Instinct MI60 32GB GPU', ['MI60', '32GB']],
  ['nvidia-rtx-3090-ti', 'NVIDIA RTX 3090 Ti Founders Edition 24GB', ['3090TI', 'FOUNDERS', '24GB']],
  ['nvidia-rtx-4090-d', 'NVIDIA GeForce RTX 4090 D 24GB GPU', ['4090D', '24GB']],
  ['nvidia-rtx-4090', 'NVIDIA GeForce RTX 4090 Founders Edition 24GB used', ['4090', 'FOUNDERS', '24GB'], ['4090D']],
  ['nvidia-rtx-5880-ada', 'NVIDIA RTX 5880 Ada 48GB GPU used', ['RTX5880', 'ADA', '48GB']],
  ['nvidia-rtx-6000-ada', 'NVIDIA RTX 6000 Ada 48GB GPU used', ['RTX6000', 'ADA', '48GB']],
  ['amd-rx-7900-xtx', 'AMD Radeon RX 7900 XTX 24GB GPU used', ['7900XTX', '24GB']],
  ['nvidia-rtx-3090', 'NVIDIA RTX 3090 Founders Edition 24GB used', ['3090', 'FOUNDERS', '24GB'], ['3090TI']],
  ['nvidia-a30', 'NVIDIA A30 24GB GPU accelerator used', ['A30', '24GB']],
  ['nvidia-tesla-v100-pcie-32', 'NVIDIA Tesla V100 PCIe 32GB GPU used', ['V100', 'PCIE', '32GB'], ['V100S']],
  ['nvidia-rtx-pro-4500-blackwell', 'NVIDIA RTX PRO 4500 Blackwell 32GB GPU used', ['RTXPRO4500', 'BLACKWELL', '32GB'], ['SERVER']],
  ['nvidia-quadro-gv100', 'NVIDIA Quadro GV100 32GB GPU used', ['GV100', '32GB']],
  ['nvidia-l20', 'NVIDIA L20 48GB GPU accelerator used', ['L20', '48GB']],
  ['nvidia-l40', 'NVIDIA L40 48GB GPU accelerator used', ['L40', '48GB'], ['L40S']],
  ['nvidia-l40s', 'NVIDIA L40S 48GB GPU accelerator used', ['L40S', '48GB']],
  ['amd-radeon-pro-w7800-48', 'AMD Radeon PRO W7800 48GB GPU used', ['W7800', '48GB']],
  ['amd-radeon-pro-w7900', 'AMD Radeon PRO W7900 48GB GPU used', ['W7900', '48GB'], ['DUALSLOT']],
  ['amd-radeon-pro-w7900-dual-slot', 'AMD Radeon PRO W7900 Dual Slot 48GB GPU used', ['W7900', 'DUALSLOT', '48GB']],
  ['nvidia-rtx-pro-4500-blackwell-server', 'NVIDIA RTX PRO 4500 Blackwell Server Edition 32GB used', ['RTXPRO4500', 'BLACKWELL', 'SERVER', '32GB']],
  ['nvidia-rtx-a5000', 'NVIDIA RTX A5000 24GB GPU used', ['A5000', '24GB']],
  ['nvidia-rtx-a5500', 'NVIDIA RTX A5500 24GB GPU used', ['A5500', '24GB']],
  ['nvidia-rtx-a6000', 'NVIDIA RTX A6000 48GB GPU used', ['A6000', '48GB']],
  ['nvidia-a40', 'NVIDIA A40 48GB GPU accelerator used', ['A40', '48GB']],
  ['nvidia-quadro-rtx-6000', 'NVIDIA Quadro RTX 6000 24GB GPU used', ['QUADRORTX6000', '24GB'], ['SERVER']],
  ['nvidia-quadro-rtx-6000-server', 'NVIDIA Quadro RTX 6000 Server Edition 24GB GPU used', ['QUADRORTX6000', 'SERVER', '24GB']],
  ['nvidia-quadro-rtx-8000', 'NVIDIA Quadro RTX 8000 48GB GPU used', ['QUADRORTX8000', '48GB'], ['SERVER']],
  ['nvidia-quadro-rtx-8000-server', 'NVIDIA Quadro RTX 8000 Server Edition 48GB GPU used', ['QUADRORTX8000', 'SERVER', '48GB']],
  ['nvidia-rtx-pro-4000-blackwell', 'NVIDIA RTX PRO 4000 Blackwell 24GB GPU used', ['RTXPRO4000', 'BLACKWELL', '24GB'], ['SFF']],
  ['nvidia-titan-rtx', 'NVIDIA TITAN RTX 24GB GPU used', ['TITANRTX', '24GB']],
  ['amd-radeon-ai-pro-r9600', 'AMD Radeon AI PRO R9600 32GB GPU used', ['R9600', '32GB'], ['R9600D']],
  ['amd-radeon-ai-pro-r9600d', 'AMD Radeon AI PRO R9600D 32GB GPU used', ['R9600D', '32GB']],
  ['amd-radeon-ai-pro-r9700', 'AMD Radeon AI PRO R9700 32GB GPU used', ['R9700', '32GB'], ['R9700S']],
  ['amd-radeon-ai-pro-r9700s', 'AMD Radeon AI PRO R9700S 32GB GPU used', ['R9700S', '32GB']],
  ['nvidia-a10', 'NVIDIA A10 24GB GPU accelerator used', ['A10', '24GB']],
  ['nvidia-rtx-5000-ada', 'NVIDIA RTX 5000 Ada 32GB GPU used', ['RTX5000', 'ADA', '32GB']],
  ['amd-radeon-pro-w7800-32', 'AMD Radeon PRO W7800 32GB GPU used', ['W7800', '32GB']],
  ['amd-radeon-pro-v620', 'AMD Radeon PRO V620 32GB GPU used', ['V620', '32GB']],
  ['amd-radeon-pro-w6800', 'AMD Radeon PRO W6800 32GB GPU used', ['W6800', '32GB']],
  ['amd-radeon-pro-v340', 'AMD Radeon PRO V340 32GB GPU used', ['V340', '32GB']],
  ['amd-radeon-pro-v710', 'AMD Radeon PRO V710 28GB GPU used', ['V710', '28GB']],
  ['nvidia-quadro-p6000', 'NVIDIA Quadro P6000 24GB GPU used', ['P6000', '24GB']],
  ['nvidia-rtx-4500-ada', 'NVIDIA RTX 4500 Ada 24GB GPU used', ['RTX4500', 'ADA', '24GB']],
  ['nvidia-rtx-pro-4000-blackwell-sff', 'NVIDIA RTX PRO 4000 Blackwell SFF 24GB GPU used', ['RTXPRO4000', 'BLACKWELL', 'SFF', '24GB']],
  ['nvidia-tesla-p40', 'NVIDIA Tesla P40 24GB GPU used', ['P40', '24GB']],
  ['amd-firepro-s9170', 'AMD FirePro S9170 32GB GPU used', ['S9170', '32GB']],
  ['amd-firepro-w9100-32', 'AMD FirePro W9100 32GB GPU used', ['W9100', '32GB']],
  ['nvidia-quadro-m6000-24', 'NVIDIA Quadro M6000 24GB GPU used', ['M6000', '24GB']],
  ['nvidia-l4', 'NVIDIA L4 24GB GPU accelerator used', ['L4', '24GB']],
  ['nvidia-tesla-m40-24', 'NVIDIA Tesla M40 24GB GPU used', ['M40', '24GB']],
  ['nvidia-tesla-k80', 'NVIDIA Tesla K80 24GB GPU used', ['K80', '24GB']],
  ['amd-radeon-pro-duo-polaris', 'AMD Radeon Pro Duo Polaris 32GB GPU used', ['RADEONPRODUO', '32GB']],
  ['nvidia-a16', 'NVIDIA A16 64GB GPU accelerator used', ['A16', '64GB']],
  ['nvidia-tesla-m10', 'NVIDIA Tesla M10 32GB GPU used', ['M10', '32GB']],
];

function remoteValue(value) {
  if (!value) return undefined;
  if ('value' in value && value.type !== 'object' && value.type !== 'array') return value.value;
  if (value.type === 'array') return value.value.map(remoteValue);
  if (value.type === 'object') return Object.fromEntries(value.value.map(([key, item]) => [key, remoteValue(item)]));
  return undefined;
}

function normalized(value) {
  return value.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');
}

function feedbackCount(value) {
  const cleaned = value.toUpperCase().replaceAll(',', '');
  return Math.round(Number.parseFloat(cleaned) * (cleaned.endsWith('K') ? 1000 : 1));
}

function parseCard(card, required, forbidden = []) {
  const lines = card.text.split('\n').map((line) => line.trim()).filter(Boolean);
  const title = lines[0] ?? '';
  const titleKey = normalized(title);
  if (!required.every((token) => titleKey.includes(normalized(token)))) return undefined;
  if (forbidden.some((token) => titleKey.includes(normalized(token)))) return undefined;
  if (/\b(LOT OF|PAIR OF|FOR PARTS|REPAIR|BROKEN|FAILED|READ DESCRIPTION|BOX ONLY|EMPTY BOX|NO GPU|ECC ERROR|SXM|HEATSINK|COOLER|WATERBLOCK|QS GPU|GPU SERVER)\b/i.test(title)) return undefined;

  const priceLine = lines.find((line) => /^(?:US )?\$[\d,]+(?:\.\d{2})?$/.test(line));
  const sellerLine = lines.find((line) => /\d+(?:\.\d+)?% positive \([\d,.K]+\)/i.test(line));
  if (!priceLine || !sellerLine) return undefined;

  const seller = sellerLine.match(/^(.+?)\s+(\d+(?:\.\d+)?)% positive \(([\d,.K]+)\)$/i);
  if (!seller) return undefined;
  const sellerFeedbackPercent = Number(seller[2]);
  const sellerFeedbackCount = feedbackCount(seller[3]);
  if (sellerFeedbackPercent < 98 || sellerFeedbackCount < 100) return undefined;

  const itemId = card.href.match(/\/itm\/(\d+)/)?.[1];
  if (!itemId) return undefined;
  return {
    title,
    amountUsd: Number(priceLine.replace(/[US $,]/g, '')),
    sellerName: seller[1],
    sellerFeedbackPercent,
    sellerFeedbackCount,
    sourceUrl: `https://www.ebay.com/itm/${itemId}`,
  };
}

async function connect() {
  const socket = new WebSocket(endpoint);
  const pending = new Map();
  let sequence = 0;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const callbacks = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) callbacks.reject(new Error(`${message.error}: ${message.message}`));
    else callbacks.resolve(message.result);
  };
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  await command('session.new', { capabilities: {} });
  const created = await command('browsingContext.create', { type: 'tab' });
  return { socket, command, context: created.context };
}

const client = await connect();
const snapshots = [];
const requestedIds = new Set((process.env.FORGE_EBAY_IDS ?? '').split(',').filter(Boolean));
const selectedTargets = requestedIds.size > 0 ? targets.filter(([productId]) => requestedIds.has(productId)) : targets;

for (const [productId, query, required, forbidden] of selectedTargets) {
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=27386&LH_ItemCondition=3000&LH_BIN=1&_sop=15`;
  let listings = [];
  try {
    try {
      await client.command('browsingContext.navigate', { context: client.context, url, wait: 'interactive' });
    } catch (error) {
      if (!String(error).includes('NS_BINDING_ABORTED')) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const evaluated = await client.command('script.evaluate', {
      expression: `Array.from(document.querySelectorAll('.su-card-container')).map((card) => ({ text: card.innerText, href: card.querySelector('a[href*="/itm/"]')?.href ?? '' }))`,
      target: { context: client.context },
      awaitPromise: true,
      resultOwnership: 'none',
    });
    const cards = remoteValue(evaluated.result) ?? [];
    listings = cards.map((card) => parseCard(card, required, forbidden)).filter(Boolean)
      .sort((a, b) => a.amountUsd - b.amountUsd).slice(0, 3);
  } catch (error) {
    console.error(`${productId}: ${String(error)}`);
  }
  snapshots.push({ productId, query, observedAt: new Date().toISOString().slice(0, 10), listings });
}

await client.command('session.end');
client.socket.close();
console.log(JSON.stringify(snapshots, null, 2));
