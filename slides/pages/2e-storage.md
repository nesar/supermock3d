---
layout: figure-left
part: Part 2 · Dataset
---
# Sky coverage and storage

**Status (October 2026):** 19 patches complete (4,082 deg², 683 M galaxies to $z$ = 5.5), each with a spectrum, 159 AB magnitudes and rest-frame luminosities per galaxy. Patches 12, 15–20, 23 and 27–30 wait for disk space.

![Sky footprint](figs/footprint_mollweide.png)

Caption: The core lightcone is cut into 192 equal-area patches of 214.9 deg². Filled patches have the full product set (catalog, spectra, photometry, luminosities, validation report).

|||

<div class="small">

The spectra of every patch except patch 0 are stored compacted. Patch 0 keeps the original float32 spectra as the reference. The 159-band photometry and the luminosities were computed **before** compaction, so they are not affected. The second table applies to photometry recomputed from the stored spectra.

| | original | compacted |
|---|---|---|
| grid | 11,149 rest points | 5,161 points: $R$ = 1000 at 0.09–6 µm rest, 100 outside |
| values | float32, Jy | float16, mJy (flux-conserving bin means) |
| per patch | about 1.6 TB | about 0.37 TB |

| recomputed from compact spectra | p99 error |
|---|---|
| broad bands (LSST, WISE, 2MASS) | below 1 mmag |
| SPHEREx channels, $z$ < 1 | 0.6 mmag |
| SPHEREx, $z$ > 2 strong-line emitters | about 30 mmag (max 75): Hα at a channel edge |
| rest-frame magnitudes, $L_{\rm bol}$ (patch-0 test) | below 1 mmag; $L_{8-33\,\mu\rm m}$ 1.5% high |

</div>

<p class="note">The files describe themselves (<code>sed_units</code>, <code>sed_dtype</code>, <code>sed_format</code>, <code>wave_edges</code>). The loader and the photometry code read both formats. The luminosity code reads only the original format.</p>
