---
title: P0 reprocessed sources — canonical ID reconciliation
document_id: DOC-0071
category: research
status: verified_source_reconciliation
load_priority: on_request
last_reviewed: 2026-08-13
---

# P0 reprocessed sources — canonical ID reconciliation

The intake branch used `paper_009`–`paper_013`, which collide with existing canonical literature IDs. A second namespace audit during full-PDF reprocessing also found that `literature_database.md` already assigns `paper_021` to Ho & Suzuki (2019), *Technology of Mushroom Cultivation*. That existing ID is preserved.

| Canonical ID | Intake alias | Source |
|---|---|---|
| `paper_021` | — | Ho & Suzuki 2019, *Technology of Mushroom Cultivation*, DOI 10.15625/2525-2518/57/3/12954 |
| `paper_022` | `paper_009` | Rocha et al. 2025, *Impact of Substrate Amount and Fruiting Induction Methods in Lentinula edodes Cultivation*, DOI 10.3390/horticulturae11080915 |
| `paper_023` | `paper_010` | Gaitán-Hernández, Cortés & Mata 2014, *Improvement of yield of Lentinula edodes on wheat straw by use of supplemented spawn*, DOI 10.1590/S1517-83822014000200013 |
| `paper_024` | `paper_011` | Atila 2019, *The use of phenolic-rich agricultural wastes for Hericium erinaceus and Lentinula edodes cultivation*, DOI 10.20289/zfdergi.528957 |
| `paper_025` | `paper_012` | Holgado-Rojas et al. 2019, *Cultivo de Pleurotus sp. y Lentinula edodes bajo condiciones artesanales en comunidades campesinas de la Región Cusco / Perú*, DOI 10.21704/rea.v18i2.1331 |
| `paper_026` | `paper_013` | Shi et al. 2026, *Physics-Guided Machine Learning for Predicting the Internal Temperature of Mushroom Bags*, DOI 10.3390/agriculture16131454 |

Promotion-facing Knowledge Base references use `paper_022`–`paper_026` for the five P0 sources. Old intake aliases may remain only in raw PDF/OCR/claim-locator paths for audit continuity.

The full-source integration is documented in `p0_full_pdf_reprocessing_2026-08-13.md` (`DOC-0072`). None of these sources independently authorizes an SOP or universal setpoint.
