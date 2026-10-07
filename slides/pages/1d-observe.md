---
layout: figure-right
part: Part 1 · Spectra
---
# Observing: redshift, dimming, intergalactic absorption

- Observed flux: $f_\lambda(\lambda_{\rm obs}) = \dfrac{L_\lambda(\lambda_{\rm obs}/(1+z))}{4\pi D_L^2(1+z)}\,e^{-\tau_{\rm IGM}(\lambda_{\rm obs}, z)}$. $D_L$ uses the SMDPL cosmology, the same as the time grid of the histories.
- **Intergalactic absorption:** Madau (1995), with 17 Lyman-series lines, metal blanketing and the Lyman-continuum term. It agrees with the FSPS version to machine precision at $z$ = 2.5, 4 and 6. It affects the $u$ band from $z \approx 1.6$ and reaches the SPHEREx band at $z \gtrsim 5$.
- **Storage.** The file holds $f_\nu$ in Jy at $\lambda_{\rm obs} = \lambda_{\rm rest}(1+z)$ on the fixed 11,149-point rest grid, with the redshift of each row. Every galaxy thus maps to the same rest wavelengths.

|||

![IGM](figs/sed_igm.png)

![observed](figs/sed_chain_observed.png)

Caption: Top: transmission of the intergalactic medium. Bottom: the galaxy of the previous slide at $z$ = 1.03 with its synthetic LSST, SPHEREx and WISE photometry.
