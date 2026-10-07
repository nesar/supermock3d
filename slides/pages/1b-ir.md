---
layout: figure-right
part: Part 1 · Spectra
---
# Dust re-emission by energy balance

- The energy the dust absorbs, $L_{\rm abs} = \int (L_\lambda - L^{\rm att}_\lambda)\,d\lambda$, comes back as infrared emission $L_{\rm abs}\,T(\lambda)$. Thus the amount of infrared light has no free parameter.
- $T$ is the Draine & Li (2007) emission spectrum **per unit absorbed energy**. We extracted it once from FSPS and store it on a 6 × 11 grid in metallicity and specific star-formation rate. $\int T\,d\lambda$ = 1.0000 at every grid point.
- The shape follows the galaxy: more star formation gives a stronger radiation field, warmer dust and more light at 12 and 22 µm (WISE W3 and W4). The ties are fixed functions of $\log Z$ and $\log{\rm sSFR}$, not fitted.
- Checks: against the dust emission computed inside FSPS with the same absorption, the worst error is **0.013 mag** in W1–W4 over 8 test galaxies. WISE W2−W3 moves from about 1 (no infrared) to a median of 2.9.
- No active galactic nucleus is painted.

|||

![DL07 templates](figs/sed_dl07_templates.png)

Caption: Templates at solar metallicity. Higher sSFR means warmer dust: the peak moves from about 150 µm to about 35 µm.
