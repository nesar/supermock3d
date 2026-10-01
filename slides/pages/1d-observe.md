---
layout: figure-right
part: Part 1 · Spectra
---
# Observing: redshift, dimming, IGM

- Observed flux: $f_\lambda(\lambda_{\rm obs}) = \dfrac{L_\lambda(\lambda_{\rm obs}/(1+z))}{4\pi D_L^2(1+z)}\,e^{-\tau_{\rm IGM}(\lambda_{\rm obs}, z)}$, with $D_L$ in the SMDPL cosmology (consistent with the SFH time grid).
- **IGM:** Madau (1995) with 17 Lyman-series lines, metal blanketing and the Lyman-continuum term, matching FSPS's implementation to machine precision at $z$ = 2.5, 4, 6. It affects $u$ from $z \approx 1.6$ and reaches the SPHEREx band at $z \gtrsim 5$.
- **Storage convention:** $f_\nu$ [Jy] sampled at $\lambda_{\rm obs} = \lambda_{\rm rest}(1+z)$ on the fixed 11,149-point rest grid, with the per-row redshift in the file. Every galaxy therefore maps to the same rest wavelengths.

|||

![IGM](figs/sed_igm.png)

![observed](figs/sed_chain_observed.png)

Caption: Top: IGM transmission. Bottom: the galaxy of the previous slide at $z$ = 1.03 with its synthetic LSST, SPHEREx and WISE photometry.
