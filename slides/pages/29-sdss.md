---
layout: figure-left
part: Part 2 · Validation
---
# Optical colours vs SDSS

![SDSS corner](figs/val_corner_sdss.png)

|||

- Mock: random draw inside 13.4 < $i$ < 20.3, $z$ < 0.42, true SDSS filters, survey errors added. SDSS: its own spectroscopic selection (brighter, lower $z$), so the $i$ and $z$ marginals differ by design; the mock is not re-weighted.
- $r-i$ and $i-z$ agree (medians 0.42 / 0.33 vs 0.45 / 0.33).
- **$u-g$ is too blue** (median 1.0 vs 1.8) and **$g-i$ too red with too many red galaxies** (median 1.42 vs 1.00; 46% vs 24% above $g-i$ = 1.5).
- Part of the $g-i$ difference is the redshift mismatch (the mock sample is at higher $z$). The $u-g$ offset was already present in the earlier GALAXEV-based mocks; its origin (UV of old populations, residual star formation in quenched UM histories, attenuation curve) is not established.
