---
layout: figure-left
part: Part 2 · Dataset
---
# Sky coverage and storage format

**Status:** 19 sky patches complete (4,082 deg², 683 M galaxies to $z$ = 5.5), each with an SED, 159 AB magnitudes and rest-frame luminosities per galaxy.

![Sky footprint](figs/footprint_mollweide.png)

Caption: The core lightcone is cut into 192 equal-area patches of 214.9 deg². Filled patches have the full product set (catalog, SEDs, photometry, luminosities, validation report).

|||

<div class="small">

SEDs of every patch except patch 0 are stored compacted; patch 0 keeps the original float32 spectra as the reference. The stored 159-band photometry was computed **before** compaction, so it is unaffected; the second table applies to photometry recomputed from the stored SEDs.

| | original | compacted |
|---|---|---|
| grid | 11,149 rest points | 5,159 points: $R$ = 1000 at 0.09–6 µm rest, 100 outside |
| values | float32, Jy | float16, mJy (flux-conserving bin means) |
| per patch | ~1.6 TB | ~0.37 TB |

| recomputed, compacted vs original | p99 error |
|---|---|
| broad bands (LSST, WISE, 2MASS) | < 1 mmag |
| SPHEREx channels, $z$ < 1 | 0.6 mmag |
| SPHEREx, $z$ > 2 strong-line emitters | ~30 mmag (max 75), Hα at a channel edge |

</div>

<p class="note">Files describe themselves (<code>sed_units</code>, <code>sed_dtype</code>, <code>sed_format</code>, <code>wave_edges</code>); the loader and photometry code read either format.</p>
