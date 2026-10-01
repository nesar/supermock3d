---
layout: text
part: Part 2 · Dataset
---
# Storage format and its effect on photometry

SEDs of every patch except patch 0 are stored compacted; patch 0 keeps the original float32 spectra as the reference. The stored 159-band photometry was computed **before** compaction from the full-resolution spectra, so it is unaffected; the table applies to anyone recomputing photometry from the stored SEDs.

| | original | compacted |
|---|---|---|
| grid | 11,149 rest points (C3K native) | 5,159 points: $R$ = 1000 for 0.09–6 µm rest, $R$ = 100 outside |
| values | float32, Jy | float16, mJy (flux-conserving bin means) |
| size per patch | ~1.6 TB | ~0.37 TB |

| recomputed photometry, compacted vs original | p99 error |
|---|---|
| broad bands (LSST, WISE, 2MASS) | < 1 mmag |
| SPHEREx channels, $z$ < 1 | 0.6 mmag |
| SPHEREx channels, $z$ > 2 strong-line emitters | ~30 mmag (max 75), when Hα sits at a channel edge |

<p class="note">Files describe themselves (attributes <code>sed_units</code>, <code>sed_dtype</code>, <code>sed_format</code>, bin edges in <code>wave_edges</code>); the loader and photometry code read either format.</p>
