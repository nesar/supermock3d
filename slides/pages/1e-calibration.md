---
layout: text
part: Part 1 · Dust calibration
---
# Dust calibration: the one tuned step

**Objective** (lower is better), evaluated on a dustless library of galaxies drawn from a lightcone patch itself (volume weighted, painter-identical chain), re-attenuated for each trial parameter set:

1. SDSS ($z$ < 0.4) and DEEP2 ($z$ < 1.4): 1-D Wasserstein distances of $u-g$, $g-i$, $r-i$, $i-z$ per redshift bin, inside each survey's magnitude window, after adding per-object errors resampled from the survey.
2. WISE × SuperCOSMOS photo-$z$ galaxies: W1−W2 and W2−W3 per redshift bin (W3−W4 excluded: the W4 requirement makes that sample W4-flux-limited and AGN-biased).
3. **Absolute counts**: mean |log N$_{\rm mock}(r)$ − log N$_{\rm LF}(r)$| for 15 < $r$ < 19.5, with N$_{\rm LF}$ from the Blanton+03 $^{0.1}r$ luminosity function over the same volume.

| version (July 2026) | dustless library | outcome |
|---|---|---|
| v2: colours + WISE | training-set SFHs | $b$ = 0.57, $e$ = 0.17: $A_i$ up to 1.8 mag on massive quiescent galaxies, ~5× deficit of bright galaxies |
| v3: + count term | patch-30 count library | count term 0.42 → 0.07 dex; mass and sSFR slopes go to ~0 |
| v4: patch-native | patch 32, then patch 4 | production: $\tau_V = 0.41(1+z)^{0.58}$, Calzetti-like curve |

<p class="note">The colour terms alone prefer dusty massive galaxies to redden the red sequence; the counts show that this removes bright galaxies that are observed. With both terms the data do not support a mass or sSFR dependence of $\tau_V$ in this model.</p>
