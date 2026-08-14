# Hardware documentation audit

**Audit date:** 2026-08-14

**Scope:** 290 products in the runtime catalog

**Command:** `npm run audit:docs`

## Outcome

The least-documented hardware was the **consumer motherboard catalog**. Nine of sixteen motherboard records had only marketing-level fields and could not safely answer the questions a homelab builder actually needs: electrical PCIe width, lane sharing, board dimensions, ECC behavior, auxiliary slot power, firmware support, and where to obtain the manual.

The next-largest gaps were nine mainstream desktop CPUs, eight consumer RAM kits, five non-DGX mini PCs, and two Radeon RX 9000 GPUs. Those records linked to product pages for price context, but did not carry the technical fields used by the builder.

After remediation, all 290 products pass the critical documentation gate. Two OEM-controlled NVIDIA cards retain explicit public-documentation exceptions rather than inferred specifications:

| Product | Vendor-published data available | Still not publicly disclosed |
| --- | --- | --- |
| NVIDIA L2 | 24 GB framebuffer and supported vGPU profiles | Memory-bus width and memory bandwidth |
| NVIDIA RTX PRO 6000D Blackwell Server Edition | 84 GB framebuffer profile in NVIDIA vGPU release notes | Memory-bus width and memory bandwidth |

These cards should not be used for bandwidth-per-dollar conclusions until an OEM board data sheet is available.

## What “documented enough” means

Every product must have an official specification source, a dated price source, and the category-specific planning fields below.

| Category | Critical planning evidence |
| --- | --- |
| CPU | Architecture, memory channels/capacity/speed/module type/ECC, PCIe generation and usable lanes |
| Motherboard | CPU compatibility source, dimensions, memory topology/ECC/registered-memory behavior, exact physical and electrical PCIe topology, 4G decoding, IOMMU, networking, and auxiliary PCIe power |
| GPU | VRAM type, bus width, bandwidth, PCIe link, board power, PSU guidance, architecture/generation/segment/year |
| RAM | Registered/unbuffered and ECC/non-ECC status in addition to capacity, speed, timings, and profile |
| Mini PC / personal AI system | Architecture, memory bandwidth, chip power envelope, external/internal power-supply rating, and upgradeability |
| PSU / chassis / cooler | Continuous output and connectors; board/GPU fit; socket and cooling capacity |
| Storage / NIC | Interface throughput, lanes, power, form factor, and endurance where published |
| Server system | Qualified CPUs/OSes, memory and PCIe topology, PSU options, dimensions, and configuration-dependent power guidance |
| Apple system | CPU/GPU cores, unified-memory capacity and bandwidth, storage, maximum system power, and upgradeability |

An empty array is intentional evidence of “none” (for example, no auxiliary PCIe power connector). `0` and `false` are also valid documented values. An absent field means unknown and fails the audit unless the exception is explicitly recorded in the audit script with a primary-source explanation.

## Motherboard manuals and compatibility downloads

Use the exact revision printed on the motherboard. Manuals remain linked from the manufacturer rather than copied into this repository, so users receive current errata and the repository does not redistribute vendor documents.

