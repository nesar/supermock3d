---
layout: figure-right
part: Part 1 · Spectra
---
# Stellar populations and nebular emission

- **FSPS** (Conroy, Gunn & White 2009) with the **C3K** spectral library and Padova isochrones, Chabrier IMF. C3K resolves the 1.6 µm H⁻ bump and the 2.3 / 4.6 µm CO bands that BaSeL smooths over (10 Gyr SSP: W1−W2 moves from +0.02 to −0.08 Vega).
- **Tabular SFH**: FSPS integrates the 117-point SFH up to $t(z_{\rm obs})$ and returns an absolutely normalised spectrum (no rescaling; constant 1 M$_\odot$/yr for 13 Gyr gives 7.8 × 10⁹ M$_\odot$ surviving).
- **Nebular continuum and lines** from FSPS's CLOUDY grid; $\log U$ = −2, gas metallicity = stellar metallicity. Lines at native resolution, no velocity broadening.
- **Metallicity**: one deterministic relation of formed mass and redshift, no scatter.
- Output: rest-frame $L_\lambda$ on 11,149 points from 0.01 µm to 1 cm.

|||

![metallicity](figs/sed_metallicity.png)

Caption: The $\log Z(M_*, z)$ relation used for every galaxy (stellar and gas phase), clipped to [−2, 0.3] inside the C3K metallicity grid.
