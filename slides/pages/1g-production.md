---
layout: text
part: Part 1 · Production
---
# Production and data products

| stage | parallel layout | wall time per patch |
|---|---|---|
| 1 catalog (features + matching) | 8 node-shards over forest files | ~45 min |
| 2 painting (FSPS-C3K) | 8–32 node-shards × 64 FSPS workers, ~580 gal/s/node | ~65 min |
| 3 photometry + luminosities | 16 processes, 100k-galaxy chunks | ~30 min |
| 4 validation report | 1 node | ~20 min |

Checkpoints: a killed paint shard resumes bit-identically; the canonical SED file is an HDF5 virtual dataset over the shards.

| files (19 patches) | per galaxy | volume |
|---|---|---|
| `lightcone_galaxies_skypatch_<P>.h5` | RA, Dec, $z_{\rm obs}$, x, y, z, v, class, MAH (101), SFH (117), $M_*$ | 0.9 TB |
| `seds_skypatch_<P>.h5` | $f_\nu$, 11,149 points (float32 Jy) or 5,159 points (float16 mJy) | 9.0 TB |
| `photometry_skypatch_<P>.h5` | 159 AB magnitudes | 0.34 TB |
| `luminosities_skypatch_<P>.h5` | rest $M_{\rm AB}$ (SDSS, WISE), $L_{\rm bol}$, $L_{8-33}$ | 0.03 TB |

<p class="note">SED compaction (Sep 2026): flux-conserving rebin to R = 1000 at 0.09–6 µm rest and R = 100 elsewhere, stored as float16 mJy, 4.3× smaller. Patch 0 keeps the full-resolution float32 reference.</p>