| Board | Specification/manual download | CPU support or topology evidence |
| --- | --- | --- |
| ASUS ROG Strix X870E-E Gaming WiFi | [ASUS user manual PDF](https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/ROG_STRIX_X870E-E_GAMING_WIFI/E25504_ROG_STRIX_X870E-E_GAMING_WIFI_EM_V2_WEB.pdf?model=ROG%20STRIX%20X870E-E%20GAMING%20WIFI) | [ASUS CPU support](https://rog.asus.com/us/motherboards/rog-strix/rog-strix-x870e-e-gaming-wifi/helpdesk_qvl_cpu/) |
| ASUS TUF Gaming B650-Plus WiFi | [ASUS user manual PDF](https://dlcdnets.asus.com/pub/ASUS/mb/Socket%20AM5/TUF%20GAMING%20B650-PLUS%20WIFI/E21902_TUF_GAMING_B650-PLUS_WIFI_UM_V3_WEB.pdf) | [ASUS CPU support](https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/helpdesk_qvl_cpu/) |
| GIGABYTE B650M AORUS ELITE AX rev. 1.3 | [GIGABYTE revision-specific specifications](https://www.gigabyte.com/us/Motherboard/B650M-AORUS-ELITE-AX-rev-13/sp) | [GIGABYTE support/download page](https://www.gigabyte.com/Motherboard/B650M-AORUS-ELITE-AX-rev-13/support#support-cpu) |
| ASRock B650I Lightning WiFi | [ASRock user manual PDF](https://download.asrock.com/Manual/B650I%20Lightning%20WiFi.pdf) | [ASRock AM5 PCIe/M.2 bandwidth table](https://pg.asrock.com/Support/QA/AMD_600_PCIe.M.2_Bandwidth_Table.pdf) |
| ASUS Prime Z890-P WiFi | [ASUS user manual PDF](https://dlcdnets.asus.com/pub/ASUS/mb/LGA1851/PRIME%20Z890-P%20WIFI/E24237_PRIME_Z890-P_WIFI_EM_WEB.pdf?model=PRIME+Z890-P+WIFI-CSM) | [ASUS CPU support](https://www.asus.com/us/motherboards-components/motherboards/prime/prime-z890-p-wifi/helpdesk_qvl_cpu/) |
| MSI PRO Z890-S WiFi | [MSI user manual PDF](https://download.msi.com/archive/mnu_exe/mb/PROZ890-SWIFI_PROZ890-SWIFIWHITE_English.pdf) | [MSI CPU support](https://www.msi.com/Motherboard/PRO-Z890-S-WIFI/support#cpu) |
| MSI MAG B760 Tomahawk WiFi DDR4 | [MSI user manual PDF](https://download-2.msi.com/archive/mnu_exe/mb/MAGB760TOMAHAWKWIFIDDR4.pdf) | [MSI CPU support](https://www.msi.com/Motherboard/MAG-B760-TOMAHAWK-WIFI-DDR4/support#cpu) |
| GIGABYTE Z790 AORUS ELITE X WiFi7 | [GIGABYTE user manual PDF](https://download.gigabyte.com/FileList/Manual/mb_manual_z790-aorus-elite-x-ax-wifi7_1201_e.pdf) | [GIGABYTE CPU support](https://www.gigabyte.com/Motherboard/Z790-AORUS-ELITE-X-WIFI7/support#support-cpu) |
| MSI B550M PRO-VDH WiFi | [MSI specifications](https://www.msi.com/Motherboard/B550M-PRO-VDH-WIFI/Specification) | [MSI CPU support and manual downloads](https://www.msi.com/Motherboard/B550M-PRO-VDH-WIFI/support#cpu) |
| ASUS Pro WS WRX90E-SAGE SE | [ASUS user manual PDF](https://dlcdnets.asus.com/pub/ASUS/mb/SocketsTR5/Pro_WS_WRX90E-SAGE_SE/E22564_Pro_WS_WRX90E-SAGE_SE_EM_WEB.pdf) | [ASUS CPU support](https://www.asus.com/motherboards-components/motherboards/workstation/pro-ws-wrx90e-sage-se/helpdesk_qvl_cpu/) |
| ASUS Pro WS WRX80E-SAGE SE WiFi | [ASUS user manual PDF](https://dlcdnets.asus.com/pub/ASUS/mb/SocketTRX4/Pro_WS_WRX80E-SAGE_SE_WIFI/E19401_Pro_WS_WRX80E-SAGE_SE_WIFI_UM_V2_WEB.pdf) | [ASUS CPU support](https://www.asus.com/motherboards-components/motherboards/workstation/pro-ws-wrx80e-sage-se-wifi/helpdesk_cpu/) |
| GIGABYTE MC62-G40 rev. 1.x | [GIGABYTE user manual PDF](https://download.gigabyte.com/FileList/Manual/server_manual__MC62-G40_e_1001.pdf) | [GIGABYTE CPU QVL PDF](https://download.gigabyte.com/FileList/QVL/mb_qvl_MC62-G40_G41_v1.2.pdf) |
| ASUS Pro WS TRX50-SAGE WiFi | [ASUS user manual PDF](https://dlcdnets.asus.com/pub/ASUS/mb/SocketsTR5/Pro_WS_TRX50-SAGE_WIFI/E23017_Pro_WS_TRX50-SAGE_WIFI_EM_V2_WEB.pdf) | [ASUS CPU support](https://www.asus.com/us/motherboards-components/motherboards/workstation/pro-ws-trx50-sage-wifi/helpdesk_qvl_cpu/) |
| ASUS Pro WS W790E-SAGE SE | [ASUS user manual PDF](https://dlcdnets.asus.com/pub/ASUS/mb/LGA4677/Pro_WS_W790E-SAGE_SE/E22125_Pro_WS_W790E_SAGE_SE_UM_V2_WEB.pdf?model=pro+ws+w790e-sage+se) | [ASUS CPU support](https://www.asus.com/us/motherboards-components/motherboards/workstation/pro-ws-w790e-sage-se/helpdesk_qvl_cpu/) |
| ASUS Pro WS W890-SAGE | [ASUS manual download page](https://www.asus.com/us/motherboards-components/motherboards/workstation/pro-ws-w890-sage/helpdesk_manual/) | [ASUS CPU support](https://www.asus.com/us/motherboards-components/motherboards/workstation/pro-ws-w890-sage/helpdesk_qvl_cpu/) |
| Supermicro H13SSL-NT | [Supermicro user manual PDF](https://www.supermicro.com/manuals/motherboard/H13/MNL-2545.pdf) | [Revision-specific product and CPU support](https://www.supermicro.com/en/products/motherboard/h13ssl-nt) |

## Other weak records and their authoritative sources

- **Mainstream CPUs:** Download specifications from the exact [AMD Ryzen product page](https://www.amd.com/en/products/processors/desktops/ryzen.html) or [Intel ARK processor record](https://www.intel.com/content/www/us/en/ark.html). The audit filled memory topology, ECC behavior, and PCIe lane counts for Ryzen 9000/5000, Core Ultra 200S, and 14th Gen Core entries.
- **Radeon RX 9070 / 9070 XT:** Use AMD's [RX 9070](https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070.html) and [RX 9070 XT](https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070xt.html) pages for compute, memory, and power. Physical fit must come from the selected board partner because AMD does not sell a reference card.
- **Mini PCs:** Use the exact system page for the [GMKtec EVO-X2](https://www.gmktec.com/en/products/amd-ryzen%E2%84%A2-ai-max-395-evo-x2-ai-mini-pc), [Minisforum AI X1 Pro](https://www.minisforum.com/collections/ai-mini-pcs/products/minisforum-ai-x1-pro), [Minisforum AI X1 Pro 470](https://www.minisforum.com/products/ai-x1-pro-470), [ASUS ROG NUC 2025](https://rog.asus.com/us/desktops/mini-pc/rog-nuc-2025/spec/), or [HP Z2 Mini G1a data sheet](https://h20195.www2.hp.com/v2/getpdf.aspx/c09091191.pdf). CPU-only pages are secondary evidence for configurable TDP ranges, not proof of the system's wall draw.
- **Consumer memory:** Use the exact vendor part-number page already stored in each record. The audit now records unbuffered and non-ECC status explicitly; a speed/profile match alone does not prove motherboard QVL compatibility.

## Important remaining SKU checks

Passing the documentation audit does not make generic and configurable products physically interchangeable:

1. **Board-partner GPUs:** length, height, slot width, cooler direction, display outputs, and connector placement must be taken from the exact sold SKU.
2. **Motherboard revision and BIOS:** GIGABYTE and Supermicro revision differences can change CPU support. Check the silkscreened revision before downloading firmware.
3. **Mini-PC configurations:** installed memory/storage and sustained chip power can differ from the platform maximum. PSU rating is capacity, not measured wall consumption.
4. **Server/OEM accelerators:** require the server vendor's qualified-parts list, airflow guide, and power-cable kit. A generic NVIDIA vGPU profile is not a board installation guide.
5. **Memory:** validate the exact DIMM part number and population count against the motherboard QVL, especially RDIMM platforms and four-DIMM overclocked desktop configurations.

## Maintenance policy

Run `npm run audit:docs` whenever hardware is added or edited. A new record must not bypass the gate with an estimate. If a vendor withholds a critical field, add a narrowly scoped exception with the official source and explanation; when the data sheet becomes public, replace the exception with the published value.
