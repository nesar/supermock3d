---
layout: text
part: Part 1 · Production
---
# Production and data products

| stage | parallel layout | measured time per patch |
|---|---|---|
| 1 catalog (features + match) | 8 or 16 node jobs over the forest files | 0.6–1.3 h per job (8), 0.25–0.5 h (16) |
| 2 painting (FSPS) | 8 to 32 node jobs × 64 FSPS processes | 2.1 h per job (8), 1.1 h (16), 0.5–0.8 h (32) |
| 3 photometry + luminosities | one node, 16 processes | 0.5–3.7 h each; the spread comes from the shared file system |
| 4 validation report | one node | 20–105 min |

Each stage saves checkpoints. A job that is stopped continues where it was. The canonical spectrum file is an HDF5 virtual dataset that points at the job files.

| files (19 patches) | per galaxy | volume |
|---|---|---|
| `lightcone_galaxies_skypatch_<P>.h5` | RA, Dec, $z_{\rm obs}$, position, velocity, class, mass history (101), SFH (117), $M_*$ | 0.85 TB |
| `seds_skypatch_<P>.h5` | $f_\nu$: 11,149 points (float32, Jy) or 5,161 points (float16, mJy) | 7.6 TB |
| `photometry_skypatch_<P>.h5` | 159 AB magnitudes | 0.34 TB |
| `luminosities_skypatch_<P>.h5` | rest-frame $M_{\rm AB}$ (SDSS, WISE), $L_{\rm bol}$, $L_{8-33}$ | 0.03 TB |

<p class="note">Compaction (September 2026): the spectra are rebinned, flux-conserving, to $R$ = 1000 at 0.09–6 µm rest and $R$ = 100 outside, and stored as float16 in mJy, 4.3× smaller. Patch 0 keeps the full-resolution float32 spectra as the reference.</p>
