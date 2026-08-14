import type { UsedMarketListing } from '../src/types.js';
import { userExcludedGpuIds } from './llm-benchmarks.js';

export interface EbayUsedMarketSeed {
  productId: string;
  observedAt: string;
  searchUrl: string;
  listings: UsedMarketListing[];
}

export const ebaySellerRule = 'Exact used model; seller has at least 98% positive feedback and 100 feedback records';

const search = (query: string) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=27386&LH_ItemCondition=3000&LH_BIN=1`;

const listing = (
  title: string,
  amountUsd: number,
  sellerName: string,
  sellerFeedbackPercent: number,
  sellerFeedbackCount: number,
  itemId: string,
): UsedMarketListing => ({
  title,
  amountCents: Math.round(amountUsd * 100),
  sellerName,
  sellerFeedbackPercent,
  sellerFeedbackCount,
  sourceUrl: `https://www.ebay.com/itm/${itemId}`,
});

const observedAt = '2026-08-11';

const ebayUsedMarketResearch: EbayUsedMarketSeed[] = [
  { productId: 'nvidia-rtx-3060', observedAt, searchUrl: search('NVIDIA GeForce RTX 3060 12GB GPU used'), listings: [] },
  {
    productId: 'nvidia-rtx-3060-ti', observedAt, searchUrl: search('NVIDIA GeForce RTX 3060 Ti 8GB GPU used'), listings: [
      listing('ZOTAC GAMING GeForce RTX 3060 Ti Twin Edge OC LHR 8GB GDDR6 Graphics Card', 209.99, 'greenfiregroupllc', 100, 361, '158023401766'),
      listing('Nvidia GeForce RTX 3060 Ti 8GB DDR6 Graphics GPU Gaming Card Dell 086RMK', 229, 'mkirca', 100, 269, '187240234644'),
      listing('EVGA XC GeForce RTX 3060 Ti 8GB RAM - Graphics Card GPU - Tested', 249.99, 'justgoodtech', 99.8, 5300, '206441145089'),
    ],
  },
  {
    productId: 'nvidia-rtx-3070', observedAt, searchUrl: search('NVIDIA GeForce RTX 3070 8GB GPU used'), listings: [
      listing('Dell NVIDIA GeForce RTX 3070 8GB GDDR6 Graphic Card 6N10C GPU, ship today', 229, 'liangjay2012', 99.6, 3400, '178276590625'),
      listing('Asus Dual RTX 3070 8GB GDDR6 ARGB Graphics Card GPU - DUAL-RTX3070-08G', 248, 'allisgood1999', 100, 129, '188260338605'),
      listing('Dell OEM NVIDIA GeForce RTX 3070 8GB GDDR6 GPU Graphics Card Single 8-Pin V390', 249.99, 'briabarra', 100, 327, '267753105205'),
    ],
  },
  {
    productId: 'nvidia-rtx-3070-ti', observedAt, searchUrl: search('NVIDIA GeForce RTX 3070 Ti 8GB GPU used'), listings: [
      listing('ZOTAC GAMING RTX 3070 Ti AMP EXTREME HoloBlack 8GB GDDR6X Graphics Card GPU', 289.95, 'laughinggor88', 100, 328, '298286176672'),
      listing('ZOTAC GAMING GeForce RTX 3070 Ti AMP Holo 8GB GDDR6X Graphics Card SN:3309', 298.69, 'utopiagrove3d', 99.3, 776, '327215238446'),
      listing('ZOTAC GAMING GeForce RTX 3070 Ti AMP Holo 8GB GDDR6X Graphics Card', 299.99, 'abovetheridge', 100, 3900, '327271742935'),
    ],
  },
  {
    productId: 'nvidia-rtx-3080', observedAt, searchUrl: search('NVIDIA GeForce RTX 3080 10GB GPU used'), listings: [
      listing('NVIDIA GeForce RTX 3080 10GB GDDR6X Graphics Card (Alienware) GPU', 339.99, 'momwonthugme', 99.6, 2100, '188540031158'),
      listing('HP OMEN NVIDIA GeForce RTX 3080 10GB GDDR6X GPU Graphics Card NON-LHR', 339.99, 'nestor_jd', 98.6, 1200, '336681006524'),
    ],
  },
  {
    productId: 'nvidia-rtx-3080-ti', observedAt, searchUrl: search('NVIDIA GeForce RTX 3080 Ti 12GB GPU used'), listings: [
      listing('EVGA GeForce RTX 3080 Ti FTW3 Ultra 12GB GDDR6X RGB HDMI/DP PCIe', 450, 'vei2satile', 100, 229, '227350565692'),
      listing('RTX 3080 Ti GAMING OC 12GB GDDR6X Graphics Card', 459.99, 'bp_pcs', 99.2, 127, '358902988580'),
    ],
  },
  {
    productId: 'nvidia-rtx-4060', observedAt, searchUrl: search('NVIDIA GeForce RTX 4060 8GB GPU used'), listings: [
      listing('GIGABYTE GeForce RTX 4060 WINDFORCE OC 8GB Graphic Card - USED', 275, 'apluscomputersnh', 100, 411, '147485424680'),
      listing('MSI GeForce RTX 4060 Ventus 2X Black 8G OC 8GB GDDR6 Graphics Card', 275, 'lwarehouse20', 99.9, 4200, '407137861703'),
      listing('PNY GeForce RTX 4060 Dual Fan 8GB GDDR6 Graphics Card VCG40608DFXPB1', 279.99, 'paymore_springfield', 99.4, 6800, '318655551072'),
    ],
  },
  {
    productId: 'nvidia-rtx-4060-ti-8', observedAt, searchUrl: search('NVIDIA GeForce RTX 4060 Ti 8GB GPU used'), listings: [
      listing('MSI GeForce RTX 4060 Ti 8GB GAMING X GDDR6 Graphics Card Tested', 299.99, 'g-electronic', 99.7, 137600, '327232340375'),
      listing('ASUS DUAL GeForce RTX 4060 Ti 8GB GDDR6 Graphics Card DUAL-RTX4060Ti-8G', 299.99, 'g-electronic', 99.7, 137600, '326875625323'),
      listing('PNY GeForce RTX 4060 Ti 8GB VERTO Dual Fan GDDR6 Graphics Card Tested', 299.99, 'cascade_tech_bin', 100, 848, '327296145947'),
    ],
  },
  {
    productId: 'nvidia-rtx-4060-ti-16', observedAt, searchUrl: search('NVIDIA GeForce RTX 4060 Ti 16GB GPU used'), listings: [
      listing('MSI GeForce RTX 4060 Ti Ventus 3X OC 16GB GDDR6 Graphics Card 912-V513-057', 599.99, 'paymore_seven_oaks', 99.6, 4000, '227429733714'),
    ],
  },
  {
    productId: 'nvidia-rtx-4070', observedAt, searchUrl: search('NVIDIA GeForce RTX 4070 12GB GPU used'), listings: [
      listing('MSI GeForce RTX 4070 VENTUS 2X 12GB GDDR6 OC Graphics Card', 469.95, 'noltech', 100, 578, '227471055806'),
      listing('PNY GEFORCE RTX 4070 VERTO Dual Fan 12GB Graphics Card', 480, 'ccrep14420', 100, 4700, '236996671717'),
      listing('GIGABYTE GeForce RTX 4070 WINDFORCE OC 12GB GDDR6X Graphics Card GPU', 489.99, 'g-electronic', 99.7, 137600, '326463276356'),
    ],
  },
  {
    productId: 'nvidia-rtx-4070-super', observedAt, searchUrl: search('NVIDIA GeForce RTX 4070 SUPER 12GB GPU used'), listings: [
      listing('ZOTAC Gaming GeForce RTX 4070 Super Twin Edge 12GB 192BIT GDDR6X GPU Video Card', 549.99, 'g-electronic', 99.7, 137600, '326668522072'),
      listing('PNY GeForce RTX 4070 Super 12GB GDDR6X PCIE 4.0 OC Dual Fan Graphics Card', 549.99, 'g-electronic', 99.7, 137600, '326764867874'),
      listing('Dell OEM NVIDIA GeForce RTX 4070 SUPER 12GB GDDR6X Graphics Card GPU Tested', 565.95, 'supafox24', 100, 123, '117336715653'),
    ],
  },
  {
    productId: 'nvidia-rtx-4070-ti', observedAt, searchUrl: search('NVIDIA GeForce RTX 4070 Ti 12GB GPU used'), listings: [
      listing('ASUS TUF Gaming GeForce RTX 4070 Ti 12GB GDDR6X Graphics Card TUF-RTX4070TI-12G', 579.99, 'surpluserecycle', 99.4, 9100, '336737272327'),
      listing('ASUS ProArt GeForce RTX 4070 Ti OC 12GB GDDR6X Graphic Card', 580, 'paul-atienza99', 99.4, 1200, '137569470733'),
    ],
  },
  {
    productId: 'nvidia-rtx-4070-ti-super', observedAt, searchUrl: search('NVIDIA GeForce RTX 4070 Ti SUPER 16GB GPU used'), listings: [
      listing('Zotac GAMING GeForce RTX 4070 Ti Super SOLID OC Graphics Card GPU', 799.99, 'g-electronic', 99.7, 137600, '327270148510'),
      listing('MSI GeForce RTX 4070 Ti Super 16GB Ventus 3X Black OC NVIDIA Graphics Card', 800, 'canetime29', 100, 845, '336709795837'),
    ],
  },
  {
    productId: 'nvidia-rtx-4080', observedAt, searchUrl: search('NVIDIA GeForce RTX 4080 16GB GPU used'), listings: [
      listing('Lenovo GeForce RTX4080 Graphics Card - 16GB', 799, 'swalker5128', 100, 186, '168598443293'),
      listing('Lenovo GeForce RTX 4080 Ventus 3X OC 16GB GDDR6X Graphics Card G408016V3XC', 849.99, 'paymore_santa_clarita', 99.8, 3600, '358700512910'),
      listing('PNY GeForce RTX 4080 16GB Verto Triple Fan Graphics Card DLSS 3', 859.99, 'wazno', 99.7, 41300, '116691671325'),
    ],
  },
  {
    productId: 'nvidia-rtx-4080-super', observedAt, searchUrl: search('NVIDIA GeForce RTX 4080 SUPER 16GB GPU used'), listings: [
      listing('PNY Nvidia GeForce RTX 4080 SUPER 16GB Graphics Card GPU PC Used', 899.97, 'uventure', 99.6, 8000, '117343095196'),
      listing('MSI GeForce RTX 4080 Super 16GB Ventus 3X OC 16GB GDDR6X Gaming Graphics Card', 1099.99, 'wazno', 99.7, 41300, '116746209656'),
    ],
  },
  {
    productId: 'nvidia-rtx-5080', observedAt, searchUrl: search('NVIDIA GeForce RTX 5080 16GB GPU used'), listings: [
      listing('PNY OC GeForce RTX 5080 16GB GDDR7 PCI Express 5.0 x16 ATX Graphics Card', 1199.79, 'got_your_gadgets', 100, 1914, '336639526161'),
    ],
  },
  {
    productId: 'nvidia-rtx-5070-ti', observedAt, searchUrl: search('NVIDIA GeForce RTX 5070 Ti 16GB GPU used'), listings: [
      listing('PNY NVIDIA GeForce RTX 5070 Ti 16GB Overclocked DLSS 4 Gaming Graphics Card', 909.99, 'wazno', 99.6, 34465, '127354121080'),
    ],
  },
  {
    productId: 'nvidia-rtx-5070', observedAt, searchUrl: search('NVIDIA GeForce RTX 5070 12GB GPU used'), listings: [
      listing('PNY GeForce RTX 5070 12GB GDDR7 Graphics Card VCG507012TFXPBW1', 549.99, 'PayMore Sugarland', 99.2, 3126, '177987636030'),
    ],
  },
  { productId: 'nvidia-rtx-5060-ti-16', observedAt, searchUrl: search('NVIDIA GeForce RTX 5060 Ti 16GB GPU used'), listings: [] },
  {
    productId: 'nvidia-rtx-5060-ti-8', observedAt, searchUrl: search('NVIDIA GeForce RTX 5060 Ti 8GB GPU used'), listings: [
      listing('Dell GeForce RTX 5060 Ti 8GB GDDR7 Graphics Card', 389.99, 'PayMore Fort Thomas', 99.5, 5762, '227393222939'),
    ],
  },
  {
    productId: 'nvidia-rtx-5060', observedAt, searchUrl: search('NVIDIA GeForce RTX 5060 8GB GPU used'), listings: [
      listing('Zotac GeForce RTX 5060 Twin Edge OC 8GB GDDR7 Graphics Card', 309.99, 'PayMore Mechanicsburg', 99.4, 3736, '366427519585'),
    ],
  },
  {
    productId: 'nvidia-rtx-5050', observedAt, searchUrl: search('NVIDIA GeForce RTX 5050 8GB GPU used'), listings: [
      listing('Gigabyte GeForce RTX 5050 WindForce 8GB GDDR6 Graphics Card', 269.99, 'PayMore Hendersonville', 98.7, 446, '236765015774'),
      listing('MSI Shadow 2X OC NVIDIA GeForce RTX 5050 8GB GDDR6', 279.99, 'austintownpawn', 99.8, 3100, '267705438111'),
    ],
  },
  { productId: 'nvidia-rtx-pro-2000-blackwell', observedAt, searchUrl: search('NVIDIA RTX PRO 2000 Blackwell 16GB GPU used'), listings: [] },
  {
    productId: 'nvidia-h200-nvl', observedAt, searchUrl: search('NVIDIA H200 NVL 141GB GPU used'), listings: [
      listing('NVIDIA H200 NVL Tensor Core GPU 141GB HBM3e PCIe Gen 5.0 Hopper Architecture Accelerator', 33999, 'CloudStorageCorp', 99.9, 25202, '206373904488'),
      listing('NVIDIA H200 NVL 141GB HBM3e AI Data Center GPU Accelerator', 34900, 't-traderz', 99.9, 18400, '227435764416'),
      listing('NVIDIA H200 NVL 141GB HBM3e PCIe 5.0 Enterprise high-performance Accelerator GPU', 34949, 'serverque', 99.8, 1100, '236944638256'),
    ],
  },
  { productId: 'amd-instinct-mi350p', observedAt, searchUrl: search('AMD Instinct MI350P PCIe 144GB GPU used'), listings: [] },
  { productId: 'nvidia-h100-nvl', observedAt, searchUrl: search('NVIDIA H100 NVL 94GB GPU used'), listings: [] },
  { productId: 'nvidia-h800-nvl', observedAt, searchUrl: search('NVIDIA H800 NVL 94GB GPU used'), listings: [] },
  {
    productId: 'nvidia-h100-pcie-80', observedAt, searchUrl: search('NVIDIA H100 PCIe 80GB GPU used'), listings: [
      listing('NVIDIA Tesla H100 80GB PCIe Original GPU Graphics Card 900-21010-0000-000', 27999.99, 'qualitymemorycpu', 99.7, 6100, '178240121166'),
      listing('NVIDIA Tesla H100 80GB HBM2e PCIe 5.0 x16 high-performance Graphics Card', 32290, 'serverque', 99.8, 1100, '236969023826'),
    ],
  },
  { productId: 'nvidia-h800-pcie-80', observedAt, searchUrl: search('NVIDIA H800 PCIe 80GB GPU used'), listings: [] },
  {
    productId: 'nvidia-a100-pcie-80', observedAt, searchUrl: search('NVIDIA A100 PCIe 80GB GPU used'), listings: [
      listing('NVIDIA A100 80GB GPU HBM2e 6912 CUDA 1410MHz PCIe 4.0 x16', 15888, 'deepdiscountservers', 99.7, 4900, '267680699012'),
      listing('NVIDIA Tesla A100 80GB PCIe HBM2e GPU Accelerator Graphics Card', 16999, 'egoods.supply', 99.9, 24200, '286826455697'),
    ],
  },
  { productId: 'nvidia-a800-pcie-80', observedAt, searchUrl: search('NVIDIA A800 PCIe 80GB GPU used'), listings: [] },
  { productId: 'nvidia-rtx-5090-d', observedAt, searchUrl: search('NVIDIA GeForce RTX 5090 D 32GB used'), listings: [] },
  { productId: 'nvidia-rtx-5090', observedAt, searchUrl: search('NVIDIA GeForce RTX 5090 Founders Edition used'), listings: [] },
  { productId: 'nvidia-rtx-pro-6000-blackwell-maxq', observedAt, searchUrl: search('NVIDIA RTX PRO 6000 Blackwell Max-Q 96GB used'), listings: [] },
  { productId: 'nvidia-rtx-pro-6000-blackwell-server', observedAt, searchUrl: search('NVIDIA RTX PRO 6000 Blackwell Server Edition 96GB used'), listings: [] },
  { productId: 'nvidia-rtx-pro-6000-blackwell-workstation', observedAt, searchUrl: search('NVIDIA RTX PRO 6000 Blackwell Workstation Edition 96GB used'), listings: [] },
  {
    productId: 'amd-instinct-mi210', observedAt, searchUrl: search('AMD Instinct MI210 64GB GPU used'), listings: [
      listing('AMD Instinct MI210 64GB HBM2 PCIe 4.0 x16 Professional Graphics Card', 4270, 'cloud_future', 99.6, 649, '127887816422'),
      listing('AMD 102D6730600 Instinct MI210 64GB PCIe GPU Accelerator', 4369, 'core4solutions', 99.9, 19000, '178233788074'),
      listing('AMD Instinct MI210 64GB PCIe Graphics Card 102D6730600', 4369, 'rhinotechnology', 99.9, 12000, '307010000673'),
    ],
  },
  {
    productId: 'nvidia-a800-40-active', observedAt, searchUrl: search('NVIDIA RTX A800 40GB Active GPU used'), listings: [
      listing('Dell NVIDIA RTX A800 40GB Graphics Card YYJ7R', 9451.61, 'etb-technologies', 100, 10300, '286905167536'),
    ],
  },
  {
    productId: 'nvidia-a100-pcie-40', observedAt, searchUrl: search('NVIDIA A100 PCIe 40GB GPU used'), listings: [
      listing('NVIDIA A100 40GB HBM2 PCIe GPU Accelerator Card 900-21001-2700-030 Tested', 3499.99, 'minnesotacomputers', 99.8, 24700, '377340004283'),
      listing('NVIDIA A100 40GB PCIe Server Graphics Accelerator 900-21001-0000-000', 3899.99, 'laptopsforles', 99.9, 18700, '198544808888'),
      listing('NVIDIA A100 40GB HBM2e PCIe 4.0 x16 CUDA Tensor Core GPU', 4099, 't-traderz', 99.9, 18400, '236960469092'),
    ],
  },
  { productId: 'nvidia-rtx-5090-d-v2', observedAt, searchUrl: search('NVIDIA GeForce RTX 5090 D V2 24GB used'), listings: [] },
  {
    productId: 'nvidia-rtx-pro-5000-blackwell-48', observedAt: '2026-08-12', searchUrl: search('NVIDIA RTX PRO 5000 Blackwell 48GB used'), listings: [
      listing('NVIDIA RTX PRO 5000 Blackwell 48GB GDDR7 PCIe 5.0 Professional Workstation GPU', 7619.99, 'Backup Servers', 99.3, 1389, '306920013536'),
    ],
  },
  { productId: 'nvidia-rtx-pro-5000-blackwell-72', observedAt, searchUrl: search('NVIDIA RTX PRO 5000 Blackwell 72GB used'), listings: [] },
  {
    productId: 'amd-instinct-mi100', observedAt, searchUrl: search('AMD Instinct MI100 32GB GPU used'), listings: [
      listing('AMD 102-D34228 MI100 Radeon 32GB HBM2 GPU', 749.95, 'core4solutions', 99.9, 19000, '166987123551'),
      listing('AMD Radeon Instinct MI100 32GB HBM2 PCIe 4.0', 950, 'thesouthtrail', 100, 156, '117339345298'),
      listing('AMD Radeon Instinct MI100 32GB HBM2 PCIe 4.0 Professional Graphics Card', 999, 'egoods.supply', 99.9, 24200, '285796378466'),
    ],
  },
  {
    productId: 'nvidia-tesla-v100s-pcie-32', observedAt, searchUrl: search('NVIDIA Tesla V100S PCIe 32GB GPU used'), listings: [
      listing('Dell NVIDIA Tesla V100S PCIe 32GB HBM2 Volta GPU Accelerator', 1049.99, 'enviroit', 99.8, 11200, '198372771385'),
      listing('NVIDIA Tesla V100S 32GB PCIe GPU 699-2G500-0212-400', 1099, 'rhinotechnology', 99.9, 12000, '306893001118'),
      listing('NVIDIA Tesla V100S 32GB HBM2 PCIe 3.0 Graphics Card', 1179, 'e-dealsglobal', 99.4, 163, '206417030678'),
    ],
  },
  {
    productId: 'amd-instinct-mi50-32', observedAt, searchUrl: search('AMD Radeon Instinct MI50 32GB GPU used'), listings: [
      listing('AMD Radeon Instinct MI50 Accelerator 32GB HBM2 Machine Learning HPC AI GPU', 588.50, 'maybe456', 99.8, 414, '198275937530'),
    ],
  },
  { productId: 'amd-instinct-mi60', observedAt, searchUrl: search('AMD Instinct MI60 32GB GPU used'), listings: [] },
  {
    productId: 'nvidia-rtx-3090-ti', observedAt, searchUrl: search('NVIDIA RTX 3090 Ti Founders Edition 24GB used'), listings: [
      listing('NVIDIA GeForce RTX 3090 Ti Founders Edition 24GB GDDR6X Original Box Tested', 1399, 'ithgsn', 100, 106, '206458155672'),
      listing('NVIDIA GeForce RTX 3090 Ti Founders Edition 24GB Used For Games No Mining', 1550, 'tcgprouwu', 99.5, 1500, '178145727575'),
    ],
  },
  {
    productId: 'nvidia-rtx-4090-d', observedAt, searchUrl: search('NVIDIA GeForce RTX 4090 D 24GB GPU used'), listings: [
      listing('Colorful iGame GeForce RTX 4090 D 24GB Vulcan W GPU GDDR6X Graphics Card', 3115.46, 'sinobright', 99.8, 22200, '186373055240'),
    ],
  },
  {
    productId: 'nvidia-rtx-4090', observedAt: '2026-08-13', searchUrl: search('NVIDIA GeForce RTX 4090 Founders Edition 24GB used'), listings: [
      listing('NVIDIA GeForce RTX 4090 FOUNDERS EDITION 24GB PG136D GDDR6X 900-1G136-2530 GPU', 2499.99, 'surpluserecycle', 99.4, 8823, '336439993912'),
      listing('NVIDIA GeForce RTX 4090 Founders Edition 24GB GDDR6X Graphics Card, Original Box', 2950, 'declutter depot', 98.8, 1303, '227322459967'),
      listing('NVIDIA GeForce RTX 4090 Founders Edition Video Graphics Card 24GB GDDR6X GPU', 4100, 'plusboards', 99.7, 3203, '306427254613'),
    ],
  },
  {
    productId: 'nvidia-rtx-5880-ada', observedAt: '2026-08-12', searchUrl: search('NVIDIA RTX 5880 Ada 48GB GPU used'), listings: [
      listing('NVIDIA RTX 5880 ADA Gen 48GB', 4299.95, 'Estradas PC Hardware', 99.8, 5746, '157854479712'),
      listing('NVIDIA RTX 5880 Ada 48GB GDDR6 ECC PCIe 4.0 Graphics Card HP N95508-001', 5150, 'egoods.supply', 99.9, 22550, '287216581332'),
    ],
  },
  {
    productId: 'nvidia-rtx-6000-ada', observedAt, searchUrl: search('NVIDIA RTX 6000 Ada 48GB GPU used'), listings: [
      listing('NVIDIA RTX 6000 Ada 48GB GPU GDDR6 PCIe 4.0 x16 Graphics Card', 10153, 'a71852-22', 100, 365, '317485988621'),
    ],
  },
  { productId: 'amd-rx-7900-xtx', observedAt, searchUrl: search('AMD Radeon RX 7900 XTX 24GB GPU used'), listings: [] },
  {
    productId: 'nvidia-rtx-3090', observedAt, searchUrl: search('NVIDIA RTX 3090 Founders Edition 24GB used'), listings: [
      listing('NVIDIA GeForce RTX 3090 Founders Edition 24GB GDDR6X', 1242.64, 'krafty.designs', 100, 518, '267752643332'),
      listing('NVIDIA Founders Edition GeForce RTX 3090 24GB FE GPU', 1299, 'it_clearance_and_more', 99.8, 648, '800472583742'),
      listing('NVIDIA GeForce RTX 3090 Founders Edition 24GB GDDR6 Graphics Card', 1350, 'ac14hutson', 100, 371, '117347745872'),
    ],
  },
  { productId: 'nvidia-a30', observedAt, searchUrl: search('NVIDIA A30 24GB GPU accelerator used'), listings: [] },
  {
    productId: 'nvidia-tesla-v100-pcie-32', observedAt, searchUrl: search('NVIDIA Tesla V100 PCIe 32GB GPU used'), listings: [
      listing('NVIDIA Tesla V100 32GB HBM2 PCIe GPU CUDA Computing Accelerator Graphics Card', 639, 'e-dealsglobal', 99.4, 163, '206345870653'),
      listing('NVIDIA Tesla V100 32GB HBM2 PCIe GPU CUDA Computing Accelerator Graphics Card', 644.98, 'ebl-2377', 99.8, 3900, '407093226208'),
    ],
  },
  { productId: 'nvidia-rtx-pro-4500-blackwell', observedAt, searchUrl: search('NVIDIA RTX PRO 4500 Blackwell 32GB GPU used'), listings: [] },
  {
    productId: 'nvidia-quadro-gv100', observedAt, searchUrl: search('NVIDIA Quadro GV100 32GB GPU used'), listings: [
      listing('NVIDIA Quadro GV100 32GB HBM2 PCIe 3.0 x16 Volta Graphics Card', 1299.88, 'jiawen2018', 99.6, 58100, '147473133957'),
      listing('Lenovo NVIDIA Quadro GV100 32GB HBM2 Professional Graphics Video Card GPU', 1349.99, 'cirkadis-formerly-semsotai', 99.9, 17900, '198399929325'),
    ],
  },
  { productId: 'nvidia-l20', observedAt: '2026-08-12', searchUrl: search('NVIDIA L20 48GB GPU accelerator used'), listings: [] },
  {
    productId: 'nvidia-l40', observedAt, searchUrl: search('NVIDIA L40 48GB GPU accelerator used'), listings: [
      listing('NVIDIA Tesla L40 48GB GDDR6 PCIe 4.0 x16 Deep Learning Graphics Card', 6699, 'egoods.supply', 99.9, 24200, '287139005856'),
      listing('NVIDIA Tesla L40 48GB Deep Learning GPU Computing Graphics Card', 7059, 'cloud_storage_corp', 99.9, 25700, '177572684892'),
    ],
  },
  {
    productId: 'nvidia-l40s', observedAt, searchUrl: search('NVIDIA L40S 48GB GPU accelerator used'), listings: [
      listing('NVIDIA L40S GPU Accelerator 48GB GDDR6 Passive AI 699-2G133-0242-L00', 5819.95, 'techbuyer_usa_outlet', 99.6, 6200, '178383129892'),
      listing('NVIDIA L40S 48GB GDDR6 PCIe 4.0 GPU Graphics Card Ada 900-2G133-0080-000', 5999.99, 'qualitymemorycpu', 99.7, 6100, '188539094888'),
      listing('NVIDIA Tesla L40S 48GB GDDR6 PCIe 4.0 x16 Enterprise AI GPU', 6409.99, 'techsupplypro', 100, 807, '407106401084'),
    ],
  },
  { productId: 'amd-radeon-pro-w7800-48', observedAt: '2026-08-12', searchUrl: search('AMD Radeon PRO W7800 48GB GPU used'), listings: [] },
  {
    productId: 'amd-radeon-pro-w7900', observedAt, searchUrl: search('AMD Radeon PRO W7900 48GB GPU used'), listings: [
      listing('AMD Radeon PRO W7900 48GB', 3280, 'karsonshen', 100, 667, '257500825394'),
      listing('AMD Radeon PRO W7900 48GB GDDR6 Graphics Card', 3495, 'theparisa', 100, 125, '188376780701'),
    ],
  },
  { productId: 'amd-radeon-pro-w7900-dual-slot', observedAt: '2026-08-12', searchUrl: search('AMD Radeon PRO W7900 Dual Slot 48GB GPU used'), listings: [] },
  { productId: 'nvidia-rtx-pro-4500-blackwell-server', observedAt, searchUrl: search('NVIDIA RTX PRO 4500 Blackwell Server Edition 32GB used'), listings: [] },
  { productId: 'nvidia-rtx-a5000', observedAt, searchUrl: search('NVIDIA RTX A5000 24GB GPU used'), listings: [] },
  {
    productId: 'nvidia-rtx-a5500', observedAt, searchUrl: search('NVIDIA RTX A5500 24GB GPU used'), listings: [
      listing('PNY NVIDIA RTX A5500 24GB GDDR6 Graphics Card', 2800, 'miyoungbar', 99.3, 1000, '188733879280'),
    ],
  },
  {
    productId: 'nvidia-rtx-a6000', observedAt, searchUrl: search('NVIDIA RTX A6000 48GB GPU used'), listings: [
      listing('NVIDIA RTX A6000 48GB GDDR6 384-bit GPU Graphics Card', 3990, 'egoods.supply', 99.9, 24200, '285486380105'),
    ],
  },
  {
    productId: 'nvidia-a40', observedAt, searchUrl: search('NVIDIA A40 48GB GPU accelerator used'), listings: [
      listing('NVIDIA A40 48GB GDDR6 699-2G133 2-slot Server Graphics Card CUDA GPU', 3950, 'otechparts', 98.7, 614, '128006168900'),
      listing('NVIDIA A40 48GB GPU Dell OEM PCIe 4.0 Workstation AI Card', 4300, 'greenonlinesales', 99.9, 5900, '178275785084'),
    ],
  },
  { productId: 'nvidia-quadro-rtx-6000', observedAt, searchUrl: search('NVIDIA Quadro RTX 6000 24GB GPU used'), listings: [] },
  { productId: 'nvidia-quadro-rtx-6000-server', observedAt, searchUrl: search('NVIDIA Quadro RTX 6000 Server Edition 24GB GPU used'), listings: [] },
  {
    productId: 'nvidia-quadro-rtx-8000', observedAt, searchUrl: search('NVIDIA Quadro RTX 8000 48GB GPU used'), listings: [
      listing('NVIDIA Quadro RTX 8000 48GB GDDR6 PCIe GPU 699-2G150-0231-302 Tested', 2000, 'tarponking', 98, 189, '358909538411'),
      listing('NVIDIA Quadro RTX 8000 Turing GPU 48GB Graphics Video Card', 2099, 'jiawen2018', 99.6, 58100, '137569473618'),
    ],
  },
  {
    productId: 'nvidia-quadro-rtx-8000-server', observedAt, searchUrl: search('NVIDIA Quadro RTX 8000 Server Edition 48GB GPU used'), listings: [
      listing('Dell NVIDIA Quadro RTX 8000 Passive 48GB GDDR6 Server GPU 8VJMK', 1999, 'reservertech', 99.9, 6600, '127948483050'),
      listing('Dell NVIDIA Quadro RTX 8000 48GB GDDR6 Turing Server GPU', 2296.18, 'techbuyer_computing', 100, 4800, '366596677033'),
    ],
  },
  { productId: 'nvidia-rtx-pro-4000-blackwell', observedAt, searchUrl: search('NVIDIA RTX PRO 4000 Blackwell 24GB GPU used'), listings: [] },
  {
    productId: 'nvidia-titan-rtx', observedAt, searchUrl: search('NVIDIA TITAN RTX 24GB GPU used'), listings: [
      listing('NVIDIA Titan RTX 24GB GDDR6 PCIe 3.0 Video Graphics Card', 799.99, 'josep-swear', 100, 725, '287411787118'),
      listing('NVIDIA Titan RTX 24GB GPU GDDR6 PCIe 3.0 CUDA', 849.02, 'yibaotong2026', 100, 456, '236929369711'),
      listing('NVIDIA Titan RTX 24GB GPU GDDR6 PCIe 3.0 CUDA', 849.73, 'yibaotong26', 100, 985, '318567336842'),
    ],
  },
  { productId: 'amd-radeon-ai-pro-r9600', observedAt, searchUrl: search('AMD Radeon AI PRO R9600 32GB GPU used'), listings: [] },
  { productId: 'amd-radeon-ai-pro-r9600d', observedAt, searchUrl: search('AMD Radeon AI PRO R9600D 32GB GPU used'), listings: [] },
  { productId: 'amd-radeon-ai-pro-r9700', observedAt, searchUrl: search('AMD Radeon AI PRO R9700 32GB GPU used'), listings: [] },
  { productId: 'amd-radeon-ai-pro-r9700s', observedAt, searchUrl: search('AMD Radeon AI PRO R9700S 32GB GPU used'), listings: [] },
  { productId: 'amd-rx-9070', observedAt, searchUrl: search('AMD Radeon RX 9070 16GB GPU used'), listings: [] },
  { productId: 'amd-rx-9070-xt', observedAt, searchUrl: search('AMD Radeon RX 9070 XT 16GB GPU used'), listings: [] },
  { productId: 'nvidia-a10', observedAt, searchUrl: search('NVIDIA A10 24GB GPU accelerator used'), listings: [] },
  { productId: 'nvidia-rtx-5000-ada', observedAt, searchUrl: search('NVIDIA RTX 5000 Ada 32GB GPU used'), listings: [] },
  {
    productId: 'amd-radeon-pro-w7800-32', observedAt, searchUrl: search('AMD Radeon PRO W7800 32GB GPU used'), listings: [
      listing('AMD Radeon PRO W7800 32GB', 1450, 'karsonshen', 100, 667, '257593446267'),
    ],
  },
  { productId: 'amd-radeon-pro-v620', observedAt, searchUrl: search('AMD Radeon PRO V620 32GB GPU used'), listings: [] },
  {
    productId: 'amd-radeon-pro-w6800', observedAt, searchUrl: search('AMD Radeon PRO W6800 32GB GPU used'), listings: [
      listing('AMD Radeon PRO W6800 32GB GDDR6 Workstation GPU Dell 53J93', 999, 'a162253', 100, 111, '407112273472'),
      listing('AMD Radeon PRO W6800 32GB GDDR6 Desktop Video Graphics Card', 999, 'naturalevolution', 99.8, 12900, '377394694415'),
    ],
  },
  { productId: 'amd-radeon-pro-v340', observedAt, searchUrl: search('AMD Radeon PRO V340 32GB GPU used'), listings: [] },
  {
    productId: 'amd-radeon-pro-v710', observedAt, searchUrl: search('AMD Radeon PRO V710 28GB GPU used'), listings: [
      listing('AMD Radeon PRO V710 28GB GDDR6 PCIe x16 Accelerator Card', 1299, 'maravi_canada', 100, 7000, '178308126343'),
    ],
  },
  {
    productId: 'nvidia-quadro-p6000', observedAt, searchUrl: search('NVIDIA Quadro P6000 24GB GPU used'), listings: [
      listing('NVIDIA Quadro P6000 24GB GDDR5X PCIe 3.0 x16 Video Card', 399.99, 'tci_surplus', 100, 8400, '227445869653'),
      listing('NVIDIA Quadro P6000 24GB GDDR5X Graphics Card', 429, 'beverlycos', 100, 632, '336676501575'),
      listing('NVIDIA Quadro P6000 24GB GDDR5X PCIe 3.0 x16 Graphics Card', 450, 'gwzllc2008', 100, 14400, '377362424825'),
    ],
  },
  { productId: 'nvidia-rtx-4500-ada', observedAt, searchUrl: search('NVIDIA RTX 4500 Ada 24GB GPU used'), listings: [] },
  { productId: 'nvidia-rtx-pro-4000-blackwell-sff', observedAt, searchUrl: search('NVIDIA RTX PRO 4000 Blackwell SFF 24GB GPU used'), listings: [] },
  { productId: 'nvidia-tesla-p40', observedAt, searchUrl: search('NVIDIA Tesla P40 24GB GPU used'), listings: [] },
  { productId: 'amd-firepro-s9170', observedAt, searchUrl: search('AMD FirePro S9170 32GB GPU used'), listings: [] },
  {
    productId: 'amd-firepro-w9100-32', observedAt, searchUrl: search('AMD FirePro W9100 32GB GPU used'), listings: [
      listing('AMD FirePro W9100 32GB GDDR5 Graphics Card Dell JCCHH', 269.95, 'intechar', 100, 13500, '236518527240'),
    ],
  },
  {
    productId: 'nvidia-quadro-m6000-24', observedAt, searchUrl: search('NVIDIA Quadro M6000 24GB GPU used'), listings: [
      listing('Dell NVIDIA Quadro M6000 24GB GDDR5 Graphics Card', 399, 'fcelect', 99.7, 15200, '277855210907'),
      listing('Dell NVIDIA Quadro M6000 24GB 2VJF4', 469.99, 'itserverexchange', 99.9, 6000, '127559605013'),
      listing('NVIDIA Quadro M6000 24GB GDDR5 PCIe 3.0 x16 Graphics Card GPU', 518.67, 'itinstock', 100, 37700, '366576154513'),
    ],
  },
  { productId: 'nvidia-l4', observedAt, searchUrl: search('NVIDIA L4 24GB GPU accelerator used'), listings: [] },
  {
    productId: 'nvidia-tesla-m40-24', observedAt, searchUrl: search('NVIDIA Tesla M40 24GB GPU used'), listings: [
      listing('NVIDIA Tesla M40 24GB GDDR5 PCIe 3.0 x16 Accelerator Card', 149.88, 'cs-depot', 99.7, 28000, '236116273675'),
      listing('NVIDIA Tesla M40 24GB GPU Accelerator Data Center Pull Tested', 149.99, 'pwotec', 100, 390, '298574515552'),
      listing('NVIDIA Tesla M40 24GB GPU Card GDDR5 PCIe Graphics Card', 162.91, 'wmxenl', 100, 218, '157942658149'),
    ],
  },
  {
    productId: 'nvidia-tesla-k80', observedAt, searchUrl: search('NVIDIA Tesla K80 24GB GPU used'), listings: [
      listing('Dell NVIDIA Tesla K80 24GB GDDR5 GPU Accelerator Card No Bracket', 59.99, 'garlandcomputer', 99.9, 101800, '298579853419'),
      listing('Dell NVIDIA Tesla K80 24GB GDDR5 GPU Accelerator Card', 74.99, 'garlandcomputer', 99.9, 101800, '236866079658'),
    ],
  },
  {
    productId: 'amd-radeon-pro-duo-polaris', observedAt, searchUrl: search('AMD Radeon Pro Duo Polaris 32GB GPU used'), listings: [
      listing('AMD Radeon Pro Duo Polaris 32GB Graphics Card Minor Scratches', 329.99, 'wazno', 99.7, 41300, '128019513362'),
      listing('AMD Radeon Pro Duo 32GB GDDR5 Graphics Card', 360, 'udd2008', 99.5, 18500, '226829831304'),
      listing('AMD Radeon Pro Duo 32GB GDDR5 Graphics Card', 360, 'xqc228', 99.5, 1700, '315512203675'),
    ],
  },
  {
    productId: 'nvidia-a16', observedAt, searchUrl: search('NVIDIA A16 64GB GPU accelerator used'), listings: [
      listing('Dell NVIDIA Ampere A16 64GB GDDR6 PCIe GPU', 2359.99, 'tekzilla_sales', 99.9, 8800, '327303624809'),
      listing('NVIDIA Tesla A16 64GB GDDR6 GPU Accelerator PCIe 4.0 Server Card', 2749.97, 'sbcgadgets1', 99.9, 10000, '127943629166'),
      listing('NVIDIA Tesla A16 64GB GDDR6 GPU Accelerator PCIe 4.0', 2800, 'kefab6080', 100, 130, '168265928354'),
    ],
  },
  {
    productId: 'nvidia-tesla-m10', observedAt, searchUrl: search('NVIDIA Tesla M10 32GB GPU used'), listings: [
      listing('NVIDIA Tesla M10 32GB PCIe 3.0 x16 GPU Accelerator', 70, 'kefab6080', 100, 130, '168341938096'),
      listing('NVIDIA Tesla M10 32GB GDDR5 PCIe GPU Accelerator', 72, 'larcap-30', 98.9, 242, '206475952283'),
      listing('Cisco NVIDIA Tesla M10 32GB GDDR5 PCIe 3.0 GPU Accelerator', 72, 'larcap-30', 98.9, 242, '206475953646'),
    ],
  },
];

const excludedGpuIds = new Set([
  'nvidia-rtx-3060-ti',
  'nvidia-rtx-3070',
  'nvidia-rtx-3070-ti',
  'nvidia-rtx-3080',
  'nvidia-rtx-4060',
  'nvidia-rtx-4060-ti-8',
  'nvidia-rtx-5060-ti-8',
  'nvidia-rtx-5060',
  'nvidia-rtx-5050',
  'nvidia-tesla-m10',
  ...userExcludedGpuIds,
]);

export const ebayUsedMarketSeeds = ebayUsedMarketResearch
  .filter((snapshot) => !excludedGpuIds.has(snapshot.productId));
